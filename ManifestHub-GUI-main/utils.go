/* utils.go */
package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"

	"github.com/winterssy/sreq"
	"golang.org/x/sys/windows/registry"
)

var (
	addAppidRe = regexp.MustCompile(`addappid\((\d+)`)
	digitsRe   = regexp.MustCompile(`\d+`)
)

// 判断字符串是否全为数字
func isDigit(s string) bool {
	for _, c := range s {
		if c < '0' || c > '9' {
			return false
		}
	}
	return true
}

// 返回错误并打日志
func LogAndError(format string, args ...interface{}) error {
	log.Printf(format, args...)
	return fmt.Errorf(format, args...)
}

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

// SAC 库
func GetSACDepotkey(redownload bool) (map[string]string, error) {
	// 构建本地文件路径
	localFile := filepath.Join(_MainConfig_, "DepotKeys", "depotkeys.json")

	if redownload {
		return DownloadSACDepotKey(localFile)
	}

	// 首先尝试读取本地文件
	if _, err := os.Stat(localFile); err == nil {
		log.Printf("尝试读取本地缓存文件: %s", localFile)

		data, err := os.ReadFile(localFile)
		if err != nil {
			log.Printf("读取本地文件失败: %v", err)
		} else {
			// 解析本地 JSON 文件
			var depotKeys map[string]string
			if err := json.Unmarshal(data, &depotKeys); err != nil {
				log.Printf("解析本地 JSON 文件失败: %v", err)
			} else if len(depotKeys) > 0 {
				log.Printf("成功从本地缓存读取 %d 个 DepotKeys", len(depotKeys))
				return depotKeys, nil
			}
		}
	}

	// 本地文件不存在或读取失败，从网络下载
	log.Printf("本地缓存文件不存在或无效，从网络下载...")
	return DownloadSACDepotKey(localFile)
}

