import axios from "axios";
import { TonClient, Address, fromNano, beginCell, internal, WalletContractV4, toNano } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import * as fs from "fs";
import { analyzeContract, logAiEvent, formatTelegramAnalysis } from "./aiEngine";

let pollingOffset = 0;
let isPolling = false;
let pollingTimer: ReturnType<typeof setTimeout> | null = null;

function getConfig() {
    try { return JSON.parse(fs.readFileSync("./contract_config.json", "utf-8")); }
    catch { return {}; }
}

function getTonClient() {
    return new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey: process.env.TONCENTER_API_KEY,
    });
}

async function tgCall(method: string, body: Record<string, any> = {}): Promise<any> {
    const token = process.env.TG_BOT_TOKEN!;
    const url = `https://api.telegram.org/bot${token}/${method}`;
    const r = await axios.post(url, body, { timeout: 35000 });
    return r.data;
}

async function sendMessage(chatId: number | string, text: string): Promise<void> {
    try {
        await tgCall("sendMessage", { chat_id: chatId, text, parse_mode: "Markdown" });
    } catch (e: any) {
        console.error("[TG-BOT] sendMessage error:", e.response?.data?.description || e.message);
    }
}

async function fetchVitals() {
    const config = getConfig();
    const masterAddr = config.masterAddress || process.env.MASTER_ADDRESS;
    if (!masterAddr) throw new Error("No master address configured");
    const client = getTonClient();
    const master = Address.parse(masterAddr);
    const state = await client.provider(master).getState();
    const balance = fromNano(state.balance);
    const r = await client.runMethod(master, "get_vital_signs");
    return {
        vitals: {
            apr: r.stack.readNumber(),
            total_locked: Number(r.stack.readBigNumber()),
            last_update: r.stack.readNumber(),
            synapse_depth: r.stack.readNumber(),
            liquidity_ratio: r.stack.readNumber(),
            health: r.stack.readNumber(),
        },
        balance,
        masterAddr,
    };
}

async function fetchNeural() {
    const config = getConfig();
    const masterAddr = config.masterAddress || process.env.MASTER_ADDRESS;
    if (!masterAddr) throw new Error("No master address configured");
    const client = getTonClient();
    const master = Address.parse(masterAddr);
    const r = await client.runMethod(master, "get_neural_profile");
    return {
        history_hash: r.stack.readBigNumber().toString(16).slice(0, 16),
        evolution_cycles: r.stack.readNumber(),
        threat_level: r.stack.readNumber(),
        policy_weight: r.stack.readNumber(),
        last_tx_time: r.stack.readNumber(),
        mutation_seed: r.stack.readNumber(),
        memory_bank: r.stack.readNumber(),
    };
}

async function sendNeuralCommand(freeze: boolean, entropyAdj: number) {
    if (!process.env.OWNER_MNEMONIC) throw new Error("OWNER_MNEMONIC not configured");
    const config = getConfig();
    const masterAddr = config.masterAddress || process.env.MASTER_ADDRESS;
    if (!masterAddr) throw new Error("No master address configured");
    const client = getTonClient();
    const master = Address.parse(masterAddr);
    const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC.split(" "));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const walletContract = client.open(wallet);
    const body = beginCell()
        .storeUint(2735106208, 32)
        .storeInt(entropyAdj, 257)
        .storeInt(0, 257)
        .storeBit(freeze)
        .endCell();
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [internal({ to: master, value: toNano("0.1"), body })],
    });
}

