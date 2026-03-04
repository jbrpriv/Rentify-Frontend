'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import {
  MessageSquare, Send, Loader2, X, Users, ChevronRight,
  Search, CheckCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_COLORS = {
  landlord:        { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  tenant:          { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  property_manager:{ bg: 'bg-amber-100',  text: 'text-amber-700'  },
  admin:           { bg: 'bg-rose-100',   text: 'text-rose-700'   },
  law_reviewer:    { bg: 'bg-violet-100', text: 'text-violet-700' },
};

function Avatar({ name, size = 'md', role }) {
  const c = ROLE_COLORS[role] || { bg: 'bg-slate-100', text: 'text-slate-600' };
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} ${c.bg} ${c.text} rounded-2xl flex items-center justify-center font-black flex-shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ── Chat Modal ────────────────────────────────────────────────────────────────
function ChatModal({ active, user, onClose, onNewMessage }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [show, setShow] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    setTimeout(() => setShow(true), 10);
    loadMessages();
    setTimeout(() => inputRef.current?.focus(), 350);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Allow parent to push incoming socket messages into this modal
  useEffect(() => {
    if (!onNewMessage) return;
    onNewMessage.handler = (msg) => {
      const isRelevant =
        String(msg.sender?._id || msg.sender) === String(active?.otherUserId) ||
        String(msg.receiver?._id || msg.receiver) === String(active?.otherUserId);
      if (isRelevant) {
        setMessages(m => [...m, msg]);
        // N14 fix: pass ?markRead=true so only intentional opens mark messages as read,
        // not background polling calls that would silently clear unread badges.
        const pid = active?.propertyId || 'null';
        api.get(`/messages/${pid}/${active?.otherUserId}?markRead=true`)
          .then(() => window.dispatchEvent(new CustomEvent('dashboard:refresh_counts')))
          .catch(() => {});
      }
    };
  }, [active, onNewMessage]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const pid = active?.propertyId || 'null';
      const { data } = await api.get(`/messages/${pid}/${active?.otherUserId}?markRead=true`);
      setMessages(Array.isArray(data) ? data : []);
      // markRead=true tells the backend to mark messages as read — refresh badge count
      window.dispatchEvent(new CustomEvent('dashboard:refresh_counts'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const close = () => { setShow(false); setTimeout(onClose, 300); };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    const draft = content.trim();
    const opt = { _id: `opt-${Date.now()}`, content: draft, sender: { _id: user?._id }, createdAt: new Date().toISOString(), _opt: true };
    setMessages(m => [...m, opt]);
    setContent('');
    try {
      const payload = { receiverId: active.otherUserId, content: draft };
      if (active.propertyId) payload.propertyId = active.propertyId;
      const { data } = await api.post('/messages', payload);
      setMessages(m => m.map(msg => msg._id === opt._id ? data : msg));
    } catch (err) {
      setMessages(m => m.filter(msg => msg._id !== opt._id));
      setContent(draft);
      toast(err.response?.data?.message || 'Failed to send', 'error');
    } finally { setSending(false); }
  };

  const me = user?._id;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />
      <motion.div
        className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
        style={{ height: '82vh', maxHeight: '660px' }}
        initial={{ y: 48, scale: 0.95 }}
        animate={{ y: show ? 0 : 48, scale: show ? 1 : 0.95 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <Avatar name={active?.otherName} size="md" role={active?.otherRole} />
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 leading-tight">{active?.otherName}</p>
            <p className="text-xs text-gray-400 truncate">{active?.propertyTitle || 'Direct Message'}</p>
          </div>
          <button onClick={close} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin w-6 h-6 text-blue-400" /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                <MessageSquare className="w-7 h-7 text-blue-200" />
              </div>
              <p className="text-sm font-bold text-gray-300">Say hello 👋</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = String(msg.sender?._id || msg.sender) === String(me);
              const showTime = i === 0 || (new Date(msg.createdAt) - new Date(messages[i - 1]?.createdAt)) > 300000;
              return (
                <div key={msg._id}>
                  {showTime && (
                    <p className="text-center text-[10px] text-gray-300 font-semibold my-4">
                      {new Date(msg.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                    <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    } ${msg._opt ? 'opacity-60' : ''}`}>
                      {msg.content}
                      <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : ''}`}>
                        <span className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && !msg._opt && <CheckCheck className="w-3 h-3 text-blue-300" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-50 flex gap-2 flex-shrink-0">
          <input
            ref={inputRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`Message ${active?.otherName?.split(' ')[0] || ''}...`}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          />
          <button type="submit" disabled={sending || !content.trim()}
            className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-all active:scale-95">
            {sending ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Contacts Panel ────────────────────────────────────────────────────────────
function ContactsPanel({ contacts, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => { setTimeout(() => setShow(true), 10); }, []);

  const close = () => { setShow(false); setTimeout(onClose, 300); };
  const select = (c) => { setShow(false); setTimeout(() => onSelect(c), 150); };

  const filtered = contacts.filter(c =>
    !search ||
    c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.propertyTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />
      <motion.div
        className="relative bg-white w-full sm:max-w-sm sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
        style={{ maxHeight: '72vh' }}
        initial={{ y: 48, scale: 0.95 }}
        animate={{ y: show ? 0 : 48, scale: show ? 1 : 0.95 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-black text-gray-900">Contacts</h2>
            <p className="text-xs text-gray-400">{contacts.length} available</p>
          </div>
          <button onClick={close} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 pb-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-300">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No contacts found</p>
            </div>
          ) : filtered.map((c, i) => {
            const rc = ROLE_COLORS[c.user?.role] || { bg: 'bg-gray-100', text: 'text-gray-600' };
            // Context tag color — Payment Pending gets amber
            const ctxColor = c.context === 'Payment Pending'
              ? 'bg-amber-100 text-amber-700'
              : `${rc.bg} ${rc.text}`;
            return (
              <button key={i} onClick={() => select(c)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                <Avatar name={c.user?.name} size="md" role={c.user?.role} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{c.user?.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{c.propertyTitle}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${ctxColor}`}>
                  {c.context}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [conversations, setConvs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const newMsgHandlerRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    fetchData();

    // ── Listen to socket events forwarded from the layout ─────────
    const handleNewMsg = (e) => {
      const msg = e.detail;
      const sId = String(msg.sender?._id || msg.sender);
      const cur = activeRef.current;
      const isOpenChat = cur && sId === String(cur.otherUserId);

      if (isOpenChat) {
        // Chat is open — the ChatModal's onNewMessage.handler already appended the message
        // and will call mark-as-read + dispatch refresh_counts. Just keep unread at 0 here.
        setConvs(prev => prev.map(c => {
          const other = String(c.sender?._id || c.sender) === String(user._id) ? c.receiver : c.sender;
          if (String(other?._id || other) === sId) return { ...c, unreadCount: 0 };
          return c;
        }));
      } else {
        // Chat is NOT open — safe to re-fetch inbox (message is not being read, no race)
        fetchData(false);
      }

      // Always try to push into the open modal
      if (newMsgHandlerRef.current?.handler) newMsgHandlerRef.current.handler(msg);
    };
    window.addEventListener('dashboard:new_message', handleNewMsg);
    return () => window.removeEventListener('dashboard:new_message', handleNewMsg);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [inboxRes, contactsRes] = await Promise.all([
        api.get('/messages'),
        api.get('/users/contacts'),
      ]);
      setConvs(Array.isArray(inboxRes.data) ? inboxRes.data : []);
      setContacts(Array.isArray(contactsRes.data) ? contactsRes.data : []);
    } catch (err) { console.error(err); }
    finally { if (showLoader) setLoading(false); }
  };

  // When a conversation is opened, immediately mark it as read in local state
  const openConversation = (conv) => {
    const me = user?._id;
    const sId = conv.sender?._id || conv.sender;
    const other = String(sId) === String(me) ? conv.receiver : conv.sender;
    const otherId = other?._id || other;

    // Tell the layout which chat is open so it can suppress toasts from this user
    window.__activeChatUserId = String(otherId);

    // Optimistically clear unread count for this conversation
    setConvs(prev => prev.map(c => {
      const cSId = c.sender?._id || c.sender;
      const cOther = String(cSId) === String(me) ? c.receiver : c.sender;
      if (String(cOther?._id || cOther) === String(otherId) &&
          String(c.property?._id || c.property || 'null') === String(conv.property?._id || conv.property || 'null')) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    }));

    setActive({
      propertyId: conv.property?._id || conv.property || null,
      otherUserId: otherId,
      otherName: other?.name || 'Unknown',
      otherRole: other?.role,
      propertyTitle: conv.property?.title || 'Direct Message',
    });
  };

  const openContact = (contact) => {
    // Tell the layout which chat is open so it can suppress toasts from this user
    window.__activeChatUserId = String(contact.user?._id);
    setShowContacts(false);
    setActive({
      propertyId: contact.propertyId || null,
      otherUserId: contact.user?._id,
      otherName: contact.user?.name || 'Unknown',
      otherRole: contact.user?.role,
      propertyTitle: contact.propertyTitle || 'Direct Message',
    });
  };

  const me = user?._id;
  const filtered = conversations.filter(c => {
    if (!search) return true;
    const sId = c.sender?._id || c.sender;
    const other = String(sId) === String(me) ? c.receiver : c.sender;
    return other?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.property?.title?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      {active && (
        <ChatModal
          active={active}
          user={user}
          onClose={() => { window.__activeChatUserId = null; setActive(null); fetchData(false); }}
          onNewMessage={newMsgHandlerRef.current || (newMsgHandlerRef.current = {})}
        />
      )}

      {showContacts && (
        <ContactsPanel contacts={contacts} onSelect={openContact} onClose={() => setShowContacts(false)} />
      )}

      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.21, 0.6, 0.35, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Messages</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <motion.button
            onClick={() => setShowContacts(true)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 transition-all"
          >
            <Users className="w-4 h-4" />
            Contacts
            {contacts.length > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {contacts.length > 9 ? '9+' : contacts.length}
              </span>
            )}
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Conversations */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin w-7 h-7 text-blue-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-200" />
              </div>
              <p className="font-bold text-gray-400">
                {search ? 'No conversations match' : 'No conversations yet'}
              </p>
              {!search && (
                <p className="text-sm text-gray-300 mt-1">Press <strong>Contacts</strong> to start one</p>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {filtered.map((conv, i) => {
                const sId = conv.sender?._id || conv.sender;
                const other = String(sId) === String(me) ? conv.receiver : conv.sender;
                const isMine = String(sId) === String(me);
                const unread = conv.unreadCount > 0;
                return (
                  <li key={i}>
                    <motion.button
                      onClick={() => openConversation(conv)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                      whileHover={{ backgroundColor: '#f9fafb' }}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar name={other?.name} size="lg" role={other?.role} />
                        {unread && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className={`text-sm truncate ${unread ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {other?.name || 'Unknown'}
                          </p>
                          <span className="text-[11px] text-gray-400 flex-shrink-0">{timeAgo(conv.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isMine && <CheckCheck className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                          <p className={`text-xs truncate ${unread ? 'font-semibold text-gray-700' : 'text-gray-400'}`}>
                            {isMine ? 'You: ' : ''}{conv.content}
                          </p>
                        </div>
                        {conv.property?.title && (
                          <p className="text-[10px] text-gray-300 truncate mt-0.5">{conv.property.title}</p>
                        )}
                      </div>
                      {unread && (
                        <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] font-black flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </>
  );
}