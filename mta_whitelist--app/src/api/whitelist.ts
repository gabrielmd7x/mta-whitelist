import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { Client as MTAClient } from "mtasa";
import type { Client } from "discord.js";

const DB_FILE = path.resolve(__dirname, "../../database/whitelist.db");
const PORT = Number(process.env.WHITELIST_PORT || 3000);

const MTA_IP = process.env.MTA_IP ?? "127.0.0.1";
const MTA_PORT = Number(process.env.MTA_PORT ?? 22005);
const MTA_USER = process.env.MTA_USER ?? "discord";
const MTA_PASS = process.env.MTA_PASS ?? "1234";

const mta = new MTAClient(MTA_IP, MTA_PORT, MTA_USER, MTA_PASS);

type Row = {
  id: number;
  serial: string;
  token: string | null;
  status: "pending" | "approved";
  createdAt: string;
  updatedAt: string;
};

const nowIso = () => {
  const bDate = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return bDate.toISOString().slice(0, 19).replace("T", " ");
};

function ensureDatabase() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "");
}

class WhitelistDB {
  private db: Database.Database;
  private insertStmt: Database.Statement;
  private updateStmt: Database.Statement;
  private getSerialStmt: Database.Statement;
  private getTokenStmt: Database.Statement;
  private approveStmt: Database.Statement;

  constructor(file: string) {
    ensureDatabase();
    this.db = new Database(file, { fileMustExist: false });
    this.migrate();

    this.insertStmt = this.db.prepare(
      `INSERT INTO whitelist (serial, token, status, createdAt, updatedAt) VALUES (@serial, @token, 'pending', @createdAt, @updatedAt)`
    );
    this.updateStmt = this.db.prepare(
      `UPDATE whitelist SET token = @token, status = 'pending', updatedAt = @updatedAt WHERE serial = @serial`
    );
    this.getSerialStmt = this.db.prepare(
      `SELECT * FROM whitelist WHERE serial = ? LIMIT 1`
    );
    this.getTokenStmt = this.db.prepare(
      `SELECT * FROM whitelist WHERE token = ? LIMIT 1`
    );
    this.approveStmt = this.db.prepare(
      `UPDATE whitelist SET status = 'approved', token = NULL, updatedAt = @updatedAt WHERE id = @id`
    );
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS whitelist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serial TEXT NOT NULL UNIQUE,
        token TEXT,
        status TEXT NOT NULL CHECK(status IN ('pending','approved')) DEFAULT 'pending',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_token ON whitelist(token);
      CREATE INDEX IF NOT EXISTS idx_serial ON whitelist(serial);
    `);
  }

  getSerial(serial: string): Row | undefined {
    return this.getSerialStmt.get(serial) as Row | undefined;
  }

  getToken(token: string): Row | undefined {
    return this.getTokenStmt.get(token) as Row | undefined;
  }

  upsertPending(serial: string, token: string) {
    const now = nowIso();
    const existing = this.getSerial(serial);

    if (existing) {
      this.updateStmt.run({ token, serial, updatedAt: now });
      return this.getSerial(serial);
    }

    this.insertStmt.run({ serial, token, createdAt: now, updatedAt: now });
    return this.getSerial(serial);
  }

  approve(id: number) {
    const now = nowIso();
    this.approveStmt.run({ id, updatedAt: now });
    return this.db.prepare(`SELECT * FROM whitelist WHERE id = ?`).get(id) as Row;
  }
}

export function Whitelist(client: Client, port: number = PORT) {
  const app = express();
  app.use(express.json());

  const store = new WhitelistDB(DB_FILE);
  console.log("Banco de dados inicializado");

  app.post("/check-whitelist", (req: Request, res: Response) => {
    const rawSerial = String(req.body?.serial || "").trim();
    const rawToken = String(req.body?.token || "").trim();

    if (!rawSerial || !rawToken) {
      return res.status(400).json({ success: false, error: "serial e token obrigatórios" });
    }

    const serial = rawSerial.toUpperCase();
    const token = rawToken.replace(/^#/, "").trim();

    try {
      const existing = store.getSerial(serial);

      if (existing && existing.status === "approved") {
        return res.status(200).json({ success: true, message: "authorized" });
      }

      store.upsertPending(serial, token);
      console.log(`Whitelist pendente: ${serial}`);
      return res.status(403).json({ success: false, message: "pending" });
    } catch {
      console.log("Erro ao verificar whitelist");
      return res.status(500).json({ success: false, error: "internal error" });
    }
  });

  app.post("/approve-whitelist", async (req: Request, res: Response) => {
    const rawToken = String(req.body?.token || "").trim();
    if (!rawToken) {
      return res.status(400).json({ success: false, error: "token obrigatório" });
    }

    const token = rawToken.replace(/^#/, "").trim();

    try {
      const row = store.getToken(token);
      if (!row) {
        console.log("Token não encontrado");
        return res.status(404).json({ success: false, error: "token not found" });
      }

      const approved = store.approve(row.id);
      
      await mta.resources.mta_whitelist.whitelistApproved("approved", null, approved.serial);

      return res.status(200).json({ success: true, serial: approved.serial, message: "approved" });
    } catch {
      console.log("Erro ao aprovar whitelist");
      return res.status(500).json({ success: false, error: "internal error" });
    }
  });

  app.listen(port, () => console.log(`API rodando na porta ${port}`));
  return app;
}
