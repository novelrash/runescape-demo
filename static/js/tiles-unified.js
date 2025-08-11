// Tiles Unified Page JavaScript
// Handles autocomplete, submission, and interactive features

document.addEventListener('DOMContentLoaded', function() {
    initializeTilesPage();
});

function initializeTilesPage() {
    setupAutocomplete();
    setupFormHandlers();
    setupSearchFilters();
    setupAnimations();
}

// Autocomplete functionality
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
        const items = resultsContainer.querySelectorAll('.autocomplete-item');
        const activeItem = resultsContainer.querySelector('.autocomplete-item.active');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove('active');
                const next = activeItem.nextElementSibling || items[0];
                next.classList.add('active');
            } else if (items.length > 0) {
                items[0].classList.add('active');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove('active');
                const prev = activeItem.previousElementSibling || items[items.length - 1];
                prev.classList.add('active');
            } else if (items.length > 0) {
                items[items.length - 1].classList.add('active');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeItem) {
                selectPlayer(activeItem);
            }
        } else if (e.key === 'Escape') {
            resultsContainer.style.display = 'none';
        }
    });
}

function searchPlayers(query) {
    fetch(`/api/competitors?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(players => {
            displayAutocompleteResults(players);
        })
        .catch(error => {
            console.error('Error searching players:', error);
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
             data-player-id="${player.id}" 
             data-player-name="${player.name}"
             data-team-name="${player.team}"
             onclick="selectPlayer(this)">
            <div class="player-name">${player.name}</div>
            <div class="player-team">Team: ${player.team}</div>
        </div>
    `).join('');
    
    resultsContainer.style.display = 'block';
}

function selectPlayer(element) {
    const playerName = element.dataset.playerName;
    const teamName = element.dataset.teamName;
    const playerId = element.dataset.playerId;
    
    selectedPlayer = {
        id: playerId,
        name: playerName,
        team: teamName
    };
    
    document.getElementById('playerInput').value = playerName;
    document.getElementById('autocompleteResults').style.display = 'none';
}

// Form handling
function setupFormHandlers() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const orderSelect = document.getElementById('orderSelect');
    
    // Auto-submit form on changes
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                document.getElementById('filterForm').submit();
            }, 500);
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            document.getElementById('filterForm').submit();
        });
    }
    
    if (orderSelect) {
        orderSelect.addEventListener('change', function() {
            document.getElementById('filterForm').submit();
        });
    }
}

// Modal functions
function openSubmissionModal(tileId, tileName) {
    // Set the selected tile
    document.getElementById('selectedTileId').value = tileId;
    
    // Find tile data
    const tileCard = document.querySelector(`[data-tile-id="${tileId}"]`);
    const tileDescription = tileCard.querySelector('.tile-description').textContent.trim();
    const tilePoints = tileCard.querySelector('.tile-points').textContent.trim();
    
    // Update modal content
    document.getElementById('selectedTileInfo').innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h6 class="mb-1 text-warning">${tileName}</h6>
                <p class="mb-0 text-muted small">${tileDescription}</p>
            </div>
            <span class="badge bg-warning text-dark">${tilePoints}</span>
        </div>
    `;
    
    // Clear form
    document.getElementById('playerInput').value = '';
    selectedPlayer = null;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('submissionModal'));
    modal.show();
}

function submitCompletion() {
    const tileId = document.getElementById('selectedTileId').value;
    const playerName = document.getElementById('playerInput').value.trim();
    
    if (!playerName) {
        showToast('Please enter your player name.', 'error');
        return;
    }
    
    if (!selectedPlayer) {
        showToast('Please select a valid player from the suggestions.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#submissionModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    // Submit the form
    const formData = new FormData();
    formData.append('tile_id', tileId);
    formData.append('player_name', playerName);
    
    fetch('/tiles', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('submissionModal'));
            modal.hide();
            
            // Update the tile card to show pending status
            updateTileCardStatus(tileId, 'pending');
            
            // Refresh page after a short delay to show updated data
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting completion:', error);
        showToast('An error occurred while submitting. Please try again.', 'error');
    })
    .finally(() => {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function updateTileCardStatus(tileId, status) {
    const tileCard = document.querySelector(`[data-tile-id="${tileId}"]`);
    if (!tileCard) return;
    
    const statusElement = tileCard.querySelector('.tile-status');
    const submitBtn = tileCard.querySelector('.submit-btn');
    
    if (status === 'pending') {
        statusElement.className = 'tile-status status-pending';
        statusElement.innerHTML = '<i class="fas fa-clock"></i> Pending';
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-clock"></i> Pending Approval';
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('responseToast');
    const toastMessage = document.getElementById('toastMessage');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set toast style based on type
    toast.className = 'toast';
    if (type === 'success') {
        toast.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
        toast.classList.add('bg-danger', 'text-white');
    } else {
        toast.classList.add('bg-info', 'text-white');
    }
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Search and filter animations
function setupSearchFilters() {
    // Animate tiles on load
    const tileCards = document.querySelectorAll('.tile-card');
    tileCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });
}

// Animation setup
function setupAnimations() {
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
    
    // Observe elements for animation
    document.querySelectorAll('.search-section, .stats-bar').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for external use
window.TilesPage = {
    openSubmissionModal,
    submitCompletion,
    showToast
};
