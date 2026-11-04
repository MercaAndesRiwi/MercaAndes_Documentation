import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

/* ---------------------------------------------------------------
   Home page content (English is the original language)
   --------------------------------------------------------------- */
const content = {
  en: {
    metaTitle: 'Home',
    metaDescription:
      'Technical documentation for MercaAndes, an omnichannel data platform for multi-country retail operations.',
    badge: 'Omnichannel data platform',
    titleTop: 'Connecting data.',
    titleBottom: 'Empowering decisions.',
    description:
      'Explore the technical documentation of MercaAndes, a platform that integrates and processes sales information across multiple countries in Latin America.',
    primaryButton: 'Get started',
    secondaryButton: 'About MercaAndes',
    scopeLabel: 'Project scope',
    scopeTitle: 'One region. Multiple markets.',
    countries: [
      'Colombia',
      'Peru',
      'Ecuador',
      'Bolivia',
      'Chile',
      'Brazil · Historical',
    ],
    pipelineLabel: 'How the platform works',
    pipeline: [
      {
        title: 'Data sources',
        text: 'Simulators and country datasets',
      },
      {
        title: 'Processing',
        text: 'Cleaning, validation and transformation',
      },
      {
        title: 'Services & APIs',
        text: 'Access to consolidated information',
      },
    ],
    panelFooter: 'Built for multi-country retail operations',
    stats: [
      {value: '6', label: 'Markets in scope'},
      {value: '6', label: 'Documentation sections'},
      {value: '2', label: 'Available languages'},
      {value: '1', label: 'Omnichannel platform'},
    ],
    docsEyebrow: 'Technical resources',
    docsTitle: 'Explore the documentation',
    docsDescription:
      'Find the information you need to set up, understand, and work with MercaAndes.',
    cardLink: 'Explore section',
    sections: [
      {
        icon: 'setup',
        title: 'Installation & Deployment',
        description:
          'Requirements, environment setup, and instructions to run the project.',
        to: '/docs/installation-deployment/prerequisites',
      },
      {
        icon: 'architecture',
        title: 'System Architecture',
        description:
          'Understand the system structure and how its components interact.',
        to: '/docs/architecture/overview',
      },
      {
        icon: 'database',
        title: 'Data Model & Databases',
        description:
          'Explore database organization, country schemas, and relationships.',
        to: '/docs/database/entity-relationship-model',
      },
      {
        icon: 'processing',
        title: 'Data Processing',
        description:
          'Learn about data sources, simulators, and processing workflows.',
        to: '/docs/installation-deployment/run-data-processing',
      },
      {
        icon: 'services',
        title: 'Services & APIs',
        description:
          'Discover available services, endpoints, and integration details.',
        to: '/docs/architecture/components',
      },
      {
        icon: 'testing',
        title: 'Development & Testing',
        description:
          'Review development guidelines and testing procedures.',
        to: '/docs/installation-deployment/validation-and-tests',
      },
    ],
    ctaTitle: 'Ready to get started?',
    ctaDescription:
      'Start with the installation guide and prepare your development environment.',
    ctaButton: 'Installation guide',
  },
  es: {
    metaTitle: 'Inicio',
    metaDescription:
      'Documentación técnica de MercaAndes, una plataforma de datos omnicanal para operaciones retail multipaís.',
    badge: 'Plataforma de datos omnicanal',
    titleTop: 'Conectando datos.',
    titleBottom: 'Impulsando decisiones.',
    description:
      'Explora la documentación técnica de MercaAndes, una plataforma que integra y procesa información de ventas en varios países de Latinoamérica.',
    primaryButton: 'Comenzar',
    secondaryButton: 'Sobre MercaAndes',
    scopeLabel: 'Alcance del proyecto',
    scopeTitle: 'Una región. Múltiples mercados.',
    countries: [
      'Colombia',
      'Perú',
      'Ecuador',
      'Bolivia',
      'Chile',
      'Brasil · Histórico',
    ],
    pipelineLabel: 'Cómo funciona la plataforma',
    pipeline: [
      {
        title: 'Fuentes de datos',
        text: 'Simuladores y datasets por país',
      },
      {
        title: 'Procesamiento',
        text: 'Limpieza, validación y transformación',
      },
      {
        title: 'Servicios y APIs',
        text: 'Acceso a la información consolidada',
      },
    ],
    panelFooter: 'Diseñada para operaciones retail multipaís',
    stats: [
      {value: '6', label: 'Mercados en alcance'},
      {value: '6', label: 'Secciones de documentación'},
      {value: '2', label: 'Idiomas disponibles'},
      {value: '1', label: 'Plataforma omnicanal'},
    ],
    docsEyebrow: 'Recursos técnicos',
    docsTitle: 'Explora la documentación',
    docsDescription:
      'Encuentra la información que necesitas para configurar, entender y trabajar con MercaAndes.',
    cardLink: 'Explorar sección',
    sections: [
      {
        icon: 'setup',
        title: 'Instalación y despliegue',
        description:
          'Requisitos, configuración del entorno e instrucciones para ejecutar el proyecto.',
        to: '/docs/installation-deployment/prerequisites',
      },
      {
        icon: 'architecture',
        title: 'Arquitectura del sistema',
        description:
          'Comprende la estructura del sistema y cómo interactúan sus componentes.',
        to: '/docs/architecture/overview',
      },
      {
        icon: 'database',
        title: 'Modelo de datos y bases de datos',
        description:
          'Explora la organización de las bases de datos, los esquemas por país y sus relaciones.',
        to: '/docs/database/entity-relationship-model',
      },
      {
        icon: 'processing',
        title: 'Procesamiento de datos',
        description:
          'Conoce las fuentes de datos, los simuladores y los flujos de procesamiento.',
        to: '/docs/installation-deployment/run-data-processing',
      },
      {
        icon: 'services',
        title: 'Servicios y APIs',
        description:
          'Descubre los servicios disponibles, los endpoints y los detalles de integración.',
        to: '/docs/architecture/components',
      },
      {
        icon: 'testing',
        title: 'Desarrollo y pruebas',
        description:
          'Revisa las guías de desarrollo y los procedimientos de validación.',
        to: '/docs/installation-deployment/validation-and-tests',
      },
    ],
    ctaTitle: '¿Listo para comenzar?',
    ctaDescription:
      'Empieza con la guía de instalación y prepara tu entorno de desarrollo.',
    ctaButton: 'Guía de instalación',
  },
};

