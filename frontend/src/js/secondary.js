/* ./src/js/secondary.js */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        // 获取DOM元素
        const cleanCache = document.getElementById('clear-cache');
        const sidebar = document.getElementById('sidebar');
        const toggleSidebarBtn = document.getElementById('sidebar-btn');
        const darkToggle = document.getElementById('dark-mode');
        const navItems = document.querySelectorAll('.nav-item');
        const pages = document.querySelectorAll('.page');
        const pageTitle = document.getElementById('page-title');
        const glassToggle = document.getElementById('glass');
        let glassObserver;

        // 清理缓存按钮事件
        cleanCache.addEventListener('click', function () {
            localStorage.clear();  // 清除 localStorage
            sessionStorage.clear();  // 清除 sessionStorage
            window.location.reload(true); // 强制重新加载页面
        });

        // 侧边栏切换
        toggleSidebarBtn.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
        });

        // 页面切换
        navItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();

                // 移除所有活跃状态
                navItems.forEach(nav => nav.classList.remove('active'));
                pages.forEach(page => page.classList.add('page-none', 'fade-animation'));

                // 添加当前活跃状态
                this.classList.add('active');
                const pageId = this.getAttribute('data-page') + '-page';
                const pageKey = this.getAttribute('data-page');
                const targetPage = document.getElementById(pageId);
                if (targetPage) targetPage.classList.remove('page-none', 'fade-animation');

                // 保存
                try {
                    if (pageKey) localStorage.setItem('lastPage', pageKey);
                } catch (e) { }

                // 更新页面标题和图标
                const navIcon = this.querySelector('i') ? this.querySelector('i').className : '';
                const navText = this.querySelector('.nav-text') ? this.querySelector('.nav-text').textContent : '';

                // 添加动画
                pageTitle.classList.add('fade-animation');
                pageTitle.innerHTML = `<i class="${navIcon} me-2"></i>${navText}`; // 更新标题内容
                setTimeout(() => {
                    pageTitle.classList.remove('fade-animation');
                }, 500); // 动画持续时间与 CSS 保持一致
            });
        });

        // 页面加载时恢复上次打开的页面
        (function restoreLastPage() {
            try {
                const last = localStorage.getItem('lastPage');
                let activated = false;
                if (last) {
                    const preserved = document.querySelector(`.nav-item[data-page="${last}"]`);
                    if (preserved) {
                        preserved.click();
                        activated = true;
                    }
                }
                if (!activated) {
                    const existing = document.querySelector('.nav-item.active');
                    if (existing) existing.click();
                    else if (navItems.length) navItems[0].click();
                }
            } catch (e) { }
        })();

        // 深色/浅色模式切换
        function setDarkMode(enable) {
            if (enable) {
                document.documentElement.setAttribute('dark-mode', '');
                localStorage.setItem('dark-mode', 'true');
            } else {
                document.documentElement.removeAttribute('dark-mode');
                localStorage.setItem('dark-mode', 'false');
            }
            if (darkToggle) darkToggle.checked = !!enable;
        }

        // 初始恢复状态（优先 localStorage, 否则参考系统偏好）
        const storedDark = localStorage.getItem('dark-mode');
        const initialDark = storedDark === 'true' || (storedDark === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setDarkMode(initialDark);

        // 将主题切换控制权移植到设置页的复选框（#dark-mode）
        if (darkToggle) {
            darkToggle.checked = document.documentElement.hasAttribute('dark-mode');
            darkToggle.addEventListener('change', function () {
                setDarkMode(this.checked);
            });
        }

        /* 毛玻璃设置（有背景时自动启用；无背景时允许手动控制） */
        function updateGlassMode() {
            const isDarkMode = document.documentElement.hasAttribute('dark-mode');

            // 根据 localStorage 中是否存在自定义背景或启用的轮播并且有图片来决定是否自动启用毛玻璃
            const customBg = localStorage.getItem('customBackground');
            const hasRemoved = localStorage.getItem('hasRemovedBackground') === 'true';
            const carouselEnabled = localStorage.getItem('carouselEnabled') === 'true';
            let hasCarouselImages = false;
            try {
                const imgs = JSON.parse(localStorage.getItem('carouselImages') || '[]');
                hasCarouselImages = Array.isArray(imgs) && imgs.length > 0;
            } catch (e) {
                hasCarouselImages = false;
            }

            const isGlassAuto = (!!customBg && !hasRemoved) || (carouselEnabled && hasCarouselImages);
            const storedGlass = localStorage.getItem('glass-mode') === 'true';

            if (isGlassAuto) {
                // 有背景或轮播 -> 自动开启毛玻璃并禁用手动开关
                document.documentElement.setAttribute('img-mode', isDarkMode ? 'dark' : 'light');
                if (glassToggle) {
                    glassToggle.checked = true;
                    glassToggle.disabled = true;
                }
            } else {
                // 无背景 -> 允许用户手动控制
                if (storedGlass) {
                    document.documentElement.setAttribute('glass-mode', isDarkMode ? 'dark' : 'light');
                    document.documentElement.setAttribute('img-mode', 'none');
                } else {
                    document.documentElement.setAttribute('glass-mode', 'none');
                    document.documentElement.setAttribute('img-mode', 'none');
                }
                if (glassToggle) {
                    glassToggle.checked = !!storedGlass;
                    glassToggle.disabled = false;
                }
            }
        }

        function setupGlassObserver() {
            // 观察'dark-mode'属性变化并更新玻璃态
            glassObserver = new MutationObserver(() => {
                updateGlassMode();
            });
            glassObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['dark-mode'] });

            // 监听自定义事件, 在背景或轮播数据变化时触发更新
            document.addEventListener('background-changed', () => {
                updateGlassMode();
            });
        }

        // 从本地存储恢复玻璃态设置（首次执行）
        updateGlassMode();
        // 启动 DOM / 事件 观察
        setupGlassObserver();
        // 允许用户在没有自定义背景时手动控制毛玻璃开关
        if (glassToggle) {
            glassToggle.addEventListener('change', function () {
                try { localStorage.setItem('glass-mode', this.checked); } catch (e) { }
                updateGlassMode();
            });
        }
    });
})();

