/**
 * Theme constants for AdityaRaj Capital Admin Dashboard
 * Based on PRD design guidelines
 */

export const colors = {
  primary: '#1890FF',
  secondary: '#13C2C2', // Teal/Green
  success: '#52C41A',
  warning: '#FA8C16',
  error: '#F5222D',
  info: '#1890FF',
  
  // Neutral colors
  textPrimary: '#262626',
  textSecondary: '#595959',
  border: '#D9D9D9',
  background: '#FAFAFA',
  white: '#FFFFFF',
};

export const spacing = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '50%',
};

export const shadows = {
  card: '0 2px 8px rgba(0,0,0,0.1)',
  modal: '0 4px 16px rgba(0,0,0,0.2)',
  hover: '0 4px 12px rgba(0,0,0,0.15)',
};

export const typography = {
  fontFamily: {
    primary: 'system-ui, -apple-system, Arial, Helvetica, sans-serif',
  },
  fontSize: {
    h1: '32px',
    h2: '24px',
    h3: '20px',
    h4: '16px',
    body: '14px',
    small: '12px',
    caption: '10px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const layout = {
  headerHeight: '64px',
  sidebarWidth: {
    expanded: '240px',
    collapsed: '64px',
  },
  contentMaxWidth: '1400px',
  contentPadding: '24px',
};
