import { Router } from "express";
import { TonClient, Address, fromNano, beginCell, internal, WalletContractV4, toNano } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { JettonMaster } from "../output/jetton-cat_JettonMaster";
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
                apr: r.stack.readNumber(),
                total_locked: fromNano(r.stack.readBigNumber()),
                last_update: r.stack.readNumber(),
                synapse_depth: r.stack.readNumber(),
                liquidity_ratio: r.stack.readNumber(),
                health: r.stack.readNumber(),
            };
        } catch (_) {
            contractStats = { error: "Contract not yet active (exit_code 11)" };
        }

        const configData = JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));

        res.json({
            masterAddress: process.env.MASTER_ADDRESS,
            balance,
            network: process.env.NETWORK_TYPE || "mainnet",
            contractStats,
            config: configData,
            tonscanUrl: `https://tonscan.org/address/${process.env.MASTER_ADDRESS}`,
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.post("/neural-command", async (req, res) => {
    try {
        const { freeze, enableArbitrage, minMint } = req.body;
        const client = getClient();
        const master = Address.parse(getMasterAddress());
        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        const body = beginCell()
            .storeUint(0x4e455552, 32)
            .storeCoins(toNano(String(minMint || "0.1")))
            .storeInt(0, 32)
            .storeBit(!!freeze)
            .storeBit(!!enableArbitrage)
            .endCell();

        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({ to: master, value: toNano("0.05"), body })],
        });

        res.json({ success: true, message: `Neural command sent: freeze=${freeze}, arbitrage=${enableArbitrage}` });
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

        // Resolve the JettonWallet address via on-chain getter
        const master = client.open(JettonMaster.fromAddress(masterAddress));
        const walletAddress = await master.getGetWalletAddress(destAddress);

        // Build TokenTransferInternal (opcode 0x178d4519)
        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        const body = beginCell()
            .storeUint(0x178d4519, 32)
            .storeUint(BigInt(Date.now()), 64)
            .storeCoins(amountNano)
            .storeAddress(wallet.address)
            .storeAddress(wallet.address)
            .storeCoins(0n)
            .storeBit(0)
            .endCell();

        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({ to: walletAddress, value: toNano("0.05"), body, bounce: false })],
        });

        res.json({ success: true, walletAddress: walletAddress.toString() });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRoutes.post("/telegram-test", async (_req, res) => {
    try {
        await axios.post(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
            chat_id: process.env.TG_CHAT_ID,
            text: "🧠 *Admin Panel*: Тестовое сообщение отправлено из Replit Admin Dashboard.",
            parse_mode: "Markdown",
        });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});
