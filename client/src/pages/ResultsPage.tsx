import { useState, useRef, useCallback } from 'react';
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
  Printer,
  ArrowLeft,
  PenLine,
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
} from 'lucide-react';
import { markdownToHtml } from '../markdown';
import { regenerateSection } from '../api';
import { savePlan } from '../storage';
import type { EventDetails, EventPlan, Toast } from '../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles size={18} />,
  Clock: <Clock size={18} />,
  IndianRupee: <IndianRupee size={18} />,
  UtensilsCrossed: <UtensilsCrossed size={18} />,
  Palette: <Palette size={18} />,
  CheckSquare: <CheckSquare size={18} />,
  Mail: <Mail size={18} />,
  Shield: <Shield size={18} />,
};

interface Props {
  eventDetails: EventDetails | null;
  plan: EventPlan | null;
  isDemo: boolean;
  onUpdatePlan: (plan: EventPlan) => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function ResultsPage({ eventDetails, plan, isDemo, onUpdatePlan, addToast }: Props) {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);

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
      addToast(`${section.title} regenerated successfully!`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate section';
      addToast(message, 'error');
    } finally {
      setRegeneratingKey(null);
    }
  }, [eventDetails, plan, onUpdatePlan, addToast]);

  const handleCopyInvitation = useCallback(() => {
    if (!plan?.invitation?.content) return;
    // Strip markdown formatting for plain text copy
    const plainText = plan.invitation.content
      .replace(/#{1,4}\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/---+/g, '─────────────')
      .trim();
    navigator.clipboard.writeText(plainText).then(() => {
      addToast('Invitation copied to clipboard!', 'success');
    }).catch(() => {
      addToast('Failed to copy. Please select and copy manually.', 'warning');
    });
  }, [plan, addToast]);

  const handleSave = useCallback(() => {
    if (!eventDetails || !plan) return;
    savePlan(eventDetails, plan);
    addToast('Event plan saved successfully!', 'success');
  }, [eventDetails, plan, addToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!plan || !eventDetails) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Event Plan Yet</h3>
          <p>Create a new event plan or load a saved one to see results here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/create')}>
            <Sparkles size={18} /> Create Event Plan
          </button>
        </div>
      </div>
    );
  }

  const sectionKeys = Object.keys(plan);

  return (
    <div className="page-container" ref={printRef}>
      {/* Header */}
      <div className="results-header">
        {isDemo && (
          <div className="estimate-banner" style={{ justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
            <Sparkles size={18} />
            <span>
              <strong>Demo Plan</strong> — This is a sample plan for demonstration purposes.
              Create your own event to get a personalized AI-generated plan.
            </span>
          </div>
        )}
        <h1>{eventDetails.eventName}</h1>
        <div className="results-meta">
          {eventDetails.eventType && (
            <span className="results-meta-item">
              <Sparkles size={16} /> {eventDetails.eventType}
            </span>
          )}
          {eventDetails.date && (
            <span className="results-meta-item">
              <Calendar size={16} /> {new Date(eventDetails.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </span>
          )}
          {eventDetails.city && (
            <span className="results-meta-item">
              <MapPin size={16} /> {eventDetails.city}
            </span>
          )}
          <span className="results-meta-item">
            <Users size={16} /> {eventDetails.guestCount} guests
          </span>
          <span className="results-meta-item">
            <IndianRupee size={16} /> ₹{eventDetails.budget.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="results-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/create')}>
            <ArrowLeft size={16} /> New Plan
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleSave}>
            <Save size={16} /> Save Plan
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={16} /> Print
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/create')}>
            <PenLine size={16} /> Edit & Regenerate
          </button>
        </div>
      </div>

      {/* Estimate Disclaimer */}
      <div className="estimate-banner">
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          <strong>Estimated prices only.</strong> All costs shown are AI-generated estimates based
          on typical market rates. They are not verified quotes. We recommend getting
          actual quotes from vendors before committing.
        </span>
      </div>

      {/* Sections */}
      <div className="results-sections">
        {sectionKeys.map(key => {
          const section = plan[key];
          if (!section || !section.content) return null;
          const isRegenerating = regeneratingKey === key;
          const isInvitation = key === 'invitation';

          return (
            <div key={key} className="card section-card" id={`section-${key}`}>
              <div className="section-header">
                <div className="section-title">
                  <div className="section-icon">
                    {ICON_MAP[section.icon] || <Sparkles size={18} />}
                  </div>
                  {section.title}
                </div>
                <div className="section-actions">
                  {isInvitation && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={handleCopyInvitation}
                      title="Copy invitation text"
                    >
                      <Copy size={15} /> Copy
                    </button>
                  )}
                  {!isDemo && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRegenerate(key)}
                      disabled={isRegenerating || regeneratingKey !== null}
                      title="Regenerate this section"
                    >
                      <RefreshCw size={15} className={isRegenerating ? 'spinning' : ''} />
                      {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                  )}
                </div>
              </div>
              <div
                className="section-content"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(section.content) }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
