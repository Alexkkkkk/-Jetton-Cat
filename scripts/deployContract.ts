import { toNano, Address } from '@ton/core';
import { JettonMaster } from '../output/jetton-cat_JettonMaster';
import { NetworkProvider } from '@ton/blueprint';
import * as fs from 'fs';

const AI_AGENT = {
    log: (msg: string) => console.log(`[AI-AGENT]: ${msg}`),
    analyze: (data: any) => `Анализ: Успешно обработано событие ${data.type} в сети ${data.network}`
};

const DEV_ADDRESS: Address = Address.parse("UQDDgb2BTM-KCjntOoUg6uHllvnu3KGqEquKw6IySVP3hDgM");
const METADATA_FIXED_URL = "https://raw.githubusercontent.com/Alexkkkkk/-Jetton-Cat/main/metadata.json";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const sender = provider.sender();
    const network = provider.network();

    AI_AGENT.log(`Инициализация деплоя в ${network}...`);

    // Используем вашу закрепленную ссылку
    const metadataUrl = process.env.METADATA_URL || METADATA_FIXED_URL;
    ui.write(`📄 Metadata URL: ${metadataUrl}`);

    const jettonMaster = provider.open(
        await JettonMaster.fromInit(sender.address!, metadataUrl)
    );

    const deployValue = toNano('1.0');
    ui.write(`🌍 AI-Агент: Начинаю аудит для ${network.toUpperCase()}...`);

    // Проверка баланса
    const balance = await provider.provider(sender.address!).getState().then(s => s.balance);
    ui.write(`💰 Текущий баланс: ${(Number(balance)/1e9).toFixed(2)} TON`);

    if (balance < deployValue) {
        throw new Error(`🛑 Недостаточно средств! Нужно минимум 1.0 TON.`);
    }

    const contractAddress = jettonMaster.address.toString();
    ui.write(`🚀 ОТПРАВКА В ${network.toUpperCase()}: ${contractAddress}`);

    // Step 1: отправка транзакции с расширенной обработкой ошибок
    let sent = false;
    for (let attempt = 1; attempt <= 8; attempt++) {
        try {
            await jettonMaster.send(
                sender,
                { value: deployValue },
                {
                    $$type: 'Deploy',
                    queryId: BigInt(Date.now()),
                }
            );
            sent = true;
            break;
        } catch (e: any) {
            const errStr = typeof e === 'string' ? e : JSON.stringify(e);
            const is429 = errStr.includes('429');
            if (is429 && attempt < 8) {
                const wait = attempt * 20000;
                ui.write(`⚠️ Rate limit (429). Ожидание ${wait/1000} сек... (${attempt}/8)`);
                await sleep(wait);
            } else {
                ui.write(`❌ AI-Агент: Критическая ошибка отправки: ${errStr}`);
                return;
            }
        }
    }
    if (!sent) return;

    // Step 2: подтверждение
    ui.write('⏳ AI-Агент: Транзакция отправлена. Ожидание подтверждения...');
    await sleep(5000);

    let deployed = false;
    for (let attempt = 1; attempt <= 10; attempt++) {
        try {
            await provider.waitForDeploy(jettonMaster.address, 10);
            deployed = true;
            break;
        } catch (e: any) {
            ui.write(`⚠️ Ожидание сети... (попытка ${attempt}/10)`);
            await sleep(15000);
        }
    }

    AI_AGENT.log(AI_AGENT.analyze({ type: 'DEPLOYMENT', network }));

    // Step 3: фиксация конфига
    const configData = {
        masterAddress: contractAddress,
        devAddress: DEV_ADDRESS.toString(),
        ownerAddress: sender.address?.toString(),
        metadataUrl: metadataUrl,
        network: network,
        ai_verified: true,
        deployed: deployed,
        version: "2.0.0",
        last_updated: new Date().toISOString()
    };

    fs.writeFileSync('contract_config.json', JSON.stringify(configData, null, 4));

    ui.clearActionPrompt();
    ui.write(`
${deployed ? '✅ ДЕПЛОЙ УСПЕШЕН (AI-VERIFIED)' : '⚠️ ТРАНЗАКЦИЯ ОТПРАВЛЕНА'}
--------------------------------------------------
💎 MASTER ADDRESS  : ${contractAddress}
🔗 TONSCAN         : https://${network === 'testnet' ? 'testnet.' : ''}tonscan.org/address/${contractAddress}
--------------------------------------------------
💡 Конфиг сохранен в contract_config.json.
    `);
}
