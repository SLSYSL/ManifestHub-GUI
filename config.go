/* config.go */
package main

import (
	"os"
	"path/filepath"

	"log"

	"github.com/spf13/viper"
)

// 配置文件结构
type Config struct {
	ReadSteamPath bool   `json:"read_steam_path"` // 下载后存入 SteamTools 读取路径文件夹
	DownloadPath  string `json:"download_path"`   // 下载路径
	AddDLC        bool   `json:"add_dlc"`         // 是否启用读取本地 DepotKey .json 文件
}

var DefaultConfig = Config{
	ReadSteamPath: true,
	DownloadPath:  "./Download",
	AddDLC:        true,
}

// 创建配置文件
func CreateConfig() {
	// 设置配置文件绝对路径
	configDir := filepath.Join(os.Getenv("APPDATA"), "ManifestHub GUI", "Config")
	configPath := filepath.Join(configDir, "config.json")

	// 创建目录
	if err := os.MkdirAll(configDir, 0755); err != nil {
		log.Printf("创建配置目录失败: %v", err)
	}

	// 配置 Viper
	viper.SetConfigFile(configPath)

	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Println("配置文件不存在, 将生成配置文件")

		viper.SetDefault("read_steam_path", DefaultConfig.ReadSteamPath)
		viper.SetDefault("download_path", DefaultConfig.DownloadPath)
		viper.SetDefault("add_dlc", DefaultConfig.AddDLC)

		// 写入配置文件（生成 JSON）
		if err := viper.WriteConfig(); err != nil {
			log.Printf("生成默认配置失败: %v", err)
		}
		log.Printf("默认配置已生成: %s", configPath)
	} else {
		if err := viper.ReadInConfig(); err != nil {
			log.Printf("读取配置文件失败: %v", err)
		}
		log.Printf("配置文件已加载: %s\n", configPath)
	}
}

// 修改配置文件
func ModifyConfig(item string, value interface{}) {
	// Viper 设置项值
	viper.Set(item, value)

	// 保存
	if err := viper.WriteConfig(); err != nil {
		log.Printf("保存配置失败: %v", err)
	}

	// 输出到配置文件
	log.Printf("%s 项已修改为 %v (类型为%t)", item, value, value)
}

// 检查配置文件完整性
func CheckConfigIntegrity() bool {
	requiredKeys := []string{"read_steam_path", "download_path", "add_dlc"}

	for _, key := range requiredKeys {
		if !viper.IsSet(key) {
			log.Printf("配置项缺失: %s", key)
			return false
		}
	}
	return true
}

// 重置配置文件
func ResetConfig() {
	viper.SetDefault("read_steam_path", DefaultConfig.ReadSteamPath)
	viper.SetDefault("download_path", DefaultConfig.DownloadPath)
	viper.SetDefault("add_dlc", DefaultConfig.AddDLC)

	// 写入配置文件
	if err := viper.WriteConfig(); err != nil {
		// 如果文件不存在，使用SafeWriteConfigAs
		if err := viper.SafeWriteConfigAs(viper.ConfigFileUsed()); err != nil {
			log.Printf("保存配置文件失败: %v", err)
		}
	}
	log.Printf("默认配置已生成/重置: %s", viper.ConfigFileUsed())
}
