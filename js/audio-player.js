// Audio Player
// Handles text-to-speech narration using Xenova/Transformers.js

export class AudioPlayer {
    constructor() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentText = '';
        this.currentLang = 'en';
        this.speed = 1.0;
        this.synthesizer = null;
        this.audioContext = null;
        this.audioSource = null;
        
        this.init();
    }
    
    async init() {
        console.log('Initializing Audio Player...');
        
        // Setup audio controls
        this.setupControls();
        
        // Note: Xenova/Transformers.js initialization would go here
        // For now, we'll use Web Speech API as a fallback
        this.initWebSpeech();
        
        console.log('Audio Player initialized');
    }
    
    initWebSpeech() {
        // Check if browser supports Web Speech API
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
            this.utterance = null;
            console.log('Web Speech API available');
        } else {
            console.warn('Web Speech API not supported');
        }
    }
    
    setupControls() {
        const playBtn = document.getElementById('audioPlay');
        const pauseBtn = document.getElementById('audioPause');
        const resetBtn = document.getElementById('audioReset');
        const speedSelect = document.getElementById('audioSpeed');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => this.play());
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
        
        if (speedSelect) {
            speedSelect.addEventListener('change', (e) => {
                this.speed = parseFloat(e.target.value);
                if (this.isPlaying) {
                    this.updateSpeed();
                }
            });
        }
    }
    
    loadText(text, lang = 'en') {
        this.currentText = text;
        this.currentLang = lang;
        console.log(`Loaded text for narration (${lang}):`, text.substring(0, 50) + '...');
    }
    
    play() {
        if (!this.currentText) {
            console.warn('No text loaded for narration');
            return;
        }
        
        if (this.isPaused) {
            this.resume();
            return;
        }
        
        console.log('Starting narration...');
        
        // Use Web Speech API
        if (this.speechSynthesis) {
            this.playWithWebSpeech();
        } else {
            const langManager = window.detectiveApp?.languageManager;
            const message = langManager ? langManager.translate('alerts.ttsNotSupported') : 'Text-to-speech is not supported in your browser';
            alert(message);
        }
    }
    
    playWithWebSpeech() {
        // Cancel any ongoing speech
        this.speechSynthesis.cancel();
        
        // Create new utterance
        this.utterance = new SpeechSynthesisUtterance(this.currentText);
        
        // Set language
        this.utterance.lang = this.getVoiceLanguage(this.currentLang);
        
        // Set speed
        this.utterance.rate = this.speed;
        
        // Set voice if available
        const voices = this.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(this.utterance.lang));
        if (voice) {
            this.utterance.voice = voice;
        }
        
        // Event handlers
        this.utterance.onstart = () => {
            this.isPlaying = true;
            this.isPaused = false;
            this.updateControls();
            this.startProgressAnimation();
        };
        
        this.utterance.onend = () => {
            this.isPlaying = false;
            this.isPaused = false;
            this.updateControls();
            this.resetProgress();
        };
        
        this.utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isPlaying = false;
            this.isPaused = false;
            this.updateControls();
        };
        
        // Start speaking
        this.speechSynthesis.speak(this.utterance);
    }
    
    pause() {
        if (this.isPlaying && this.speechSynthesis) {
            this.speechSynthesis.pause();
            this.isPaused = true;
            this.isPlaying = false;
            this.updateControls();
            console.log('Narration paused');
        }
    }
    
    resume() {
        if (this.isPaused && this.speechSynthesis) {
            this.speechSynthesis.resume();
            this.isPaused = false;
            this.isPlaying = true;
            this.updateControls();
            console.log('Narration resumed');
        }
    }
    
    reset() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
        
        this.isPlaying = false;
        this.isPaused = false;
        this.updateControls();
        this.resetProgress();
        console.log('Narration reset');
    }
    
    updateSpeed() {
        if (this.isPlaying && this.utterance) {
            // Web Speech API doesn't support changing speed on the fly
            // Need to restart with new speed
            const currentText = this.currentText;
            this.reset();
            this.play();
        }
    }
    
    updateControls() {
        const playBtn = document.getElementById('audioPlay');
        const pauseBtn = document.getElementById('audioPause');
        
        if (playBtn) {
            playBtn.disabled = this.isPlaying;
        }
        
        if (pauseBtn) {
            pauseBtn.disabled = !this.isPlaying;
        }
    }
    
    startProgressAnimation() {
        const progressBar = document.getElementById('audioProgress');
        if (!progressBar) return;
        
        // Estimate duration based on text length (rough approximation)
        const wordsPerMinute = 150 * this.speed;
        const words = this.currentText.split(' ').length;
        const durationMs = (words / wordsPerMinute) * 60 * 1000;
        
        let startTime = Date.now();
        
        const updateProgress = () => {
            if (!this.isPlaying && !this.isPaused) {
                return;
            }
            
            if (!this.isPaused) {
                const elapsed = Date.now() - startTime;
                const progress = Math.min((elapsed / durationMs) * 100, 100);
                progressBar.style.width = progress + '%';
            }
            
            if (this.isPlaying || this.isPaused) {
                requestAnimationFrame(updateProgress);
            }
        };
        
        updateProgress();
    }
    
    resetProgress() {
        const progressBar = document.getElementById('audioProgress');
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }
    
    getVoiceLanguage(lang) {
        // Map our language codes to Web Speech API language codes
        const langMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'zh-CN': 'zh-CN',
            'ko': 'ko-KR',
            'ja': 'ja-JP'
        };
        
        return langMap[lang] || 'en-US';
    }
    
    // Future: Initialize Xenova/Transformers.js for better quality
    async initXenova() {
        try {
            // This would be the actual Xenova initialization
            // const { pipeline } = await import('@xenova/transformers');
            // this.synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts');
            console.log('Xenova/Transformers.js would be initialized here');
        } catch (error) {
            console.error('Error initializing Xenova:', error);
        }
    }
}
