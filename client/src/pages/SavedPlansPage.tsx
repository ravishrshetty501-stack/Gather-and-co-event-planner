import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Eye,
  Calendar,
  Users,
  IndianRupee,
  PlusCircle,
  Bookmark,
} from 'lucide-react';
import { getSavedPlans, deleteSavedPlan, clearAllSavedPlans } from '../storage';
import ConfirmModal from '../components/ConfirmModal';
import type { SavedPlan, Toast } from '../types';
import { formatINR, formatDateINR } from '../utils/formatters';

interface Props {
  currentPlanId?: string | null;
  onLoadPlan: (savedPlan: SavedPlan) => void;
  onPlanDeleted?: (deletedId: string) => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function SavedPlansPage({
  currentPlanId,
  onLoadPlan,
  onPlanDeleted,
  addToast,
}: Props) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [planToDelete, setPlanToDelete] = useState<SavedPlan | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  useEffect(() => {
    setPlans(getSavedPlans());
  }, []);

  const handleView = (plan: SavedPlan) => {
    onLoadPlan(plan);
    navigate('/results');
  };

  const handleConfirmDelete = () => {
    if (!planToDelete) return;
    const { id, eventDetails } = planToDelete;
    deleteSavedPlan(id);
    setPlans(getSavedPlans());
    onPlanDeleted?.(id);
    addToast(`"${eventDetails.eventName}" deleted successfully.`, 'success');
    setPlanToDelete(null);
  };

  const handleConfirmClearAll = () => {
    clearAllSavedPlans();
    setPlans([]);
    if (currentPlanId) {
      onPlanDeleted?.(currentPlanId);
    }
    addToast('All saved events cleared.', 'success');
    setShowClearAllModal(false);
  };

  return (
    <div className="page-container">
      <div className="saved-plans-header-row">
        <div className="page-title" style={{ marginBottom: 0 }}>
          <h1>My Events</h1>
          <p>View and manage your previously saved event plans.</p>
        </div>

        {plans.length > 0 && (
          <div className="saved-plans-header-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/create')}
            >
              <PlusCircle size={15} /> New Plan
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--error)' }}
              onClick={() => setShowClearAllModal(true)}
              title="Delete all saved events"
            >
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        )}
      </div>

      {plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Bookmark size={24} />
          </div>
          <h3>No saved plans yet</h3>
          <p>Create an event plan and save it to see it here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/create')}>
            <PlusCircle size={16} /> Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="saved-plans-grid" style={{ marginTop: 'var(--space-6)' }}>
          {plans.map(plan => (
            <div key={plan.id} className="card saved-plan-card">
              <span className="plan-type-badge">{plan.eventDetails.eventType}</span>
              <h3>{plan.eventDetails.eventName}</h3>
              <div className="plan-meta">
                {plan.eventDetails.date && (
                  <span>
                    <Calendar size={13} />
                    {formatDateINR(plan.eventDetails.date)}
                  </span>
                )}
                <span>
                  <Users size={13} />
                  {plan.eventDetails.guestCount} guests
                </span>
                <span>
                  <IndianRupee size={13} />
                  {formatINR(plan.eventDetails.budget)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Saved {formatDateINR(plan.createdAt)}
                </span>
              </div>
              <div className="plan-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleView(plan)}
                >
                  <Eye size={14} /> View
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPlanToDelete(plan)}
                  style={{ color: 'var(--error)' }}
                  aria-label={`Delete event ${plan.eventDetails.eventName}`}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Single Event Modal */}
      <ConfirmModal
        isOpen={planToDelete !== null}
        title="Delete Event?"
        message={`Are you sure you want to delete "${planToDelete?.eventDetails.eventName}"? This cannot be undone.`}
        confirmLabel="Delete Event"
        cancelLabel="Keep Event"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPlanToDelete(null)}
      />

      {/* Clear All Modal */}
      <ConfirmModal
        isOpen={showClearAllModal}
        title="Clear All Events?"
        message={`Are you sure you want to delete all ${plans.length} saved events? This action cannot be undone.`}
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleConfirmClearAll}
        onCancel={() => setShowClearAllModal(false)}
      />
    </div>
  );
}
