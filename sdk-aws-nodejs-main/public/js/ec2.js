
const URL = 'http://localhost:3000';

// Objeto para almacenar las instancias y sus estados
const instances = {};

document.addEventListener('DOMContentLoaded', async () => {
    const instancesContainer = document.getElementById('instances');

    try {
        // Obtener información de las instancias EC2
        const instancesResponse = await fetch(URL + '/list-ec2');
        const instancesData = await instancesResponse.json();

        // Mostrar información de las instancias EC2 y almacenarlas en el objeto instances
        instancesData.forEach((instance) => {
            instances[instance.instanceId] = instance;
            const instanceCard = createCard(instance, 'ec2-card');
            instancesContainer.appendChild(instanceCard);
        });
    } catch (error) {
        console.error('Error al obtener información:', error);
    }
});

function createCard(instance, cardType) {
    const card = document.createElement('div');
    card.classList.add('card', cardType);
    card.innerHTML = `
        <h6>${instance.name}</h6>
        <hr>
        <div class="info">
            <p><strong>Estado:</strong> ${instance.state}</p>
            <p><strong>IP Privada:</strong> ${instance.privateIpAddress}</p>
            <p><strong>IP Pública:</strong> ${instance.publicIpAddress}</p>
            <p><strong>Lanzado en:</strong> ${formatDate(instance.launchTime)}</p>
            <p><strong>Tipo de instancia:</strong> ${instance.instanceType}</p>
            <p><strong>vCPU:</strong> ${instance.vcpu}</p>
        </div>
        <div class="icon-container"></div>
    `;

    const iconContainer = card.querySelector('.icon-container');
    if (cardType === 'ec2-card') {
        iconContainer.style.backgroundImage = 'url("./img/ec2.jpg")';
        const button = document.createElement('button');
        button.textContent = instance.state === 'running' ? 'Detener' : 'Iniciar';
        button.classList.add('btn', instance.state === 'running' ? 'btn-danger' : 'btn-success');
        button.addEventListener('click', () => handleInstanceStateChange(instance.instanceId, button));
        card.appendChild(button);
    }

    return card;
}



async function handleInstanceStateChange(instanceId, button) {
    const currentState = instances[instanceId].state;
    const action = currentState === 'running' ? 'stop' : 'start';
    try {
        const response = await fetch(`${action}-instance/${instanceId}`);
        if (response.ok) {
            const newState = currentState === 'running' ? 'stopped' : 'running';
            button.textContent = newState === 'running' ? 'Detener' : 'Iniciar';
            button.className = '';
            button.classList.add('btn', newState === 'running' ? 'btn-danger' : 'btn-success');
            instances[instanceId].state = newState;
        }
        console.log(response);
    } catch (error) {
        console.error(`Error al ${action} la instancia EC2:`, error);
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short', timeZone: 'America/Argentina/Buenos_Aires' };
    return new Date(dateString).toLocaleString('es-AR', options);
}
