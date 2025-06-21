const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

let mainWindow;
const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'agenda';

async function createWindow() {
  const client = await MongoClient.connect(DB_URL);
  const db = client.db(DB_NAME);
 // --- Criar a janela ---
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets/icon/icon.png'),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../html/index.html'));

  // --- Handlers CRUD Atualizados ---
  ipcMain.handle('get-appointments', async (_, monthPrefix) => {
    const query = { date: { $regex: `^${monthPrefix}` } };
    const appointments = await db.collection('compromissos').find(query).toArray();
    return appointments.map(app => ({ ...app, _id: app._id.toString() }));
  });
 // --- Salvar Compromisso ---
 ipcMain.handle('save-appointment', async (_, appointment) => {
  const result = await db.collection('compromissos').insertOne(appointment);
  return {...appointment,_id: result.insertedId.toString()};
});
  // --- Deletar Compromisso ---
  ipcMain.handle('delete-appointment', async (_, id) => {
    if (!ObjectId.isValid(id)) {
      throw new Error('ID inválido!');
    }
    return await db.collection('compromissos').deleteOne({ _id: new ObjectId(id) });
  });
  // --- Editar Compromisso ---
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
    // Passar a data para o HTML 
    appointmentWindow.loadURL(`file://${path.join(__dirname, '../html/compromisso.html')}?date=${date}`);
    
    // Recarregar a lista ao fechar a janela
    appointmentWindow.on('closed', () => {
      mainWindow.webContents.send('refresh-calendar');
    });
  });
}

app.whenReady().then(createWindow);
