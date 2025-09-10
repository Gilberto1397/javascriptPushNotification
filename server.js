const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Web Push (você deve gerar suas próprias chaves VAPID)
const vapidKeys = {
  publicKey: 'BIlWuY4WEQjlMxSlzWb-SCcKY-eEN_6W_7NsilqB7Htt9l3QWc7GIS3-KCfb62X1EdwqZaZ6_XQcsPvADu-5d6o',
  privateKey: 'niwmxpv1SD5uWRpMxzW49i6lLSrnXFpdMGNKGvkdZeg'
};

webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Armazenar subscriptions (em produção, use um banco de dados)
let subscriptions = [];

// Rotas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para registrar subscription
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  
  // Verificar se a subscription já existe
  const existingIndex = subscriptions.findIndex(sub => 
    sub.endpoint === subscription.endpoint
  );
  
  if (existingIndex === -1) {
    subscriptions.push(subscription);
    console.log('Nova subscription registrada:', subscription.endpoint);
  } else {
    subscriptions[existingIndex] = subscription;
    console.log('Subscription atualizada:', subscription.endpoint);
  }
  
  res.status(201).json({ message: 'Subscription registrada com sucesso!' });
});

// Endpoint para enviar notification
app.post('/send-notification', async (req, res) => {
  const { title, body, icon, url } = req.body;
  
  if (subscriptions.length === 0) {
    return res.status(400).json({ error: 'Nenhuma subscription registrada' });
  }
  
  const notificationPayload = JSON.stringify({
    title: title || 'Notificação Teste',
    body: body || 'Esta é uma notificação de teste!',
    icon: icon || '/icon-192x192.png',
    badge: '/icon-72x72.png',
    url: url || '/',
    timestamp: Date.now(),
    requireInteraction: true
  });
  
  const promises = subscriptions.map(async (subscription, index) => {
    try {
      await webpush.sendNotification(subscription, notificationPayload);
      console.log(`Notificação enviada para subscription ${index + 1}`);
      return { success: true, index };
    } catch (error) {
      console.error(`Erro ao enviar para subscription ${index + 1}:`, error);
      
      // Remove subscriptions inválidas
      if (error.statusCode === 410) {
        subscriptions.splice(index, 1);
        console.log(`Subscription ${index + 1} removida (410 Gone)`);
      }
      
      return { success: false, index, error: error.message };
    }
  });
  
  try {
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({
      message: `Notificações enviadas: ${successful} sucesso, ${failed} falhas`,
      results,
      totalSubscriptions: subscriptions.length
    });
  } catch (error) {
    console.error('Erro geral ao enviar notificações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para obter estatísticas
app.get('/stats', (req, res) => {
  res.json({
    totalSubscriptions: subscriptions.length,
    vapidPublicKey: vapidKeys.publicKey
  });
});

// Endpoint para remover subscription
app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  
  const index = subscriptions.findIndex(sub => sub.endpoint === endpoint);
  if (index !== -1) {
    subscriptions.splice(index, 1);
    res.json({ message: 'Subscription removida com sucesso!' });
  } else {
    res.status(404).json({ error: 'Subscription não encontrada' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📱 Total de subscriptions: ${subscriptions.length}`);
  console.log(`🔑 VAPID Public Key: ${vapidKeys.publicKey}`);
});
