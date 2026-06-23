import { TonClient, Address, fromNano, beginCell, internal, WalletContractV4, toNano } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import "dotenv/config";
import axios from "axios";
import * as fs from "fs";
import { analyzeContract, logAiEvent } from "../server/aiEngine";

const config = JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));
const MASTER_ADDRESS = config.masterAddress || process.env.MASTER_ADDRESS;

const AI_AGENT = {
    log: (msg: string) => console.log(`[${new Date().toISOString()}] [AI-ORCHESTRATOR]: ${msg}`),

    notifyTelegram: async (msg: string) => {
        try {
            const token = process.env.TG_BOT_TOKEN;
            const freshConfig = JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));
            const chatId = freshConfig.tgChatId || process.env.TG_CHAT_ID;
            if (!token || !chatId) {
                AI_AGENT.log("⚠️ Telegram: TG_CHAT_ID не настроен. Напишите /start боту в Telegram.");
                return;
            }
            await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                chat_id: chatId,
                text: `🧠 *Нейронный Импульс*: ${msg}`,
                parse_mode: "Markdown",
            });
        } catch (e: any) {
            const desc = e?.response?.data?.description || e?.message || String(e);
            AI_AGENT.log(`Telegram error: ${desc}`);
        }
    },

    sendNeuralCommand: async (
        client: TonClient,
        master: Address,
        cmd: { entropyAdj: number; freeze: boolean }
    ) => {
        if (!process.env.OWNER_MNEMONIC) {
            AI_AGENT.log("⚠️ OWNER_MNEMONIC not set — skipping neural command");
            return;
        }

        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        const MIN_BALANCE = toNano("0.08");
        const walletState = await client.provider(wallet.address).getState();
        if (walletState.balance < MIN_BALANCE) {
            AI_AGENT.log(`⚠️ Wallet balance too low (${fromNano(walletState.balance)} TON < 0.08 TON). Skipping.`);
            return;
        }

        const body = beginCell()
            .storeUint(2735106208, 32)
            .storeInt(cmd.entropyAdj, 257)
            .storeInt(0, 257)
            .storeBit(cmd.freeze)
            .endCell();

        AI_AGENT.log(`🚀 NeuralCommand: freeze=${cmd.freeze}, entropyAdj=${cmd.entropyAdj} (balance: ${fromNano(walletState.balance)} TON)`);

        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({ to: master, value: toNano("0.1"), body })],
        });
    },
};

async function run() {
    const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey: process.env.TONCENTER_API_KEY,
    });
    const master = Address.parse(MASTER_ADDRESS);

    try {
        const rv = await client.runMethod(master, "get_vital_signs");
        const vitals = {
            apr:            rv.stack.readNumber(),
            total_locked:   Number(rv.stack.readBigNumber()),
            last_update:    rv.stack.readNumber(),
            synapse_depth:  rv.stack.readNumber(),
            liquidity_ratio: rv.stack.readNumber(),
            health:         rv.stack.readNumber(),
        };

        let neural = { history_hash: "0", evolution_cycles: 0, threat_level: 0, policy_weight: 100, last_tx_time: vitals.last_update, mutation_seed: 7, memory_bank: 0 };
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
        } catch (_) {}

        AI_AGENT.log(`📊 Vitals: Health=${vitals.health}, Locked=${fromNano(vitals.total_locked)} TON, APR=${vitals.apr}, Cycles=${neural.evolution_cycles}, Threat=${neural.threat_level}`);

        if (vitals.total_locked === 0) {
            AI_AGENT.log("⏸ Contract uninitialized (no stake). Skipping command until funded.");
            await logAiEvent("MONITOR_IDLE", "Contract uninitialized — awaiting first stake");
            return;
        }

        const analysis = analyzeContract(vitals, neural, false);
        AI_AGENT.log(`🧠 AI Assessment: ${analysis.status} | Risk: ${analysis.riskLevel} | Autonomy: ${analysis.autonomyIndex}%`);

        await logAiEvent("MONITOR_CYCLE", analysis.summary, {
            status: analysis.status,
            health: vitals.health,
            apr: vitals.apr,
            locked: fromNano(vitals.total_locked),
            cycles: neural.evolution_cycles,
        });

        let entropyAdj = 0;
        let freeze = false;

        if (analysis.status === "CRITICAL") {
            freeze = true;
            entropyAdj = -50;
            const alertMsg = `🚨 *CRITICAL STATE*: Health=${vitals.health}, Reserve=${fromNano(vitals.total_locked)} TON\n${analysis.summary}`;
            AI_AGENT.log(alertMsg);
            await AI_AGENT.notifyTelegram(alertMsg);
            await logAiEvent("EMERGENCY_FREEZE_AUTO", "Auto-freeze triggered by AI monitor", { health: vitals.health });
        } else if (analysis.status === "WARNING") {
            entropyAdj = -Math.floor((500 - vitals.health) / 10);
            const alertMsg = `⚠️ *WARNING*: Health=${vitals.health}, applying entropyAdj=${entropyAdj}`;
            AI_AGENT.log(alertMsg);
            await AI_AGENT.notifyTelegram(alertMsg);
        } else if (analysis.status === "OPTIMAL" && vitals.total_locked > 20e9) {
            entropyAdj = 5;
            const alertMsg = `✅ *OPTIMAL*: Health=${vitals.health}, APR=${vitals.apr}%, Reserve=${fromNano(vitals.total_locked)} TON`;
            AI_AGENT.log(alertMsg);
            if (neural.evolution_cycles % 10 === 0) {
                await AI_AGENT.notifyTelegram(alertMsg);
            }
        }

        if (entropyAdj !== 0 || freeze) {
            await AI_AGENT.sendNeuralCommand(client, master, { entropyAdj, freeze });
        } else {
            AI_AGENT.log("✓ System nominal — no command needed this cycle");
        }

    } catch (e: any) {
        AI_AGENT.log(`Cycle error: ${e.message}`);
        await logAiEvent("MONITOR_ERROR", e.message).catch(() => {});
    }
}

const cycle = async () => {
    await run();
    setTimeout(cycle, config.monitoring.check_interval_ms || 60000);
};

cycle();
