export type Locale = 'es' | 'en';
export type LocalizedText = Record<Locale, string>;

export type EditableExperience = {
  id: string;
  company: string;
  role: LocalizedText;
  period: LocalizedText;
  responsibilities: Record<Locale, string[]>;
  technologies: string[];
};

export type Certificate = {
  id: string;
  name: LocalizedText;
  issuer: string;
  date: string;
  credentialUrl: string;
};

export type PortfolioContent = {
  name: string;
  role: string;
  location: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsapp: string;
  linkedin: string;
  github: string;
  summary: LocalizedText;
  experience: EditableExperience[];
  certificates: Certificate[];
  photoUrl: string;
  updatedAt?: string;
};

export const defaultContent: PortfolioContent = {
  name: 'Cristian Alexis Roman Santiago',
  role: 'QA Engineer',
  location: 'Monterrey, Nuevo León, México',
  email: 'alexissantiagobsuiness@gmail.com',
  phoneDisplay: '+52 81 2616 5476',
  phoneHref: 'tel:+528126165476',
  whatsapp: 'https://wa.me/528126165476',
  linkedin: 'https://www.linkedin.com/in/alexis-roman-santiago/',
  github: 'https://github.com/mralexis99r',
  photoUrl: '/profile.webp',
  summary: {
    es: 'QA Engineer con más de 4 años de experiencia en pruebas manuales, funcionales y de automatización. Trabajo a lo largo del ciclo de calidad: análisis de requerimientos, diseño de pruebas, automatización, rendimiento, validación de datos y soporte a entregas continuas.',
    en: 'QA Engineer with more than 4 years of experience in manual, functional, and automated testing. I work across the quality lifecycle: requirements analysis, test design, automation, performance, data validation, and continuous delivery support.'
  },
  experience: [
    {
      id: 'axity-2025', company: 'AXITY',
      role: { es: 'QA Automation Engineer', en: 'QA Automation Engineer' },
      period: { es: 'dic. 2025 — actualidad', en: 'Dec 2025 — Present' },
      responsibilities: {
        es: ['Análisis de requerimientos e historias de usuario para diseñar casos manuales, de integración e integrales.', 'Mantenimiento de scripts existentes y creación de automatizaciones para nuevos casos con Selenium y TestNG.', 'Ejecución de pruebas de rendimiento y carga de usuarios con Gatling, Java y JMeter dentro de un equipo Scrum.'],
        en: ['Analyze requirements and user stories to design manual, integration, and end-to-end test cases.', 'Maintain existing scripts and create automation for new test cases using Selenium and TestNG.', 'Execute performance and user load testing with Gatling, Java, and JMeter within a Scrum team.']
      },
      technologies: ['Selenium', 'Java', 'TestNG', 'Gatling', 'JMeter', 'Scrum']
    },
    {
      id: 'swbc-2025', company: 'SWBC',
      role: { es: 'QA Engineer', en: 'QA Engineer' },
      period: { es: 'sept. 2025 — dic. 2025', en: 'Sep 2025 — Dec 2025' },
      responsibilities: {
        es: ['Ejecución de pruebas principalmente manuales de acuerdo con las necesidades de los proyectos.', 'Mantenimiento de casos de prueba automatizados existentes con Selenium y Java.'],
        en: ['Performed primarily manual testing according to project needs.', 'Maintained existing automated test cases using Selenium and Java.']
      },
      technologies: ['Manual Testing', 'Selenium', 'Java']
    },
    {
      id: 'neoris-2024', company: 'NEORIS', role: { es: 'QA Engineer', en: 'QA Engineer' }, period: { es: 'feb. 2024 — abr. 2025', en: 'Feb 2024 — Apr 2025' },
      responsibilities: { es: ['Ejecución de pruebas funcionales y soporte a pipelines de automatización.', 'Preparación de datos de prueba y ejecución de suites automatizadas.', 'Colaboración con equipos Agile para mantener entregas estables.'], en: ['Performed functional testing and supported automation pipelines.', 'Prepared test data and executed automated test suites.', 'Collaborated with Agile teams to maintain stable releases.'] }, technologies: ['Jenkins', 'Bitbucket', 'Git', 'Agile']
    },
    {
      id: 'ntt-data-2023', company: 'NTT DATA', role: { es: 'QA Engineer', en: 'QA Engineer' }, period: { es: 'nov. 2023 — feb. 2024', en: 'Nov 2023 — Feb 2024' },
      responsibilities: { es: ['Diseño y ejecución de casos de prueba manuales, pruebas smoke y validaciones de base de datos.', 'Registro y seguimiento de defectos durante sprints y ciclos de regresión.'], en: ['Designed and executed manual test cases, smoke tests, and database validations.', 'Logged and tracked defects throughout sprints and regression cycles.'] }, technologies: ['Jira', 'SQL', 'Scrum', 'Regression Testing']
    },
    {
      id: 'banorte-2023', company: 'BANORTE', role: { es: 'QA Lead', en: 'QA Lead' }, period: { es: 'may. 2023 — oct. 2023', en: 'May 2023 — Oct 2023' },
      responsibilities: { es: ['Coordinación de pruebas funcionales y de regresión para aplicaciones bancarias.', 'Estimación de esfuerzos y colaboración con desarrollo y proveedores externos.', 'Gestión de defectos y documentación del ciclo de pruebas.'], en: ['Coordinated functional and regression testing for banking applications.', 'Estimated testing efforts and collaborated with developers and external vendors.', 'Managed defects and documented the testing lifecycle.'] }, technologies: ['Functional Testing', 'Regression Testing', 'Defect Management']
    },
    {
      id: 'oxxo-2022', company: 'OXXO', role: { es: 'QA Engineer', en: 'QA Engineer' }, period: { es: 'abr. 2022 — feb. 2023', en: 'Apr 2022 — Feb 2023' },
      responsibilities: { es: ['Pruebas funcionales y de regresión sobre sistemas de punto de venta.', 'Seguimiento de defectos y colaboración con desarrollo dentro de procesos Agile.'], en: ['Performed functional and regression testing on point-of-sale systems.', 'Tracked defects and collaborated with development teams in Agile processes.'] }, technologies: ['Functional Testing', 'Regression Testing', 'Agile']
    }
  ],
  certificates: []
};
