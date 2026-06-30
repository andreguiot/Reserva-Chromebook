FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de dependência primeiro
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe a porta que a aplicação irá usar
EXPOSE 3000

# O comando de start será definido no docker-compose (para permitir dev/prod)
CMD ["npm", "start"]
