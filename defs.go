/* defs.go */
package main

import (
	"github.com/spf13/viper"
	"github.com/winterssy/sreq"
)

type DLCInfo struct {
	Data map[string]struct {
		Common   map[string]interface{} `json:"common"`
		Extended map[string]interface{} `json:"extended"`
		Depots   interface{}            `json:"depots"`
		DLC      map[string]interface{} `json:"dlc"`
	} `json:"data"`
}

// DepotKey 源
var DepotkeySources = []string{
	"https://raw.githubusercontent.com/SteamAutoCracks/ManifestHub/main/depotkeys.json",
	"https://cdn.jsdmirror.com/gh/SteamAutoCracks/ManifestHub@main/depotkeys.json",
	"https://raw.gitmirror.com/SteamAutoCracks/ManifestHub/main/depotkeys.json",
	"https://raw.dgithub.xyz/SteamAutoCracks/ManifestHub/main/depotkeys.json",
	"https://gh.akass.cn/SteamAutoCracks/ManifestHub/main/depotkeys.json",
}

var (
	CONFIG_READ_STEAM_PATH bool   // 读取 Steam 的路径
	CONFIG_DOWNLOAD_PATH   string // 下载路径
	CONFIG_ADD_DLC         bool   // 入库 DLC
)

func initGlobalConfig() {
	// 从 Viper 中读取值，赋值给全局变量
	CONFIG_READ_STEAM_PATH = viper.GetBool("read_steam_path")
	CONFIG_DOWNLOAD_PATH = viper.GetString("download_path")
	CONFIG_ADD_DLC = viper.GetBool("add_dlc")
}

// 自定义 HTTP 客户端
var Client *sreq.Client
