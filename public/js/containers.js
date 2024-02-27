// containers.js
fetch('/containers')
  .then(response => response.json())
  .then(containers => {
    const containerInfoElement = document.getElementById('containerInfo');
    containers.forEach(container => {
      const card = createContainerCard(container);
      containerInfoElement.appendChild(card);
    });
  })
  .catch(error => {
    console.error('Error obteniendo información de contenedores:', error);
  });

// Función para crear una tarjeta de contenedor
function createContainerCard(container) {
  const card = document.createElement('div');
  card.className = 'card mb-3 container-card'; // Agregamos la clase 'container-card'
  card.setAttribute('data-container-id', container.Id); // Identificador único

  const cardHeader = document.createElement('div');
  cardHeader.className = 'card-header bg-success text-white';
  const containerName = container.Names && container.Names.length > 0 ? container.Names[0] : 'Sin nombre';
  cardHeader.textContent = `${containerName}`;
  card.appendChild(cardHeader);

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  const containerId = createCardInfo('ID', container.Id ? container.Id : 'Sin ID', 'card-info');
  const containerImage = createCardInfo('Imagen', container.Image ? container.Image : 'Sin imagen', 'card-image');
  const containerCreated = createCardInfo('Creado', formatDate(container.Created), 'card-date');
  const containerPorts = createCardInfo('Puertos', container.Ports ? container.Ports.map(port => `${port.PrivatePort}:${port.PublicPort}`).join(', ') : 'Sin puertos', 'card-ports');
  const containerState = createCardInfo('Estado', container.State ? container.State : 'Desconocido', 'card-state');
  const containerStatus = createCardInfo('Status', container.Status ? container.Status : 'Desconocido', 'card-status');

  cardBody.appendChild(containerId);
  cardBody.appendChild(containerImage);
  cardBody.appendChild(containerCreated);
  cardBody.appendChild(containerPorts);
  cardBody.appendChild(containerState);
  cardBody.appendChild(containerStatus);

  // Contenedor para el botón
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'd-flex justify-content-center my-4 p-4';


  // Botón de acción (Detener/Iniciar)
  const actionButton = document.createElement('button');
  actionButton.className = container.State === 'running' ? 'btn btn-danger stop-button my-3 p-3' : 'btn btn-success start-button my-3 p-3';
  actionButton.textContent = container.State === 'running' ? 'Detener Contenedor' : 'Iniciar Contenedor';
  actionButton.addEventListener('click', () => handleActionButtonClick(container.Id, container.State));

  buttonContainer.appendChild(actionButton);
  cardBody.appendChild(buttonContainer);

  card.appendChild(cardBody);
  return card;
}

// Función para manejar el clic en el botón de acción
function handleActionButtonClick(containerId, containerState) {
  const action = containerState === 'running' ? stopContainer : startContainer;

  // Llama a la función correspondiente
  action(containerId);
}

// Función para actualizar la interfaz de usuario con el nuevo estado del contenedor
function updateContainerUI(card, result, condition) {
  const startButton = card.querySelector('.start-button');
  const stopButton = card.querySelector('.stop-button');
  const containerId = card.getAttribute('data-container-id');
  const ports = card.querySelector('.card-ports');

  console.log(result)

  if (condition === 'start' && startButton) {
    // Cambiar las clases y el contenido del botón de iniciar

    ports.innerHTML = `<strong>Puertos:</strong> ${obtenerPuertos(result)}`;

    startButton.classList.remove('btn-success');
    startButton.textContent = 'Detener Contenedor';
    startButton.classList.add('btn-danger');

    startButton.classList.remove('start-button');
    startButton.classList.add('stop-button');

    startButton.removeEventListener('click', handleActionButtonClick);
    startButton.addEventListener('click', () => stopContainer(containerId))
  }

  if (condition === 'stop' && stopButton) {
    // Cambiar las clases y el contenido del botón de detener
    stopButton.classList.remove('btn-danger');
    stopButton.classList.add('btn-success');
    stopButton.textContent = 'Iniciar Contenedor';

    stopButton.classList.remove('stop-button');
    stopButton.classList.add('start-button');

    stopButton.removeEventListener('click', handleActionButtonClick);
    stopButton.addEventListener('click', () => startContainer(containerId))
  }

}


