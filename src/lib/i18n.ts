export type Language = 'en' | 'kn';

const translations = {
  en: {
    // Header
    policyPoll: 'PolicyPoll',
    adminLogin: 'Admin Login',

    // Home
    govLabel: 'Government of Karnataka',
    heroTitle: 'Real-Time Anonymous Polling',
    heroSubtitle: 'Enhance policy discussions with instant, anonymous feedback. Structured responses, transparent outcomes.',
    joinSession: 'Join a Session',
    enterCode: 'Enter session code',
    join: 'Join',
    or: 'or',
    createSession: 'Create a New Session',
    anonymous: '100% Anonymous',
    anonymousDesc: 'No personal data collected. Session-based identifiers ensure complete privacy.',
    realTime: 'Real-Time Results',
    realTimeDesc: 'Instant aggregation and live visualization of poll responses.',
    scalable: 'Scalable',
    scalableDesc: 'Supports thousands of simultaneous participants with sub-second latency.',
    footerText: 'PolicyPoll — Real-Time Anonymous Polling for Policy Discussions',

    // Participant session
    session: 'Session',
    sessionNotFound: 'Session not found',
    goHome: 'Go Home',
    sessionEnded: 'Session Ended',
    thankYouParticipating: 'Thank you for participating in this session.',
    waitingForPoll: 'Waiting for poll...',
    waitingForPollDesc: 'The administrator will ask a question and launch the poll shortly.',
    castYourVote: 'Please cast your vote',
    yes: 'Yes',
    no: 'No',
    thankYou: 'Thank you!',
    yourVote: 'Your vote:',
    waitingNextQuestion: 'Waiting for the next question...',
    changeMind: 'Change my mind — vote',
    voteSubmitted: 'Vote submitted!',
    voteUpdated: 'Vote updated!',

    // Language
    language: 'Language',
  },
  kn: {
    // Header
    policyPoll: 'ಪಾಲಿಸಿಪೋಲ್',
    adminLogin: 'ನಿರ್ವಾಹಕ ಲಾಗಿನ್',

    // Home
    govLabel: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ',
    heroTitle: 'ನೈಜ-ಸಮಯದ ಅನಾಮಧೇಯ ಮತದಾನ',
    heroSubtitle: 'ತ್ವರಿತ, ಅನಾಮಧೇಯ ಪ್ರತಿಕ್ರಿಯೆಯೊಂದಿಗೆ ನೀತಿ ಚರ್ಚೆಗಳನ್ನು ಹೆಚ್ಚಿಸಿ. ರಚನಾತ್ಮಕ ಪ್ರತಿಕ್ರಿಯೆಗಳು, ಪಾರದರ್ಶಕ ಫಲಿತಾಂಶಗಳು.',
    joinSession: 'ಸೆಷನ್‌ಗೆ ಸೇರಿ',
    enterCode: 'ಸೆಷನ್ ಕೋಡ್ ನಮೂದಿಸಿ',
    join: 'ಸೇರಿ',
    or: 'ಅಥವಾ',
    createSession: 'ಹೊಸ ಸೆಷನ್ ರಚಿಸಿ',
    anonymous: '೧೦೦% ಅನಾಮಧೇಯ',
    anonymousDesc: 'ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ. ಸೆಷನ್-ಆಧಾರಿತ ಗುರುತುಗಳು ಸಂಪೂರ್ಣ ಗೌಪ್ಯತೆಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತವೆ.',
    realTime: 'ನೈಜ-ಸಮಯದ ಫಲಿತಾಂಶಗಳು',
    realTimeDesc: 'ಮತದಾನ ಪ್ರತಿಕ್ರಿಯೆಗಳ ತ್ವರಿತ ಒಟ್ಟುಗೂಡಿಸುವಿಕೆ ಮತ್ತು ನೇರ ದೃಶ್ಯೀಕರಣ.',
    scalable: 'ಅಳೆಯಬಹುದಾದ',
    scalableDesc: 'ಉಪ-ಸೆಕೆಂಡ್ ವಿಳಂಬದೊಂದಿಗೆ ಸಾವಿರಾರು ಏಕಕಾಲಿಕ ಭಾಗವಹಿಸುವವರನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.',
    footerText: 'ಪಾಲಿಸಿಪೋಲ್ — ನೀತಿ ಚರ್ಚೆಗಳಿಗೆ ನೈಜ-ಸಮಯದ ಅನಾಮಧೇಯ ಮತದಾನ',

    // Participant session
    session: 'ಸೆಷನ್',
    sessionNotFound: 'ಸೆಷನ್ ಕಂಡುಬಂದಿಲ್ಲ',
    goHome: 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ',
    sessionEnded: 'ಸೆಷನ್ ಮುಗಿದಿದೆ',
    thankYouParticipating: 'ಈ ಸೆಷನ್‌ನಲ್ಲಿ ಭಾಗವಹಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.',
    waitingForPoll: 'ಮತದಾನಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ...',
    waitingForPollDesc: 'ನಿರ್ವಾಹಕರು ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ ಮತದಾನವನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಪ್ರಾರಂಭಿಸುತ್ತಾರೆ.',
    castYourVote: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮತ ನೀಡಿ',
    yes: 'ಹೌದು',
    no: 'ಇಲ್ಲ',
    thankYou: 'ಧನ್ಯವಾದಗಳು!',
    yourVote: 'ನಿಮ್ಮ ಮತ:',
    waitingNextQuestion: 'ಮುಂದಿನ ಪ್ರಶ್ನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ...',
    changeMind: 'ಮನಸ್ಸು ಬದಲಾಯಿಸಿ — ಮತ',
    voteSubmitted: 'ಮತ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
    voteUpdated: 'ಮತ ನವೀಕರಿಸಲಾಗಿದೆ!',

    // Language
    language: 'ಭಾಷೆ',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

let currentLanguage: Language = 'en';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('policypoll-lang', lang);
};

export const getLanguage = (): Language => {
  const stored = localStorage.getItem('policypoll-lang') as Language | null;
  if (stored) {
    currentLanguage = stored;
    return stored;
  }
  return currentLanguage;
};

export const t = (key: TranslationKey): string => {
  return translations[getLanguage()][key] || translations.en[key] || key;
};
