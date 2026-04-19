const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// 1. Data Source: 載入 JSON 資料
const { data } = require('./data/lens.json');

// 2. Global Middleware: Logger
app.use((req, res, next) => {
    const log = `[${new Date().toLocaleString()}] ${req.method} ${req.url}\n`;
    fs.appendFileSync(path.resolve(__dirname, './access.log'), log);
    next();
});

// 3. Static Assets: 開放 public 資料夾
app.use(express.static(path.resolve(__dirname, './public')));

// 4. Dynamic Route: 產品詳情頁 (風格對齊 Apple)
app.get('/product/:model', (req, res) => {
    const { model } = req.params;
    const product = data.find(item => item.model === model);

    if (!product) {
        return res.status(404).send(`
            <body style="background:#f5f5f7; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; color:#1d1d1f;">
                <div style="text-align:center;">
                    <h1 style="font-size:80px; margin:0; color:#d2d2d7;">404</h1>
                    <p>抱歉，我們找不到該款相機。</p>
                    <a href="/" style="color:#0066cc; text-decoration:none;">返回首頁</a>
                </div>
            </body>
        `);
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <title>${product.name} - Sony Alpha</title>
            <style>
                body { background-color: #f5f5f7; color: #1d1d1f; font-family: "SF Pro Display", "Helvetica Neue", Arial, sans-serif; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .detail-card { background: #ffffff; padding: 60px; border-radius: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); text-align: center; max-width: 600px; width: 90%; }
                .brand { font-size: 14px; font-weight: 600; color: #ffffff; text-transform: uppercase; margin-bottom: 10px; }
                h1 { font-size: 40px; margin-bottom: 10px; font-weight: 700; }
                .model-tag { color: #bf4800; font-weight: 600; margin-bottom: 30px; display: block; }
                img { width: 100%; max-width: 400px; border-radius: 20px; margin-bottom: 30px; }
                .back-btn { display: inline-block; margin-top: 20px; color: #0066cc; text-decoration: none; font-weight: 500; }
                .back-btn:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="detail-card">
                <p class="brand">Sony Alpha Series</p>
                <h1>${product.name}</h1>
                <span class="model-tag">Model: ${product.model}</span>
                <img src="${product.imageUrl}" alt="${product.name}">
                <br>
                <a href="/" class="back-btn">&lsaquo; 返回產品清單</a>
            </div>
        </body>
        </html>
    `);
});

// 5. Protected Route: Admin (後台也美化)
app.get('/admin', (req, res) => {
    const isAuth = req.query.code === '521';
    const message = isAuth ? '歡迎進入 Sony 管理後台' : '存取被拒：暗號錯誤';
    
    res.status(isAuth ? 200 : 403).send(`
        <body style="background:#1d1d1f; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
            <div style="text-align:center; border: 1px solid #333; padding: 50px; border-radius: 20px;">
                <h1 style="font-weight:300; letter-spacing:2px;">${message}</h1>
                <a href="/" style="color:#86868b; text-decoration:none; font-size:12px;">返回官網</a>
            </div>
        </body>
    `);
});

// 6. Catch-all (防呆)
app.all(/.*$/, (req, res) => {
    res.status(404).send(`
        <body style="background:#f5f5f7; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
            <div style="text-align:center;">
                <h1 style="color:#d2d2d7;">404 Page Not Found</h1>
                <a href="/" style="color:#0066cc; text-decoration:none;">回首頁</a>
            </div>
        </body>
    `);
});

app.listen(PORT, () => {
    console.log(`Sony Store is Live at: http://localhost:${PORT}`);
});