function obtenerPuertos(result) {
  try {
    // Supongamos que result es tu objeto con la estructura proporcionada
    const ports = result.container.Ports;

    // Obtén todas las claves (nombres de los puertos)
    const portNames = Object.keys(ports);

    // Inicializa un array para almacenar todos los valores de los puertos
    const allPortValues = [];

    // Itera sobre las claves y obtén los valores de cada puerto
    portNames.forEach(portName => {
      const portInfo = ports[portName][0]; // Suponemos que siempre hay al menos un elemento en el array
      const hostIp = portInfo.HostIp;
      const hostPort = portInfo.HostPort;

      // Almacena los valores en el array
      allPortValues.push({ portName, hostIp, hostPort });
    });

    // Ahora allPortValues contiene un array de objetos con la información de cada puerto
    return allPortValues.map(port => `${port.hostPort}:${port.hostPort}/${port.portName}`).join(', ');
  } catch (error) {
    console.log(error)
    return '';
  }


}



// Dentro de la función stopContainer
async function stopContainer(containerId) {
  const card = document.querySelector(`[data-container-id="${containerId}"]`);
  const stopButton = card.querySelector('.stop-button');

  // Mostrar spinner y cambiar texto del botón
  stopButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deteniendo...';

  try {
    // Realizar la solicitud al servidor para detener el contenedor
    const response = await fetch(`/stop-container/${containerId}`, { method: 'POST' });
    const result = await response.json(); // Parsear la respuesta como JSON

    if (result.success) {
      // Actualizar la interfaz de usuario con el nuevo estado del contenedor
      updateContainerUI(card, result, 'stop');
    } else {
      console.error(`Error deteniendo el contenedor: ${result.message}`);

      // Restaurar contenido original en caso de error
      stopButton.innerHTML = 'Detener Contenedor';
    }
  } catch (error) {
    console.error(`Error deteniendo el contenedor: ${error.message}`);

    // Restaurar contenido original en caso de error
    stopButton.innerHTML = 'Detener Contenedor';
  }
}

async function startContainer(containerId) {
  const card = document.querySelector(`[data-container-id="${containerId}"]`);
  const startButton = card.querySelector('.start-button');

  console.log(containerId)
  // Mostrar spinner y cambiar texto del botón
  startButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando...';

  try {
    // Realizar la solicitud al servidor para iniciar el contenedor
    const response = await fetch(`/start-container/${containerId}`, { method: 'POST' });
    const result = await response.json(); // Parsear la respuesta como JSON

    if (result.success) {
      // Actualizar la interfaz de usuario con el nuevo estado del contenedor
      updateContainerUI(card, result, 'start');
    } else {
      console.error(`Error iniciando el contenedor: ${result.message}`);

      // Restaurar contenido original en caso de error
      startButton.innerHTML = 'Iniciar Contenedor';
    }
  } catch (error) {
    console.error(`Error iniciando el contenedor: ${error.message}`);

    // Restaurar contenido original en caso de error
    startButton.innerHTML = 'Iniciar Contenedor';
  }
}

// Función para crear un elemento de información dentro de la tarjeta
function createCardInfo(label, value, cssClass) {
  const infoElement = document.createElement('p');
  infoElement.className = `card-text-container ${cssClass}`;

  const strongLabel = document.createElement('strong');
  strongLabel.textContent = `${label}: `;

  infoElement.appendChild(strongLabel);
  infoElement.innerHTML += value; // Usamos innerHTML para interpretar el HTML en la cadena value

  return infoElement;
}

// Función para formatear la fecha
function formatDate(timestamp) {
  if (!timestamp) return 'Invalid Date';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}