/* 雪花效果 */
(function () {
    const MAX_SNOW = 40;             // 最多同时存在的雪花数量1
    const SPAWN_INTERVAL = 180;      // 毫秒
    let enabled = localStorage.getItem('snowEnabled') == 'true';
    const pool = [];
    const active = new Set();

    function createElem() {
        const el = document.createElement('div');
        el.className = 'snow';
        el.style.display = 'none';
        el.addEventListener('animationend', () => {
            // 动画结束 -> 隐藏并回收
            el.style.display = 'none';
            el.style.animation = 'none';
            active.delete(el);
            pool.push(el);
        });
        return el;
    }

    function spawn() {
        if (!enabled) return;
        if (active.size >= MAX_SNOW) return;
        const el = pool.length ? pool.pop() : createElem();

        // 随机属性
        const size = (Math.random() * 6 + 4).toFixed(1); // 4-10px
        const left = (Math.random() * 100).toFixed(2) + 'vw';
        const dur = (Math.random() * 12 + 6).toFixed(2) + 's'; // 6-18s
        const horiz = (Math.random() * 240 - 120).toFixed(1) + 'px'; // -120 ~ 120px

        el.style.setProperty('--size', size + 'px');
        el.style.left = left;
        el.style.setProperty('--dur', dur);
        el.style.setProperty('--h', horiz);
        el.style.display = 'block';

        // 重新触发动画（重设 animation 可重用元素）
        el.style.animation = 'none';
        // 强制重绘以确保动画重启
        void el.offsetWidth;
        el.style.animation = `fall var(--dur) linear forwards`;

        if (!el.parentElement) document.body.appendChild(el);
        active.add(el);
    }

    function start() {
        if (window._snowInterval) return;
        window._snowInterval = setInterval(spawn, SPAWN_INTERVAL);
    }

    function stop() {
        clearInterval(window._snowInterval);
        window._snowInterval = null;
        // 隐藏并回收所有活动 snow
        active.forEach(el => {
            el.style.display = 'none';
            el.style.animation = 'none';
            active.delete(el);
            pool.push(el);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const checkbox = document.getElementById('snow');

        // 预创建元素池, 避免运行时频繁创建
        for (let i = 0; i < 24; i++) pool.push(createElem());

        if (checkbox) {
            checkbox.checked = enabled;
            checkbox.addEventListener('change', () => {
                enabled = checkbox.checked;
                localStorage.setItem('snowEnabled', enabled);
                enabled ? start() : stop();
            });
        }

        if (enabled) start();
    });
})();

/* 自定义背景图片 */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        // 获取DOM元素（可能在目标项目中不存在, 全部作存在性检查）
        const backgroundImageInput = document.getElementById('backgroundImage');
        const removeBackgroundBtn = document.getElementById('removeBackground');
        const restoreDefaultBackgroundBtn = document.getElementById('restoreDefaultBackground');
        const blurAmountSlider = document.getElementById('blurAmount');
        const blurValueDisplay = document.getElementById('blurValue');
        const saturationAmountSlider = document.getElementById('saturationAmount');
        const saturationValueDisplay = document.getElementById('saturationValue');
        const brightnessAmountSlider = document.getElementById('brightnessAmount');
        const brightnessValueDisplay = document.getElementById('brightnessValue');
        const guiContent = document.querySelector('.app-container');
        const backgroundContainer = document.querySelector('.background-container') || document.querySelector('.bg-img');

        // 轮播相关元素（可选）
        const enableCarouselCheckbox = document.getElementById('enableCarousel');
        const carouselIntervalSlider = document.getElementById('carouselInterval');
        const intervalValueDisplay = document.getElementById('intervalValue');
        const carouselImagesInput = document.getElementById('carouselImages');
        const carouselImageList = document.getElementById('carouselImageList');
        const clearCarouselImagesBtn = document.getElementById('clearCarouselImages');

        // 默认背景图片路径
        const defaultBackground = './Default1.avif';

        // 轮播相关变量
        let carouselIntervalId = null;
        let carouselImages = [defaultBackground, './Default2.avif', './Default3.avif', './Default4.avif', './Default5.avif'];
        let currentCarouselIndex = 0;

        // 从localStorage恢复设置, 尽量容错
        let savedBackground = null;
        let hasRemovedBackground = false;
        try {
            savedBackground = localStorage.getItem('customBackground');
            hasRemovedBackground = localStorage.getItem('hasRemovedBackground') === 'true';

            const savedCarouselImages = localStorage.getItem('carouselImages');
            if (savedCarouselImages) {
                try {
                    carouselImages = JSON.parse(savedCarouselImages);
                } catch (e) {
                    console.warn('解析 carouselImages 失败', e);
                }
            }

            const savedCarouselIndex = localStorage.getItem('currentCarouselIndex');
            if (savedCarouselIndex !== null) {
                currentCarouselIndex = parseInt(savedCarouselIndex) || 0;
            }

            const savedCarouselInterval = localStorage.getItem('carouselInterval') || '10';
            if (carouselIntervalSlider) {
                carouselIntervalSlider.value = savedCarouselInterval;
            }

            if (intervalValueDisplay) {
                intervalValueDisplay.textContent = savedCarouselInterval;
            }
        } catch (e) {
            console.error('读取 localStorage 时出错:', e);
        }

        // 默认不启用自定义背景：保持 savedBackground 为 null, 除非用户上传或恢复默认
        if (!savedBackground || hasRemovedBackground) {
            savedBackground = null;
        }

        const savedBlurAmount = localStorage.getItem('blurAmount') || '3';
        const savedSaturationAmount = localStorage.getItem('saturationAmount') || '100';
        const savedBrightnessAmount = localStorage.getItem('brightnessAmount') || '100';
        const isModuleBlurEnabled = localStorage.getItem('moduleBlurEnabled') === 'true';
        const isSizeLimitDisabled = localStorage.getItem('sizeLimitDisabled') === 'true';
        const isBackgroundBlurEnabled = localStorage.getItem('backgroundBlurEnabled') === 'true';

        if (savedBlurAmount) {
            document.documentElement.style.setProperty('--blur-amount', `${savedBlurAmount}px`);
        }

        if (blurAmountSlider) {
            blurAmountSlider.value = savedBlurAmount;
        }

        if (blurValueDisplay) {
            blurValueDisplay.textContent = savedBlurAmount;
        }
        if (saturationAmountSlider) {
            saturationAmountSlider.value = savedSaturationAmount;
        }

        if (saturationValueDisplay) {
            saturationValueDisplay.textContent = savedSaturationAmount;
        }

        if (brightnessAmountSlider) {
            brightnessAmountSlider.value = savedBrightnessAmount;
        }

        if (brightnessValueDisplay) {
            brightnessValueDisplay.textContent = savedBrightnessAmount;
        }

        function updateBackgroundFilter() {
            const saturationValue = saturationAmountSlider ? saturationAmountSlider.value : savedSaturationAmount;
            const brightnessValue = brightnessAmountSlider ? brightnessAmountSlider.value : savedBrightnessAmount;
            if (backgroundContainer) {
                backgroundContainer.style.filter = `saturate(${saturationValue}%) brightness(${brightnessValue}%)`;
            }
        }

        function initBackground() {
            if (savedBackground && backgroundContainer) {
                backgroundContainer.style.backgroundImage = `url("${savedBackground}")`;
                if (isBackgroundBlurEnabled && guiContent) {
                    guiContent.style.backdropFilter = `blur(var(--blur-amount))`;
                    guiContent.style.webkitBackdropFilter = `blur(var(--blur-amount))`;
                } else if (guiContent) {
                    guiContent.style.backdropFilter = '';
                    guiContent.style.webkitBackdropFilter = '';
                }
                updateBackgroundFilter();
            } else if (backgroundContainer) {
                backgroundContainer.style.backgroundImage = 'none';
            }
        }

        function initCarouselImageList() {
            if (!carouselImageList) return;
            if (carouselImages.length === 0) {
                carouselImageList.innerHTML = '<p>暂无轮播图片</p>';
                return;
            }
            carouselImageList.innerHTML = '';
            carouselImages.forEach((image, index) => {
                const imgElement = document.createElement('img');
                imgElement.src = image;
                imgElement.alt = `轮播图片 ${index + 1}`;
                imgElement.style.width = '50px';
                imgElement.style.height = '50px';
                imgElement.style.objectFit = 'cover';
                imgElement.style.borderRadius = '4px';
                imgElement.style.cursor = 'pointer';
                imgElement.style.transition = 'transform 0.2s ease';
                imgElement.addEventListener('click', function () {
                    if (backgroundContainer) {
                        backgroundContainer.classList.add('carousel-transition');
                        setTimeout(() => {
                            backgroundContainer.style.backgroundImage = `url("${image}")`;
                            backgroundContainer.classList.remove('carousel-transition');
                        }, 300);
                    }
                    currentCarouselIndex = index;
                    try { localStorage.setItem('currentCarouselIndex', String(currentCarouselIndex)); } catch (e) { }
                    // 将所选轮播图片设为当前自定义背景并触发背景变更，使毛玻璃自动启用
                    try {
                        localStorage.setItem('customBackground', image);
                        localStorage.removeItem('hasRemovedBackground');
                    } catch (e) {
                        console.error('保存所选轮播图片为自定义背景失败', e);
                    }
                    try {
                        document.dispatchEvent(new Event('background-changed'));
                    } catch (e) { }
                });
                imgElement.addEventListener('mouseenter', function () { this.style.transform = 'scale(1.1)'; });
                imgElement.addEventListener('mouseleave', function () { this.style.transform = 'scale(1)'; });
                carouselImageList.appendChild(imgElement);
            });
        }

        function startCarousel() {
            if (carouselIntervalId) clearInterval(carouselIntervalId);
            if (carouselImages.length === 0 || !backgroundContainer) return;
            const interval = carouselIntervalSlider ? parseInt(carouselIntervalSlider.value) * 1000 : 10000;
            carouselIntervalId = setInterval(() => {
                if (backgroundContainer && carouselImages.length > 0) {
                    backgroundContainer.classList.add('carousel-transition');
                    setTimeout(() => {
                        currentCarouselIndex = (currentCarouselIndex + 1) % carouselImages.length;
                        backgroundContainer.style.backgroundImage = `url("${carouselImages[currentCarouselIndex]}")`;
                        backgroundContainer.classList.remove('carousel-transition');
                        try { localStorage.setItem('currentCarouselIndex', String(currentCarouselIndex)); } catch (e) { }
                    }, 500);
                }
            }, interval);
        }

        function stopCarousel() {
            if (carouselIntervalId) {
                clearInterval(carouselIntervalId);
                carouselIntervalId = null;
            }
        }

        // 初始化
        initBackground();
        initCarouselImageList();
        if (enableCarouselCheckbox && enableCarouselCheckbox.checked) startCarousel();

        // 事件监听：上传背景
        if (backgroundImageInput) {
            backgroundImageInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (!file) return;
                if (!isSizeLimitDisabled && file.size > 2 * 1024 * 1024) {
                    alert('图片文件太大, 请选择小于2MB的图片, 或在设置中启用"移除图片大小限制"选项。');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (event) {
                    const dataUrl = event.target.result;
                    try {
                        localStorage.setItem('customBackground', dataUrl);
                    } catch (e) {
                        console.error('保存自定义背景失败', e);
                    }
                    if (backgroundContainer) {
                        backgroundContainer.classList.add('carousel-transition');
                        setTimeout(() => {
                            backgroundContainer.style.backgroundImage = `url("${dataUrl}")`;
                            backgroundContainer.classList.remove('carousel-transition');
                        }, 300);
                    }
                    // 通知毛玻璃状态更新
                    try { document.dispatchEvent(new Event('background-changed')); } catch (e) { }
                };
                reader.readAsDataURL(file);
            });
        }

        if (removeBackgroundBtn) {
            removeBackgroundBtn.addEventListener('click', function () {
                if (backgroundContainer) {
                    backgroundContainer.classList.add('carousel-transition');
                    setTimeout(() => {
                        backgroundContainer.style.backgroundImage = 'none';
                        backgroundContainer.classList.remove('carousel-transition');
                    }, 300);
                }
                try {
                    localStorage.removeItem('customBackground');
                    localStorage.setItem('hasRemovedBackground', 'true');
                } catch (e) {
                    console.error(e);
                }
                if (backgroundImageInput) backgroundImageInput.value = '';
                try {
                    document.dispatchEvent(new Event('background-changed'));
                } catch (e) { }
            });
        }

        if (restoreDefaultBackgroundBtn) {
            restoreDefaultBackgroundBtn.addEventListener('click', function () {
                if (backgroundContainer) {
                    backgroundContainer.classList.add('carousel-transition');
                    setTimeout(() => {
                        backgroundContainer.style.backgroundImage = `url("${defaultBackground}")`;
                        backgroundContainer.classList.remove('carousel-transition');
                    }, 300);
                }
                try {
                    localStorage.setItem('customBackground', defaultBackground);
                    localStorage.removeItem('hasRemovedBackground');
                } catch (e) {
                    console.error(e);
                }
                if (backgroundImageInput) backgroundImageInput.value = '';
                try {
                    document.dispatchEvent(new Event('background-changed'));
                } catch (e) { }
            });
        }

        if (blurAmountSlider) {
            blurAmountSlider.addEventListener('input', function () {
                const blurValue = this.value; document.documentElement.style.setProperty('--blur-amount', `${blurValue}px`); if (blurValueDisplay) blurValueDisplay.textContent = blurValue; try { localStorage.setItem('blurAmount', blurValue); } catch (e) { }
                const isBackgroundBlurEnabledNow = localStorage.getItem('backgroundBlurEnabled') === 'true';
                if (backgroundContainer && savedBackground && isBackgroundBlurEnabledNow && guiContent) {
                    guiContent.style.backdropFilter = `blur(${blurValue}px)`;
                    guiContent.style.webkitBackdropFilter = `blur(${blurValue}px)`;
                }
                updateBackgroundFilter();
            });
        }

        if (saturationAmountSlider) {
            saturationAmountSlider.addEventListener('input', function () {
                const v = this.value;
                if (saturationValueDisplay) saturationValueDisplay.textContent = v;
                try {
                    localStorage.setItem('saturationAmount', v);
                } catch (e) { }
                updateBackgroundFilter();
            });
        }

        if (brightnessAmountSlider) {
            brightnessAmountSlider.addEventListener('input', function () {
                const v = this.value;
                if (brightnessValueDisplay) brightnessValueDisplay.textContent = v;
                try {
                    localStorage.setItem('brightnessAmount', v);
                } catch (e) { }
                updateBackgroundFilter();
            });
        }

        // 模块毛玻璃、背景毛玻璃等控件可能不存在；提供防御性实现
        const moduleBlurCheckbox = document.getElementById('enableModuleBlur');
        const backgroundBlurCheckbox = document.getElementById('enableBackgroundBlur');
        const disableSizeLimitCheckbox = document.getElementById('disableSizeLimit');

        function updateModuleBlurEffect() {
            const cards = document.querySelectorAll('.card');
            const sidebar = document.querySelector('.sidebar');
            const dropdown = document.querySelectorAll('.dropdown-menu');
            const buttons = document.querySelectorAll('.GUI-btn, .app-btn');
            const inputs = document.querySelectorAll('input, select');

            if (moduleBlurCheckbox && moduleBlurCheckbox.checked) {
                cards.forEach(card => { card.style.backdropFilter = `blur(var(--blur-amount))`; card.style.webkitBackdropFilter = `blur(var(--blur-amount))`; });
                if (sidebar) { sidebar.style.backdropFilter = `blur(var(--blur-amount))`; }
                dropdown.forEach(d => { d.style.backdropFilter = `blur(var(--blur-amount))`; });
                buttons.forEach(b => { b.style.backdropFilter = `blur(var(--blur-amount))`; });
            } else {
                cards.forEach(card => { card.style.backdropFilter = ''; card.style.webkitBackdropFilter = ''; });
                if (sidebar) sidebar.style.backdropFilter = '';
                inputs.forEach(i => { i.style.backdropFilter = ''; });
                buttons.forEach(b => { b.style.backdropFilter = ''; });
            }
        }

        function updateBackgroundBlurEffect() {
            if (!guiContent) return;
            if (backgroundBlurCheckbox && backgroundBlurCheckbox.checked) {
                guiContent.style.backdropFilter = `blur(var(--blur-amount))`;
            } else {
                guiContent.style.backdropFilter = '';
            }
        }

        if (moduleBlurCheckbox) {
            moduleBlurCheckbox.checked = isModuleBlurEnabled;
            moduleBlurCheckbox.addEventListener('change', updateModuleBlurEffect);
            updateModuleBlurEffect();
        }
        if (backgroundBlurCheckbox) {
            backgroundBlurCheckbox.checked = isBackgroundBlurEnabled;
            backgroundBlurCheckbox.addEventListener('change', updateBackgroundBlurEffect);
            updateBackgroundBlurEffect();
        }
        if (disableSizeLimitCheckbox) {
            disableSizeLimitCheckbox.checked = isSizeLimitDisabled;
            disableSizeLimitCheckbox.addEventListener('change', function () {
                try {
                    localStorage.setItem('sizeLimitDisabled', this.checked);
                } catch (e) { }
            });
        }

        if (enableCarouselCheckbox) {
            enableCarouselCheckbox.checked = localStorage.getItem('carouselEnabled') === 'true';
            enableCarouselCheckbox.addEventListener('change', function () {
                try {
                    localStorage.setItem('carouselEnabled', this.checked);
                } catch (e) { }
                if (this.checked) startCarousel(); else stopCarousel();
                try {
                    document.dispatchEvent(new Event('background-changed'));
                } catch (e) { }
            });
        }

        if (carouselIntervalSlider) {
            carouselIntervalSlider.addEventListener('input', function () {
                const v = this.value;
                if (intervalValueDisplay) intervalValueDisplay.textContent = v;
                try {
                    localStorage.setItem('carouselInterval', v);
                } catch (e) { }
                if (enableCarouselCheckbox && enableCarouselCheckbox.checked) {
                    stopCarousel(); startCarousel();
                }
            });
        }

        if (carouselImagesInput) {
            carouselImagesInput.addEventListener('change', function (e) {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                const newImages = [];
                Array.from(files).forEach(file => {
                    if (!isSizeLimitDisabled && file.size > 2 * 1024 * 1024) return;
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        newImages.push(ev.target.result);
                        try {
                            localStorage.setItem('carouselImages', JSON.stringify(newImages.concat(carouselImages.slice(0))));
                        } catch (e) { } initCarouselImageList();
                    };
                    reader.readAsDataURL(file);
                });
                try {
                    document.dispatchEvent(new Event('background-changed'));
                } catch (e) { }
            });
        }

        if (clearCarouselImagesBtn) {
            clearCarouselImagesBtn.addEventListener('click', function () {
                carouselImages = []; currentCarouselIndex = 0;
                try {
                    localStorage.removeItem('carouselImages');
                    localStorage.removeItem('currentCarouselIndex');
                } catch (e) { }
                initCarouselImageList();
                stopCarousel();
            });
        }
        // 通知毛玻璃更新（清空轮播也会影响是否启用毛玻璃）
        if (clearCarouselImagesBtn) {
            clearCarouselImagesBtn.addEventListener('click', function () {
                try {
                    document.dispatchEvent(new Event('background-changed'));
                } catch (e) { }
            });
        }
    });
})();