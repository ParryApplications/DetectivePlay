// Mystery List Manager
// Handles displaying paginated mystery list with continue/start functionality

import { getAllMysteries } from './firebase-config.js';

export class MysteryListManager {
    constructor(languageManager) {
        this.languageManager = languageManager;
        this.mysteries = [];
        this.currentPage = 1;
        this.mysteriesPerPage = 6;
        this.currentMode = null;
        this.onMysterySelected = null;
    }

    /**
     * Check if a mystery has been started (has data in localStorage)
     * @param {string} mysteryId - The mystery ID
     * @returns {boolean} - True if mystery has been started
     */
    isMysteryStarted(mysteryId) {
        // Check if there's any saved data for this mystery
        const hasNotes = localStorage.getItem(`detective_notes_${mysteryId}`) !== null;
        const hasBoard = localStorage.getItem(`investigation_board_${mysteryId}`) !== null;
        
        return hasNotes || hasBoard;
    }

    /**
     * Get mystery progress percentage (optional - for future enhancement)
     * @param {string} mysteryId - The mystery ID
     * @returns {number} - Progress percentage (0-100)
     */
    getMysteryProgress(mysteryId) {
        // For now, return 0 or 100 based on whether it's started
        // In future, could track actual progress
        return this.isMysteryStarted(mysteryId) ? 50 : 0;
    }

    /**
     * Show the mystery list modal
     * @param {string} mode - The game mode ('as_detective' or 'solved_mystery')
     * @param {Function} onSelect - Callback when mystery is selected
     */
    async showMysteryList(mode, onSelect) {
        this.currentMode = mode;
        this.onMysterySelected = onSelect;
        this.currentPage = 1;

        try {
            // Fetch all mysteries from Firebase
            const allMysteries = await getAllMysteries();
            
            // Filter active mysteries
            this.mysteries = allMysteries.filter(m => m.is_active);

            if (this.mysteries.length === 0) {
                this.showError('No mysteries available at the moment.');
                return;
            }

            // Render the list
            this.renderMysteryList();
            this.renderPagination();

            // Show the modal
            const modalEl = document.getElementById('mysteryListModal');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();

        } catch (error) {
            console.error('Error loading mysteries:', error);
            this.showError('Failed to load mysteries. Please try again.');
        }
    }

    /**
     * Render the mystery list for current page
     */
    renderMysteryList() {
        const container = document.getElementById('mysteryListContainer');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.mysteriesPerPage;
        const endIndex = startIndex + this.mysteriesPerPage;
        const pageMysteriesData = this.mysteries.slice(startIndex, endIndex);

        if (pageMysteriesData.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No mysteries found.</p>';
            return;
        }

        const lang = this.languageManager.currentLang;
        
        container.innerHTML = pageMysteriesData.map(mystery => {
            const title = mystery.title[lang] || mystery.title.en;
            const story = mystery.story[lang] || mystery.story.en;
            const storyPreview = story.substring(0, 200) + '...';
            const isStarted = this.isMysteryStarted(mystery.id);
            const progress = this.getMysteryProgress(mystery.id);
            
            // Get difficulty badge color
            const difficultyColors = {
                'easy': 'success',
                'medium': 'warning',
                'hard': 'danger'
            };
            const difficultyColor = difficultyColors[mystery.difficulty] || 'secondary';

            return `
                <div class="mystery-card" data-mystery-id="${mystery.id}">
                    <div class="mystery-card-header">
                        <h5 class="mystery-card-title">${title}</h5>
                        <span class="badge bg-${difficultyColor}">${mystery.difficulty || 'medium'}</span>
                    </div>
                    <div class="mystery-card-body">
                        <p class="mystery-card-preview">${storyPreview}</p>
                        <div class="mystery-card-meta">
                            <span><i class="fas fa-users me-1"></i> ${mystery.suspects?.length || 0} Suspects</span>
                            <span><i class="fas fa-fingerprint me-1"></i> ${mystery.evidence?.length || 0} Evidence</span>
                            <span><i class="fas fa-map-marker-alt me-1"></i> ${mystery.locations?.length || 0} Locations</span>
                        </div>
                        ${isStarted ? `
                            <div class="mystery-progress mt-2">
                                <small class="text-muted">In Progress</small>
                                <div class="progress" style="height: 4px;">
                                    <div class="progress-bar bg-warning" role="progressbar" style="width: ${progress}%"></div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="mystery-card-footer">
                        <button class="btn ${isStarted ? 'btn-warning' : 'btn-primary'} mystery-select-btn" 
                                data-mystery-id="${mystery.id}"
                                onclick="window.soundEffects?.playClick()">
                            <i class="fas fa-${isStarted ? 'play-circle' : 'search'} me-2"></i>
                            ${isStarted ? this.languageManager.translate('mysteryList.continue') || 'Continue' : this.languageManager.translate('mysteryList.start') || 'Start Investigation'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add click event listeners to all select buttons
        container.querySelectorAll('.mystery-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mysteryId = e.currentTarget.getAttribute('data-mystery-id');
                this.selectMystery(mysteryId);
            });
        });
    }

    /**
     * Render pagination controls
     */
    renderPagination() {
        const paginationContainer = document.getElementById('mysteryPagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.mysteries.length / this.mysteriesPerPage);

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage - 1}" onclick="window.soundEffects?.playClick()">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            // Show first page, last page, current page, and pages around current
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}" onclick="window.soundEffects?.playClick()">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage + 1}" onclick="window.soundEffects?.playClick()">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        paginationContainer.innerHTML = paginationHTML;

        // Add click event listeners
        paginationContainer.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.getAttribute('data-page'));
                if (page && page !== this.currentPage && page >= 1 && page <= totalPages) {
                    this.currentPage = page;
                    this.renderMysteryList();
                    this.renderPagination();
                    
                    // Scroll to top of modal
                    const modalBody = document.querySelector('#mysteryListModal .modal-body');
                    if (modalBody) {
                        modalBody.scrollTop = 0;
                    }
                }
            });
        });
    }

    /**
     * Handle mystery selection
     * @param {string} mysteryId - The selected mystery ID
     */
    selectMystery(mysteryId) {
        const selectedMystery = this.mysteries.find(m => m.id === mysteryId);
        
        if (!selectedMystery) {
            console.error('Mystery not found:', mysteryId);
            return;
        }

        // Close the modal
        const modalEl = document.getElementById('mysteryListModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) {
            modal.hide();
        }

        // Call the callback with the selected mystery
        if (this.onMysterySelected) {
            this.onMysterySelected(selectedMystery);
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        alert(message);
    }
}
