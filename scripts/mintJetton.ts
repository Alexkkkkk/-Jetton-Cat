import "dotenv/config";
import { TonClient, Address, beginCell, toNano, fromNano, WalletContractV4, internal } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { JettonMaster } from "../output/jetton-cat_JettonMaster";
import { JettonWallet } from "../output/jetton-cat_JettonWallet";
import * as fs from "fs";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    // --- Конфигурация ---
    const cfg = JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));
    const masterAddress = Address.parse(cfg.masterAddress || process.env.MASTER_ADDRESS!);
    const network = cfg.network || "mainnet";

    const MINT_TO = process.env.MINT_TO;
    const MINT_AMOUNT = process.env.MINT_AMOUNT;

    if (!MINT_TO || !MINT_AMOUNT || !process.env.OWNER_MNEMONIC) {
        console.error("❌ Ошибка: Проверьте MINT_TO, MINT_AMOUNT и OWNER_MNEMONIC в .env");
        process.exit(1);
    }

    const destination = Address.parse(MINT_TO);
    const amount = toNano(MINT_AMOUNT);

    // --- TON Client ---
    const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey: process.env.TONCENTER_API_KEY,
    });

    console.log(`\n🐱 NeuroJetton Minting to ${destination.toString()}...`);

    // --- Подготовка ---
    const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const walletContract = client.open(wallet);
    
    // Получаем адрес кошелька через Master (стандарт TEP-74)
    const master = client.open(JettonMaster.fromAddress(masterAddress));
    const jettonWalletAddress = await master.getGetWalletAddress(destination);

    // --- Создание сообщения (Opcode 0x178d4519 - Transfer) ---
    // ВАЖНО: Мы отправляем запрос на Master, чтобы тот выпустил/перевел токены
    const body = beginCell()
        .storeUint(0xf8c7a650, 32) // Opcode: TokenTransfer
        .storeUint(0, 64)          // query_id
        .storeCoins(amount)
        .storeAddress(destination) // destination
        .storeAddress(wallet.address) // response_destination
        .storeBit(0)               // custom_payload
        .storeCoins(toNano("0.05"))// forward_ton_amount
        .storeBit(0)               // forward_payload (пустой)
        .endCell();

    // --- Отправка транзакции ---
    const seqno = await walletContract.getSeqno();
    console.log(`🚀 Отправка транзакции с seqno: ${seqno}`);

    await walletContract.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
            internal({
                to: jettonWalletAddress,
                value: toNano("0.1"), // Газ на выполнение
                body: body,
                bounce: true
            })
        ],
    });

    console.log("\n✅ Транзакция отправлена!");
    console.log(`🔗 Отслеживание: https://tonscan.org/address/${jettonWalletAddress.toString()}`);
}

main().catch(console.error);
