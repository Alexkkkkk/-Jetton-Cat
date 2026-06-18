import { TonClient, Address, fromNano, beginCell, internal, storeMessageRelaxed } from "@ton/ton";
import "dotenv/config";
import axios from "axios";

// Настройки Агента
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
        } catch (e) { console.error("Ошибка Telegram:", e); }
    },
    // Функция отправки команды изменения конфига в смарт-контракт
    updateSmartConfig: async (client: TonClient, master: Address, newMinMint: bigint, isFrozen: boolean) => {
        const body = beginCell()
            .storeUint(0x6e656972, 32) // ID метода SetConfig (убедитесь в ABI)
            .storeCoins(newMinMint)
            .storeBit(isFrozen)
            .endCell();
        
        AI_AGENT.log(`⚙️ Применяю новые настройки: MinMint=${newMinMint}, Frozen=${isFrozen}`);
        // Здесь вызов метода деплоя или отправки транзакции через ваш wallet/controller
    }
};

async function run() {
    const client = new TonClient({ 
        endpoint: "https://toncenter.com/api/v2/jsonRPC", 
        apiKey: process.env.TONCENTER_API_KEY 
    });
    const master = Address.parse(process.env.MASTER_ADDRESS!);

    AI_AGENT.log("Начинаю цикл глубокого аудита...");

    try {
        // 1. ПРОВЕРКА ЛИКВИДНОСТИ
        const balance = await client.getBalance(master);
        const balanceTON = parseFloat(fromNano(balance));
        
        if (balanceTON < 5.0) {
            await AI_AGENT.notifyTelegram(`⚠️ *НИЗКИЙ БАЛАНС:* ${balanceTON.toFixed(2)} TON.`);
        }

        // 2. АНАЛИЗ НЕЙРО-ОТЧЕТА
        const { stack } = await client.runMethod(master, "get_neural_report");
        const health = stack.readNumber();
        const stability = stack.readNumber();

        AI_AGENT.log(`📊 Статус: Здоровье=${health}, Стабильность=${stability}`);

        // 3. АВТОНОМНЫЕ РЕАКЦИИ
        if (health < 300) {
            AI_AGENT.log("🚨 Критический уровень! Активирую защитный режим.");
            await AI_AGENT.updateSmartConfig(client, master, 500_000_000n, false);
            await AI_AGENT.notifyTelegram(`🚨 *ПАДЕНИЕ:* Здоровье ${health}. Параметры обновлены ИИ.`);
        } 
        else if (health < 100) {
            AI_AGENT.log("💀 Экстренная заморозка контракта!");
            await AI_AGENT.updateSmartConfig(client, master, 1_000_000_000n, true);
            await AI_AGENT.notifyTelegram(`🛑 *ЗАМОРОЗКА:* Здоровье ${health}. Контракт остановлен.`);
        }
        else if (health > 800) {
            AI_AGENT.log("📈 Рынок перегрет. Нормализация.");
            await AI_AGENT.notifyTelegram(`✅ *Рынок стабилен:* Здоровье ${health}.`);
        }

    } catch (e: any) {
        AI_AGENT.log(`Ошибка: ${e.message}`);
        await AI_AGENT.notifyTelegram(`❌ *Критическая ошибка монитора:* ${e.message}`);
    }
}

// Рекурсивный цикл для 24/7 работы
const cycle = async () => {
    await run();
    setTimeout(cycle, 60000);
};

AI_AGENT.log("Система мониторинга запущена.");
cycle();
