// 显示通知
window.showToasts = function(message, type) {
    if (!message) return;

    // 创建通知容器
    const toastsDiv = document.createElement('div');
    // 添加基础类
    toastsDiv.className = 'toasts-container toasts-fade-in';
    // 根据类型添加相应的类
    toastsDiv.classList.add(type === 'success' ? 'bg-success' : 'bg-danger');
    toastsDiv.setAttribute('role', 'alert');
    toastsDiv.setAttribute('aria-live', 'assertive');

    // 创建消息文本容器
    const messageSpan = document.createElement('span');
    messageSpan.className = 'toasts-message';
    messageSpan.textContent = message;

    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-close btn-close-white';
    closeBtn.setAttribute('aria-label', '关闭提示');
    // 关闭按钮点击事件
    closeBtn.addEventListener('click', () => closeToasts(toastsDiv));

    // 组装弹窗
    toastsDiv.appendChild(messageSpan);
    toastsDiv.appendChild(closeBtn);

    // 添加到页面
    document.body.appendChild(toastsDiv);

    // 设置自动消失（保存定时器引用，方便手动关闭时清除）
    const timer = setTimeout(() => {
        closeToasts(toastsDiv);
    }, 5000);
    toastsDiv.dataset.timer = timer;
};

// 统一的关闭弹窗方法
function closeToasts(toastsElement) {
    if (!toastsElement || !toastsElement.parentNode) return;
    
    // 清除自动消失定时器
    clearTimeout(toastsElement.dataset.timer);
    
    // 触发淡出动画
    toastsElement.classList.remove('toasts-fade-in');
    toastsElement.classList.add('toasts-fade-out');

    // 动画结束后移除元素
    toastsElement.addEventListener('animationend', () => {
        toastsElement.remove();
    }, { once: true });
}