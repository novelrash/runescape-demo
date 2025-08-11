// Improved Tiles Page JavaScript
// Fixes search cursor jumping, navbar lurching, and RSN integration

document.addEventListener('DOMContentLoaded', function() {
    initializeTilesPage();
});

function initializeTilesPage() {
    setupSearchFilters();
    setupAutocomplete();
    setupFormHandlers();
    setupRSNIntegration();
    setupModalFixes();
    setupAnimations();
}

// Search and Filter Setup - Prevents cursor jumping
function setupSearchFilters() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const orderSelect = document.getElementById('orderSelect');
    const filterForm = document.getElementById('filterForm');
    
    let searchTimeout;
    
    if (searchInput) {
        // Prevent form submission on Enter key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        
        // Debounced search on input
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 500); // Wait 500ms after user stops typing
        });
    }
    
    // Immediate search on sort/filter changes
    if (sortSelect) {
        sortSelect.addEventListener('change', performSearch);
    }
    
    if (orderSelect) {
        orderSelect.addEventListener('change', performSearch);
    }
    
    // Prevent default form submission
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const orderSelect = document.getElementById('orderSelect');
    
    const searchValue = searchInput ? searchInput.value : '';
    const sortValue = sortSelect ? sortSelect.value : 'name';
    const orderValue = orderSelect ? orderSelect.value : 'asc';
    
    // Get current filter from URL or default to 'all'
    const urlParams = new URLSearchParams(window.location.search);
    const filterValue = urlParams.get('filter') || 'all';
    
    // Build new URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('search', searchValue);
    newUrl.searchParams.set('sort', sortValue);
    newUrl.searchParams.set('order', orderValue);
    newUrl.searchParams.set('filter', filterValue);
    
    // Navigate to new URL (this will reload the page with new results)
    window.location.href = newUrl.toString();
}

// RSN Integration - Auto-fill forms with stored RSN
function setupRSNIntegration() {
    // Wait for RSN identity system to be ready
    setTimeout(() => {
        if (window.rsnIdentity && window.rsnIdentity.getRSN()) {
            const playerInput = document.getElementById('playerInput');
            if (playerInput && !playerInput.value) {
                playerInput.value = window.rsnIdentity.getRSN();
                selectedPlayer = {
                    name: window.rsnIdentity.getRSN(),
                    team: 'Unknown'
                };
            }
        }
    }, 100);
    
    // Listen for RSN changes
    document.addEventListener('rsnChanged', function(e) {
        const playerInput = document.getElementById('playerInput');
        if (playerInput) {
            playerInput.value = e.detail.rsn;
            selectedPlayer = {
                name: e.detail.rsn,
                team: 'Unknown'
            };
        }
    });
}

// Modal Fixes - Prevent navbar lurching
function setupModalFixes() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('show.bs.modal', function() {
            // Prevent body scroll and layout shift
            document.body.style.paddingRight = getScrollbarWidth() + 'px';
            document.body.classList.add('modal-open');
            
            // Fix navbar position
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.style.paddingRight = getScrollbarWidth() + 'px';
            }
        });
        
        modal.addEventListener('hidden.bs.modal', function() {
            // Restore body scroll
            document.body.style.paddingRight = '';
            document.body.classList.remove('modal-open');
            
            // Restore navbar
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.style.paddingRight = '';
            }
        });
    });
}

function getScrollbarWidth() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.msOverflowStyle = 'scrollbar';
    document.body.appendChild(outer);
    
    const inner = document.createElement('div');
    outer.appendChild(inner);
    
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    
    return scrollbarWidth;
}

// Autocomplete functionality - Improved
let autocompleteTimeout;
let selectedPlayer = null;

function setupAutocomplete() {
    const playerInput = document.getElementById('playerInput');
    const resultsContainer = document.getElementById('autocompleteResults');
    
    if (!playerInput || !resultsContainer) return;
    
    playerInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Clear previous timeout
        clearTimeout(autocompleteTimeout);
        
        // Hide results if query is too short
        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            selectedPlayer = null;
            return;
        }
        
        // Debounce the search
        autocompleteTimeout = setTimeout(() => {
            searchPlayers(query);
        }, 300);
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (!playerInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
    
    // Handle keyboard navigation
    playerInput.addEventListener('keydown', function(e) {
        const results = resultsContainer.querySelectorAll('.autocomplete-item');
        const activeItem = resultsContainer.querySelector('.autocomplete-item.active');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove('active');
                const next = activeItem.nextElementSibling;
                if (next) {
                    next.classList.add('active');
                } else {
                    results[0]?.classList.add('active');
                }
            } else {
                results[0]?.classList.add('active');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove('active');
                const prev = activeItem.previousElementSibling;
                if (prev) {
                    prev.classList.add('active');
                } else {
                    results[results.length - 1]?.classList.add('active');
                }
            } else {
                results[results.length - 1]?.classList.add('active');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeItem) {
                selectPlayer(activeItem.dataset.name, activeItem.dataset.team);
            }
        } else if (e.key === 'Escape') {
            resultsContainer.style.display = 'none';
        }
    });
}

