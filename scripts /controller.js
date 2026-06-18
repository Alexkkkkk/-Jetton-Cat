import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { beginCell, toNano } from "@ton/core";
import "dotenv/config";

// --- AI АГЕНТ: ИНТЕЛЛЕКТУАЛЬНЫЙ МОДУЛЬ УПРАВЛЕНИЯ ---
const AI_AGENT = {
    log: (msg: string) => console.log(`[AI-AGENT]: ${msg}`),
    analyzeError: (err: any) => {
        if (err.message.includes('429')) return "Превышен лимит запросов RPC. Рекомендую использовать платный API-ключ.";
        if (err.message.includes('Insufficient')) return "Недостаточно средств на балансе для оплаты газа.";
        return "Непредвиденная ошибка в логике контракта.";
    }
};

// Подключение к сети через API
const client = new TonClient({ 
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
    apiKey: process.env.TONCENTER_API_KEY // Убедитесь, что ключ в .env
});

/**
 * Обновление рыночной конфигурации (курс, лимиты)
 */
export async function updateMarketConfig(rateMultiplier: number, minPurchase: bigint, maxPurchase: bigint) {
    try {
        AI_AGENT.log("Анализ параметров: начинаю обновление конфигурации рынка...");
        
        const mnemonic = process.env.MNEMONIC!;
        const key = await mnemonicToPrivateKey(mnemonic.split(" "));
        const wallet = client.open(WalletContractV4.create({ workchain: 0, publicKey: key.publicKey }));
        
        const seqno = await wallet.getSeqno();
        
        // ВАЖНО: Хэши OpCode должны соответствовать вашему контракту (.abi.json)
        const body = beginCell()
            .storeUint(0x2d17c767, 32) 
            .storeUint(BigInt(rateMultiplier), 64)
            .storeCoins(minPurchase)
            .storeCoins(maxPurchase)
            .endCell();

        await wallet.sendTransfer({
            seqno, secretKey: key.secretKey,
            messages: [internal({ to: process.env.MASTER_ADDRESS!, value: toNano("0.05"), body })]
        });

        AI_AGENT.log("Транзакция отправлена в блокчейн. Ожидаю финализацию...");
        return await waitForConfirmation(wallet, seqno);
    } catch (error: any) {
        AI_AGENT.log(`Критическая ошибка: ${AI_AGENT.analyzeError(error)}`);
        throw error;
    }
}

/**
 * Смена статуса кошелька (блокировка)
 */
export async function changeWalletStatus(walletAddress: string, blocked: boolean) {
    try {
        AI_AGENT.log(`Инициирую проверку статуса для: ${walletAddress}`);
        
        const key = await mnemonicToPrivateKey(process.env.MNEMONIC!.split(" "));
        const wallet = client.open(WalletContractV4.create({ workchain: 0, publicKey: key.publicKey }));
        const seqno = await wallet.getSeqno();

        const body = beginCell()
            .storeUint(0x45a9fd9e, 32) 
            .storeBit(blocked)
            .endCell();

        await wallet.sendTransfer({
            seqno, secretKey: key.secretKey,
            messages: [internal({ to: walletAddress, value: toNano("0.03"), body })]
        });

        return await waitForConfirmation(wallet, seqno);
    } catch (error: any) {
        AI_AGENT.log(`Ошибка смены статуса: ${error.message}`);
        throw error;
    }
}

/**
 * Мониторинг транзакций с AI-агентом
 */
async function waitForConfirmation(walletContract: any, startSeqno: number) {
    for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const nextSeqno = await walletContract.getSeqno();
        if (nextSeqno > startSeqno) {
            AI_AGENT.log("Транзакция успешно подтверждена!");
            return true;
        }
    }
    AI_AGENT.log("⚠️ Ошибка: Транзакция не получила подтверждения за 45 секунд.");
    throw new Error("Транзакция не подтверждена блокчейном.");
}

// АВТО-ЗАПУСК для тестов
if (process.argv[1]?.endsWith('controller.js')) {
    AI_AGENT.log("Запуск тестовой сессии...");
    updateMarketConfig(12000, toNano("0.1"), toNano("1000")).catch(console.error);
}
