import type { Messages } from './fa';

export const en: Messages = {
  appName: 'Document Assistant',
  appTagline: 'Answers from your documents',
  skipToContent: 'Skip to main content',
  primaryNavigation: 'Primary navigation',
  nav: {
    home: 'Home',
    chat: 'Chat',
    documents: 'Documents',
    dataSources: 'Data sources',
    settings: 'Settings',
  },
  header: {
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    theme: 'Theme',
    themeToggle: 'Change theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    language: 'Language',
    languageToggle: 'Change language',
    languageFa: 'فارسی',
    languageEn: 'English',
  },
  auth: {
    signInTitle: 'Sign in',
    signInDescription: 'Enter your username and password to continue.',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter your username',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    submit: 'Sign in',
    submitting: 'Signing in…',
    restoringSession: 'Restoring your session…',
    sessionExpiredTitle: 'Your session has ended',
    sessionExpiredDescription: 'Sign in again to continue.',
    accountMenu: 'Account menu',
    signedInAs: 'Signed in as',
    accountFallback: 'Account',
    logout: 'Sign out',
    errors: {
      usernameRequired: 'Enter your username.',
      passwordRequired: 'Enter your password.',
      invalidCredentials: 'The username or password is incorrect.',
      network: 'The server could not be reached. Check your connection and try again.',
      validation: 'The submitted details are not valid. Review the fields and try again.',
      server: 'The server is not responding right now. Try again shortly.',
      unexpected: 'Sign-in failed. Try again.',
    },
  },
  home: {
    eyebrow: 'Phase 3 — Sign-in and session',
    title: 'Sign-in and session handling are live',
    description:
      'Authentication is implemented against the existing server endpoints: sign-in, sign-out, session restore, and protected routes. Chat, document management, data sources, and settings still need server contracts.',
    statusTitle: 'What this phase sets up',
    statusItems: [
      {
        title: 'React and strict TypeScript',
        detail: 'The app is built with Vite and type checking runs in strict mode.',
      },
      {
        title: 'Routing and shared layout',
        detail: 'Primary routes are defined with React Router and the shared layout is ready.',
      },
      {
        title: 'Environment configuration',
        detail: 'The API base address and app environment are validated at startup.',
      },
      {
        title: 'Sign-in and session handling',
        detail:
          'Sign-in, sign-out, token refresh, and protected routes are implemented against the existing server contract.',
      },
      {
        title: 'Testing and code quality',
        detail: 'Vitest, Testing Library, ESLint, and Prettier are configured.',
      },
    ],
    backendTitle: 'The server connection covers authentication only',
    backendDescription:
      'This build only calls the authentication endpoints. Chat, documents, data sources, and settings still have no contract and display no data.',
    apiBaseLabel: 'API base address',
    sameOrigin: 'Same origin',
    environmentLabel: 'Environment',
  },
  features: {
    unavailableTitle: 'This section is not available yet',
    unavailableNote:
      'This section is not implemented and currently has no real data or behavior.',
    chat: {
      description:
        'The chat workspace, including history, Markdown answers, and source references, will be built once the server contract is ready.',
    },
    documents: {
      description:
        'Document upload and processing status will be built once the upload endpoint exists on the server.',
    },
    dataSources: {
      description:
        'The data source list and table schema browser will be built once the related server contracts are defined.',
    },
    settings: {
      description:
        'Model, retrieval, and embedding settings need server support; visual preferences will be added in later phases.',
    },
  },
  notFound: {
    title: 'Page not found',
    description: 'The address does not exist or has moved.',
  },
  errors: {
    unexpectedTitle: 'Unexpected error',
    unexpectedDescription: 'Something went wrong while rendering the app. Reload the page.',
    routeTitle: 'This page could not be loaded',
    routeDescription: 'Something went wrong on the requested route. You can return to the home page.',
  },
  actions: {
    reload: 'Reload',
    goHome: 'Back to home',
    retry: 'Try again',
    close: 'Close',
  },
  loading: {
    generic: 'Loading…',
  },
  footer: {
    note: 'Foundation build — no AI service connected',
    designSystem: 'Design system',
  },
  designSystem: {
    title: 'Design system',
    description:
      'A reference for the shared interface primitives. This page is static and is not part of the product navigation.',
    notice: 'This page only reviews the appearance and behavior of shared components; it has no product data or functionality.',
    buttonsTitle: 'Buttons',
    buttonsDescription: 'Button variants with a consistent size and disabled state.',
    buttonDefault: 'Default button',
    buttonSecondary: 'Secondary button',
    buttonOutline: 'Outline button',
    buttonGhost: 'Ghost button',
    buttonDestructive: 'Destructive button',
    buttonDisabled: 'Disabled',
    buttonIcon: 'Icon button',
    formTitle: 'Inputs',
    formDescription: 'A text input with a label, help text, and error state.',
    inputLabel: 'Display name',
    inputPlaceholder: 'For example, Support team',
    inputHelp: 'This name is only used for display inside the app.',
    inputInvalidLabel: 'Invalid ID',
    inputInvalidMessage: 'This value is not valid.',
    overlaysTitle: 'Overlays',
    overlaysDescription: 'Dialog, dropdown menu, and icon tooltip.',
    openDialog: 'Open dialog',
    dialogTitle: 'Dialog example',
    dialogDescription: 'This dialog stores no data and only demonstrates the appearance.',
    dialogConfirm: 'Confirm',
    dialogCancel: 'Cancel',
    tooltipLabel: 'Hover the trigger',
    tooltipContent: 'This is a short tooltip.',
    dropdownLabel: 'Example menu',
    dropdownItemOne: 'Option one',
    dropdownItemTwo: 'Option two',
    feedbackTitle: 'Feedback states',
    feedbackDescription: 'Loading, empty, and error states.',
    emptyTitle: 'Nothing has been added yet',
    emptyDescription: 'The first item will appear here once it is added.',
    emptyAction: 'Add item',
    errorTitle: 'The information could not be loaded',
    errorDescription: 'The connection failed. Check your network and try again.',
    errorAction: 'Try again',
    loadingLabel: 'Loading…',
  },
};
