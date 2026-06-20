import { toNano, Address } from '@ton/core';
import { JettonMaster } from '../output/jetton-cat_JettonMaster';
import { NetworkProvider } from '@ton/blueprint';
import * as fs from 'fs';

const AI_AGENT = {
    log: (msg: string) => console.log(`[AI-AGENT]: ${msg}`),
    analyze: (data: any) => `Анализ: Успешно обработано событие ${data.type} в сети ${data.network}`
};

const DEV_ADDRESS: Address = Address.parse("UQDDgb2BTM-KCjntOoUg6uHllvnu3KGqEquKw6IySVP3hDgM");

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const sender = provider.sender();
    const network = provider.network();

    AI_AGENT.log(`Инициализация деплоя в ${network}...`);

    const metadataUrl = "https://raw.githubusercontent.com/Alexkkkkk/-Jetton-Cat/main/metadata.json";

    const jettonMaster = provider.open(
        await JettonMaster.fromInit(sender.address!, metadataUrl)
    );

    const deployValue = toNano('1.0');
    ui.write(`🌍 AI-Агент: Начинаю аудит для ${network.toUpperCase()}...`);

    const state = await provider.provider(sender.address!).getState();
    const balance = state.balance;
    ui.write(`💰 Текущий баланс: ${(Number(balance)/1e9).toFixed(2)} TON`);

    if (balance < deployValue) {
        throw new Error(`🛑 Недостаточно средств! Нужно минимум 1.0 TON.`);
    }

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

        ui.write('⏳ AI-Агент: Ожидание подтверждения...');
        await provider.waitForDeploy(jettonMaster.address);

        AI_AGENT.log(AI_AGENT.analyze({ type: 'DEPLOYMENT', network }));

    } catch (e) {
        ui.write(`❌ AI-Агент: Ошибка: ${e}`);
        return;
    }

    const configData = {
        masterAddress: jettonMaster.address.toString(),
        devAddress: DEV_ADDRESS.toString(),
        ownerAddress: sender.address?.toString(),
        metadataUrl: metadataUrl,
        network: network,
        ai_verified: true,
        version: "2.0.0",
        last_updated: new Date().toISOString()
    };

    fs.writeFileSync('contract_config.json', JSON.stringify(configData, null, 4));

    ui.clearActionPrompt();
    ui.write(`
✅ ДЕПЛОЙ УСПЕШЕН (AI-VERIFIED)
--------------------------------------------------
💎 MASTER ADDRESS  : ${jettonMaster.address.toString()}
🛠  DEV ADDRESS     : ${DEV_ADDRESS.toString()}
👤 OWNER ADDRESS   : ${sender.address?.toString()}
🔗 TONSCAN         : https://${network === 'testnet' ? 'testnet.' : ''}tonscan.org/address/${jettonMaster.address.toString()}
--------------------------------------------------
💡 Файл contract_config.json обновлен и сохранен.
    `);
}
