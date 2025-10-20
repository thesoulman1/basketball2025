// State management
let playersData = {
    G: [],
    F: [],
    C: []
};

let draggedPlayer = null;
let draggedFromColumn = null;
let contextMenu = null;

// Initialize app
async function init() {
    await loadPlayers();
    setupDragAndDrop();
    setupContextMenu();
}

// Load players from API
async function loadPlayers() {
    try {
        const response = await fetch('/api/players');
        playersData = await response.json();
        renderAllColumns();
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

// Render all columns
function renderAllColumns() {
    renderColumn('G', 'guards-list');
    renderColumn('F', 'forwards-list');
    renderColumn('C', 'centers-list');
}

// Render a single column
function renderColumn(column, listId) {
    const list = document.getElementById(listId);
    list.innerHTML = '';

    const players = playersData[column];
    players.forEach((player) => {
        const card = createPlayerCard(player);
        list.appendChild(card);
    });
}

// Create player card HTML
function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = `player-card ${player.drafted ? 'drafted' : ''}`;
    card.draggable = true;
    card.dataset.playerId = player.id;

    // Calculate total fantasy points
    const totalFP = (player.fantasyPoints || 0).toFixed(1);
    const fpg = (player.fantasyPointsPerGame || 0).toFixed(1);

    // Create Google search URL
    const searchQuery = encodeURIComponent(`${player.name} fantasy basketball latest news ai mode`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;

    card.innerHTML = `
        <div class="player-header">
            <input type="checkbox"
                   class="draft-checkbox"
                   ${player.drafted ? 'checked' : ''}
                   onchange="toggleDraft(${player.id}, this.checked)">
            <div class="move-buttons">
                <button class="move-btn move-up" onclick="movePlayerUp(${player.id}, '${player.displayColumn}')" title="Move up">▲</button>
                <button class="move-btn move-down" onclick="movePlayerDown(${player.id}, '${player.displayColumn}')" title="Move down">▼</button>
            </div>
            <a href="${searchUrl}" target="_blank" class="player-name">
                ${player.name} <span class="player-positions">(${player.positions})</span>
            </a>
            <button class="expand-btn" onclick="toggleExpand(this)">+</button>
        </div>
        <div class="player-basic-info">
            <span class="info-compact"><strong>FP/G: ${fpg}</strong></span>
            <span class="info-separator">|</span>
            <span class="info-compact">G: ${player.gamesPlayed || 0}</span>
            <span class="info-separator">|</span>
            <span class="info-compact">ADP: ${player.adp ? player.adp.toFixed(1) : 'N/A'}</span>
        </div>
        <div class="player-expanded">
            <div class="expanded-stats">
                <div class="stat-row">
                    <div class="stat-item">
                        <span class="stat-label">Points:</span>
                        <span class="stat-value">${player.points ? player.points.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Rebounds:</span>
                        <span class="stat-value">${player.rebounds ? player.rebounds.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Assists:</span>
                        <span class="stat-value">${player.assists ? player.assists.toFixed(1) : 'N/A'}</span>
                    </div>
                </div>
                <div class="stat-row">
                    <div class="stat-item">
                        <span class="stat-label">Steals:</span>
                        <span class="stat-value">${player.steals ? player.steals.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Blocks:</span>
                        <span class="stat-value">${player.blocks ? player.blocks.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">3PM:</span>
                        <span class="stat-value">${player.threePointersMade ? player.threePointersMade.toFixed(1) : 'N/A'}</span>
                    </div>
                </div>
                <div class="stat-row">
                    <div class="stat-item">
                        <span class="stat-label">Turnovers:</span>
                        <span class="stat-value">${player.turnovers ? player.turnovers.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">FTM:</span>
                        <span class="stat-value">${player.freeThrowsMissed ? player.freeThrowsMissed.toFixed(1) : 'N/A'}</span>
                    </div>
                </div>
            </div>
            ${player.summary ? `
                <div class="player-summary">
                    <div class="summary-label">Summary:</div>
                    ${player.summary}
                </div>
            ` : ''}
        </div>
        ${player.separatorBelow ? `
            <div class="player-separator" data-player-id="${player.id}">
                <div class="separator-line"></div>
                ${player.separatorLabel ? `<div class="separator-label">${player.separatorLabel}</div>` : ''}
                <button class="separator-remove" onclick="removeSeparator(${player.id})" title="Remove separator">×</button>
            </div>
        ` : ''}
    `;

    return card;
}

// Toggle expand/collapse player details
function toggleExpand(button) {
    const card = button.closest('.player-card');
    const expanded = card.querySelector('.player-expanded');
    expanded.classList.toggle('visible');
    button.textContent = expanded.classList.contains('visible') ? '−' : '+';
}

// Toggle draft status
async function toggleDraft(playerId, drafted) {
    try {
        await fetch(`/api/players/${playerId}/draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ drafted })
        });

        // Update local state
        for (const column in playersData) {
            const player = playersData[column].find(p => p.id === playerId);
            if (player) {
                player.drafted = drafted;
                break;
            }
        }

        renderAllColumns();
    } catch (error) {
        console.error('Error toggling draft status:', error);
    }
}

// Setup drag and drop
function setupDragAndDrop() {
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e) {
    if (!e.target.classList.contains('player-card')) return;

    draggedPlayer = e.target;
    draggedFromColumn = e.target.closest('.player-list').dataset.column;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    if (!e.target.classList.contains('player-card')) return;
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (e.target.classList.contains('player-list')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('player-list')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    e.preventDefault();

    const dropTarget = e.target.closest('.player-list') || e.target.closest('.player-card')?.closest('.player-list');
    if (!dropTarget) return;

    dropTarget.classList.remove('drag-over');

    const column = dropTarget.dataset.column;
    const playerId = parseInt(draggedPlayer.dataset.playerId);

    // Only allow dropping within the same column
    if (column !== draggedFromColumn) {
        return;
    }

    // Find the drop position
    const cards = Array.from(dropTarget.querySelectorAll('.player-card:not(.dragging)'));
    const afterElement = getDragAfterElement(dropTarget, e.clientY);

    if (afterElement == null) {
        dropTarget.appendChild(draggedPlayer);
    } else {
        dropTarget.insertBefore(draggedPlayer, afterElement);
    }

    // Update the order
    updateColumnOrder(column);

    return false;
}

function getDragAfterElement(container, y) {
    const draggableElements = Array.from(container.querySelectorAll('.player-card:not(.dragging)'));

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function updateColumnOrder(column) {
    const listId = column === 'G' ? 'guards-list' : column === 'F' ? 'forwards-list' : 'centers-list';
    const list = document.getElementById(listId);
    const cards = Array.from(list.querySelectorAll('.player-card'));

    const playerIds = cards.map(card => parseInt(card.dataset.playerId));

    // Use shared function to update order on server
    await updateOrderOnServer(column, playerIds);
}

// Context Menu Functions
function setupContextMenu() {
    // Create context menu element
    contextMenu = document.createElement('div');
    contextMenu.id = 'context-menu';
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
        <div class="context-menu-item" id="add-separator">Add Tier Break Below</div>
        <div class="context-menu-item" id="add-separator-with-label">Add Labeled Tier Break Below</div>
    `;
    document.body.appendChild(contextMenu);

    // Hide menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#context-menu')) {
            hideContextMenu();
        }
    });

    // Prevent default context menu and show custom one
    document.addEventListener('contextmenu', (e) => {
        const card = e.target.closest('.player-card');
        if (card) {
            e.preventDefault();
            const playerId = parseInt(card.dataset.playerId);
            showContextMenu(e.clientX, e.clientY, playerId);
        }
    });

    // Handle menu item clicks
    document.getElementById('add-separator').addEventListener('click', async () => {
        const playerId = contextMenu.dataset.playerId;
        await addSeparator(parseInt(playerId), '');
        hideContextMenu();
    });

    document.getElementById('add-separator-with-label').addEventListener('click', async () => {
        const playerId = contextMenu.dataset.playerId;
        const label = prompt('Enter tier label (e.g., "Round 2 Target", "Tier 2"):');
        if (label !== null) {
            await addSeparator(parseInt(playerId), label);
        }
        hideContextMenu();
    });
}

function showContextMenu(x, y, playerId) {
    contextMenu.dataset.playerId = playerId;
    contextMenu.style.display = 'block';
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
}

async function addSeparator(playerId, label) {
    try {
        await fetch(`/api/players/${playerId}/separator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                hasSeparator: true,
                label: label
            })
        });

        // Update local state
        for (const column in playersData) {
            const player = playersData[column].find(p => p.id === playerId);
            if (player) {
                player.separatorBelow = true;
                player.separatorLabel = label;
                break;
            }
        }

        renderAllColumns();
    } catch (error) {
        console.error('Error adding separator:', error);
    }
}

async function removeSeparator(playerId) {
    try {
        await fetch(`/api/players/${playerId}/separator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                hasSeparator: false,
                label: ''
            })
        });

        // Update local state
        for (const column in playersData) {
            const player = playersData[column].find(p => p.id === playerId);
            if (player) {
                player.separatorBelow = false;
                player.separatorLabel = null;
                break;
            }
        }

        renderAllColumns();
    } catch (error) {
        console.error('Error removing separator:', error);
    }
}

