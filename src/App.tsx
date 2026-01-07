import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Entry from './pages/Entry';
import Journal from './pages/Journal';
import Search from './pages/Search';

function App() {
  const { user, loading } = useAuth();

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen />}
      </AnimatePresence>

      {!loading && (
        <Routes>
          <Route path="/signin" element={<SignIn />} />

          {user ? (
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="journal" element={<Journal />} />
              <Route path="journal/:id" element={<Entry />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="search" element={<Search />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          ) : (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      )}
    </>
  );
}

export default App;
