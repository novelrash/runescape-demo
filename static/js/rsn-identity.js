/**
 * RSN Identity System
 * Uses local storage + browser fingerprinting to remember user's RSN
 */

class RSNIdentity {
    constructor() {
        this.storageKey = 'pea_kingdom_rsn_identity';
        this.fingerprintKey = 'pea_kingdom_fingerprint';
        this.currentRSN = null;
        this.fingerprint = null;
        
        this.init();
    }
    
    async init() {
        // Generate browser fingerprint
        this.fingerprint = await this.generateFingerprint();
        
        // Load stored RSN if it matches fingerprint
        this.loadStoredRSN();
        
        // Update UI
        this.updateNavIndicator();
        this.dispatchRSNChangeEvent(rsn);
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    async generateFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        const fingerprint = {
            canvas: canvas.toDataURL(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            memory: navigator.deviceMemory || 'unknown',
            cores: navigator.hardwareConcurrency || 'unknown'
        };
        
        // Create hash of fingerprint
        const fingerprintString = JSON.stringify(fingerprint);
        const hash = await this.simpleHash(fingerprintString);
        
        return hash;
    }
    
    async simpleHash(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    }
    
    loadStoredRSN() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                
                // Verify fingerprint matches
                if (data.fingerprint === this.fingerprint) {
                    this.currentRSN = data.rsn;
                    console.log('Loaded RSN from storage:', this.currentRSN);
                } else {
                    console.log('Fingerprint mismatch, clearing stored RSN');
                    localStorage.removeItem(this.storageKey);
                }
            }
        } catch (error) {
            console.error('Error loading stored RSN:', error);
            localStorage.removeItem(this.storageKey);
        }
    }
    
    setRSN(rsn) {
        if (!rsn || rsn.trim() === '') {
            this.clearRSN();
            return;
        }
        
        rsn = rsn.trim();
        this.currentRSN = rsn;
        
        // Store with fingerprint
        const data = {
            rsn: rsn,
            fingerprint: this.fingerprint,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('Stored RSN:', rsn);
        } catch (error) {
            console.error('Error storing RSN:', error);
        }
        
        this.updateNavIndicator();
        this.dispatchRSNChangeEvent(rsn);
        this.showToast(`RSN set to: ${rsn}`, 'success');
    }
    
    clearRSN() {
        this.currentRSN = null;
        localStorage.removeItem(this.storageKey);
        this.updateNavIndicator();
        this.dispatchRSNChangeEvent(rsn);
        this.showToast('RSN cleared', 'info');
    }
    
    getRSN() {
        return this.currentRSN;
    }
    
    updateNavIndicator() {
        const indicator = document.getElementById('rsnIndicator');
        if (!indicator) return;
        
        if (this.currentRSN) {
            indicator.innerHTML = `
                <div class="rsn-identity">
                    <i class="fas fa-user-circle"></i>
                    <span class="rsn-name">${this.escapeHtml(this.currentRSN)}</span>
                    <button class="rsn-clear" onclick="rsnIdentity.clearRSN()" title="Clear RSN">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            indicator.classList.add('has-rsn');
        } else {
            indicator.innerHTML = `
                <div class="rsn-identity">
                    <button class="rsn-set" onclick="rsnIdentity.promptForRSN()" title="Set your RSN">
                        <i class="fas fa-user-plus"></i>
                        <span>Set RSN</span>
                    </button>
                </div>
            `;
            indicator.classList.remove('has-rsn');
        }
    }
    
    promptForRSN() {
        const rsn = prompt('Enter your RuneScape username (RSN):');
        if (rsn !== null) {
            this.setRSN(rsn);
        }
    }
    
    setupEventListeners() {
        // Auto-fill forms with current RSN
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input[name="player_name"], input[placeholder*="player"], input[placeholder*="name"]')) {
                if (this.currentRSN && !e.target.value) {
                    e.target.value = this.currentRSN;
                    e.target.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });
        
        // Listen for form submissions to capture RSN
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const playerNameInput = form.querySelector('input[name="player_name"]');
            
            if (playerNameInput && playerNameInput.value.trim()) {
                const rsn = playerNameInput.value.trim();
                if (rsn !== this.currentRSN) {
                    this.setRSN(rsn);
                }
            }
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showToast(message, type = 'info') {
        // Use the global showToast function if available
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(`Toast: ${message}`);
        }
    }
}

// Initialize RSN Identity system
let rsnIdentity;
document.addEventListener('DOMContentLoaded', function() {
    rsnIdentity = new RSNIdentity();
});

// Export for use in other scripts
window.rsnIdentity = rsnIdentity;
