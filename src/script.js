/**
 * Controla o calendário na página principal.
 * Renderiza dias, destaca a data atual e gerencia eventos de navegação.
 */
const { ipcRenderer } = require('electron');
const daysContainer = document.getElementById('days');
const monthYearElement = document.getElementById('monthYear');
let currentDate = new Date(); // Data atualmente exibida no calendário

// Atualiza calendário com base em currentDate
async function updateCalendar() {
  daysContainer.innerHTML = '';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();

  // Atualiza cabeçalho 
  monthYearElement.textContent = 
    `${currentDate.toLocaleString('pt-BR', { month: 'long' })} ${year}`;

  // Adiciona dias vazios para alinhar a semana
  for (let i = 0; i < firstDay.getDay(); i++) {
    daysContainer.innerHTML += '<div class="date empty"></div>';
  }

  // Renderiza dias do mês
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateElement = document.createElement('div');
    dateElement.className = 'date';
    dateElement.textContent = day;

    // Destaca dia atual
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dateElement.classList.add('today');
    }

    // Abre janela de compromissos ao clicar em um dia
    dateElement.addEventListener('click', () => {
      const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      ipcRenderer.send('open-appointment-window', selectedDate);
    });

    daysContainer.appendChild(dateElement);
  }

  await loadAppointments(); // Carrega compromissos após renderizar dias
}

// Carrega compromissos e exibe badges com horários
async function loadAppointments() {
  // Remove badges antigos
  document.querySelectorAll('.appointment-badge').forEach(badge => badge.remove());
  
  // Busca compromissos do mês atual
  const date = currentDate.toISOString().split('T')[0];
  const appointments = await ipcRenderer.invoke('get-appointments', date);

  // Adiciona badge para cada compromisso no dia correto
  document.querySelectorAll('.date:not(.empty)').forEach(dateElement => {
    const day = parseInt(dateElement.textContent);
    appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate.getDate() === day && 
             appDate.getMonth() === currentDate.getMonth() && 
             appDate.getFullYear() === currentDate.getFullYear();
    }).forEach(app => {
      const badge = document.createElement('div');
      badge.className = 'appointment-badge';
      badge.textContent = app.time;
      dateElement.appendChild(badge);
    });
  });
}

// Navegação entre meses
document.getElementById('prevMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});

// Atualiza calendário quando recebe evento de atualização
ipcRenderer.on('refresh-calendar', updateCalendar);

// Renderiza calendário ao carregar a página
updateCalendar();