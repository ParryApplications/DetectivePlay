// Card Manager
// Handles creation and management of evidence cards

export class CardManager {
    constructor() {
        this.cards = {
            suspects: [],
            weapons: [],
            locations: [],
            evidence: [],
            timeline: []
        };
        this.currentLang = 'en';
        // Store full mystery data so viewDetails can access it
        this.currentMystery = null;
        this.setupSearchListener();
    }
    
    setupSearchListener() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initSearchListener());
        } else {
            this.initSearchListener();
        }
    }
    
    initSearchListener() {
        const searchInput = document.getElementById('evidenceSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }
    
    handleSearch(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        // Get all evidence cards across all tabs
        const allCards = document.querySelectorAll('.evidence-card');
        
        allCards.forEach(card => {
            if (!term) {
                // Show all cards if search is empty
                card.style.display = '';
                return;
            }
            
            // Get card text content for searching
            const cardText = card.textContent.toLowerCase();
            
            // Show/hide based on match
            if (cardText.includes(term)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // BUG FIX — Firebase Realtime DB stores arrays as objects with
    // numeric string keys ("0","1","2"…). Convert them back to arrays.
    // ─────────────────────────────────────────────────────────────────
    toArray(val) {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        return Object.keys(val)
            .sort((a, b) => Number(a) - Number(b))
            .map(k => val[k]);
    }
    
    loadCards(mystery, lang = 'en') {
        console.log('Loading evidence cards...');
        
        this.currentLang    = lang;
        this.currentMystery = mystery;
        
        // Clear existing cards
        this.clearAllCards();
        
        if (mystery.suspects)  this.loadSuspects(this.toArray(mystery.suspects));
        if (mystery.weapons)   this.loadWeapons(this.toArray(mystery.weapons));
        if (mystery.locations) this.loadLocations(this.toArray(mystery.locations));
        if (mystery.evidence)  this.loadEvidence(this.toArray(mystery.evidence));
        if (mystery.timeline)  this.loadTimeline(this.toArray(mystery.timeline));
        
        console.log('Evidence cards loaded successfully');
    }
    
    clearAllCards() {
        ['suspectsList','weaponsList','locationsList','evidenceList','timelineList']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '';
            });
    }
    
    // ── SUSPECTS ──────────────────────────────────────────────────────
    loadSuspects(suspects) {
        const container = document.getElementById('suspectsList');
        if (!container) return;
        suspects.forEach(s => container.appendChild(this.createSuspectCard(s)));
    }
    
    createSuspectCard(suspect) {
        const card = document.createElement('div');
        card.className = 'evidence-card suspect-card';
        card.draggable = true;
        card.dataset.type = 'suspect';
        card.dataset.id   = suspect.id;
        
        const motive = this.getTranslatedText(suspect.motive);
        
        card.innerHTML = `
            <div class="card-header-custom">
                <div class="card-icon suspect"><i class="fas fa-user"></i></div>
                <div class="card-title-custom">
                    <h6>${suspect.name}</h6>
                    <div class="card-subtitle">Suspect</div>
                </div>
            </div>
            ${suspect.photo
                ? `<img src="${suspect.photo}" class="card-image" alt="${suspect.name}">`
                : '<div class="card-image-placeholder"><i class="fas fa-user-circle"></i></div>'}
            <div class="card-body-custom">
                <div class="card-detail">
                    <span class="detail-label">Age:</span>
                    <span class="detail-value">${suspect.age}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Occupation:</span>
                    <span class="detail-value">${suspect.occupation}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Relationship:</span>
                    <span class="detail-value">${suspect.relationship}</span>
                </div>
                ${motive ? `<div class="motive-badge">Possible Motive</div>` : ''}
            </div>
            <div class="card-actions">
                <button class="card-action-btn" onclick="window.cardManager.viewDetails('suspect','${suspect.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="card-action-btn" onclick="window.cardManager.addToBoard('suspect','${suspect.id}')">
                    <i class="fas fa-thumbtack"></i> Pin
                </button>
            </div>
        `;
        
        this.setupDragAndDrop(card);
        return card;
    }
    
    // ── WEAPONS ───────────────────────────────────────────────────────
    loadWeapons(weapons) {
        const container = document.getElementById('weaponsList');
        if (!container) return;
        weapons.forEach(w => container.appendChild(this.createWeaponCard(w)));
    }
    
    createWeaponCard(weapon) {
        const card = document.createElement('div');
        card.className = 'evidence-card weapon-card';
        card.draggable = true;
        card.dataset.type = 'weapon';
        card.dataset.id   = weapon.id;
        
        const details = this.getTranslatedText(weapon.details);
        
        card.innerHTML = `
            <div class="card-header-custom">
                <div class="card-icon weapon"><i class="fas fa-gun"></i></div>
                <div class="card-title-custom">
                    <h6>${weapon.name}</h6>
                    <div class="card-subtitle">Weapon</div>
                </div>
            </div>
            ${weapon.image
                ? `<img src="${weapon.image}" class="card-image" alt="${weapon.name}">`
                : '<div class="card-image-placeholder"><i class="fas fa-crosshairs"></i></div>'}
            <div class="card-body-custom">
                <div class="card-detail">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${weapon.type}</span>
                </div>
                <p>${details.substring(0, 100)}${details.length > 100 ? '…' : ''}</p>
            </div>
            <div class="card-actions">
                <button class="card-action-btn" onclick="window.cardManager.viewDetails('weapon','${weapon.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="card-action-btn" onclick="window.cardManager.addToBoard('weapon','${weapon.id}')">
                    <i class="fas fa-thumbtack"></i> Pin
                </button>
            </div>
        `;
        
        this.setupDragAndDrop(card);
        return card;
    }
    
    // ── LOCATIONS ─────────────────────────────────────────────────────
    loadLocations(locations) {
        const container = document.getElementById('locationsList');
        if (!container) return;
        locations.forEach(l => container.appendChild(this.createLocationCard(l)));
    }
    
    createLocationCard(location) {
        const card = document.createElement('div');
        card.className = 'evidence-card location-card';
        card.draggable = true;
        card.dataset.type = 'location';
        card.dataset.id   = location.id;
        
        const description = this.getTranslatedText(location.description);
        const evidenceFound = this.toArray(location.evidence_found);
        
        card.innerHTML = `
            <div class="card-header-custom">
                <div class="card-icon location"><i class="fas fa-map-marker-alt"></i></div>
                <div class="card-title-custom">
                    <h6>${location.name}</h6>
                    <div class="card-subtitle">Location</div>
                </div>
            </div>
            ${location.image
                ? `<img src="${location.image}" class="card-image" alt="${location.name}">`
                : '<div class="card-image-placeholder"><i class="fas fa-building"></i></div>'}
            <div class="card-body-custom">
                <p>${description.substring(0, 100)}${description.length > 100 ? '…' : ''}</p>
                ${evidenceFound.length > 0
                    ? `<div class="evidence-found"><small>${evidenceFound.length} evidence item(s) found here</small></div>`
                    : ''}
            </div>
            <div class="card-actions">
                <button class="card-action-btn" onclick="window.cardManager.viewDetails('location','${location.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="card-action-btn" onclick="window.cardManager.addToBoard('location','${location.id}')">
                    <i class="fas fa-thumbtack"></i> Pin
                </button>
            </div>
        `;
        
        this.setupDragAndDrop(card);
        return card;
    }
    
    // ── EVIDENCE ──────────────────────────────────────────────────────
    loadEvidence(evidence) {
        const container = document.getElementById('evidenceList');
        if (!container) return;
        evidence.forEach(item => container.appendChild(this.createEvidenceCard(item)));
    }
    
    createEvidenceCard(evidence) {
        const card = document.createElement('div');
        card.className = 'evidence-card';
        card.draggable = true;
        card.dataset.type = 'evidence';
        card.dataset.id   = evidence.id;
        
        const description = this.getTranslatedText(evidence.description);
        
        card.innerHTML = `
            <div class="card-header-custom">
                <div class="card-icon evidence"><i class="fas fa-fingerprint"></i></div>
                <div class="card-title-custom">
                    <h6>${evidence.name}</h6>
                    <div class="card-subtitle">Evidence</div>
                </div>
            </div>
            <div class="evidence-type-badge ${evidence.type}">${evidence.type}</div>
            ${evidence.image
                ? `<img src="${evidence.image}" class="card-image" alt="${evidence.name}">`
                : '<div class="card-image-placeholder"><i class="fas fa-search"></i></div>'}
            <div class="card-body-custom">
                <p>${description.substring(0, 100)}${description.length > 100 ? '…' : ''}</p>
            </div>
            <div class="card-actions">
                <button class="card-action-btn" onclick="window.cardManager.viewDetails('evidence','${evidence.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="card-action-btn" onclick="window.cardManager.addToBoard('evidence','${evidence.id}')">
                    <i class="fas fa-thumbtack"></i> Pin
                </button>
            </div>
        `;
        
        this.setupDragAndDrop(card);
        return card;
    }
    
    // ── TIMELINE ──────────────────────────────────────────────────────
    loadTimeline(timeline) {
        const container = document.getElementById('timelineList');
        if (!container) return;
        timeline.forEach(event => container.appendChild(this.createTimelineCard(event)));
    }
    
    createTimelineCard(event) {
        const card = document.createElement('div');
        card.className = 'evidence-card timeline-card-custom';
        card.draggable = true;
        card.dataset.type = 'timeline';
        card.dataset.id = event.time; // Use time as unique identifier for timeline events
        
        const eventText = this.getTranslatedText(event.event);
        // BUG FIX — witnesses may also come back as an object from Firebase
        const witnesses = this.toArray(event.witnesses);
        
        card.innerHTML = `
            <div class="card-header-custom">
                <div class="card-icon timeline"><i class="fas fa-clock"></i></div>
                <div class="card-title-custom">
                    <h6>${event.time}</h6>
                    <div class="card-subtitle">Timeline Event</div>
                </div>
            </div>
            <div class="card-body-custom">
                <p>${eventText}</p>
                ${event.location
                    ? `<div class="timeline-location-custom"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>`
                    : ''}
                ${witnesses.length > 0
                    ? `<div class="timeline-witnesses">Witnesses: ${witnesses.join(', ')}</div>`
                    : ''}
            </div>
            <div class="card-actions">
                <button class="card-action-btn" onclick="window.cardManager.addToBoard('timeline','${event.time}')">
                    <i class="fas fa-thumbtack"></i> Pin
                </button>
            </div>
        `;
        
        this.setupDragAndDrop(card);
        return card;
    }
    
    // ── DRAG & DROP ───────────────────────────────────────────────────
    setupDragAndDrop(card) {
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'copy';
            const dragData = {
                type: card.dataset.type,
                id:   card.dataset.id,
            };
            e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
            card.classList.add('dragging');
            console.log('Drag started:', dragData);
        });
        
        card.addEventListener('dragend', (e) => {
            card.classList.remove('dragging');
            console.log('Drag ended');
        });
    }
    
    // ── CARD ACTIONS ──────────────────────────────────────────────────

    // BUG FIX — viewDetails now shows a proper Bootstrap modal with full
    // details instead of a bare alert() that blocked the UI.
    viewDetails(type, id) {
        if (!this.currentMystery) return;

        let item   = null;
        let title  = '';
        let bodyHTML = '';

        switch (type) {
            case 'suspect': {
                item  = this.toArray(this.currentMystery.suspects).find(s => s.id === id);
                if (!item) break;
                title = item.name;
                const profile = this.getTranslatedText(item.profile);
                const alibi   = this.getTranslatedText(item.alibi);
                const motive  = this.getTranslatedText(item.motive);
                bodyHTML = `
                    ${item.photo ? `<img src="${item.photo}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid var(--crimson);display:block;margin:0 auto 1rem;">` : ''}
                    <p><strong style="color:var(--warm-amber)">Age:</strong> ${item.age}</p>
                    <p><strong style="color:var(--warm-amber)">Occupation:</strong> ${item.occupation}</p>
                    <p><strong style="color:var(--warm-amber)">Relationship:</strong> ${item.relationship}</p>
                    <hr style="border-color:var(--steel-blue)">
                    <p><strong style="color:var(--warm-amber)">Profile:</strong><br>${profile}</p>
                    <p><strong style="color:var(--warm-amber)">Alibi:</strong><br>${alibi}</p>
                    ${motive ? `<p><strong style="color:var(--crimson)">Possible Motive:</strong><br>${motive}</p>` : ''}
                `;
                break;
            }
            case 'weapon': {
                item  = this.toArray(this.currentMystery.weapons).find(w => w.id === id);
                if (!item) break;
                title = item.name;
                const details   = this.getTranslatedText(item.details);
                const forensics = this.getTranslatedText(item.forensics);
                bodyHTML = `
                    <p><strong style="color:var(--warm-amber)">Type:</strong> ${item.type}</p>
                    <hr style="border-color:var(--steel-blue)">
                    <p><strong style="color:var(--warm-amber)">Details:</strong><br>${details}</p>
                    ${forensics ? `<p><strong style="color:var(--warm-amber)">Forensics:</strong><br>${forensics}</p>` : ''}
                `;
                break;
            }
            case 'location': {
                item  = this.toArray(this.currentMystery.locations).find(l => l.id === id);
                if (!item) break;
                title = item.name;
                const desc = this.getTranslatedText(item.description);
                bodyHTML = `<p>${desc}</p>`;
                break;
            }
            case 'evidence': {
                item  = this.toArray(this.currentMystery.evidence).find(e => e.id === id);
                if (!item) break;
                title = item.name;
                const evDesc = this.getTranslatedText(item.description);
                const evSig  = this.getTranslatedText(item.significance);
                bodyHTML = `
                    <span class="evidence-type-badge ${item.type}" style="margin-bottom:1rem;display:inline-block">${item.type}</span>
                    <p><strong style="color:var(--warm-amber)">Description:</strong><br>${evDesc}</p>
                    ${evSig ? `<p><strong style="color:var(--warm-amber)">Significance:</strong><br>${evSig}</p>` : ''}
                `;
                break;
            }
            default:
                return;
        }

        if (!item) {
            console.warn(`Item not found: ${type} ${id}`);
            return;
        }

        // Reuse or create a detail modal
        let detailModal = document.getElementById('cardDetailModal');
        if (!detailModal) {
            detailModal = document.createElement('div');
            detailModal.id        = 'cardDetailModal';
            detailModal.className = 'modal fade';
            detailModal.tabIndex  = -1;
            detailModal.innerHTML = `
                <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="cardDetailModalTitle"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="cardDetailModalBody" style="color:var(--cream)"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(detailModal);
        }

        document.getElementById('cardDetailModalTitle').textContent = title;
        document.getElementById('cardDetailModalBody').innerHTML    = bodyHTML;

        const modal = new bootstrap.Modal(detailModal);
        modal.show();
    }
    
    addToBoard(type, id) {
        if (window.detectiveApp && window.detectiveApp.investigationBoard) {
            window.detectiveApp.investigationBoard.addElement(type, id);
        }
    }
    
    getTranslatedText(textObject) {
        if (!textObject) return '';
        if (typeof textObject === 'string') return textObject;
        return textObject[this.currentLang] || textObject.en || '';
    }
}

// Expose globally for inline onclick handlers in card HTML
window.cardManager = new CardManager();
