/**
 * Centralized selectors for Blok E2E tests
 * Single source of truth for UI element selectors
 */

export const Selectors = {
  // Authentication
  auth: {
    emailInput: /email|correo/i,
    passwordInput: /password|contraseña/i,
    loginButton: /log in|iniciar sesión|sign in/i,
    signupButton: /sign up|crear cuenta|registr/i,
    forgotPasswordLink: /forgot password|olvidaste.*contraseña/i,
    magicLinkButton: /enviar enlace mágico|send magic link/i,
    logoutButton: /log out|cerrar sesión|salir/i,
  },

  // Waitlist
  waitlist: {
    openButton: /lista de espera|waitlist|reserva.*acceso|reserve.*access/i,
    nameInput: /nombre|name/i,
    emailInput: /email|correo/i,
    buildingInput: /edificio|building|condominio/i,
    phoneInput: /teléfono|phone/i,
    submitButton: /enviar|submit|join|unirse.*lista/i,
    successMessage: /gracias|thank you|success|todo listo|all set|confirmación|🎉/i,
    errorMessage: /error|already|ya.*registrado|duplicate|exists/i,
  },

  // Dashboard
  dashboard: {
    mainContent: 'main, [role="main"]',
    navigation: 'nav, [role="navigation"]',
    userMenu: '[class*="user-menu"], [class*="profile"]',
    sidebarLink: (text: string) => `nav a:has-text("${text}")`,
  },

  // Landing Page
  landing: {
    heroHeading: 'h1',
    ctaButton: /comenzar|get started|empezar/i,
    featuresSection: '[id*="feature"], [class*="feature"]',
    pricingSection: '[id*="pricing"], [class*="pricing"]',
  },

  // Common UI Elements
  common: {
    modal: '[role="dialog"], [class*="modal"]',
    closeButton: 'button[aria-label*="close"], button:has-text("×"), button:has-text("Cancelar")',
    loadingSpinner: '[class*="loading"], [class*="spinner"], [aria-busy="true"]',
    errorAlert: '[role="alert"], .text-destructive, [class*="error"]',
    successAlert: '.text-green, [class*="success"]',
    submitButton: 'button[type="submit"]',
  },

  // Forms
  forms: {
    requiredField: 'input[required], textarea[required]',
    invalidField: 'input[aria-invalid="true"], input.invalid',
    fieldError: '.field-error, .text-destructive, [class*="error"]',
  },
} as const;

/**
 * URL patterns for navigation assertions
 */
export const Routes = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  dashboard: /\/dashboard/,
  dashboardExact: '/dashboard',
  dashboardResidents: '/dashboard/residents',
  dashboardConversations: '/dashboard/conversations',
  dashboardMaintenance: '/dashboard/maintenance',
  dashboardSettings: '/dashboard/settings',
} as const;

/**
 * Test data constants
 */
export const TestData = {
  // Default test credentials from env
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'admin@demo.com',
    password: process.env.TEST_USER_PASSWORD || 'demo123',
  },

  // Sample data for testing
  sampleWaitlist: {
    name: 'QA Test User',
    building: 'Test Building',
    phone: '787-555-0100',
  },

  // Timeouts (in ms)
  timeouts: {
    short: 3000,
    medium: 5000,
    long: 10000,
    veryLong: 15000,
    networkIdle: 5000,
  },
} as const;
