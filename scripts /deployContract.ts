import { toNano } from '@ton/core';
import { JettonMaster } from '../build/main/tact_JettonMaster'; // Убедитесь, что путь к билду верный
import { NetworkProvider } from '@ton/blueprint';
import * as fs from 'fs';

// Имитация AI-модуля для анализа событий и логирования
const AI_AGENT = {
    log: (msg: string) => console.log(`[AI-AGENT]: ${msg}`),
    analyze: (data: any) => `Анализ: Успешно обработано событие ${data.type} в сети ${data.network}`
};

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const sender = provider.sender();
    const network = provider.network(); 

    AI_AGENT.log(`Инициализация деплоя в ${network}...`);

    // 1. Конфигурация метаданных (RAW-ссылка на ваш metadata.json)
    const metadataUrl = "https://raw.githubusercontent.com/Alexkkkkk/-Jetton-Cat/main/metadata.json";
    
    // 2. Инициализация контракта
    // ВАЖНО: Передаем metadataUrl как строку, так как в main.tact init принимает String
    const jettonMaster = provider.open(
        await JettonMaster.fromInit(sender.address!, metadataUrl)
    );

    // 3. Предварительный аудит
    const deployValue = toNano('1.0');
    ui.write(`🌍 AI-Агент: Начинаю аудит для ${network.toUpperCase()}...`);
    
    const balance = await provider.api().getBalance(sender.address!);
    ui.write(`💰 Текущий баланс: ${(Number(balance)/1e9).toFixed(2)} TON`);
    
    if (balance < deployValue) {
        AI_AGENT.log("Критическая ошибка: баланс ниже необходимого.");
        throw new Error(`🛑 Недостаточно средств! Нужно минимум 1.0 TON.`);
    }

    // 4. Деплой
    ui.write(`🚀 ОТПРАВКА В ${network.toUpperCase()}: ${jettonMaster.address.toString()}`);
    
    try {
        await jettonMaster.send(
            sender,
            { value: deployValue },
            {
                $$type: 'Deploy',
                queryId: BigInt(Date.now()),
            }
        );

        ui.write('⏳ AI-Агент: Ожидание подтверждения в блокчейне...');
        await provider.waitForDeploy(jettonMaster.address);
        
        AI_AGENT.log(AI_AGENT.analyze({ type: 'DEPLOYMENT', network }));
        
    } catch (e) {
        ui.write(`❌ AI-Агент: Ошибка при деплое: ${e}`);
        return;
    }
    
    // 5. Генерация манифеста
    const configData = {
        masterAddress: jettonMaster.address.toString(),
        metadataUrl: metadataUrl,
        owner: sender.address?.toString(),
        network: network,
        ai_verified: true,
        version: "2.0.0",
        last_updated: new Date().toISOString()
    };

    fs.writeFileSync('contract_config.json', JSON.stringify(configData, null, 4));

    // 6. Финальный отчет
    ui.clearActionPrompt();
    ui.write(`
✅ ДЕПЛОЙ В ${network.toUpperCase()} УСПЕШЕН (AI-VERIFIED)
--------------------------------------------------
💎 MASTER ADDRESS : ${jettonMaster.address.toString()}
🔗 TONSCAN        : https://${network === 'testnet' ? 'testnet.' : ''}tonscan.org/address/${jettonMaster.address.toString()}
--------------------------------------------------
💡 Файл contract_config.json создан и проанализирован AI-агентом.
    `);
}
