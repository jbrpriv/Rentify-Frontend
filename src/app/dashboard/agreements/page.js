'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { FileText, Download, Calendar, User, Loader2, CheckCircle, Clock, PenLine, GitBranch, Mail, Eye, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import SignatureModal from '@/components/SignatureModal';


export default function AgreementsPage() {
  const router = useRouter();
  const { user: parsed } = useUser();
  const { toast } = useToast();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [signingId, setSigningId] = useState(null); // kept for compat but unused below
  const [renewModal, setRenewModal] = useState(null); // holds agreement object
  const [renewForm, setRenewForm] = useState({ newEndDate: '', newRentAmount: '', notes: '' });
  const [renewLoading, setRenewLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Signature modal state
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [pendingSignId, setPendingSignId] = useState(null);
  const [pendingSignName, setPendingSignName] = useState('');
  const [signLoading, setSignLoading] = useState(false);


  useEffect(() => {
    // Tenants have their own dedicated lease page
    if (parsed.role === 'tenant') { router.push('/dashboard/my-lease'); return; }
    setCurrentUser(parsed);
    fetchAgreements();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAgreements = async () => {
    try {
      const { data } = await api.get('/agreements');
      setAgreements(data);
    } catch (error) {
      console.error('Failed to fetch agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open the draw-signature modal
  const handleSign = (agreementId, propertyTitle) => {
    setPendingSignId(agreementId);
    setPendingSignName(propertyTitle || 'this agreement');
    setSignModalOpen(true);
  };

  const handleSignConfirm = async (drawData) => {
    setSignLoading(true);
    try {
      const { data } = await api.put(`/agreements/${pendingSignId}/sign`, { drawData });
      toast(`Signed successfully! Agreement status: ${data.status}`, 'info');
      setSignModalOpen(false);
      fetchAgreements();
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to sign agreement', 'error');
    } finally {
      setSignLoading(false);
    }
  };


  const handleDownload = async (id, title) => {
    try {
      const response = await api.get(`/agreements/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Agreement-${title?.replace(/\s+/g, '-') || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast('Error downloading PDF', 'error');
    }
  };

  // Check if current user has already signed
  const hasUserSigned = (agreement) => {
    if (!currentUser) return false;
    const isLandlord = agreement.landlord?._id === currentUser._id;
    const isTenant = agreement.tenant?._id === currentUser._id;
    if (isLandlord) return agreement.signatures?.landlord?.signed;
    if (isTenant) return agreement.signatures?.tenant?.signed;
    return false;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
    </div>
  );

  const handleProposeRenewal = async (e) => {
    e.preventDefault();
    setRenewLoading(true);
    try {
      await api.put(`/agreements/${renewModal._id}/renew`, renewForm);
      toast('Renewal proposal sent to tenant!', 'success');
      setRenewModal(null);
      fetchAgreements();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send proposal', 'error');
    } finally { setRenewLoading(false); }
  };

  const handleRenewalResponse = async (id, accept) => {
    if (!confirm(accept ? 'Accept this renewal proposal?' : 'Decline this renewal proposal?')) return;
    try {
      const { data } = await api.put(`/agreements/${id}/renew/respond`, { accept });
      toast(data.message, 'info');
      fetchAgreements();
    } catch (err) { toast(err.response?.data?.message || 'Error', 'error'); }
  };

  const HISTORY_STATUSES = ['expired', 'terminated'];
  const activeAgreements = agreements.filter(a =>
    !HISTORY_STATUSES.includes(a.status) &&
    !(a.renewalProposal?.status === 'rejected')
  );
  const historyAgreements = agreements.filter(a =>
    HISTORY_STATUSES.includes(a.status) ||
    a.renewalProposal?.status === 'rejected'
  );
  const displayed = activeTab === 'active' ? activeAgreements : historyAgreements;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {signModalOpen && (
        <SignatureModal
          open={signModalOpen}
          onClose={() => { setSignModalOpen(false); setPendingSignId(null); }}
          onConfirm={handleSignConfirm}
          signerName={pendingSignName}
          loading={signLoading}
        />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rental Agreements</h1>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-semibold transition ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Active ({activeAgreements.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-semibold transition border-l border-gray-200 ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            History ({historyAgreements.length})
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <motion.div
          className="bg-white p-12 text-center rounded-lg shadow border-2 border-dashed border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.21, 0.6, 0.35, 1] }}
        >
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No agreements found.</p>
        </motion.div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {displayed.map((ag) => (
              <motion.li
                key={ag._id}
                className="hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.21, 0.6, 0.35, 1] }}
              >
                <div className="px-6 py-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                    {/* Left: Info */}
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {ag.property?.title || 'Property Lease'}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Tenant: {ag.tenant?.name}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Ends: {new Date(ag.term?.endDate).toLocaleDateString()}
                          </span>
                          {ag.rentEscalation?.enabled && (
                            <span className="flex items-center text-purple-600 font-medium">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              +{ag.rentEscalation.percentage}% / yr
                            </span>
                          )}
                        </div>

                        {/* Signature Status */}
                        <div className="flex gap-3 mt-2">
                          <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${ag.signatures?.landlord?.signed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {ag.signatures?.landlord?.signed
                              ? <><CheckCircle className="h-3 w-3 mr-1" /> Landlord Signed</>
                              : <><Clock className="h-3 w-3 mr-1" /> Landlord Pending</>
                            }
                          </span>
                          <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${ag.signatures?.tenant?.signed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {ag.signatures?.tenant?.signed
                              ? <><CheckCircle className="h-3 w-3 mr-1" /> Tenant Signed</>
                              : <><Clock className="h-3 w-3 mr-1" /> Tenant Pending</>
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ag.status)}`}>
                        {ag.status.charAt(0).toUpperCase() + ag.status.slice(1)}
                      </span>

                      {/* Sign button — only show for parties involved in the agreement, not law_reviewer */}
                      {!hasUserSigned(ag) && ag.status !== 'active' && ag.status !== 'expired' &&
                        currentUser?.role !== 'law_reviewer' && (
                          <button
                            onClick={() => handleSign(ag._id, ag.property?.title)}
                            disabled={signLoading && pendingSignId === ag._id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                          >
                            <PenLine className="h-4 w-4 mr-2" />
                            Sign
                          </button>
                        )}

                      {/* Send signing invites — landlord only, on draft/pending */}
                      {currentUser?.role === 'landlord' &&
                        ['draft', 'pending_signature'].includes(ag.status) && (
                          <button
                            onClick={async () => {
                              try {
                                await api.post(`/agreements/${ag._id}/send-invites`);
                                toast('Signing invitations sent to both parties', 'success');
                              } catch (err) {
                                toast(err.response?.data?.message || 'Failed to send invites', 'error');
                              }
                            }}
                            className="inline-flex items-center px-4 py-2 border border-purple-500 text-sm font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50"
                          >
                            <Mail className="h-4 w-4 mr-2" /> Send Invites
                          </button>
                        )}

                      <button
                        onClick={() => handleDownload(ag._id, ag.property?.title)}
                        className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 mr-2" /> PDF
                      </button>

                      {/* View detail */}
                      <button
                        onClick={() => router.push(`/dashboard/agreements/${ag._id}`)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50"
                        title="View agreement detail"
                      >
                        <Eye className="h-4 w-4 mr-2" /> View
                      </button>

                      {/* Version history */}
                      <button
                        onClick={() => router.push(`/dashboard/agreements/${ag._id}/history`)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50"
                        title="View version history"
                      >
                        <GitBranch className="h-4 w-4 mr-2" /> History
                      </button>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}