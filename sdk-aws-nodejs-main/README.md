### 1. Crea un usuario de AWS:

- Ve a la consola de AWS y crea un nuevo usuario con permisos de administrador.
- Toma nota del `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` proporcionados para este usuario.

### 2. Configura las variables de entorno:

- Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables:

  ```plaintext
  AWS_ACCESS_KEY_ID=TU_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY=TU_SECRET_ACCESS_KEY
  AWS_REGION=us-east-1 o la que corresponda
  PORT=3000 

### 3. Instalar dependencias y correr aplicación

  ```plaintext
npm install
npm start
