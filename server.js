const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Bootstrap: 優先使用雲端環境分配的 PORT，否則預設使用 3000
const PORT = process.env.PORT || 3000;

// 1. Data Source: 載入 JSON 資料庫 (使用解構賦值提取 data 陣列)
const { data } = require('./data/lens.json');
// ---------------------------------------------------------
// 2. Global Middleware: Logger (全域日誌紀錄)
// 只要有任何請求進入伺服器，都會執行這段函式
// ---------------------------------------------------------
app.use((req, res, next) => {
    // 取得時間、HTTP Method (請求方法) 與 URL (網址路徑)
    const log = `[${new Date().toLocaleString()}] ${req.method} ${req.url}\n`;

    // 使用 fs.appendFileSync 將紀錄「追加」到 access.log 檔案中
    fs.appendFileSync(path.resolve(__dirname, './access.log'), log);

    // 呼叫 next()，讓請求往下一個 Middleware 或 Route 傳遞
    next();
});

// ---------------------------------------------------------
// 3. Static Assets Middleware (靜態資源中間件)
// 將 public 資料夾開放，讓瀏覽器可以直接讀取 CSS、圖片、HTML
// ---------------------------------------------------------
app.use(express.static(path.resolve(__dirname, './public')));

// ---------------------------------------------------------
// 4. Dynamic Route: Product Details (動態路由與參數)
// 使用 Route Parameters (:model) 來接收網址中的變動部分
// ---------------------------------------------------------
app.get('/product/:model', (req, res) => {
    // 從 Params 取得網址上的型號
    const { model } = req.params;

    // 在 JSON 資料中尋找對應的型號
    const product = data.find(item => item.model === model);

    // Error Handling: 如果找不到產品，回傳 404 狀態碼與錯誤訊息
    if (!product) {
        return res.status(404)
            .set('Content-Type', 'text/html; charset=utf-8')
            .send('<h1>404 找不到型號</h1>');
    }

    // Response: 使用 Method Chaining 傳送渲染後的內容
    res.send(`
        <div style="text-align:center; font-family:sans-serif;">
            <h1>Sony Product Info (產品資訊)</h1>
            <hr>
            <h2>${product.name}</h2>
            <p>Model: ${product.model}</p>
            <img src="${product.imageUrl}" alt="${product.name}" style="width:400px;">
            <br><br>
            <a href="/">Back to Home (回首頁)</a>
        </div>
    `);
});

// ---------------------------------------------------------
// 5. Protected Route: Admin (受保護的路由與授權)
// 透過 Query String (查詢字串) 進行簡單的 Authorization (授權驗證)
// ---------------------------------------------------------
app.get('/admin', (req, res) => {
    // 檢查 URL 參數中是否有 code=521
    const isAuth = req.query.code === '521';
    const message = isAuth ? 'Welcome to Admin (歡迎進入後台)' : 'Access Denied (暗號錯誤)';

    // 根據驗證結果給予 200 (成功) 或 403 (禁止存取) 狀態碼
    res.status(isAuth ? 200 : 403)
        .set('Content-Type', 'text/html; charset=utf-8')
        .send(`<h1 style="text-align:center;">${message}</h1>`);
});

// ---------------------------------------------------------
// 6. Wildcard Route: Catch-all (萬用路由 / 404 防呆)
// 捕捉所有上述路由都沒有對中的「不明路徑」，這必須放在最下面
// ---------------------------------------------------------
app.all(/.*$/, (req, res) => {
    res.status(404)
        .set('Content-Type', 'text/html; charset=utf-8')
        .send('<h1 style="text-align:center; padding-top:50px;">404 Not Found (抱歉，路徑不存在)</h1>');
});

// 7. Start Server: 啟動監聽
app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});