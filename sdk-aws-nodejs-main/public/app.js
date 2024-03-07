document.addEventListener('DOMContentLoaded', () => {
    const ec2Image = document.getElementById('ec2-image');
    const s3Image = document.getElementById('s3-image');

    ec2Image.addEventListener('click', () => {
        window.location.href = './ec2.html'; // Redirige a la página EC2.html cuando se hace clic en la imagen EC2
    });

    s3Image.addEventListener('click', () => {
        window.location.href = './s3.html'; // Redirige a la página S3.html cuando se hace clic en la imagen S3
    });
});
