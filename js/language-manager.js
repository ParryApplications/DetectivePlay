// Language Manager
// Handles multi-language support for the application

export class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('detective_lang') || 'en';
        this.translations = {};
        this.supportedLanguages = {
            'en': 'English',
            'hi': 'हिंदी',
            'zh-CN': '中文',
            'ko': '한국어',
            'ja': '日本語'
        };
    }
    
    async init() {
        console.log('Initializing Language Manager...');
        
        // Load current language translations
        await this.loadTranslations(this.currentLang);
        
        // Apply translations to UI
        this.applyTranslations();
        
        // Update language display
        this.updateLanguageDisplay();
        
        console.log(`Language Manager initialized with: ${this.currentLang}`);
    }
    
    async loadTranslations(lang) {
        try {
            const response = await fetch(`./translations/${lang}.json`);
            
            if (!response.ok) {
                console.warn(`Failed to load ${lang} translations, falling back to English`);
                if (lang !== 'en') {
                    const fallbackResponse = await fetch('./translations/en.json');
                    this.translations = await fallbackResponse.json();
                }
                return;
            }
            
            this.translations = await response.json();
            console.log(`Loaded translations for: ${lang}`);
        } catch (error) {
            console.error('Error loading translations:', error);
            
            // Fallback to English if available
            if (lang !== 'en') {
                try {
                    const fallbackResponse = await fetch('./translations/en.json');
                    this.translations = await fallbackResponse.json();
                } catch (fallbackError) {
                    console.error('Failed to load fallback translations:', fallbackError);
                    // Use hardcoded fallback
                    this.useHardcodedFallback();
                }
            } else {
                // Use hardcoded fallback for English
                this.useHardcodedFallback();
            }
        }
    }
    
    useHardcodedFallback() {
        console.warn('Using hardcoded fallback translations');
        this.translations = {
            "app": {
                "name": "GiveJustice",
                "tagline": "Seek Truth. Deliver Justice."
            },
            "nav": {
                "subscribe": "Subscribe",
                "language": "Language"
            },
            "restriction": {
                "title": "Detective Work Requires a Bigger Screen",
                "message": "This investigation platform is optimized for desktop and laptop computers.",
                "requirement": "Please access from a device with a screen width of at least 1024px.",
                "current": "Your screen:"
            },
            "dashboard": {
                "title": "Welcome, Detective",
                "subtitle": "Every clue matters. Every detail counts. Justice awaits.",
                "asDetective": {
                    "title": "As Detective",
                    "description": "Test your investigative skills. Analyze evidence, connect clues, and solve the mystery on your own.",
                    "button": "Start Investigation"
                },
                "solvedMystery": {
                    "title": "Solved Mystery",
                    "description": "Learn from solved cases. Understand the investigation process and see how evidence led to the truth.",
                    "button": "Read Case"
                }
            },
            "loading": "Loading mystery..."
        };
    }
    
    async switchLanguage(lang) {
        if (!this.supportedLanguages[lang]) {
            console.error(`Unsupported language: ${lang}`);
            return;
        }
        
        console.log(`Switching language to: ${lang}`);
        
        this.currentLang = lang;
        localStorage.setItem('detective_lang', lang);
        
        // Load new translations
        await this.loadTranslations(lang);
        
        // Apply to UI
        this.applyTranslations();
        
        // Update language display
        this.updateLanguageDisplay();
        
        // Stop any playing audio when language changes
        if (window.detectiveApp && window.detectiveApp.audioPlayer) {
            window.detectiveApp.audioPlayer.reset();
        }
        
        // Reload current mystery if one is loaded
        if (window.detectiveApp && window.detectiveApp.currentMystery) {
            window.detectiveApp.mysteryLoader.loadMystery(
                window.detectiveApp.currentMystery,
                lang
            );
            window.detectiveApp.cardManager.loadCards(
                window.detectiveApp.currentMystery,
                lang
            );
        }
    }
    
    applyTranslations() {
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (translation) {
                // Check if element is an input with placeholder
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.hasAttribute('placeholder')) {
                        element.placeholder = translation;
                    } else {
                        element.value = translation;
                    }
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Handle placeholder-specific translations
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.translate(key);
            
            if (translation) {
                element.placeholder = translation;
            }
        });
    }
    
    translate(key) {
        // Split key by dots to access nested properties
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key; // Return key if translation not found
            }
        }
        
        return value;
    }
    
    updateLanguageDisplay() {
        const currentLanguageElement = document.getElementById('currentLanguage');
        if (currentLanguageElement) {
            currentLanguageElement.textContent = this.supportedLanguages[this.currentLang];
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang;
        
        // Update active state in language dropdown
        const languageItems = document.querySelectorAll('[data-lang]');
        languageItems.forEach(item => {
            const lang = item.getAttribute('data-lang');
            if (lang === this.currentLang) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Get translated text from object (for mystery data)
    getTranslatedText(textObject) {
        if (!textObject) return '';
        
        // If it's a string, return it
        if (typeof textObject === 'string') return textObject;
        
        // If it's an object, get the current language or fallback to English
        return textObject[this.currentLang] || textObject.en || '';
    }
    
    // Format date according to current language
    formatDate(date) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Intl.DateTimeFormat(this.currentLang, options).format(dateObj);
    }
    
    // Format number according to current language
    formatNumber(number) {
        return new Intl.NumberFormat(this.currentLang).format(number);
    }
}
