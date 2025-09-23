import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Minimal namespaces for mobile app
// - navigation: tab titles and common nav items
// - auth: login/biometric labels and errors
// - common: generic labels (error, cancel, etc.)

const resources = {
  en: {
    navigation: {
      home: 'Home',
      documents: 'Documents',
      protection: 'Protection',
      profile: 'Profile',
    },
    auth: {
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      subtitle: 'Secure access to your family protection',
      biometricSupport: 'Secure authentication with biometric support',
      biometricTitle: 'Biometric Sign In',
      biometricPrompt: 'Sign in to LegacyGuard',
      biometricSubtitle: 'Use your {{method}} to securely access your account',
      faceId: 'Face ID',
      fingerprint: 'Fingerprint',
      biometric: 'Biometric',
      use: 'Use',
      usePassword: 'Use password instead',
      authenticating: 'Authenticating...',
      biometricFooter: 'Secure access with your biometric authentication',
      errors: {
        missingCredentials: 'Please enter both email and password',
        invalidCredentials: 'Invalid email or password',
        loginFailed: 'Login failed. Please try again.',
        biometricUnavailable: 'Biometric authentication is not available on this device',
        biometricFailed: 'Biometric authentication failed',
        authFailedTitle: 'Authentication Failed',
        authFailed: 'Please try again or use your password',
      }
    },
    common: {
      error: 'Error',
      cancel: 'Cancel',
    },
    screens: {
      home: {
        sectionProtectionGarden: 'Protection Garden',
        plantSeedsTitle: 'Plant Your Seeds of Protection',
        addLegacyDoc: 'Add Legacy Doc',
        strengthenShield: 'Strengthen Shield',
        gardenTitle: 'Your Garden',
        gardenGrowth: 'Recent Activity',
        securityStatus: {
          activeTitle: 'Protection Active',
          activeSubtitle: 'Your family is secure',
        },
        emotional: {
          morning: 'Good morning, {{userName}}! Ready to nurture your family\'s future?',
          afternoon: 'Good afternoon, {{userName}}! Your protection garden awaits.',
          evening: 'Good evening, {{userName}}! Time to strengthen your legacy.',
          night: 'Good night, {{userName}}! Your family rests secure.',
        },
        achievements: {
          dailyCheck: {
            title: 'Daily Guardian',
            description: 'You checked on your family\'s protection today. Your dedication shows real love.',
            shareText: 'I\'m protecting my family\'s future with LegacyGuard!',
          },
        },
        stats: {
          seedsOfProtection: 'Seeds of Protection',
          guardianCircle: 'Guardian Circle',
          familyHearts: 'Family Hearts',
          growthThisMonth: 'Growth This Month',
        },
        activity: {
          documentPlanted: '🌱 Will document planted in your garden',
          guardianJoined: '💝 New guardian joined your circle',
          shieldStrengthened: '🛡️ Protection shield strengthened',
        },
      },
      documents: {
        title: 'Documents',
        searchPlaceholder: 'Search documents...',
        yourCollection: 'Your Collection',
        stats: {
          seeds: 'Seeds Planted',
          preserved: 'Legacy Preserved',
        },
        empty: {
          title: 'No documents yet',
          subtitleDefault: 'Start building your family\'s legacy by adding your first document.',
          subtitleSearchEmpty: 'No documents match your search.',
          plantFirstSeed: 'Plant Your First Seed',
        },
        samples: {
          will: {
            name: 'Last Will & Testament',
            type: 'Legal Document',
            status: 'Protected',
          },
          insurance: {
            name: 'Life Insurance Policy',
            type: 'Insurance',
            status: 'Active',
          },
          property: {
            name: 'Property Deed',
            type: 'Real Estate',
            status: 'Verified',
          },
          photos: {
            name: 'Family Photos Archive',
            type: 'Personal',
            status: 'Backed Up',
          },
        },
      },
      profile: {
        title: 'Profile',
        role: 'Family Guardian',
        statusActive: 'Active Guardian',
        credentials: 'Account Information',
        settings: 'Settings',
        appInfo: {
          name: 'LegacyGuard',
          version: 'Version 1.0.0',
        },
        signOut: {
          title: 'Sign Out',
          message: 'Are you sure you want to sign out?',
          cancel: 'Cancel',
          confirm: 'Sign Out',
        },
        menu: {
          accountSettings: {
            title: 'Account Settings',
            subtitle: 'Manage your personal information',
          },
          notifications: {
            title: 'Notifications',
            subtitle: 'Configure alerts and updates',
          },
          privacySecurity: {
            title: 'Privacy & Security',
            subtitle: 'Manage security settings',
          },
          helpSupport: {
            title: 'Help & Support',
            subtitle: 'Get help and contact support',
          },
        },
        userInfo: {
          email: 'Email',
          phone: 'Phone',
          memberSince: 'Member Since',
          noEmail: 'No email provided',
          noPhone: 'No phone provided',
          unknown: 'Unknown',
        },
        appDescription: 'Protecting your family\'s legacy with love, security, and peace of mind',
        sofiaMessage: 'Sofia\'s light guides your personal journey ✨',
      },
      protection: {
        title: 'Protection',
        status: {
          activeTitle: 'Protection Active',
          activeSubtitle: 'Your family is fully protected',
          completion: '85% Protection Complete',
        },
        arsenal: 'Protection Arsenal',
        controls: 'Security Controls',
        wisdom: {
          title: 'Guardian Wisdom',
          tip: 'True protection comes not from locks, but from the love and preparation you show your family.',
        },
        labels: {
          alerts: 'Security Alerts',
          alertsDesc: 'Receive notifications about protection status',
          preservation: 'Auto Preservation',
          preservationDesc: 'Automatically backup important documents',
          vaultLock: 'Vault Lock',
          vaultLockDesc: 'Require biometric authentication for access',
        },
        features: {
          documentEncryption: {
            title: 'Document Encryption',
            description: 'All documents are encrypted with AES-256',
          },
          familyAccessControl: {
            title: 'Family Access Control',
            description: '4 family members with managed permissions',
          },
          automaticBackup: {
            title: 'Automatic Backup',
            description: 'Daily backups to secure cloud storage',
          },
          mobileSecurity: {
            title: 'Mobile Security',
            description: 'App lock and biometric authentication',
          },
        },
        actions: {
          manageFamilyCircle: 'Manage Family Circle',
          viewProtectionReport: 'View Protection Report',
          updateGuardianKey: 'Update Guardian Key',
        },
        statusTypes: {
          active: 'Active',
          partial: 'Partial',
          inactive: 'Inactive',
        },
      },
    },
  },
  cs: {
    navigation: {
      home: 'Domů',
      documents: 'Dokumenty',
      protection: 'Ochrana',
      profile: 'Profil',
    },
    auth: {
      signIn: 'Přihlásit se',
      signingIn: 'Přihlašování...',
      email: 'Email',
      emailPlaceholder: 'Zadejte svůj email',
      password: 'Heslo',
      passwordPlaceholder: 'Zadejte heslo',
      showPassword: 'Zobrazit heslo',
      hidePassword: 'Skrýt heslo',
      subtitle: 'Bezpečný přístup k ochraně vaší rodiny',
      biometricSupport: 'Bezpečné ověření pomocí biometrie',
      biometricTitle: 'Biometrické přihlášení',
      biometricPrompt: 'Přihlaste se do LegacyGuard',
      biometricSubtitle: 'Použijte {{method}} pro bezpečný přístup k účtu',
      faceId: 'Face ID',
      fingerprint: 'Otisk prstu',
      biometric: 'Biometrie',
      use: 'Použít',
      usePassword: 'Použít heslo místo toho',
      authenticating: 'Ověřování...',
      biometricFooter: 'Bezpečný přístup pomocí biometrického ověření',
      errors: {
        missingCredentials: 'Zadejte prosím email a heslo',
        invalidCredentials: 'Neplatný email nebo heslo',
        loginFailed: 'Přihlášení se nezdařilo. Zkuste to znovu.',
        biometricUnavailable: 'Biometrické ověření není na tomto zařízení dostupné',
        biometricFailed: 'Biometrické ověření se nezdařilo',
        authFailedTitle: 'Ověření se nezdařilo',
        authFailed: 'Zkuste to znovu nebo použijte heslo',
      }
    },
    common: {
      error: 'Chyba',
      cancel: 'Zrušit',
    },
    screens: {
      home: {
        sectionProtectionGarden: 'Zahrada ochrany',
        plantSeedsTitle: 'Zasaďte semínka ochrany',
        addLegacyDoc: 'Přidat dokument odkazu',
        strengthenShield: 'Posílit štít',
        gardenTitle: 'Vaše zahrada',
        gardenGrowth: 'Nedávná aktivita',
        securityStatus: {
          activeTitle: 'Ochrana aktivní',
          activeSubtitle: 'Vaše rodina je chráněna',
        },
        emotional: {
          morning: 'Dobré ráno, {{userName}}! Připraven zasadit budoucnost vaší rodiny?',
          afternoon: 'Dobré odpoledne, {{userName}}! Vaše zahrada ochrany čeká.',
          evening: 'Dobrý večer, {{userName}}! Čas posílit váš odkaz.',
          night: 'Dobrou noc, {{userName}}! Vaše rodina spí v bezpečí.',
        },
        achievements: {
          dailyCheck: {
            title: 'Denní strážce',
            description: 'Dnes jste zkontrolovali ochranu vaší rodiny. Vaše oddanost ukazuje skutečnou lásku.',
            shareText: 'Chráním budoucnost své rodiny s LegacyGuard!',
          },
        },
        stats: {
          seedsOfProtection: 'Zasazená semínka',
          guardianCircle: 'Kruh strážců',
          familyHearts: 'Rodinná srdce',
          growthThisMonth: 'Růst tento měsíc',
        },
        activity: {
          documentPlanted: '🌱 Dokument odkazu zasazen do vaší zahrady',
          guardianJoined: '💝 Nový strážce se připojil k vašemu kruhu',
          shieldStrengthened: '🛡️ Štít ochrany posílen',
        },
      },
      documents: {
        title: 'Dokumenty',
        searchPlaceholder: 'Hledat dokumenty...',
        yourCollection: 'Vaše sbírka',
        stats: {
          seeds: 'Zasazená semínka',
          preserved: 'Odkaz zachován',
        },
        empty: {
          title: 'Zatím žádné dokumenty',
          subtitleDefault: 'Začněte budovat odkaz vaší rodiny přidáním prvního dokumentu.',
          subtitleSearchEmpty: 'Žádné dokumenty nevyhovují vašemu hledání.',
          plantFirstSeed: 'Zasaďte první semínko',
        },
        samples: {
          will: {
            name: 'Poslední vůle a závěť',
            type: 'Právní dokument',
            status: 'Chráněno',
          },
          insurance: {
            name: 'Pojištění života',
            type: 'Pojištění',
            status: 'Aktivní',
          },
          property: {
            name: 'Vlastnický list',
            type: 'Nemovitost',
            status: 'Ověřeno',
          },
          photos: {
            name: 'Archiv rodinných fotografií',
            type: 'Osobní',
            status: 'Zálohováno',
          },
        },
      },
      profile: {
        title: 'Profil',
        role: 'Strážce rodiny',
        statusActive: 'Aktivní strážce',
        credentials: 'Informace o účtu',
        settings: 'Nastavení',
        appInfo: {
          name: 'LegacyGuard',
          version: 'Verze 1.0.0',
        },
        appDescription: 'Chráníme odkaz vaší rodiny s láskou, bezpečností a klidem.',
        sofiaMessage: 'Sofia světlo vede vaši osobní cestu ✨',
        signOut: {
          title: 'Odhlásit se',
          message: 'Opravdu se chcete odhlásit?',
          cancel: 'Zrušit',
          confirm: 'Odhlásit se',
        },
        menu: {
          accountSettings: {
            title: 'Nastavení účtu',
            subtitle: 'Spravujte své osobní informace',
          },
          notifications: {
            title: 'Oznámení',
            subtitle: 'Konfigurujte upozornění a aktualizace',
          },
          privacySecurity: {
            title: 'Soukromí a bezpečnost',
            subtitle: 'Spravujte nastavení bezpečnosti',
          },
          helpSupport: {
            title: 'Nápověda a podpora',
            subtitle: 'Získejte pomoc a kontaktujte podporu',
          },
        },
        userInfo: {
          email: 'Email',
          phone: 'Telefon',
          memberSince: 'Člen od',
          noEmail: 'Nezadán email',
          noPhone: 'Nezadán telefon',
          unknown: 'Neznámé',
        },
      },
      protection: {
        title: 'Ochrana',
        status: {
          activeTitle: 'Ochrana aktivní',
          activeSubtitle: 'Vaše rodina je plně chráněna',
          completion: '85% dokončení ochrany',
        },
        arsenal: 'Arzenál ochrany',
        controls: 'Ovládací prvky bezpečnosti',
        wisdom: {
          title: 'Moudrost strážce',
          tip: 'Pravá ochrana nepramení z zámků, ale z lásky a přípravy, kterou ukazujete své rodině.',
        },
        labels: {
          alerts: 'Bezpečnostní upozornění',
          alertsDesc: 'Přijímejte oznámení o stavu ochrany',
          preservation: 'Automatické zachování',
          preservationDesc: 'Automaticky zálohujte důležité dokumenty',
          vaultLock: 'Zámek trezoru',
          vaultLockDesc: 'Vyžadovat biometrické ověření pro přístup',
        },
        features: {
          documentEncryption: {
            title: 'Šifrování dokumentů',
            description: 'Všechny dokumenty jsou šifrovány pomocí AES-256',
          },
          familyAccessControl: {
            title: 'Řízení přístupu rodiny',
            description: '4 členové rodiny se spravovanými oprávněními',
          },
          automaticBackup: {
            title: 'Automatické zálohování',
            description: 'Denní zálohy do bezpečného cloudového úložiště',
          },
          mobileSecurity: {
            title: 'Mobilní bezpečnost',
            description: 'Zámek aplikace a biometrické ověření',
          },
        },
        actions: {
          manageFamilyCircle: 'Spravovat rodinný kruh',
          viewProtectionReport: 'Zobrazit zprávu o ochraně',
          updateGuardianKey: 'Aktualizovat klíč strážce',
        },
        statusTypes: {
          active: 'Aktivní',
          partial: 'Částečný',
          inactive: 'Neaktivní',
        },
      },
    },
  },
  sk: {
    navigation: {
      home: 'Domov',
      documents: 'Dokumenty',
      protection: 'Ochrana',
      profile: 'Profil',
    },
    auth: {
      signIn: 'Prihlásiť sa',
      signingIn: 'Prihlasovanie...',
      email: 'Email',
      emailPlaceholder: 'Zadajte svoj email',
      password: 'Heslo',
      passwordPlaceholder: 'Zadajte heslo',
      showPassword: 'Zobraziť heslo',
      hidePassword: 'Skryť heslo',
      subtitle: 'Bezpečný prístup k ochrane vašej rodiny',
      biometricSupport: 'Bezpečné overenie pomocou biometrie',
      biometricTitle: 'Biometrické prihlásenie',
      biometricPrompt: 'Prihláste sa do LegacyGuard',
      biometricSubtitle: 'Použite {{method}} pre bezpečný prístup k účtu',
      faceId: 'Face ID',
      fingerprint: 'Odtlačok prsta',
      biometric: 'Biometria',
      use: 'Použiť',
      usePassword: 'Použiť heslo namiesto toho',
      authenticating: 'Overovanie...',
      biometricFooter: 'Bezpečný prístup pomocou biometrického overenia',
      errors: {
        missingCredentials: 'Zadajte prosím email a heslo',
        invalidCredentials: 'Neplatný email alebo heslo',
        loginFailed: 'Prihlásenie sa nepodarilo. Skúste to znovu.',
        biometricUnavailable: 'Biometrické overenie nie je na tomto zariadení dostupné',
        biometricFailed: 'Biometrické overenie sa nepodarilo',
        authFailedTitle: 'Overenie sa nepodarilo',
        authFailed: 'Skúste to znovu alebo použite heslo',
      }
    },
    common: {
      error: 'Chyba',
      cancel: 'Zrušiť',
    },
    screens: {
      home: {
        sectionProtectionGarden: 'Záhrada ochrany',
        plantSeedsTitle: 'Zasaďte semená ochrany',
        addLegacyDoc: 'Pridať dokument odkazu',
        strengthenShield: 'Posilniť štít',
        gardenTitle: 'Vaša záhrada',
        gardenGrowth: 'Nedávna aktivita',
        securityStatus: {
          activeTitle: 'Ochrana aktívna',
          activeSubtitle: 'Vaša rodina je chránená',
        },
        emotional: {
          morning: 'Dobré ráno, {{userName}}! Pripravený zasadiť budúcnosť vašej rodiny?',
          afternoon: 'Dobré popoludnie, {{userName}}! Vaša záhrada ochrany čaká.',
          evening: 'Dobrý večer, {{userName}}! Čas posilniť váš odkaz.',
          night: 'Dobrú noc, {{userName}}! Vaša rodina spí v bezpečí.',
        },
        achievements: {
          dailyCheck: {
            title: 'Denný strážca',
            description: 'Dnes ste skontrolovali ochranu vašej rodiny. Vaša oddanosť ukazuje skutočnú lásku.',
            shareText: 'Chránim budúcnosť svojej rodiny s LegacyGuard!',
          },
        },
        stats: {
          seedsOfProtection: 'Zasadené semená',
          guardianCircle: 'Kruh strážcov',
          familyHearts: 'Rodinné srdcia',
          growthThisMonth: 'Rast tento mesiac',
        },
        activity: {
          documentPlanted: '🌱 Dokument odkazu zasadený do vašej záhrady',
          guardianJoined: '💝 Nový strážca sa pripojil k vášmu kruhu',
          shieldStrengthened: '🛡️ Štít ochrany posilnený',
        },
      },
      documents: {
        title: 'Dokumenty',
        searchPlaceholder: 'Hľadať dokumenty...',
        yourCollection: 'Vaša zbierka',
        stats: {
          seeds: 'Zasadené semená',
          preserved: 'Odkaz zachovaný',
        },
        empty: {
          title: 'Zatiaľ žiadne dokumenty',
          subtitleDefault: 'Začnite budovať odkaz vašej rodiny pridaním prvého dokumentu.',
          subtitleSearchEmpty: 'Žiadne dokumenty nevyhovujú vášmu hľadaniu.',
          plantFirstSeed: 'Zasaďte prvé semeno',
        },
        samples: {
          will: {
            name: 'Posledná vôľa a testament',
            type: 'Právny dokument',
            status: 'Chránené',
          },
          insurance: {
            name: 'Životné poistenie',
            type: 'Poistenie',
            status: 'Aktívne',
          },
          property: {
            name: 'Vlastnícky list',
            type: 'Nehnuteľnosť',
            status: 'Overené',
          },
          photos: {
            name: 'Archív rodinných fotografií',
            type: 'Osobné',
            status: 'Zálohované',
          },
        },
      },
      profile: {
        title: 'Profil',
        role: 'Strážca rodiny',
        statusActive: 'Aktívny strážca',
        credentials: 'Informácie o účte',
        settings: 'Nastavenia',
        appInfo: {
          name: 'LegacyGuard',
          version: 'Verzia 1.0.0',
        },
        appDescription: 'Chránime odkaz vašej rodiny s láskou, bezpečnosťou a pokojom.',
        sofiaMessage: 'Sofia svetlo vedie vašu osobnú cestu ✨',
        signOut: {
          title: 'Odhlásiť sa',
          message: 'Naozaj sa chcete odhlásiť?',
          cancel: 'Zrušiť',
          confirm: 'Odhlásiť sa',
        },
        menu: {
          accountSettings: {
            title: 'Nastavenia účtu',
            subtitle: 'Spravujte svoje osobné informácie',
          },
          notifications: {
            title: 'Oznámenia',
            subtitle: 'Konfigurujte upozornenia a aktualizácie',
          },
          privacySecurity: {
            title: 'Súkromie a bezpečnosť',
            subtitle: 'Spravujte nastavenia bezpečnosti',
          },
          helpSupport: {
            title: 'Pomoc a podpora',
            subtitle: 'Získajte pomoc a kontaktujte podporu',
          },
        },
        userInfo: {
          email: 'Email',
          phone: 'Telefón',
          memberSince: 'Člen od',
          noEmail: 'Nezadaný email',
          noPhone: 'Nezadaný telefón',
          unknown: 'Neznáme',
        },
      },
      protection: {
        title: 'Ochrana',
        status: {
          activeTitle: 'Ochrana aktívna',
          activeSubtitle: 'Vaša rodina je plne chránená',
          completion: '85% dokončenie ochrany',
        },
        arsenal: 'Arzenál ochrany',
        controls: 'Ovládacie prvky bezpečnosti',
        wisdom: {
          title: 'Múdrosť strážcu',
          tip: 'Pravá ochrana nepramení z zámkov, ale z lásky a prípravy, ktorú ukazujete svojej rodine.',
        },
        labels: {
          alerts: 'Bezpečnostné upozornenia',
          alertsDesc: 'Prijímajte oznámenia o stave ochrany',
          preservation: 'Automatické zachovanie',
          preservationDesc: 'Automaticky zálohujte dôležité dokumenty',
          vaultLock: 'Zámok trezoru',
          vaultLockDesc: 'Vyžadovať biometrické overenie pre prístup',
        },
        features: {
          documentEncryption: {
            title: 'Šifrovanie dokumentov',
            description: 'Všetky dokumenty sú šifrované pomocou AES-256',
          },
          familyAccessControl: {
            title: 'Riadenie prístupu rodiny',
            description: '4 členovia rodiny so spravovanými oprávneniami',
          },
          automaticBackup: {
            title: 'Automatické zálohovanie',
            description: 'Denné zálohy do bezpečného cloudového úložiska',
          },
          mobileSecurity: {
            title: 'Mobilná bezpečnosť',
            description: 'Zámok aplikácie a biometrické overenie',
          },
        },
        actions: {
          manageFamilyCircle: 'Spravovať rodinný kruh',
          viewProtectionReport: 'Zobraziť správu o ochrane',
          updateGuardianKey: 'Aktualizovať kľúč strážcu',
        },
        statusTypes: {
          active: 'Aktívne',
          partial: 'Čiastočné',
          inactive: 'Neaktívne',
        },
      },
    },
  },
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'navigation', 'auth', 'screens'],
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  })

export default i18n
