class PushNotificationApp {
    constructor() {
        this.isSubscribed = false;
        this.swRegistration = null;
        this.vapidPublicKey = null;
        
        this.initializeElements();
        this.init();
    }

    initializeElements() {
        this.statusEl = document.getElementById('status');
        this.statusTextEl = document.getElementById('status-text');
        this.subscribeBtn = document.getElementById('subscribe-btn');
        this.subscribeTextEl = document.getElementById('subscribe-text');
        this.testBtn = document.getElementById('test-btn');
        this.unsubscribeBtn = document.getElementById('unsubscribe-btn');
        this.sendCustomBtn = document.getElementById('send-custom-btn');
        this.statsEl = document.getElementById('stats');

        // Form elements
        this.titleInput = document.getElementById('notification-title');
        this.bodyInput = document.getElementById('notification-body');
        this.urlInput = document.getElementById('notification-url');

        this.bindEvents();
    }

    bindEvents() {
        this.subscribeBtn.addEventListener('click', () => this.handleSubscribeClick());
        this.testBtn.addEventListener('click', () => this.sendTestNotification());
        this.unsubscribeBtn.addEventListener('click', () => this.handleUnsubscribeClick());
        this.sendCustomBtn.addEventListener('click', () => this.sendCustomNotification());
    }

    async init() {
        // Verificar se está em contexto seguro
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            this.updateStatus('❌ Notificações push precisam de HTTPS para funcionar no celular', 'not-supported');
            return;
        }

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                // Verificar permissões
                const permission = await Notification.requestPermission();
                if (permission === 'denied') {
                    this.updateStatus('❌ Permissões de notificação foram negadas', 'not-supported');
                    return;
                }

                // Registrar service worker
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', this.swRegistration);

                // Verificar se já está subscrito
                const subscription = await this.swRegistration.pushManager.getSubscription();
                this.isSubscribed = !(subscription === null);

                // Obter chave VAPID do servidor
                await this.loadStats();

                this.updateUI();
                this.updateStatus('Pronto para receber notificações! 🎉', 'supported');
            } catch (error) {
                console.error('Erro ao inicializar:', error);
                this.updateStatus('Erro ao inicializar o serviço 😞', 'not-supported');
            }
        } else {
            this.updateStatus('Push notifications não suportadas neste navegador 😞', 'not-supported');
        }
    }


    async loadStats() {
        try {
            const response = await fetch('/stats');
            const data = await response.json();
            this.vapidPublicKey = data.vapidPublicKey;
            this.updateStats(data.totalSubscriptions);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            this.statsEl.innerHTML = '<strong style="color: #f44336;">Erro ao carregar estatísticas</strong>';
        }
    }

    updateStats(totalSubscriptions) {
        this.statsEl.innerHTML = `
            <strong>📊 Estatísticas:</strong><br>
            Total de dispositivos inscritos: <strong>${totalSubscriptions}</strong>
        `;
    }

    updateStatus(text, type) {
        this.statusTextEl.textContent = text;
        this.statusEl.className = `status ${type}`;
    }

    updateUI() {
        this.subscribeBtn.disabled = false;
        
        if (this.isSubscribed) {
            this.subscribeTextEl.textContent = '🔔 Inscrito para Notificações';
            this.subscribeBtn.className = 'btn success';
            this.testBtn.disabled = false;
            this.sendCustomBtn.disabled = false;
            this.unsubscribeBtn.style.display = 'block';
            this.updateStatus('Você está inscrito para receber notificações! 🔔', 'subscribed');
        } else {
            this.subscribeTextEl.textContent = '🔔 Ativar Notificações';
            this.subscribeBtn.className = 'btn primary';
            this.testBtn.disabled = true;
            this.sendCustomBtn.disabled = true;
            this.unsubscribeBtn.style.display = 'none';
        }
    }

    async handleSubscribeClick() {
        if (this.isSubscribed) {
            return;
        }

        try {
            this.setLoading(true);
            await this.subscribeUser();
        } catch (error) {
            console.error('Erro ao se inscrever:', error);
            alert('Erro ao ativar notificações: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async handleUnsubscribeClick() {
        try {
            this.setLoading(true);
            await this.unsubscribeUser();
        } catch (error) {
            console.error('Erro ao cancelar inscrição:', error);
            alert('Erro ao cancelar notificações: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        const container = document.querySelector('.container');
        if (loading) {
            container.classList.add('loading');
            this.subscribeTextEl.textContent = 'Processando...';
        } else {
            container.classList.remove('loading');
            this.updateUI();
        }
    }

    async subscribeUser() {
        const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
        
        const subscription = await this.swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        });

        console.log('Usuário inscrito:', subscription);

        // Enviar subscription para o servidor
        const response = await fetch('/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao registrar no servidor');
        }

        this.isSubscribed = true;
        await this.loadStats();
        console.log('Subscription enviada para o servidor');
    }

    async unsubscribeUser() {
        const subscription = await this.swRegistration.pushManager.getSubscription();
        
        if (subscription) {
            // Cancelar no navegador
            await subscription.unsubscribe();
            
            // Remover do servidor
            await fetch('/unsubscribe', {
                method: 'POST',
                body: JSON.stringify({ endpoint: subscription.endpoint }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Usuário cancelou a inscrição');
        }

        this.isSubscribed = false;
        await this.loadStats();
    }

    async sendTestNotification() {
        try {
            this.testBtn.disabled = true;
            this.testBtn.textContent = 'Enviando...';

            const response = await fetch('/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: '🎉 Notificação de Teste',
                    body: 'Esta é uma notificação de teste do seu app!',
                    url: window.location.origin
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                alert('✅ ' + result.message);
            } else {
                alert('❌ Erro: ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            alert('❌ Erro ao enviar notificação');
        } finally {
            this.testBtn.disabled = false;
            this.testBtn.textContent = '🔔 Enviar Notificação de Teste';
        }
    }

    async sendCustomNotification() {
        const title = this.titleInput.value.trim();
        const body = this.bodyInput.value.trim();
        const url = this.urlInput.value.trim();

        if (!title) {
            alert('Por favor, insira um título para a notificação');
            this.titleInput.focus();
            return;
        }

        if (!body) {
            alert('Por favor, insira uma mensagem para a notificação');
            this.bodyInput.focus();
            return;
        }

        try {
            this.sendCustomBtn.disabled = true;
            this.sendCustomBtn.textContent = 'Enviando...';

            const response = await fetch('/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    body: body,
                    url: url || window.location.origin
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                alert('✅ ' + result.message);
                // Limpar formulário
                this.titleInput.value = '';
                this.bodyInput.value = '';
                this.urlInput.value = '';
            } else {
                alert('❌ Erro: ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            alert('❌ Erro ao enviar notificação');
        } finally {
            this.sendCustomBtn.disabled = false;
            this.sendCustomBtn.textContent = '📤 Enviar Notificação';
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Inicializar app quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new PushNotificationApp();
});
