'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, Clock, X, Bell, Loader2, AlertCircle, Download } from 'lucide-react';
import api from '@/utils/api';
import { useCurrency } from '@/context/CurrencyContext';

const PaymentCalendar = ({ theme, agreements = [], payments = [] }) => {
    const { formatMoney, currency } = useCurrency();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayInfo, setSelectedDayInfo] = useState(null);
    const [sendingReminder, setSendingReminder] = useState(null);
    const [downloadingReceipt, setDownloadingReceipt] = useState(null);
    const [calToast, setCalToast] = useState('');

    const showCalToast = (msg) => {
        setCalToast(msg);
        setTimeout(() => setCalToast(''), 3500);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // ── Calendar logic ──────────────────────────────────────────────────────
    // For each agreement, rent is due on the SAME day of month as startDate.
    // We place each agreement's rent entry on that day — paid (green) if a
    // payment record exists for this agreement in this month/year, pending
    // (yellow) or overdue (red) if not.
    //
    // We intentionally do NOT use rentSchedule because:
    //   1. JS setMonth() overflows day-29-31 dates into the next month's day 1,
    //      causing all agreements to pile onto day 1 of some months.
    //   2. rentSchedule sync with actual payments is eventually-consistent —
    //      checking the real payments array is the source of truth.
    //   3. Avoids the double-entry where paidMatches + pendingMatches both
    //      fire for the same agreement on the same day.
    const getDayPayments = (day) => {
        const now = new Date();
        const result = [];

        for (const agreement of agreements) {
            if (!agreement.term?.startDate) continue;
            // Include active agreements and also recently activated ones
            if (!['active', 'expired'].includes(agreement.status)) continue;

            const startDate = new Date(agreement.term.startDate);
            const endDate = agreement.term?.endDate ? new Date(agreement.term.endDate) : null;

            // Rent falls on the same calendar day as the agreement start day
            const rentDueDay = startDate.getDate();
            if (rentDueDay !== day) continue;

            // Skip months before the agreement started
            const startYM = startDate.getFullYear() * 12 + startDate.getMonth();
            const viewYM = year * 12 + month;
            if (viewYM < startYM) continue;

            // Skip months after the agreement ended
            if (endDate) {
                const endYM = endDate.getFullYear() * 12 + endDate.getMonth();
                if (viewYM > endYM) continue;
            }

            const agreementId = (agreement._id?._id || agreement._id)?.toString();

            // Find the one payment record that covers this agreement + this month/year.
            // Priority: match by dueDate first (most precise), then fall back to paidAt.
            const matchingPayment = payments.find(p => {
                if (!['paid', 'pending_approval'].includes(p.status)) return false;
                const pAgreementId = (p.agreement?._id || p.agreement)?.toString();
                if (pAgreementId !== agreementId) return false;

                // Match by dueDate (preferred — aligns with the rent period)
                if (p.dueDate) {
                    const d = new Date(p.dueDate);
                    if (d.getMonth() === month && d.getFullYear() === year) return true;
                }
                // Fallback: match by paidAt if dueDate missing
                if (p.paidAt || p.createdAt) {
                    const d = new Date(p.paidAt || p.createdAt);
                    if (d.getMonth() === month && d.getFullYear() === year) return true;
                }
                return false;
            });

            if (matchingPayment) {
                // Show real paid receipt — guaranteed unique per agreement per month
                result.push({ ...matchingPayment, _calAgreementId: agreementId });
            } else {
                // No payment found — show as pending or overdue
                const dueDate = new Date(year, month, day);
                const isOverdue = dueDate < now;
                result.push({
                    _id: `pending_${agreementId}_${year}_${month}`,
                    agreement: agreementId,
                    amount: agreement.financials?.rentAmount || 0,
                    status: isOverdue ? 'overdue' : 'pending',
                    dueDate: dueDate.toISOString(),
                    property: agreement.property,
                    tenant: agreement.tenant,
                    _calAgreementId: agreementId,
                });
            }
        }

        return result;
    };

    const handleRemindTenant = async (paymentId, e) => {
        e.stopPropagation();
        setSendingReminder(paymentId);
        try {
            await api.post(`/notifications/remind/${paymentId}`);
            showCalToast('Reminder sent to tenant successfully!');
        } catch {
            showCalToast('Failed to send reminder.');
        } finally {
            setSendingReminder(null);
        }
    };

    // Download receipt for a paid payment — opens the PDF in a new tab
    const handleDownloadReceipt = async (paymentId, e) => {
        e.stopPropagation();
        if (!paymentId || paymentId.startsWith('temp_')) {
            showCalToast('Receipt not available for this payment.');
            return;
        }
        setDownloadingReceipt(paymentId);
        try {
            const { data } = await api.get(`/payments/${paymentId}/receipt`, { params: { currency } });
            if (data?.url) {
                window.open(data.url, '_blank', 'noopener,noreferrer');
            }
        } catch {
            showCalToast('Receipt is not available yet. Please try again later.');
        } finally {
            setDownloadingReceipt(null);
        }
    };

    return (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(11, 45, 114, 0.12)', padding: '24px', overflow: 'hidden', position: 'relative' }}>
            {/* Receipt Toast */}
            {calToast && (
                <div style={{
                    position: 'absolute', top: 16, right: 16, zIndex: 50,
                    background: '#ECFDF5', border: '1px solid #6EE7B7',
                    borderRadius: 12, padding: '10px 16px',
                    fontSize: '0.8rem', fontWeight: 600, color: '#065F46',
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    animation: 'fadeInDown 0.25s ease',
                }}>
                    <Download size={14} color="#059669" />
                    {calToast}
                </div>
            )}
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarIcon size={20} style={{ color: theme.accent }} />
                    </div>
                    <div>
                        <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#1F2933', lineHeight: 1 }}>Payment Calendar</p>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginTop: 4 }}>Rent due visualization</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={handlePrevMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer' }}>
                        <ChevronLeft size={16} color="#4B5563" />
                    </button>
                    <button onClick={handleNextMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer' }}>
                        <ChevronRight size={16} color="#4B5563" />
                    </button>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.accent }}>
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            <>
                {/* Days of week header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' }}>{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ aspectRatio: '1/1' }} />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayPayments = getDayPayments(day);
                        const hasPaid = dayPayments.some(p => ['paid', 'pending_approval'].includes(p.status));
                        const hasPending = dayPayments.some(p => p.status === 'pending');
                        const hasOverdue = dayPayments.some(p => p.status === 'overdue');
                        const cellBg = dayPayments.length === 0 ? 'white' : hasOverdue ? '#FEF2F2' : hasPending ? '#FFFBEB' : '#F0FDF4';

                        const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                        return (
                            <motion.div
                                key={day}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: i * 0.01 }}
                                style={{
                                    aspectRatio: '1/1',
                                    borderRadius: 12,
                                    border: isToday ? `2px solid ${theme.accent}` : '1px solid #F3F4F6',
                                    background: cellBg,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    cursor: dayPayments.length > 0 ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease',
                                }}
                                onClick={() => dayPayments.length > 0 && setSelectedDayInfo({ day, payments: dayPayments })}
                                title={dayPayments.length > 0 ? `${dayPayments.length} payment(s)` : ''}
                            >
                                <span style={{ fontSize: '0.85rem', fontWeight: isToday ? 800 : 600, color: isToday ? theme.accent : '#4B5563' }}>
                                    {day}
                                </span>

                                {/* Indicators — always open the modal, let the modal handle receipts */}
                                {dayPayments.length > 0 && (
                                    <div style={{ position: 'absolute', bottom: 6, display: 'flex', gap: 2 }}>
                                        {hasPaid && <CheckCircle size={10} color="#10B981" />}
                                        {hasOverdue && <AlertCircle size={10} color="#EF4444" />}
                                        {hasPending && !hasOverdue && <Clock size={10} color="#F59E0B" />}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, marginTop: 20, justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #10B981' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280' }}>Paid</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFFBEB', border: '1px solid #F59E0B' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280' }}>Pending</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #EF4444' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280' }}>Overdue</span>
                    </div>
                </div>
            </>

            {/* Day Details Modal */}
            <AnimatePresence>
                {selectedDayInfo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 max-w-sm w-full"
                        >
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {new Date(year, month, selectedDayInfo.day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </h3>
                                    <p className="text-xs text-gray-500">{selectedDayInfo.payments.length} scheduled payment(s)</p>
                                </div>
                                <button onClick={() => setSelectedDayInfo(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {selectedDayInfo.payments.map((p, idx) => {
                                    const isPaid = p.status === 'paid';
                                    const isPendingApproval = p.status === 'pending_approval';
                                    const isOverdue = p.status === 'overdue' ||
                                        p.status === 'late_fee_applied' ||
                                        (!isPaid && !isPendingApproval && p.dueDate && new Date(p.dueDate) < new Date());
                                    const pid = p._id;
                                    const isReal = isPaid && pid && !String(pid).startsWith('pending_');
                                    const displayAmount = p.amount || p.paidAmount || 0;
                                    const propertyTitle = p.property?.title || p.property || 'Property';

                                    return (
                                        <div key={pid || idx} className={`p-3 rounded-xl border ${isPaid ? 'bg-green-50 border-green-100' : isPendingApproval ? 'bg-amber-50 border-amber-100' : isOverdue ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{formatMoney(displayAmount)}</p>
                                                    {propertyTitle && (
                                                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[150px]">{propertyTitle}</p>
                                                    )}
                                                    <p className="text-xs font-medium mt-0.5 flex items-center gap-1">
                                                        {isPaid ? <CheckCircle className="w-3 h-3 text-green-600" /> : isPendingApproval ? <Clock className="w-3 h-3 text-amber-600" /> : isOverdue ? <AlertCircle className="w-3 h-3 text-red-600" /> : <Clock className="w-3 h-3 text-orange-600" />}
                                                        <span className={isPaid ? 'text-green-700' : isPendingApproval ? 'text-amber-700' : isOverdue ? 'text-red-700' : 'text-orange-700'}>
                                                            {isPaid ? 'Paid' : isPendingApproval ? 'Awaiting Approval' : isOverdue ? 'Overdue' : 'Pending'}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-1.5 items-end">
                                                    {isReal && (
                                                        <button
                                                            onClick={(e) => handleDownloadReceipt(pid, e)}
                                                            disabled={downloadingReceipt === pid}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white text-[10px] font-bold uppercase rounded-lg transition"
                                                        >
                                                            {downloadingReceipt === pid ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                                            Receipt
                                                        </button>
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentCalendar;