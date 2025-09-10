// Service Worker para Push Notifications
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
    event.waitUntil(self.clients.claim());
});

// Listener para push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification recebida:', event);

    let notificationData = {};
    
    if (event.data) {
        notificationData = event.data.json();
    } else {
        notificationData = {
            title: 'Notificação',
            body: 'Você recebeu uma nova mensagem!',
            icon: '/icon-192x192.png'
        };
    }

    const options = {
        body: notificationData.body,
        icon: notificationData.icon || '/icon-192x192.png',
        badge: notificationData.badge || '/icon-72x72.png',
        image: notificationData.image,
        data: {
            url: notificationData.url || '/',
            timestamp: notificationData.timestamp || Date.now()
        },
        actions: [
            {
                action: 'view',
                title: 'Ver',
                icon: '/icon-72x72.png'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ],
        requireInteraction: notificationData.requireInteraction || false,
        silent: false,
        vibrate: [200, 100, 200],
        tag: 'push-notification'
    };

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
    );
});

// Listener para cliques na notification
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicada:', event);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Verificar se já existe uma aba aberta com a URL
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Se não encontrou uma aba aberta, abrir nova
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Listener para fechamento da notification
self.addEventListener('notificationclose', (event) => {
    console.log('Notification fechada:', event);
    
    // Aqui você pode enviar analytics ou fazer outras ações
    // quando o usuário fechar a notificação
});
