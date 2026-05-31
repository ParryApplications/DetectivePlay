// Background Music Manager
// Provides mysterious, noir-style ambient background music for the detective game

export class BackgroundMusic {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.volume = 0.18; // Slightly higher volume for richer sound
        this.oscillators = [];
        this.gainNodes = [];
        this.isPlaying = false;
        this.intervalIds = [];
        
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
    
    // Start playing mysterious noir-style background music
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
            
            // Create mysterious noir atmosphere with multiple layers
            this.createDeepBassLayer(ctx, masterGain);           // Deep mysterious bass
            this.createMinorChordProgression(ctx, masterGain);   // Haunting chord progression
            this.createPianoMelody(ctx, masterGain);             // Sparse noir piano notes
            this.createStringPad(ctx, masterGain);               // Eerie string pad
            this.createClockTicking(ctx, masterGain);            // Subtle ticking for tension
            this.createRainAmbience(ctx, masterGain);            // Rain/noir atmosphere
            this.createMysteryBells(ctx, masterGain);            // Occasional mysterious bells
            
            console.log('Mysterious background music started');
        } catch (error) {
            console.error('Error starting background music:', error);
            this.isPlaying = false;
        }
    }
    
    // Create deep mysterious bass layer
    createDeepBassLayer(ctx, destination) {
        // Use minor key bass notes for mystery (D minor)
        const bassNotes = [73.42, 82.41, 87.31]; // D2, E2, F2
        
        bassNotes.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            oscillator.detune.value = Math.random() * 5 - 2.5;
            
            filter.type = 'lowpass';
            filter.frequency.value = freq * 3;
            filter.Q.value = 2;
            
            gainNode.gain.value = 0;
            gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2 + index);
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(destination);
            
            oscillator.start(ctx.currentTime);
            
            this.oscillators.push(oscillator);
            this.gainNodes.push(gainNode);
        });
    }
    
    // Create haunting minor chord progression
    createMinorChordProgression(ctx, destination) {
        // D minor chord progression: Dm - Am - Bb - F
        const chordProgression = [
            [146.83, 174.61, 220.00], // Dm (D3, F3, A3)
            [110.00, 130.81, 164.81], // Am (A2, C3, E3)
            [116.54, 146.83, 174.61], // Bb (Bb2, D3, F3)
            [87.31, 130.81, 174.61]   // F  (F2, C3, F3)
        ];
        
        let chordIndex = 0;
        const playChord = () => {
            if (!this.isPlaying) return;
            
            const chord = chordProgression[chordIndex];
            const startTime = ctx.currentTime;
            
            chord.forEach((freq, noteIndex) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                
                oscillator.type = 'triangle';
                oscillator.frequency.value = freq;
                
                filter.type = 'lowpass';
                filter.frequency.value = freq * 6;
                filter.Q.value = 1.5;
                
                // Fade in and out for smooth transitions
                gainNode.gain.value = 0;
                gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.5);
                gainNode.gain.linearRampToValueAtTime(0.08, startTime + 7);
                gainNode.gain.linearRampToValueAtTime(0, startTime + 8);
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(destination);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 8);
            });
            
            chordIndex = (chordIndex + 1) % chordProgression.length;
        };
        
        // Play first chord immediately
        playChord();
        
        // Continue playing chords every 8 seconds
        const intervalId = setInterval(playChord, 8000);
        this.intervalIds.push(intervalId);
    }
    
    // Create sparse noir piano melody
    createPianoMelody(ctx, destination) {
        // Mysterious melody notes in D minor scale
        const melodyNotes = [293.66, 349.23, 392.00, 349.23, 329.63, 293.66, 261.63];
        
        let noteIndex = 0;
        const playNote = () => {
            if (!this.isPlaying) return;
            
            const freq = melodyNotes[noteIndex];
            const startTime = ctx.currentTime;
            
            // Create piano-like sound with multiple harmonics
            for (let harmonic = 1; harmonic <= 3; harmonic++) {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.value = freq * harmonic;
                
                const harmonicVolume = 0.12 / harmonic;
                gainNode.gain.value = 0;
                gainNode.gain.linearRampToValueAtTime(harmonicVolume, startTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 2);
                
                oscillator.connect(gainNode);
                gainNode.connect(destination);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 2);
            }
            
            noteIndex = (noteIndex + 1) % melodyNotes.length;
        };
        
        // Start after 3 seconds, play every 4 seconds
        setTimeout(() => {
            playNote();
            const intervalId = setInterval(playNote, 4000);
            this.intervalIds.push(intervalId);
        }, 3000);
    }
    
    // Create eerie string pad
    createStringPad(ctx, destination) {
        const stringFreqs = [146.83, 220.00, 293.66]; // D3, A3, D4
        
        stringFreqs.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = freq;
            oscillator.detune.value = Math.random() * 8 - 4;
            
            // LFO for vibrato
            lfo.type = 'sine';
            lfo.frequency.value = 0.15 + (index * 0.03);
            lfoGain.gain.value = 0.06;
            
            filter.type = 'lowpass';
            filter.frequency.value = freq * 4;
            filter.Q.value = 2;
            
            gainNode.gain.value = 0;
            gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 4 + index);
            
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
    
    // Create subtle clock ticking for tension
    createClockTicking(ctx, destination) {
        const playTick = () => {
            if (!this.isPlaying) return;
            
            const startTime = ctx.currentTime;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 800;
            
            gainNode.gain.value = 0.03;
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
            
            oscillator.connect(gainNode);
            gainNode.connect(destination);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.05);
        };
        
        // Tick every 1.2 seconds
        const intervalId = setInterval(playTick, 1200);
        this.intervalIds.push(intervalId);
    }
    
    // Create rain/noir atmosphere
    createRainAmbience(ctx, destination) {
        const bufferSize = ctx.sampleRate * 3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate filtered noise for rain effect
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
            b6 = white * 0.115926;
        }
        
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        source.buffer = buffer;
        source.loop = true;
        
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;
        
        gainNode.gain.value = 0;
        gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 5);
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(destination);
        
        source.start(ctx.currentTime);
        
        this.oscillators.push(source);
        this.gainNodes.push(gainNode);
    }
    
    // Create occasional mysterious bells
    createMysteryBells(ctx, destination) {
        const bellFreqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        const playBell = () => {
            if (!this.isPlaying) return;
            
            const freq = bellFreqs[Math.floor(Math.random() * bellFreqs.length)];
            const startTime = ctx.currentTime;
            
            // Create bell-like sound with inharmonic partials
            const partials = [1, 2.4, 3.8, 5.2];
            partials.forEach((partial, index) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                
                oscillator.type = 'sine';
                oscillator.frequency.value = freq * partial;
                
                filter.type = 'highpass';
                filter.frequency.value = 400;
                
                const partialVolume = 0.04 / (index + 1);
                gainNode.gain.value = 0;
                gainNode.gain.linearRampToValueAtTime(partialVolume, startTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 3);
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(destination);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 3);
            });
        };
        
        // Play bells randomly every 12-20 seconds
        const scheduleBell = () => {
            if (!this.isPlaying) return;
            playBell();
            const nextBellTime = 12000 + Math.random() * 8000;
            const timeoutId = setTimeout(scheduleBell, nextBellTime);
            this.intervalIds.push(timeoutId);
        };
        
        // Start first bell after 8 seconds
        setTimeout(scheduleBell, 8000);
    }
    
    // Stop all background music
    stop() {
        if (!this.isPlaying) return;
        
        try {
            const ctx = this.audioContext;
            if (!ctx) return;
            
            // Clear all intervals and timeouts
            this.intervalIds.forEach(id => {
                clearInterval(id);
                clearTimeout(id);
            });
            this.intervalIds = [];
            
            // Fade out all gain nodes
            this.gainNodes.forEach(gainNode => {
                gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
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
            }, 1600);
            
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
                    gainNode.gain.value * (this.volume / 0.18),
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
