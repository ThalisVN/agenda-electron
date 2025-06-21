const daysContainer = document.getElementById('days');
const monthYearElement = document.getElementById('monthYear');
let currentDate = new Date();
// Funcão para atualizar o calendário
async function updateCalendar() {
  daysContainer.innerHTML = '';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
// --- Atualizar o cabeçalho do calendário ---
  monthYearElement.textContent = 
    `${currentDate.toLocaleString('pt-BR', { month: 'long' })} ${year}`;

// --- Criar os dias vazios ---
  for(let i = 0; i < firstDay.getDay(); i++) {
    daysContainer.innerHTML += '<div class="date empty"></div>';
  }
// --- Criar os dias do mês ---
  for(let day = 1; day <= lastDay.getDate(); day++) {
    const dateElement = document.createElement('div');
    dateElement.className = 'date';
    dateElement.textContent = day;
// --- Adicionar a classe 'today' ao dia atual ---
    if(day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dateElement.classList.add('today');
    }
// --- Adicionar evento de clique ao dia ---
    dateElement.addEventListener('click', () => {
      const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      window.electronAPI.navigateTo(selectedDate);
    });
    daysContainer.appendChild(dateElement);
  }

  await loadAppointments();
}

// Função para carregar os compromissos
async function loadAppointments() {
  document.querySelectorAll('.appointment-badge').forEach(badge => badge.remove());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Ajuste para mês base 1

  // Buscar compromissos do mês INTEIRO (formato 'YYYY-MM')
  const appointments = await window.electronAPI.getAppointments(
    `${year}-${String(month).padStart(2, '0')}`
  );

  document.querySelectorAll('.date:not(.empty)').forEach(dateElement => {
    const day = parseInt(dateElement.textContent);
    dateElement.classList.remove('prova', 'aop', 'aula-sincrona', 'agendamento-prova');

    // Filtrar compromissos do dia ESPECÍFICO (formato 'YYYY-MM-DD')
    const currentDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayApps = appointments.filter(app => app.date === currentDateStr);

    // Definir prioridade de cores (maior número = maior prioridade)
    const priority = {
      'prova': 4,
      'aop': 3,
      'aula-sincrona': 2,
      'agendamento-prova': 1
    };

    let highestPriority = 0;
    let selectedType = '';
    
    // Encontrar a maior prioridade
    dayApps.forEach(app => {
      if (priority[app.type] > highestPriority) {
        highestPriority = priority[app.type];
        selectedType = app.type;
      }
    });

    // Aplicar APENAS a classe de maior prioridade
    if (selectedType) {
      dateElement.classList.add(selectedType);
    }

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

window.electronAPI.refreshCalendar(updateCalendar);
updateCalendar();
