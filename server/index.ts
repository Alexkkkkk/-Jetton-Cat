import "dotenv/config";
import express from "express";
import path from "path";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { adminRoutes } from "./adminRoutes";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { initTelegramBot } from "./telegramBot";
import { getTelegramMiniAppHTML } from "./telegramMiniApp";

const app = express();
app.use(express.json());

async function ensureTables() {
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS sessions (
                sid VARCHAR PRIMARY KEY,
                sess JSONB NOT NULL,
                expire TIMESTAMP NOT NULL
            );
            CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR UNIQUE,
                first_name VARCHAR,
                last_name VARCHAR,
                profile_image_url VARCHAR,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS mint_transactions (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                destination VARCHAR NOT NULL,
                wallet_address VARCHAR NOT NULL,
                amount VARCHAR NOT NULL,
                initiated_by VARCHAR,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS ai_events (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                event_type VARCHAR(64) NOT NULL,
                description TEXT NOT NULL,
                data TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("[DB] Tables ready.");
    } catch (e) {
        console.error("[DB] Table setup error:", e);
    }
}

async function main() {
    await ensureTables();
    await setupAuth(app);
    registerAuthRoutes(app);

    app.use("/api/admin", isAuthenticated, adminRoutes);

    app.get("/tg-app", (_req, res) => {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        res.send(getTelegramMiniAppHTML());
    });

    app.get("/metadata.json", (_req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.sendFile(path.join(process.cwd(), "metadata.json"));
    });

    const clientDist = path.join(process.cwd(), "client/dist");
    app.use(express.static(clientDist));
    app.get("/{*splat}", (_req, res) => {
        res.sendFile(path.join(clientDist, "index.html"));
    });

    const PORT = parseInt(process.env.PORT || "5000");
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`[ADMIN] Server running on port ${PORT}`);
    });

    initTelegramBot();
}

main().catch(console.error);
