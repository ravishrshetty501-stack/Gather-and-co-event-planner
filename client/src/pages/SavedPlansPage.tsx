import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Trash2,
  Eye,
  Calendar,
  Users,
  IndianRupee,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { getSavedPlans, deleteSavedPlan } from '../storage';
import type { SavedPlan, EventDetails, EventPlan, Toast } from '../types';

interface Props {
  onLoadPlan: (details: EventDetails, plan: EventPlan) => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function SavedPlansPage({ onLoadPlan, addToast }: Props) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SavedPlan[]>([]);

  useEffect(() => {
    setPlans(getSavedPlans());
  }, []);

  const handleView = (plan: SavedPlan) => {
    onLoadPlan(plan.eventDetails, plan.plan);
    navigate('/results');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteSavedPlan(id);
      setPlans(getSavedPlans());
      addToast('Plan deleted.', 'success');
    }
  };

  return (
    <div className="page-container">
      <div className="page-title">
        <h1>
          <FolderOpen size={32} style={{ verticalAlign: 'middle', marginRight: 12 }} />
          Saved Plans
        </h1>
        <p>View and manage your previously saved event plans.</p>
      </div>

      {plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>No Saved Plans Yet</h3>
          <p>Create an event plan and save it to see it here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/create')}>
            <PlusCircle size={18} /> Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="saved-plans-grid">
          {plans.map(plan => (
            <div key={plan.id} className="card card-elevated saved-plan-card">
              <span className="plan-type-badge">{plan.eventDetails.eventType}</span>
              <h3>{plan.eventDetails.eventName}</h3>
              <div className="plan-meta">
                {plan.eventDetails.date && (
                  <span>
                    <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {new Date(plan.eventDetails.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                )}
                <span>
                  <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {plan.eventDetails.guestCount} guests
                </span>
                <span>
                  <IndianRupee size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  ₹{plan.eventDetails.budget.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Saved {new Date(plan.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </span>
              </div>
              <div className="plan-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleView(plan)}>
                  <Eye size={15} /> View
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(plan.id, plan.eventDetails.eventName)}
                  style={{ color: 'var(--error)' }}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
