# mta-whitelist

Criei este sistema de whitelist em um curto tempo, apenas para fins de **aprendizado**.  
A ideia é permitir que os jogadores façam a whitelist sem que o código precise acessar diretamente o banco de dados:  
o sistema envia uma solicitação para o **bot do Discord**, que fica responsável pelo gerenciamento.

**Sistema simples, desenvolvido apenas para fins de aprendizado...**

---

## 🚀 Funcionalidades
- Geração de token único quando o jogador entra no servidor  
- Validação de serial + token via API  
- Armazenamento em banco de dados (SQLite)  
- Bot do Discord para aprovar whitelist  
- Comunicação em tempo real com o servidor MTA  

---

## 📂 Estrutura do Projeto
- **MTA Resource (Lua)** → Detecta quando o jogador entra, gera token e comunica com a API  
- **API (Node.js + Express + SQLite)** → Gerencia banco de dados, tokens e aprovação  
- **Bot do Discord (TypeScript + discord.js)** → Interface para o jogador fazer o envio dos dados
- **Banco de dados (SQLite)** → Armazena o status da whitelist

---

## 🔧 Como funciona
1. O jogador entra no servidor → um **token de 6 dígitos** é gerado.  
2. O token + serial são enviados para a **API**.  
3. Se já estiver aprovado → o jogador é liberado.  
4. Caso contrário → ele deve preencher os dados no **bot do Discord**.  
5. Quando aprovado → a API avisa o servidor MTA, e o acesso e atribuído ao jogador.  

---

## 🛠️ Stack Utilizada

### Linguagens
![Lua](https://img.shields.io/badge/Lua-2C2D72?style=for-the-badge&logo=lua&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

### Tecnologias
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![DiscordJS](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Sqlite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 📦 Instalação

### 1. Clonar o repositório
```sh 
git clone https://github.com/gabrielmd7x/mta-whitelist.git
```

### 2. Instalar dependências
```sh 
pnpm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo .env dentro do mta_whitelist--app
```sh
TOKEN=TOKEN
CLIENT_ID=CLIENT_ID
WHITELIST_PORT=3000
MTA_IP=127.0.0.1
MTA_PORT=22005
MTA_USER=discord
MTA_PASS=1234
```

### 3. Inicialize a API e o Resource no MTA
```sh 
pnpm run dev / start mta_whitelist
```
