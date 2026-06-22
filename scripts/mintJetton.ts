import "dotenv/config";
import { TonClient, Address, toNano, WalletContractV4, internal, beginCell } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { JettonMaster } from "../output/jetton-cat_JettonMaster";
import * as fs from "fs";

async function main() {
    // --- Конфигурация ---
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

    // --- Подключение ---
    const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey: process.env.TONCENTER_API_KEY,
    });

    const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const walletContract = client.open(wallet);
    
    // --- Создание сообщения для МИНТА ---
    // Мы используем структуру, которую ожидает контракт JettonMaster
    // Так как сообщение Mint определено в Tact, мы создаем его через его класс
    const body = beginCell()
        .storeUint(0x40316d9a, 32) // ID сообщения Mint (вычисляется Tact автоматически)
        .storeCoins(amount)         // amount
        .storeAddress(destination)  // recipient
        .endCell();

    // --- Отправка на MASTER контракт ---
    const seqno = await walletContract.getSeqno();
    console.log(`🚀 Минтим ${MINT_AMOUNT} токенов на ${destination.toString()}...`);

    await walletContract.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
            internal({
                to: masterAddress,      // ВАЖНО: Шлем на Master!
                value: toNano("0.2"),   // Газ на выполнение минта (с запасом)
                body: body,
                bounce: true
            })
        ],
    });

    console.log("\n✅ Транзакция минта отправлена!");
    console.log(`🔗 Отслеживание мастера: https://tonscan.org/address/${masterAddress.toString()}`);
}

main().catch(console.error);
