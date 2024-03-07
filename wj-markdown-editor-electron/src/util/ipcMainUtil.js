const {app, clipboard} = require('electron')
const {ipcMain, dialog} = require('electron')
const fs= require('fs')
const globalData = require('./globalData')
const common = require('./common')
const path = require('path')
const uuid = require('uuid')
const { execFile } = require('child_process')
const pathUtil = require('./pathUtil')
const fsUtil = require('./fsUtil')
const axios = require('axios').default
const mime = require('mime-types')
const defaultConfig = require('./defaultConfig')

const isBase64Img = files => {
    return files.find(item => item.base64) !== undefined
}

const uploadImage = async files => {
    let list
    globalData.win.webContents.send('showMessage', '图片处理中', 'loading', 0)
    const insertImgType = common.getImgInsertType(files[0])
    if(insertImgType === '1'){ // 无操作
        if(isBase64Img(files)){
            globalData.win.webContents.send('showMessage', '无法在当前图片模式下粘贴网络图片或截图', 'error', 2, true)
            return undefined
        } else {
            list = files.map(file => file.path || file.url)
        }
    } else if (insertImgType === '2' || insertImgType === '3' || insertImgType === '4') { // // 2: 复制到 ./%{filename} 文件夹 3: 复制到 ./assets 文件夹 4:复制到指定文件夹
        if((insertImgType === '2' || insertImgType === '3') && !globalData.originFilePath){
            globalData.win.webContents.send('showMessage', '当前文件未保存，不能将图片保存到相对位置', 'error', 2, true)
            return undefined
        }
        const savePath = common.getImgParentPath(insertImgType)
        list = await Promise.all(files.map(async file => {
            if(file.path){
                const newFilePath = path.resolve(savePath, uuid.v1().replace(/-/g, '') + '.' + mime.extension(file.type));
                fs.copyFileSync(file.path, newFilePath)
                return newFilePath
            } else if(file.base64){
                const newFilePath = path.resolve(savePath, uuid.v1().replace(/-/g, '') + '.' + mime.extension(file.type));
                const buffer = new Buffer.from(file.base64, 'base64');
                fs.writeFileSync(newFilePath,  buffer)
                return newFilePath
            } else if(file.url) {
                try{
                    const result = await axios.get(file.url, {
                        responseType: 'arraybuffer', // 特别注意，需要加上此参数
                    });
                    const newFilePath = path.resolve(savePath, uuid.v1().replace(/-/g, '') + '.' + mime.extension(result.headers.get("Content-Type")));
                    fs.writeFileSync(newFilePath,  result.data)
                    return newFilePath
                } catch (e) {
                    globalData.win.webContents.send('showMessage', '图片下载失败', 'error', 2, true)
                    return undefined
                }
            }
        }))
    } else if (insertImgType === '5') { // 上传
        if(!globalData.config.picGo.host || !globalData.config.picGo.port) {
            globalData.win.webContents.send('showMessage', '请配置PicGo服务信息', 'error', 2, true)
            return undefined
        }
        const tempPath = app.getPath('temp')
        let tempList = await Promise.all(files.map(async file => {
            if(file.path){
                const newFilePath = path.resolve(tempPath, uuid.v1().replace(/-/g, '') + '.' + mime.extension(file.type));
                fs.copyFileSync(file.path, newFilePath)
                return newFilePath
            } else if(file.base64){
                const newFilePath = path.resolve(tempPath, uuid.v1().replace(/-/g, '') + '.' + mime.extension(file.type));
                const buffer = new Buffer.from(file.base64, 'base64');
                fs.writeFileSync(newFilePath,  buffer)
                return newFilePath
            } else if(file.url) {
                try{
                    const result = await axios.get(file.url, {
                        responseType: 'arraybuffer', // 特别注意，需要加上此参数
                    });
                    const newFilePath = path.resolve(tempPath, uuid.v1().replace(/-/g, '') + '.' + mime.extension(result.headers.get("Content-Type")));
                    fs.writeFileSync(newFilePath,  result.data)
                    return newFilePath
                } catch (e) {
                    globalData.win.webContents.send('showMessage', '图片下载失败', 'error', 2, true)
                    return undefined
                }
            }
        }))
        tempList = tempList && tempList.length > 0 ? tempList.filter(item => item !== undefined) : []
        if(tempList && tempList.length > 0) {
            let error = false
            axios.post(`http://${globalData.config.picGo.host}:${globalData.config.picGo.port}/upload`, { list: tempList }).then(res => {
                if(res.data.success === true){
                    globalData.win.webContents.send('insertScreenshotResult', res.data.result)
                } else {
                    globalData.win.webContents.send('showMessage', `图片上传失败，请检查PicGo服务。(错误信息：${res.data.message})`, 'error', 2, true)
                }
            }).catch(err => {
                error = true
                globalData.win.webContents.send('showMessage', `图片上传失败，请检查PicGo服务。(错误信息：${err.message})`, 'error', 2 ,true)
            }).finally(() => {
                if(!error){
                    globalData.win.webContents.send('closeMessage')
                }
                if(tempList && tempList.length){
                    fsUtil.deleteFileList(tempList)
                }
            })
        }
        return undefined
    }
    if(list && list.length > 0) {
        globalData.win.webContents.send('insertScreenshotResult', list)
        if(!list.find(item => item === undefined)){
            globalData.win.webContents.send('closeMessage')
        }
    }
}

