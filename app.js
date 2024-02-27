// app.js
const express = require('express');
const Docker = require('dockerode');
const util = require('util');
const { exec } = require('child_process');

const docker = new Docker();
const execPromise = util.promisify(exec);

const app = express();
const port = 3002;

app.use(express.static('public'));


function getContainerInfo(callback) {
  docker.listContainers({ all: true }, (err, containers) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, containers);
    }
  });
}


app.get('/containers', (req, res) => {
  getContainerInfo((error, containers) => {
    if (error) {
      console.error('Error obteniendo información de contenedores:', error);
      res.status(500).send('Error obteniendo información de contenedores');
    } else {
      console.log(containers)
      res.json(containers);
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/stop-container/:containerId', async (req, res) => {
  const containerId = req.params.containerId;

  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    res.json({ success: true, message: `Contenedor ${containerId} detenido exitosamente` });
  } catch (error) {
    console.error('Error deteniendo el contenedor:', error);
    res.status(500).json({ success: false, message: `Error deteniendo el contenedor: ${error.message}` });
  }
});


app.get('/networks', async (req, res) => {
  try {
    const networks = await getDockerNetworks();
    res.json(networks);
  } catch (error) {
    console.error('Error obteniendo información de redes:', error);
    res.status(500).json({ error: 'Error obteniendo información de redes' });
  }
});

async function getDockerNetworks() {
  return new Promise((resolve, reject) => {
    docker.listNetworks((err, networks) => {
      if (err) {
        reject(err);
      } else {
        const formattedNetworks = networks.map(network => ({
          Name: network.Name,
          Id: network.Id,
          Driver: network.Driver,
          Scope: network.Scope,
        }));
        resolve(formattedNetworks);
      }
    });
  });
}

app.get('/images', async (req, res) => {
  try {
    const images = await docker.listImages();

    res.status(200).json({ success: true, data: images });
  } catch (error) {
    console.error('Error obteniendo información de imágenes:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo información de imágenes', details: error.message });
  }
});

app.post('/stop-container/:containerId', async (req, res) => {
  const containerId = req.params.containerId;

  try {
    const container = docker.getContainer(containerId);
    await container.stop();

    // Obtener la información actualizada del contenedor
    const updatedContainer = await getContainerInfoById(containerId);
    res.json({ success: true, message: `Contenedor ${containerId} detenido exitosamente`, container: updatedContainer });
  } catch (error) {
    console.error('Error deteniendo el contenedor:', error);
    res.status(500).json({ success: false, message: `Error deteniendo el contenedor: ${error.message}` });
  }
});

app.post('/start-container/:containerId', async (req, res) => {
  const containerId = req.params.containerId;

  try {
    const container = docker.getContainer(containerId);
    await container.start();

    // Obtener la información actualizada del contenedor
    const updatedContainer = await getContainerInfoById(containerId);
    res.json({ success: true, message: `Contenedor ${containerId} iniciado exitosamente`, container: updatedContainer });
  } catch (error) {
    console.error('Error iniciando el contenedor:', error);
    res.status(500).json({ success: false, message: `Error iniciando el contenedor: ${error.message}` });
  }
});

// Función para obtener la información actualizada del contenedor por ID
async function getContainerInfoById(containerId) {
  return new Promise((resolve, reject) => {
    const container = docker.getContainer(containerId);
    container.inspect((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(formatContainerInfo(data));
      }
    });
  });
}

// Función para dar formato a la información del contenedor
function formatContainerInfo(container) {
  return {
    ID: container.Id,
    Image: container.Config.Image,
    Created: container.Created,
    Ports: container.NetworkSettings.Ports,
    State: container.State ? container.State.Status : 'Desconocido',
    Status: container.State ? container.State : 'Desconocido',
  };
}


app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
