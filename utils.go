package main

import (
	"fmt"
	"log"
)

// 返回错误并打日志
func LogAndError(format string, args ...interface{}) error {
	log.Printf(format, args...)
	return fmt.Errorf(format, args...)
}

// 下载 DepotKey
func DownloadDepotkeys() {
	for i, source := range DepotkeySources {
		log.Printf("尝试 DepotKey 源 #%d: %s\n", i+1, source)
	}
}
