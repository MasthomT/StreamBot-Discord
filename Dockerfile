# Utilise une image de base Node.js
FROM node:18

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers de configuration de Node.js et installe les dépendances
COPY package*.json ./
RUN npm install

# Copie le reste des fichiers du projet
COPY . .

# Lance la commande de build
RUN npm run build

# Définit le port sur lequel l'application écoute
EXPOSE 8080

# Définit la commande pour démarrer le service
CMD ["npm", "run", "start"]