// SAC 库下载 DepotKeys
func DownloadSACDepotKey(localFile string) (map[string]string, error) {
	// 请求头
	baseHeaders := sreq.Headers{
		"User-Agent": []string{"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
	}

	var lastError error

	// 遍历源列表
	for _, url := range DepotkeySources {
		log.Printf("正在尝试从源获取: %s", url)

		// 最终请求头
		reqHeaders := make(sreq.Headers)
		// 复制基础头到当前请求头
		for k, v := range baseHeaders {
			reqHeaders[k] = v
		}

		isGitHubOfficial := strings.Contains(url, "raw.githubusercontent.com")
		if isGitHubOfficial {
			if CONFIG_GITHUB_TOKEN != "" {
				reqHeaders["Authorization"] = []string{"Bearer " + CONFIG_GITHUB_TOKEN}
				log.Printf("对 %s 启用 GitHub Token 授权访问", url)
			} else {
				log.Printf("GitHub Token 为空，将以匿名方式访问 %s (可能触发限流) ", url)
			}
		}

		// 发送请求（使用当前构建的请求头）
		resp, err := Client.Get(url, sreq.WithHeaders(reqHeaders)).Text()
		if err != nil {
			lastError = LogAndError("尝试源 %s 失败: %v", url, err)
			continue
		}

		// 空数据校验
		if resp == "" {
			lastError = LogAndError("尝试源 %s 失败: 返回空数据", url)
			continue
		}

		// 前置 JSON 格式校验（避免解析时报模糊错误）
		trimmedResp := strings.TrimSpace(resp)
		if len(trimmedResp) == 0 || (trimmedResp[0] != '{' && trimmedResp[0] != '[') {
			errContent := trimmedResp
			if len(errContent) > 200 {
				errContent = errContent[:200] + "..."
			}
			lastError = LogAndError("尝试源 %s 失败: 返回非 JSON 内容 [%s]", url, errContent)
			continue
		}

		// 解析JSON到map
		var depotKeys map[string]string
		if err := json.Unmarshal([]byte(resp), &depotKeys); err != nil {
			lastError = LogAndError("解析源 %s 的 JSON 失败: %v", url, err)
			continue
		}

		// 校验解析结果是否为空（避免空map）
		if len(depotKeys) == 0 {
			lastError = LogAndError("尝试源 %s 失败: JSON 解析成功但数据为空", url)
			continue
		}

		log.Printf("成功从 %s 获取到 %d 个 DepotKeys", url, len(depotKeys))

		// 下载成功，保存到本地文件
		if err := SaveDepotKey(localFile, depotKeys); err != nil {
			log.Printf("保存 DepotKeys 到本地文件失败: %v", err)
		} else {
			log.Printf("已保存 DepotKeys 到本地缓存: %s", localFile)
		}

		return depotKeys, nil
	}

	return nil, fmt.Errorf("所有源尝试均失败, 最后一个错误: %v", lastError)
}

// Sudama 库
func GetSudamaDepotkey(redownload bool) (map[string]string, error) {
	// 构建本地文件路径
	localFile := filepath.Join(_MainConfig_, "DepotKeys", "depotkeys.json")

	if redownload {
		return DownloadSudamaDepotKey(localFile)
	}

	// 首先尝试读取本地文件
	if _, err := os.Stat(localFile); err == nil {
		log.Printf("尝试读取本地缓存文件: %s", localFile)

		data, err := os.ReadFile(localFile)
		if err != nil {
			log.Printf("读取本地文件失败: %v", err)
		} else {
			// 解析本地 JSON 文件
			var depotKeys map[string]string
			if err := json.Unmarshal(data, &depotKeys); err != nil {
				log.Printf("解析本地 JSON 文件失败: %v", err)
			} else if len(depotKeys) > 0 {
				log.Printf("成功从本地缓存读取 %d 个 DepotKeys", len(depotKeys))
				return depotKeys, nil
			}
		}
	}

	// 本地文件不存在或读取失败，从网络下载
	log.Printf("本地缓存文件不存在或无效，从网络下载 Sudama 库数据...")
	return DownloadSudamaDepotKey(localFile)
}

// Sudama 库下载 DepotKeys
func DownloadSudamaDepotKey(localFile string) (map[string]string, error) {
	// Sudama API 基础 URL
	url := "https://api.993499094.xyz/depotkeys.json"

	// 请求头
	headers := sreq.Headers{
		"User-Agent": []string{"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
	}

	log.Printf("正在从单页API获取数据...")

	// 直接从单页API获取数据
	resp, err := Client.Get(url, sreq.WithHeaders(headers)).Text()
	if err != nil {
		return nil, LogAndError("从单页API获取数据失败: %v", err)
	}

	// 解析JSON数据
	var allKeys map[string]string
	if err := json.Unmarshal([]byte(resp), &allKeys); err != nil {
		return nil, LogAndError("解析单页API数据失败: %v", err)
	}

	// 检查是否获取到数据
	if len(allKeys) == 0 {
		return nil, LogAndError("从单页API获取到的数据为空")
	}

	log.Printf("从单页API共获取 %d 个密钥", len(allKeys))

	// 下载成功，保存到本地文件
	if err := SaveDepotKey(localFile, allKeys); err != nil {
		log.Printf("保存 DepotKeys 到本地文件失败: %v", err)
		// 即使保存失败，也返回成功获取的数据
	} else {
		log.Printf("已保存 DepotKeys 到本地缓存: %s", localFile)
	}

	return allKeys, nil
}

// 保存 DepotKeys 到本地文件
func SaveDepotKey(path string, depotKeys map[string]string) error {
	// 创建目录
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("创建目录失败: %v", err)
	}

	// 转换为 JSON
	data, err := json.MarshalIndent(depotKeys, "", "  ")
	if err != nil {
		return fmt.Errorf("JSON 序列化失败: %v", err)
	}

	// 写入文件
	if err := os.WriteFile(path, data, 0644); err != nil {
		return fmt.Errorf("写入文件失败: %v", err)
	}

	return nil
}

// 获取 DepotKey
func GetDepotkeys(redownload bool) (map[string]string, error) {
	// 根据库选择调用不同的获取函数
	if CONFIG_LIBRARY_CHOICE == "Sudama" {
		return GetSudamaDepotkey(redownload)
	}
	return GetSACDepotkey(redownload)
}

// 获取 Manifests
func GetManifests(APPID string) (map[string]string, error) {
	// 请求头
	headers := sreq.Headers{
		"User-Agent": []string{"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
	}

	resp, err := Client.Get(
		fmt.Sprintf("https://steam.ddxnb.cn/v1/info/%s", APPID),
		sreq.WithHeaders(headers),
	).Text()

	if err != nil {
		return nil, LogAndError("搜索 Steam 游戏失败: %v", err)
	}

	// 解析JSON
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(resp), &result); err != nil {
		return nil, LogAndError("解析 JSON 失败: %v", err)
	}

	// 检查API状态
	if status, ok := result["status"].(string); !ok || status != "success" {
		return nil, LogAndError("API 请求失败: %v", result)
	}

	// 获取指定APPID的数据
	data, ok := result["data"].(map[string]interface{})
	if !ok {
		return nil, LogAndError("数据格式错误: 缺少 Data 字段")
	}

	appData, exists := data[APPID]
	if !exists {
		return nil, LogAndError("未找到APPID: %s", APPID)
	}

	appInfo, ok := appData.(map[string]interface{})
	if !ok {
		return nil, LogAndError("App数据格式错误")
	}

	depots, ok := appInfo["depots"].(map[string]interface{})
	if !ok {
		return nil, LogAndError("未找到 Depots 数据")
	}

	depotManifestMap := make(map[string]string)

	for depotID, depotInfo := range depots {
		// 过滤非数字的Depot ID
		if !isDigit(depotID) {
			continue
		}

		if depotMap, ok := depotInfo.(map[string]interface{}); ok {
			if manifests, ok := depotMap["manifests"].(map[string]interface{}); ok {
				if publicManifest, ok := manifests["public"].(map[string]interface{}); ok {
					if manifestID, ok := publicManifest["gid"].(string); ok && manifestID != "" {
						depotManifestMap[depotID] = manifestID
					}
				}
			}
		}
	}

	return depotManifestMap, nil
}

// 获取 DLC 信息
func GetDLC(appid string) ([]string, bool, error) {
	// 设置请求头
	headers := sreq.Headers{
		"User-Agent": []string{"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
	}

	// 构建URL
	url := fmt.Sprintf("https://api.steamcmd.net/v1/info/%s", appid)

	// 发送请求
	resp, err := Client.Get(url, sreq.WithHeaders(headers)).Text()
	if err != nil {
		return nil, false, fmt.Errorf("请求失败: %v", err)
	}

	// 解析JSON
	var info DLCInfo
	if err := json.Unmarshal([]byte(resp), &info); err != nil {
		return nil, false, fmt.Errorf("解析JSON失败: %v", err)
	}

	// 获取指定AppID的数据
	appData, ok := info.Data[appid]
	if !ok {
		return nil, false, fmt.Errorf("未找到 %s 的信息", appid)
	}

	// 提取所有可能的DLC ID来源
	dlcIDs := make(map[string]bool)

	// 从common.listofdlc中提取
	if listStr, ok := appData.Common["listofdlc"].(string); ok {
		matches := digitsRe.FindAllString(listStr, -1)
		for _, id := range matches {
			dlcIDs[id] = true
		}
	}

	// 从extended.listofdlc中提取
	if listStr, ok := appData.Extended["listofdlc"].(string); ok {
		matches := digitsRe.FindAllString(listStr, -1)
		for _, id := range matches {
			dlcIDs[id] = true
		}
	}

	// 从depots.dlc列表中提取
	if appData.Depots != nil {
		if depotsMap, ok := appData.Depots.(map[string]interface{}); ok {
			if dlcMap, ok := depotsMap["dlc"]; ok {
				// dlcMap 可能是 map 也可能是其他类型
				switch v := dlcMap.(type) {
				case map[string]interface{}:
					// 遍历这个map的键
					for dlcID := range v {
						dlcIDs[dlcID] = true
					}
				case string:
					// 如果是字符串, 跳过或者记录日志
					log.Printf("警告: DLC 字段是字符串: %s\n", v)
				default:
					log.Printf("警告: DLC 字段的类型异常: %T\n", v)
				}
			}
		} else {
			log.Printf("警告: Depots 不是 map 类型: %T\n", appData.Depots)
		}
	}

	// 从dlc字典中提取
	for id := range appData.DLC {
		dlcIDs[id] = true
	}

	// 转换为切片并排序
	dlcIDsSlice := make([]string, 0, len(dlcIDs))
	for id := range dlcIDs {
		dlcIDsSlice = append(dlcIDsSlice, id)
	}
	sort.Slice(dlcIDsSlice, func(i, j int) bool {
		a, _ := strconv.Atoi(dlcIDsSlice[i])
		b, _ := strconv.Atoi(dlcIDsSlice[j])
		return a < b
	})

	// 检查是否有仓库
	hasDepots := false
	if depots, ok := appData.Depots.(map[string]interface{}); ok && len(depots) > 0 {
		hasDepots = true
	} else if _, ok := appData.Depots.(string); ok {
		// 字符串类型的depots也算有仓库
		hasDepots = true
	}

	return dlcIDsSlice, hasDepots, nil
}

// 添加无仓库DLC
func AddDLC(APPID string, addedAppids, existingAppids map[string]bool, luaContent *strings.Builder, existingLines []string) error {
	mainDLCs, _, err := GetDLC(APPID)
	if err != nil {
		return fmt.Errorf("获取主游戏DLC失败: %v", err)
	}
	// 并发筛选无仓库的DLC
	var (
		dlcIDs []string
		mu     sync.Mutex
		wg     sync.WaitGroup
		sem    = make(chan struct{}, 8)
	)

	for _, dlcID := range mainDLCs {
		wg.Add(1)
		sem <- struct{}{}
		go func(dlcID string) {
			defer wg.Done()
			defer func() { <-sem }()

			_, hasDepots, err := GetDLC(dlcID)
			if err != nil {
				log.Printf("获取DLC %s 信息失败: %v\n", dlcID, err)
				return
			}

			if !hasDepots && !existingAppids[dlcID] { // 过滤已存在的DLC
				mu.Lock()
				dlcIDs = append(dlcIDs, dlcID)
				mu.Unlock()
			}
		}(dlcID)
	}
	wg.Wait()

	// 保证顺序稳定
	sort.Slice(dlcIDs, func(i, j int) bool {
		ai, _ := strconv.Atoi(dlcIDs[i])
		aj, _ := strconv.Atoi(dlcIDs[j])
		return ai < aj
	})

	// 添加无仓库DLC
	addedDlcCount := 0
	for _, dlcID := range dlcIDs {
		if !existingAppids[dlcID] && !addedAppids[dlcID] {
			line := fmt.Sprintf("addappid(%s)", dlcID)
			luaContent.WriteString(line + "\n")
			addedDlcCount++
			addedAppids[dlcID] = true
		}
	}

	// 如果有现有内容，保留未被新加替换的行（使用预编译正则）
	for _, line := range existingLines {
		if matches := addAppidRe.FindStringSubmatch(line); len(matches) > 1 {
			appid := matches[1]
			if !addedAppids[appid] {
				luaContent.WriteString(line + "\n")
			}
		} else {
			luaContent.WriteString(line + "\n")
		}
	}

	if addedDlcCount > 0 {
		log.Printf("添加了 %d 个无仓库DLC\n", addedDlcCount)
	}

	return nil
}

// 生成 Lua 文件
func GenerateLua(APPID, path string, depotData, manifestData map[string]string) error {
	log.Printf("成功获取到 %d 个 Depot 的 Manifest 信息", len(manifestData))

	var luaContent strings.Builder

	// 读取现有LUA内容
	var existingLines []string
	existingAppids := make(map[string]bool)

	if _, err := os.Stat(path); err == nil {
		file, err := os.Open(path)
		if err != nil {
			return fmt.Errorf("打开文件失败: %v", err)
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line != "" {
				existingLines = append(existingLines, line)
				// 提取已存在的appid
				if matches := regexp.MustCompile(`addappid\((\d+)`).FindStringSubmatch(line); len(matches) > 1 {
					existingAppids[matches[1]] = true
				}
			}
		}
	}

	// 添加主游戏和 Depot 到内容中
	addedAppids := make(map[string]bool)

	// 添加主游戏
	if depotKey, exists := depotData[APPID]; exists && depotKey != "" {
		line := fmt.Sprintf("addappid(%s, 1, \"%s\")", APPID, depotKey)
		luaContent.WriteString(line + "\n")
		addedAppids[APPID] = true
	} else {
		line := fmt.Sprintf("addappid(%s)", APPID)
		luaContent.WriteString(line + "\n")
		addedAppids[APPID] = true
	}

	// 添加Depot（按排序的 key 确保稳定输出）
	validDepotCount := 0
	depotIDs := make([]string, 0, len(manifestData))
	for depotID := range manifestData {
		depotIDs = append(depotIDs, depotID)
	}
	sort.Slice(depotIDs, func(i, j int) bool {
		ai, _ := strconv.Atoi(depotIDs[i])
		aj, _ := strconv.Atoi(depotIDs[j])
		return ai < aj
	})

	for _, depotID := range depotIDs {
		if depotKey, exists := depotData[depotID]; exists && depotKey != "" {
			if !existingAppids[depotID] {
				line := fmt.Sprintf("addappid(%s, 1, \"%s\")", depotID, depotKey)
				luaContent.WriteString(line + "\n")
				validDepotCount++
				addedAppids[depotID] = true
			}
		}
	}

	// 获取并添加无仓库的DLC
	if CONFIG_ADD_DLC {
		AddDLC(APPID, addedAppids, existingAppids, &luaContent, existingLines)
	}

	// 添加固定清单设置
	if CONFIG_SET_MANIFESTID && len(manifestData) > 0 {
		for _, depotID := range depotIDs {
			manifestID := manifestData[depotID]
			if manifestID != "" {
				line := fmt.Sprintf("setManifestid(%s, \"%s\")", depotID, manifestID)
				luaContent.WriteString(line + "\n")
			}
		}
	}

	// 保存文件
	var outputFile string
	if filepath.IsAbs(path) {
		outputFile = path
	} else {
		cwd, _ := os.Getwd()
		outputFile = filepath.Join(cwd, path)
	}

	outputDir := filepath.Dir(outputFile)
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("创建目录失败: %v", err)
	}

	// 写入文件
	if err := os.WriteFile(outputFile, []byte(luaContent.String()), 0644); err != nil {
		return fmt.Errorf("写入文件失败: %v", err)
	}

	log.Printf("成功生成/更新 Lua 文件: %s\n", outputFile)
	log.Printf("添加了 %d 个有效 Depot\n", validDepotCount)

	return nil
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
