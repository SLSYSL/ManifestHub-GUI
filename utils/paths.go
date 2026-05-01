/* utils.paths */
package utils

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"golang.org/x/sys/windows/registry"
)

// 获取 %AppData%
func GetAppData() string {
	// 获取环境变量
	AppData := os.Getenv("APPDATA")

	// 不存在获取用户主目录
	if AppData == "" {
		userHome, err := os.UserHomeDir()
		if err != nil {
			log.Printf("无法获取用户主目录: %v", err)
			return "."
		} else {
			AppData = filepath.Join(userHome, "AppData", "Roaming")
		}
	}

	return AppData
}

// 获取 Steam 游戏路径
func GetSteamGamePath() (string, error) {
	// Steam注册表路径
	registryPaths := []string{
		`SOFTWARE\WOW6432Node\Valve\Steam`, // 64位
		`SOFTWARE\Valve\Steam`,             // 32位
	}

	var installPath string
	var lastErr error

	for _, regPath := range registryPaths {
		// 打开注册表项(HKEY_LOCAL_MACHINE，只读权限)
		key, err := registry.OpenKey(registry.LOCAL_MACHINE, regPath, registry.QUERY_VALUE)
		if err != nil {
			lastErr = err
			continue
		}
		defer key.Close()

		// 读取InstallPath键值
		path, _, err := key.GetStringValue("InstallPath")
		if err != nil {
			lastErr = err
			continue
		}

		if path != "" {
			installPath = path
			break // 找到有效路径，退出循环
		}
	}

	if installPath == "" {
		return "", fmt.Errorf("未找到 Steam 安装路径(注册表读取失败): %w", lastErr)
	}

	fullPath := filepath.Join(append([]string{installPath}, "config", "stplug-in")...)

	return fullPath, nil
}
