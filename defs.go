package main

import (
	"net/http"
	"time"

	"github.com/spf13/viper"
)

// DepotKey 源
var DepotkeySources = []string{
	"https://raw.githubusercontent.com/SteamAutoCracks/ManifestHub/main/depotkeys.json",
	"https://cdn.jsdmirror.com/gh/SteamAutoCracks/ManifestHub@main/depotkeys.json",
	"https://raw.gitmirror.com/SteamAutoCracks/ManifestHub/main/depotkeys.json",
	"https://raw.dgithub.xyz/SteamAutoCracks/ManifestHub/main/depotkeys.json",
	"https://gh.akass.cn/SteamAutoCracks/ManifestHub/main/depotkeys.json",
}

// 访问超时
var Client = &http.Client{
	Timeout: 10 * time.Second,
}

var (
	CONFIG_READ_STEAM_PATH bool   // 读取 Steam 的路径
	CONFIG_DOWNLOAD_PATH   string // 下载路径
	CONFIG_LOCAL_DEPOTKEY  bool   // 本地 Depot Key
)

func initGlobalConfig() {
	// 从 Viper 中读取值，赋值给全局变量
	CONFIG_READ_STEAM_PATH = viper.GetBool("read_steam_path")
	CONFIG_DOWNLOAD_PATH = viper.GetString("download_path")
	CONFIG_LOCAL_DEPOTKEY = viper.GetBool("local_depot_key")
}
