const express = require('express');
require('dotenv').config();

const {
    S3Client,
    PutObjectCommand,
    ListBucketsCommand
} = require('@aws-sdk/client-s3');


const {
    EC2Client,
    DescribeInstancesCommand,
    StopInstancesCommand,
    StartInstancesCommand,
} = require('@aws-sdk/client-ec2');

const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.PORT;

app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;


// Configuración del cliente EC2
const ec2Client = new EC2Client({
    region, 
    credentials: {
        accessKeyId,
        secretAccessKey
    },
});

// Configuración del s3Client
const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    },
});



// Endpoint para listar instancias EC2 con detalles
app.get('/list-ec2', async (req, res) => {
    try {
        const command = new DescribeInstancesCommand({});
        const response = await ec2Client.send(command);

        const instancesInfo = response.Reservations.flatMap((reservation) =>
            reservation.Instances.map((instance) => ({
                instanceId: instance.InstanceId,
                state: instance.State.Name,
                privateIpAddress: instance.PrivateIpAddress,
                publicIpAddress: instance.PublicIpAddress,
                launchTime: new Intl.DateTimeFormat('es-AR', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                }).format(instance.LaunchTime),
                name: getInstanceTagName(instance, 'Name'),
                instanceType: instance.InstanceType,
                vcpu: instance.CpuOptions ? instance.CpuOptions.CoreCount : null,
            }))
        );

        res.status(200).json(instancesInfo);
    } catch (error) {
        console.error('Error al listar instancias EC2:', error);
        res.status(500).send('Error al listar instancias EC2');
    }
});



// Función para obtener el valor de una etiqueta específica
function getInstanceTagName(instance, tagName) {
    const tag = instance.Tags.find((tag) => tag.Key === tagName);
    return tag ? tag.Value : null;
}


// Endpoint para listar buckets
app.get('/list-buckets', async (req, res) => {
    try {
        const command = new ListBucketsCommand({});
        const response = await s3Client.send(command);

        console.log(response)

        const bucketsInfo = response.Buckets.map((bucket) => ({
            name: bucket.Name,
            creationDate: new Intl.DateTimeFormat('es-AR', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            }).format(bucket.CreationDate),
        }));


        res.status(200).json(bucketsInfo);
    } catch (error) {
        console.error('Error al listar buckets:', error);
        res.status(500).send('Error al listar buckets');
    }
});


app.get('/stop-instance/:instanceId', async (req, res) => {
    const instanceId = req.params.instanceId;

    try {
        const command = new StopInstancesCommand({
            InstanceIds: [instanceId],
        });
        await ec2Client.send(command);

        res.status(200).json({ message: `Instancia ${instanceId} detenida correctamente.` });
    } catch (error) {
        console.error(`Error al detener la instancia ${instanceId}:`, error);
        res.status(500).json({ message: `Error al detener la instancia ${instanceId}.` });
    }
});

app.get('/start-instance/:instanceId', async (req, res) => {
    const instanceId = req.params.instanceId;

    try {
        const command = new StartInstancesCommand({
            InstanceIds: [instanceId],
        });
        await ec2Client.send(command);

        res.status(200).json({ message: `Instancia ${instanceId} iniciada correctamente.` });
    } catch (error) {
        console.error(`Error al iniciar la instancia ${instanceId}:`, error);
        res.status(500).json({ message: `Error al iniciar la instancia ${instanceId}.` });
    }
});


// Ruta para subir el archivo al bucket
app.post('/upload', upload.single('file'), (req, res) => {
    const bucketName = req.body.bucketName;
    const fileName = req.file.originalname;
    const file = req.file.path;

    // Configuración del objeto para subir al bucket
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fs.createReadStream(file)
    };

    // Subir el archivo al bucket
    s3Client.send(new PutObjectCommand(params), (err, data) => {
        if (err) {
            console.error('Error al subir el archivo:', err);
            res.status(500).send('Error al subir el archivo al bucket');
        } else {
            console.log('Archivo subido con éxito:', data);
            res.send('Archivo subido con éxito');
        }
    });
});


app.listen(port, () => {
    console.log(`El servidor está en ejecución en el puerto ${port}`);
});
