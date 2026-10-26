import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { EVENT_TYPES, FOOD_PREFERENCES } from '../types';
import type { EventDetails } from '../types';
import { formatCompactINR, formatINR, calculatePerGuest } from '../utils/formatters';

interface Props {
  initialDetails?: EventDetails | null;
  onSubmit: (details: EventDetails) => void;
  isLoading: boolean;
  onClearPlan?: () => void;
}

const DEFAULT_FORM: EventDetails = {
  eventType: '',
  eventName: '',
  date: '',
  time: '',
  city: '',
  guestCount: 50,
  budget: 50000,
  theme: '',
  foodPreferences: '',
  dietaryRequirements: '',
  accessibilityRequirements: '',
  additionalInstructions: '',
};

const GUEST_PRESETS = [25, 40, 60, 100, 200];
const BUDGET_PRESETS = [25000, 30000, 50000, 100000, 250000];

export default function CreateEventPage({ initialDetails, onSubmit, isLoading, onClearPlan }: Props) {
  const [form, setForm] = useState<EventDetails>(initialDetails || DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (initialDetails) {
      setForm(initialDetails);
    }
  }, [initialDetails]);

  const update = useCallback((field: keyof EventDetails, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const perGuestEstimate = useMemo(
    () => calculatePerGuest(form.budget, form.guestCount),
    [form.budget, form.guestCount]
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.eventType) newErrors.eventType = 'Please select an event type';
    if (!form.eventName.trim()) newErrors.eventName = 'Please enter an event name';
    if (!form.guestCount || form.guestCount < 1) newErrors.guestCount = 'At least 1 guest required';
    if (form.guestCount > 10000) newErrors.guestCount = 'Maximum 10,000 guests';
    if (!form.budget || form.budget < 1000) newErrors.budget = 'Minimum budget is ₹1,000';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setErrors({});
  };

  return (
    <div className="page-container">
      <div className="page-title">
        <span className="guided-studio-eyebrow">
          <Compass size={14} /> Guided Event Studio
        </span>
        <h1>{initialDetails ? 'Edit your event' : 'Plan your event'}</h1>
        <p>
          {initialDetails
            ? 'Refine your celebration parameters and regenerate an optimized plan.'
            : 'Provide your event specifications to generate an itemized budget, run-of-show schedule, and custom culinary plan.'}
        </p>
      </div>

      {initialDetails && (
        <div className="edit-banner">
          <div className="edit-banner-info">
            <Sparkles size={16} />
            <span>
              Editing existing event: <strong>{initialDetails.eventName}</strong>
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              handleReset();
              onClearPlan?.();
            }}
          >
            Start fresh with a blank form
          </button>
        </div>
      )}

      <div className="event-form-wrapper">
        <form onSubmit={handleSubmit} noValidate>
          {/* Step 1: Occasion & Setting */}
          <div className="form-section card">
            <div className="form-section-header">
              <span className="form-section-step">01</span>
              <div>
                <h3 className="form-section-title">Occasion &amp; Setting</h3>
                <p className="form-section-desc">Key details about what and where you are celebrating</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="eventType" className="form-label">
                  Event Type <span className="required">*</span>
                </label>
                <select
                  id="eventType"
                  className={`form-select ${errors.eventType ? 'input-error' : ''}`}
                  value={form.eventType}
                  onChange={e => update('eventType', e.target.value)}
                  aria-invalid={!!errors.eventType}
                  aria-describedby={errors.eventType ? 'eventType-error' : undefined}
                >
                  <option value="">Select event category</option>
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.eventType && (
                  <span id="eventType-error" className="form-error" role="alert">
                    {errors.eventType}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="eventName" className="form-label">
                  Event Name <span className="required">*</span>
                </label>
                <input
                  id="eventName"
                  type="text"
                  className={`form-input ${errors.eventName ? 'input-error' : ''}`}
                  placeholder="e.g., Aarav's 21st Birthday Celebration"
                  value={form.eventName}
                  onChange={e => update('eventName', e.target.value)}
                  maxLength={100}
                  aria-invalid={!!errors.eventName}
                  aria-describedby={errors.eventName ? 'eventName-error' : undefined}
                />
                {errors.eventName && (
                  <span id="eventName-error" className="form-error" role="alert">
                    {errors.eventName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="eventDate" className="form-label">
                  Date
                </label>
                <input
                  id="eventDate"
                  type="date"
                  className="form-input"
                  value={form.date}
                  onChange={e => update('date', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventTime" className="form-label">
                  Time
                </label>
                <input
                  id="eventTime"
                  type="time"
                  className="form-input"
                  value={form.time}
                  onChange={e => update('time', e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="city" className="form-label">
                  City or Venue
                </label>
                <input
                  id="city"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Bengaluru, Mumbai, Delhi, or specific venue"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Scale & Investment */}
          <div className="form-section card">
            <div className="form-section-header">
              <span className="form-section-step">02</span>
              <div>
                <h3 className="form-section-title">Scale &amp; Investment</h3>
                <p className="form-section-desc">Guest projections and your target expenditure</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="guestCount" className="form-label">
                  Number of Guests <span className="required">*</span>
                </label>
                <input
                  id="guestCount"
                  type="number"
                  className={`form-input ${errors.guestCount ? 'input-error' : ''}`}
                  placeholder="40"
                  min={1}
                  max={10000}
                  value={form.guestCount || ''}
                  onChange={e => update('guestCount', parseInt(e.target.value) || 0)}
                  aria-invalid={!!errors.guestCount}
                  aria-describedby={errors.guestCount ? 'guestCount-error' : undefined}
                />
                <div className="preset-pill-row">
                  <span className="preset-label">Quick select:</span>
                  {GUEST_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      className={`preset-pill ${form.guestCount === preset ? 'active' : ''}`}
                      onClick={() => update('guestCount', preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                {errors.guestCount && (
                  <span id="guestCount-error" className="form-error" role="alert">
                    {errors.guestCount}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="budget" className="form-label">
                  Total Budget (₹) <span className="required">*</span>
                </label>
                <input
                  id="budget"
                  type="number"
                  className={`form-input ${errors.budget ? 'input-error' : ''}`}
                  placeholder="30000"
                  min={1000}
                  step={1000}
                  value={form.budget || ''}
                  onChange={e => update('budget', parseInt(e.target.value) || 0)}
                  aria-invalid={!!errors.budget}
                  aria-describedby={errors.budget ? 'budget-error' : undefined}
                />
                <div className="preset-pill-row">
                  <span className="preset-label">Quick select:</span>
                  {BUDGET_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      className={`preset-pill ${form.budget === preset ? 'active' : ''}`}
                      onClick={() => update('budget', preset)}
                    >
                      {formatCompactINR(preset)}
                    </button>
                  ))}
                </div>
                {form.budget > 0 && (
                  <span className="form-hint">
                    {formatINR(form.budget)} total · ~{formatINR(perGuestEstimate)} per guest
                  </span>
                )}
                {errors.budget && (
                  <span id="budget-error" className="form-error" role="alert">
                    {errors.budget}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Aesthetic & Atmosphere */}
          <div className="form-section card">
            <div className="form-section-header">
              <span className="form-section-step">03</span>
              <div>
                <h3 className="form-section-title">Aesthetic &amp; Preferences</h3>
                <p className="form-section-desc">Styling vision, dietary choices, and customized requirements</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="theme" className="form-label">
                  Theme / Atmosphere
                </label>
                <input
                  id="theme"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Elegant garden party with warm lights and greenery"
                  value={form.theme}
                  onChange={e => update('theme', e.target.value)}
                  maxLength={200}
                />
                <span className="form-hint">Describe the ambience you envision. Leave blank for creative suggestions.</span>
              </div>

              <div className="form-group">
                <label htmlFor="foodPreferences" className="form-label">
                  Culinary Preference
                </label>
                <select
                  id="foodPreferences"
                  className="form-select"
                  value={form.foodPreferences}
                  onChange={e => update('foodPreferences', e.target.value)}
                >
                  <option value="">Select dining profile</option>
                  {FOOD_PREFERENCES.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dietaryRequirements" className="form-label">
                  Dietary Considerations
                </label>
                <input
                  id="dietaryRequirements"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Vegetarian-friendly menu, nut allergy"
                  value={form.dietaryRequirements}
                  onChange={e => update('dietaryRequirements', e.target.value)}
                  maxLength={300}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="accessibilityRequirements" className="form-label">
                  Accessibility &amp; Special Needs
                </label>
                <input
                  id="accessibilityRequirements"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Ground floor entrance, step-free access, hearing loop"
                  value={form.accessibilityRequirements}
                  onChange={e => update('accessibilityRequirements', e.target.value)}
                  maxLength={300}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="additionalInstructions" className="form-label">
                  Special Notes &amp; Contingency Instructions
                </label>
                <textarea
                  id="additionalInstructions"
                  className="form-textarea"
                  placeholder="e.g., Simple decorations, outdoor backup plan, surprise gift moment..."
                  value={form.additionalInstructions}
                  onChange={e => update('additionalInstructions', e.target.value)}
                  maxLength={1000}
                  rows={4}
                />
                <span className="form-hint">
                  {form.additionalInstructions.length}/1000 characters
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={handleReset} disabled={isLoading}>
              <RotateCcw size={15} /> Reset Form
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Generating Plan…
                </>
              ) : (
                <>
                  Generate Event Plan
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
