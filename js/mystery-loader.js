// Mystery Loader
// Handles loading and displaying mystery content

export class MysteryLoader {
    constructor() {
        this.currentMystery = null;
        this.currentLang = 'en';
    }
    
    loadMystery(mystery, lang = 'en') {
        console.log('Loading mystery:', mystery.id);
        
        this.currentMystery = mystery;
        this.currentLang = lang;
        
        // Load story content
        this.loadStory(mystery, lang);
        
        console.log('Mystery loaded successfully');
    }
    
    loadStory(mystery, lang) {
        const storyTitle = document.getElementById('storyTitle');
        const storyContent = document.getElementById('storyContent');
        
        if (!storyTitle || !storyContent) {
            console.error('Story elements not found');
            return;
        }
        
        // Get translated title and story
        const title = this.getTranslatedText(mystery.title, lang);
        const story = this.getTranslatedText(mystery.story, lang);
        
        // Set title
        storyTitle.textContent = title;
        
        // Set story content with proper formatting
        const paragraphs = story.split('\n').filter(p => p.trim());
        storyContent.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        
        // Add difficulty badge if available
        if (mystery.difficulty) {
            const difficultyBadge = document.createElement('div');
            difficultyBadge.className = `badge bg-${this.getDifficultyColor(mystery.difficulty)} mb-3`;
            difficultyBadge.textContent = `Difficulty: ${mystery.difficulty.toUpperCase()}`;
            storyContent.insertBefore(difficultyBadge, storyContent.firstChild);
        }
    }
    
    getDifficultyColor(difficulty) {
        const colors = {
            'easy': 'success',
            'medium': 'warning',
            'hard': 'danger'
        };
        return colors[difficulty] || 'secondary';
    }
    
    getTranslatedText(textObject, lang) {
        if (!textObject) return '';
        
        // If it's a string, return it
        if (typeof textObject === 'string') return textObject;
        
        // If it's an object, get the specified language or fallback to English
        return textObject[lang] || textObject.en || '';
    }
    
    // Get mystery metadata
    getMysteryMetadata() {
        if (!this.currentMystery) return null;
        
        return {
            id: this.currentMystery.id,
            title: this.getTranslatedText(this.currentMystery.title, this.currentLang),
            category: this.currentMystery.category,
            difficulty: this.currentMystery.difficulty,
            suspectsCount: this.currentMystery.suspects?.length || 0,
            evidenceCount: this.currentMystery.evidence?.length || 0,
            locationsCount: this.currentMystery.locations?.length || 0
        };
    }
    
    // Get solution (for admin or solved mystery mode)
    getSolution() {
        if (!this.currentMystery || !this.currentMystery.solution) return null;
        
        return {
            culprit: this.currentMystery.solution.culprit,
            weapon: this.currentMystery.solution.weapon,
            location: this.currentMystery.solution.location,
            motive: this.getTranslatedText(this.currentMystery.solution.motive, this.currentLang),
            explanation: this.getTranslatedText(this.currentMystery.solution.explanation, this.currentLang),
            keyEvidence: this.currentMystery.solution.key_evidence || [],
            redHerrings: this.currentMystery.solution.red_herrings || []
        };
    }
}
