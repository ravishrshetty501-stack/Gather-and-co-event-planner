import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  IndianRupee,
  RefreshCw,
  ArrowRight,
  Clock,
  Users,
  MapPin,
} from 'lucide-react';
import { DEMO_EVENT_DETAILS, DEMO_PLAN } from '../demoData';
import type { EventDetails, EventPlan } from '../types';

interface Props {
  onLoadDemo: (details: EventDetails, plan: EventPlan) => void;
}

export default function HomePage({ onLoadDemo }: Props) {
  const navigate = useNavigate();

  const handleDemo = () => {
    onLoadDemo(DEMO_EVENT_DETAILS, DEMO_PLAN);
    navigate('/results');
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Event Planning Studio</span>
          <h1>
            Make room for a moment worth celebrating.
          </h1>
          <p className="hero-subtitle">
            Tell us your vision, guest count, and budget. We'll craft a
            complete event plan — schedule, menu, decorations, budget
            breakdown, and invitation — ready in seconds.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/create')}
            >
              Plan your event
              <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleDemo}
            >
              View a sample plan
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="/hero.jpg"
            alt="A beautifully styled celebration dinner table with flowers, candles, and elegant tableware"
            loading="eager"
          />
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="benefits-section" aria-label="Benefits">
        <div className="benefit-item">
          <div className="benefit-icon">
            <CalendarCheck size={18} />
          </div>
          <div>
            <h3>Complete plans in one click</h3>
            <p>
              Schedules, menus, checklists, decorations, invitations —
              everything you need to bring an event to life.
            </p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">
            <IndianRupee size={18} />
          </div>
          <div>
            <h3>Budget-aware planning</h3>
            <p>
              Get itemized cost breakdowns in Indian Rupees. We flag
              when your wishlist exceeds your budget.
            </p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">
            <RefreshCw size={18} />
          </div>
          <div>
            <h3>Refine any section</h3>
            <p>
              Not happy with the menu? Regenerate just that part.
              Save your favorites and print polished plans.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works" aria-label="How it works">
        <h2>How it works</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="step-number">1</div>
            <h3>Describe your event</h3>
            <p>
              Choose the type, set your budget, add preferences for food,
              theme, and accessibility.
            </p>
          </div>
          <div className="how-step">
            <div className="step-number">2</div>
            <h3>Get a tailored plan</h3>
            <p>
              AI generates a comprehensive plan with schedules, menus,
              decorations, and a detailed budget.
            </p>
          </div>
          <div className="how-step">
            <div className="step-number">3</div>
            <h3>Refine and share</h3>
            <p>
              Regenerate any section, save your plan, copy the invitation,
              or print the entire document.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sample Event Preview ── */}
      <section className="sample-preview" aria-label="Sample event preview">
        <h2>See what a plan looks like</h2>
        <p>
          Here's a snapshot from a sample birthday celebration plan.
        </p>

        <div className="sample-card">
          <div className="sample-card-header">
            <span className="sample-event-title">Aarav's 25th Birthday Bash</span>
            <div className="sample-meta">
              <span className="sample-meta-item">
                <MapPin size={13} /> Bangalore
              </span>
              <span className="sample-meta-item">
                <Users size={13} /> 80 guests
              </span>
              <span className="sample-meta-item">
                <IndianRupee size={13} /> ₹1,50,000
              </span>
            </div>
          </div>
          <div className="sample-card-body">
            <div className="sample-section">
              <h4>Schedule</h4>
              <div className="sample-timeline-item">
                <span className="sample-timeline-time">6:00 PM</span>
                <span className="sample-timeline-label">Red carpet welcome &amp; mocktails</span>
              </div>
              <div className="sample-timeline-item">
                <span className="sample-timeline-time">7:00 PM</span>
                <span className="sample-timeline-label">Bollywood trivia &amp; games</span>
              </div>
              <div className="sample-timeline-item">
                <span className="sample-timeline-time">7:30 PM</span>
                <span className="sample-timeline-label">Surprise cake cutting</span>
              </div>
              <div className="sample-timeline-item">
                <span className="sample-timeline-time">8:00 PM</span>
                <span className="sample-timeline-label">Dinner buffet service</span>
              </div>
              <div className="sample-timeline-item">
                <span className="sample-timeline-time">8:45 PM</span>
                <span className="sample-timeline-label">Karaoke &amp; dance floor</span>
              </div>
            </div>
            <div className="sample-section">
              <h4>Budget Overview</h4>
              <div className="sample-budget-row">
                <span className="sample-budget-label">Venue rental</span>
                <span className="sample-budget-amount">₹25,000</span>
              </div>
              <div className="sample-budget-row">
                <span className="sample-budget-label">Catering &amp; beverages</span>
                <span className="sample-budget-amount">₹56,000</span>
              </div>
              <div className="sample-budget-row">
                <span className="sample-budget-label">Decorations &amp; flowers</span>
                <span className="sample-budget-amount">₹18,000</span>
              </div>
              <div className="sample-budget-row">
                <span className="sample-budget-label">DJ &amp; karaoke</span>
                <span className="sample-budget-amount">₹12,000</span>
              </div>
              <div className="sample-budget-row">
                <span className="sample-budget-label">Photography</span>
                <span className="sample-budget-amount">₹10,000</span>
              </div>
              <div className="sample-budget-row sample-budget-total">
                <span className="sample-budget-label">Total estimated</span>
                <span className="sample-budget-amount">₹1,50,000</span>
              </div>
            </div>
          </div>
          <div className="sample-card-footer">
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleDemo}
            >
              View full sample plan
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2>Ready to plan something special?</h2>
        <p>
          It takes less than a minute to describe your event.
          The rest is taken care of.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/create')}
        >
          Start planning
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
