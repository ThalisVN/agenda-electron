const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

let mainWindow;
const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'agenda';

async function createWindow() {
  const client = await MongoClient.connect(DB_URL);
  const db = client.db(DB_NAME);

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../html/index.html'));

  // --- Handlers CRUD com Logs ---
  ipcMain.handle('get-appointments', async (_, date) => {
    return await db.collection('compromissos').find({ date }).toArray();
  });

  ipcMain.handle('save-appointment', async (_, appointment) => {
    const result = await db.collection('compromissos').insertOne(appointment);
    return { ...appointment, _id: result.insertedId };
  });

  ipcMain.handle('delete-appointment', async (_, id) => {
    console.log('[DELETE] ID:', id); // Log para debug
    return await db.collection('compromissos').deleteOne({ _id: new ObjectId(id) });
  });

  ipcMain.handle('update-appointment', async (_, id, appointment) => {
    console.log('[UPDATE] ID:', id, 'Dados:', appointment); // Log para debug
    await db.collection('compromissos').updateOne(
      { _id: new ObjectId(id) },
      { $set: appointment }
    );
    return appointment;
  });

  // --- Janela de Compromissos ---
  ipcMain.on('open-appointment-window', (_, date) => {
    const appointmentWindow = new BrowserWindow({
      width: 400,
      height: 500,
      parent: mainWindow,
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });
    
    appointmentWindow.loadURL(`file://${path.join(__dirname, '../html/compromisso.html')}?date=${date}`);
    /**
     * Arquivo principal do Electron.
     * Responsável por criar a janela principal e lidar com eventos.
     */
    
    const { app, BrowserWindow, ipcMain } = require("electron");
    const path = require("path");
    
    /**
     * Cria a janela principal.
     */
    let mainWindow;
    
    app.whenReady().then(() => {
      mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, "preload.js"),
          contextIsolation: true,
          nodeIntegration: false
        }
      });
    
      mainWindow.loadFile("index.html");
    
      /**
       * Lida com eventos do renderer process.
       */
      ipcMain.on("abrir-nova-janela", (event, data) => {
        // Cria uma nova janela com os dados fornecidos.
        const novaJanela = new BrowserWindow({
          width: 400,
          height: 300,
          parent: mainWindow,
          modal: true
        });
    
        novaJanela.loadFile("nova-janela.html");
      });
    
      ipcMain.on("salvar-compromisso", (event, data) => {
        // Salva o compromisso no banco de dados.
        console.log("Compromisso salvo:", data);
      });
    
      ipcMain.on("buscar-compromissos", (event) => {
        // Busca compromissos no banco de dados.
        const compromissos = [
          { titulo: "Compromisso 1", hora: "10:00" },
          { titulo: "Compromisso 2", hora: "12:00" }
        ];
    
        // Envia os compromissos para o renderer process.
        event.sender.send("dados-dia", compromissos);
      });
    });
    appointmentWindow.on('closed', () => {
      mainWindow.webContents.send('refresh-calendar');
    });
  });
}

app.whenReady().then(createWindow);