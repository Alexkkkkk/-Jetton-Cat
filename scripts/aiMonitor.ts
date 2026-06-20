import { TonClient, Address, fromNano, beginCell, internal, WalletContractV4, toNano } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import "dotenv/config";
import axios from "axios";
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./contract_config.json', 'utf-8'));

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
        } catch (e) { AI_AGENT.log(`Ошибка Telegram: ${e}`); }
    },

    sendNeuralCommand: async (client: TonClient, master: Address, cmd: { minMint: bigint, entropyAdj: number, freeze: boolean, enableArbitrage: boolean }) => {
        if (!process.env.OWNER_MNEMONIC) throw new Error("OWNER_MNEMONIC не найден!");
        
        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        const body = beginCell()
            .storeUint(0x4e455552, 32) 
            .storeCoins(cmd.minMint)
            .storeInt(cmd.entropyAdj, 32)
            .storeBit(cmd.freeze)
            .storeBit(cmd.enableArbitrage)
            .endCell();
        
        AI_AGENT.log(`🚀 Команда: Freeze=${cmd.freeze}, ArbEnabled=${cmd.enableArbitrage}, MinMint=${fromNano(cmd.minMint)}`);
        
        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [ internal({ to: master, value: toNano("0.05"), body: body }) ]
        });
    },

    sendArbitrageCommand: async (client: TonClient, master: Address, amount: bigint) => {
        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        const body = beginCell()
            .storeUint(0x42555942, 32)
            .storeCoins(amount)
            .endCell();
        
        AI_AGENT.log(`⚖️ Арбитраж: Исполнение Buyback на ${fromNano(amount)} TON`);
        
        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [ internal({ to: master, value: toNano("0.05"), body: body }) ]
        });
    }
};

async function run() {
    const client = new TonClient({ 
        endpoint: "https://toncenter.com/api/v2/jsonRPC", 
        apiKey: process.env.TONCENTER_API_KEY 
    });
    const master = Address.parse(process.env.MASTER_ADDRESS!);

    try {
        const res = await client.runMethod(master, "get_neural_report");
        const health = res.stack.readNumber();
        const reserve = res.stack.readBigNumber();

        AI_AGENT.log(`📊 Статус: Health=${health}, Reserve=${fromNano(reserve)} TON`);

        let targetMinMint = BigInt(config.blockchain_settings.min_mint_ton);
        let entropyAdj = 0;
        let freeze = false;
        
        let enableArbitrage = (health > 800 && reserve > toNano("20"));

        if (health < 100 || reserve < toNano("5")) {
            freeze = true;
            targetMinMint = toNano("20.0");
        } else if (health < 500) {
            targetMinMint += (BigInt(500 - health) * toNano("0.1"));
        }

        await AI_AGENT.sendNeuralCommand(client, master, { 
            minMint: targetMinMint, entropyAdj, freeze, enableArbitrage 
        });

        if (enableArbitrage) {
            await AI_AGENT.sendArbitrageCommand(client, master, reserve / 10n);
            await AI_AGENT.notifyTelegram(`⚖️ *Арбитраж*: Система перегрета. Запущен Buyback.`);
        }

    } catch (e: any) {
        AI_AGENT.log(`Ошибка цикла: ${e.message}`);
    }
}

const cycle = async () => {
    await run();
    setTimeout(cycle, config.monitoring.check_interval_ms);
};

cycle();
