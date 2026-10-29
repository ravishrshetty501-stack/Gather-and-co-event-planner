import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  IndianRupee,
  UtensilsCrossed,
  Palette,
  CheckSquare,
  Mail,
  Shield,
  RefreshCw,
  Copy,
  Save,
  Check,
  Printer,
  ArrowLeft,
  PenLine,
  Trash2,
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { markdownToHtml } from '../markdown';
import { regenerateSection } from '../api';
import { savePlan, updateSavedPlan, getSavedPlanById } from '../storage';
import ConfirmModal from '../components/ConfirmModal';
import type { EventDetails, EventPlan, Toast, SavedPlan } from '../types';
import { formatINR, formatDateINR, calculatePerGuest } from '../utils/formatters';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles size={16} />,
  Clock: <Clock size={16} />,
  IndianRupee: <IndianRupee size={16} />,
  UtensilsCrossed: <UtensilsCrossed size={16} />,
  Palette: <Palette size={16} />,
  CheckSquare: <CheckSquare size={16} />,
  Mail: <Mail size={16} />,
  Shield: <Shield size={16} />,
};

interface PlanSectionCardProps {
  sectionKey: string;
  title: string;
  content: string;
  icon: string;
  isRegenerating: boolean;
  canRegenerate: boolean;
  isDemo: boolean;
  onRegenerate: (key: string) => void;
  onCopyInvitation?: () => void;
}

const PlanSectionCard = React.memo(function PlanSectionCard({
  sectionKey,
  title,
  content,
  icon,
  isRegenerating,
  canRegenerate,
  isDemo,
  onRegenerate,
  onCopyInvitation,
}: PlanSectionCardProps) {
  const isInvitation = sectionKey === 'invitation';
  const htmlContent = useMemo(() => markdownToHtml(content), [content]);

  return (
    <div
      className={`card section-card section-type-${sectionKey}`}
      id={`section-${sectionKey}`}
    >
      <div className="section-header">
        <div className="section-title">
          <div className={`section-icon icon-type-${sectionKey}`}>
            {ICON_MAP[icon] || <Sparkles size={16} />}
          </div>
          <div>
            <h2>{title}</h2>
            <span className="section-type-tag">{sectionKey.toUpperCase()}</span>
          </div>
        </div>

        <div className="section-actions">
          {isInvitation && onCopyInvitation && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onCopyInvitation}
              title="Copy invitation text"
            >
              <Copy size={13} /> Copy Invitation
            </button>
          )}
          {!isDemo && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onRegenerate(sectionKey)}
              disabled={!canRegenerate || isRegenerating}
              title="Regenerate this section"
            >
              <RefreshCw size={13} className={isRegenerating ? 'spinning' : ''} />
              {isRegenerating ? 'Refining…' : 'Refine'}
            </button>
          )}
        </div>
      </div>

      <div
        className={`section-content content-styled-${sectionKey}`}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
});

interface Props {
  eventDetails: EventDetails | null;
  plan: EventPlan | null;
  currentPlanId: string | null;
  isDemo: boolean;
  onUpdatePlan: (plan: EventPlan) => void;
  onPlanSaved: (saved: SavedPlan) => void;
  onDeletePlan: () => void;
  onNewPlan: () => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function ResultsPage({
  eventDetails,
  plan,
  currentPlanId,
  isDemo,
  onUpdatePlan,
  onPlanSaved,
  onDeletePlan,
  onNewPlan,
  addToast,
}: Props) {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (currentPlanId && getSavedPlanById(currentPlanId)) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [currentPlanId]);

