import { toNano, beginCell } from '@ton/core';
import { JettonMaster } from '../wrappers/JettonMaster'; 
import { NetworkProvider } from '@ton/blueprint';
import * as fs from 'fs';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const sender = provider.sender();

    // 1. Конфигурация метаданных
    // Важно: эта ссылка должна указывать на RAW файл вашего metadata.json
    const metadataUrl = "https://raw.githubusercontent.com/Alexkkkkk/-Jetton-Cat/main/metadata.json";
    
    // Формируем контент согласно стандарту TEP-64 (off-chain)
    const content = beginCell()
        .storeUint(0, 8) // Префикс для URL (0x00)
        .storeStringTail(metadataUrl)
        .endCell();

    const deployValue = toNano('1.0'); // Рекомендуемый объем для Mainnet

    ui.write(`🌍 AI-Агент: Начинаю аудит для MAINNET...`);
    const balance = await provider.api().getBalance(sender.address!);
    ui.write(`💰 Текущий баланс: ${Number(balance)/1e9} TON`);
    
    if (balance < deployValue) {
        throw new Error(`🛑 Недостаточно средств! Нужно минимум 1.0 TON.`);
    }

    // 2. Инициализация контракта
    // Передаем owner (адрес кошелька деплоера) и сформированный content
    const jettonMaster = provider.open(JettonMaster.fromInit(sender.address!, content));

    // 3. Деплой
    try {
        ui.write(`🚀 ОТПРАВКА В MAINNET: ${jettonMaster.address.toString()}`);
        
        await jettonMaster.send(
            sender,
            { value: deployValue },
            {
                $$type: 'Deploy',
                queryId: BigInt(Date.now()),
            }
        );

        ui.write('⏳ Ожидание подтверждения в блокчейне...');
        await provider.waitForDeploy(jettonMaster.address);
    } catch (e) {
        ui.write(`❌ Ошибка при деплое: ${e}`);
        return;
    }
    
    // 4. Генерация манифеста
    const configData = {
        masterAddress: jettonMaster.address.toString(),
        metadataUrl: metadataUrl,
        owner: sender.address?.toString(),
        network: "mainnet",
        version: "2.0.0",
        last_updated: new Date().toISOString()
    };

    fs.writeFileSync('contract_config.json', JSON.stringify(configData, null, 4));

    // 5. Финальный отчет
    ui.clearActionPrompt();
    ui.write(`
✅ ДЕПЛОЙ В MAINNET УСПЕШЕН
--------------------------------------------------
💎 MASTER ADDRESS : ${jettonMaster.address.toString()}
⚙️ NETWORK        : MAINNET
🔗 TONSCAN        : https://tonscan.org/address/${jettonMaster.address.toString()}
--------------------------------------------------
💡 Файл contract_config.json успешно создан.
    `);
}
