// Run this with: node generate-qr.js
// Make sure you have qrcode installed: npm install qrcode

const QRCode = require('qrcode');
const path = require('path');

const url = 'https://shazam-six.vercel.app/menu.html';
const outputPath = path.join(__dirname, 'QRCode.png');

QRCode.toFile(outputPath, url, {
    color: {
        dark: '#2c1810',
        light: '#f5e6d3'
    },
    width: 500,
    margin: 2,
    type: 'image/png'
}, (err) => {
    if (err) {
        console.error('Error generating QR code:', err);
    } else {
        console.log(`✅ QR code generated successfully: ${outputPath}`);
        console.log(`URL encoded: ${url}`);
    }
});
