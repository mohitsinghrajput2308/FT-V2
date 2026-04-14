import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Clock, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';

/**
 * PrioritySupport - Ticket-based support system for Pro/Business users
 * Follows the same gating pattern as Calculators.jsx
 */
const PrioritySupport = () => {
  const { currentUser } = useAuth();
  const { isPro, isBusiness } = useSubscription();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general',
  });

  // ── HOOKS (MUST COME BEFORE CONDITIONAL RETURNS) ────────────────────────────
  // Load support tickets on mount
  useEffect(() => {
    const loadTickets = async () => {
      if (!currentUser || (!isPro && !isBusiness)) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading tickets:', error);
          setTickets([]);
          return;
        }

        if (data) {
          setTickets(data);
        }
      } catch (err) {
        console.error('Error loading tickets:', err);
        notifyError('Failed to load support tickets');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadTickets();
    }
  }, [currentUser, isPro, isBusiness, notifyError]);

  // ── ACCESS CONTROL (NOW AFTER ALL HOOKS) ────────────────────────────────────
  if (!isPro && !isBusiness) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Priority Support</h1>
            <p className="text-gray-500 dark:text-gray-400">Exclusive support for paid subscribers</p>
          </div>
        </div>

        {/* Paywall Card - Same style as Calculators */}
        <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Premium Feature</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Priority Support is available to Pro and Business plan subscribers. Get guaranteed 24-hour response times and priority handling for your support tickets.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 text-left max-w-md">
              <h3 className="text-white font-semibold mb-3">Pro & Business plans include:</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Priority support tickets (24-hour response)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  AI Assistant support channel
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  CSV & PDF data export
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Advanced analytics & reports
                </li>
              </ul>
            </div>
            <Button
              onClick={() => navigate('/dashboard/pricing')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold"
            >
              View Pricing Plans
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── PAID USER CONTENT ───────────────────────────────────────────────────

  // Update ticket status
  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Update tickets list
      const updatedTickets = tickets.map(t => 
        t.id === ticketId ? { ...t, status: newStatus } : t
      );
      setTickets(updatedTickets);
      
      // IMPORTANT: Also update selectedTicket state so dropdown UI changes
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
      
      success(`Ticket marked as ${newStatus}`);
    } catch (err) {
      console.error('Status update error:', err);
      notifyError('Failed to update ticket status: ' + err.message);
    }
  };

  // Delete ticket
  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        const { error } = await supabase
          .from('support_tickets')
          .delete()
          .eq('id', ticketId)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        setTickets(tickets.filter(t => t.id !== ticketId));
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null);
        }
        success('Ticket deleted successfully');
      } catch (err) {
        notifyError('Failed to delete ticket');
      }
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Submit new ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      notifyError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: currentUser.id,
          user_name: currentUser.name || currentUser.email?.split('@')[0] || 'User',
          user_email: currentUser.email,
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          category: formData.category,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      setTickets([data, ...tickets]);
      setFormData({ subject: '', description: '', priority: 'medium', category: 'general' });
      success('Support ticket submitted! Our team will respond within 24 hours.');
    } catch (err) {
      notifyError('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── PAID USER INTERFACE ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1117] to-[#050505]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Priority Support</h1>
          <p className="text-gray-400">Submit support tickets and get help from our team within 24 hours</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Submission Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Create a New Ticket</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category */}
                <div className="relative z-20">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500/50 focus:outline-none transition-colors relative z-20"
                    style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <option style={{ color: 'white', backgroundColor: '#1f2937' }}>General Question</option>
                    <option style={{ color: 'white', backgroundColor: '#1f2937' }}>Technical Issue</option>
                    <option style={{ color: 'white', backgroundColor: '#1f2937' }}>Billing Question</option>
                    <option style={{ color: 'white', backgroundColor: '#1f2937' }}>Feature Request</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="relative z-10">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500/50 focus:outline-none transition-colors relative z-10"
                    style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <option style={{ color: 'white', backgroundColor: '#1f2937' }}>Low - General question</option>
                    <option style={{ color: 'white', backgroundColor: '#1f2937' }}>Medium - Needs attention soon</option>
                    <option style={{ color: 'white', backgroundColor: '#1f2937' }}>High - Urgent issue</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    maxLength={100}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.subject.length}/100</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Please provide detailed information about your issue..."
                    rows={5}
                    maxLength={1000}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !formData.subject.trim() || !formData.description.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  💡 <strong>Tip:</strong> Be as detailed as possible. Include screenshots or specific steps to reproduce the issue. Our support team responds within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Tickets */}
          <div>
            <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Your Tickets
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : tickets.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No support tickets yet. Submit one to get started!
                </p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full p-3 rounded-lg text-left transition-all border ${
                        selectedTicket?.id === ticket.id
                          ? 'border-blue-500/50 bg-blue-500/10'
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-white text-sm line-clamp-2">{ticket.subject}</p>
                        {ticket.status === 'open' && (
                          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        )}
                        {ticket.status === 'resolved' && (
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        ticket.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ticket Details */}
            {selectedTicket && (
              <div className="mt-6 bg-[#0A0A0B] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">{selectedTicket.subject}</h3>
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    className="px-3 py-1.5 text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="relative z-20">
                    <p className="text-gray-500 mb-2">Status</p>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusUpdate(selectedTicket.id, e.target.value)}
                      className={`w-full px-3 py-2 rounded border text-white font-semibold transition-colors relative z-20 ${getStatusColor(selectedTicket.status)}`}
                      style={{ color: 'white' }}
                    >
                      <option value="open" style={{ color: 'white', backgroundColor: '#1f2937' }}>🔵 Open</option>
                      <option value="in-progress" style={{ color: 'white', backgroundColor: '#1f2937' }}>🟡 In Progress</option>
                      <option value="resolved" style={{ color: 'white', backgroundColor: '#1f2937' }}>✅ Resolved</option>
                      <option value="closed" style={{ color: 'white', backgroundColor: '#1f2937' }}>⭕ Closed</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="text-white capitalize mt-1">{selectedTicket.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Priority</p>
                      <p className="text-white capitalize mt-1">{selectedTicket.priority}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500">Submitted</p>
                    <p className="text-white">{new Date(selectedTicket.created_at).toLocaleDateString()}</p>
                  </div>

                  {selectedTicket.status === 'resolved' && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-300">
                      ✨ This ticket will be automatically removed on {new Date(new Date(selectedTicket.updated_at).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()} (3 days after resolution)
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-500 mb-2">Description</p>
                    <p className="text-white text-sm bg-white/5 p-3 rounded">{selectedTicket.description}</p>
                  </div>

                  {selectedTicket.response && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-gray-500 mb-2">📧 Response from Support</p>
                      <p className="text-white text-sm bg-blue-500/10 border border-blue-500/20 p-3 rounded">{selectedTicket.response}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrioritySupport;
