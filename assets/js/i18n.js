(function () {
    'use strict';

    const STORAGE_KEY = 'portfolio-language';
    const SUPPORTED_LANGUAGES = ['es', 'en'];

    const translations = {
        es: {
            'meta.homeTitle': 'Cristian ARS - Inicio',
            'meta.aboutTitle': 'Cristian ARS - Acerca de mí',
            'meta.projectsTitle': 'Cristian ARS - Proyectos',
            'nav.home': 'Inicio',
            'nav.about': 'Acerca de',
            'nav.projects': 'Mis proyectos',
            'home.title': 'Hola, mi nombre es Cristian Alexis Roman Santiago. Bienvenido a mi sitio web',
            'home.subtitle': 'QA Manual / QA Automation',
            'about.title': 'Acerca de mí',
            'about.description': 'Soy un QA Automation Tester con experiencia en automatización de pruebas usando herramientas modernas.',
            'about.resume': 'Descargar CV',
            'projects.title': 'Mis proyectos',
            'projects.facebook.title': 'Automatización de Facebook',
            'projects.facebook.description': 'Pruebas automatizadas para inicio de sesión, publicación y navegación.',
            'projects.amazon.title': 'Automatización de Amazon',
            'projects.amazon.description': 'Automatización del flujo de compra y validación del carrito.',
            'language.selector': 'Seleccionar idioma',
            'theme.toggle': 'Cambiar tema de color',
            'video.unsupported': 'Tu navegador no soporta el video.'
        },
        en: {
            'meta.homeTitle': 'Cristian ARS - Home',
            'meta.aboutTitle': 'Cristian ARS - About',
            'meta.projectsTitle': 'Cristian ARS - Projects',
            'nav.home': 'Home',
            'nav.about': 'About',
            'nav.projects': 'My projects',
            'home.title': 'Hi, my name is Cristian Alexis Roman Santiago. Welcome to my website',
            'home.subtitle': 'Manual QA / QA Automation',
            'about.title': 'About me',
            'about.description': 'I am a QA Automation Tester with experience using modern test automation tools.',
            'about.resume': 'Download resume',
            'projects.title': 'My projects',
            'projects.facebook.title': 'Facebook automation',
            'projects.facebook.description': 'Automated tests for sign-in, posting, and navigation.',
            'projects.amazon.title': 'Amazon automation',
            'projects.amazon.description': 'Purchase-flow automation and shopping-cart validation.',
            'language.selector': 'Select language',
            'theme.toggle': 'Change color theme',
            'video.unsupported': 'Your browser does not support the video.'
        }
    };

    function getInitialLanguage() {
        const savedLanguage = localStorage.getItem(STORAGE_KEY);
        if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
            return savedLanguage;
        }

        return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es';
    }

    function translatePage(language) {
        const dictionary = translations[language];

        document.documentElement.lang = language;
        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const key = element.dataset.i18n;
            if (dictionary[key]) {
                element.textContent = dictionary[key];
            }
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
            const key = element.dataset.i18nAriaLabel;
            if (dictionary[key]) {
                element.setAttribute('aria-label', dictionary[key]);
            }
        });

        const pageTitleKey = document.body.dataset.titleKey;
        if (pageTitleKey && dictionary[pageTitleKey]) {
            document.title = dictionary[pageTitleKey];
        }

        document.querySelectorAll('[data-language]').forEach((button) => {
            const isActive = button.dataset.language === language;
            button.setAttribute('aria-pressed', String(isActive));
            button.classList.toggle('bg-blue-500', isActive);
            button.classList.toggle('text-white', isActive);
            button.classList.toggle('bg-white', !isActive);
            button.classList.toggle('text-gray-800', !isActive);
        });

        localStorage.setItem(STORAGE_KEY, language);
    }

    function initializeLanguageSelector() {
        document.querySelectorAll('[data-language]').forEach((button) => {
            button.addEventListener('click', () => translatePage(button.dataset.language));
        });

        translatePage(getInitialLanguage());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLanguageSelector);
    } else {
        initializeLanguageSelector();
    }
})();
