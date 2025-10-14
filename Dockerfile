# --- Estágio 1: Build da Aplicação React ---
# Usamos uma imagem Node.js leve (alpine) e a nomeamos como "builder"
FROM node:20-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de dependência primeiro para aproveitar o cache do Docker
# Se esses arquivos não mudarem, o 'npm install' não será executado novamente
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código-fonte da aplicação
COPY . .

# Executa o script de build para gerar os arquivos estáticos na pasta /dist
RUN npm run build

# --- Estágio 2: Servidor de Produção ---
# Começamos um novo estágio com uma imagem NGINX super leve
FROM nginx:1.25-alpine

# Copia APENAS os arquivos estáticos gerados no estágio anterior
# para a pasta padrão do NGINX que serve conteúdo web.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a nossa configuração customizada do NGINX para dentro do contêiner
# Isso sobrescreve a configuração padrão e aplica nossa regra para SPAs
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 para que o NGINX possa receber tráfego
EXPOSE 80

# Comando padrão para iniciar o NGINX quando o contêiner for executado
CMD ["nginx", "-g", "daemon off;"]