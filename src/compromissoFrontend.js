/**
 * Interface de gestão de compromissos (CRUD).
 * Controla a renderização, exclusão, edição e salvamento de compromissos.
 * Comunica-se com o backend via IPC (Electron).
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Extrai a data da URL (formato: YYYY-MM-DD)
  const params = new URLSearchParams(window.location.search);
  const date = params.get('date');
  document.getElementById('dataSelecionada').textContent = date;

  // --- Carregar Compromissos ---
  const appointments = await window.electronAPI.getAppointments(date);
  const list = document.getElementById('lista-compromissos');
  list.innerHTML = ''; // Limpa lista existente

  // Renderiza cada compromisso como um item de lista com botões de ação
  appointments.forEach(app => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${app.time} - ${app.name}</span>
      <button class="edit" data-id="${app._id}">✏️</button>
      <button class="delete" data-id="${app._id}">❌</button>
    `;
    list.appendChild(li);
  });

  // --- Eventos ---
  list.addEventListener('click', async (e) => {
    // Excluir Compromisso
    if (e.target.classList.contains('delete')) {
      await window.electronAPI.deleteAppointment(e.target.dataset.id);
      e.target.parentElement.remove(); // Remove visualmente o item
    }
    
    // Editar Compromisso: Preenche formulário com dados existentes
    if (e.target.classList.contains('edit')) {
      const app = appointments.find(a => a._id === e.target.dataset.id);
      document.getElementById('compromisso').value = app.name;
      document.getElementById('hora').value = app.time;
      document.getElementById('salvar').dataset.id = e.target.dataset.id; // Armazena ID para atualização
    }
  });

  // Salvar/Atualizar Compromisso
  document.getElementById('salvar').addEventListener('click', async () => {
    const compromisso = {
      date, // Data extraída da URL
      name: document.getElementById('compromisso').value,
      time: document.getElementById('hora').value
    };

    // Decide entre criar ou atualizar com base na presença de dataset.id
    if (document.getElementById('salvar').dataset.id) {
      await window.electronAPI.updateAppointment(
        document.getElementById('salvar').dataset.id,
        compromisso
      );
    } else {
      await window.electronAPI.saveAppointment(compromisso);
    }
    
    window.close(); // Fecha janela após operação
  });
});