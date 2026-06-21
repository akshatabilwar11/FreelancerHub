import '@testing-library/jest-dom';

// Mock react-i18next to return translation keys as readable strings for tests
import { vi } from 'vitest';
vi.mock('react-i18next', () => {
  const translations = {
    nav_login: 'Log In',
    nav_signup: 'Sign Up',
    nav_home: 'Home',
    nav_projects: 'Projects',
    nav_users: 'Users',
    nav_freelancers: 'Freelancers',
    nav_my_bids: 'My Bids',
    nav_payments: 'Payments',
    nav_messages: 'Messages',
    nav_dashboard: 'Dashboard',
    nav_logout: 'Logout',
    nav_admin: 'Admin',
    // Add other keys as needed
  };
  return {
    useTranslation: () => ({
      t: (key) => translations[key] ?? key,
      i18n: { changeLanguage: vi.fn(), language: 'en' },
    }),
  };
});
