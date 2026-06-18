import { TonClient, Address, fromNano } from "@ton/ton";
import { updateMarketConfig } from "../scripts/controller.js";
import "dotenv/config";
import axios from "axios";

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
        // 1. ПРОВЕРКА БАЛАНСА (Ликвидность)
        const balance = await client.getBalance(master);
        const balanceTON = parseFloat(fromNano(balance));
        AI_AGENT.log(`💰 Текущая ликвидность: ${balanceTON.toFixed(2)} TON`);

        if (balanceTON < 5.0) {
            await AI_AGENT.notifyTelegram(`⚠️ *НИЗКИЙ УРОВЕНЬ ЛИКВИДНОСТИ:* Осталось ${balanceTON.toFixed(2)} TON. Срочно пополните контракт!`);
        }

        // 2. АНАЛИЗ НЕЙРОСЕТИ (Контракт)
        const { stack } = await client.runMethod(master, "get_neural_report");
        const health = stack.readNumber();
        const stability = stack.readNumber();

        AI_AGENT.log(`📊 Статус: Здоровье=${health}, Стабильность=${stability}`);

        // 3. АВТОНОМНЫЕ РЕАКЦИИ
        if (health < 300) {
            AI_AGENT.log("🚨 Критическое состояние! Протокол 'Stabilization'...");
            await updateMarketConfig(15000, 100000000n, 500000000000n);
            await AI_AGENT.notifyTelegram(`🚨 *ПАДЕНИЕ:* Здоровье ${health}. Параметры рынка скорректированы.`);
        } 
        else if (health > 800) {
            AI_AGENT.log("📈 Рынок перегрет. Оптимизация.");
            await AI_AGENT.notifyTelegram(`✅ *Рынок стабилен:* Здоровье ${health}. Агент в режиме ожидания.`);
        }

    } catch (e: any) {
        AI_AGENT.log(`Ошибка: ${e.message}`);
        await AI_AGENT.notifyTelegram(`❌ *Критическая ошибка монитора:* ${e.message}`);
    }
}

// Запуск с защитой от наслоения (если цикл длится долго)
const cycle = async () => {
    await run();
    setTimeout(cycle, 60000); // 60 секунд задержки
};

AI_AGENT.log("Система мониторинга запущена.");
cycle();
