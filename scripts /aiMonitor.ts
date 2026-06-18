import { TonClient, Address, fromNano, beginCell, internal, WalletContractV4 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import "dotenv/config";
import axios from "axios";
import * as fs from 'fs';

// Загружаем конфиг
const config = JSON.parse(fs.readFileSync('./contract_config.json', 'utf-8'));

const AI_AGENT = {
    log: (msg: string) => console.log(`[${new Date().toISOString()}] [AI-AGENT-MASTER]: ${msg}`),
    
    notifyTelegram: async (msg: string) => {
        try {
            const url = `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`;
            await axios.post(url, { 
                chat_id: process.env.TG_CHAT_ID, 
                text: `🤖 *AI-System Pulse*: ${msg}`, 
                parse_mode: 'Markdown' 
            });
        } catch (e) { AI_AGENT.log(`Ошибка Telegram: ${e}`); }
    },

    updateSmartConfig: async (client: TonClient, master: Address, newMinMint: bigint, isFrozen: boolean) => {
        if (!process.env.OWNER_MNEMONIC) throw new Error("OWNER_MNEMONIC не найден в .env!");
        
        const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC.split(" "));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);

        // Используем ID метода 0x6e656972 для SetConfig
        const body = beginCell()
            .storeUint(0x6e656972, 32) 
            .storeCoins(newMinMint)
            .storeBit(isFrozen)
            .endCell();
        
        AI_AGENT.log(`⚙️ Подписываю транзакцию: MinMint=${newMinMint}, Frozen=${isFrozen}`);
        
        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [ internal({ to: master, value: "0.05", body: body }) ]
        });
        AI_AGENT.log(`✅ Транзакция успешно отправлена.`);
    }
};

async function run() {
    const client = new TonClient({ 
        endpoint: "https://toncenter.com/api/v2/jsonRPC", 
        apiKey: process.env.TONCENTER_API_KEY 
    });
    const master = Address.parse(process.env.MASTER_ADDRESS!);

    try {
        // 1. АУДИТ ЛИКВИДНОСТИ
        const balance = await client.getBalance(master);
        const balanceTON = parseFloat(fromNano(balance));
        
        if (balanceTON < config.monitoring.liquidity_alert_threshold) {
            await AI_AGENT.notifyTelegram(`⚠️ *НИЗКИЙ БАЛАНС:* ${balanceTON.toFixed(2)} TON.`);
        }

        // 2. НЕЙРО-АНАЛИЗ
        const { stack } = await client.runMethod(master, "get_neural_report");
        const health = stack.readNumber();
        const stability = stack.readNumber();

        AI_AGENT.log(`📊 Статус: Здоровье=${health}, Стабильность=${stability}`);

        // 3. АВТОНОМНЫЕ РЕАКЦИИ (с использованием конфига)
        if (health < 100) {
            AI_AGENT.log("💀 Критическая фаза! Заморозка.");
            await AI_AGENT.updateSmartConfig(client, master, BigInt(config.blockchain_settings.min_mint_ton) * 10n, true);
            await AI_AGENT.notifyTelegram(`🛑 *ЗАМОРОЗКА:* Здоровье ${health}.`);
        } 
        else if (health < 300) {
            AI_AGENT.log("🚨 Активация защитного протокола.");
            await AI_AGENT.updateSmartConfig(client, master, BigInt(config.blockchain_settings.min_mint_ton), false);
            await AI_AGENT.notifyTelegram(`🚨 *ПАДЕНИЕ:* Здоровье ${health}. Параметры оптимизированы.`);
        }
        else if (health > config.ai_neural_parameters.entropy_threshold) {
            AI_AGENT.log("📈 Рынок перегрет. Режим стабилизации.");
            await AI_AGENT.notifyTelegram(`✅ *Стабильность:* Здоровье ${health}.`);
        }

    } catch (e: any) {
        AI_AGENT.log(`Ошибка цикла: ${e.message}`);
    }
}

const cycle = async () => {
    await run();
    setTimeout(cycle, config.monitoring.check_interval_ms);
};

AI_AGENT.log("Автономный AI-агент активирован.");
cycle();
