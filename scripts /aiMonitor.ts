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

    sendNeuralCommand: async (client: TonClient, master: Address, cmd: { minMint: bigint, entropyAdj: number, freeze: boolean }) => {
        if (!process.env.OWNER_MNEMONIC) throw new Error("OWNER_MNEMONIC не найден!");
        
        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        // ID метода NeuralCommand: 0x4e455552
        const body = beginCell()
            .storeUint(0x4e455552, 32) 
            .storeCoins(cmd.minMint)
            .storeInt(cmd.entropyAdj, 32)
            .storeBit(cmd.freeze)
            .endCell();
        
        AI_AGENT.log(`🚀 Команда: Freeze=${cmd.freeze}, MinMint=${fromNano(cmd.minMint)}, EntropyAdj=${cmd.entropyAdj}`);
        
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
        // Получение глубокой аналитики контракта
        const res = await client.runMethod(master, "get_neural_report");
        const health = res.stack.readNumber();
        const totalStaked = res.stack.readBigNumber();
        const reserve = res.stack.readBigNumber();

        AI_AGENT.log(`📊 Статус: Health=${health}, Staked=${fromNano(totalStaked)} TON, Reserve=${fromNano(reserve)} TON`);

        // СУПЕР-УПРАВЛЕНИЕ: Логика ИИ-оркестратора
        let targetMinMint = BigInt(config.blockchain_settings.min_mint_ton);
        let entropyAdj = 0;
        let freeze = false;

        // 1. Аварийный режим (безопасность средств)
        if (health < 100 || reserve < toNano("5")) {
            freeze = true;
            targetMinMint = toNano("20.0"); // Высокий барьер
            entropyAdj = 100;
            await AI_AGENT.notifyTelegram(`🛑 *АВАРИЯ:* Здоровье ${health}. Система заморожена.`);
        } 
        // 2. Режим активной стабилизации (адаптивная кривая)
        else if (health < 500) {
            const deviation = BigInt(500 - health);
            targetMinMint += (deviation * toNano("0.1"));
            entropyAdj = 25;
            await AI_AGENT.notifyTelegram(`🚨 *КОРРЕКЦИЯ:* Здоровье ${health}. Регулировка экономики.`);
        } 
        // 3. Режим роста (оптимизация ликвидности)
        else {
            if (reserve > toNano("50")) {
                targetMinMint = targetMinMint / 2n; // Снижаем порог для привлечения новых средств
                entropyAdj = -10;
            }
        }

        await AI_AGENT.sendNeuralCommand(client, master, { 
            minMint: targetMinMint, 
            entropyAdj: entropyAdj, 
            freeze: freeze 
        });

    } catch (e: any) {
        AI_AGENT.log(`Ошибка цикла: ${e.message}`);
    }
}

const cycle = async () => {
    await run();
    setTimeout(cycle, config.monitoring.check_interval_ms);
};

AI_AGENT.log("ИИ-Оркестратор активирован и запущен.");
cycle();
