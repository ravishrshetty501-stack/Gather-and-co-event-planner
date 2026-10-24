import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CalendarHeart,
  IndianRupee,
  Zap,
  PartyPopper,
  Eye,
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
      <section className="hero">
        <div className="hero-badge">
          <Sparkles size={16} /> AI-Powered Event Planning
        </div>
        <h1>
          Plan Your Perfect{' '}
          <span className="gradient-text">Celebration</span>
        </h1>
        <p className="hero-subtitle">
          From birthdays to weddings, college fests to anniversaries — get a complete,
          AI-generated event plan with budget breakdowns, menus, schedules, and more.
          All tailored to your vision and budget.
        </p>
        <div className="hero-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/create')}
          >
            <PartyPopper size={20} />
            Plan an Event
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={handleDemo}
          >
            <Eye size={20} />
            View Demo Plan
          </button>
        </div>

        <div className="hero-features">
          <div className="card card-elevated feature-card">
            <div className="feature-icon purple">
              <CalendarHeart size={24} />
            </div>
            <h3>Complete Event Plans</h3>
            <p>
              Get detailed schedules, decoration ideas, checklists with deadlines,
              and culturally appropriate invitation messages — all in one click.
            </p>
          </div>

          <div className="card card-elevated feature-card">
            <div className="feature-icon coral">
              <IndianRupee size={24} />
            </div>
            <h3>Smart Budget Planning</h3>
            <p>
              Receive itemized budget breakdowns in Indian Rupees. The AI flags
              when your wishlist exceeds your budget and suggests practical adjustments.
            </p>
          </div>

          <div className="card card-elevated feature-card">
            <div className="feature-icon amber">
              <Zap size={24} />
            </div>
            <h3>Instant & Customizable</h3>
            <p>
              Generate plans in seconds. Don't love a section? Regenerate just that
              part. Save your favorites and print beautiful event plans.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
