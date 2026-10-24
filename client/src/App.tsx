import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import HomePage from './pages/HomePage';
import CreateEventPage from './pages/CreateEventPage';
import ResultsPage from './pages/ResultsPage';
import SavedPlansPage from './pages/SavedPlansPage';
import LoadingPage from './pages/LoadingPage';
import { generatePlan } from './api';
import type { EventDetails, EventPlan, Toast } from './types';

function AppRoutes() {
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

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
    setIsDemo(true);
  }, []);

  const handleLoadPlan = useCallback((details: EventDetails, savedPlan: EventPlan) => {
    setEventDetails(details);
    setPlan(savedPlan);
    setIsDemo(false);
  }, []);

  const handleUpdatePlan = useCallback((updated: EventPlan) => {
    setPlan(updated);
  }, []);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage onLoadDemo={handleLoadDemo} />} />
        <Route
          path="/create"
          element={<CreateEventPage onSubmit={handleFormSubmit} isLoading={isLoading} />}
        />
        <Route path="/loading" element={<LoadingPage />} />
        <Route
          path="/results"
          element={
            <ResultsPage
              eventDetails={eventDetails}
              plan={plan}
              isDemo={isDemo}
              onUpdatePlan={handleUpdatePlan}
              addToast={addToast}
            />
          }
        />
        <Route
          path="/saved"
          element={<SavedPlansPage onLoadPlan={handleLoadPlan} addToast={addToast} />}
        />
      </Routes>
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
