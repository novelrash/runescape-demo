// Complete RSN Detection and Setting System
const rsnIdentity = {
    // Get RSN from cookie
    getRSN: function() {
        const value = "; " + document.cookie;
        const parts = value.split("; user_rsn=");
        if (parts.length == 2) {
            const rsn = parts.pop().split(";").shift();
            return rsn ? decodeURIComponent(rsn) : null;
        }
        return null;
    },
    
    // Set RSN cookie
    setRSN: function(rsn) {
        if (rsn && rsn.trim()) {
            document.cookie = `user_rsn=${encodeURIComponent(rsn.trim())}; path=/; max-age=31536000`; // 1 year
            this.updateUI();
            return true;
        }
        return false;
    },
    
    // Clear RSN cookie
    clearRSN: function() {
        document.cookie = "user_rsn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        this.updateUI();
    },
    
    // Prompt user to set RSN
    promptForRSN: function() {
        const currentRSN = this.getRSN();
        const message = currentRSN ? 
            `Current RSN: ${currentRSN}\n\nEnter new RSN or click Cancel to keep current:` : 
            'Please enter your RuneScape username (RSN):';
        
        const rsn = prompt(message, currentRSN || '');
        
        if (rsn !== null) { // User didn't cancel
            if (rsn.trim()) {
                if (this.setRSN(rsn)) {
                    alert(`RSN set to: ${rsn.trim()}`);
                    // Refresh page to update all elements
                    window.location.reload();
                }
            } else if (currentRSN) {
                // User entered empty string but had RSN before
                if (confirm('Clear your current RSN?')) {
                    this.clearRSN();
                    alert('RSN cleared');
                    window.location.reload();
                }
            }
        }
    },
    
    // Update UI elements based on RSN status
    updateUI: function() {
        const rsn = this.getRSN();
        
        // Update navigation indicator
        const rsnIndicator = document.getElementById('rsnIndicator');
        if (rsnIndicator) {
            if (rsn) {
                rsnIndicator.innerHTML = `
                    <div class="rsn-identity">
                        <div class="rsn-display" onclick="rsnIdentity.promptForRSN()" title="Click to change RSN">
                            <i class="fas fa-user-check"></i>
                            <span>${rsn}</span>
                        </div>
                    </div>
                `;
                rsnIndicator.className = 'rsn-indicator has-rsn';
            } else {
                rsnIndicator.innerHTML = `
                    <div class="rsn-identity">
                        <button class="rsn-set" onclick="rsnIdentity.promptForRSN()" title="Set your RSN">
                            <i class="fas fa-user-plus"></i>
                            <span>Set RSN</span>
                        </button>
                    </div>
                `;
                rsnIndicator.className = 'rsn-indicator no-rsn';
            }
        }
        
        // Update tiles page status indicator
        const statusIndicator = document.getElementById('rsn-status');
        if (statusIndicator) {
            if (rsn) {
                statusIndicator.className = 'rsn-status-indicator rsn-status has-rsn';
                statusIndicator.innerHTML = `<i class="fas fa-user-check"></i><span>Logged in as: ${rsn}</span>`;
            } else {
                statusIndicator.className = 'rsn-status-indicator rsn-status no-rsn';
                statusIndicator.innerHTML = '<i class="fas fa-user-times"></i><span>Set your RSN to submit tiles</span>';
            }
        }
        
        // Update submission buttons
        const submitButtons = document.querySelectorAll('.tile-submit-btn');
        submitButtons.forEach(button => {
            if (rsn) {
                // Enable button
                button.classList.remove('disabled');
                button.style.pointerEvents = 'auto';
                button.onclick = null; // Remove any blocking onclick
                
                // Restore original href if it was removed
                if (button.dataset.originalHref) {
                    button.href = button.dataset.originalHref;
                }
            } else {
                // Disable button
                button.classList.add('disabled');
                button.style.pointerEvents = 'none';
                
                // Store original href and remove it
                if (button.href && !button.dataset.originalHref) {
                    button.dataset.originalHref = button.href;
                }
                button.removeAttribute('href');
                
                // Add click handler for disabled state
                button.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('Please set your RSN first using the "Set RSN" button in the navigation menu.');
                    return false;
                };
            }
        });
    },
    
    // Initialize the system
    init: function() {
        this.updateUI();
        
        // Update UI every 2 seconds to catch changes from other tabs
        setInterval(() => {
            this.updateUI();
        }, 2000);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    rsnIdentity.init();
});

// Also update when page becomes visible (tab switching)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        rsnIdentity.updateUI();
    }
});
