/* ./src/js/important.js */
document.addEventListener('DOMContentLoaded', function () {
    // 获取DOM元素
    const searchInput = document.getElementById('home-steam-search');
    const searchBtn = document.getElementById('home-steam-search-btn');
    const featuredGamesContainer = document.getElementById('featured-games');
    const errorDiv = document.getElementById('featured-error');
    let gamesLoaded = false; // 标记游戏是否已加载

    // 从Wails后端获取Steam特色游戏列表
    async function loadFeaturedGames() {
        try {
            errorDiv.textContent = '';
            featuredGamesContainer.innerHTML = '<div class="text-center p-3">加载中...</div>';

            // 检查Wails函数是否存在并调用
            if (!window.go?.main?.App?.GetSteamFeatured) {
                throw new Error('无法连接 Wails 后端');
            }

            const response = await window.go.main.App.GetSteamFeatured();
            // 检查响应是否为有效值
            if (!response) {
                throw new Error('从后端获取的数据为空');
            }
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            displayGames(data);
            gamesLoaded = true;
        } catch (error) {
            errorDiv.textContent = error.toString();
            featuredGamesContainer.innerHTML = '';
            gamesLoaded = false;
        }
    }

    // 显示游戏数据
    function displayGames(data) {
        featuredGamesContainer.innerHTML = '';

        // 初始化数组
        let games = [];

        // 处理搜索API返回格式 (items数组)
        if (data && data.items && Array.isArray(data.items)) {
            games = data.items;
        }
        // 处理特色游戏API返回格式
        else if (data && (data.featured_win || data.featured_mac || data.featured_linux)) {
            const platformGames = [];
            if (Array.isArray(data.featured_win)) platformGames.push(...data.featured_win);
            if (Array.isArray(data.featured_mac)) platformGames.push(...data.featured_mac);
            if (Array.isArray(data.featured_linux)) platformGames.push(...data.featured_linux);
            games = platformGames;
        }

        if (games.length === 0) {
            featuredGamesContainer.innerHTML = '<p class="text-center">没有找到游戏数据</p>';
            return;
        }

        // 去重
        const uniqueGames = [];
        const appIdSet = new Set();
        for (const game of games) {
            const appId = game.id || game.appid;
            if (appId && !appIdSet.has(appId)) {
                appIdSet.add(appId);
                uniqueGames.push(game);
            }
        }

        // 创建文档片段以提高性能
        const fragment = document.createDocumentFragment();

        for (const game of uniqueGames) {
            const gameElement = document.createElement('div');
            gameElement.className = 'game-item';

            // 适配Steam Store API字段
            const appId = game.id || game.appid;
            const gameName = game.name || game.title || '未知游戏';

            // 图片URL处理
            let imageSrc = '';
            if (game.header_image) {
                imageSrc = game.header_image;
            } else if (game.tiny_image) {
                imageSrc = game.tiny_image;
            }

            // 价格信息处理
            let priceInfo = '';

            // 储存两种 API 不同的字段
            const finalPrice = (game.price && game.price.final) || game.final_price || 0;
            const initialPrice = (game.price && game.price.initial) || game.original_price || finalPrice;
            const discountPercent = game.discount_percent || (initialPrice > finalPrice ?
                Math.round((1 - finalPrice / initialPrice) * 100) : 0);

            if (finalPrice === 0 || game.is_free) {
                priceInfo = '免费';
            } else if (finalPrice < initialPrice) {
                priceInfo = `¥ ${(finalPrice / 100).toFixed(2)} <span class="text-danger">(-${discountPercent}%)</span> <span class="text-decoration-line-through">¥${(initialPrice / 100).toFixed(2)}</span>`;
            } else {
                priceInfo = `¥ ${(finalPrice / 100).toFixed(2)}`;
            }

            gameElement.innerHTML = `
            <div class="game-info flex-row justify-content-between align-items-center card">
                <div class="d-flex align-items-center">
                    <img src="${imageSrc}" class="me-3" style="width: 235px; height: 95px; object-fit: cover; border-radius: 5px;">
                    <div>
                        <div class="fw-bold">${gameName}</div>
                        <span class="small">AppID: ${appId}</span>
                        <div>${priceInfo}</div>
                        <a href="https://store.steampowered.com/app/${appId}/" target="_blank" rel="noopener noreferrer">Steam 商店链接</a>
                    </div>
                </div>
                <button class="app-btn add-to-library-btn" data-appid="${appId}">入库</button>
            </div>`;
            fragment.appendChild(gameElement);
        }

        featuredGamesContainer.innerHTML = '';
        featuredGamesContainer.appendChild(fragment);

        // 处理入库按钮点击
        featuredGamesContainer.addEventListener('click', async function (event) {
            const btn = event.target.closest('.add-to-library-btn');
            if (btn.dataset.loading === 'true') return;

            const appID = btn.getAttribute('data-appid');
            const originalText = btn.textContent.trim();
            btn.dataset.loading = 'true';
            btn.textContent = '正在入库...';
            btn.disabled = true;

            try {
                if (!window.go?.main?.App?.AddGameToLibrary) throw new Error('Wails入库函数未正确加载');
                const result = await window.go.main.App.AddGameToLibrary(appID);
                showToasts(result, 'success');
            } catch (error) {
                showToasts(error.toString(), 'error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.dataset.loading = 'false';
                btn.classList.remove('disabled');
            }
        });
    }

    // 搜索游戏
    async function searchGames(searchTerm) {
        try {
            errorDiv.textContent = '';
            featuredGamesContainer.innerHTML = `<div class="text-center p-3">搜索中...</div>`;

            // 检查Wails搜索函数是否存在
            if (!window.go?.main?.App?.SearchSteamGames) {
                throw new Error('搜索功能未初始化，请重启应用');
            }

            // 调用后端搜索接口
            const response = await window.go.main.App.SearchSteamGames(searchTerm);
            if (!response) {
                throw new Error('未找到匹配的游戏');
            }
            const data = typeof response === 'string' ? JSON.parse(response) : response;

            // 适配Steam Store API搜索返回格式
            displayGames(data);
        } catch (error) {
            errorDiv.textContent = error.toString();
            featuredGamesContainer.innerHTML = '';
        }
    }

    // 搜索按钮事件
    searchBtn.addEventListener('click', function () {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            searchGames(searchTerm);
        } else {
            // 搜索框为空时，重新加载热门游戏
            loadFeaturedGames();
        }
    });

    // 支持按回车键搜索
    searchInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            searchBtn.click();
        }
    });

    // 页面加载完成后自动加载游戏列表(仅首次)
    if (document.getElementById('home-page') && !document.getElementById('home-page').classList.contains('d-none') && !gamesLoaded) {
        loadFeaturedGames();
    }

    // 监听页面切换事件，仅在首次进入home页面时加载游戏
    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.addEventListener('click', function () {
            if (this.getAttribute('data-page') === 'home' && !gamesLoaded) {
                setTimeout(loadFeaturedGames, 100);
            }
        });
    });
});