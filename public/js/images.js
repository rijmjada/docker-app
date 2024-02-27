// images.js
document.addEventListener('DOMContentLoaded', function () {
  fetch('/images')
    .then(response => response.json())
    .then(images => {
      const imagesContainer = document.getElementById('imagesInfo');

      images.data.forEach(image => {
        const card = createImageCard(image);
        imagesContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error obteniendo información de imágenes:', error);
    });

  function createImageCard(image) {
    const card = document.createElement('div');
    card.classList.add('card', 'm-3', 'bg-white', 'text-dark-subtle');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'p-3');

    // Extrayendo el nombre y la etiqueta
    const [name, tag] = extractNameAndTag(image.RepoTags.length > 0 ? image.RepoTags[0] : '');

    const nameElement = document.createElement('p');
    nameElement.classList.add('card-text','bg-warning','rounded','text-dark', 'p-2','text-center'); 
    nameElement.innerHTML = `<strong> ${name !== '<none>' ? name : 'Ninguno'} </strong> `;

    const tagElement = document.createElement('p');
    tagElement.classList.add('card-text');
    tagElement.innerHTML = `<strong>Tag:</strong> ${tag}`;

    // Quitando la parte "sha256:" del ID
    const id = extractId(image.Id);

    const idElement = document.createElement('p');
    idElement.classList.add('card-text');
    idElement.innerHTML = `<strong>ID:</strong> <small> ${id} </small>`;

    const sizeElement = document.createElement('p');
    sizeElement.classList.add('card-text');
    sizeElement.innerHTML = `<strong>Tamaño:</strong>  <small> ${image.Size} bytes </small> `;

    cardBody.appendChild(nameElement);
    cardBody.appendChild(tagElement);
    cardBody.appendChild(idElement);
    cardBody.appendChild(sizeElement);

    card.appendChild(cardBody);

    return card;
  }

  // Función para extraer el nombre y la etiqueta
  function extractNameAndTag(fullRepoTag) {
    const parts = fullRepoTag.split(':');
    const name = parts.length > 1 ? parts[0] : '<none>';
    const tag = parts.length > 1 ? parts.slice(1).join(':') : '<none>';
    return [name, tag];
  }

  // Función para quitar la parte "sha256:" del ID
  function extractId(fullId) {
    const parts = fullId.split(':');
    return parts.length > 1 ? parts[1] : fullId;
  }
});
