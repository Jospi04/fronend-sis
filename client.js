let ws;
let machineName;

function connect() {
  ws = new WebSocket('ws://localhost:8080');

  ws.onopen = () => {
    console.log('Conectado al servidor');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'name') {
      machineName = data.name;
      document.getElementById('machine-name').textContent = machineName;
    } else if (data.type === 'machines') {
      updateMachineList(data.machines);
    } else if (data.type === 'message') {
      displayMessage(data);
    } else if (data.type === 'error') {
      alert(data.message);
    }
  };

  ws.onclose = () => {
    console.log('Desconectado del servidor');
    setTimeout(connect, 1000); // Reconectar
  };
}

function updateMachineList(machines) {
  const recipientSelect = document.getElementById('recipient');
  recipientSelect.innerHTML = '<option value="all">Todas las máquinas</option>';
  machines.forEach((name) => {
    if (name !== machineName) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      recipientSelect.appendChild(option);
    }
  });
  document.getElementById('machine-list').textContent = machines.join(', ') || 'Ninguna';
}

function displayMessage(data) {
  const messagesDiv = document.getElementById('messages');
  const message = document.createElement('div');
  message.className = 'mb-2';
  message.innerHTML = `<strong>${data.sender} → ${data.to}:</strong> ${data.content}`;
  messagesDiv.appendChild(message);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
  const messageInput = document.getElementById('message');
  const recipient = document.getElementById('recipient').value;
  const content = messageInput.value.trim();

  if (!content) return;

  if (recipient === 'all') {
    ws.send(JSON.stringify({ type: 'broadcast', content }));
  } else {
    ws.send(JSON.stringify({ type: 'direct', to: recipient, content }));
  }

  messageInput.value = '';
}

connect();