  const handleRegenerate = useCallback(async (sectionKey: string) => {
    if (!eventDetails || !plan) return;
    const section = plan[sectionKey];
    if (!section) return;

    setRegeneratingKey(sectionKey);
    try {
      const { content } = await regenerateSection(
        sectionKey,
        section.title,
        eventDetails,
        section.content
      );
      const updated = { ...plan, [sectionKey]: { ...section, content } };
      onUpdatePlan(updated);
      addToast(`${section.title} refreshed successfully!`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate section';
      addToast(message, 'error');
    } finally {
      setRegeneratingKey(null);
    }
  }, [eventDetails, plan, onUpdatePlan, addToast]);

  const handleCopyInvitation = useCallback(() => {
    if (!plan?.invitation?.content) return;
    const plainText = plan.invitation.content
      .replace(/#{1,4}\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/---+/g, '─────────────')
      .trim();
    navigator.clipboard.writeText(plainText).then(() => {
      addToast('Invitation text copied to clipboard!', 'success');
    }).catch(() => {
      addToast('Failed to copy. Please select and copy manually.', 'warning');
    });
  }, [plan, addToast]);

  const handleSave = useCallback(() => {
    if (!eventDetails || !plan) return;

    if (currentPlanId && getSavedPlanById(currentPlanId)) {
      const updated = updateSavedPlan(currentPlanId, plan, eventDetails);
      if (updated) {
        onPlanSaved(updated);
        setIsSaved(true);
        addToast('Saved plan updated successfully!', 'success');
      }
    } else {
      const saved = savePlan(eventDetails, plan);
      onPlanSaved(saved);
      setIsSaved(true);
      addToast('Event plan saved to My Events!', 'success');
    }
  }, [eventDetails, plan, currentPlanId, onPlanSaved, addToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setShowDeleteModal(false);
    onDeletePlan();
  }, [onDeletePlan]);

  const perGuest = useMemo(
    () => (eventDetails ? calculatePerGuest(eventDetails.budget, eventDetails.guestCount) : 0),
    [eventDetails?.budget, eventDetails?.guestCount]
  );
  const sectionKeys = useMemo(() => (plan ? Object.keys(plan) : []), [plan]);

  if (!plan || !eventDetails) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">
            <Calendar size={24} />
          </div>
          <h3>No event plan active</h3>
          <p>Create a new celebration plan or select one from your saved events.</p>
          <button className="btn btn-primary" onClick={onNewPlan}>
            Create Event Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container producer-workspace" ref={printRef}>
      {/* ── Producer Workspace Hero Header ── */}
      <div className="results-header-card">
        {isDemo && (
          <div className="demo-banner">
            <Sparkles size={16} />
            <span>
              <strong>Sample Plan Demonstration</strong> — This showcases how a complete plan is generated and formatted.
            </span>
          </div>
        )}

        <div className="workspace-eyebrow-row">
          <span className="workspace-badge">
            <Layers size={13} />
            Producer Workspace
          </span>
          {isSaved && (
            <span className="saved-status-pill">
              <CheckCircle2 size={13} />
              Saved in My Events
            </span>
          )}
        </div>

        <h1 className="results-event-title">{eventDetails.eventName}</h1>

        <div className="results-meta-grid">
          {eventDetails.eventType && (
            <div className="meta-card">
              <span className="meta-label">Occasion</span>
              <span className="meta-value">
                <Sparkles size={14} /> {eventDetails.eventType}
              </span>
            </div>
          )}
          {eventDetails.date && (
            <div className="meta-card">
              <span className="meta-label">Event Date</span>
              <span className="meta-value">
                <Calendar size={14} />
                {formatDateINR(eventDetails.date)}
              </span>
            </div>
          )}
          {eventDetails.city && (
            <div className="meta-card">
              <span className="meta-label">Location</span>
              <span className="meta-value">
                <MapPin size={14} /> {eventDetails.city}
              </span>
            </div>
          )}
          <div className="meta-card">
            <span className="meta-label">Guest Count</span>
            <span className="meta-value">
              <Users size={14} /> {eventDetails.guestCount} guests
            </span>
          </div>
          <div className="meta-card meta-card-budget">
            <span className="meta-label">Target Budget</span>
            <span className="meta-value">
              <IndianRupee size={14} /> {formatINR(eventDetails.budget)}
              <small className="meta-sub">~{formatINR(perGuest)}/guest</small>
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="results-actions-bar">
          <div className="results-actions-primary">
            <button className="btn btn-ghost btn-sm" onClick={onNewPlan} title="Start a brand new plan">
              <ArrowLeft size={14} /> New Plan
            </button>
            <button
              className={`btn btn-sm ${isSaved ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleSave}
              title={isSaved ? 'Update saved event plan' : 'Save event plan to My Events'}
            >
              {isSaved ? <Check size={14} /> : <Save size={14} />}
              {isSaved ? 'Saved to My Events' : 'Save Plan'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint} title="Print this event plan">
              <Printer size={14} /> Print Dossier
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/create')}
              title="Edit event parameters and regenerate"
            >
              <PenLine size={14} /> Edit &amp; Refine
            </button>
          </div>

          {!isDemo && (
            <button
              className="btn btn-danger-ghost btn-sm"
              onClick={() => setShowDeleteModal(true)}
              title="Delete this event"
              aria-label="Delete this event"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* ── Budget Summary Visualizer Strip ── */}
      <div className="budget-visual-strip card">
        <div className="budget-strip-header">
          <div className="budget-strip-title">
            <IndianRupee size={16} />
            <span>Budget Allocation Breakdown</span>
          </div>
          <span className="budget-strip-total">
            Total Cap: <strong>{formatINR(eventDetails.budget)}</strong>
          </span>
        </div>

        <div className="budget-bar-track" aria-label="Visual budget breakdown">
          <div className="budget-bar-segment seg-catering" style={{ width: '42%' }} title="Catering ~42%" />
          <div className="budget-bar-segment seg-venue" style={{ width: '22%' }} title="Venue & Setup ~22%" />
          <div className="budget-bar-segment seg-decor" style={{ width: '16%' }} title="Decor & Florals ~16%" />
          <div className="budget-bar-segment seg-sound" style={{ width: '8%' }} title="Entertainment ~8%" />
          <div className="budget-bar-segment seg-photo" style={{ width: '7%' }} title="Photography ~7%" />
          <div className="budget-bar-segment seg-buffer" style={{ width: '5%' }} title="Contingency Buffer ~5%" />
        </div>

        <div className="budget-legend">
          <span className="legend-item"><span className="legend-dot seg-catering" /> Catering (42%)</span>
          <span className="legend-item"><span className="legend-dot seg-venue" /> Venue (22%)</span>
          <span className="legend-item"><span className="legend-dot seg-decor" /> Decor (16%)</span>
          <span className="legend-item"><span className="legend-dot seg-sound" /> Entertainment (8%)</span>
          <span className="legend-item"><span className="legend-dot seg-photo" /> Photography (7%)</span>
          <span className="legend-item"><span className="legend-dot seg-buffer" /> Buffer (5%)</span>
        </div>
      </div>

      {/* Estimate Disclaimer */}
      <div className="estimate-banner">
        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong>Market Rate Estimates:</strong> Figures and pricing are advisory projections based on prevailing metropolitan rates in India. We recommend securing at least two vendor quotes before final commitments.
        </span>
      </div>

      {/* ── Content Sections with Tailored Layouts ── */}
      <div className="results-sections">
        {sectionKeys.map(key => {
          const section = plan[key];
          if (!section || !section.content) return null;

          return (
            <PlanSectionCard
              key={key}
              sectionKey={key}
              title={section.title}
              content={section.content}
              icon={section.icon}
              isRegenerating={regeneratingKey === key}
              canRegenerate={regeneratingKey === null}
              isDemo={isDemo}
              onRegenerate={handleRegenerate}
              onCopyInvitation={key === 'invitation' ? handleCopyInvitation : undefined}
            />
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Event Plan?"
        message={`Are you sure you want to delete "${eventDetails.eventName}"? This cannot be undone.`}
        confirmLabel="Delete Event"
        cancelLabel="Keep Event"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
