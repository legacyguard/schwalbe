import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    common: {
      signIn: 'Sign In',
      getStarted: 'Get Started Free',
      startYourJourney: 'Start Your Journey',
      learnMore: 'Learn More',
      error: 'Error',
      cancel: 'Cancel',
      navigation: {
        dashboard: 'Dashboard',
        documents: 'Documents',
        onboarding: 'Onboarding',
      },
      footer: {
        copyright: '2025 LegacyGuard. Securely guide your family forward.',
      },
    },
    landing: {
      hero: {
        title: 'Your Legacy<br>is a Story',
        subtitle: 'Let\'s Make it a Legend',
        description: 'Begin your journey with Sofia, your personal guide. Transform uncertainty into peace of mind as you build a garden of protection for those you love.',
        ctaStartJourney: 'Start Your Journey',
        ctaLearnMore: 'Learn More',
        sofiaWelcome: 'Welcome to your journey of protection and peace.',
        sofiaInvitation: 'Shall we begin building your legacy together?',
      },
      navigation: {
        brand: 'LegacyGuard',
        signIn: 'Sign In',
        getStarted: 'Get Started Free',
      },
      features: {
        title: 'Your Path to Peace of Mind',
        subtitle: 'Three acts of your journey, each designed to transform uncertainty into confidence.',
        act1: {
          title: 'Act I: The Invitation',
          subtitle: 'First 5 minutes',
          description: 'Meet Sofia and discover the Box of Certainty. Transform curiosity into trust as you begin your journey.',
        },
        act2: {
          title: 'Act II: Building Your Fortress',
          subtitle: 'First week',
          description: 'Create your Circle of Trust and watch your Garden of Legacy bloom with each protective step.',
        },
        act3: {
          title: 'Act III: Your Eternal Legacy',
          subtitle: 'First month & beyond',
          description: 'Record your voice for the future and complete the ritual of protection. Your legacy is secure.',
        },
      },
      security: {
        title: 'Your Trust, Our Promise',
        subtitle: 'We understand you\'re entrusting us with your most important information. Here\'s how we protect what matters most to you.',
        bankLevel: {
          title: 'Bank-Level Encryption',
          description: 'Your data is protected with 256-bit AES encryption, the same standard used by banks worldwide.',
        },
        zeroKnowledge: {
          title: 'Zero-Knowledge Architecture',
          description: 'We can\'t see your data even if we wanted to. Your information is encrypted before it leaves your device.',
        },
        soc2: {
          title: 'SOC 2 Type II Certified',
          description: 'Independently audited and certified for security, availability, and confidentiality.',
        },
        monitoring: {
          title: '24/7 Security Monitoring',
          description: 'Our security team monitors threats around the clock to keep your legacy safe.',
        },
        learnMore: 'Learn more about our security practices',
      },
      pricing: {
        title: 'Choose Your Legacy Plan',
        subtitle: 'Start free and upgrade as your needs grow. Every plan includes bank-level security and our commitment to protecting your digital legacy.',
        free: {
          name: 'Free',
          price: '$0',
          period: 'forever',
          description: 'Perfect for getting started with digital organization',
          cta: 'Start Free',
          features: [
            'Organize up to 50 documents',
            'Basic estate planning tools',
            '1 emergency contact',
            'Secure cloud storage',
            'Email support'
          ],
        },
        premium: {
          name: 'Premium',
          price: '4€',
          period: 'month',
          description: 'Everything you need for complete legacy protection',
          cta: 'Start Premium',
          featured: 'Most Popular',
          features: [
            'Unlimited documents',
            'Advanced estate planning',
            'Unlimited emergency contacts',
            'Sofia AI assistant',
            'Priority support',
            'Digital legacy vault',
            'Automatic updates to beneficiaries'
          ],
        },
        family: {
          name: 'Family',
          price: '9€',
          period: 'month',
          description: 'Protect your entire family\'s digital legacy',
          cta: 'Protect Family',
          features: [
            'Everything in Premium',
            'Up to 6 family members',
            'Family collaboration tools',
            'Shared document vault',
            'Family emergency protocols',
            'Dedicated family support',
            'Multi-generational planning'
          ],
        },
        guarantee: '🔒 All plans include 256-bit encryption and SOC 2 Type II compliance',
        terms: 'No setup fees • Cancel anytime • 30-day money-back guarantee',
      },
    },
  },
  cs: {
    common: {
      signIn: 'Přihlásit se',
      getStarted: 'Začít zdarma',
      startYourJourney: 'Začít vaši cestu',
      learnMore: 'Zjistit více',
      error: 'Chyba',
      cancel: 'Zrušit',
      navigation: {
        dashboard: 'Nástěnka',
        documents: 'Dokumenty',
        onboarding: 'Průvodce',
      },
      footer: {
        copyright: '2025 LegacyGuard. Bezpečně veďte svou rodinu kupředu.',
      },
    },
    landing: {
      hero: {
        title: 'Vaše dědictví<br>je příběh',
        subtitle: 'Udělejme z něj legendu',
        description: 'Začněte svou cestu se Sofií, vaší osobní průvodkyní. Proměňte nejistotu v klid duše při budování zahrady ochrany pro ty, které milujete.',
        ctaStartJourney: 'Začít vaši cestu',
        ctaLearnMore: 'Zjistit více',
        sofiaWelcome: 'Vítejte na vaší cestě ochrany a klidu.',
        sofiaInvitation: 'Můžeme společně začít budovat váš odkaz?',
      },
      navigation: {
        brand: 'LegacyGuard',
        signIn: 'Přihlásit se',
        getStarted: 'Začít zdarma',
      },
      features: {
        title: 'Vaše cesta ke klidu duše',
        subtitle: 'Tři dějství vaší cesty, každé navrženo k proměně nejistoty v sebevědomí.',
        act1: {
          title: 'Dějství I: Pozvání',
          subtitle: 'Prvních 5 minut',
          description: 'Seznamte se se Sofií a objevte Krabici jistoty. Proměňte zvědavost v důvěru při začátku vaší cesty.',
        },
        act2: {
          title: 'Dějství II: Budování vaší pevnosti',
          subtitle: 'První týden',
          description: 'Vytvořte svůj Kruh důvěry a sledujte, jak vaše Zahrada odkazu kvete s každým ochranným krokem.',
        },
        act3: {
          title: 'Dějství III: Váš věčný odkaz',
          subtitle: 'První měsíc a dále',
          description: 'Nahrajte svůj hlas pro budoucnost a dokončete rituál ochrany. Váš odkaz je bezpečný.',
        },
      },
      security: {
        title: 'Vaše důvěra, náš slib',
        subtitle: 'Chápeme, že nám svěřujete své nejdůležitější informace. Zde je, jak chráníme to, na čem vám nejvíce záleží.',
        bankLevel: {
          title: 'Šifrování bankovní úrovně',
          description: 'Vaše data jsou chráněna 256bitovým AES šifrováním, stejným standardem, který používají banky po celém světě.',
        },
        zeroKnowledge: {
          title: 'Architektura nulového poznání',
          description: 'Nemůžeme vidět vaše data, ani kdybychom chtěli. Vaše informace jsou zašifrovány dříve, než opustí vaše zařízení.',
        },
        soc2: {
          title: 'SOC 2 Type II certifikace',
          description: 'Nezávisle auditováno a certifikováno pro bezpečnost, dostupnost a důvěrnost.',
        },
        monitoring: {
          title: 'Bezpečnostní monitoring 24/7',
          description: 'Náš bezpečnostní tým monitoruje hrozby nepřetržitě, aby udržel váš odkaz v bezpečí.',
        },
        learnMore: 'Zjistit více o našich bezpečnostních postupech',
      },
      pricing: {
        title: 'Vyberte si svůj plán odkazu',
        subtitle: 'Začněte zdarma a upgradujte podle růstu vašich potřeb. Každý plán zahrnuje bankovní úroveň zabezpečení a náš závazek chránit váš digitální odkaz.',
        free: {
          name: 'Zdarma',
          price: '0 Kč',
          period: 'navždy',
          description: 'Perfektní pro začátek s digitální organizací',
          cta: 'Začít zdarma',
          features: [
            'Organizujte až 50 dokumentů',
            'Základní nástroje pro plánování odkazu',
            '1 nouzový kontakt',
            'Bezpečné cloudové úložiště',
            'E-mailová podpora'
          ],
        },
        premium: {
          name: 'Premium',
          price: '100 Kč',
          period: 'měsíc',
          description: 'Vše, co potřebujete pro kompletní ochranu odkazu',
          cta: 'Začít Premium',
          featured: 'Nejpopulárnější',
          features: [
            'Neomezené dokumenty',
            'Pokročilé plánování odkazu',
            'Neomezené nouzové kontakty',
            'Sofia AI asistentka',
            'Prioritní podpora',
            'Digitální trezor odkazu',
            'Automatické aktualizace pro příjemce'
          ],
        },
        family: {
          name: 'Rodina',
          price: '225 Kč',
          period: 'měsíc',
          description: 'Chraňte digitální odkaz celé vaší rodiny',
          cta: 'Chránit rodinu',
          features: [
            'Vše z Premium',
            'Až 6 členů rodiny',
            'Nástroje pro rodinnou spolupráci',
            'Sdílený trezor dokumentů',
            'Rodinné nouzové protokoly',
            'Věnovaná rodinná podpora',
            'Plánování pro více generací'
          ],
        },
        guarantee: '🔒 Všechny plány zahrnují 256bitové šifrování a SOC 2 Type II shodu',
        terms: 'Žádné poplatky za nastavení • Zrušte kdykoli • 30denní záruka vrácení peněz',
      },
    },
  },
  sk: {
    common: {
      signIn: 'Prihlásiť sa',
      getStarted: 'Začať zdarma',
      startYourJourney: 'Začať vašu cestu',
      learnMore: 'Zistiť viac',
      error: 'Chyba',
      cancel: 'Zrušiť',
      navigation: {
        dashboard: 'Nástenka',
        documents: 'Dokumenty',
        onboarding: 'Sprievodca',
      },
      footer: {
        copyright: '2025 LegacyGuard. Bezpečne veďte svoju rodinu dopredu.',
      },
    },
    landing: {
      hero: {
        title: 'Vaše dedičstvo<br>je príbeh',
        subtitle: 'Urobme z neho legendu',
        description: 'Začnite svoju cestu so Sofiou, vašou osobnou sprievodkyňou. Premeňte neistotu na pokoj duše pri budovaní záhrady ochrany pre tých, ktorých milujete.',
        ctaStartJourney: 'Začať vašu cestu',
        ctaLearnMore: 'Zistiť viac',
        sofiaWelcome: 'Vitajte na vašej ceste ochrany a pokoja.',
        sofiaInvitation: 'Môžeme spoločne začať budovať váš odkaz?',
      },
      navigation: {
        brand: 'LegacyGuard',
        signIn: 'Prihlásiť sa',
        getStarted: 'Začať zdarma',
      },
      features: {
        title: 'Vaša cesta k pokoju duše',
        subtitle: 'Tri dejstvá vašej cesty, každé navrhnuté na premenu neistoty na sebavedomie.',
        act1: {
          title: 'Dejstvo I: Pozvanie',
          subtitle: 'Prvých 5 minút',
          description: 'Zoznámte sa so Sofiou a objavte Krabicu istoty. Premeňte zvedavosť na dôveru pri začiatku vašej cesty.',
        },
        act2: {
          title: 'Dejstvo II: Budovanie vašej pevnosti',
          subtitle: 'Prvý týždeň',
          description: 'Vytvorte svoj Kruh dôvery a sledujte, ako vaša Záhrada odkazu kvitne s každým ochranným krokom.',
        },
        act3: {
          title: 'Dejstvo III: Váš večný odkaz',
          subtitle: 'Prvý mesiac a ďalej',
          description: 'Nahrajte svoj hlas pre budúcnosť a dokončite rituál ochrany. Váš odkaz je bezpečný.',
        },
      },
      security: {
        title: 'Vaša dôvera, náš sľub',
        subtitle: 'Chápeme, že nám zverujete svoje najdôležitejšie informácie. Tu je, ako chránime to, na čom vám najviac záleží.',
        bankLevel: {
          title: 'Šifrovanie bankovej úrovne',
          description: 'Vaše dáta sú chránené 256-bitovým AES šifrovaním, rovnakým štandardom, ktorý používajú banky po celom svete.',
        },
        zeroKnowledge: {
          title: 'Architektúra nulovej znalosti',
          description: 'Nemôžeme vidieť vaše dáta, ani keby sme chceli. Vaše informácie sú zašifrované skôr, ako opustia vaše zariadenie.',
        },
        soc2: {
          title: 'SOC 2 Type II certifikácia',
          description: 'Nezávisle auditované a certifikované pre bezpečnosť, dostupnosť a dôvernosť.',
        },
        monitoring: {
          title: 'Bezpečnostný monitoring 24/7',
          description: 'Náš bezpečnostný tím monitoruje hrozby nepretržite, aby udržal váš odkaz v bezpečí.',
        },
        learnMore: 'Zistiť viac o našich bezpečnostných postupoch',
      },
      pricing: {
        title: 'Vyberte si svoj plán odkazu',
        subtitle: 'Začnite zdarma a upgradujte podľa rastu vašich potrieb. Každý plán zahŕňa bankovú úroveň zabezpečenia a náš záväzok chrániť váš digitálny odkaz.',
        free: {
          name: 'Zdarma',
          price: '0 €',
          period: 'navždy',
          description: 'Perfektné pre začiatok s digitálnou organizáciou',
          cta: 'Začať zdarma',
          features: [
            'Organizujte až 50 dokumentov',
            'Základné nástroje pre plánovanie odkazu',
            '1 núdzový kontakt',
            'Bezpečné cloudové úložisko',
            'E-mailová podpora'
          ],
        },
        premium: {
          name: 'Premium',
          price: '4 €',
          period: 'mesiac',
          description: 'Všetko, co potrebujete pre kompletnu ochranu odkazu',
          cta: 'Začať Premium',
          featured: 'Najpopulárnejší',
          features: [
            'Neobmedzené dokumenty',
            'Pokročilé plánovanie odkazu',
            'Neobmedzené núdzové kontakty',
            'Sofia AI asistentka',
            'Prioritná podpora',
            'Digitálny trezor odkazu',
            'Automatické aktualizácie pre príjemcov'
          ],
        },
        family: {
          name: 'Rodina',
          price: '9 €',
          period: 'mesiac',
          description: 'Chráňte digitálny odkaz celej vašej rodiny',
          cta: 'Chrániť rodinu',
          features: [
            'Všetko z Premium',
            'Až 6 členov rodiny',
            'Nástroje pre rodinnú spoluprácu',
            'Zdieľaný trezor dokumentov',
            'Rodinné núdzové protokoly',
            'Venovaná rodinná podpora',
            'Plánovanie pre viac generácií'
          ],
        },
        guarantee: '🔒 Všetky plány zahŕňajú 256-bitové šifrovanie a SOC 2 Type II zhodu',
        terms: 'Žiadne poplatky za nastavenie • Zrušte kedykoľvek • 30-dňová záruka vrátenia peňazí',
      },
    },
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'landing',
    ns: ['landing', 'common'],
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;