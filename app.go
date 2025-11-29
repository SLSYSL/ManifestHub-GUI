package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
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
	resp, err := Client.Get("https://store.steampowered.com/api/featured/?l=schinese&cc=CN")
	if err != nil {
		return "", LogAndError("获取 Steam 热门游戏列表失败: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", LogAndError("获取 Steam 数据失败, 状态码: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", LogAndError("读取 Steam 响应失败: %v", err)
	}

	return string(body), nil
}

// 入库
func (a *App) AddGameToLibrary(APPID string) (string, error) {

	return fmt.Sprintf("游戏 %s 已成功添加到库中", APPID), nil
}

// 游戏搜索
func (a *App) SearchSteamGames(searchTerm string) (string, error) {
	// 编码
	encodedTerm := url.QueryEscape(searchTerm)
	apiUrl := fmt.Sprintf("https://store.steampowered.com/api/storesearch/?term=%s&l=schinese&cc=CN", encodedTerm)

	req, err := http.NewRequest("GET", apiUrl, nil)
	if err != nil {
		return "", LogAndError("创建搜索请求失败: %v", err)
	}

	// 避免API拒绝访问
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	resp, err := Client.Do(req)
	if err != nil {
		return "", LogAndError("请求第三方搜索API失败: %v", err)
	}
	defer resp.Body.Close()

	// 检查响应状态码
	if resp.StatusCode != http.StatusOK {
		return "", LogAndError("搜索失败，状态码: %d", resp.StatusCode)
	}

	// 读取响应体
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", LogAndError("读取搜索结果失败: %v", err)
	}

	return string(body), nil
}
