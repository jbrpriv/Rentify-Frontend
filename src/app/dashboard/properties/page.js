'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Building2, MapPin, Plus, FileText, Loader2, UserPlus,
  CheckCircle, Clock, Eye, EyeOff, Trash2, Archive, ArchiveRestore,
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── Confirm Modal (shared) ─────────────────────────────────────────────── */
function ConfirmModal({ title, description, icon: Icon, iconBg, iconColor, confirmLabel, confirmBg, onConfirm, onCancel, loading }) {
  return (
    <>
      <style>{`
        .cm-overlay { position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px; }
        .cm-card { background:white;border-radius:24px;padding:36px 32px;max-width:420px;width:100%;box-shadow:0 24px 80px rgba(15,23,42,.2); }
      `}</style>
      <div className="cm-overlay" onClick={onCancel}>
        <div className="cm-card" onClick={e => e.stopPropagation()}>
          <div style={{ width: 60, height: 60, borderRadius: 18, margin: '0 auto 20px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={26} style={{ color: iconColor }} />
          </div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#0F172A', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</h2>
          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.85rem', marginBottom: 24, lineHeight: 1.6 }}>{description}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onCancel} disabled={loading} style={{ flex: 1, padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, color: '#64748B', background: 'white', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={loading} style={{ flex: 1.5, padding: '12px', border: 'none', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, color: 'white', cursor: loading ? 'not-allowed' : 'pointer', background: confirmBg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PropertiesPage() {
  const router = useRouter();
  const { user: parsed } = useUser();
  const { toast } = useToast();
  const { formatMoney } = useCurrency();
  useEffect(() => {
    if (!parsed) return;
    if (!['landlord', 'admin'].includes(parsed.role)) { router.push('/dashboard'); return; }
  }, [parsed]);

  const [properties, setProperties] = useState([]);
  const [archivedProperties, setArchivedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [inviting, setInviting] = useState('');
  const [publishModal, setPublishModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [archiveModal, setArchiveModal] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const fetchProperties = async () => {
    try {
      const [activeRes, archivedRes] = await Promise.all([
        api.get('/properties'),
        api.get('/properties?archived=true'),
      ]);
      setProperties(activeRes.data);
      setArchivedProperties(archivedRes.data);
    }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProperties(); }, []);

  /* Publish / Unpublish */
  const confirmPublish = async () => {
    if (!publishModal) return;
    setPublishLoading(true);
    try {
      await api.put(`/listings/${publishModal.property._id}/publish`, { listingDescription: publishModal.property.listingDescription || '' });
      fetchProperties();
      setPublishModal(null);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update listing', 'error');
      setPublishModal(null);
    } finally { setPublishLoading(false); }
  };

  /* Archive / Restore */
  const confirmArchive = async () => {
    if (!archiveModal) return;
    setArchiveLoading(true);
    const isArchived = archiveModal.property.isArchived;
    const endpoint = isArchived ? 'restore' : 'archive';
    try {
      await api.put(`/properties/${archiveModal.property._id}/${endpoint}`, { reason: 'Archived by landlord' });
      toast(`Property ${isArchived ? 'restored' : 'archived'} successfully`, 'success');
      fetchProperties();
      setArchiveModal(null);
      if (isArchived && archivedProperties.length <= 1) setShowArchivedModal(false);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update property', 'error');
      setArchiveModal(null);
    } finally { setArchiveLoading(false); }
  };

  /* Direct restore — no confirmation modal, used by the Restore button inside the archived list */
  const restoreDirectly = async (property) => {
    setArchiveLoading(true);
    try {
      await api.put(`/properties/${property._id}/restore`, { reason: 'Restored by landlord' });
      toast('Property restored successfully', 'success');
      fetchProperties();
      if (archivedProperties.length <= 1) setShowArchivedModal(false);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to restore property', 'error');
    } finally { setArchiveLoading(false); }
  };

  /* Delete */
  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/properties/${deleteModal.property._id}`);
      toast('Property deleted successfully', 'success');
      fetchProperties();
      setDeleteModal(null);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete property', 'error');
      setDeleteModal(null);
    } finally { setDeleteLoading(false); }
  };

  const [inviteModal, setInviteModal] = useState(null); // { propertyId }
  const [inviteEmail, setInviteEmail] = useState('');

  const openInviteModal = (propertyId) => { setInviteEmail(''); setInviteModal({ propertyId }); };

  /* Invite PM */
  const handleInviteManager = async () => {
    const propertyId = inviteModal?.propertyId;
    if (!propertyId || !inviteEmail.trim()) return;
    setInviting(propertyId);
    setInviteModal(null);
    try {
      const { data: pmUser } = await api.post('/users/lookup', { email: inviteEmail.trim() });
      if (pmUser.role !== 'property_manager') {
        toast(`${pmUser.name} is a ${pmUser.role}, not a property manager.`, 'error');
        return;
      }
      await api.post(`/properties/${propertyId}/invite-manager`, { managerId: pmUser._id });
      toast('Invitation sent! The property manager will be notified by email.', 'success');
      fetchProperties();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send invitation', 'error');
    } finally { setInviting(''); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1.25, 0.36, 1] }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 16, background: '#1e293b', color: '#e5e7eb' }}
      >
        <Loader2 className="animate-spin" style={{ width: 20, height: 20, color: '#818cf8' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading properties…</span>
      </motion.div>
    </div>
  );

  const statusStyle = {
    vacant: { bg: '#EFF6FF', color: '#2563EB' },
    occupied: { bg: '#F0FDF4', color: '#16A34A' },
    maintenance: { bg: '#FFFBEB', color: '#D97706' },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .prop-card { background:white;border-radius:20px;border:1px solid #E2E8F0;overflow:hidden;box-shadow:0 1px 6px rgba(15,23,42,.06);transition:box-shadow .2s,transform .2s; }
        .prop-card:hover { box-shadow:0 8px 28px rgba(15,23,42,.10);transform:translateY(-2px); }
        .prop-img { width:100%;height:145px;object-fit:cover; }
        .prop-img-ph { width:100%;height:145px;background:linear-gradient(135deg,#EDE9FE,#DDD6FE);display:flex;align-items:center;justify-content:center; }
        .act-btn { display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:7px 13px;border-radius:9px;font-size:.78rem;font-weight:700;cursor:pointer;border:none;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif; }
        .cm-overlay { position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px; }
        .cm-card { background:white;border-radius:24px;padding:36px 32px;max-width:420px;width:100%;box-shadow:0 24px 80px rgba(15,23,42,.2); }
      `}</style>

      {/* Modals */}
      {publishModal && (
        <ConfirmModal
          title={publishModal.property.isListed ? 'Unpublish Listing?' : 'Publish Listing?'}
          description={publishModal.property.isListed
            ? `"${publishModal.property.title}" will be hidden from tenants. Existing offers remain.`
            : `"${publishModal.property.title}" will be visible to all tenants on the marketplace.`}
          icon={publishModal.property.isListed ? EyeOff : Eye}
          iconBg={publishModal.property.isListed ? 'linear-gradient(135deg,#FEF2F2,#FECACA)' : 'linear-gradient(135deg,#DCFCE7,#BBF7D0)'}
          iconColor={publishModal.property.isListed ? '#DC2626' : '#16A34A'}
          confirmLabel={publishModal.property.isListed ? 'Yes, Unpublish' : 'Yes, Publish'}
          confirmBg={publishModal.property.isListed ? 'linear-gradient(135deg,#DC2626,#EF4444)' : 'linear-gradient(135deg,#16A34A,#22C55E)'}
          onConfirm={confirmPublish}
          onCancel={() => setPublishModal(null)}
          loading={publishLoading}
        />
      )}
      {deleteModal && (
        <ConfirmModal
          title="Delete Property?"
          description={`"${deleteModal.property.title}" will be permanently deleted. This cannot be undone. All pending offers for this property will also be removed.`}
          icon={Trash2}
          iconBg="linear-gradient(135deg,#FEF2F2,#FECACA)"
          iconColor="#DC2626"
          confirmLabel="Yes, Delete"
          confirmBg="linear-gradient(135deg,#DC2626,#EF4444)"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(null)}
          loading={deleteLoading}
        />
      )}

      {inviteModal && (
        <div className="cm-overlay" onClick={() => setInviteModal(null)}>
          <div className="cm-card" onClick={e => e.stopPropagation()}>
            <div style={{ width: 60, height: 60, borderRadius: 18, margin: '0 auto 20px', background: 'linear-gradient(135deg,#DBEAFE,#BAE6FD)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={26} style={{ color: '#0B2D72' }} />
            </div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#0F172A', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em' }}>Invite Property Manager</h2>
            <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.6 }}>Enter the email address of the property manager you'd like to invite.</p>
            <input
              type="email"
              placeholder="manager@example.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInviteManager()}
              autoFocus
              style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #BFDBFE', fontSize: '0.875rem', marginBottom: 18, outline: 'none', boxSizing: 'border-box', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0F172A' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setInviteModal(null)} style={{ flex: 1, padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, color: '#64748B', background: 'white', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Cancel
              </button>
              <button type="button" onClick={handleInviteManager} disabled={!inviteEmail.trim()} style={{ flex: 1.5, padding: '12px', border: 'none', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, color: 'white', cursor: inviteEmail.trim() ? 'pointer' : 'not-allowed', background: 'linear-gradient(135deg,#0B2D72,#0992C2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: inviteEmail.trim() ? 1 : 0.6, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                <UserPlus size={15} /> Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {archiveModal && (<ConfirmModal
        title={archiveModal.property.isArchived ? 'Restore Property?' : 'Archive Property?'}
        description={archiveModal.property.isArchived
          ? `"${archiveModal.property.title}" will be restored and available for listing again.`
          : `"${archiveModal.property.title}" will be archived and hidden from listings. All history is preserved and it can be restored at any time.`
        }
        icon={archiveModal.property.isArchived ? ArchiveRestore : Archive}
        iconBg={archiveModal.property.isArchived ? 'linear-gradient(135deg,#F0FDF4,#BBF7D0)' : 'linear-gradient(135deg,#FFFBEB,#FDE68A)'}
        iconColor={archiveModal.property.isArchived ? '#16A34A' : '#D97706'}
        confirmLabel={archiveModal.property.isArchived ? 'Yes, Restore' : 'Yes, Archive'}
        confirmBg={archiveModal.property.isArchived ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'linear-gradient(135deg,#D97706,#F59E0B)'}
        onConfirm={confirmArchive}
        onCancel={() => setArchiveModal(null)}
        loading={archiveLoading}
      />
      )}

      {/* ── Archived Properties Modal ──────────────────────────────────────── */}
      {showArchivedModal && (
        <div className="cm-overlay" onClick={() => setShowArchivedModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 24, padding: '32px 28px', maxWidth: 680, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(15,23,42,.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#FFFBEB,#FDE68A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Archive size={20} style={{ color: '#D97706' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', letterSpacing: '-0.02em' }}>Archived Properties</h2>
                  <p style={{ color: '#94A3B8', fontSize: '0.78rem' }}>{archivedProperties.length} archived propert{archivedProperties.length === 1 ? 'y' : 'ies'}</p>
                </div>
              </div>
              <button onClick={() => setShowArchivedModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 6, borderRadius: 8 }}>
                ✕
              </button>
            </div>

            {archivedProperties.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94A3B8', padding: '32px 0', fontSize: '0.9rem' }}>No archived properties.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {archivedProperties.map(property => {
                  const heroImg = property.images?.[0];
                  return (
                    <div key={property._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                      {heroImg
                        ? <img src={heroImg} alt={property.title} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 56, height: 56, borderRadius: 10, background: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Building2 size={22} style={{ color: '#A78BFA' }} />
                        </div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.title}</p>
                        <p style={{ color: '#94A3B8', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} /> {property.address?.city}, {property.address?.state}
                        </p>
                        {property.archivedAt && (
                          <p style={{ color: '#CBD5E1', fontSize: '0.72rem', marginTop: 2 }}>
                            Archived {new Date(property.archivedAt).toLocaleDateString()}
                            {property.archivedReason ? ` · ${property.archivedReason}` : ''}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => restoreDirectly(property)}
                        disabled={archiveLoading}
                        className="act-btn"
                        style={{ background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #BBF7D0', flexShrink: 0 }}
                      >
                        <ArchiveRestore size={13} /> Restore
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.21, 0.6, 0.35, 1] }}
      >
        {/* Header */}
        <motion.div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.21, 0.6, 0.35, 1] }}
        >
          <div>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>My Properties</h1>
            <p style={{ color: '#94A3B8', fontSize: '0.83rem', marginTop: 4 }}>{properties.length} propert{properties.length === 1 ? 'y' : 'ies'} in your portfolio</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {archivedProperties.length > 0 && (
              <button
                onClick={() => setShowArchivedModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', background: '#FFFBEB', color: '#D97706', border: '1.5px solid #FDE68A', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}
              >
                <Archive size={15} /> Archived ({archivedProperties.length})
              </button>
            )}
            <Link href="/dashboard/properties/new"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', borderRadius: 12, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(79,70,229,.3)', fontFamily: "'Outfit',sans-serif" }}>
              <Plus size={16} /> Add Property
            </Link>
          </div>
        </motion.div>

        {properties.length === 0 ? (
          <motion.div
            style={{ textAlign: 'center', padding: '56px 20px', background: 'white', borderRadius: 20, border: '2px dashed #E2E8F0' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.21, 0.6, 0.35, 1] }}
          >
            <Building2 size={44} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#475569', fontSize: '1.1rem' }}>No properties yet</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: 4, marginBottom: 20 }}>Create your first property to start managing tenants.</p>
            <Link href="/dashboard/properties/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#4F46E5', color: 'white', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
              <Plus size={15} /> Add Your First Property
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {properties.map(property => {
              const sc = statusStyle[property.status] || statusStyle.vacant;
              const heroImg = property.images?.[0];
              const hasManager = !!property.managedBy;
              const hasPendingInvite = property.pmInvitation?.status === 'pending';
              const isOccupied = property.status === 'occupied';

              return (
                <motion.div
                  key={property._id}
                  className="prop-card"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1.25, 0.36, 1] }}
                  whileHover={{ y: -4, scale: 1.01 }}
                >
                  {heroImg
                    ? <img src={heroImg} alt={property.title} className="prop-img" />
                    : <div className="prop-img-ph"><Building2 size={32} style={{ color: '#A78BFA' }} /></div>
                  }
                  <div style={{ padding: '16px 18px' }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                        {property.status}
                      </span>
                      {property.isListed && <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, background: '#EDE9FE', color: '#7C3AED' }}>Listed</span>}
                    </div>

                    <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0F172A', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {property.title}
                    </h3>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94A3B8', fontSize: '0.8rem', marginBottom: 14 }}>
                      <MapPin size={12} /> {property.address?.city}, {property.address?.state}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                      <div>
                        <p style={{ fontSize: '0.67rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Monthly Rent</p>
                        <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>{formatMoney(property.financials?.monthlyRent)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.67rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Type</p>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', textTransform: 'capitalize' }}>{property.type}</p>
                      </div>
                    </div>

                    {/* PM Status */}
                    {hasManager ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '7px 10px', marginBottom: 14 }}>
                        <CheckCircle size={13} style={{ color: '#16A34A' }} /><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>PM: {property.managedBy?.name}</span>
                      </div>
                    ) : hasPendingInvite ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '7px 10px', marginBottom: 14 }}>
                        <Clock size={13} style={{ color: '#D97706' }} /><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>PM invitation pending</span>
                      </div>
                    ) : <div style={{ marginBottom: 14 }} />}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                      <Link href={`/dashboard/properties/edit?id=${property._id}`}
                        className="act-btn" style={{ background: '#F8FAFC', color: '#475569', border: '1.5px solid #E2E8F0', textDecoration: 'none' }}>
                        Edit
                      </Link>

                      {!isOccupied && (
                        <button onClick={() => setPublishModal({ property })} className="act-btn"
                          style={{ flex: 1, background: property.isListed ? '#FFF7F7' : '#F5F3FF', color: property.isListed ? '#DC2626' : '#7C3AED', border: `1.5px solid ${property.isListed ? '#FECACA' : '#DDD6FE'}` }}>
                          {property.isListed ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
                        </button>
                      )}

                      <Link href={`/dashboard/agreements/new?propertyId=${property._id}`}
                        className="act-btn" style={{ background: '#EFF6FF', color: '#2563EB', border: '1.5px solid #BFDBFE', textDecoration: 'none' }}>
                        <FileText size={13} /> Agreement
                      </Link>

                      {!hasManager && !hasPendingInvite && (
                        <button onClick={() => openInviteModal(property._id)} disabled={inviting === property._id} className="act-btn"
                          style={{ background: '#F5F3FF', color: '#7C3AED', border: '1.5px solid #DDD6FE' }}>
                          {inviting === property._id ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />} Invite PM
                        </button>
                      )}

                      {/* Archive — only if not occupied */}
                      {!isOccupied && (
                        <button
                          onClick={() => setArchiveModal({ property })}
                          className="act-btn"
                          style={{ background: '#FFFBEB', color: '#D97706', border: '1.5px solid #FDE68A' }}
                          title="Archive property"
                        >
                          <Archive size={13} /> Archive
                        </button>
                      )}

                      {/* Delete — only if NOT occupied */}
                      {!isOccupied && (
                        <button onClick={() => setDeleteModal({ property })} className="act-btn"
                          style={{ background: '#FFF7F7', color: '#DC2626', border: '1.5px solid #FECACA' }}>
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
}