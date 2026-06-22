import "dotenv/config";
import { TonClient, Address, toNano, WalletContractV4, internal, beginCell } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import * as fs from "fs";

async function main() {
    // 1. Загрузка конфигурации
    if (!fs.existsSync("./contract_config.json")) {
        console.error("❌ Ошибка: Файл contract_config.json не найден. Сначала выполните деплой.");
        process.exit(1);
    }
    const cfg = JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));
    const masterAddress = Address.parse(cfg.masterAddress || process.env.MASTER_ADDRESS!);

    const MINT_TO = process.env.MINT_TO;
    const MINT_AMOUNT = process.env.MINT_AMOUNT;

    if (!MINT_TO || !MINT_AMOUNT || !process.env.OWNER_MNEMONIC) {
        console.error("❌ Ошибка: Проверьте MINT_TO, MINT_AMOUNT и OWNER_MNEMONIC в .env");
        process.exit(1);
    }

    const destination = Address.parse(MINT_TO);
    const amount = toNano(MINT_AMOUNT);

    // 2. Подключение к сети
    const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey: process.env.TONCENTER_API_KEY,
    });

    const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const walletContract = client.open(wallet);
    
    // 3. Формирование сообщения Mint
    // 0x40316d9a — стандартный ID для сообщения Mint, сгенерированного Tact
    const body = beginCell()
        .storeUint(0x40316d9a, 32) // Opcode Mint
        .storeCoins(amount)         // Количество монет
        .storeAddress(destination)  // Адрес получателя
        .endCell();

    // 4. Отправка транзакции
    const seqno = await walletContract.getSeqno();
    console.log(`🚀 Выпуск ${MINT_AMOUNT} токенов на адрес ${destination.toString()}...`);
    console.log(`💼 Мастер-контракт: ${masterAddress.toString()}`);

    await walletContract.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
            internal({
                to: masterAddress,      // Шлем на Master-контракт
                value: toNano("0.2"),   // Газ для обработки минта
                body: body,
                bounce: true
            })
        ],
    });

    console.log("\n✅ Транзакция успешно отправлена в сеть!");
    console.log(`🔗 Отслеживание в TONSCAN: https://tonscan.org/address/${masterAddress.toString()}`);
}

main().catch((e) => {
    console.error("❌ Ошибка при выполнении минта:", e);
    process.exit(1);
});
