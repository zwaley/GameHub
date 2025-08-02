// GameHub JavaScript
class GameHub {
    constructor() {
        this.games = this.loadGames();
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderGames();
        this.addSampleGames();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderGames();
        });

        // Category tabs
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setActiveCategory(e.target.dataset.category);
            });
        });

        // Add game modal
        const addGameBtn = document.getElementById('addGameBtn');
        const modal = document.getElementById('addGameModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const addGameForm = document.getElementById('addGameForm');

        addGameBtn.addEventListener('click', () => this.openModal());
        closeModal.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Form submission
        addGameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addGame();
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    setActiveCategory(category) {
        this.currentCategory = category;
        
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.renderGames();
    }

    openModal() {
        document.getElementById('addGameModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('addGameModal').classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('addGameForm').reset();
    }

    addGame() {
        const form = document.getElementById('addGameForm');
        const formData = new FormData(form);
        
        const game = {
            id: Date.now().toString(),
            name: document.getElementById('gameName').value,
            description: document.getElementById('gameDescription').value,
            url: document.getElementById('gameUrl').value,
            category: document.getElementById('gameCategory').value,
            image: document.getElementById('gameImage').value,
            addedDate: new Date().toISOString()
        };

        this.games.push(game);
        this.saveGames();
        this.renderGames();
        this.closeModal();
        
        // Show success message
        this.showNotification('游戏添加成功！', 'success');
    }

    deleteGame(gameId) {
        if (confirm('确定要删除这个游戏吗？')) {
            this.games = this.games.filter(game => game.id !== gameId);
            this.saveGames();
            this.renderGames();
            this.showNotification('游戏已删除', 'info');
        }
    }

    editGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (game) {
            // Populate form with existing data
            document.getElementById('gameName').value = game.name;
            document.getElementById('gameDescription').value = game.description;
            document.getElementById('gameUrl').value = game.url;
            document.getElementById('gameCategory').value = game.category;
            document.getElementById('gameImage').value = game.image || '';
            
            // Change form to edit mode
            const form = document.getElementById('addGameForm');
            form.dataset.editId = gameId;
            
            // Update modal title and button text
            document.querySelector('.modal-header h3').textContent = '编辑游戏';
            document.querySelector('.btn-primary').textContent = '保存更改';
            
            this.openModal();
        }
    }

    playGame(gameUrl, gameName) {
        // Store return URL for the game to come back to GameHub
        sessionStorage.setItem('gameHubReturnUrl', window.location.href);
        sessionStorage.setItem('currentGame', gameName);
        
        // Open game in same window
        window.location.href = gameUrl;
    }

    getFilteredGames() {
        let filteredGames = this.games;
        
        // Filter by category
        if (this.currentCategory !== 'all') {
            filteredGames = filteredGames.filter(game => game.category === this.currentCategory);
        }
        
        // Filter by search term
        if (this.searchTerm) {
            filteredGames = filteredGames.filter(game => 
                game.name.toLowerCase().includes(this.searchTerm) ||
                game.description.toLowerCase().includes(this.searchTerm)
            );
        }
        
        return filteredGames;
    }

    renderGames() {
        const gamesGrid = document.getElementById('gamesGrid');
        const filteredGames = this.getFilteredGames();
        
        if (filteredGames.length === 0) {
            gamesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-gamepad"></i>
                    <h3>暂无游戏</h3>
                    <p>${this.searchTerm ? '没有找到匹配的游戏' : '点击下方按钮添加你的第一个游戏'}</p>
                </div>
            `;
            return;
        }
        
        gamesGrid.innerHTML = filteredGames.map(game => this.createGameCard(game)).join('');
        
        // Bind game card events
        this.bindGameCardEvents();
    }

    createGameCard(game) {
        const categoryNames = {
            puzzle: '益智',
            action: '动作',
            strategy: '策略',
            casual: '休闲'
        };
        
        const gameIcons = {
            puzzle: 'fas fa-puzzle-piece',
            action: 'fas fa-fist-raised',
            strategy: 'fas fa-chess',
            casual: 'fas fa-smile'
        };
        
        return `
            <div class="game-card" data-game-id="${game.id}">
                <div class="game-image">
                    ${game.image ? 
                        `<img src="${game.image}" alt="${game.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">` : 
                        ''
                    }
                    <div class="game-icon" style="${game.image ? 'display: none;' : ''}">
                        <i class="${gameIcons[game.category] || 'fas fa-gamepad'}"></i>
                    </div>
                </div>
                <div class="game-actions">
                    <button class="action-btn edit-btn" data-game-id="${game.id}" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-game-id="${game.id}" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="game-info">
                    <h3 class="game-title">${game.name}</h3>
                    <p class="game-description">${game.description || '暂无描述'}</p>
                    <span class="game-category">${categoryNames[game.category] || game.category}</span>
                </div>
            </div>
        `;
    }

    bindGameCardEvents() {
        // Play game on card click
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons
                if (e.target.closest('.game-actions')) return;
                
                const gameId = card.dataset.gameId;
                const game = this.games.find(g => g.id === gameId);
                if (game) {
                    this.playGame(game.url, game.name);
                }
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editGame(btn.dataset.gameId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteGame(btn.dataset.gameId);
            });
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    addSampleGames() {
        // Add sample games (force update to new game list)
        const hasOldSampleGames = this.games.some(game => game.id.startsWith('sample-'));
        if (this.games.length === 0 || hasOldSampleGames) {
            const sampleGames = [
                {
                    id: 'game-1',
                    name: '塔罗牌占卜',
                    description: '神秘的塔罗牌占卜，探索你的过去、现在和未来',
                    url: 'https://zwaley.github.io/tarot/',
                    category: 'casual',
                    image: '',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-2',
                    name: '俄罗斯方块',
                    description: '经典的俄罗斯方块游戏，考验你的反应和策略',
                    url: 'https://zwaley.github.io/russia/',
                    category: 'puzzle',
                    image: '',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-3',
                    name: '五子棋',
                    description: '经典的五子棋对战游戏，挑战AI或与朋友对战',
                    url: 'https://zwaley.github.io/wuziqi/',
                    category: 'strategy',
                    image: '',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-4',
                    name: '围棋',
                    description: '古老的围棋游戏，体验千年智慧的博弈',
                    url: 'https://zwaley.github.io/weiqi/',
                    category: 'strategy',
                    image: '',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-5',
                    name: '掼蛋',
                    description: '流行的掼蛋纸牌游戏，单机版AI对战',
                    url: 'https://zwaley.github.io/guandan/',
                    category: 'casual',
                    image: '',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-6',
                    name: '跑酷大冒险',
                    description: '刺激的跑酷游戏，挑战你的反应速度',
                    url: 'https://zwaley.github.io/runcool/',
                    category: 'action',
                    image: '',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-7',
                    name: '校园角色测试',
                    description: '有趣的校园角色测试，看看你是哪种人',
                    url: 'https://zwaley.github.io/meetoo/',
                    category: 'casual',
                    image: '',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-8',
                    name: '正义使者大作战',
                    description: '维护校园正义，成为正义使者！',
                    url: 'https://zwaley.github.io/zysz/',
                    category: 'action',
                    image: '',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-9',
                    name: '方丈适合度测试',
                    description: '有趣的测试，看看你适合做方丈吗？',
                    url: 'https://zwaley.github.io/abbot-quiz/',
                    category: 'casual',
                    image: '',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-10',
                    name: '星运占卜',
                    description: '探索你的星座奥秘，了解星座运势',
                    url: 'https://zwaley.github.io/stars/',
                    category: 'casual',
                    image: '',
                    addedDate: new Date().toISOString()
                }
            ];
            
            this.games = sampleGames;
            this.saveGames();
            this.renderGames();
        }
    }

    loadGames() {
        const saved = localStorage.getItem('gameHubGames');
        return saved ? JSON.parse(saved) : [];
    }

    saveGames() {
        localStorage.setItem('gameHubGames', JSON.stringify(this.games));
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize GameHub when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Clear old data to force refresh with new games
    const savedGames = localStorage.getItem('gameHubGames');
    if (savedGames) {
        const games = JSON.parse(savedGames);
        const hasOldSamples = games.some(game => game.id.startsWith('sample-'));
        if (hasOldSamples) {
            localStorage.removeItem('gameHubGames');
        }
    }
    window.gameHub = new GameHub();
});

// Handle return from games
window.addEventListener('load', () => {
    const returnUrl = sessionStorage.getItem('gameHubReturnUrl');
    const currentGame = sessionStorage.getItem('currentGame');
    
    if (returnUrl && currentGame && window.location.href === returnUrl) {
        // Clear session storage
        sessionStorage.removeItem('gameHubReturnUrl');
        sessionStorage.removeItem('currentGame');
        
        // Show welcome back message
        setTimeout(() => {
            if (window.gameHub) {
                window.gameHub.showNotification(`欢迎回到飞的VIbe游戏厅！`, 'info');
            }
        }, 500);
    }
});