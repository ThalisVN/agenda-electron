document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const date = params.get('date');
  document.getElementById('dataSelecionada').textContent = date;

  let appointments = [];

  // Função para recarregar a lista de compromissos
  const loadAppointments = async () => {
    appointments = await window.electronAPI.getAppointments(date);
    const list = document.getElementById('lista-compromissos');
    list.innerHTML = '';

    appointments.forEach(app => {
      const li = document.createElement('li');
      // Converta explicitamente para string e adicione logs:
      const idString = app._id.toString(); 
      console.log('ID no Frontend:', idString); // Debug
      li.innerHTML = `
        <span>${app.time} - ${app.name}</span>
        <button class="edit" data-id="${idString}">✏️</button>
        <button class="delete" data-id="${idString}">❌</button>
      `;
      list.appendChild(li);
    });
  };  

  await loadAppointments();

  // Evento de clique (delegação para elementos dinâmicos)
  document.getElementById('lista-compromissos').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete')) {
      const id = e.target.dataset.id;
      await window.electronAPI.deleteAppointment(id);
      await loadAppointments(); // Recarrega a lista após exclusão
    }

    if (e.target.classList.contains('edit')) {
      const id = e.target.dataset.id;
      const app = appointments.find(a => a._id === id);
      document.getElementById('compromisso').value = app.name;
      document.getElementById('hora').value = app.time;
      document.getElementById('salvar').dataset.id = id;
    }
 });

  // Salvar/Atualizar
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
    
    window.close();
  });
});