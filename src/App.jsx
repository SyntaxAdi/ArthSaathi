import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LandingPage from './pages/LandingPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';
import CoachPage from './pages/CoachPage';
import GoalsPage from './pages/GoalsPage';
import ReportPage from './pages/ReportPage';
import ProfilePage from './pages/ProfilePage';
import FeaturesPage from './pages/FeaturesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import LanguagesPage from './pages/LanguagesPage';
import AuthPage from './pages/AuthPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const MainLayout = ({ children, hideNavbar, showSidebar }) => {
  return (
    <div className="min-h-screen bg-bgBase text-textPrimary selection:bg-accent selection:text-[#0a0a0a]">
      {!hideNavbar && <Navbar />}
      {showSidebar && <Sidebar />}
      <main className={`${showSidebar ? 'md:ml-64 pb-20 md:pb-0' : ''} h-full`}>
        {children}
      </main>
    </div>
  );
};

function AppRoutes() {
  const location = useLocation();
  const isAppRoute = ['/dashboard', '/coach', '/goals', '/report', '/profile'].includes(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainLayout><PageTransition><LandingPage /></PageTransition></MainLayout>} />
        <Route path="/features" element={<MainLayout><PageTransition><FeaturesPage /></PageTransition></MainLayout>} />
        <Route path="/how-it-works" element={<MainLayout><PageTransition><HowItWorksPage /></PageTransition></MainLayout>} />
        <Route path="/languages" element={<MainLayout><PageTransition><LanguagesPage /></PageTransition></MainLayout>} />
        <Route path="/auth" element={<MainLayout hideNavbar><PageTransition><AuthPage /></PageTransition></MainLayout>} />
        <Route path="/quiz" element={<MainLayout hideNavbar><PageTransition><QuizPage /></PageTransition></MainLayout>} />
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout hideNavbar showSidebar><PageTransition><DashboardPage /></PageTransition></MainLayout></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute><MainLayout hideNavbar showSidebar><PageTransition><CoachPage /></PageTransition></MainLayout></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><MainLayout hideNavbar showSidebar><PageTransition><GoalsPage /></PageTransition></MainLayout></ProtectedRoute>} />
        <Route path="/report" element={<MainLayout hideNavbar showSidebar><PageTransition><ReportPage /></PageTransition></MainLayout>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout hideNavbar showSidebar><PageTransition><ProfilePage /></PageTransition></MainLayout></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
