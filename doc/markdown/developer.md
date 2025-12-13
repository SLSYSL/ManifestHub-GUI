<h1 align="center">开发文档</h1>

## 环境要求
- Node.js 16+
- Go 1.25+

## 准备环境
1. 安装 Node.js 环境 (已安装请跳过): 
   1. 下载并安装 <a href="https://nodejs.org/">Node.js</a>
   2. 根据提示安装
   3. 执行命令 `node -v`
   4. 输出 Node.js 版本号则安装成功
2. 安装 Go 环境 (已安装请跳过):
   1. 下载并安装 <a href="https://golang.google.cn/dl/">Go</a>
   2. 根据提示安装
   3. 执行命令 `go version`
   4. 输出 Go 版本号则安装成功
3. 拉取代码: 克隆本仓库

## 安装依赖
- 方法一: 使用 Makefile (需要安装 <a href="https://gnuwin32.sourceforge.net/packages/make.htm">Make</a>)
  1. 在当前项目中执行命令: `make install`
- 方法二: 使用原生命令
  1. 在当前项目中执行以下命令:
     1. `go mod download`
     2. `cd frontend && npm install`

## 开发和构建
- `wails dev`: 开发模式
- `wails build`: 构建程序

## Makefile 说明
- `install`: 安装依赖
- `dev`: 开发模式
- `build`: 构建程序
- `build-small`: 构建最小化程序 (需安装 <a href="https://github.com/upx/upx/releases/tag/v5.0.2">UPX</a>)
- `clean`: 清理构建程序
- `build~<平台>`: 构建指定平台程序 (如果需要查看支持平台请执行`list-platforms`) (如: build~windows-amd64)
- `build-small~<平台>`: 构建指定平台最小化程序 (需安装 <a href="https://github.com/upx/upx/releases/tag/v5.0.2">UPX</a>) (如果需要查看支持平台请执行`list-platforms`) (如: build-small~windows-amd64)