const {
  BrowserWindow, ipcMain, dialog
} = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let win;
let willQuiteApp = false;
const {
  createShortcut
} = require('../../lib/capture/main');

function createWindow() {
  // 初始化截图
  createShortcut()

  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    },
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    show: false // 先隐藏
  })
  

  win.on('ready-to-show', () => win.show()) // 初始化后显示

  win.on('close', e => {
    if (willQuiteApp) {
      win = null
    } else {
      e.preventDefault();
      win.hide();
    }
  })

  if (isDev) {
    win.loadURL('http://localhost:9200')
  } else {
    win.loadFile(path.resolve('./dist/index.html'))
  }


  // 打开对话框事件dialog
  ipcMain.on('open-directory-dialog', function (event) {
    dialog.showOpenDialog({
      // properties String -包含对话框应用的功能。支持以下值:
      // openFile - 允许选择文件
      // openDirectory - 允许选择文件夹
      // multiSelections-允许多选。
      // showHiddenFiles-显示对话框中的隐藏文件。
      // createDirectory macOS -允许你通过对话框的形式创建新的目录。
      // noResolveAliases macOS -禁用自动别名 (symlink) 路径解析。 选定的别名现在将返回别名路径而不是其目标路径。
      // treatPackageAsDirectory macOS -将包 (如 .app  文件夹) 视为目录而不是文件。
      properties: ['openFile', 'openDirectory'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
        // { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
        // { name: 'Custom File Type', extensions: ['as'] },
        // { name: 'All Files', extensions: ['*'] }
      ]
    }).then(result=>{
      // console.log('result', result)
      // result { canceled: false, filePaths: [ '/Users/tangting006/Desktop/11.jpg' ] }
      const {canceled, filePaths} = result;
      if(canceled){
        return
      }
      const filePath = filePaths[0];
      console.log('filePath', filePath);
      event.sender.send('read-file', {data: filePath})
      })
    }).catch(err => {
      console.log(err)
    })
}

function show() {
  win.show()
}

function close() {
  willQuitApp = true
  win.close()
}

function send(channel, ...args) {
  // win.webContents.send('ping', 'whoooooooh!')
}

module.exports = {
  createWindow,
  show,
  close,
  send
}