async function handleUpdate(update: any) {
    const msg = update.message;
    if (!msg?.text) return;

    const chatId = msg.chat.id;
    const text = (msg.text as string).trim();
    const cmd = text.split(" ")[0].toLowerCase().replace(/@.*$/, "");

    console.log(`[TG-BOT] Command: ${cmd} from chatId ${chatId}`);

    if (cmd === "/start") {
        await sendMessage(chatId, [
            "🐱 *NeuroJetton AI Bot — PLSH Neural Governance*",
            "",
            "Welcome to the autonomous AI organism command interface.",
            "",
            "Commands:",
            "/status — Contract vital signs",
            "/neural — Neural brain profile",
            "/ai — Full AI analysis & recommendations",
            "/freeze — Emergency freeze",
            "/unfreeze — Restore operations",
            "/contract — Contract address & info",
            "/help — Show all commands",
        ].join("\n"));
        return;
    }

    if (cmd === "/help") {
        await sendMessage(chatId, [
            "📋 *Available Commands*",
            "",
            "🔍 *Monitoring*",
            "/status — Vital signs (health, APR, locked)",
            "/neural — Neural profile (cycles, threat, memory)",
            "/ai — AI analysis with insights & recommendations",
            "/contract — Contract address & info",
            "",
            "⚙️ *Control*",
            "/freeze — Emergency freeze contract",
            "/unfreeze — Unfreeze contract",
            "/entropy [±N] — Adjust market entropy (e.g. /entropy -50)",
            "",
            "/help — This message",
        ].join("\n"));
        return;
    }

    if (cmd === "/status") {
        try {
            await sendMessage(chatId, "⏳ Fetching vital signs...");
            const { vitals, balance, masterAddr } = await fetchVitals();
            const healthEmoji = vitals.health >= 700 ? "🟢" : vitals.health >= 400 ? "🟡" : vitals.health >= 100 ? "🟠" : "🔴";
            const locked = (vitals.total_locked / 1e9).toFixed(3);
            await sendMessage(chatId, [
                `${healthEmoji} *Vital Signs*`,
                "",
                `*Health Score:* ${vitals.health}/1000`,
                `*APR:* ${vitals.apr}%`,
                `*Locked:* ${locked} TON`,
                `*Balance:* ${parseFloat(balance).toFixed(3)} TON`,
                `*Synapse Depth:* ${vitals.synapse_depth}`,
                `*Liquidity Ratio:* ${vitals.liquidity_ratio}`,
            ].join("\n"));
            await logAiEvent("TG_STATUS_CHECK", "Status checked via Telegram", { chatId, health: vitals.health });
        } catch (e: any) {
            await sendMessage(chatId, `❌ Error: ${e.message}`);
        }
        return;
    }

    if (cmd === "/neural") {
        try {
            await sendMessage(chatId, "⏳ Reading neural profile...");
            const neural = await fetchNeural();
            const secAgo = Math.floor(Date.now() / 1000) - neural.last_tx_time;
            const minAgo = Math.floor(secAgo / 60);
            await sendMessage(chatId, [
                "🧠 *Neural Brain Profile*",
                "",
                `*Evolution Cycles:* ${neural.evolution_cycles}`,
                `*Threat Level:* ${neural.threat_level}/100`,
                `*Policy Weight:* ${neural.policy_weight}`,
                `*Memory Bank:* ${neural.memory_bank}/100`,
                `*Mutation Seed:* ${neural.mutation_seed}`,
                `*Last Tx:* ${minAgo < 1 ? "< 1m ago" : `${minAgo}m ago`}`,
                `*History Hash:* \`${neural.history_hash}...\``,
            ].join("\n"));
        } catch (e: any) {
            await sendMessage(chatId, `❌ Error: ${e.message}`);
        }
        return;
    }

    if (cmd === "/ai") {
        try {
            await sendMessage(chatId, "🧠 Running AI analysis...");
            const { vitals } = await fetchVitals();
            const neural = await fetchNeural();
            const analysis = analyzeContract(vitals as any, neural, false);
            await sendMessage(chatId, formatTelegramAnalysis(analysis));
            await logAiEvent("TG_AI_ANALYSIS", "AI analysis via Telegram", { chatId, status: analysis.status });
        } catch (e: any) {
            await sendMessage(chatId, `❌ AI analysis error: ${e.message}`);
        }
        return;
    }

    if (cmd === "/freeze") {
        try {
            await sendMessage(chatId, "🔴 Sending emergency freeze command...");
            await sendNeuralCommand(true, -50);
            await sendMessage(chatId, "✅ *Emergency freeze sent!* Contract entering hibernation mode.");
            await logAiEvent("TG_FREEZE", "Emergency freeze via Telegram", { chatId });
        } catch (e: any) {
            await sendMessage(chatId, `❌ Freeze failed: ${e.message}`);
        }
        return;
    }

    if (cmd === "/unfreeze") {
        try {
            await sendMessage(chatId, "🟢 Sending unfreeze command...");
            await sendNeuralCommand(false, 0);
            await sendMessage(chatId, "✅ *Unfreeze command sent!* Contract resuming operations.");
            await logAiEvent("TG_UNFREEZE", "Unfreeze via Telegram", { chatId });
        } catch (e: any) {
            await sendMessage(chatId, `❌ Unfreeze failed: ${e.message}`);
        }
        return;
    }

    if (cmd === "/entropy") {
        const parts = text.split(" ");
        const val = parseInt(parts[1] || "0", 10);
        if (isNaN(val) || val < -500 || val > 500) {
            await sendMessage(chatId, "❌ Value must be between -500 and 500. Example: /entropy -50");
            return;
        }
        try {
            await sendMessage(chatId, `⚙️ Adjusting entropy by ${val}...`);
            await sendNeuralCommand(false, val);
            await sendMessage(chatId, `✅ Entropy adjusted by *${val}*`);
            await logAiEvent("TG_ENTROPY_ADJ", "Entropy adjusted via Telegram", { chatId, value: val });
        } catch (e: any) {
            await sendMessage(chatId, `❌ Error: ${e.message}`);
        }
        return;
    }

    if (cmd === "/contract") {
        const config = getConfig();
        const addr = config.masterAddress || process.env.MASTER_ADDRESS || "Not configured";
        await sendMessage(chatId, [
            "📋 *Contract Info*",
            "",
            `*Address:*\n\`${addr}\``,
            "",
            `*Network:* ${config.network || "mainnet"}`,
            `*Deployed:* ${config.deployed ? "✅ Yes" : "⏳ No"}`,
            `*TONScan:* https://tonscan.org/address/${addr}`,
        ].join("\n"));
        return;
    }
}

