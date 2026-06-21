import "dotenv/config";
import express from "express";
import path from "path";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { adminRoutes } from "./adminRoutes";
import { db } from "./db";
import { sql } from "drizzle-orm";

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

    const clientDist = path.join(process.cwd(), "client/dist");
    app.use(express.static(clientDist));
    app.get("/{*splat}", (_req, res) => {
        res.sendFile(path.join(clientDist, "index.html"));
    });

    const PORT = parseInt(process.env.PORT || "5000");
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`[ADMIN] Server running on port ${PORT}`);
    });
}

main().catch(console.error);
