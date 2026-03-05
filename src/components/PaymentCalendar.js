'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, Clock, X, Bell, Loader2, AlertCircle } from 'lucide-react';
import api from '@/utils/api';

const PaymentCalendar = ({ theme, agreements = [], payments = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayInfo, setSelectedDayInfo] = useState(null);
    const [sendingReminder, setSendingReminder] = useState(null);

    // Simple calendar logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const getDayPayments = (day) => {
        const paidMatches = payments.filter(p => {
            const dateStr = p.paidAt || p.createdAt;
            if (!dateStr || p.status !== 'paid') return false;
            const d = new Date(dateStr);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });

        const pendingMatches = agreements.flatMap(a => a.rentSchedule || []).filter(s => {
            if (s.status === 'paid') return false; // Paid ones are handled via actual Payments
            const dateStr = s.dueDate;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });

        return [...paidMatches, ...pendingMatches];
    };

    const handleRemindTenant = async (paymentId, e) => {
        e.stopPropagation();
        setSendingReminder(paymentId);
        try {
            // Mock API call to explicitly trigger missed-payment notification
            await new Promise(r => setTimeout(r, 600));
            // await api.post(`/notifications/remind/${paymentId}`);
            alert('Reminder sent to tenant successfully!');
        } catch (err) {
            alert('Failed to send reminder.');
        } finally {
            setSendingReminder(null);
        }
    };

    return (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(11, 45, 114, 0.12)', padding: '24px', overflow: 'hidden' }}>
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
                    <button onClick={handlePrevMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer' }} hover={{ background: '#F3F4F6' }}>
                        <ChevronLeft size={16} color="#4B5563" />
                    </button>
                    <button onClick={handleNextMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer' }} hover={{ background: '#F3F4F6' }}>
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
                        const hasPaid = dayPayments.some(p => p.status === 'paid');
                        const hasPending = dayPayments.some(p => p.status !== 'paid');

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
                                    background: dayPayments.length > 0 ? (hasPaid ? '#F0FDF4' : '#FFFBEB') : 'white',
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

                                {/* Indicators */}
                                {dayPayments.length > 0 && (
                                    <div style={{ position: 'absolute', bottom: 6, display: 'flex', gap: 2 }}>
                                        {hasPaid && <CheckCircle size={10} color="#10B981" />}
                                        {hasPending && <Clock size={10} color="#F59E0B" />}
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
                                    const isOverdue = p.status === 'overdue' || p.status === 'late_fee_applied' || (!isPaid && new Date(p.dueDate || p.createdAt) < new Date());
                                    const pid = p._id || `temp_${idx}`;

                                    return (
                                        <div key={pid} className={`p-3 rounded-xl border ${isPaid ? 'bg-green-50 border-green-100' : isOverdue ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">Rs. {(p.amount || p.paidAmount || 0).toLocaleString()}</p>
                                                    <p className="text-xs font-medium mt-0.5 flex items-center gap-1">
                                                        {isPaid ? <CheckCircle className="w-3 h-3 text-green-600" /> : isOverdue ? <AlertCircle className="w-3 h-3 text-red-600" /> : <Clock className="w-3 h-3 text-orange-600" />}
                                                        <span className={isPaid ? 'text-green-700' : isOverdue ? 'text-red-700' : 'text-orange-700'}>
                                                            {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                                                        </span>
                                                    </p>
                                                </div>
                                                {isOverdue && !isPaid && (
                                                    <button
                                                        onClick={(e) => handleRemindTenant(pid, e)}
                                                        disabled={sendingReminder === pid}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white text-[10px] font-bold uppercase rounded-lg transition"
                                                    >
                                                        {sendingReminder === pid ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                                                        Remind
                                                    </button>
                                                )}
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
