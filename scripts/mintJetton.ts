import { toNano, Address, beginCell, fromNano } from '@ton/core';
import { JettonMaster } from '../output/jetton-cat_JettonMaster';
import { NetworkProvider } from '@ton/blueprint';
import * as fs from 'fs';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const sender = provider.sender();
    const network = provider.network();

    // --- Load master address ---
    let masterAddress: Address;
    try {
        const cfg = JSON.parse(fs.readFileSync('./contract_config.json', 'utf-8'));
        const addr = cfg.masterAddress || process.env.MASTER_ADDRESS;
        if (!addr) throw new Error('No masterAddress found');
        masterAddress = Address.parse(addr);
    } catch (e: any) {
        ui.write(`❌ Could not read masterAddress: ${e.message}`);
        ui.write('💡 Make sure contract_config.json exists and the contract is deployed.');
        return;
    }

    ui.write(`\n🐱 NeuroJetton Mint Tool`);
    ui.write(`🌍 Network  : ${network.toUpperCase()}`);
    ui.write(`📋 Master   : ${masterAddress.toString()}`);
    ui.write(`🔗 TONScan  : https://${network === 'testnet' ? 'testnet.' : ''}tonscan.org/address/${masterAddress.toString()}\n`);

    // --- Prompt: destination address ---
    const destRaw = await ui.input('📬 Destination wallet address (who receives the tokens):');
    let destination: Address;
    try {
        destination = Address.parse(destRaw.trim());
    } catch {
        ui.write('❌ Invalid address format. Aborting.');
        return;
    }

    // --- Prompt: amount ---
    const amountRaw = await ui.input('💎 Amount of PLSH tokens to mint (e.g. 1000):');
    const amountNum = parseFloat(amountRaw.trim());
    if (isNaN(amountNum) || amountNum <= 0) {
        ui.write('❌ Invalid amount. Aborting.');
        return;
    }
    // Jetton uses 9 decimals (TON nano convention)
    const amount = toNano(amountRaw.trim());

    // --- Resolve JettonWallet address via master getter ---
    ui.write('\n⏳ Resolving JettonWallet address...');
    const master = provider.open(JettonMaster.fromAddress(masterAddress));

    let walletAddress: Address;
    try {
        walletAddress = await master.getGetWalletAddress(destination);
    } catch (e: any) {
        ui.write(`❌ Failed to call get_wallet_address: ${e.message}`);
        ui.write('💡 The contract may not be active on this network yet.');
        return;
    }

    ui.write(`✅ JettonWallet : ${walletAddress.toString()}`);
    ui.write(`💰 Minting      : ${amountNum.toLocaleString()} PLSH → ${destination.toString()}\n`);

    // --- Confirm ---
    const confirm = await ui.input('Proceed? (yes / no):');
    if (confirm.trim().toLowerCase() !== 'yes') {
        ui.write('🚫 Aborted by user.');
        return;
    }

    // --- Build TokenTransferInternal cell (opcode 0x178d4519) ---
    // message(0x178d4519) TokenTransferInternal {
    //   query_id: uint64; amount: coins; from: Address;
    //   response_destination: Address; forward_ton_amount: coins; forward_payload: Slice as remaining;
    // }
    const queryId = BigInt(Date.now());
    const body = beginCell()
        .storeUint(0x178d4519, 32)
        .storeUint(queryId, 64)
        .storeCoins(amount)
        .storeAddress(sender.address!)
        .storeAddress(sender.address!)   // response_destination = sender (excess TON back)
        .storeCoins(0n)                  // forward_ton_amount
        .storeBit(0)                     // forward_payload empty
        .endCell();

    // --- Send transaction ---
    ui.write('🚀 Sending mint transaction...');
    const GAS = toNano('0.05');

    let sent = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            await sender.send({
                to: walletAddress,
                value: GAS,
                body,
                bounce: false,
            });
            sent = true;
            break;
        } catch (e: any) {
            const is429 = e?.message?.includes('429') || (e?.cause?.message || '').includes('429');
            if (is429 && attempt < 5) {
                const wait = attempt * 15000;
                ui.write(`⚠️ Rate limit (429). Waiting ${wait / 1000}s before retry... (${attempt}/5)`);
                await sleep(wait);
            } else {
                ui.write(`❌ Transaction failed: ${e.message}`);
                return;
            }
        }
    }

    if (!sent) return;

    ui.write('\n✅ Mint transaction sent!');
    ui.write('--------------------------------------------------');
    ui.write(`💎 Amount       : ${amountNum.toLocaleString()} PLSH`);
    ui.write(`📬 Recipient    : ${destination.toString()}`);
    ui.write(`🏦 Wallet       : ${walletAddress.toString()}`);
    ui.write(`🔗 TONScan      : https://${network === 'testnet' ? 'testnet.' : ''}tonscan.org/address/${walletAddress.toString()}`);
    ui.write('--------------------------------------------------');
    ui.write('💡 The wallet balance will update once the tx is confirmed (usually ~5-15s).');
}
