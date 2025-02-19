const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppointments: (date) => ipcRenderer.invoke('get-appointments', date),
  saveAppointment: (appointment) => ipcRenderer.invoke('save-appointment', appointment),
  deleteAppointment: (id) => ipcRenderer.invoke('delete-appointment', id),
  updateAppointment: (id, appointment) => ipcRenderer.invoke('update-appointment', id, appointment),
  navigateTo: (date) => ipcRenderer.send('open-appointment-window', date),
  refreshCalendar: (callback) => ipcRenderer.on('refresh-calendar', callback)
});/**
 * Arquivo de pré-carregamento do Electron.
 * Responsável por expor funções para o renderer process.
 */

const { contextBridge, ipcRenderer } = require("electron");

/**
 * Expose funções para o renderer process.
 */
contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * Abre uma nova janela com os dados fornecidos.
   * @param {object} data - Dados para a nova janela.
   */
  abrirNovaJanela: (data) => {
    ipcRenderer.send("abrir-nova-janela", data);
  }
});