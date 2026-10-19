import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

const countries = [
  'Colombia',
  'Peru',
  'Ecuador',
  'Bolivia',
  'Chile',
  'Brazil · Historical',
];

const sections = [
  {
    title: 'Installation & Deployment',
    description:
      'Requirements, environment setup, and instructions to run the project.',
    icon: '⚙',
    to: '/docs/installation-deployment/prerequisites',
  },
  {
    title: 'System Architecture',
    description:
      'Understand the system structure and how its components interact.',
    icon: '◇',
    to: '/docs/architecture/overview',
  },
  {
    title: 'Data Model & Databases',
    description:
      'Explore database organization, country schemas, and relationships.',
    icon: '▤',
    to: '/docs/database/entity-relationship-model',
  },
  {
    title: 'Data Processing',
    description:
      'Learn about data sources, simulators, and processing workflows.',
    icon: '⇄',
    to: '/docs/installation-deployment/run-data-processing',
  },
  {
    title: 'Services & APIs',
    description:
      'Discover available services, endpoints, and integration details.',
    icon: '</>',
    to: '/docs/architecture/components',
  },
  {
    title: 'Development & Testing',
    description:
      'Review development guidelines and testing procedures.',
    icon: '✓',
    to: '/docs/installation-deployment/validation-and-tests',
  },
];

function HomePage() {
  return (
    <Layout
      title="Home"
      description="Technical documentation for the MercaAndes project."
    >
      <main>
        {/* Main hero section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              OMNICHANNEL DATA PLATFORM
            </span>

            <h1>
              Connecting data.
              <br />
              Empowering decisions.
            </h1>

            <p className={styles.heroDescription}>
              Explore the technical documentation of MercaAndes,
              a project focused on integrating and processing sales
              data across multiple countries.
            </p>

            <div className={styles.heroActions}>
              <Link
                className={styles.primaryButton}
                to="/docs/installation-deployment/prerequisites"
              >
                Get started <span aria-hidden="true">→</span>
              </Link>

              <Link
                className={styles.secondaryButton}
                to="/docs/intro"
              >
                About MercaAndes
              </Link>
            </div>
          </div>

          {/* Countries included in the project scope */}
          <div className={styles.countryPanel}>
            <span className={styles.panelLabel}>PROJECT SCOPE</span>
            <h2>One region. Multiple markets.</h2>

            <div className={styles.countryList}>
              {countries.map((country) => (
                <span className={styles.countryTag} key={country}>
                  {country}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Documentation navigation cards */}
        <section
          className={styles.documentation}
          id="documentation"
        >
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>
              TECHNICAL RESOURCES
            </span>

            <h2>Explore the documentation</h2>

            <p>
              Find the information you need to set up, understand,
              and work with MercaAndes.
            </p>
          </div>

          <div className={styles.sectionGrid}>
            {sections.map((section) => (
              <Link
                className={styles.sectionCard}
                to={section.to}
                key={section.title}
              >
                <span className={styles.sectionIcon} aria-hidden="true">
                  {section.icon}
                </span>

                <h3>{section.title}</h3>
                <p>{section.description}</p>

                <span className={styles.cardLink}>
                  Explore section <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Final call to action */}
        <section className={styles.bottomBanner}>
          <div>
            <h2>Ready to get started?</h2>
            <p>
              Start with the installation guide and prepare your
              development environment.
            </p>
          </div>

          <Link
            className={styles.primaryButton}
            to="/docs/installation-deployment/prerequisites"
          >
            Installation guide →
          </Link>
        </section>
      </main>
    </Layout>
  );
}

export default HomePage;
