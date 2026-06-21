import "dotenv/config";
import { TonClient, WalletContractV4, toNano, internal, Address } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { beginCell } from "@ton/core";
import { JettonMaster } from "../output/jetton-cat_JettonMaster";
import * as fs from "fs";

async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

async function main() {
    if (!process.env.OWNER_MNEMONIC) throw new Error("OWNER_MNEMONIC not set");
    if (!process.env.TONCENTER_API_KEY) throw new Error("TONCENTER_API_KEY not set");

    const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey: process.env.TONCENTER_API_KEY,
    });

    const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC.split(" "));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const walletContract = client.open(wallet);
    const ownerAddr = wallet.address;

    const metadataUrl = "https://raw.githubusercontent.com/Alexkkkkk/-Jetton-Cat/main/metadata.json";

    console.log("Owner wallet :", ownerAddr.toString());

    const state = await client.provider(ownerAddr).getState();
    const balance = Number(state.balance) / 1e9;
    console.log("Balance      :", balance.toFixed(2), "TON");

    if (state.balance < toNano("1.0")) {
        throw new Error(`Insufficient balance! Need >= 1.0 TON, have ${balance.toFixed(2)}`);
    }

    const jettonMaster = client.open(await JettonMaster.fromInit(ownerAddr, metadataUrl));
    const contractAddr = jettonMaster.address;
    console.log("Contract addr:", contractAddr.toString());

    const contractState = await client.provider(contractAddr).getState();
    if (contractState.state.type === "active") {
        console.log("✅ Contract already deployed and active!");
        console.log("TONSCAN:", `https://tonscan.org/address/${contractAddr.toString()}`);
        saveConfig(contractAddr, ownerAddr);
        return;
    }

    console.log("Deploying...");
    const deployBody = beginCell()
        .storeUint(2490013878, 32)
        .storeUint(BigInt(Date.now()), 64)
        .endCell();

    const init = jettonMaster.init;
    const seqno = await walletContract.getSeqno();

    await walletContract.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
            internal({
                to: contractAddr,
                value: toNano("1.0"),
                init: init ?? undefined,
                body: deployBody,
                bounce: false,
            }),
        ],
    });

    console.log("Transaction sent! Polling for activation...");
    for (let i = 1; i <= 20; i++) {
        await sleep(6000);
        try {
            const s = await client.provider(contractAddr).getState();
            if (s.state.type === "active") {
                console.log("\n✅ DEPLOY SUCCESSFUL!");
                console.log("MASTER ADDRESS:", contractAddr.toString());
                console.log("TONSCAN       :", `https://tonscan.org/address/${contractAddr.toString()}`);
                saveConfig(contractAddr, ownerAddr);
                return;
            }
            process.stdout.write(`\r⏳ Attempt ${i}/20...`);
        } catch (e: any) {
            process.stdout.write(`\r⏳ Attempt ${i}/20 (${e.message.slice(0, 40)})...`);
        }
    }

    console.log("\n⚠️  Broadcast sent — check tonscan:");
    console.log(`https://tonscan.org/address/${contractAddr.toString()}`);
    saveConfig(contractAddr, ownerAddr);
}

function saveConfig(contractAddr: Address, ownerAddr: Address) {
    const existing = JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));
    const updated = {
        ...existing,
        masterAddress: contractAddr.toString(),
        ownerAddress: ownerAddr.toString(),
        network: "mainnet",
        deployed: true,
        last_updated: new Date().toISOString(),
    };
    fs.writeFileSync("./contract_config.json", JSON.stringify(updated, null, 4));
    console.log("contract_config.json updated ✓");
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
