export type Locale = 'es' | 'en';
export type LocalizedText = Record<Locale, string>;

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const profile = {
  name: 'Cristian Alexis Roman Santiago',
  role: 'QA Engineer',
  location: 'Monterrey, Nuevo León, México',
  email: 'alexissantiagobsuiness@gmail.com',
  phoneDisplay: '+52 81 2616 5476',
  phoneHref: 'tel:+528126165476',
  whatsapp: 'https://wa.me/528126165476',
  linkedin: 'https://www.linkedin.com/in/alexis-roman-santiago/',
  github: 'https://github.com/mralexis99r',
  resume: {
    es: publicAsset('resume/Cristian-Alexis-Roman-Santiago-QA-Engineer-ES.pdf'),
    en: publicAsset('resume/Cristian-Alexis-Roman-Santiago-QA-Engineer.pdf')
  },
  profileImage: publicAsset('profile.webp') as string | null,
  summary: {
    es: 'QA Engineer con más de 4 años de experiencia en pruebas manuales, funcionales y de automatización. Trabajo a lo largo del ciclo de calidad: análisis de requerimientos, diseño de pruebas, automatización, rendimiento, validación de datos y soporte a entregas continuas.',
    en: 'QA Engineer with more than 4 years of experience in manual, functional, and automated testing. I work across the quality lifecycle: requirements analysis, test design, automation, performance, data validation, and continuous delivery support.'
  } satisfies LocalizedText,
  focus: [
    { es: 'Quality Engineering', en: 'Quality Engineering' },
    { es: 'Pruebas funcionales', en: 'Functional Testing' },
    { es: 'Automatización', en: 'Test Automation' },
    { es: 'Pruebas de API', en: 'API Testing' },
    { es: 'Rendimiento', en: 'Performance Testing' },
    { es: 'CI/CD', en: 'CI/CD' }
  ] satisfies LocalizedText[],
  experience: [
    {
      company: 'AXITY',
      role: { es: 'QA Automation Engineer', en: 'QA Automation Engineer' },
      period: { es: 'dic. 2025 — actualidad', en: 'Dec 2025 — Present' },
      responsibilities: {
        es: [
          'Análisis de requerimientos e historias de usuario para diseñar casos manuales, de integración e integrales.',
          'Mantenimiento de scripts existentes y creación de automatizaciones para nuevos casos con Selenium y TestNG.',
          'Ejecución de pruebas de rendimiento y carga de usuarios con Gatling, Java y JMeter dentro de un equipo Scrum.'
        ],
        en: [
          'Analyze requirements and user stories to design manual, integration, and end-to-end test cases.',
          'Maintain existing scripts and create automation for new test cases using Selenium and TestNG.',
          'Execute performance and user load testing with Gatling, Java, and JMeter within a Scrum team.'
        ]
      },
      technologies: ['Selenium', 'Java', 'TestNG', 'Gatling', 'JMeter', 'Scrum']
    },
    {
      company: 'SWBC',
      role: { es: 'QA Engineer', en: 'QA Engineer' },
      period: { es: 'sept. 2025 — dic. 2025', en: 'Sep 2025 — Dec 2025' },
      responsibilities: {
        es: [
          'Ejecución de pruebas principalmente manuales de acuerdo con las necesidades de los proyectos.',
          'Mantenimiento de casos de prueba automatizados existentes con Selenium y Java.'
        ],
        en: [
          'Performed primarily manual testing according to project needs.',
          'Maintained existing automated test cases using Selenium and Java.'
        ]
      },
      technologies: ['Manual Testing', 'Selenium', 'Java']
    },
    {
      company: 'NEORIS',
      role: { es: 'QA Engineer', en: 'QA Engineer' },
      period: { es: 'feb. 2024 — abr. 2025', en: 'Feb 2024 — Apr 2025' },
      responsibilities: {
        es: [
          'Ejecución de pruebas funcionales y soporte a pipelines de automatización.',
          'Preparación de datos de prueba y ejecución de suites automatizadas.',
          'Colaboración con equipos Agile para mantener entregas estables.'
        ],
        en: [
          'Performed functional testing and supported automation pipelines.',
          'Prepared test data and executed automated test suites.',
          'Collaborated with Agile teams to maintain stable releases.'
        ]
      },
      technologies: ['Jenkins', 'Bitbucket', 'Git', 'Agile']
    },
    {
      company: 'NTT DATA',
      role: { es: 'QA Engineer', en: 'QA Engineer' },
      period: { es: 'nov. 2023 — feb. 2024', en: 'Nov 2023 — Feb 2024' },
      responsibilities: {
        es: [
          'Diseño y ejecución de casos de prueba manuales, pruebas smoke y validaciones de base de datos.',
          'Registro y seguimiento de defectos durante sprints y ciclos de regresión.'
        ],
        en: [
          'Designed and executed manual test cases, smoke tests, and database validations.',
          'Logged and tracked defects throughout sprints and regression cycles.'
        ]
      },
      technologies: ['Jira', 'SQL', 'Scrum', 'Regression Testing']
    },
    {
      company: 'BANORTE',
      role: { es: 'QA Lead', en: 'QA Lead' },
      period: { es: 'may. 2023 — oct. 2023', en: 'May 2023 — Oct 2023' },
      responsibilities: {
        es: [
          'Coordinación de pruebas funcionales y de regresión para aplicaciones bancarias.',
          'Estimación de esfuerzos y colaboración con desarrollo y proveedores externos.',
          'Gestión de defectos y documentación del ciclo de pruebas.'
        ],
        en: [
          'Coordinated functional and regression testing for banking applications.',
          'Estimated testing efforts and collaborated with developers and external vendors.',
          'Managed defects and documented the testing lifecycle.'
        ]
      },
      technologies: ['Functional Testing', 'Regression Testing', 'Defect Management']
    },
    {
      company: 'OXXO',
      role: { es: 'QA Engineer', en: 'QA Engineer' },
      period: { es: 'abr. 2022 — feb. 2023', en: 'Apr 2022 — Feb 2023' },
      responsibilities: {
        es: [
          'Pruebas funcionales y de regresión sobre sistemas de punto de venta.',
          'Seguimiento de defectos y colaboración con desarrollo dentro de procesos Agile.'
        ],
        en: [
          'Performed functional and regression testing on point-of-sale systems.',
          'Tracked defects and collaborated with development teams in Agile processes.'
        ]
      },
      technologies: ['Functional Testing', 'Regression Testing', 'Agile']
    }
  ],
  skills: [
    {
      title: { es: 'Estrategia de pruebas', en: 'Testing strategy' },
      items: ['Functional Testing', 'Regression Testing', 'Smoke Testing', 'Integration Testing', 'E2E Testing']
    },
    {
      title: { es: 'Automatización', en: 'Automation' },
      items: ['Playwright', 'TypeScript', 'Selenium', 'Java', 'TestNG']
    },
    {
      title: { es: 'API y datos', en: 'API & data' },
      items: ['API Testing', 'Postman', 'SQL', 'SQL Server']
    },
    {
      title: { es: 'Rendimiento', en: 'Performance' },
      items: ['JMeter', 'Gatling']
    },
    {
      title: { es: 'Entrega y colaboración', en: 'Delivery & collaboration' },
      items: ['GitHub Actions', 'Jenkins', 'Azure DevOps', 'Git', 'Jira', 'ALM Octane', 'Scrum', 'Kanban']
    }
  ],
  projects: [
    {
      title: 'Booking UI Automation',
      description: {
        es: 'Suite de pruebas UI para búsqueda de hoteles, filtros y navegación de resultados, con datos externos y evidencia visual.',
        en: 'UI test suite for hotel search, filtering, and result navigation, using external test data and visual evidence.'
      },
      technologies: ['Playwright', 'TypeScript', 'Data-driven testing', 'JSON'],
      repository: 'https://github.com/mralexis99r/Booking-automation'
    },
    {
      title: 'Selenium Java Automation',
      description: {
        es: 'Framework de automatización en Java para flujos de autenticación, organizado con Page Objects y datos de prueba en JSON.',
        en: 'Java automation framework for authentication flows, organized with Page Objects and JSON test data.'
      },
      technologies: ['Java 17', 'Selenium', 'TestNG', 'Page Object Model'],
      repository: 'https://github.com/mralexis99r/selenium-java-automation'
    }
  ],
  education: {
    degree: { es: 'Ingeniería en Computación Administrativa', en: 'Administrative Computer Engineering' },
    institution: 'Universidad TecMilenio',
    period: '2017 — 2022'
  },
  languages: [
    { language: { es: 'Español', en: 'Spanish' }, level: 'C1–C2' },
    { language: { es: 'Inglés', en: 'English' }, level: 'B2–C1' }
  ]
} as const;

