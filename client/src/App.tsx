import { useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import HomePage from './pages/HomePage';
import { generatePlan } from './api';
import { deleteSavedPlan } from './storage';
import type { EventDetails, EventPlan, Toast, SavedPlan } from './types';

// Route-based code splitting for improved initial bundle performance
const CreateEventPage = lazy(() => import('./pages/CreateEventPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const SavedPlansPage = lazy(() => import('./pages/SavedPlansPage'));
const LoadingPage = lazy(() => import('./pages/LoadingPage'));

function RouteLoadingFallback() {
  return (
    <div className="page-container" role="status" aria-live="polite">
      <div className="loading-container" style={{ minHeight: '50vh' }}>
        <div className="spinner" aria-hidden="true" />
        <p className="loading-subtext">Loading workspace…</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  /** Reset all plan-related state to its initial empty values. */
  const resetPlanState = useCallback(() => {
    setEventDetails(null);
    setPlan(null);
    setCurrentPlanId(null);
    setIsDemo(false);
  }, []);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleFormSubmit = useCallback(async (details: EventDetails) => {
    setEventDetails(details);
    setIsLoading(true);
    setIsDemo(false);
    navigate('/loading');

    try {
      const response = await generatePlan(details);
      setPlan(response.plan);
      setCurrentPlanId(null);
      navigate('/results');
      addToast('Event plan generated successfully! 🎉', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate plan';
      addToast(message, 'error');
      navigate('/create');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, addToast]);

  const handleLoadDemo = useCallback((details: EventDetails, demoPlan: EventPlan) => {
    setEventDetails(details);
    setPlan(demoPlan);
    setCurrentPlanId(null);
    setIsDemo(true);
  }, []); // NOTE: intentionally does not use resetPlanState — it sets non-null values

  const handleLoadPlan = useCallback((savedPlan: SavedPlan) => {
    setEventDetails(savedPlan.eventDetails);
    setPlan(savedPlan.plan);
    setCurrentPlanId(savedPlan.id);
    setIsDemo(false);
  }, []);

  const handlePlanSaved = useCallback((saved: SavedPlan) => {
    setCurrentPlanId(saved.id);
    setEventDetails(saved.eventDetails);
    setPlan(saved.plan);
  }, []);

  const handleNewPlan = useCallback(() => {
    resetPlanState();
    navigate('/create');
  }, [resetPlanState, navigate]);

  const handleClearPlan = useCallback(() => {
    resetPlanState();
  }, [resetPlanState]);

  const handleDeleteCurrentPlan = useCallback(() => {
    if (currentPlanId) {
      deleteSavedPlan(currentPlanId);
    }
    resetPlanState();
    addToast('Event plan deleted.', 'success');
    navigate('/saved');
  }, [currentPlanId, resetPlanState, navigate, addToast]);

  const handlePlanDeleted = useCallback((deletedId: string) => {
    if (currentPlanId === deletedId) {
      resetPlanState();
    }
  }, [currentPlanId, resetPlanState]);

  const handleUpdatePlan = useCallback((updated: EventPlan) => {
    setPlan(updated);
  }, []);

  return (
    <>
      <Header />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage onLoadDemo={handleLoadDemo} />} />
          <Route
            path="/create"
            element={
              <CreateEventPage
                initialDetails={eventDetails}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                onClearPlan={handleClearPlan}
              />
            }
          />
          <Route path="/loading" element={<LoadingPage />} />
          <Route
            path="/results"
            element={
              <ResultsPage
                eventDetails={eventDetails}
                plan={plan}
                currentPlanId={currentPlanId}
                isDemo={isDemo}
                onUpdatePlan={handleUpdatePlan}
                onPlanSaved={handlePlanSaved}
                onDeletePlan={handleDeleteCurrentPlan}
                onNewPlan={handleNewPlan}
                addToast={addToast}
              />
            }
          />
          <Route
            path="/saved"
            element={
              <SavedPlansPage
                currentPlanId={currentPlanId}
                onLoadPlan={handleLoadPlan}
                onPlanDeleted={handlePlanDeleted}
                addToast={addToast}
              />
            }
          />
          <Route
            path="/my-events"
            element={
              <SavedPlansPage
                currentPlanId={currentPlanId}
                onLoadPlan={handleLoadPlan}
                onPlanDeleted={handlePlanDeleted}
                addToast={addToast}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Footer />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
