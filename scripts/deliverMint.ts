import { TonClient, Address, toNano, fromNano, WalletContractV4, internal, beginCell, contractAddress } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import * as fs from "fs";
import { JettonWallet, storeTokenTransferInternal } from "../output/jetton-cat_JettonWallet";

async function main() {
    const cfg = JSON.parse(fs.readFileSync("./contract_config.json", "utf-8"));
    const masterAddress = Address.parse(cfg.masterAddress);
    const devAddress = Address.parse("UQDDgb2BTM-KCjntOoUg6uHllvnu3KGqEquKw6IySVP3hDgM");
    const amount = 100000000000000000000n; // 100B PLSH (raw, 9 decimals) — matches the already-incremented total_supply

    const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey: process.env.TONCENTER_API_KEY,
    });

    const init = await JettonWallet.init(masterAddress, devAddress);
    const wAddr = contractAddress(0, init);
    console.log("Computed jetton wallet address:", wAddr.toString());

    const expected = "EQCtyOCA6elyzCr_c7idM-6qN37XCG2GUpNxaRoZKPLxpUPg";
    if (wAddr.toString() !== expected) {
        console.error("ADDRESS MISMATCH! Expected", expected, "got", wAddr.toString(), "- ABORTING");
        process.exit(1);
    }
    console.log("Address matches master-computed wallet. Proceeding.");

    const body = beginCell();
    storeTokenTransferInternal({
        $$type: "TokenTransferInternal",
        query_id: 0n,
        amount,
        from: masterAddress,
        response_destination: devAddress,
        forward_ton_amount: 0n,
        forward_payload: beginCell().endCell().asSlice(),
    })(body);

    const keyPair = await mnemonicToPrivateKey(process.env.OWNER_MNEMONIC!.split(" "));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const wc = client.open(wallet);

    console.log("Owner balance:", fromNano(await wc.getBalance()), "TON");

    const seqno = await wc.getSeqno();
    await wc.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
            internal({
                to: wAddr,
                value: toNano("0.15"),
                init: { code: init.code, data: init.data },
                body: body.endCell(),
                bounce: false,
            }),
        ],
    });

    console.log("✅ Deploy + credit message sent. Seqno:", seqno);
    console.log("Delivering", amount.toString(), "raw =", (Number(amount) / 1e9).toLocaleString(), "PLSH to", devAddress.toString());
}

main().catch((e) => { console.error("ERROR:", e); process.exit(1); });
