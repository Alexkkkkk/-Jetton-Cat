import { Router } from "express";
import { TonClient, Address, fromNano, beginCell, internal, WalletContractV4, toNano } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { db } from "./db";
import { mintTransactions } from "../shared/models/auth";
import { desc } from "drizzle-orm";
import axios from "axios";
import * as fs from "fs";
import { analyzeContract, logAiEvent, getRecentAiEvents } from "./aiEngine";

function getConfig() {
    try {
        return JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));
    } catch {
        return {};
    }
}

function getMasterAddress(): string {
    const config = getConfig();
    return config.masterAddress || process.env.MASTER_ADDRESS!;
}

export const adminRoutes = Router();

function getClient() {
    return new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey: process.env.TONCENTER_API_KEY,
    });
}

adminRoutes.get("/stats", async (_req, res) => {
    try {
        const client = getClient();
        const master = Address.parse(getMasterAddress());

        const state = await client.provider(master).getState();
        const balance = fromNano(state.balance);

        let contractStats: Record<string, any> = {};
        try {
            const r = await client.runMethod(master, "get_vital_signs");
            contractStats = {
                apr:            r.stack.readNumber(),
                total_locked:   fromNano(r.stack.readBigNumber()),
                last_update:    r.stack.readNumber(),
                synapse_depth:  r.stack.readNumber(),
                liquidity_ratio: r.stack.readNumber(),
                health:         r.stack.readNumber(),
            };
        } catch (_) {
            contractStats = { error: "Contract not yet active (exit_code 11)" };
        }

        const configData = getConfig();

        res.json({
            masterAddress: getMasterAddress(),
            balance,
            network: process.env.NETWORK_TYPE || "mainnet",
            contractStats,
            config: configData,
            tonscanUrl: `https://tonscan.org/address/${getMasterAddress()}`,
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.get("/neural-profile", async (_req, res) => {
    try {
        const client = getClient();
        const master = Address.parse(getMasterAddress());
        const r = await client.runMethod(master, "get_neural_profile");
        const neural = {
            history_hash: r.stack.readBigNumber().toString(16).slice(0, 16),
            evolution_cycles: r.stack.readNumber(),
            threat_level: r.stack.readNumber(),
            policy_weight: r.stack.readNumber(),
            last_tx_time: r.stack.readNumber(),
            mutation_seed: r.stack.readNumber(),
            memory_bank: r.stack.readNumber(),
        };
        res.json(neural);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.get("/ai-analysis", async (_req, res) => {
    try {
        const client = getClient();
        const master = Address.parse(getMasterAddress());

        const state = await client.provider(master).getState();
        const balance = fromNano(state.balance);

        let vitals: any = null;
        let neural: any = null;
        let isFrozen = false;

        try {
            const rv = await client.runMethod(master, "get_vital_signs");
            vitals = {
                apr: rv.stack.readNumber(),
                total_locked: Number(rv.stack.readBigNumber()),
                last_update: rv.stack.readNumber(),
                synapse_depth: rv.stack.readNumber(),
                liquidity_ratio: rv.stack.readNumber(),
                health: rv.stack.readNumber(),
            };
        } catch (_) {
            vitals = { apr: 0, total_locked: 0, last_update: 0, synapse_depth: 0, liquidity_ratio: 0, health: 0 };
        }

        try {
            const rn = await client.runMethod(master, "get_neural_profile");
            neural = {
                history_hash: rn.stack.readBigNumber().toString(16).slice(0, 16),
                evolution_cycles: rn.stack.readNumber(),
                threat_level: rn.stack.readNumber(),
                policy_weight: rn.stack.readNumber(),
                last_tx_time: rn.stack.readNumber(),
                mutation_seed: rn.stack.readNumber(),
                memory_bank: rn.stack.readNumber(),
            };
        } catch (_) {
            neural = { history_hash: "0", evolution_cycles: 0, threat_level: 0, policy_weight: 100, last_tx_time: 0, mutation_seed: 7, memory_bank: 0 };
        }

        const analysis = analyzeContract(vitals, neural, isFrozen);

        await logAiEvent("AI_ANALYSIS_RUN", analysis.summary, {
            status: analysis.status,
            score: analysis.score,
            riskLevel: analysis.riskLevel,
        });

        res.json({ analysis, vitals, neural, balance });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.get("/ai-events", async (_req, res) => {
    try {
        const events = await getRecentAiEvents(30);
        res.json(events);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.post("/neural-command", async (req, res) => {
    try {
        const { freeze, entropyAdj = 0, biasAdj = 0 } = req.body;
        const client = getClient();
        const master = Address.parse(getMasterAddress());
        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        const body = beginCell()
            .storeUint(2735106208, 32)
            .storeInt(Number(entropyAdj), 257)
            .storeInt(Number(biasAdj), 257)
            .storeBit(!!freeze)
            .endCell();

        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({ to: master, value: toNano("0.1"), body })],
        });

        const msg = `Neural command sent: freeze=${freeze}, entropyAdj=${entropyAdj}, biasAdj=${biasAdj}`;
        await logAiEvent(freeze ? "EMERGENCY_FREEZE" : "NEURAL_COMMAND", msg, { freeze, entropyAdj, biasAdj });

        res.json({ success: true, message: msg });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.post("/mint", async (req, res) => {
    try {
        const { destination, amount } = req.body;
        if (!destination || !amount) {
            return res.status(400).json({ error: "destination and amount are required" });
        }

        const destAddress = Address.parse(destination);
        const amountNano = toNano(String(amount));

        const client = getClient();
        const masterAddress = Address.parse(getMasterAddress());

        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        const body = beginCell()
            .storeUint(122372062, 32)
            .storeCoins(amountNano)
            .storeAddress(destAddress)
            .endCell();

        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({ to: masterAddress, value: toNano("0.3"), body, bounce: true })],
        });

        await db.insert(mintTransactions).values({
            destination: destination.toString(),
            walletAddress: destination.toString(),
            amount: String(amount),
            initiatedBy: (req.user as any)?.claims?.sub || null,
        });

        await logAiEvent("MINT", `Minted ${amount} PLSH to ${destination}`, { destination, amount });

        res.json({ success: true, walletAddress: destination.toString() });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.get("/mint-history", async (_req, res) => {
    try {
        const rows = await db
            .select()
            .from(mintTransactions)
            .orderBy(desc(mintTransactions.createdAt))
            .limit(50);
        res.json(rows);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.post("/stake", async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 0.5) {
            return res.status(400).json({ error: "Minimum stake is 0.5 TON" });
        }
        const amountNano = toNano(String(amount));
        const client = getClient();
        const master = Address.parse(getMasterAddress());
        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        const body = beginCell()
            .storeUint(3203459332, 32)
            .storeCoins(amountNano)
            .endCell();

        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({ to: master, value: amountNano + toNano("0.1"), body, bounce: true })],
        });

        await logAiEvent("STAKE", `Staked ${amount} TON to contract`, { amount });

        res.json({ success: true, message: `Staked ${amount} TON to contract` });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.post("/unstake", async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: "Amount must be greater than 0" });
        }
        const amountNano = toNano(String(amount));
        const client = getClient();
        const master = Address.parse(getMasterAddress());
        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        const body = beginCell()
            .storeUint(4284693473, 32)
            .storeCoins(amountNano)
            .endCell();

        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({ to: master, value: toNano("0.1"), body, bounce: true })],
        });

        await logAiEvent("UNSTAKE", `Unstake of ${amount} TON requested`, { amount });

        res.json({ success: true, message: `Unstake of ${amount} TON requested` });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.post("/telegram-test", async (_req, res) => {
    try {
        const token = process.env.TG_BOT_TOKEN;
        const chatId = process.env.TG_CHAT_ID || getConfig().tgChatId;
        if (!token || !chatId) {
            return res.status(400).json({ error: "TG_CHAT_ID не настроен. Напишите /start боту в Telegram." });
        }
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: "🧠 *NeuroJetton Admin*: Test message from the AI Dashboard — all systems operational.",
            parse_mode: "Markdown",
        });
        await logAiEvent("TG_TEST", "Telegram test message sent from dashboard");
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});
