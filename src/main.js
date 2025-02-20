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
      preload: path.join(__dirname, 'preload.js') // Caminho corrigido para preload.js
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../html/index.html')); 

  // Handlers do Banco de Dados
  ipcMain.handle('get-appointments', async (_, date) => {
    return await db.collection('compromissos').find({ date }).toArray();
  });

  ipcMain.handle('save-appointment', async (_, appointment) => {
    const result = await db.collection('compromissos').insertOne(appointment);
    return { ...appointment, _id: result.insertedId };
  });

  ipcMain.handle('delete-appointment', async (_, id) => {
    console.log('ID Recebido no Backend:', id, 'Tipo:', typeof id); // Debug
    if (!ObjectId.isValid(id)) {
      console.error('Formato Inválido! ID deve ser 24 caracteres hexadecimais.');
      throw new Error('ID inválido!');
    }
    return await db.collection('compromissos').deleteOne({ _id: new ObjectId(id) });
  });

  ipcMain.handle('update-appointment', async (_, id, appointment) => {
    if (!ObjectId.isValid(id)) {
      throw new Error('ID inválido!');
    }
    await db.collection('compromissos').updateOne(
      { _id: new ObjectId(id) },
      { $set: appointment }
    );
    return appointment;
  });

  // Janela de Compromissos
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
    
    appointmentWindow.on('closed', () => {
      mainWindow.webContents.send('refresh-calendar');
    });
  });
}

app.whenReady().then(createWindow);