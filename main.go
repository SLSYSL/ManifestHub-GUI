/* main.go */
package main

import (
	"embed"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	"github.com/winterssy/sreq"
)

//go:embed all:frontend/dist
var assets embed.FS
var logFile *os.File

// 创建日志文件
func CreateLog() {
	// 拼接绝对路径
	logPath := filepath.Join(_MainConfig_, "Log", "ManifestHub.log")

	// 创建日志目录
	if err := os.MkdirAll(filepath.Dir(logPath), 0755); err != nil {
		log.Printf("创建日志目录失败: %v", err)
	}

	// 检查日志文件大小
	var fileFlags int
	const maxSize = 2 * 1024 * 1024
	if info, err := os.Stat(logPath); err == nil {
		// 文件存在，检查大小
		if info.Size() >= maxSize {
			// 超过 5MB 清空
			log.Printf("日志文件超过2MB, 将清空日志")
			fileFlags = os.O_CREATE | os.O_WRONLY | os.O_TRUNC
		} else {
			// 未超过追加模式
			fileFlags = os.O_CREATE | os.O_WRONLY | os.O_APPEND
		}
	} else {
		// 文件不存在，创建新文件
		fileFlags = os.O_CREATE | os.O_WRONLY | os.O_APPEND
	}

	// 创建日志文件
	var err error
	logFile, err = os.OpenFile(
		logPath,
		fileFlags,
		0644,
	)
	if err != nil {
		log.Printf("创建日志文件失败: %v", err)
	}

	// 配置 log
	log.SetOutput(logFile)
	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Lshortfile)

	// 测试日志
	log.Printf("日志初始化成功, 文件路径:%s", logPath)
}

// 全局注册
func init() {
	// 初始化自定义 HTTP 客户端
	Client = sreq.New().SetTimeout(10 * time.Minute)

	// 获取 %AppData% 路径
	_AppData_ = GetAppData()

	// 获取 ManifestHub GUI 文件夹
	_MainConfig_ = filepath.Join(_AppData_, "ManifestHub GUI")

	// 注册全局 defer, 确保程序退出时关闭文件
	defer func() {
		if logFile != nil {
			log.Println("程序退出，关闭日志文件")
			logFile.Close()
		}
	}()
}

func main() {
	// 创建日志/配置文件
	CreateLog()
	CreateConfig()
	initGlobalConfig()

	// 检查配置文件
	if !CheckConfigIntegrity() {
		log.Println("配置文件不完整, 将重置配置文件")
		ResetConfig()
	}

	// 创建应用程序实例
	app := NewApp()

	// 创建带选项的应用程序
	err := wails.Run(&options.App{
		Title:            fmt.Sprintf("ManifestHub - %s", version),
		Width:            1382,
		Height:           1037,
		Frameless:        false,
		WindowStartState: options.Normal,
		Windows: &windows.Options{
			WebviewIsTransparent:              true, // WebView 透明
			WindowIsTranslucent:               true, // 窗口半透明
			DisableFramelessWindowDecorations: true, // 禁用窗口装饰
		},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: nil,
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	log.Printf("当前版本: %s", version)

	if err != nil {
		log.Println("Wails 启动失败: ", err.Error())
		println("启动失败: ", err.Error())
	} else {
		log.Println("Wails 已成功启动")
	}
}
