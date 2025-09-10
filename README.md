# 📱 Push Notifications App

Um aplicativo completo de demonstração para push notifications que funciona tanto no desktop quanto no celular como PWA (Progressive Web App).

## 🚀 Como usar

### 1. Iniciar o servidor

```bash
cd /home/dbseller/arquivosGilberto/projetos/javascriptPushNotification
npm install
PORT=3002 node server.js
```

### 2. Acessar o aplicativo

Abra seu navegador e acesse: `http://localhost:3002`

### 3. Testar no celular

- **Opção 1**: Use o mesmo endereço se estiver na mesma rede Wi-Fi: `http://[IP_DO_SEU_COMPUTADOR]:3002`
- **Opção 2**: Instale como PWA clicando em "Adicionar à tela inicial" no navegador móvel

## 📋 Funcionalidades

### ✅ No Desktop
- ✅ Ativar/desativar notificações push
- ✅ Enviar notificações de teste
- ✅ Enviar notificações personalizadas
- ✅ Interface responsiva e moderna
- ✅ Service Worker funcional

### ✅ No Mobile
- ✅ Funciona como PWA (Progressive Web App)
- ✅ Instalável na tela inicial
- ✅ Notificações push nativas
- ✅ Interface otimizada para mobile
- ✅ Funciona offline (básico)

## 🔧 Estrutura do Projeto

```
📁 push-notification-app/
├── 📄 package.json          # Dependências do projeto
├── 📄 server.js             # Servidor backend (Express + Web Push)
├── 📄 README.md             # Este arquivo
└── 📁 public/
    ├── 📄 index.html        # Interface principal
    ├── 📄 app.js            # Lógica frontend
    ├── 📄 sw.js             # Service Worker
    ├── 📄 manifest.json     # Manifesto PWA
    ├── 🖼️ icon-72x72.png    # Ícone pequeno
    ├── 🖼️ icon-192x192.png  # Ícone médio
    └── 🖼️ icon-512x512.png  # Ícone grande
```

## 🛠️ Como Funciona

### Backend (Node.js + Express)
- **Web Push**: Gerencia envio de notificações
- **CORS**: Permite requisições cross-origin
- **Endpoints**:
  - `POST /subscribe` - Registrar device para notificações
  - `POST /send-notification` - Enviar notificação
  - `POST /unsubscribe` - Cancelar notificações
  - `GET /stats` - Estatísticas de subscriptions

### Frontend (Vanilla JavaScript)
- **Service Worker**: Processa notificações em background
- **Push Manager**: Gerencia subscriptions
- **PWA**: Instalável e funciona offline
- **Interface Responsiva**: Otimizada para desktop e mobile

## 📱 Testando no Celular

### Android (Chrome/Edge/Firefox)
1. Abra `http://[IP]:3002` no navegador móvel
2. Clique em "Ativar Notificações"
3. Aceite as permissões
4. Teste enviando uma notificação

### iPhone (Safari)
1. Abra `http://[IP]:3002` no Safari
2. Clique no botão "Compartilhar"
3. Selecione "Adicionar à Tela de Início"
4. Abra o app instalado
5. Ative as notificações

## 🔐 Configuração VAPID

As chaves VAPID já estão configuradas para demonstração. Em produção, gere suas próprias chaves:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

## 🌐 Deploy em Produção

### Heroku
```bash
git init
git add .
git commit -m "Initial commit"
heroku create seu-app-push
git push heroku main
```

### Vercel
```bash
npm install -g vercel
vercel
```

## 🔧 Personalização

### Alterar ícones
Substitua os arquivos PNG na pasta `public/` pelos seus próprios ícones

### Modificar cores
Edite as variáveis CSS no arquivo `index.html`

### Customizar notificações
Modifique o arquivo `sw.js` para alterar comportamento das notificações

## 📊 Recursos Implementados

- ✅ Push Notifications completas
- ✅ PWA instalável
- ✅ Interface responsiva
- ✅ Service Worker robusto
- ✅ Gerenciamento de subscriptions
- ✅ Notificações personalizadas
- ✅ Estatísticas em tempo real
- ✅ Tratamento de erros
- ✅ Suporte mobile e desktop

## 🐛 Troubleshooting

### Notificações não funcionam
1. Verifique se o HTTPS está habilitado (necessário em produção)
2. Confirme se as permissões foram aceitas
3. Teste em modo anônimo/privado
4. Verifique o console do navegador para erros

### PWA não instala
1. Confirme se o manifest.json está acessível
2. Verifique se o Service Worker está registrado
3. Use HTTPS em produção
4. Teste em diferentes navegadores

## 📝 Próximos Passos

- [ ] Adicionar banco de dados (MongoDB/PostgreSQL)
- [ ] Implementar autenticação de usuários
- [ ] Adicionar agendamento de notificações
- [ ] Criar dashboard administrativo
- [ ] Implementar analytics de notificações
- [ ] Adicionar templates de notificações

---

**🎉 Pronto! Seu aplicativo de push notifications está funcionando perfeitamente tanto no desktop quanto no celular!**
