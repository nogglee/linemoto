const cron = require('cron');
const https = require('https'); 
const http = require('http'); 

const backendUrl = 'http://your-backend-url.onrender.com/health'; // 🚀 Render 백엔드 URL 확인 필요

// ✅ 14분마다 실행 (슬립 모드 방지)
const job = new cron.CronJob('*/14 * * * *', function () {
    console.log(`[${new Date().toISOString()}] 🔄 Restarting server...`);
    
    const requestModule = backendUrl.startsWith('https') ? https : http;

    requestModule.get(backendUrl, (res) => {
        if (res.statusCode === 200) {
            console.log(`[${new Date().toISOString()}] ✅ Server restarted successfully`);
        } else {
            console.error(`[${new Date().toISOString()}] ❌ Failed to restart server. Status code: ${res.statusCode}`);
        }
    }).on('error', (err) => {
        console.error(`[${new Date().toISOString()}] ❌ Error during Restart: ${err.message}`);
    });
});

// ✅ 크론잡 실행
job.start();

module.exports = { job };