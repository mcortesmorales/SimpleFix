# Dockerfile para frontend

FROM node:16

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Habilitar polling para cambios en archivos
ENV CHOKIDAR_USEPOLLING=true

# Exponer el puerto y arrancar la aplicación
EXPOSE 3000
CMD ["npm", "start"]
