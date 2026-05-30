// Background Music Manager
// Provides ominous ambient background music for the detective game

export class BackgroundMusic {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.volume = 0.15; // Lower volume for background music
        this.oscillators = [];
        this.gainNodes = [];
        this.isPlaying = false;
        
        // Load saved state from localStorage
        const savedState = localStorage.getItem('detective_background_music');
        if (savedState !== null) {
            this.enabled = savedState === 'true';
        }
        
        console.log('Background Music Manager initialized');
    }
    
    // Lazy initialization of AudioContext (must be triggered by user interaction)
    getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }
    
    // Start playing ominous background music
    start() {
        if (this.isPlaying || !this.enabled) return;
        
        try {
            const ctx = this.getAudioContext();
            
            // Resume context if suspended (browser autoplay policy)
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            
            this.isPlaying = true;
            
            // Create master gain node for overall volume control
            const masterGain = ctx.createGain();
            masterGain.gain.value = this.volume;
            masterGain.connect(ctx.destination);
            
            // Create ominous ambient layers
            this.createDroneLayer(ctx, masterGain, 55, 0.3);      // Deep bass drone (A1)
            this.createDroneLayer(ctx, masterGain, 82.5, 0.2);    // Low drone (E2)
            this.createDroneLayer(ctx, masterGain, 110, 0.15);    // Mid-low drone (A2)
            this.createPulsingLayer(ctx, masterGain, 220, 0.1);   // Pulsing mid layer (A3)
            this.createShimmerLayer(ctx, masterGain);             // High shimmer/tension
            this.createNoiseLayer(ctx, masterGain);               // Subtle noise texture
            
            console.log('Background music started');
        } catch (error) {
            console.error('Error starting background music:', error);
            this.isPlaying = false;
        }
    }
    
    // Create a continuous drone layer
    createDroneLayer(ctx, destination, frequency, volume) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        // Add slight detuning for richness
        oscillator.detune.value = Math.random() * 10 - 5;
        
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 4;
        filter.Q.value = 1;
        
        gainNode.gain.value = 0;
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3); // Fade in over 3 seconds
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(destination);
        
        oscillator.start(ctx.currentTime);
        
        this.oscillators.push(oscillator);
        this.gainNodes.push(gainNode);
    }
    
    // Create a pulsing layer for tension
    createPulsingLayer(ctx, destination, frequency, volume) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const lfo = ctx.createOscillator(); // Low Frequency Oscillator for pulsing
        const lfoGain = ctx.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        
        // LFO for amplitude modulation (pulsing effect)
        lfo.type = 'sine';
        lfo.frequency.value = 0.2; // Slow pulse (0.2 Hz = one pulse every 5 seconds)
        
        lfoGain.gain.value = volume * 0.5; // Pulse depth
        
        gainNode.gain.value = volume * 0.5; // Base volume
        
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        
        oscillator.connect(gainNode);
        gainNode.connect(destination);
        
        oscillator.start(ctx.currentTime);
        lfo.start(ctx.currentTime);
        
        this.oscillators.push(oscillator);
        this.oscillators.push(lfo);
        this.gainNodes.push(gainNode);
    }
    
    // Create a shimmering high layer for eerie atmosphere
    createShimmerLayer(ctx, destination) {
        const shimmerFrequencies = [880, 1320, 1760]; // A5, E6, A6
        
        shimmerFrequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            oscillator.detune.value = Math.random() * 20 - 10;
            
            // LFO for tremolo effect
            lfo.type = 'sine';
            lfo.frequency.value = 0.1 + (index * 0.05); // Slightly different rates
            
            lfoGain.gain.value = 0.03; // Subtle shimmer
            
            filter.type = 'highpass';
            filter.frequency.value = 800;
            
            gainNode.gain.value = 0.03;
            
            lfo.connect(lfoGain);
            lfoGain.connect(gainNode.gain);
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(destination);
            
            oscillator.start(ctx.currentTime);
            lfo.start(ctx.currentTime);
            
            this.oscillators.push(oscillator);
            this.oscillators.push(lfo);
            this.gainNodes.push(gainNode);
        });
    }
    
    // Create subtle noise layer for texture
    createNoiseLayer(ctx, destination) {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate pink noise (more natural than white noise)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
        
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        source.buffer = buffer;
        source.loop = true;
        
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        filter.Q.value = 1;
        
        gainNode.gain.value = 0;
        gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 4); // Fade in slowly
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(destination);
        
        source.start(ctx.currentTime);
        
        this.oscillators.push(source);
        this.gainNodes.push(gainNode);
    }
    
    // Stop all background music
    stop() {
        if (!this.isPlaying) return;
        
        try {
            const ctx = this.audioContext;
            if (!ctx) return;
            
            // Fade out all gain nodes
            this.gainNodes.forEach(gainNode => {
                gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
            });
            
            // Stop all oscillators after fade out
            setTimeout(() => {
                this.oscillators.forEach(osc => {
                    try {
                        osc.stop();
                    } catch (e) {
                        // Oscillator might already be stopped
                    }
                });
                
                this.oscillators = [];
                this.gainNodes = [];
                this.isPlaying = false;
                
                console.log('Background music stopped');
            }, 1100);
            
        } catch (error) {
            console.error('Error stopping background music:', error);
        }
    }
    
    // Toggle background music on/off
    toggle() {
        this.enabled = !this.enabled;
        
        // Save state to localStorage
        localStorage.setItem('detective_background_music', this.enabled.toString());
        
        if (this.enabled) {
            this.start();
        } else {
            this.stop();
        }
        
        return this.enabled;
    }
    
    // Set volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update all gain nodes if playing
        if (this.isPlaying && this.audioContext) {
            const ctx = this.audioContext;
            this.gainNodes.forEach(gainNode => {
                gainNode.gain.linearRampToValueAtTime(
                    gainNode.gain.value * (this.volume / 0.15),
                    ctx.currentTime + 0.5
                );
            });
        }
    }
    
    // Check if music is enabled
    isEnabled() {
        return this.enabled;
    }
    
    // Check if music is currently playing
    getIsPlaying() {
        return this.isPlaying;
    }
}