/* ---------------------------------------------------------------
   Small inline icon set (no extra dependencies)
   --------------------------------------------------------------- */
function CardIcon({name}) {
  const icons = {
    setup: (
      <>
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </>
    ),
    architecture: (
      <>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </>
    ),
    processing: (
      <>
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </>
    ),
    services: (
      <>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </>
    ),
    testing: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
  };

  return (
    <svg
      className={styles.cardIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

/* ---------------------------------------------------------------
   Home page
   --------------------------------------------------------------- */
function HomePage() {
  const {i18n} = useDocusaurusContext();
  const isSpanish = i18n.currentLocale === 'es';
  const t = isSpanish ? content.es : content.en;

  return (
    <Layout title={t.metaTitle} description={t.metaDescription}>
      <main className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <svg
            className={styles.heroMountains}
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 260 L210 90 L360 220 L520 120 L720 280 L900 140 L1080 250 L1240 110 L1440 260 L1440 320 L0 320 Z"
              fill="currentColor"
              opacity="0.06"
            />
            <path
              d="M0 300 L180 190 L330 280 L520 190 L700 300 L880 210 L1060 290 L1250 200 L1440 300 L1440 320 L0 320 Z"
              fill="currentColor"
              opacity="0.1"
            />
          </svg>

          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <span className={styles.badge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {t.badge}
              </span>

              <h1>
                {t.titleTop}
                <br />
                <span className={styles.titleAccent}>{t.titleBottom}</span>
              </h1>

              <p className={styles.heroDescription}>{t.description}</p>

              <div className={styles.heroActions}>
                <Link
                  className={styles.primaryButton}
                  to="/docs/installation-deployment/prerequisites"
                >
                  {t.primaryButton}
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  className={styles.secondaryButton}
                  to="/docs/intro"
                >
                  {t.secondaryButton}
                </Link>
              </div>
            </div>

            {/* Scope and platform flow card */}
            <aside className={styles.heroPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelLabel}>{t.scopeLabel}</span>
                <span className={styles.panelStatus} aria-hidden="true" />
              </div>

              <h2>{t.scopeTitle}</h2>

              <div className={styles.countryList}>
                {t.countries.map((country) => (
                  <span className={styles.countryTag} key={country}>
                    {country}
                  </span>
                ))}
              </div>

              <div className={styles.panelDivider} />

              <p className={styles.pipelineLabel}>{t.pipelineLabel}</p>

              <ol className={styles.pipeline}>
                {t.pipeline.map((step, index) => (
                  <li className={styles.pipelineStep} key={step.title}>
                    <span className={styles.pipelineNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.pipelineText}>
                      <strong>{step.title}</strong>
                      <span>{step.text}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <p className={styles.panelFooter}>{t.panelFooter}</p>
            </aside>
          </div>
        </section>

        {/* Quick facts */}
        <section className={styles.stats} aria-label={t.docsEyebrow}>
          <div className={styles.statsGrid}>
            {t.stats.map((stat) => (
              <div className={styles.stat} key={stat.label}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Documentation navigation cards */}
        <section className={styles.documentation} id="documentation">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>{t.docsEyebrow}</span>
            <h2>{t.docsTitle}</h2>
            <p>{t.docsDescription}</p>
          </div>

          <div className={styles.sectionGrid}>
            {t.sections.map((section) => (
              <Link
                className={styles.sectionCard}
                to={section.to}
                key={section.title}
              >
                <span className={styles.sectionIcon}>
                  <CardIcon name={section.icon} />
                </span>

                <h3>{section.title}</h3>
                <p>{section.description}</p>

                <span className={styles.cardLink}>
                  {t.cardLink} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Final call to action */}
        <section className={styles.bottomBanner}>
          <div className={styles.bannerGlow} aria-hidden="true" />
          <div className={styles.bannerContent}>
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaDescription}</p>
          </div>

          <Link
            className={styles.bannerButton}
            to="/docs/installation-deployment/prerequisites"
          >
            {t.ctaButton}
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    </Layout>
  );
}

export default HomePage;
