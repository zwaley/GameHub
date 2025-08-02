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
                const gameId = card.dataset.gameId;
                const game = this.games.find(g => g.id === gameId);
                if (game) {
                    this.playGame(game.url, game.name);
                }
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
        // Clear localStorage and force update to new game list with images
        localStorage.removeItem('gameHubGames');
        this.games = [];
        
        const sampleGames = [
                {
                    id: 'game-1',
                    name: '塔罗牌占卜',
                    description: '神秘的塔罗牌占卜，探索你的过去、现在和未来',
                    url: 'https://zwaley.github.io/tarot/',
                    category: 'casual',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkMSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2NjZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM5OTMzZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZDEpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLDE1MCkiPjxyZWN0IHg9Ii0zMCIgeT0iLTQ1IiB3aWR0aD0iNjAiIGhlaWdodD0iOTAiIHJ4PSI4IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+PGNpcmNsZSBjeD0iMCIgY3k9Ii0xNSIgcj0iMTIiIGZpbGw9IiM2NjY2ZmYiLz48cGF0aCBkPSJNLTE1IDEwIEwxNSAxMCBMMTAgMjUgTC0xMCAyNSBaIiBmaWxsPSIjOTkzM2ZmIi8+PHRleHQgeD0iMCIgeT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPuWho+e9l+eJjDwvdGV4dD48L2c+PC9zdmc+',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-2',
                    name: '俄罗斯方块',
                    description: '经典的俄罗斯方块游戏，考验你的反应和策略',
                    url: 'https://zwaley.github.io/russia/',
                    category: 'puzzle',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkMiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzMzY2NmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDk5ZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZDIpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLDE1MCkiPjxyZWN0IHg9Ii00MCIgeT0iLTIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmZjMzMzMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxyZWN0IHg9Ii0yMCIgeT0iLTIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmZjMzMzMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxyZWN0IHg9IjAiIHk9Ii0yMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZmYzMzMzIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIyMCIgeT0iLTIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmZjMzMzMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxyZWN0IHg9Ii0yMCIgeT0iMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMzNmZjMzIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMzM2ZmMzMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjAiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj7kv4Tmlq/mlq/mlrnlnZc8L3RleHQ+PC9nPjwvc3ZnPg==',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-3',
                    name: '五子棋',
                    description: '经典的五子棋对战游戏，挑战AI或与朋友对战',
                    url: 'https://zwaley.github.io/wuziqi/',
                    category: 'strategy',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkMyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmY2M2NjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZjk5MzM7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZDMpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLDE1MCkiPjxyZWN0IHg9Ii01MCIgeT0iLTUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2NDQyMiIgcng9IjgiLz48ZyBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgeDE9Ii0zMCIgeTE9Ii0zMCIgeDI9IjMwIiB5Mj0iLTMwIi8+PGxpbmUgeDE9Ii0zMCIgeTE9Ii0xMCIgeDI9IjMwIiB5Mj0iLTEwIi8+PGxpbmUgeDE9Ii0zMCIgeTE9IjEwIiB4Mj0iMzAiIHkyPSIxMCIvPjxsaW5lIHgxPSItMzAiIHkxPSIzMCIgeDI9IjMwIiB5Mj0iMzAiLz48bGluZSB4MT0iLTMwIiB5MT0iLTMwIiB4Mj0iLTMwIiB5Mj0iMzAiLz48bGluZSB4MT0iLTEwIiB5MT0iLTMwIiB4Mj0iLTEwIiB5Mj0iMzAiLz48bGluZSB4MT0iMTAiIHkxPSItMzAiIHgyPSIxMCIgeTI9IjMwIi8+PGxpbmUgeDE9IjMwIiB5MT0iLTMwIiB4Mj0iMzAiIHkyPSIzMCIvPjwvZz48Y2lyY2xlIGN4PSItMTAiIGN5PSItMTAiIHI9IjYiIGZpbGw9ImJsYWNrIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMSIvPjx0ZXh0IHg9IjAiIHk9IjY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj7kuLTlrZDmo4s8L3RleHQ+PC9nPjwvc3ZnPg==',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-4',
                    name: '围棋',
                    description: '古老的围棋游戏，体验千年智慧的博弈',
                    url: 'https://zwaley.github.io/weiqi/',
                    category: 'strategy',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkNCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmZGQ2NjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZmJiMzM7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZDQpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLDE1MCkiPjxyZWN0IHg9Ii02MCIgeT0iLTYwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2RkYWE2NiIgcng9IjgiLz48ZyBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgeDE9Ii00NSIgeTE9Ii00NSIgeDI9IjQ1IiB5Mj0iLTQ1Ii8+PGxpbmUgeDE9Ii00NSIgeTE9Ii0yMiIgeDI9IjQ1IiB5Mj0iLTIyIi8+PGxpbmUgeDE9Ii00NSIgeTE9IjAiIHgyPSI0NSIgeTI9IjAiLz48bGluZSB4MT0iLTQ1IiB5MT0iMjIiIHgyPSI0NSIgeTI9IjIyIi8+PGxpbmUgeDE9Ii00NSIgeTE9IjQ1IiB4Mj0iNDUiIHkyPSI0NSIvPjxsaW5lIHgxPSItNDUiIHkxPSItNDUiIHgyPSItNDUiIHkyPSI0NSIvPjxsaW5lIHgxPSItMjIiIHkxPSItNDUiIHgyPSItMjIiIHkyPSI0NSIvPjxsaW5lIHgxPSIwIiB5MT0iLTQ1IiB4Mj0iMCIgeTI9IjQ1Ii8+PGxpbmUgeDE9IjIyIiB5MT0iLTQ1IiB4Mj0iMjIiIHkyPSI0NSIvPjxsaW5lIHgxPSI0NSIgeTE9Ii00NSIgeDI9IjQ1IiB5Mj0iNDUiLz48L2c+PGNpcmNsZSBjeD0iLTIyIiBjeT0iLTIyIiByPSI4IiBmaWxsPSJibGFjayIvPjxjaXJjbGUgY3g9IjIyIiBjeT0iMjIiIHI9IjgiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjEiLz48Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iOCIgZmlsbD0iYmxhY2siLz48dGV4dCB4PSIwIiB5PSI3NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+5Zu05qOLPC90ZXh0PjwvZz48L3N2Zz4=',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-5',
                    name: '掼蛋',
                    description: '流行的掼蛋纸牌游戏，单机版AI对战',
                    url: 'https://zwaley.github.io/guandan/',
                    category: 'casual',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkNSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmNjY5OTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZjMzNjY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZDUpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLDE1MCkiPjxyZWN0IHg9Ii0zNSIgeT0iLTUwIiB3aWR0aD0iMjUiIGhlaWdodD0iNDAiIGZpbGw9IndoaXRlIiByeD0iNCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSItNSIgeT0iLTUwIiB3aWR0aD0iMjUiIGhlaWdodD0iNDAiIGZpbGw9IndoaXRlIiByeD0iNCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIyNSIgeT0iLTUwIiB3aWR0aD0iMjUiIGhlaWdodD0iNDAiIGZpbGw9IndoaXRlIiByeD0iNCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSItMjIiIHk9Ii0yNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0icmVkIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+QTwvdGV4dD48dGV4dCB4PSI4IiB5PSItMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9ImJsYWNrIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+SzwvdGV4dD48dGV4dCB4PSIzOCIgeT0iLTI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJyZWQiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIj5RPC90ZXh0Pjx0ZXh0IHg9IjAiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj7mjLzom4E8L3RleHQ+PC9nPjwvc3ZnPg==',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-6',
                    name: '跑酷大冒险',
                    description: '刺激的跑酷游戏，挑战你的反应速度',
                    url: 'https://zwaley.github.io/runcool/',
                    category: 'action',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkNiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzMzZmY5OTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMGZmNjY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZDYpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLDE1MCkiPjxjaXJjbGUgY3g9Ii0yMCIgY3k9Ii0zMCIgcj0iMTIiIGZpbGw9IiNmZmNjNjYiLz48ZWxsaXBzZSBjeD0iLTIwIiBjeT0iLTEwIiByeD0iMTAiIHJ5PSIxNSIgZmlsbD0iIzMzOTlmZiIvPjxyZWN0IHg9Ii0zNSIgeT0iLTIwIiB3aWR0aD0iMTAiIGhlaWdodD0iMjAiIGZpbGw9IiNmZmNjNjYiIHJ4PSI1Ii8+PHJlY3QgeD0iLTEwIiB5PSItMjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmY2M2NiIgcng9IjUiLz48cmVjdCB4PSItMzAiIHk9IjUiIHdpZHRoPSI4IiBoZWlnaHQ9IjI1IiBmaWxsPSIjZmZjYzY2IiByeD0iNCIvPjxyZWN0IHg9Ii0xNSIgeT0iNSIgd2lkdGg9IjgiIGhlaWdodD0iMjUiIGZpbGw9IiNmZmNjNjYiIHJ4PSI0Ii8+PGVsbGlwc2UgY3g9Ii0yNiIgY3k9IjM1IiByeD0iNiIgcnk9IjQiIGZpbGw9IiMzMzMiLz48ZWxsaXBzZSBjeD0iLTExIiBjeT0iMzUiIHJ4PSI2IiByeT0iNCIgZmlsbD0iIzMzMyIvPjxwYXRoIGQ9Ik0gMTAgLTEwIEwgNDAgLTIwIEwgNDUgLTEwIEwgNDAgMCBMIDEwIDEwIFoiIGZpbGw9IiNmZjk5MzMiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPui3keW6k+WGkemZqzwvdGV4dD48L2c+PC9zdmc+',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-7',
                    name: '校园角色测试',
                    description: '有趣的校园角色测试，看看你是哪种人',
                    url: 'https://zwaley.github.io/meetoo/',
                    category: 'casual',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkNyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2ZmZjYztzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzM2NjZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZDcpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLDE1MCkiPjxyZWN0IHg9Ii00MCIgeT0iLTUwIiB3aWR0aD0iODAiIGhlaWdodD0iNjAiIGZpbGw9IndoaXRlIiByeD0iMTAiIHN0cm9rZT0iIzMzOTlmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PGNpcmNsZSBjeD0iLTIwIiBjeT0iLTM1IiByPSI4IiBmaWxsPSIjZmZjYzY2Ii8+PGVsbGlwc2UgY3g9Ii0yMCIgY3k9Ii0yMCIgcng9IjYiIHJ5PSI4IiBmaWxsPSIjMzM5OWZmIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSItMzUiIHI9IjgiIGZpbGw9IiNmZmNjNjYiLz48ZWxsaXBzZSBjeD0iMjAiIGN5PSItMjAiIHJ4PSI2IiByeT0iOCIgZmlsbD0iI2ZmOTkzMyIvPjx0ZXh0IHg9Ii0yMCIgeT0iLTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzMiIGZvbnQtc2l6ZT0iMTAiPkE8L3RleHQ+PHRleHQgeD0iMjAiIHk9Ii01IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzMzIiBmb250LXNpemU9IjEwIj5CPC90ZXh0Pjx0ZXh0IHg9IjAiIHk9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzMzIiBmb250LXNpemU9IjEwIj7mgqjmmK/lk6rkuIDnp43kuq7vvJ88L3RleHQ+PHRleHQgeD0iMCIgeT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPuagoeWbreaWueiJsua1i+ivlTwvdGV4dD48L2c+PC9zdmc+',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-8',
                    name: '正义使者大作战',
                    description: '维护校园正义，成为正义使者！',
                    url: 'https://zwaley.github.io/zysz/',
                    category: 'action',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkOCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmOTkzMztzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZjY2MDA7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZDgpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLDE1MCkiPjxjaXJjbGUgY3g9IjAiIGN5PSItMzAiIHI9IjE1IiBmaWxsPSIjZmZjYzY2Ii8+PGVsbGlwc2UgY3g9IjAiIGN5PSItMTAiIHJ4PSIxMiIgcnk9IjIwIiBmaWxsPSIjMzM5OWZmIi8+PHJlY3QgeD0iLTIwIiB5PSItMjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIyNSIgZmlsbD0iI2ZmY2M2NiIgcng9IjUiLz48cmVjdCB4PSIxMCIgeT0iLTIwIiB3aWR0aD0iMTAiIGhlaWdodD0iMjUiIGZpbGw9IiNmZmNjNjYiIHJ4PSI1Ii8+PHJlY3QgeD0iLTgiIHk9IjEwIiB3aWR0aD0iOCIgaGVpZ2h0PSIzMCIgZmlsbD0iI2ZmY2M2NiIgcng9IjQiLz48cmVjdCB4PSIwIiB5PSIxMCIgd2lkdGg9IjgiIGhlaWdodD0iMzAiIGZpbGw9IiNmZmNjNjYiIHJ4PSI0Ii8+PGVsbGlwc2UgY3g9Ii00IiBjeT0iNDUiIHJ4PSI2IiByeT0iNCIgZmlsbD0iIzMzMyIvPjxlbGxpcHNlIGN4PSI0IiBjeT0iNDUiIHJ4PSI2IiByeT0iNCIgZmlsbD0iIzMzMyIvPjxyZWN0IHg9Ii0zNSIgeT0iLTI1IiB3aWR0aD0iMTAiIGhlaWdodD0iMzAiIGZpbGw9IiNmZjMzMzMiIHJ4PSI1IiB0cmFuc2Zvcm09InJvdGF0ZSgtMzApIi8+PHBhdGggZD0iTSAtMzAgLTIwIEwgLTEwIC0zMCBMIC01IC0yNSBMIC0yNSAtMTUgWiIgZmlsbD0iI2ZmOTkzMyIvPjx0ZXh0IHg9IjAiIHk9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj7mraPkuYnkvb/ogIU8L3RleHQ+PC9nPjwvc3ZnPg==',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-9',
                    name: '方丈适合度测试',
                    description: '有趣的测试，看看你适合做方丈吗？',
                    url: 'https://zwaley.github.io/abbot-quiz/',
                    category: 'casual',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkOSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmZGQ5OTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZmJiMzM7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZDkpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLDE1MCkiPjxyZWN0IHg9Ii00MCIgeT0iLTYwIiB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNmZmNjNjYiIHJ4PSIxNSIgc3Ryb2tlPSIjZmY5OTMzIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSIwIiBjeT0iLTQwIiByPSIxMiIgZmlsbD0iI2ZmY2M2NiIvPjxlbGxpcHNlIGN4PSIwIiBjeT0iLTIwIiByeD0iMTUiIHJ5PSIyMCIgZmlsbD0iI2ZmOTkzMyIvPjxyZWN0IHg9Ii0yMCIgeT0iLTMwIiB3aWR0aD0iMTIiIGhlaWdodD0iMjAiIGZpbGw9IiNmZmNjNjYiIHJ4PSI2Ii8+PHJlY3QgeD0iOCIgeT0iLTMwIiB3aWR0aD0iMTIiIGhlaWdodD0iMjAiIGZpbGw9IiNmZmNjNjYiIHJ4PSI2Ii8+PGNpcmNsZSBjeD0iLTEwIiBjeT0iLTQ1IiByPSIzIiBmaWxsPSIjMzMzIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSItNDUiIHI9IjMiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNIC0xMCAtMzUgUSAwIC0zMCAxMCAtMzUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PHRleHQgeD0iMCIgeT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzMiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJBcmlhbCI+5Y2X5peg6Zi/5byl6LGh5LqLPC90ZXh0Pjx0ZXh0IHg9IjAiIHk9IjQ1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj7mlrnkuIjpgILlkIjluqbmtYvor5U8L3RleHQ+PC9nPjwvc3ZnPg==',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'game-10',
                    name: '星运占卜',
                    description: '探索你的星座奥秘，了解星座运势',
                    url: 'https://zwaley.github.io/stars/',
                    category: 'casual',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkMTAiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NjMzZmY7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzMwMGZmO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2dyYWQxMCkiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDAsMTUwKSI+PHBhdGggZD0iTSAwIC0zMCBMIDggLTEwIEwgMzAgLTEwIEwgMTIgNSBMIDIwIDI1IEwgMCAxNSBMIC0yMCAyNSBMIC0xMiA1IEwgLTMwIC0xMCBMIC04IC0xMCBaIiBmaWxsPSIjZmZkZDMzIiBzdHJva2U9IiNmZmJiMDAiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9Ii0yNSIgY3k9Ii0yNSIgcj0iMyIgZmlsbD0iI2ZmZmZmZiIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iLTIwIiByPSIyIiBmaWxsPSIjZmZmZmZmIi8+PGNpcmNsZSBjeD0iLTM1IiBjeT0iMTAiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz48Y2lyY2xlIGN4PSIzNSIgY3k9IjE1IiByPSIzIiBmaWxsPSIjZmZmZmZmIi8+PGNpcmNsZSBjeD0iLTE1IiBjeT0iMzUiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjMwIiByPSIyIiBmaWxsPSIjZmZmZmZmIi8+PGNpcmNsZSBjeD0iMCIgY3k9Ii00NSIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIvPjx0ZXh0IHg9IjAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj7mmJ/ov5Dljavor5U8L3RleHQ+PC9nPjwvc3ZnPg==',
                    addedDate: new Date().toISOString()
                }
            ];
            
        this.games = sampleGames;
        this.saveGames();
        this.renderGames();
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