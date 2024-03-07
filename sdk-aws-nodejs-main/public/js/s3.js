const URL = 'http://localhost:3000';

// Función para crear una tarjeta de S3
function createS3Card(title, content, identifier) {
    const card = document.createElement('div');
    card.classList.add('card', 'bucket-card');
    card.innerHTML = `
        <h6>${title}</h6>
        <hr>
        <p>${content}</p>
        <div class="icon-container"></div>
        <div >
            <input type="file" class="form-control file-input" style="display: none;">
            <button class="btn btn-secondary upload-btn">Subir archivo</button>
        </div>
    `;
    const iconContainer = card.querySelector('.icon-container');
    iconContainer.style.backgroundImage = 'url("./img/s3.jpg")';
    card.id = `bucket-card-${identifier}`;

    return card;
}

// Función para agregar eventos a la tarjeta de S3
function addS3CardEvents(card) {
    const uploadBtn = card.querySelector('.upload-btn');
    const fileInput = card.querySelector('.file-input');

    // Agregar evento clic al botón de subir archivo
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Agregar evento change al input de archivo
    fileInput.addEventListener('change', async (event) => {
        const files = event.target.files;
        const bucketName = card.id.split('-').slice(2).join('-'); // Obtener el nombre del bucket del ID de la tarjeta

        for (const file of files) {
            await uploadFile(file, bucketName);
        }
    });
}

async function uploadFile(file, bucketName) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucketName', bucketName);

    try {
        const response = await fetch(URL + '/upload', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            console.log('Archivo subido exitosamente:', file.name);
        } else {
            console.error('Error al subir el archivo:', response.statusText);
        }
    } catch (error) {
        console.error('Error de red:', error);
    }
}

// Obtener el contenedor de los buckets
const bucketsContainer = document.getElementById('buckets');

// Cargar los buckets al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const bucketsResponse = await fetch(URL + '/list-buckets');
        const buckets = await bucketsResponse.json();

        buckets.forEach((bucket) => {
            const bucketCard = createS3Card(bucket.name, `Creado en: ${formatDate(bucket.creationDate)}`, bucket.name);
            addS3CardEvents(bucketCard); // Agregar eventos a la tarjeta
            bucketsContainer.appendChild(bucketCard);
        });
    } catch (error) {
        console.error('Error al obtener información:', error);
    }
});

// Función para formatear la fecha
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short', timeZone: 'America/Argentina/Buenos_Aires' };
    return new Date(dateString).toLocaleString('es-AR', options);
}
