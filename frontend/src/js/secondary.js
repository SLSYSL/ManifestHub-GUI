/* ./src/js/secondary.js */
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

    // 页面切换逻辑
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // 移除所有活跃状态
            navItems.forEach(nav => nav.classList.remove('active'));
            pages.forEach(page => page.classList.add('page-none', 'fade-animation'));

            // 添加当前活跃状态
            this.classList.add('active');
            const pageId = this.getAttribute('data-page') + '-page';
            document.getElementById(pageId).classList.remove('page-none', 'fade-animation');

            // 更新页面标题和图标
            const navIcon = this.querySelector('i').className; // 获取导航项的图标类名
            const navText = this.querySelector('.nav-text').textContent; // 获取导航项的文本

            // 添加动画类
            pageTitle.classList.add('fade-animation');
            pageTitle.innerHTML = `<i class="${navIcon} me-2"></i>${navText}`; // 更新标题内容
            setTimeout(() => {
                pageTitle.classList.remove('fade-animation');
            }, 500); // 动画持续时间与 CSS 保持一致
        });
    });

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

    // 初始恢复状态（优先 localStorage，否则参考系统偏好）
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

    /* 毛玻璃设置 */
    function updateGlassMode() {
        const isGlassEnabled = localStorage.getItem('glass-mode') === 'true';
        const isDarkMode = document.documentElement.hasAttribute('dark-mode');

        // 更新玻璃态属性
        document.documentElement.setAttribute('glass-mode', isGlassEnabled ? (isDarkMode ? 'dark' : 'light') : 'none');

        // 同步复选框状态
        glassToggle.checked = isGlassEnabled;
    }

    function setupGlassObserver() {
        // 观察'dark-mode'属性变化并更新玻璃态
        glassObserver = new MutationObserver(() => {
            if (localStorage.getItem('glass-mode') === 'true') {
                updateGlassMode();
            }
        });
        glassObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['dark-mode'] });
    }

    // 从本地存储恢复玻璃态设置
    updateGlassMode();
    // 启动DOM观察者
    setupGlassObserver();

    // 玻璃态复选框切换事件
    glassToggle.addEventListener('change', function () {
        localStorage.setItem('glass-mode', this.checked);
        updateGlassMode(); // 手动触发一次更新
    });
});
(function(){
	const MAX_SNOW = 40;             // 最多同时存在的雪花数量1
	const SPAWN_INTERVAL = 180;      // 毫秒
	let enabled = localStorage.getItem('snowEnabled') == 'true';
	const pool = [];
	const active = new Set();

	function createElem(){
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

	function spawn(){
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

	function start(){
		if (window._snowInterval) return;
		window._snowInterval = setInterval(spawn, SPAWN_INTERVAL);
	}

	function stop(){
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

	document.addEventListener('DOMContentLoaded', ()=>{
		const checkbox = document.getElementById('snow');

		// 预创建元素池，避免运行时频繁创建
		for (let i=0;i<24;i++) pool.push(createElem());

		if (checkbox){
			checkbox.checked = enabled;
			checkbox.addEventListener('change', ()=>{
				enabled = checkbox.checked;
				localStorage.setItem('snowEnabled', enabled);
				enabled ? start() : stop();
			});
		}

		if (enabled) start();
	});
})();