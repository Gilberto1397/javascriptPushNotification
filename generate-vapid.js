const webpush = require('web-push');

// Gerar novas chaves VAPID
const vapidKeys = webpush.generateVAPIDKeys();

console.log('=== NOVAS CHAVES VAPID ===');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('');
console.log('Private Key:');
console.log(vapidKeys.privateKey);
console.log('==========================');

// Exportar as chaves para usar no servidor
module.exports = vapidKeys;
