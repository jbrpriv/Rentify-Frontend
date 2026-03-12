'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import {
    Bell, BellOff, CheckCheck, Loader2,
    CreditCard, FileText, Wrench, Scale,
    MessageSquare, AlertCircle, Clock, RefreshCw, RotateCcw, CheckCircle,
} from 'lucide-react';

// ─── Type → icon / colour mapping ─────────────────────────────────────────
const TYPE_CONFIG = {
    rent_due:                    { label: 'Rent Due',              icon: CreditCard,  color: 'bg-blue-100 text-blue-600' },
    rent_overdue:                { label: 'Rent Overdue',          icon: AlertCircle, color: 'bg-red-100 text-red-600' },
    late_fee_applied:            { label: 'Late Fee Applied',      icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
    payment_received:            { label: 'Payment Received',      icon: CreditCard,  color: 'bg-green-100 text-green-600' },
    agreement_signed:            { label: 'Agreement Signed',      icon: FileText,    color: 'bg-green-100 text-green-600' },
    agreement_sent:              { label: 'Agreement Sent',        icon: FileText,    color: 'bg-blue-100 text-blue-600' },
    agreement_expiring:          { label: 'Agreement Expiring',    icon: Clock,       color: 'bg-amber-100 text-amber-600' },
    agreement_expired:           { label: 'Agreement Expired',     icon: FileText,    color: 'bg-gray-100 text-gray-500' },
    agreement_renewed:           { label: 'Agreement Renewed',     icon: RotateCcw,   color: 'bg-purple-100 text-purple-600' },
    agreement_renewal_pending:   { label: 'Renewal Proposed',      icon: RotateCcw,   color: 'bg-purple-100 text-purple-600' },
    agreement_renewal_responded: { label: 'Renewal Responded',     icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    maintenance_update:          { label: 'Maintenance Update',    icon: Wrench,      color: 'bg-yellow-100 text-yellow-600' },
    dispute_update:              { label: 'Dispute Update',        icon: Scale,       color: 'bg-red-100 text-red-600' },
    document_expiring:           { label: 'Document Expiring',     icon: Clock,       color: 'bg-amber-100 text-amber-600' },
    new_message:                 { label: 'New Message',           icon: MessageSquare, color: 'bg-indigo-100 text-indigo-600' },
    general:                     { label: 'Notification',          icon: Bell,        color: 'bg-gray-100 text-gray-600' },
};

function timeAgo(date) {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── FE-02: Resolve the navigation URL for a notification ──────────────────
function getNotificationHref(notification) {
    const agreementId = notification.agreement?._id || notification.agreement;
    const paymentId   = notification.payment?._id   || notification.payment;

    switch (notification.type) {
        case 'rent_due':
        case 'rent_overdue':
        case 'late_fee_applied':
        case 'payment_received':
            if (agreementId) return `/dashboard/payments?agreementId=${agreementId}`;
            if (paymentId)   return `/dashboard/payments`;
            return null;

        case 'agreement_signed':
        case 'agreement_sent':
        case 'agreement_expiring':
        case 'agreement_expired':
        case 'agreement_renewed':
        case 'agreement_renewal_pending':
        case 'agreement_renewal_responded':
            if (agreementId) return `/dashboard/agreements/${agreementId}`;
            return null;

        case 'maintenance_update':
            return `/dashboard/maintenance`;

        case 'dispute_update':
            return `/dashboard/disputes`;

        case 'new_message':
            return `/dashboard/messages`;

        default:
            return null;
    }
}

function NotificationCard({ notification, onMarkRead }) {
    const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.general;
    const Icon = cfg.icon;
    const unread = !notification.isRead;
    const href = getNotificationHref(notification);

    const handleClick = () => {
        if (unread) onMarkRead(notification._id);
    };

    const cardContent = (
        <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all group
            ${unread
                ? 'bg-white border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200'
                : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200'
            } ${href ? 'cursor-pointer' : unread ? 'cursor-pointer' : 'cursor-default'}`}
        >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {notification.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notification.createdAt)}</span>
                        {unread && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.body}</p>

                {/* Channel badges */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                    {notification.channels?.email?.sent && <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Email</span>}
                    {notification.channels?.sms?.sent && <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">SMS</span>}
                    {notification.channels?.push?.sent && <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Push</span>}
                    {href && <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full group-hover:bg-blue-100 transition">View →</span>}
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} onClick={handleClick} className="block no-underline">
                {cardContent}
            </Link>
        );
    }

    return (
        <div onClick={handleClick}>
            {cardContent}
        </div>
    );
}

export default function NotificationsPage() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'

    const fetchNotifications = useCallback(async (p = 1, f = activeFilter) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, limit: 20 });
            if (f === 'unread') params.set('unread', 'true');
            const { data } = await api.get(`/notifications?${params}`);
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
            setPagination(data.pagination || {});
            setPage(p);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [activeFilter]);

    useEffect(() => { fetchNotifications(1, activeFilter); }, [activeFilter]);

    const handleMarkRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true, readAt: new Date() } : n)
            );
            setUnreadCount(c => Math.max(0, c - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllRead = async () => {
        setMarking(true);
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        } finally {
            setMarking(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-xs text-blue-600 font-medium">{unreadCount} unread</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchNotifications(1, activeFilter)}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            disabled={marking}
                            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-xl hover:bg-blue-50 transition disabled:opacity-50"
                        >
                            {marking
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <CheckCheck className="w-4 h-4" />
                            }
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-5">
                {['all', 'unread'].map(f => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition
              ${activeFilter === f
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'all' ? 'All' : `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20">
                    <BellOff className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">
                        {activeFilter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(n => (
                        <NotificationCard
                            key={n._id}
                            notification={n}
                            onMarkRead={handleMarkRead}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                    <button
                        onClick={() => fetchNotifications(page - 1)}
                        disabled={page <= 1 || loading}
                        className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-500">
                        {page} / {pagination.pages}
                    </span>
                    <button
                        onClick={() => fetchNotifications(page + 1)}
                        disabled={page >= pagination.pages || loading}
                        className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}