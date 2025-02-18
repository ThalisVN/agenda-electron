/**
 * Ponto de entrada principal da aplicação Electron.
 * Configura janelas, conecta ao MongoDB e gerencia operações de banco de dados via IPC.
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

let mainWindow;
const DB_URL = 'mongodb://localhost:27017'; // URL do MongoDB local
const DB_NAME = 'agenda'; // Nome do banco de dados

// Cria a janela principal e conecta ao MongoDB
async function createWindow() {
  const client = await MongoClient.connect(DB_URL);
  const db = client.db(DB_NAME);

  // Configura janela principal
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'src/preload.js') // Script de pré-carregamento
    }
  });
  mainWindow.loadFile(path.join(__dirname, '../html/index.html'));

  // --- Handlers IPC para Operações do Banco de Dados ---
  // Retorna compromissos filtrados por data
  ipcMain.handle('get-appointments', async (_, date) => {
    return await db.collection('compromissos').find({ date }).toArray();
  });

  // Cria novo compromisso e retorna com ID gerado
  ipcMain.handle('save-appointment', async (_, appointment) => {
    const result = await db.collection('compromissos').insertOne(appointment);
    return { ...appointment, _id: result.insertedId };
  });

  // Exclui compromisso por ID (usa ObjectId do MongoDB)
  ipcMain.handle('delete-appointment', async (_, id) => {
    return await db.collection('compromissos').deleteOne({ _id: new ObjectId(id) });
  });

  // Atualiza compromisso existente por ID
  ipcMain.handle('update-appointment', async (_, id, appointment) => {
    await db.collection('compromissos').updateOne(
      { _id: new ObjectId(id) },
      { $set: appointment }
    );
    return appointment;
  });

  // --- Janela de Compromissos ---
  // Abre uma nova janela filha para adicionar/editar compromissos
  ipcMain.on('open-appointment-window', (_, date) => {
    const appointmentWindow = new BrowserWindow({
      width: 400,
      height: 500,
      parent: mainWindow, // Define janela pai para manter foco
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, 'src/preload.js')
      }
    });
    // Carrega HTML com parâmetro de data na URL
    appointmentWindow.loadURL(`file://${path.join(__dirname, '../html/compromisso.html')}?date=${date}`);
    
    // Atualiza calendário ao fechar a janela
    appointmentWindow.on('closed', () => {
      mainWindow.webContents.send('refresh-calendar');
    });
  });
}

// Inicia aplicação quando Electron estiver pronto
app.whenReady().then(createWindow);