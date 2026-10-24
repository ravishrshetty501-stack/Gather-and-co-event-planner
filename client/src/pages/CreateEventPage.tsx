import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PartyPopper,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Palette,
  UtensilsCrossed,
  Accessibility,
  FileText,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { EVENT_TYPES, FOOD_PREFERENCES } from '../types';
import type { EventDetails } from '../types';

interface Props {
  onSubmit: (details: EventDetails) => void;
  isLoading: boolean;
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

export default function CreateEventPage({ onSubmit, isLoading }: Props) {
  const [form, setForm] = useState<EventDetails>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const update = (field: keyof EventDetails, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

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

  const formatBudget = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="page-container">
      <div className="page-title">
        <h1>Plan Your Event</h1>
        <p>
          Fill in the details below and let AI create a complete, customized event plan for you.
        </p>
      </div>

      <div className="event-form-wrapper">
        <form onSubmit={handleSubmit}>
          {/* Basic Details */}
          <div className="form-section">
            <div className="form-section-title">
              <PartyPopper size={20} /> Event Basics
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="eventType" className="form-label">
                  Event Type <span className="required">*</span>
                </label>
                <select
                  id="eventType"
                  className="form-select"
                  value={form.eventType}
                  onChange={e => update('eventType', e.target.value)}
                >
                  <option value="">Select event type</option>
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.eventType && <span className="form-error">{errors.eventType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="eventName" className="form-label">
                  Event Name <span className="required">*</span>
                </label>
                <input
                  id="eventName"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Priya's Wedding Reception"
                  value={form.eventName}
                  onChange={e => update('eventName', e.target.value)}
                  maxLength={100}
                />
                {errors.eventName && <span className="form-error">{errors.eventName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="eventDate" className="form-label">
                  <Calendar size={16} /> Date
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
                  <MapPin size={16} /> City or Venue
                </label>
                <input
                  id="city"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Mumbai, Bangalore, Delhi"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          {/* Guests & Budget */}
          <div className="form-section">
            <div className="form-section-title">
              <Users size={20} /> Guests & Budget
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="guestCount" className="form-label">
                  Number of Guests <span className="required">*</span>
                </label>
                <input
                  id="guestCount"
                  type="number"
                  className="form-input"
                  placeholder="50"
                  min={1}
                  max={10000}
                  value={form.guestCount || ''}
                  onChange={e => update('guestCount', parseInt(e.target.value) || 0)}
                />
                {errors.guestCount && <span className="form-error">{errors.guestCount}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="budget" className="form-label">
                  <IndianRupee size={16} /> Budget (₹) <span className="required">*</span>
                </label>
                <input
                  id="budget"
                  type="number"
                  className="form-input"
                  placeholder="50000"
                  min={1000}
                  step={1000}
                  value={form.budget || ''}
                  onChange={e => update('budget', parseInt(e.target.value) || 0)}
                />
                {form.budget > 0 && (
                  <span className="form-hint">
                    {formatBudget(form.budget)} • ~{formatBudget(Math.round(form.budget / (form.guestCount || 1)))} per guest
                  </span>
                )}
                {errors.budget && <span className="form-error">{errors.budget}</span>}
              </div>
            </div>
          </div>

          {/* Theme & Atmosphere */}
          <div className="form-section">
            <div className="form-section-title">
              <Palette size={20} /> Theme & Atmosphere
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
                  placeholder="e.g., Bollywood Night, Rustic Garden, Royal Rajasthani"
                  value={form.theme}
                  onChange={e => update('theme', e.target.value)}
                  maxLength={200}
                />
                <span className="form-hint">Describe the mood and look you envision. Leave blank for AI suggestions.</span>
              </div>
            </div>
          </div>

          {/* Food */}
          <div className="form-section">
            <div className="form-section-title">
              <UtensilsCrossed size={20} /> Food & Dietary
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="foodPreferences" className="form-label">
                  Food Preference
                </label>
                <select
                  id="foodPreferences"
                  className="form-select"
                  value={form.foodPreferences}
                  onChange={e => update('foodPreferences', e.target.value)}
                >
                  <option value="">Select preference</option>
                  {FOOD_PREFERENCES.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dietaryRequirements" className="form-label">
                  Dietary Requirements
                </label>
                <input
                  id="dietaryRequirements"
                  type="text"
                  className="form-input"
                  placeholder="e.g., gluten-free, nut allergy, diabetic-friendly"
                  value={form.dietaryRequirements}
                  onChange={e => update('dietaryRequirements', e.target.value)}
                  maxLength={300}
                />
              </div>
            </div>
          </div>

          {/* Accessibility & Additional */}
          <div className="form-section">
            <div className="form-section-title">
              <Accessibility size={20} /> Accessibility & Notes
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="accessibilityRequirements" className="form-label">
                  Accessibility Requirements
                </label>
                <input
                  id="accessibilityRequirements"
                  type="text"
                  className="form-input"
                  placeholder="e.g., wheelchair accessible, ground floor, hearing loop"
                  value={form.accessibilityRequirements}
                  onChange={e => update('accessibilityRequirements', e.target.value)}
                  maxLength={300}
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="additionalInstructions" className="form-label">
                  <FileText size={16} /> Additional Instructions
                </label>
                <textarea
                  id="additionalInstructions"
                  className="form-textarea"
                  placeholder="Any special requests, must-haves, or things to avoid..."
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
              <RotateCcw size={18} /> Reset Form
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Event Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
