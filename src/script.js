const daysContainer = document.getElementById('days');
const monthYearElement = document.getElementById('monthYear');
let currentDate = new Date();

async function updateCalendar() {
  daysContainer.innerHTML = '';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();

  monthYearElement.textContent = 
    `${currentDate.toLocaleString('pt-BR', { month: 'long' })} ${year}`;

  for(let i = 0; i < firstDay.getDay(); i++) {
    daysContainer.innerHTML += '<div class="date empty"></div>';
  }

  for(let day = 1; day <= lastDay.getDate(); day++) {
    const dateElement = document.createElement('div');
    dateElement.className = 'date';
    dateElement.textContent = day;

    if(day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dateElement.classList.add('today');
    }

    dateElement.addEventListener('click', () => {
      const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      window.electronAPI.navigateTo(selectedDate); // Usando window.electronAPI
    });

    daysContainer.appendChild(dateElement);
  }

  await loadAppointments();
}

async function loadAppointments() {
  document.querySelectorAll('.appointment-badge').forEach(badge => badge.remove());
  
  const date = currentDate.toISOString().split('T')[0];
  const appointments = await window.electronAPI.getAppointments(date); // Usando window.electronAPI

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

document.getElementById('prevMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});

window.electronAPI.refreshCalendar(updateCalendar); // Usando window.electronAPI

updateCalendar();/**
 * Arquivo de script do renderer process.
 * Responsável por interagir com o usuário e chamar funções do Electron.
 */

/**
 * Função para salvar um novo compromisso.
 */
const salvarCompromisso = () => {
  const titulo = tituloInput.value.trim();
  const hora = horaInput.value.trim();

  if (!titulo || !hora) {
    alert("Preencha todos os campos!");
    return;
  }

  // Chama a função do Electron para salvar o compromisso.
  window.electronAPI.salvarCompromisso({ titulo, hora });
};

/**
 * Função para buscar compromissos para o dia atual.
 */
const buscarCompromissos = () => {
  // Chama a função do Electron para buscar compromissos.
  window.electronAPI.buscarCompromissos();
};

// Adiciona eventos aos botões.
btnSalvar.addEventListener("click", salvarCompromisso);
btnBuscar.addEventListener("click", buscarCompromissos);