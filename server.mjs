import express from 'express';
import http from 'node:http';
import { createBareServer } from "@tomphttp/bare-server-node";
import cors from 'cors';
import path from 'node:path';

const app = express();
const server = http.createServer();
const __dirname = process.cwd();
const bareServer = createBareServer('/bare/');
const PORT = process.env.PORT || 8080;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Scramjetルートへのアクセスは常にindex.htmlを返す
app.get(/^\/scramjet\/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ルートアクセス
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// HTTPリクエストのハンドリング
server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        // Expressアプリへリクエストを渡す
        app(req, res);
    }
});

// WebSocket/Upgradeリクエストのハンドリング
server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

// サーバー起動
server.listen({ port: PORT }, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// プロセス終了時のクリーンアップ
process.on("SIGINT", () => {
    server.close();
    bareServer.close();
    process.exit(0);
});
