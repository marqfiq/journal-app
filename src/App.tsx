import { CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { StickerProvider } from './context/StickerContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Entry from './pages/Entry';
import Journal from './pages/Journal';
import Search from './pages/Search';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CssBaseline />
        <StickerProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="journal" element={<Journal />} />
              <Route path="journal/:id" element={<Entry />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="search" element={<Search />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </StickerProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
