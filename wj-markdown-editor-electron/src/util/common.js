const globalData = require("./globalData");
const {dialog, app, BrowserWindow, Notification, shell} = require("electron");
const fs = require("fs");
const path = require("path");
const constant = require('./constant')
const fsUtil = require("./fsUtil");
const {autoUpdater, CancellationToken} = require("electron-updater");
const axios = require("axios");
const exit = () => {
    app.exit()
}
const sendMessageToAbout = (channel, args) => {
    if(globalData.aboutWin && !globalData.aboutWin.isDestroyed()){
        globalData.aboutWin.webContents.send(channel, args)
    }
}
module.exports = {
    save: (content, isExit) => {
        let currentPath
        if(globalData.originFilePath){
            currentPath = globalData.originFilePath
        } else {
            currentPath = dialog.showSaveDialogSync({
                title: "保存",
                buttonLabel: "保存",
                filters: [
                    {name: 'markdown文件', extensions: ['md']},
                ]
            })
        }
        if (currentPath) {
            fs.writeFileSync(currentPath, content)
            globalData.originFilePath = currentPath
            globalData.saved = true
            globalData.content = content
            globalData.tempContent = content
            if(isExit){
                exit()
            } else {
                globalData.win.webContents.send('showMessage', '保存成功', 'success')
            }
        }
    },
    saveToOther: content => {
        const currentPath = dialog.showSaveDialogSync({
            title: "另存为",
            buttonLabel: "保存",
            filters: [
                {name: 'markdown文件', extensions: ['md']},
            ]
        })
        if(currentPath) {
            fs.writeFileSync(currentPath, content)
            globalData.win.webContents.send('showMessage', '另存成功', 'success')
        }
    },
    exit,
    exitModal: () => {
        if(!globalData.exitModal || globalData.exitModal.isDestroyed()) {
            globalData.exitModal = new BrowserWindow({
                frame: false,
                width: 500,
                height: 200,
                show: false,
                parent: globalData.win,
                modal: true,
                maximizable: false,
                resizable: false,
                webPreferences: {
                    preload: path.resolve(__dirname, '../preload.js')
                }
            });
            globalData.exitModal.once('ready-to-show', () => {
                globalData.exitModal.show()
            })
            if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'dev') {
                globalData.exitModal.loadURL('http://localhost:8080/#/' + constant.router.exitModal).then(() => {})
            } else {
                globalData.exitModal.loadFile(path.resolve(__dirname, '../../web-dist/index.html'), { hash: constant.router.exitModal }).then(() => {})
            }
        } else {
            globalData.exitModal.center()
            globalData.exitModal.show()
        }
    },
    openSettingWin: () => {
        if(!globalData.settingWin || globalData.settingWin.isDestroyed()) {
            globalData.settingWin = new BrowserWindow({
                icon: path.resolve(__dirname, '../../icon/favicon.ico'),
                frame: false,
                width: 600,
                height: 500,
                show: false,
                maximizable: false,
                resizable: false,
                webPreferences: {
                    preload: path.resolve(__dirname, '../preload.js')
                }
            });
            globalData.settingWin.webContents.setWindowOpenHandler(details => {
                shell.openExternal(details.url).then(() => {})
                return {action: 'deny'}
            })
            globalData.settingWin.once('ready-to-show', () => {
                globalData.settingWin.show()
            })
            if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'dev') {
                globalData.settingWin.loadURL('http://localhost:8080/#/' + constant.router.setting).then(() => {})
            } else {
                globalData.settingWin.loadFile(path.resolve(__dirname, '../../web-dist/index.html'), { hash: constant.router.setting }).then(() => {})
            }
        } else if (globalData.settingWin.isMinimized()){
            globalData.settingWin.show()
        } else if (!globalData.settingWin.isVisible()) {
            globalData.settingWin.center()
            globalData.settingWin.show()
        } else if (!globalData.settingWin.isFocused()){
            globalData.settingWin.focus()
        }
    },
    openExportPdfWin: () => {
        globalData.exportWin = new BrowserWindow({
            frame: false,
            modal: true,
            parent: globalData.win,
            maximizable: false,
            resizable: false,
            show: false,
            webPreferences: {
                preload: path.resolve(__dirname, '../preload.js')
            }
        })
        globalData.exportWin.once('ready-to-show', () => {
            globalData.exportWin.show()
        })
        if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'dev') {
            globalData.exportWin.loadURL('http://localhost:8080/#/' + constant.router.export).then(() => {})
        } else {
            globalData.exportWin.loadFile(path.resolve(__dirname, '../../web-dist/index.html'), { hash: constant.router.export }).then(() => {})
        }
    },
    openAboutWin: () => {
        if(!globalData.aboutWin || globalData.aboutWin.isDestroyed()) {
            globalData.aboutWin = new BrowserWindow({
                frame: false,
                width: 500,
                height: 230,
                show: false,
                parent: globalData.win,
                maximizable: false,
                resizable: false,
                webPreferences: {
                    preload: path.resolve(__dirname, '../preload.js')
                }
            });
            globalData.aboutWin.once('ready-to-show', () => {
                globalData.aboutWin.show()
            })
            if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'dev') {
                globalData.aboutWin.loadURL('http://localhost:8080/#/' + constant.router.about + '?version=' + app.getVersion() + '&name=' + app.getName()).then(() => {})
            } else {
                globalData.aboutWin.loadFile(path.resolve(__dirname, '../../web-dist/index.html'), { hash: constant.router.about, search: 'version=' + app.getVersion() + '&name=' + app.getName() }).then(() => {})
            }
        } else {
            globalData.aboutWin.center()
            globalData.aboutWin.show()
        }
    },
    closeAboutWin: () => {
      if(globalData.aboutWin && !globalData.aboutWin.isDestroyed()){
          globalData.aboutWin.hide()
      }
    },
    toggleSearchBar: () => {
        if(globalData.searchBar && !globalData.searchBar.isDestroyed() && globalData.searchBar.isVisible()) {
            globalData.win.webContents.stopFindInPage('clearSelection')
            globalData.searchBar.close()
            return
        }
        globalData.searchBar = new BrowserWindow({
            width: 350,
            height: 60,
            alwaysOnTop: true,
            parent: globalData.win,
            frame: false,
            modal: false,
            maximizable: false,
            resizable: false,
            show: false,
            webPreferences: {
                preload: path.resolve(__dirname, '../preload.js')
            }
        })
        globalData.searchBar.once('ready-to-show', () => {
            const size = globalData.win.getSize();
            const position = globalData.win.getPosition();
            globalData.searchBar.setPosition(position[0] + size[0] - globalData.searchBar.getSize()[0] - 80, position[1] + 80)
            globalData.searchBar.show()
        })
        if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'dev') {
            globalData.searchBar.loadURL('http://localhost:8080/#/' + constant.router.searchBar).then(() => {})
        } else {
            globalData.searchBar.loadFile(path.resolve(__dirname, '../../web-dist/index.html'), { hash: constant.router.searchBar }).then(() => {})
        }
    },
    toggleSearchBarTop: flag => {
        if(globalData.searchBar && !globalData.searchBar.isDestroyed()){
            globalData.searchBar.setAlwaysOnTop(flag)
        }
    },
    moveSearchBar: () => {
        if(globalData.searchBar && !globalData.searchBar.isDestroyed()){
            const size = globalData.win.getSize();
            const position = globalData.win.getPosition();
            globalData.searchBar.setPosition(position[0] + size[0] - globalData.searchBar.getSize()[0] - 80, position[1] + 80)
        }
    },
    settingWinMinimize: () => {
        if(globalData.settingWin && !globalData.settingWin.isDestroyed()){
            globalData.settingWin.minimize()
        }
    },
    shouldUpdateConfig: () => {
        globalData.win.webContents.send('shouldUpdateConfig', globalData.config)
    },
    getImgParentPath: insertImgType => {
        let savePath
        if(insertImgType === '2'){
            savePath = path.resolve(path.dirname(globalData.originFilePath), path.parse(globalData.originFilePath).name)
        } else if (insertImgType === '3'){
            savePath = path.resolve(path.dirname(globalData.originFilePath), 'assets')
        } else {
            savePath = globalData.config.imgSavePath
        }
        fsUtil.mkdirSyncWithRecursion(savePath)
        return savePath
    },
    getImgInsertType: (file) => {
        if(file.url){ // 通过URL 插入网络图片
            return globalData.config.insertNetworkImgType
        } else if (file.path && file.isSelect){ // 通过文件选择 插入本地图片
            return globalData.config.insertLocalImgType
        } else if (file.path && !file.isSelect){ // 通过粘贴板 插入本地图片
            return globalData.config.insertPasteboardLocalImgType
        } else if (file.base64 && file.isScreenshot) { // 通过屏幕截图 插入图片
            return globalData.config.insertScreenshotImgType
        } else if (file.base64 && !file.isScreenshot) { // 通过粘贴板 插入网络图片
            return globalData.config.insertPasteboardNetworkImgType
        }
    },
    sendMessageToAbout,
    checkUpdate: () => {
        if(app.isPackaged){
            axios.get('https://api.github.com/repos/nlbwqmz/wj-markdown-editor/releases/latest').then((res) => {
                const versionLatest = res.data.tag_name
                autoUpdater.setFeedURL(`https://github.com/nlbwqmz/wj-markdown-editor/releases/download/${versionLatest}`)
                autoUpdater.checkForUpdates()
            }).catch(err => {
                sendMessageToAbout('messageToAbout', { finish: true, success: false, message: '处理失败，请检查网络。' })
            })
        }
    },
    initUpdater: () => {
        if(app.isPackaged){
            autoUpdater.autoDownload = false
            autoUpdater.autoInstallOnAppQuit = false
            autoUpdater.on('checking-for-update', () => {
            })
            autoUpdater.on('update-available', info => {
                sendMessageToAbout('messageToAbout', { finish: true, success: true, version: info.version })
            })
            autoUpdater.on('update-not-available', () => {
                sendMessageToAbout('messageToAbout', { finish: true, success: true, version: app.getVersion() })
            })
            // 已在回调中通知下载完成
            // autoUpdater.on('update-downloaded', () => {
            //     sendMessageToAbout('downloadFinish')
            //     // autoUpdater.quitAndInstall()
            // })
            autoUpdater.on('download-progress', progressInfo => {
                sendMessageToAbout('updaterDownloadProgress', { percent: progressInfo.percent, bytesPerSecond: progressInfo.bytesPerSecond })
            })
            autoUpdater.on('error', (error) => {
                sendMessageToAbout('messageToAbout', { finish: true, success: false, message: '处理失败，请检查网络。' })
            })
        }
    },
    executeDownload: () => {
        const cancellationToken = new CancellationToken()
        autoUpdater.downloadUpdate(cancellationToken).then(filePathList => {
            sendMessageToAbout('downloadFinish')
        })
        globalData.downloadUpdateToken = cancellationToken
    },
    cancelDownload: () => {
        if(globalData.downloadUpdateToken){
            globalData.downloadUpdateToken.cancel()
            globalData.downloadUpdateToken = undefined
        }
    },
    executeUpdate: () => {
        autoUpdater.quitAndInstall(true, true)
    }
}