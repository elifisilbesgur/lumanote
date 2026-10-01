'use strict';
const net = require('net');
const port = Number(process.argv[2] || 8097);
if(!Number.isInteger(port) || port < 1024 || port > 65535) {console.error('Geçersiz port.');process.exit(1);}
const server=net.createServer();
server.once('error', e=>{
  console.error('\n'+port+' portu kullanılamıyor: '+e.code);
  console.error('Başka bir sunucuya bağlanılmadı; hiçbir işlem kapatılmadı.');
  console.error('O Terminal’de Control+C yap veya LUMA_PORT=8098 ile bu betiği çalıştır.');
  process.exit(1);
});
server.listen({host:'0.0.0.0',port},()=>server.close(()=>console.log('Yeni Nocturne sunucusu için port: '+port)));
