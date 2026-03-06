import { app, BrowserWindow, dialog } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import electronUpdater from 'electron-updater'
const { autoUpdater } = electronUpdater

const __dirname = path.dirname(fileURLToPath(import.meta.url))

autoUpdater.autoDownload = false

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Roadmaps',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#080c12',
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return win
}

const getWin = () => BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0] || null

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  if (!process.env.VITE_DEV_SERVER_URL) {
    autoUpdater.checkForUpdates().catch(err => console.error('Update check failed:', err))
  }

  autoUpdater.on('update-available', info => {
    const w = getWin()
    if (w) {
      dialog.showMessageBox(w, {
        type: 'info',
        title: 'Update Available',
        message: `Roadmaps ${info.version} is available.`,
        detail: "Downloading now — you'll be prompted to restart when it's ready.",
        buttons: ['OK'],
      })
    }
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('update-downloaded', () => {
    const w = getWin()
    if (!w) return
    dialog.showMessageBox(w, {
      type: 'info',
      title: 'Update Ready',
      message: 'Roadmaps has been updated.',
      detail: 'Restart now to apply the update.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall(false, true)
    })
  })

  autoUpdater.on('error', err => {
    console.error('Auto-updater error:', err)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
