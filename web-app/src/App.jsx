import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UISettingsProvider } from './contexts/UISettingsContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import './theme.css';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import AddEntryPage from './pages/AddEntryPage';
import ViewEntryPage from './pages/ViewEntryPage';
import EditEntryPage from './pages/EditEntryPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NavigatePage from './pages/NavigatePage';
import OverviewPage from './pages/OverviewPage';
import RecycleBinPage from './pages/RecycleBinPage';
import CustomThemePage from './pages/CustomThemePage';
import CloudSettingsPage from './pages/CloudSettingsPage';
import UISettingsPage from './pages/UISettingsPage';
import AISettingsPage from './pages/AISettingsPage';
import InsightsPage from './pages/InsightsPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }
  
  return !user ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <UISettingsProvider>
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              
              <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route index element={<HomePage />} />
                <Route path="add" element={<AddEntryPage />} />
                <Route path="entry/:id" element={<ViewEntryPage />} />
                <Route path="edit/:id" element={<EditEntryPage />} />
                <Route path="navigate" element={<NavigatePage />} />
                <Route path="overview" element={<OverviewPage />} />
                <Route path="recycle-bin" element={<RecycleBinPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="custom-theme" element={<CustomThemePage />} />
                <Route path="cloud-settings" element={<CloudSettingsPage />} />
                <Route path="ui-settings" element={<UISettingsPage />} />
                <Route path="ai-settings" element={<AISettingsPage />} />
                <Route path="insights" element={<InsightsPage />} />
              </Route>
            </Routes>
          </UISettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
