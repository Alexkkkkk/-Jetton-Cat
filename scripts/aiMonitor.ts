import { TonClient, Address, fromNano, beginCell, internal, WalletContractV4, toNano } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import "dotenv/config";
import axios from "axios";
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./contract_config.json', 'utf-8'));
const MASTER_ADDRESS = config.masterAddress || process.env.MASTER_ADDRESS;

const AI_AGENT = {
    log: (msg: string) => console.log(`[${new Date().toISOString()}] [AI-ORCHESTRATOR]: ${msg}`),

    notifyTelegram: async (msg: string) => {
        try {
            const url = `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`;
            await axios.post(url, {
                chat_id: process.env.TG_CHAT_ID,
                text: `🧠 *Neural-Governance Pulse*: ${msg}`,
                parse_mode: 'Markdown'
            });
        } catch (e) { AI_AGENT.log(`Telegram error: ${e}`); }
    },

    sendNeuralCommand: async (
        client: TonClient,
        master: Address,
        cmd: { entropyAdj: number; freeze: boolean }
    ) => {
        if (!process.env.OWNER_MNEMONIC) throw new Error("OWNER_MNEMONIC not set");

        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        // NeuralCommand opcode from compiled Tact output (jetton-cat_JettonMaster.ts)
        // Fields: market_entropy_adj (Int as 257), ai_bias_adjustment (Int as 257), emergency_freeze (Bool)
        const body = beginCell()
            .storeUint(2735106208, 32)
            .storeInt(cmd.entropyAdj, 257)
            .storeInt(0, 257)
            .storeBit(cmd.freeze)
            .endCell();

        AI_AGENT.log(`🚀 NeuralCommand: freeze=${cmd.freeze}, entropyAdj=${cmd.entropyAdj}`);

        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({ to: master, value: toNano("0.1"), body })]
        });
    },
};

async function run() {
    const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey: process.env.TONCENTER_API_KEY
    });
    const master = Address.parse(MASTER_ADDRESS);

    try {
        const res = await client.runMethod(master, "get_vital_signs");
        const apr          = res.stack.readNumber();
        const total_locked = res.stack.readBigNumber();
        const last_update  = res.stack.readNumber();
        const synapse_depth  = res.stack.readNumber();
        const liquidity_ratio = res.stack.readNumber();
        const health       = res.stack.readNumber(); // ai_risk_score

        AI_AGENT.log(`📊 Status: Health=${health}, Locked=${fromNano(total_locked)} TON, APR=${apr}`);

        // Skip sending any command when the contract is uninitialized (no stake yet).
        // health=0 + total_locked=0 is the fresh-deploy state, NOT an emergency.
        if (total_locked === 0n) {
            AI_AGENT.log("⏸ Contract uninitialized (no stake). Skipping command until funded.");
            return;
        }

        let entropyAdj = 0;
        let freeze = false;

        if (health < 100 || total_locked < toNano("5")) {
            freeze = true;
            entropyAdj = -50;
            await AI_AGENT.notifyTelegram(`🚨 *Emergency Freeze*: Health=${health}, Reserve=${fromNano(total_locked)} TON`);
        } else if (health < 500) {
            entropyAdj = -(500 - health) / 10;
        } else if (health > 800 && total_locked > toNano("20")) {
            entropyAdj = 10;
            await AI_AGENT.notifyTelegram(`✅ *System Healthy*: Health=${health}, Reserve=${fromNano(total_locked)} TON`);
        }

        await AI_AGENT.sendNeuralCommand(client, master, { entropyAdj, freeze });

    } catch (e: any) {
        AI_AGENT.log(`Cycle error: ${e.message}`);
    }
}

const cycle = async () => {
    await run();
    setTimeout(cycle, config.monitoring.check_interval_ms);
};

cycle();
