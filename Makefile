.PHONY: install
install:
	go mod download
	cd frontend && npm install

.PHONY: dev
dev:
	wails dev


.PHONY: build
build:
	wails build


.PHONY: build~%
build~%:
	wails build -platform $(subst -,/,$*)
	

.PHONY: build-small
build-small:
	wails build -webview2 embed -clean -ldflags="-w -s" -upx -upxflags="--best --lzma"


.PHONY: build-small~%
build-small~%:
	wails build -webview2 embed -platform $(subst -,/,$*) -clean -ldflags="-w -s" -upx -upxflags="--best --lzma"


.PHONY: list-platforms
list-platforms:
	@echo "Windows: windows-amd64, windows-arm64"
	@echo "Linux: linux-amd64, linux-arm64"
	@echo "MacOS: darwin-amd64, darwin-arm64"


.PHONY: clean
clean:
	wails clean