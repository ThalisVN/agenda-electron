/**
 * Expõe APIs seguras do Electron para o frontend via contextBridge.
 * Garante isolamento entre processos do Electron e código do usuário.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Compromissos
  getAppointments: (date) => ipcRenderer.invoke('get-appointments', date),
  saveAppointment: (appointment) => ipcRenderer.invoke('save-appointment', appointment),
  deleteAppointment: (id) => ipcRenderer.invoke('delete-appointment', id),
  updateAppointment: (id, appointment) => ipcRenderer.invoke('update-appointment', id, appointment),
  
  // Navegação
  navigateTo: (date) => ipcRenderer.send('open-appointment-window', date),
  
  // Eventos
  refreshCalendar: (callback) => ipcRenderer.on('refresh-calendar', callback)
});