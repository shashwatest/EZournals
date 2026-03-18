import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Home, Calendar, BarChart3, Settings, LogOut, User, BookOpen, Trash2, Sparkles, TrendingUp } from 'lucide-react';

export default function DashboardLayout() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    localStorage.removeItem('uiSettings');
    localStorage.removeItem('customThemes');
    
    await signOut(auth);
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Navigate', path: '/navigate' },
    { icon: BarChart3, label: 'Overview', path: '/overview' },
    { icon: Trash2, label: 'Recycle Bin', path: '/recycle-bin' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const aiItems = [
    { icon: Sparkles, label: 'AI Settings', path: '/ai-settings' },
    { icon: TrendingUp, label: 'Insights', path: '/insights' },
  ];

  const settingsItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      backgroundColor: theme.background,
      color: theme.text,
    },
    sidebar: {
      width: '260px',
      backgroundColor: theme.surface,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '0 12px',
      marginBottom: '32px',
    },
    logoText: {
      fontSize: '24px',
      fontWeight: '700',
      color: theme.text,
    },
    menu: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      color: theme.textSecondary,
      textDecoration: 'none',
    },
    menuItemActive: {
      backgroundColor: `${theme.accent}20`,
      color: theme.accent,
    },
    footer: {
      padding: '16px 12px',
      borderTop: `1px solid ${theme.border}`,
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: theme.accent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      color: theme.danger,
      border: 'none',
      background: 'transparent',
      width: '100%',
      fontSize: '14px',
    },
    main: {
      flex: 1,
      overflow: 'auto',
    },
    sectionDivider: {
      marginTop: '24px',
      marginBottom: '8px',
      paddingTop: '16px',
      borderTop: `1px solid ${theme.border}`,
    },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.5px',
      color: theme.textSecondary,
      padding: '0 12px',
      marginBottom: '8px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <BookOpen size={32} color={theme.accent} />
          <span style={styles.logoText}>EZournals</span>
        </div>

        <div style={styles.menu}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.menuItemActive : {}),
                }}
                onClick={() => navigate(item.path)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
            );
          })}
          
          <div style={styles.sectionDivider}>
            <div style={styles.sectionTitle}>AI INTEGRATION</div>
          </div>
          
          {aiItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.menuItemActive : {}),
                  color: isActive ? theme.accent : theme.accent,
                }}
                onClick={() => navigate(item.path)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
            );
          })}
          
          <div style={styles.sectionDivider}>
            <div style={styles.sectionTitle}>SYSTEM</div>
          </div>
          
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.menuItemActive : {}),
                }}
                onClick={() => navigate(item.path)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        <div style={styles.footer}>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div style={styles.main}>
        <Outlet />
      </div>
    </div>
  );
}
