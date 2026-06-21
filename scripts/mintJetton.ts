import "dotenv/config";
import { TonClient, Address, beginCell, toNano, fromNano, WalletContractV4, internal } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { JettonMaster } from "../output/jetton-cat_JettonMaster";
import * as fs from "fs";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    // --- Config ---
    const cfg = JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));
    const masterAddress = Address.parse(cfg.masterAddress || process.env.MASTER_ADDRESS!);
    const network = cfg.network || "mainnet";

    const MINT_TO = process.env.MINT_TO;
    const MINT_AMOUNT = process.env.MINT_AMOUNT;

    if (!MINT_TO) {
        console.error("❌  MINT_TO env var is required (destination TON address)");
        console.error("    Example: MINT_TO=EQ... MINT_AMOUNT=1000 npx ts-node scripts/mintJetton.ts");
        process.exit(1);
    }
    if (!MINT_AMOUNT || isNaN(parseFloat(MINT_AMOUNT)) || parseFloat(MINT_AMOUNT) <= 0) {
        console.error("❌  MINT_AMOUNT env var is required (positive number, e.g. 1000)");
        process.exit(1);
    }
    if (!process.env.OWNER_MNEMONIC) {
        console.error("❌  OWNER_MNEMONIC env var is required");
        process.exit(1);
    }

    const destination = Address.parse(MINT_TO);
    const amount = toNano(MINT_AMOUNT);
    const amountHuman = parseFloat(MINT_AMOUNT).toLocaleString();

    // --- TON Client ---
    const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey: process.env.TONCENTER_API_KEY,
    });

    console.log(`\n🐱  NeuroJetton Mint`);
    console.log(`🌍  Network  : ${network.toUpperCase()}`);
    console.log(`📋  Master   : ${masterAddress.toString()}`);
    console.log(`📬  To       : ${destination.toString()}`);
    console.log(`💎  Amount   : ${amountHuman} PLSH\n`);

    // --- Resolve JettonWallet address ---
    console.log("⏳  Resolving JettonWallet address...");
    const master = client.open(JettonMaster.fromAddress(masterAddress));
    let walletAddress: Address;
    try {
        walletAddress = await master.getGetWalletAddress(destination);
    } catch (e: any) {
        console.error(`❌  get_wallet_address failed: ${e.message}`);
        process.exit(1);
    }
    console.log(`✅  JettonWallet : ${walletAddress.toString()}`);

    // --- Build wallet from mnemonic ---
    const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const walletContract = client.open(wallet);

    const balance = await walletContract.getBalance();
    console.log(`💰  Owner balance : ${fromNano(balance)} TON`);

    if (balance < toNano("0.1")) {
        console.error("❌  Insufficient TON balance (need at least 0.1 TON for gas)");
        process.exit(1);
    }

    // --- Build TokenTransferInternal (opcode 0x178d4519) ---
    const body = beginCell()
        .storeUint(0x178d4519, 32)
        .storeUint(BigInt(Date.now()), 64)
        .storeCoins(amount)
        .storeAddress(wallet.address)
        .storeAddress(wallet.address)
        .storeCoins(0n)
        .storeBit(0)
        .endCell();

    // --- Send with retry on rate-limit ---
    console.log("\n🚀  Sending mint transaction...");
    const seqno = await walletContract.getSeqno();

    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            await walletContract.sendTransfer({
                seqno,
                secretKey: keyPair.secretKey,
                messages: [internal({ to: walletAddress, value: toNano("0.05"), body, bounce: false })],
            });
            break;
        } catch (e: any) {
            const is429 = e?.message?.includes("429") || (e?.cause?.message || "").includes("429");
            if (is429 && attempt < 5) {
                const wait = attempt * 15000;
                console.log(`⚠️   Rate limit. Waiting ${wait / 1000}s... (${attempt}/5)`);
                await sleep(wait);
            } else {
                console.error(`❌  Transaction failed: ${e.message}`);
                process.exit(1);
            }
        }
    }

    const tonscan = `https://${network === "testnet" ? "testnet." : ""}tonscan.org/address/${walletAddress.toString()}`;

    console.log("\n✅  Mint transaction sent!");
    console.log("--------------------------------------------------");
    console.log(`💎  Amount    : ${amountHuman} PLSH`);
    console.log(`📬  Recipient : ${destination.toString()}`);
    console.log(`🏦  Wallet    : ${walletAddress.toString()}`);
    console.log(`🔗  TONScan   : ${tonscan}`);
    console.log("--------------------------------------------------");
    console.log("💡  Balance updates once confirmed (~5–15s on mainnet).");
}

main().catch(e => { console.error(e); process.exit(1); });
