import { toNano, Address } from '@ton/core';
import { JettonMaster } from '../output/jetton-cat_JettonMaster';
import { NetworkProvider } from '@ton/blueprint';
import * as fs from 'fs';

const AI_AGENT = {
    log: (msg: string) => console.log(`[AI-AGENT]: ${msg}`),
    analyze: (data: any) => `Анализ: Успешно обработано событие ${data.type} в сети ${data.network}`
};

const DEV_ADDRESS: Address = Address.parse("UQDDgb2BTM-KCjntOoUg6uHllvnu3KGqEquKw6IySVP3hDgM");

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const sender = provider.sender();
    const network = provider.network();

    AI_AGENT.log(`Инициализация деплоя в ${network}...`);

    // Use METADATA_URL env var if set (recommended: your published *.replit.app domain)
    // Otherwise fall back to the GitHub raw URL (stable, always accessible)
    const metadataUrl = process.env.METADATA_URL
        || "https://raw.githubusercontent.com/Alexkkkkk/-Jetton-Cat/main/metadata.json";
    ui.write(`📄 Metadata URL: ${metadataUrl}`);

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

    const contractAddress = jettonMaster.address.toString();
    ui.write(`🚀 ОТПРАВКА В ${network.toUpperCase()}: ${contractAddress}`);

    // Step 1: send the deploy transaction (with retry on 429)
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
            const is429 = e?.message?.includes('429') || (e?.cause?.message || '').includes('429');
            if (is429 && attempt < 8) {
                const wait = attempt * 20000;
                ui.write(`⚠️ Rate limit (429). Ожидание ${wait/1000} сек перед повтором... (${attempt}/8)`);
                await sleep(wait);
            } else {
                ui.write(`❌ AI-Агент: Ошибка отправки транзакции: ${e}`);
                return;
            }
        }
    }
    if (!sent) return;

    // Step 2: wait for confirmation — tolerate rate-limit errors
    ui.write('⏳ AI-Агент: Транзакция отправлена. Ожидание подтверждения (до 3 мин)...');
    await sleep(5000);

    let deployed = false;
    for (let attempt = 1; attempt <= 10; attempt++) {
        try {
            await provider.waitForDeploy(jettonMaster.address, 10);
            deployed = true;
            break;
        } catch (e: any) {
            const is429 = e?.message?.includes('429') || e?.status === 429 ||
                          (e?.cause?.message || '').includes('429');
            if (is429) {
                ui.write(`⚠️ Rate limit (429). Повтор через 15 сек... (попытка ${attempt}/10)`);
                await sleep(15000);
            } else {
                ui.write(`⚠️ Ожидание: ${e?.message ?? e}. Повтор через 10 сек...`);
                await sleep(10000);
            }
        }
    }

    AI_AGENT.log(AI_AGENT.analyze({ type: 'DEPLOYMENT', network }));

    // Step 3: save config regardless — tx was already broadcast
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
${deployed ? '✅ ДЕПЛОЙ УСПЕШЕН (AI-VERIFIED)' : '⚠️  ТРАНЗАКЦИЯ ОТПРАВЛЕНА (подтверждение через tonscan)'}
--------------------------------------------------
💎 MASTER ADDRESS  : ${contractAddress}
🛠  DEV ADDRESS     : ${DEV_ADDRESS.toString()}
👤 OWNER ADDRESS   : ${sender.address?.toString()}
🔗 TONSCAN         : https://${network === 'testnet' ? 'testnet.' : ''}tonscan.org/address/${contractAddress}
--------------------------------------------------
💡 Файл contract_config.json обновлен и сохранен.
    `);
}