export const copy = {
  es: {
    nav: { about: 'Perfil', skills: 'Habilidades', experience: 'Experiencia', projects: 'Proyectos', contact: 'Contacto' },
    controls: { language: 'Cambiar idioma', theme: 'Cambiar tema', menu: 'Abrir menú', closeMenu: 'Cerrar menú', light: 'Tema claro', dark: 'Tema oscuro' },
    hero: { eyebrow: 'QA ENGINEER · MONTERREY, MX', available: 'Disponible para oportunidades QA', experience: 'Ver experiencia', projects: 'Ver proyectos', resume: 'Descargar CV', scroll: 'Explorar perfil' },
    about: { kicker: 'Perfil profesional', title: 'Calidad con criterio de producto y disciplina técnica.', body: 'Mi experiencia combina validación funcional, coordinación de calidad y automatización. Me enfoco en hacer visibles los riesgos, construir cobertura mantenible y colaborar con el equipo para que cada entrega sea verificable.', label: 'Cómo aporto', items: ['Traduzco requisitos en escenarios claros y trazables.', 'Combino exploración manual con automatización mantenible.', 'Comunico riesgos y defectos con contexto para acelerar decisiones.'] },
    skills: { kicker: 'Capacidades', title: 'Herramientas dentro de una práctica integral de QA.', body: 'La automatización, APIs, rendimiento y CI/CD son fortalezas dentro de mi perfil general de Quality Assurance.' },
    experience: { kicker: 'Trayectoria', title: 'Experiencia profesional', body: 'Responsabilidades y alcance basados en mi experiencia documentada.', technologies: 'Entorno' },
    projects: { kicker: 'Trabajo verificable', title: 'Proyectos de QA destacados', body: 'Repositorios públicos que muestran estructura, datos de prueba y decisiones de automatización.', repository: 'Ver repositorio', verified: 'Repositorio público' },
    education: { title: 'Formación e idiomas', education: 'Educación', languages: 'Idiomas' },
    contact: { kicker: 'Contacto', title: '¿Buscas un QA Engineer que entienda el producto completo?', body: 'Conversemos sobre el equipo, los riesgos de calidad y el tipo de cobertura que necesita tu producto.', email: 'Enviar email', whatsapp: 'WhatsApp', phone: 'Llamar', location: 'Ubicación', social: 'Perfiles profesionales' },
    footer: { note: 'QA Engineering · Functional · Automation · API · Performance', rights: 'Construido con React, TypeScript y atención al detalle.' },
    a11y: { skip: 'Saltar al contenido', external: 'abre en una pestaña nueva' }
  },
  en: {
    nav: { about: 'Profile', skills: 'Skills', experience: 'Experience', projects: 'Projects', contact: 'Contact' },
    controls: { language: 'Change language', theme: 'Change theme', menu: 'Open menu', closeMenu: 'Close menu', light: 'Light theme', dark: 'Dark theme' },
    hero: { eyebrow: 'QA ENGINEER · MONTERREY, MX', available: 'Open to QA opportunities', experience: 'View experience', projects: 'View projects', resume: 'Download resume', scroll: 'Explore profile' },
    about: { kicker: 'Professional profile', title: 'Quality with product judgment and technical discipline.', body: 'My experience combines functional validation, quality coordination, and automation. I focus on making risks visible, building maintainable coverage, and collaborating with the team so every release can be verified.', label: 'How I contribute', items: ['Turn requirements into clear, traceable scenarios.', 'Combine manual exploration with maintainable automation.', 'Communicate risks and defects with context to speed up decisions.'] },
    skills: { kicker: 'Capabilities', title: 'Tools within a complete QA practice.', body: 'Automation, APIs, performance, and CI/CD are strengths within my broader Quality Assurance profile.' },
    experience: { kicker: 'Career', title: 'Professional experience', body: 'Responsibilities and scope based on my documented experience.', technologies: 'Environment' },
    projects: { kicker: 'Verifiable work', title: 'Featured QA projects', body: 'Public repositories that show structure, test data, and automation decisions.', repository: 'View repository', verified: 'Public repository' },
    education: { title: 'Education & languages', education: 'Education', languages: 'Languages' },
    contact: { kicker: 'Contact', title: 'Looking for a QA Engineer who understands the whole product?', body: 'Let’s talk about the team, quality risks, and the coverage your product needs.', email: 'Send email', whatsapp: 'WhatsApp', phone: 'Call', location: 'Location', social: 'Professional profiles' },
    footer: { note: 'QA Engineering · Functional · Automation · API · Performance', rights: 'Built with React, TypeScript, and attention to detail.' },
    a11y: { skip: 'Skip to content', external: 'opens in a new tab' }
  }
} as const;
