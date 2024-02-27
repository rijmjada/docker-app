// networks.js

// Espera a que se cargue todo el contenido de la página antes de ejecutar el script
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Realiza una solicitud GET al servidor para obtener la información de las redes Docker
    const response = await fetch('/networks');
    const networks = await response.json();

    // Llama a la función que se encarga de mostrar la información en la página HTML
    displayNetworks(networks);
  } catch (error) {
    console.error('Error al obtener la información de las redes Docker:', error);
  }
});

// Función para mostrar la información de las redes en la página HTML
function displayNetworks(networks) {
  const networkInfoContainer = document.getElementById('networkInfo');

  // Itera sobre cada red y crea un elemento HTML para mostrar su información
  networks.forEach(network => {
    const networkCard = document.createElement('div');
    networkCard.classList.add('card', 'm-3', 'col-md-4', 'network-card'); // Añadimos la clase 'network-card'
    networkCard.innerHTML = `
      <div class="p-2">
        <h5 class="card-header bg-primary text-white"> ${network.Name}</h5>
        <div class="p-2">
        <p class="card-text"><strong>ID:</strong> <small>${network.Id}</small> </p>
        <p class="card-text"><strong>Driver:</strong> <small>${network.Driver}</small> </p>
        <p class="card-text"><strong>Ámbito:</strong> <small>${network.Scope}</small></p> 
        </div>
      </div>
    `;
    networkInfoContainer.appendChild(networkCard);
  });
}
