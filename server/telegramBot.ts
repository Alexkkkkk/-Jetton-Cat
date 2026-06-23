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

function saveChatId(chatId: number | string): void {
    try {
        const cfgPath = "./contract_config.json";
        const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
        if (String(cfg.tgChatId) !== String(chatId)) {
            cfg.tgChatId = String(chatId);
            fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 4));
            console.log(`[TG-BOT] Auto-saved chatId=${chatId} to contract_config.json`);
        }
    } catch (e: any) {
        console.error("[TG-BOT] Failed to save chatId:", e.message);
    }
}

async function handleUpdate(update: any) {
    const msg = update.message;
    if (!msg?.text) return;

    const chatId = msg.chat.id;
    const text = (msg.text as string).trim();
    const cmd = text.split(" ")[0].toLowerCase().replace(/@.*$/, "");

    console.log(`[TG-BOT] Command: ${cmd} from chatId ${chatId}`);

    if (cmd === "/start") {
        saveChatId(chatId);
        await sendMessage(chatId, [
            "🐱 *NeuroJetton AI — Нейронное Управление PLSH*",
            "",
            "Добро пожаловать в интерфейс управления автономным ИИ-организмом.",
            "",
            "Команды:",
            "/status — Показатели жизни контракта",
            "/neural — Профиль нейронного мозга",
            "/ai — Полный ИИ анализ и рекомендации",
            "/freeze — Экстренная заморозка",
            "/unfreeze — Возобновить операции",
            "/contract — Адрес контракта и инфо",
            "/help — Все команды",
        ].join("\n"));
        return;
    }

    if (cmd === "/help") {
        await sendMessage(chatId, [
            "📋 *Все команды*",
            "",
            "🔍 *Мониторинг*",
            "/status — Показатели жизни (здоровье, APR, залог)",
            "/neural — Нейронный профиль (циклы, угроза, память)",
            "/ai — ИИ анализ с инсайтами и рекомендациями",
            "/contract — Адрес контракта и инфо",
            "",
            "⚙️ *Управление*",
            "/freeze — Экстренная заморозка контракта",
            "/unfreeze — Разморозить контракт",
            "/entropy [±N] — Энтропия рынка (пример: /entropy -50)",
            "",
            "/help — Это сообщение",
        ].join("\n"));
        return;
    }

    if (cmd === "/status") {
        try {
            await sendMessage(chatId, "⏳ Получаю показатели жизни...");
            const { vitals, balance, masterAddr } = await fetchVitals();
            const healthEmoji = vitals.health >= 700 ? "🟢" : vitals.health >= 400 ? "🟡" : vitals.health >= 100 ? "🟠" : "🔴";
            const locked = (vitals.total_locked / 1e9).toFixed(3);
            await sendMessage(chatId, [
                `${healthEmoji} *Показатели жизни*`,
                "",
                `*Здоровье:* ${vitals.health}/1000`,
                `*APR:* ${vitals.apr}%`,
                `*Залог:* ${locked} TON`,
                `*Баланс кошелька:* ${parseFloat(balance).toFixed(3)} TON`,
                `*Глубина синапсов:* ${vitals.synapse_depth}`,
                `*Коэф. ликвидности:* ${vitals.liquidity_ratio}`,
            ].join("\n"));
            await logAiEvent("TG_STATUS_CHECK", "Статус проверен через Telegram", { chatId, health: vitals.health });
        } catch (e: any) {
            await sendMessage(chatId, `❌ Ошибка: ${e.message}`);
        }
        return;
    }

    if (cmd === "/neural") {
        try {
            await sendMessage(chatId, "⏳ Читаю нейронный профиль...");
            const neural = await fetchNeural();
            const secAgo = Math.floor(Date.now() / 1000) - neural.last_tx_time;
            const minAgo = Math.floor(secAgo / 60);
            await sendMessage(chatId, [
                "🧠 *Профиль нейронного мозга*",
                "",
                `*Циклы эволюции:* ${neural.evolution_cycles}`,
                `*Уровень угрозы:* ${neural.threat_level}/100`,
                `*Вес политики:* ${neural.policy_weight}`,
                `*Банк памяти:* ${neural.memory_bank}/100`,
                `*Мутационный сид:* ${neural.mutation_seed}`,
                `*Последняя тх:* ${minAgo < 1 ? "< 1 мин назад" : `${minAgo} мин назад`}`,
                `*Хэш истории:* \`${neural.history_hash}...\``,
            ].join("\n"));
        } catch (e: any) {
            await sendMessage(chatId, `❌ Ошибка: ${e.message}`);
        }
        return;
    }

    if (cmd === "/ai") {
        try {
            await sendMessage(chatId, "🧠 Запускаю ИИ анализ...");
            const { vitals } = await fetchVitals();
            const neural = await fetchNeural();
            const analysis = analyzeContract(vitals as any, neural, false);
            await sendMessage(chatId, formatTelegramAnalysis(analysis));
            await logAiEvent("TG_AI_ANALYSIS", "ИИ анализ через Telegram", { chatId, status: analysis.status });
        } catch (e: any) {
            await sendMessage(chatId, `❌ Ошибка ИИ анализа: ${e.message}`);
        }
        return;
    }

    if (cmd === "/freeze") {
        try {
            await sendMessage(chatId, "🔴 Отправляю команду экстренной заморозки...");
            await sendNeuralCommand(true, -50);
            await sendMessage(chatId, "✅ *Заморозка отправлена!* Контракт входит в режим гибернации.");
            await logAiEvent("TG_FREEZE", "Экстренная заморозка через Telegram", { chatId });
        } catch (e: any) {
            await sendMessage(chatId, `❌ Ошибка заморозки: ${e.message}`);
        }
        return;
    }

    if (cmd === "/unfreeze") {
        try {
            await sendMessage(chatId, "🟢 Отправляю команду разморозки...");
            await sendNeuralCommand(false, 0);
            await sendMessage(chatId, "✅ *Команда разморозки отправлена!* Контракт возобновляет операции.");
            await logAiEvent("TG_UNFREEZE", "Разморозка через Telegram", { chatId });
        } catch (e: any) {
            await sendMessage(chatId, `❌ Ошибка разморозки: ${e.message}`);
        }
        return;
    }

    if (cmd === "/entropy") {
        const parts = text.split(" ");
        const val = parseInt(parts[1] || "0", 10);
        if (isNaN(val) || val < -500 || val > 500) {
            await sendMessage(chatId, "❌ Значение должно быть от -500 до 500. Пример: /entropy -50");
            return;
        }
        try {
            await sendMessage(chatId, `⚙️ Регулирую энтропию на ${val}...`);
            await sendNeuralCommand(false, val);
            await sendMessage(chatId, `✅ Энтропия изменена на *${val}*`);
            await logAiEvent("TG_ENTROPY_ADJ", "Энтропия изменена через Telegram", { chatId, value: val });
        } catch (e: any) {
            await sendMessage(chatId, `❌ Ошибка: ${e.message}`);
        }
        return;
    }

    if (cmd === "/contract") {
        const config = getConfig();
        const addr = config.masterAddress || process.env.MASTER_ADDRESS || "Не настроен";
        await sendMessage(chatId, [
            "📋 *Информация о контракте*",
            "",
            `*Адрес:*\n\`${addr}\``,
            "",
            `*Сеть:* ${config.network || "mainnet"}`,
            `*Задеплоен:* ${config.deployed ? "✅ Да" : "⏳ Нет"}`,
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
    const chatId = process.env.TG_CHAT_ID || getConfig().tgChatId;
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