async function poll() {
    if (!isPolling) return;
    try {
        const r = await tgCall("getUpdates", {
            offset: pollingOffset,
            timeout: 25,
            allowed_updates: ["message"],
        });
        if (r.ok && r.result?.length) {
            for (const update of r.result) {
                pollingOffset = update.update_id + 1;
                handleUpdate(update).catch(e =>
                    console.error("[TG-BOT] Handler error:", e.message)
                );
            }
        }
    } catch (e: any) {
        const status = e.response?.status;
        if (status === 409) {
            console.log("[TG-BOT] Polling conflict (409) — another instance running. Retrying in 10s...");
            if (isPolling) pollingTimer = setTimeout(poll, 10000);
            return;
        }
        if (status === 429) {
            const retryAfter = (e.response?.data?.parameters?.retry_after || 5) * 1000;
            if (isPolling) pollingTimer = setTimeout(poll, retryAfter);
            return;
        }
        if (!e.message?.includes("ECONNRESET") && !e.message?.includes("timeout") && !e.message?.includes("aborted")) {
            console.error("[TG-BOT] Poll error:", e.message);
        }
    }

    if (isPolling) {
        pollingTimer = setTimeout(poll, 500);
    }
}

export function initTelegramBot(): void {
    const token = process.env.TG_BOT_TOKEN;
    if (!token) {
        console.log("[TG-BOT] TG_BOT_TOKEN not set — Telegram bot disabled");
        return;
    }
    isPolling = true;
    console.log("[TG-BOT] Telegram bot started (long-polling)");
    poll();
}

export async function sendTelegramAlert(message: string): Promise<void> {
    const chatId = process.env.TG_CHAT_ID;
    if (!process.env.TG_BOT_TOKEN || !chatId) return;
    await sendMessage(chatId, message);
}

export function stopBot(): void {
    isPolling = false;
    if (pollingTimer) {
        clearTimeout(pollingTimer);
        pollingTimer = null;
    }
}