// Move player up/down functions
async function movePlayerUp(playerId, column) {
    const players = playersData[column];
    const currentIndex = players.findIndex(p => p.id === playerId);

    // Can't move up if already at the top
    if (currentIndex <= 0) return;

    // Swap with the player above
    [players[currentIndex - 1], players[currentIndex]] = [players[currentIndex], players[currentIndex - 1]];

    // Send updated order to server
    const playerIds = players.map(p => p.id);
    await updateOrderOnServer(column, playerIds);
}

async function movePlayerDown(playerId, column) {
    const players = playersData[column];
    const currentIndex = players.findIndex(p => p.id === playerId);

    // Can't move down if already at the bottom
    if (currentIndex < 0 || currentIndex >= players.length - 1) return;

    // Swap with the player below
    [players[currentIndex], players[currentIndex + 1]] = [players[currentIndex + 1], players[currentIndex]];

    // Send updated order to server
    const playerIds = players.map(p => p.id);
    await updateOrderOnServer(column, playerIds);
}

async function updateOrderOnServer(column, playerIds) {
    try {
        await fetch('/api/players/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                column: column,
                playerIds: playerIds
            })
        });

        // Reload data from server to ensure consistency
        await loadPlayers();
    } catch (error) {
        console.error('Error updating order:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);
