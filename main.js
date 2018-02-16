const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const url = require('url')

let win

function createWindow () {
    win = new BrowserWindow(
        {
            // frame: false,
            width: 800,
            minWidth: 500,
            height: 600,
            minHeight: 500
        }
    )


    win.loadURL(url.format({
        pathname: path.join(__dirname, 'gui-src/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // win.setFullScreen(true);
    win.webContents.openDevTools()

    var menu = Menu.buildFromTemplate([
        {
            label: "Menu",
            submenu: [
                {
                    type: 'separator'
                },
                {
                    label: "Quit",
                    click() {
                        app.quit()
                    }
                }
            ]
        }
    ])

    Menu.setApplicationMenu(menu);

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})
