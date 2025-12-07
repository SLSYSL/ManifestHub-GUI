/* app.go */
package main

import (
	"context"
	"fmt"
	"log"
	"path/filepath"

	"github.com/winterssy/sreq"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// 获取热门 Steam 游戏列表
func (a *App) GetSteamFeatured() (string, error) {
	body, err := sreq.Get("https://store.steampowered.com/api/featured/?l=schinese&cc=CN").
		Text()
	if err != nil {
		return "", LogAndError("获取 Steam 热门游戏列表失败: %v", err)
	}
	return body, nil
}

// 入库
func (a *App) AddGameToLibrary(APPID string) (string, error) {
	depotkeys, err := GetDepotkeys()
	if err != nil {
		return "", LogAndError("获取 DepotKeys 失败: %v", err)
	}

	manifests, err := GetManifests(APPID)
	if err != nil {
		return "", LogAndError("获取 Manifests 失败: %v", err)
	}

	var path string

	if CONFIG_READ_STEAM_PATH {
		path, err = GetSteamGamePath()
		path = filepath.Join(path, APPID+".lua")
	} else {
		path = filepath.Join(CONFIG_DOWNLOAD_PATH, APPID+".lua")
	}
	if err != nil {
		log.Printf("获取 Steam 游戏路径失败: %v, 将使用配置的下载路径", err)
		path = filepath.Join(CONFIG_DOWNLOAD_PATH, APPID+".lua")
		err = nil
	}

	err = GenerateLua(APPID, path, depotkeys, manifests)
	if err != nil {
		return "", LogAndError("生成 Lua 文件失败: %v", err)
	}

	return fmt.Sprintf("游戏 %s 已成功添加到库中", APPID), nil
}

// 游戏搜索
func (a *App) SearchSteamGames(searchTerm string) (string, error) {
	// 编码
	params := sreq.Params{
		"term": searchTerm,
		"l":    "schinese",
		"cc":   "CN",
	}
	headers := sreq.Headers{
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
	}

	body, err := sreq.Get("https://store.steampowered.com/api/storesearch/",
		sreq.WithQuery(params),
		sreq.WithHeaders(headers),
	).Text()

	if err != nil {
		return "", LogAndError("搜索Steam游戏失败: %v", err)
	}
	return body, nil
}
