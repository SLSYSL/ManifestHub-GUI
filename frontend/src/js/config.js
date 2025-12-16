/* ./src/js/config.js */
document.addEventListener('DOMContentLoaded', () => {
    // 加载配置
    loadConfig();

    // 绑定保存按钮事件
    const saveBtn = document.getElementById('saveConfig');
    saveBtn.addEventListener('click', saveConfig);
});

// 加载配置
async function loadConfig() {
    try {
        const config = await window.go.main.App.GetConfig();
        console.log('从后端获取的配置:', config); // 调试信息
        
        // 确保值正确转换为字符串
        document.getElementById('read-steam-path').value = config.read_steam_path === true ? 'true' : 'false';
        document.getElementById('download-path').value = config.download_path || './Download';
        document.getElementById('add-dlc').value = config.add_dlc === true ? 'true' : 'false';
        document.getElementById('set-manifest').value = config.set_manifestid === true ? 'true' : 'false';
        document.getElementById('github-token').value = config.github_token || '';
        
        console.log('设置后的表单值:', { // 调试信息
            readSteamPath: document.getElementById('read-steam-path').value,
            downloadPath: document.getElementById('download-path').value,
            addDLC: document.getElementById('add-dlc').value,
            setManifest: document.getElementById('set-manifest').value,
            githubToken: document.getElementById('github-token').value
        });
    } catch (error) {
        console.error('加载配置失败:', error.toString());
        showToasts('加载配置失败: ' + error.toString(), "error");
    }
}

// 验证配置
function validateConfig(config) {
    const errors = [];
    if (!config.read_steam_path && (!config.download_path || config.download_path.trim() === '')) {
        errors.push('自定义下载路径不能为空');
    }
    return errors;
}

// 保存配置
async function saveConfig() {
    const saveBtn = document.getElementById('saveConfig');
    const originalText = saveBtn.innerHTML;
    
    try {
        // 禁用保存按钮，防止重复点击
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa fa-spinner fa-spin me-1"></i>保存中...';
        
        // 正确获取所有表单元素
        const config = {
            read_steam_path: document.getElementById('read-steam-path').value === 'true',
            download_path: document.getElementById('download-path').value.trim(),
            add_dlc: document.getElementById('add-dlc').value === 'true',
            set_manifestid: document.getElementById('set-manifest').value === 'true',
            github_token: document.getElementById('github-token').value.trim()
        };

        console.log('要保存的配置:', config); // 调试信息

        // 验证配置
        const validationErrors = validateConfig(config);
        if (validationErrors.length > 0) {
            showToasts(validationErrors.join('; '), "error");
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
            return;
        }

        // 逐个修改配置项
        let success = true;
        for (const [key, value] of Object.entries(config)) {
            try {
                console.log(`正在修改配置 ${key}: ${value}`); // 调试信息
                await window.go.main.App.ModifyConfig(key, value);
            } catch (err) {
                console.error(`修改配置 ${key} 失败:`, err);
                success = false;
                break;
            }
        }

        if (success) {
            showToasts('配置保存成功', "success");
            
            // 等待一小段时间，确保后端配置已刷新
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 重新加载配置
            await loadConfig();
        } else {
            showToasts('部分配置保存失败', "error");
        }
    } catch (error) {
        console.error('保存配置失败:', error);
        showToasts('保存配置失败: ' + error.toString(), "error");
    } finally {
        // 恢复保存按钮状态
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}