ipcMain.handle('getFileContent', event => {
    // fs.writeFileSync("C:\\Users\\cqing\\Desktop\\1.txt", JSON.stringify(process.argv))
    return globalData.tempContent
})

ipcMain.handle('openDirSelect', event => {
    const dirList = dialog.showOpenDialogSync(globalData.settingWin, {
        title: '选择文件夹',
        buttonLabel: '确认',
        properties: ['openDirectory']
    })
    return dirList && dirList.length > 0 ? dirList[0] : undefined
})

ipcMain.on('uploadImage', (event, files) => {
    uploadImage(files)
})

ipcMain.handle('getConfig', event => {
    return globalData.config
})

ipcMain.on('save', (event, isExit) => {
    common.save(globalData.tempContent, isExit)
})

ipcMain.on('saveToOther', (event) => {
    common.saveToOther(globalData.tempContent)
})

ipcMain.on('exit', (event) => {
    common.exit()
})

ipcMain.on('onContentChange', (event, content) => {
    globalData.tempContent = content
    globalData.saved = globalData.content.length === content.length && globalData.content === content
})

ipcMain.on('closeExitModal', event => {
    if(globalData.exitModal){
        globalData.exitModal.hide()
    }
})

ipcMain.on('openSettingWin', event => {
    common.openSettingWin()
})


ipcMain.on('settingWinMinimize', () => {
    common.settingWinMinimize()
})
ipcMain.on('closeSettingWin', () => {
    if(globalData.settingWin){
        globalData.settingWin.hide()
    }
})

ipcMain.on('updateConfig', (event, config) => {
    globalData.config = config
})

ipcMain.on('exportPdf', event => {
    common.openExportPdfWin()
})

ipcMain.on('closeExportWin', event => {
    if(globalData.exportWin){
        globalData.exportWin.close()
    }
})

ipcMain.on('toggleSearchBar', event => {
    common.toggleSearchBar()
})

ipcMain.on('findInPage', (event, searchContent) => {
    globalData.win.webContents.findInPage(searchContent, { findNext: true })
})

ipcMain.on('findInPageNext', (event, searchContent, forward) => {
    globalData.win.webContents.findInPage(searchContent, { forward, findNext: false })
})

ipcMain.on('stopFindInPage', event => {
    globalData.win.webContents.stopFindInPage('clearSelection')
})

ipcMain.on('screenshot', (event, hide) => {
    if(hide === true) {
        globalData.win.minimize()
    }
    setTimeout(() => {
        const childProcess =  execFile(pathUtil.getSnapShotExePath())
        childProcess.on('exit', (code) => {
            if (code === 0 || code === 1) {
                const buffer = clipboard.readImage().toPNG()
                if(buffer && buffer.length > 0){
                    const base64 = buffer.toString('base64')
                    uploadImage([{ base64, type: 'image/png', isScreenshot: true }]).then(res => {})
                    clipboard.clear()
                }
            }
            if(hide === true) {
                globalData.win.restore()
            }
            childProcess.kill()
        })
    }, 200)
})

ipcMain.on('action', (event, type) => {
    globalData.win[type]()
})

ipcMain.on('restoreDefaultSetting', event => {
    globalData.config = defaultConfig
})

ipcMain.on('openAboutWin', event => {
    common.openAboutWin()
})
ipcMain.on('closeAboutWin', event => {
    common.closeAboutWin()
})
ipcMain.on('checkUpdate', event => {
    common.checkUpdate()
})

ipcMain.on('executeDownload', event => {
    common.executeDownload()
})
ipcMain.on('cancelDownload', event => {
    common.cancelDownload()
})

ipcMain.on('executeUpdate', event => {
    common.executeUpdate()
})