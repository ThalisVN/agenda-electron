document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const date = params.get('date');
  document.getElementById('dataSelecionada').textContent = date;

  // --- Variável global para armazenar compromissos ---
  let appointments = [];

  // --- Função para recarregar a lista dinamicamente ---
  const loadAppointments = async () => {
    appointments = await window.electronAPI.getAppointments(date); // Atualiza a lista
    const list = document.getElementById('lista-compromissos');
    list.innerHTML = '';

    appointments.forEach(app => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${app.time} - ${app.name}</span>
        <button class="edit" data-id="${app._id}">✏️</button>
        <button class="delete" data-id="${app._id}">❌</button>
      `;
      list.appendChild(li);
    });
  };

  // --- Carregar compromissos inicialmente ---
  await loadAppointments();

  // --- Evento de clique (delegação para elementos dinâmicos) ---
  document.getElementById('lista-compromissos').addEventListener('click', async (e) => {
    // Excluir Compromisso
    if (e.target.classList.contains('delete')) {
      const id = e.target.dataset.id;
      await window.electronAPI.deleteAppointment(id);
      await loadAppointments(); // Recarrega a lista após exclusão
    }
    
    // Editar Compromisso
    if (e.target.classList.contains('edit')) {
      const id = e.target.dataset.id;
      const app = appointments.find(a => a._id === id);
      document.getElementById('compromisso').value = app.name;
      document.getElementById('hora').value = app.time;
      document.getElementById('salvar').dataset.id = id; // Armazena ID para edição
    }
  });

  // --- Salvar/Atualizar ---
  document.getElementById('salvar').addEventListener('click', async () => {
    const compromisso = {
      date,
      name: document.getElementById('compromisso').value,
      time: document.getElementById('hora').value
    };

    const id = document.getElementById('salvar').dataset.id;
    if (id) {
      await window.electronAPI.updateAppointment(id, compromisso);
    } else {
      await window.electronAPI.saveAppointment(compromisso);
    }
    
    window.close(); // Fecha a janela após salvar
  });
});