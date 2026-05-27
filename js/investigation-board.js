// Investigation Board
// Handles the interactive cork board for connecting evidence

export class InvestigationBoard {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.elements = [];
        this.connections = [];
        this.connectionMode = false;
        this.selectedElement = null;
        this.isDragging = false;
        this.draggedElement = null;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Investigation Board...');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load saved state from localStorage
        this.loadState();
        
        // Draw initial board
        this.draw();
        
        // Setup board controls
        this.setupControls();
        
        console.log('Investigation Board initialized');
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Only resize if dimensions are valid
        if (width > 0 && height > 0) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.draw();
        } else {
            // Retry after a short delay if container isn't ready
            setTimeout(() => this.resizeCanvas(), 100);
        }
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        
        // Drag and drop from evidence cards
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'copy';
            }
        });
        
        this.canvas.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        this.canvas.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Touch events for tablets (if needed in future)
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    setupControls() {
        // Clear board button
        const clearBtn = document.getElementById('clearBoard');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }
        
        // Toggle connections button
        const toggleBtn = document.getElementById('toggleConnections');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleConnectionMode());
        }
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on an element
        const element = this.getElementAt(x, y);
        
        if (element) {
            if (this.connectionMode) {
                // Connection mode: select element for connection
                if (!this.selectedElement) {
                    this.selectedElement = element;
                    element.selected = true;
                } else if (this.selectedElement !== element) {
                    // Create connection
                    this.addConnection(this.selectedElement, element);
                    this.selectedElement.selected = false;
                    this.selectedElement = null;
                }
                this.draw();
            } else {
                // Drag mode: start dragging
                this.isDragging = true;
                this.draggedElement = element;
                this.offsetX = x - element.x;
                this.offsetY = y - element.y;
                this.canvas.style.cursor = 'move';
            }
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.isDragging && this.draggedElement) {
            // Update element position
            this.draggedElement.x = x - this.offsetX;
            this.draggedElement.y = y - this.offsetY;
            this.draw();
        } else {
            // Update cursor based on hover
            const element = this.getElementAt(x, y);
            if (element) {
                this.canvas.style.cursor = this.connectionMode ? 'crosshair' : 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }
    
    handleMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.draggedElement = null;
            this.canvas.style.cursor = 'default';
            
            // Save board state
            this.saveState();
        }
    }
    
    handleDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if double-clicking on an element
        const element = this.getElementAt(x, y);
        
        if (element) {
            console.log('Double-clicked element:', element);
            this.viewElementDetails(element);
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const dataText = e.dataTransfer.getData('text/plain');
            if (!dataText) {
                console.warn('No data in drop event');
                return;
            }
            
            const data = JSON.parse(dataText);
            if (!data.type || !data.id) {
                console.warn('Invalid drop data:', data);
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            console.log(`Dropping ${data.type} ${data.id} at (${x}, ${y})`);
            this.addElement(data.type, data.id, x, y);
        } catch (error) {
            console.error('Error handling drop:', error);
        }
    }
    
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseDown(mouseEvent);
        }
    }
    
    handleTouchMove(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseMove(mouseEvent);
        }
    }
    
    handleTouchEnd(e) {
        const mouseEvent = new MouseEvent('mouseup', {});
        this.handleMouseUp(mouseEvent);
    }
    
    addElement(type, id, x = null, y = null) {
        // Get mystery data to find element details
        const mystery = window.detectiveApp?.currentMystery;
        if (!mystery) {
            console.error('No mystery data available');
            return;
        }
        
        let elementData = null;
        let category = null;
        
        // Find element in mystery data
        switch(type) {
            case 'suspect':
                elementData = mystery.suspects?.find(s => s.id === id);
                category = 'suspects';
                break;
            case 'weapon':
                elementData = mystery.weapons?.find(w => w.id === id);
                category = 'weapons';
                break;
            case 'location':
                elementData = mystery.locations?.find(l => l.id === id);
                category = 'locations';
                break;
            case 'evidence':
                elementData = mystery.evidence?.find(e => e.id === id);
                category = 'evidence';
                break;
            case 'timeline':
                // For timeline, id is the time string
                elementData = mystery.timeline?.find(t => t.time === id);
                category = 'timeline';
                break;
        }
        
        if (!elementData) {
            console.error(`Element not found: ${type} ${id}`);
            console.log('Available mystery data:', mystery);
            return;
        }
        
        // Create board element
        const element = {
            id: `${type}_${id}_${Date.now()}`,
            type: type,
            dataId: id,
            x: x !== null ? x : Math.random() * (this.canvas.width - 200) + 50,
            y: y !== null ? y : Math.random() * (this.canvas.height - 150) + 50,
            width: 180,
            height: 140,
            name: type === 'timeline' ? elementData.time : elementData.name,
            image: elementData.photo || elementData.image,
            selected: false
        };
        
        console.log(`Adding element to board at (${element.x}, ${element.y}):`, element);
        this.elements.push(element);
        console.log(`Total elements on board: ${this.elements.length}`);
        
        this.draw();
        this.saveState();
        
        console.log(`Successfully added ${type} to board: ${element.name}`);
    }
    
    addConnection(element1, element2) {
        // Check if connection already exists
        const exists = this.connections.some(conn => 
            (conn.from === element1 && conn.to === element2) ||
            (conn.from === element2 && conn.to === element1)
        );
        
        if (!exists) {
            this.connections.push({
                from: element1,
                to: element2,
                color: '#dc143c'
            });
            this.saveState();
            console.log('Connection created');
        }
    }
    
    getElementAt(x, y) {
        // Check elements in reverse order (top to bottom)
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const el = this.elements[i];
            if (x >= el.x && x <= el.x + el.width &&
                y >= el.y && y <= el.y + el.height) {
                return el;
            }
        }
        return null;
    }
    
    toggleConnectionMode() {
        this.connectionMode = !this.connectionMode;
        
        // Update UI
        const toggleBtn = document.getElementById('toggleConnections');
        if (toggleBtn) {
            if (this.connectionMode) {
                toggleBtn.classList.add('active');
                this.canvas.classList.add('connection-mode');
            } else {
                toggleBtn.classList.remove('active');
                this.canvas.classList.remove('connection-mode');
            }
        }
        
        // Clear selection
        if (this.selectedElement) {
            this.selectedElement.selected = false;
            this.selectedElement = null;
        }
        
        this.draw();
        console.log('Connection mode:', this.connectionMode);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections first (behind elements)
        this.drawConnections();
        
        // Draw elements
        this.drawElements();
        
        // Draw empty state message if no elements
        if (this.elements.length === 0) {
            this.drawEmptyState();
        }
    }
    
    drawConnections() {
        this.connections.forEach(conn => {
            // Connect from top center (where the pushpin is)
            const fromPoint = {
                x: conn.from.x + conn.from.width / 2,
                y: conn.from.y
            };
            const toPoint = {
                x: conn.to.x + conn.to.width / 2,
                y: conn.to.y
            };
            
            // Draw string/thread
            this.ctx.beginPath();
            this.ctx.moveTo(fromPoint.x, fromPoint.y);
            this.ctx.lineTo(toPoint.x, toPoint.y);
            this.ctx.strokeStyle = conn.color;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        });
    }
    
    drawElements() {
        console.log(`Drawing ${this.elements.length} elements`);
        
        this.elements.forEach(element => {
            // Save context state
            this.ctx.save();
            
            // Draw card shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = 3;
            this.ctx.shadowOffsetY = 3;
            
            // Draw card background (white card)
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(element.x, element.y, element.width, element.height);
            
            // Draw card border
            this.ctx.strokeStyle = '#cccccc';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(element.x, element.y, element.width, element.height);
            
            // Reset shadow for inner content
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Draw selection border
            if (element.selected) {
                this.ctx.strokeStyle = '#f77f00';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(element.x, element.y, element.width, element.height);
            }
            
            // Draw image placeholder with type-specific styling
            const imageX = element.x + 10;
            const imageY = element.y + 10;
            const imageWidth = element.width - 20;
            const imageHeight = 100;
            
            // Create gradient based on element type
            let gradient;
            let iconColor;
            let iconText;
            let useFontAwesome = false;
            
            switch(element.type) {
                case 'suspect':
                    gradient = this.ctx.createLinearGradient(imageX, imageY, imageX, imageY + imageHeight);
                    gradient.addColorStop(0, '#2d1b1b');
                    gradient.addColorStop(0.5, '#4a1f1f');
                    gradient.addColorStop(1, '#2d1b1b');
                    iconColor = '#ff6b6b';
                    iconText = '\uf007'; // fa-user
                    useFontAwesome = true;
                    break;
                case 'weapon':
                    gradient = this.ctx.createLinearGradient(imageX, imageY, imageX, imageY + imageHeight);
                    gradient.addColorStop(0, '#1a2332');
                    gradient.addColorStop(0.5, '#2a3f5f');
                    gradient.addColorStop(1, '#1a2332');
                    iconColor = '#4dabf7';
                    iconText = '\uf05b'; // fa-crosshairs
                    useFontAwesome = true;
                    break;
                case 'location':
                    gradient = this.ctx.createLinearGradient(imageX, imageY, imageX, imageY + imageHeight);
                    gradient.addColorStop(0, '#1a2e1a');
                    gradient.addColorStop(0.5, '#2d4a2d');
                    gradient.addColorStop(1, '#1a2e1a');
                    iconColor = '#51cf66';
                    iconText = '\uf3c5'; // fa-map-marker-alt
                    useFontAwesome = true;
                    break;
                case 'evidence':
                    gradient = this.ctx.createLinearGradient(imageX, imageY, imageX, imageY + imageHeight);
                    gradient.addColorStop(0, '#332a1a');
                    gradient.addColorStop(0.5, '#4a3f2a');
                    gradient.addColorStop(1, '#332a1a');
                    iconColor = '#ffd43b';
                    iconText = '\uf002'; // fa-search
                    useFontAwesome = true;
                    break;
                case 'timeline':
                    gradient = this.ctx.createLinearGradient(imageX, imageY, imageX, imageY + imageHeight);
                    gradient.addColorStop(0, '#2a1f3a');
                    gradient.addColorStop(0.5, '#3f2a5f');
                    gradient.addColorStop(1, '#2a1f3a');
                    iconColor = '#a78bfa';
                    iconText = '\uf017'; // fa-clock
                    useFontAwesome = true;
                    break;
                default:
                    gradient = this.ctx.createLinearGradient(imageX, imageY, imageX, imageY + imageHeight);
                    gradient.addColorStop(0, '#e0e0e0');
                    gradient.addColorStop(1, '#c0c0c0');
                    iconColor = '#999999';
                    iconText = '\uf030'; // fa-camera
                    useFontAwesome = true;
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
            
            // Draw subtle border
            this.ctx.strokeStyle = iconColor + '40'; // 40 is hex for 25% opacity
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);
            
            // Draw image icon if no actual image
            if (!element.image) {
                const fontFamily = useFontAwesome ? '"Font Awesome 6 Free"' : 'Arial';
                const fontWeight = useFontAwesome ? '900' : 'normal';
                
                // Draw glow effect
                this.ctx.save();
                this.ctx.shadowColor = iconColor;
                this.ctx.shadowBlur = 15;
                this.ctx.fillStyle = iconColor;
                this.ctx.font = `${fontWeight} 48px ${fontFamily}`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(iconText, element.x + element.width / 2, element.y + 60);
                this.ctx.restore();
                
                // Draw icon again without shadow for crisp appearance
                this.ctx.fillStyle = iconColor;
                this.ctx.font = `${fontWeight} 48px ${fontFamily}`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(iconText, element.x + element.width / 2, element.y + 60);
            }
            
            // Draw name with background
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(element.x + 5, element.y + 115, element.width - 10, 20);
            
            this.ctx.fillStyle = '#333333';
            this.ctx.font = 'bold 13px "Courier Prime", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const displayName = element.name.length > 18 ? element.name.substring(0, 18) + '...' : element.name;
            this.ctx.fillText(displayName, element.x + element.width / 2, element.y + 125);
            
            // Draw "double-click to view" hint for non-timeline elements
            if (element.type !== 'timeline') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.font = '9px "Courier Prime", monospace';
                this.ctx.fillText('Double-click to view', element.x + element.width / 2, element.y + element.height - 5);
            }
            
            // Restore context state
            this.ctx.restore();
            
            // Draw pushpin (outside of save/restore to ensure it's visible)
            this.drawPushpin(element.x + element.width / 2, element.y - 5, element.type);
        });
    }
    
    drawPushpin(x, y, type) {
        const colors = {
            'suspect': '#ff6b6b',
            'weapon': '#4dabf7',
            'location': '#51cf66',
            'evidence': '#ffd43b',
            'timeline': '#a78bfa'
        };
        
        const color = colors[type] || '#c0c0c0';
        
        // Draw pin head
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Draw pin center
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#666';
        this.ctx.fill();
    }
    
    drawEmptyState() {
        // Save context
        this.ctx.save();
        
        // Draw icon
        this.ctx.fillStyle = 'rgba(244, 241, 222, 0.3)';
        this.ctx.font = '64px "Font Awesome 6 Free"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('📋', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Draw text with better visibility
        this.ctx.fillStyle = 'rgba(244, 241, 222, 0.6)';
        this.ctx.font = 'bold 22px "Playfair Display", serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add text shadow for better visibility
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.fillText(
            'Drag evidence cards here to start your investigation',
            this.canvas.width / 2,
            this.canvas.height / 2 + 30
        );
        
        // Restore context
        this.ctx.restore();
    }
    
    clear() {
        if (this.elements.length === 0 && this.connections.length === 0) {
            return;
        }
        
        // Get translations from the language manager
        const langManager = window.detectiveApp?.languageManager;
        const title = langManager ? langManager.translate('board.clearConfirm.title') : 'Clear Investigation Board?';
        const message = langManager ? langManager.translate('board.clearConfirm.message') : 'All evidence cards and connections will be permanently removed from your board. This action cannot be undone.';
        const confirmText = langManager ? langManager.translate('board.clearConfirm.confirmButton') : 'Yes, Clear Everything';
        const cancelText = langManager ? langManager.translate('board.clearConfirm.cancelButton') : 'Keep My Work';
        
        this.showConfirmModal(
            title,
            message,
            () => {
                this.elements = [];
                this.connections = [];
                this.selectedElement = null;
                this.draw();
                this.saveState();
                console.log('Board cleared');
            },
            {
                confirmText: confirmText,
                confirmIcon: 'fa-trash-alt',
                cancelText: cancelText,
                cancelIcon: 'fa-shield-alt'
            }
        );
    }
    
    showConfirmModal(title, message, onConfirm, options = {}) {
        const modal = document.getElementById('confirmModal');
        const modalTitle = document.getElementById('confirmModalTitle');
        const modalBody = document.getElementById('confirmModalBody');
        const confirmBtn = document.getElementById('confirmModalConfirm');
        const cancelBtn = document.getElementById('confirmModalCancel');
        
        if (!modal || !modalTitle || !modalBody || !confirmBtn || !cancelBtn) {
            console.error('Confirmation modal elements not found');
            return;
        }
        
        // Set modal content
        modalTitle.textContent = title;
        modalBody.textContent = message;
        
        // Update button text and icons
        const confirmText = options.confirmText || 'Confirm';
        const confirmIcon = options.confirmIcon || 'fa-check';
        const cancelText = options.cancelText || 'Cancel';
        const cancelIcon = options.cancelIcon || 'fa-times';
        
        confirmBtn.innerHTML = `<i class="fas ${confirmIcon} me-2"></i><span>${confirmText}</span>`;
        cancelBtn.innerHTML = `<i class="fas ${cancelIcon} me-2"></i><span>${cancelText}</span>`;
        
        // Create Bootstrap modal instance
        const bsModal = new bootstrap.Modal(modal);
        
        // Remove any existing event listeners by cloning the button
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Add new event listener
        newConfirmBtn.addEventListener('click', () => {
            bsModal.hide();
            if (onConfirm) {
                onConfirm();
            }
        }, { once: true });
        
        // Show modal
        bsModal.show();
    }
    
    saveState() {
        // Save board state to localStorage with mystery ID
        const mysteryId = window.detectiveApp?.currentMystery?.id;
        if (!mysteryId) {
            console.warn('No mystery ID available for saving board state');
            return;
        }
        
        const state = {
            mysteryId: mysteryId,
            elements: this.elements.map(el => ({
                id: el.id,
                type: el.type,
                dataId: el.dataId,
                x: el.x,
                y: el.y,
                name: el.name,
                image: el.image
            })),
            connections: this.connections.map(conn => ({
                fromId: conn.from.id,
                toId: conn.to.id,
                color: conn.color
            }))
        };
        
        localStorage.setItem(`investigation_board_${mysteryId}`, JSON.stringify(state));
        console.log('Board state saved to localStorage');
    }
    
    loadState() {
        const mysteryId = window.detectiveApp?.currentMystery?.id;
        if (!mysteryId) {
            console.log('No mystery ID available, skipping board state load');
            return;
        }
        
        const saved = localStorage.getItem(`investigation_board_${mysteryId}`);
        if (saved) {
            try {
                const state = JSON.parse(saved);
                
                // Verify this state is for the current mystery
                if (state.mysteryId !== mysteryId) {
                    console.log('Saved state is for a different mystery, skipping');
                    return;
                }
                
                // Restore elements
                this.elements = state.elements.map(el => ({
                    ...el,
                    width: 180,
                    height: 140,
                    selected: false
                }));
                
                // Restore connections (need to link to actual element objects)
                this.connections = state.connections.map(conn => {
                    const fromElement = this.elements.find(el => el.id === conn.fromId);
                    const toElement = this.elements.find(el => el.id === conn.toId);
                    
                    if (fromElement && toElement) {
                        return {
                            from: fromElement,
                            to: toElement,
                            color: conn.color
                        };
                    }
                    return null;
                }).filter(conn => conn !== null);
                
                console.log(`Board state loaded: ${this.elements.length} elements, ${this.connections.length} connections`);
                
                // Redraw the board with loaded state
                this.draw();
            } catch (error) {
                console.error('Error loading board state:', error);
            }
        }
    }
    
    // Reload board state for a new mystery (called when mystery changes)
    reloadForMystery() {
        console.log('Reloading investigation board for new mystery...');
        
        // Clear current state
        this.elements = [];
        this.connections = [];
        this.selectedElement = null;
        this.isDragging = false;
        this.draggedElement = null;
        
        // Load saved state for the new mystery
        this.loadState();
        
        // Redraw the board
        this.draw();
        
        console.log('Investigation board reloaded');
    }
    
    clearState() {
        // Clear saved state for current mystery
        const mysteryId = window.detectiveApp?.currentMystery?.id;
        if (mysteryId) {
            localStorage.removeItem(`investigation_board_${mysteryId}`);
            console.log('Board state cleared from localStorage');
        }
    }
    
    viewElementDetails(element) {
        // Use the CardManager's viewDetails method to show the modal
        // Timeline events don't have a separate view details, so we skip them
        if (element.type === 'timeline') {
            console.log('Timeline events do not have detailed view');
            return;
        }
        
        if (window.cardManager) {
            console.log(`Viewing details for ${element.type}: ${element.dataId}`);
            window.cardManager.viewDetails(element.type, element.dataId);
        } else {
            console.error('CardManager not available');
        }
    }
}
