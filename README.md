# 🎭 Las Dos Caras - Frontend

Este es el repositorio Frontend del proyecto "Las Dos Caras", desarrollado con **React**, **TypeScript**, **Vite** y **Tailwind CSS v4**.

## 📋 Información del Proyecto
* **Integrantes del equipo:** Kendall Gomez Alvarado, Juan Pablo Murillo Aragon y Anthony Rait Martinez Ruiz
* **Plataforma de entrega:** Campus Virtual UTN
* **Notas adicionales:** El backend (API REST) no está incluido en este repositorio y debe ejecutarse por separado.

---

## 🚀 Instrucciones para ejecutar el proyecto localmente

Para que el proyecto funcione correctamente en tu máquina, es necesario instalar las dependencias locales y configurar las variables de entorno. Sigue estos pasos exactos:

### 1. Clonar el repositorio
Descarga el código a tu computadora y entra a la carpeta del proyecto:
```bash
git clone https://github.com/AnthonyMartinez65/lasdoscaras.git
cd lasdoscaras
```

### 2. Instalar las dependencias (`node_modules`)
Por buenas prácticas, los motores y archivos pesados están excluidos del repositorio. Para descargar React, Tailwind y demás herramientas necesarias, ejecuta:
```bash
npm install
```

### 3. Configurar las variables de entorno
1. En la raíz del proyecto, busca el archivo de plantilla llamado **`.env.example`**.
2. Haz una copia exacta de ese archivo en la misma carpeta y renómbralo únicamente como **`.env`**.
3. Abre el nuevo `.env` y asegúrate de que la variable apunte a tu servidor backend local (ej. `VITE_API_URL=http://localhost:3000`).

### 4. Iniciar el servidor de desarrollo
Una vez que las dependencias estén instaladas y el `.env` esté listo, levanta la interfaz con el siguiente comando:
```bash
npm run dev
```

La terminal te devolverá una dirección local (por defecto `http://localhost:5173/`). Ábrela en tu navegador para ver la aplicación funcionando en vivo.