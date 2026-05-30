// Sound Effects Manager
// Provides copyright-free detective-themed sound effects using Web Audio API

export class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3; // Default volume (0.0 to 1.0)
        this.soundCache = new Map();
        
        this.init();
    }
    
    init() {
        // Initialize Web Audio API (lazy initialization to avoid autoplay issues)
        try {
            // AudioContext will be created on first user interaction
            this.enabled = true;
            console.log('Sound Effects Manager initialized');
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }
    
    // Lazy initialization of AudioContext (must be triggered by user interaction)
    getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }
    
    // ==================== SOUND GENERATION METHODS ====================
    
    // Button click sound - subtle click
    playClick() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
    }
    
    // Card flip sound - paper rustling effect
    playCardFlip() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate noise with envelope for paper-like sound
        for (let i = 0; i < bufferSize; i++) {
            const envelope = Math.exp(-i / (bufferSize * 0.3));
            data[i] = (Math.random() * 2 - 1) * envelope * 0.15;
        }
        
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        source.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        gainNode.gain.value = this.volume * 0.5;
        
        source.start(ctx.currentTime);
    }
    
    // Card drag sound - subtle whoosh
    playCardDrag() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        
        gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }
    
    // Card drop sound - thud
    playCardDrop() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
    }
    
    // Connection made sound - detective "aha!" moment
    playConnection() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        
        // Create a pleasant ascending tone
        [0, 0.05, 0.1].forEach((delay, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = 523.25 * Math.pow(1.5, index); // C5, G5, C6
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime + delay);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);
            
            oscillator.start(ctx.currentTime + delay);
            oscillator.stop(ctx.currentTime + delay + 0.15);
        });
    }
    
    // Success sound - case solved!
    playSuccess() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        
        // Triumphant chord progression
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = ctx.currentTime + (index * 0.08);
            gainNode.gain.setValueAtTime(this.volume * 0.4, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.5);
        });
    }
    
    // Failure sound - wrong answer
    playFailure() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        
        // Descending disappointed tone
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    }
    
    // Modal open sound - document opening
    playModalOpen() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }
    
    // Modal close sound
    playModalClose() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }
    
    // Hover sound - subtle feedback
    playHover() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.03);
    }
    
    // Tab switch sound
    playTabSwitch() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 700;
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.06);
    }
    
    // Typewriter sound for notes
    playTypewriter() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 1500 + (Math.random() * 200);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.02);
    }
    
    // Clear board sound - eraser
    playClear() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate noise with envelope for eraser sound
        for (let i = 0; i < bufferSize; i++) {
            const envelope = 1 - (i / bufferSize);
            data[i] = (Math.random() * 2 - 1) * envelope * 0.2;
        }
        
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        source.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        gainNode.gain.value = this.volume * 0.4;
        
        source.start(ctx.currentTime);
    }
    
    // Investigation start sound - dramatic
    playInvestigationStart() {
        if (!this.enabled) return;
        
        const ctx = this.getAudioContext();
        
        // Dramatic low to high sweep
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
    }
    
    // ==================== UTILITY METHODS ====================
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
    }
    
    isEnabled() {
        return this.enabled;
    }
}
