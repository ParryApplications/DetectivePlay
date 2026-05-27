// Main Application Logic
import { getRandomMystery, addSubscriber, checkEmailExists } from './firebase-config.js';
import { LanguageManager } from './language-manager.js';
import { MysteryLoader } from './mystery-loader.js';
import { CardManager } from './card-manager.js';
import { InvestigationBoard } from './investigation-board.js';
import { AudioPlayer } from './audio-player.js';

class DetectiveApp {
    constructor() {
        this.currentMystery = null;
        this.currentMode = null;
        this.languageManager = new LanguageManager();
        this.mysteryLoader = null;
        this.cardManager = null;
        this.investigationBoard = null;
        this.audioPlayer = null;
        
        this.init();
    }
    
    async init() {
        console.log('Initializing Detective App...');
        
        // Screen size is now handled purely by CSS media queries
        // No JavaScript check needed
        
        // Initialize language manager
        await this.languageManager.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize components
        this.initializeComponents();
        
        console.log('Detective App initialized successfully');
    }
    
    
    setupEventListeners() {
        // Logo click - return to dashboard
        const logoLink = document.getElementById('logoLink');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Only navigate if not already on dashboard
                const dashboard = document.getElementById('dashboard');
                if (dashboard && dashboard.classList.contains('d-none')) {
                    this.returnToDashboard();
                }
            });
        }
        
        // Dashboard mode selection
        const startAsDetective = document.getElementById('startAsDetective');
        const startSolvedMystery = document.getElementById('startSolvedMystery');
        
        if (startAsDetective) {
            startAsDetective.addEventListener('click', () => this.startMystery('as_detective'));
        }
        
        if (startSolvedMystery) {
            startSolvedMystery.addEventListener('click', () => this.startMystery('solved_mystery'));
        }
        
        // Language selector
        const languageDropdown = document.querySelectorAll('[data-lang]');
        languageDropdown.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = item.getAttribute('data-lang');
                this.languageManager.switchLanguage(lang);
            });
        });
        
        // Subscribe button
        const subscribeBtn = document.getElementById('subscribeBtn');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', () => this.showSubscribeModal());
        }
        
        // Subscribe form
        const subscribeForm = document.getElementById('subscribeForm');
        if (subscribeForm) {
            subscribeForm.addEventListener('submit', (e) => this.handleSubscribe(e));
        }
        
        // Back to dashboard
        const backToDashboard = document.getElementById('backToDashboard');
        if (backToDashboard) {
            backToDashboard.addEventListener('click', () => this.returnToDashboard());
        }
        
        // Solution form
        const solutionForm = document.getElementById('solutionForm');
        if (solutionForm) {
            solutionForm.addEventListener('submit', (e) => this.handleSolutionSubmit(e));
        }
        
        // New mystery button
        const newMysteryBtn = document.getElementById('newMysteryBtn');
        if (newMysteryBtn) {
            newMysteryBtn.addEventListener('click', () => {
                const resultModalEl = document.getElementById('resultModal');
                const resultModal = bootstrap.Modal.getInstance(resultModalEl);
                if (resultModal) resultModal.hide();
                this.startMystery(this.currentMode);
            });
        }
        
        // Notes auto-save with mystery-specific localStorage
        const notesArea = document.getElementById('notesArea');
        if (notesArea) {
            notesArea.addEventListener('input', () => {
                const mysteryId = this.currentMystery?.id;
                if (mysteryId) {
                    localStorage.setItem(`detective_notes_${mysteryId}`, notesArea.value);
                }
            });
        }
        
        // Toggle solution section
        const toggleSolutionBtn = document.getElementById('toggleSolutionBtn');
        const solutionHeader = document.getElementById('solutionHeader');
        if (toggleSolutionBtn && solutionHeader) {
            const toggleSolution = () => {
                const solutionSection = document.getElementById('solutionSection');
                const notesTextarea = document.getElementById('notesArea');
                
                if (solutionSection) {
                    solutionSection.classList.toggle('collapsed');
                    
                    // Expand notes when solution is collapsed
                    if (notesTextarea) {
                        notesTextarea.classList.toggle('expanded', solutionSection.classList.contains('collapsed'));
                    }
                }
            };
            
            toggleSolutionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSolution();
            });
            
            solutionHeader.addEventListener('click', toggleSolution);
        }
        
        // Toggle right sidebar collapse
        const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', () => {
                const notesSidebar = document.getElementById('notesSidebar');
                const boardContainer = document.querySelector('.investigation-board-container');
                
                if (notesSidebar && boardContainer) {
                    const isCollapsing = !notesSidebar.classList.contains('collapsed');
                    
                    // Toggle classes
                    notesSidebar.classList.toggle('collapsed');
                    boardContainer.classList.toggle('expanded');
                    
                    // Update button title
                    toggleSidebarBtn.title = isCollapsing ? 'Expand Sidebar' : 'Collapse Sidebar';
                    
                    // Resize canvas during and after transition for smooth animation
                    const resizeSteps = [100, 200, 300, 400];
                    resizeSteps.forEach(delay => {
                        setTimeout(() => {
                            if (this.investigationBoard) {
                                this.investigationBoard.resizeCanvas();
                            }
                        }, delay);
                    });
                }
            });
        }
    }
    
    initializeComponents() {
        // Initialize mystery loader
        this.mysteryLoader = new MysteryLoader();
        
        // Initialize card manager — also expose globally for inline onclick handlers
        this.cardManager = new CardManager();
        window.cardManager = this.cardManager;
        
        // Initialize investigation board
        const boardCanvas = document.getElementById('investigationBoard');
        if (boardCanvas) {
            this.investigationBoard = new InvestigationBoard(boardCanvas);
        }
        
        // Initialize audio player
        this.audioPlayer = new AudioPlayer();
    }

    // ─────────────────────────────────────────────────────────────────
    // BUG FIX #1 — Firebase Realtime Database returns arrays as objects
    // when keys are sequential strings ("0","1","2"…).  We must convert
    // suspects / weapons / locations / evidence / timeline from object
    // form back to a plain array before the rest of the app uses them.
    // ─────────────────────────────────────────────────────────────────
    normalizeArrayFields(mystery) {
        const toArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            // Firebase stores arrays as objects with numeric string keys
            return Object.keys(val)
                .sort((a, b) => Number(a) - Number(b))
                .map(k => val[k]);
        };

        mystery.suspects  = toArray(mystery.suspects);
        mystery.weapons   = toArray(mystery.weapons);
        mystery.locations = toArray(mystery.locations);
        mystery.evidence  = toArray(mystery.evidence);
        mystery.timeline  = toArray(mystery.timeline);

        // Also normalise solution.key_evidence and solution.red_herrings
        if (mystery.solution) {
            mystery.solution.key_evidence = toArray(mystery.solution.key_evidence);
            mystery.solution.red_herrings = toArray(mystery.solution.red_herrings);
        }

        return mystery;
    }
    
    async startMystery(mode) {
        try {
            this.currentMode = mode;
            this.showLoading(true);
            
            // Fetch random mystery
            let mystery = await getRandomMystery(mode);
            
            if (!mystery) {
                this.showError(this.languageManager.translate('error.noMystery'));
                this.showLoading(false);
                return;
            }

            // BUG FIX #1 — normalise Firebase object-arrays → real arrays
            mystery = this.normalizeArrayFields(mystery);
            
            this.currentMystery = mystery;
            
            // Hide dashboard, show mystery view
            document.getElementById('dashboard').classList.add('d-none');
            document.getElementById('mysteryView').classList.remove('d-none');
            
            // Hide language selector when entering mystery view
            const languageSelector = document.getElementById('languageSelector');
            if (languageSelector) {
                languageSelector.style.display = 'none';
            }
            
            // Load mystery content
            this.mysteryLoader.loadMystery(mystery, this.languageManager.currentLang);

            // Load evidence cards BEFORE showing the story modal so the
            // investigation view is ready when the user dismisses the modal
            this.cardManager.loadCards(mystery, this.languageManager.currentLang);
            
            // Load saved notes for this mystery
            this.loadSavedNotes(mystery.id);
            
            // Reload investigation board state for this mystery
            if (this.investigationBoard) {
                this.investigationBoard.reloadForMystery();
            }
            
            // Populate solution dropdowns
            this.populateSolutionDropdowns(mystery);
            
            // Hide solution section for solved mystery mode
            if (mode === 'solved_mystery') {
                const solutionSection = document.getElementById('solutionSection');
                if (solutionSection) {
                    solutionSection.style.display = 'none';
                }
            } else {
                // Ensure solution section is visible for detective mode (but keep it collapsed by default)
                const solutionSection = document.getElementById('solutionSection');
                const notesTextarea = document.getElementById('notesArea');
                if (solutionSection) {
                    solutionSection.style.display = 'block';
                    // Keep collapsed class to start collapsed by default
                    // Expand notes since solution starts collapsed
                    if (notesTextarea && solutionSection.classList.contains('collapsed')) {
                        notesTextarea.classList.add('expanded');
                    }
                }
            }

            this.showLoading(false);

            // Show story modal AFTER loading is hidden so it's clearly visible
            this.showStoryModal(mystery, mode);
            
        } catch (error) {
            console.error('Error starting mystery:', error);
            this.showError(this.languageManager.translate('error.loadFailed'));
            this.showLoading(false);
        }
    }
    
    // ─────────────────────────────────────────────────────────────────
    // BUG FIX #2 — storyModal had data-bs-backdrop="static" AND a
    // btn-close button but NO "Begin Investigation" dismiss worked
    // because the modal was blocking all interaction behind it.
    // Fix: remove static backdrop so the modal can be dismissed, and
    // wire up the "solved mystery" result only AFTER the modal closes.
    // ─────────────────────────────────────────────────────────────────
    showStoryModal(mystery, mode) {
        const storyModalEl = document.getElementById('storyModal');
        const storyTitle   = document.getElementById('storyTitle');
        const storyContent = document.getElementById('storyContent');
        
        const lang  = this.languageManager.currentLang;
        const title = mystery.title[lang] || mystery.title.en;
        const story = mystery.story[lang]  || mystery.story.en;
        
        if (storyTitle)   storyTitle.textContent = title;
        if (storyContent) storyContent.innerHTML = `<p>${story.replace(/\n/g, '</p><p>')}</p>`;
        
        // Setup audio player for story
        this.audioPlayer.loadText(story, lang);

        // Update button text based on mode
        const modalButton = storyModalEl.querySelector('.modal-footer button[data-bs-dismiss="modal"]');
        if (modalButton) {
            const buttonText = modalButton.querySelector('span');
            if (mode === 'solved_mystery') {
                // For solved mystery, show "View Solution" instead of "Begin Investigation"
                if (buttonText) {
                    buttonText.textContent = this.languageManager.translate('story.viewSolution') || 'View Solution';
                }
            } else {
                // For detective mode, show "Begin Investigation"
                if (buttonText) {
                    buttonText.textContent = this.languageManager.translate('story.beginInvestigation') || 'Begin Investigation';
                }
            }
        }

        // BUG FIX #2b — for solved_mystery, show result AFTER modal closes
        if (mode === 'solved_mystery') {
            const onHidden = () => {
                storyModalEl.removeEventListener('hidden.bs.modal', onHidden);
                this.showResult(true);
            };
            storyModalEl.addEventListener('hidden.bs.modal', onHidden);
        }
        
        // BUG FIX #2a — Remove backdrop entirely to prevent any interference with clicks
        // The modal can still be dismissed via the close button or "Begin Investigation" button
        const storyModal = new bootstrap.Modal(storyModalEl, { backdrop: false, keyboard: true });
        storyModal.show();
    }
    
    populateSolutionDropdowns(mystery) {
        const culpritSelect  = document.getElementById('culpritSelect');
        const weaponSelect   = document.getElementById('weaponSelect');
        const locationSelect = document.getElementById('locationSelect');
        
        // BUG FIX #3 — guard against non-array values (safety net on top
        // of normalizeArrayFields, in case this is called independently)
        const toArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            return Object.keys(val).sort((a,b) => Number(a)-Number(b)).map(k => val[k]);
        };

        if (culpritSelect) {
            culpritSelect.innerHTML = '<option value="">Select suspect...</option>';
            toArray(mystery.suspects).forEach(suspect => {
                const option = document.createElement('option');
                option.value = suspect.id;
                option.textContent = suspect.name;
                culpritSelect.appendChild(option);
            });
        }
        
        if (weaponSelect) {
            weaponSelect.innerHTML = '<option value="">Select weapon...</option>';
            toArray(mystery.weapons).forEach(weapon => {
                const option = document.createElement('option');
                option.value = weapon.id;
                option.textContent = weapon.name;
                weaponSelect.appendChild(option);
            });
        }
        
        if (locationSelect) {
            locationSelect.innerHTML = '<option value="">Select location...</option>';
            toArray(mystery.locations).forEach(location => {
                const option = document.createElement('option');
                option.value = location.id;
                option.textContent = location.name;
                locationSelect.appendChild(option);
            });
        }
    }
    
    handleSolutionSubmit(e) {
        e.preventDefault();
        
        const culprit  = document.getElementById('culpritSelect').value;
        const weapon   = document.getElementById('weaponSelect').value;
        const location = document.getElementById('locationSelect').value;
        
        if (!culprit || !weapon || !location) {
            alert(this.languageManager.translate('alerts.selectAllFields'));
            return;
        }
        
        const isCorrect = this.checkSolution(culprit, weapon, location);
        this.showResult(isCorrect);
    }
    
    checkSolution(culprit, weapon, location) {
        const solution = this.currentMystery.solution;
        return (
            culprit  === solution.culprit  &&
            weapon   === solution.weapon   &&
            location === solution.location
        );
    }
    
    showResult(isCorrect) {
        const resultModalEl = document.getElementById('resultModal');
        const resultHeader  = document.getElementById('resultHeader');
        const resultTitle   = document.getElementById('resultTitle');
        const resultBody    = document.getElementById('resultBody');
        const lang          = this.languageManager.currentLang;
        
        // For solved mystery mode, show solution without correct/incorrect messaging
        if (this.currentMode === 'solved_mystery') {
            resultHeader.classList.remove('incorrect', 'correct');
            resultTitle.textContent = this.languageManager.translate('result.solution') || 'The Solution';
        } else if (isCorrect) {
            resultHeader.classList.remove('incorrect');
            resultHeader.classList.add('correct');
            resultTitle.textContent = this.languageManager.translate('result.correct');
        } else {
            resultHeader.classList.remove('correct');
            resultHeader.classList.add('incorrect');
            resultTitle.textContent = this.languageManager.translate('result.incorrect');
        }
        
        const solution = this.currentMystery.solution;

        // BUG FIX #4 — suspects may still be an object from Firebase in
        // edge cases; use the already-normalised array on currentMystery
        const culprit = this.currentMystery.suspects.find(s => s.id === solution.culprit);

        // BUG FIX #5 — evidence array lookup guard
        const evidenceArray = this.currentMystery.evidence || [];

        // BUG FIX #6 — key_evidence and red_herrings are already
        // normalised arrays; guard against null just in case
        const keyEvidence  = solution.key_evidence  || [];
        const redHerrings  = solution.red_herrings   || [];

        let resultHTML = `
            <div class="result-icon ${isCorrect ? 'correct' : 'incorrect'}">
                <i class="fas fa-${isCorrect ? 'check-circle' : 'times-circle'}"></i>
            </div>
            
            <div class="solution-details">
                <h6>${this.languageManager.translate('result.actualCulprit')}</h6>
                <div class="culprit-info">
                    ${culprit && culprit.photo ? `<img src="${culprit.photo}" alt="${culprit.name}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--crimson);">` : ''}
                    <div class="culprit-details">
                        <h6>${culprit ? culprit.name : 'Unknown'}</h6>
                        <p>${culprit ? `${culprit.occupation}, ${culprit.age} years old` : ''}</p>
                    </div>
                </div>
                
                <h6>${this.languageManager.translate('result.howItHappened')}</h6>
                <p>${solution.explanation[lang] || solution.explanation.en}</p>
                
                <h6>${this.languageManager.translate('result.keyEvidence')}</h6>
                <ul class="evidence-list">
                    ${keyEvidence.map(evidenceId => {
                        const ev = evidenceArray.find(e => e.id === evidenceId);
                        return ev ? `<li><i class="fas fa-fingerprint me-2"></i>${ev.name}</li>` : '';
                    }).join('')}
                </ul>
                
                ${redHerrings.length > 0 ? `
                    <h6>${this.languageManager.translate('result.redHerrings')}</h6>
                    <p>These clues were meant to mislead you:</p>
                    <ul class="evidence-list">
                        ${redHerrings.map(item => {
                            // Handle both string and object formats for red herrings
                            const text = typeof item === 'string' ? item : (item[lang] || item.en || JSON.stringify(item));
                            return `<li><i class="fas fa-times me-2" style="color:var(--crimson)"></i>${text}</li>`;
                        }).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
        
        resultBody.innerHTML = resultHTML;

        // BUG FIX #7 — always create a fresh Modal instance so stacking
        // modals (storyModal → resultModal) don't conflict
        const resultModal = new bootstrap.Modal(resultModalEl, { backdrop: 'static' });
        resultModal.show();
    }
    
    returnToDashboard() {
        // Stop any playing audio first
        if (this.audioPlayer) this.audioPlayer.reset();

        // Hide any open modals cleanly before navigating away
        ['storyModal', 'resultModal'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const instance = bootstrap.Modal.getInstance(el);
                if (instance) instance.hide();
            }
        });

        // Clear current mystery
        this.currentMystery = null;
        this.currentMode = null;
        
        // Clear notes display (but keep in localStorage)
        const notesArea = document.getElementById('notesArea');
        if (notesArea) notesArea.value = '';
        
        // Clear board display (but keep in localStorage)
        if (this.investigationBoard) {
            this.investigationBoard.elements = [];
            this.investigationBoard.connections = [];
            this.investigationBoard.draw();
        }
        
        // Show dashboard, hide mystery view
        document.getElementById('mysteryView').classList.add('d-none');
        document.getElementById('dashboard').classList.remove('d-none');
        
        // Show language selector when returning to dashboard
        const languageSelector = document.getElementById('languageSelector');
        if (languageSelector) {
            languageSelector.style.display = 'block';
        }
        
        // Restore solution section for next play
        const solutionSection = document.getElementById('solutionSection');
        if (solutionSection) solutionSection.style.display = 'block';

        // Reset solution dropdowns
        ['culpritSelect','weaponSelect','locationSelect'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });

        const motiveText = document.getElementById('motiveText');
        if (motiveText) motiveText.value = '';
    }
    
    showSubscribeModal() {
        const subscribeModal = new bootstrap.Modal(document.getElementById('subscribeModal'));
        subscribeModal.show();
    }
    
    async handleSubscribe(e) {
        e.preventDefault();
        
        const email    = document.getElementById('subscriberEmail').value;
        const name     = document.getElementById('subscriberName').value;
        const feedback = document.getElementById('subscriberFeedback').value;
        const preferences = [];
        
        if (document.getElementById('prefHistorical').checked)   preferences.push('historical');
        if (document.getElementById('prefModern').checked)        preferences.push('modern');
        if (document.getElementById('prefForensic').checked)      preferences.push('forensic');
        if (document.getElementById('prefPsychological').checked) preferences.push('psychological');
        
        try {
            // Check if email already exists
            const emailExists = await checkEmailExists(email);
            
            if (emailExists) {
                alert(this.languageManager.translate('subscribe.alreadySubscribed') || 'You are already subscribed with this email address!');
                return;
            }
            
            await addSubscriber({
                email,
                name,
                preferred_types: preferences,
                feedback,
                language_preference: this.languageManager.currentLang
            });
            
            alert(this.languageManager.translate('subscribe.success'));
            
            const subscribeModal = bootstrap.Modal.getInstance(document.getElementById('subscribeModal'));
            if (subscribeModal) subscribeModal.hide();
            document.getElementById('subscribeForm').reset();
        } catch (error) {
            console.error('Error subscribing:', error);
            alert(this.languageManager.translate('subscribe.error'));
        }
    }
    
    showLoading(show) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.classList.toggle('d-none', !show);
        }
    }
    
    showError(message) {
        alert(message);
    }
    
    loadSavedNotes(mysteryId) {
        const notesArea = document.getElementById('notesArea');
        if (notesArea && mysteryId) {
            const savedNotes = localStorage.getItem(`detective_notes_${mysteryId}`);
            if (savedNotes) {
                notesArea.value = savedNotes;
                console.log('Loaded saved notes for mystery:', mysteryId);
            } else {
                notesArea.value = '';
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.detectiveApp = new DetectiveApp();
});
