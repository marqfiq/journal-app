import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Entry from './pages/Entry';
import Calendar from './pages/Calendar';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import TrialBanner from './components/TrialBanner';
import PricingModal from './components/PricingModal';
import RestoreAccount from './components/RestoreAccount';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';


function App() {
  const { user, appUser, loading, userAccess } = useAuth();
  const location = useLocation();


  if (loading || (user && !appUser)) {
    return null; // Or a loading spinner
  }

  // Zombie Mode: Block access if account is scheduled for deletion OR if we are currently deleting it
  const isDeleting = typeof window !== 'undefined' && localStorage.getItem('isDeletingAccount') === 'true';
  if ((user && appUser?.scheduledForDeletionAt) || isDeleting) {
    return <RestoreAccount />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Global Modals */}
      <PricingModal />

      {/* Trial Banner - Global Visibility at very top */}
      {/* Trial Banner - Global Visibility at very top */}
      {/* Hide banner if we are returning from Stripe (success=true) to prevent flicker before success modal */}
      {(user && (userAccess?.accessLevel === 'trial' || userAccess?.accessLevel === 'expired') && !location.search.includes('success=true')) && (
        <TrialBanner
          trialEndAt={userAccess.trialEndAt}
          status={userAccess.accessLevel === 'expired' ? 'expired' : 'trial'}
        />
      )}

      <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to={'/home' + location.hash} replace /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to={'/home' + location.hash} replace /> : <Login />} />
          <Route path="/signin" element={user ? <Navigate to={'/home' + location.hash} replace /> : <SignIn />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />


          {/* Protected Routes - Wrapped in Layout */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/home" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:id" element={<Entry />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/search" element={<Search />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
