import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComplaintForm from './pages/ComplaintForm';
import AdminPanel from './pages/AdminPanel';
import MyComplaints from './pages/MyComplaints';
import NotificationsPage from './pages/NotificationsPage';
import Profile from './pages/Profile';
import FAQ from './pages/FAQ';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import Queries from './pages/Queries';
import AdminQueries from './pages/AdminQueries';
import StaffPanel from './pages/StaffPanel';

const ProtectedRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  if (staffOnly && user.role !== 'staff') return <Navigate to="/" />;
  return children;
};

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex flex-1 relative">
        <Sidebar mobileOpen={mobileMenuOpen} closeMobile={() => setMobileMenuOpen(false)} />
        <div className="flex-1 lg:ml-72">
          <main className="w-full max-w-6xl mx-auto px-6 md:px-10 pt-28 pb-20 fade-in-up">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('splashShown')
  );

  const handleSplashDone = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <AuthProvider>
        <SearchProvider>
          <Router>
            <Toaster position="top-right" />
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Shared (all logged-in users) */}
              <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/faq" element={<ProtectedRoute><Layout><FAQ /></Layout></ProtectedRoute>} />

              {/* Citizen only */}
              <Route path="/submit" element={<ProtectedRoute><Layout><ComplaintForm /></Layout></ProtectedRoute>} />
              <Route path="/my-complaints" element={<ProtectedRoute><Layout><MyComplaints /></Layout></ProtectedRoute>} />
              <Route path="/queries" element={<ProtectedRoute><Layout><Queries /></Layout></ProtectedRoute>} />

              {/* Admin only */}
              <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Layout><AdminPanel /></Layout></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute adminOnly={true}><Layout><Analytics /></Layout></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute adminOnly={true}><Layout><UserManagement /></Layout></ProtectedRoute>} />
              <Route path="/admin-queries" element={<ProtectedRoute adminOnly={true}><Layout><AdminQueries /></Layout></ProtectedRoute>} />

              {/* Staff only */}
              <Route path="/staff-panel" element={<ProtectedRoute staffOnly={true}><Layout><StaffPanel /></Layout></ProtectedRoute>} />
            </Routes>
          </Router>
        </SearchProvider>
      </AuthProvider>
    </>
  );
}

export default App;