function searchPlayers(query) {
    fetch(`/api/search_players?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            displayAutocompleteResults(data.players || []);
        })
        .catch(error => {
            console.error('Error searching players:', error);
            displayAutocompleteResults([]);
        });
}

function displayAutocompleteResults(players) {
    const resultsContainer = document.getElementById('autocompleteResults');
    
    if (players.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    resultsContainer.innerHTML = players.map(player => `
        <div class="autocomplete-item" 
             data-name="${player.name}" 
             data-team="${player.team_name || 'No Team'}"
             onclick="selectPlayer('${player.name}', '${player.team_name || 'No Team'}')">
            <div class="player-name">${player.name}</div>
            <div class="player-team">${player.team_name || 'No Team'}</div>
        </div>
    `).join('');
    
    resultsContainer.style.display = 'block';
}

function selectPlayer(name, team) {
    const playerInput = document.getElementById('playerInput');
    const resultsContainer = document.getElementById('autocompleteResults');
    
    playerInput.value = name;
    selectedPlayer = { name, team };
    resultsContainer.style.display = 'none';
    
    // Update RSN identity if this is a new player
    if (window.rsnIdentity && window.rsnIdentity.getRSN() !== name) {
        window.rsnIdentity.setRSN(name);
    }
}

// Form Handlers
function setupFormHandlers() {
    // Any additional form handling can go here
}

// Animation setup
function setupAnimations() {
    // Animate tiles on load
    const tileCards = document.querySelectorAll('.tile-card');
    tileCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements that need scroll animations
    document.querySelectorAll('.tile-card').forEach(card => {
        observer.observe(card);
    });
}

// Tile interaction functions
function openTileModal(tileId, tileName, tileDescription, tilePoints) {
    const modal = document.getElementById('submissionModal');
    const modalTitle = modal.querySelector('.modal-title');
    const tileNameSpan = modal.querySelector('#tileName');
    const tileDescSpan = modal.querySelector('#tileDescription');
    const tilePointsSpan = modal.querySelector('#tilePoints');
    const tileIdInput = modal.querySelector('#tileId');
    
    modalTitle.textContent = `Submit: ${tileName}`;
    tileNameSpan.textContent = tileName;
    tileDescSpan.textContent = tileDescription;
    tilePointsSpan.textContent = `${tilePoints} points`;
    tileIdInput.value = tileId;
    
    // Auto-fill player name with RSN if available
    const playerInput = document.getElementById('playerInput');
    if (window.rsnIdentity && window.rsnIdentity.getRSN() && !playerInput.value) {
        playerInput.value = window.rsnIdentity.getRSN();
        selectedPlayer = {
            name: window.rsnIdentity.getRSN(),
            team: 'Unknown'
        };
    }
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function submitCompletion() {
    const form = document.getElementById('submissionForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const playerName = formData.get('player_name');
    const evidenceUrl = formData.get('evidence_url');
    
    if (!playerName || !evidenceUrl) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#submissionModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    fetch('/submit_completion', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');
            
            // Update RSN identity
            if (window.rsnIdentity) {
                window.rsnIdentity.setRSN(playerName);
            }
            
            // Close modal and refresh page after short delay
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('submissionModal')).hide();
                location.reload();
            }, 1500);
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred while submitting. Please try again.', 'error');
    })
    .finally(() => {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function showToast(message, type = 'info') {
    // Use the global showToast function if available
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        // Fallback toast implementation
        const toastContainer = document.querySelector('.toast-container');
        const toast = document.getElementById('responseToast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type === 'error' ? 'bg-danger' : type === 'success' ? 'bg-success' : 'bg-info'} text-white`;
            
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
        } else {
            console.log(`Toast: ${message}`);
        }
    }
}
