import { Router } from "express";
import { TonClient, Address, fromNano, beginCell, internal, WalletContractV4, toNano } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { db } from "./db";
import { mintTransactions } from "../shared/models/auth";
import { desc } from "drizzle-orm";
import axios from "axios";
import * as fs from "fs";

function getMasterAddress(): string {
    const config = JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));
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
                health:         r.stack.readNumber(), // ai_risk_score
            };
        } catch (_) {
            contractStats = { error: "Contract not yet active (exit_code 11)" };
        }

        const configData = JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));

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

adminRoutes.post("/neural-command", async (req, res) => {
    try {
        const { freeze, entropyAdj = 0, biasAdj = 0 } = req.body;
        const client = getClient();
        const master = Address.parse(getMasterAddress());
        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        // NeuralCommand opcode from compiled Tact output (jetton-cat_JettonMaster.ts)
        // Fields: market_entropy_adj (Int as 257), ai_bias_adjustment (Int as 257), emergency_freeze (Bool)
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

        res.json({
            success: true,
            message: `Neural command sent: freeze=${freeze}, entropyAdj=${entropyAdj}, biasAdj=${biasAdj}`,
        });
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

        // Mint opcode from compiled Tact output (jetton-cat_JettonMaster.ts)
        // Fields: amount (coins), recipient (Address)
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

        // Stake opcode from compiled Tact output: 3203459332
        // Fields: amount (coins)
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

        // Unstake opcode from compiled Tact output: 4284693473
        // Fields: amount (coins)
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

        res.json({ success: true, message: `Unstake of ${amount} TON requested` });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.post("/telegram-test", async (_req, res) => {
    try {
        await axios.post(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
            chat_id: process.env.TG_CHAT_ID,
            text: "🧠 *Admin Panel*: Test message sent from NeuroJetton Admin Dashboard.",
            parse_mode: "Markdown",
        });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});
