import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Home, Calendar, BarChart3, Settings, LogOut, User, BookOpen, Trash2, Sparkles, TrendingUp, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function DashboardLayout() {
  const { theme, currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    localStorage.removeItem('theme');
    localStorage.removeItem('uiSettings');
    localStorage.removeItem('customThemes');
    localStorage.removeItem('journal_entries');
    localStorage.removeItem('active_local_user_id');
    
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
      height: '100dvh',
      backgroundColor: theme.background,
      color: theme.text,
      position: 'relative',
      overflow: 'hidden',
    },
    sidebar: {
      width: sidebarCollapsed ? '88px' : '260px',
      backgroundColor: theme.surface,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
      backdropFilter: currentTheme === 'glassmorphism' ? 'blur(28px)' : 'none',
      WebkitBackdropFilter: currentTheme === 'glassmorphism' ? 'blur(28px)' : 'none',
      boxShadow: currentTheme === 'glassmorphism' ? '0 24px 60px rgba(0, 0, 0, 0.32)' : 'none',
      transition: 'width 0.24s ease',
      overflow: 'hidden',
      overflowX: 'hidden',
      flexShrink: 0,
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '0 12px',
      marginBottom: '32px',
      justifyContent: sidebarCollapsed ? 'center' : 'space-between',
    },
    logoText: {
      fontSize: '24px',
      fontWeight: '700',
      color: theme.text,
    },
    sidebarToggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.buttonBg || theme.background,
      color: theme.textSecondary,
      cursor: 'pointer',
      flexShrink: 0,
    },
    menu: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      minHeight: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingBottom: '12px',
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
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
    },
    menuItemActive: {
      backgroundColor: `${theme.accent}20`,
      color: theme.accent,
    },
    footer: {
      padding: '16px 12px',
      borderTop: `1px solid ${theme.border}`,
      marginTop: 'auto',
      flexShrink: 0,
      backgroundColor: theme.surface,
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
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
    },
    main: {
      flex: 1,
      overflow: 'auto',
      position: 'relative',
      minWidth: 0,
      minHeight: 0,
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
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          {!sidebarCollapsed && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <BookOpen size={32} color={theme.accent} />
                <span style={styles.logoText}>EZournals</span>
              </div>
              <button
                style={styles.sidebarToggle}
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse Sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </>
          )}
          {sidebarCollapsed && (
            <button
              style={styles.sidebarToggle}
              onClick={() => setSidebarCollapsed(false)}
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
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
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </div>
            );
          })}
          
          {!sidebarCollapsed && (
            <div style={styles.sectionDivider}>
              <div style={styles.sectionTitle}>AI INTEGRATION</div>
            </div>
          )}
          
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
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </div>
            );
          })}
          
          {!sidebarCollapsed && (
            <div style={styles.sectionDivider}>
              <div style={styles.sectionTitle}>SYSTEM</div>
            </div>
          )}
          
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
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </div>
            );
          })}
        </div>

        <div style={styles.footer}>
          <button style={styles.logoutBtn} onClick={handleLogout} title={sidebarCollapsed ? 'Logout' : undefined}>
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      <div style={styles.main}>
        <Outlet />
      </div>
    </div>
  );
}
