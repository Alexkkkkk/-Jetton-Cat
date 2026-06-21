import { Address, beginCell, toNano } from "@ton/core";
import { TonConnectUI } from "@tonconnect/ui";

const tonConnectUI = new TonConnectUI({ manifestUrl: 'https://your-domain.com/tonconnect-manifest.json' });

// Функция стейкинга через Web3 кошелек
export async function stakeTokens(amount: string) {
    const body = beginCell()
        .storeUint(0x40a3233c, 32) // Опкод метода Stake
        .storeCoins(toNano(amount))
        .endCell();

    await tonConnectUI.sendTransaction({
        messages: [{
            address: "EQDiH9R1w_hy7zMzs-FHNjLWkKGOjYV_SFTiLCTnONEI5f2c", // Адрес вашего контракта
            amount: toNano("0.5").toString(), // Газ + тело
            payload: body.toBoc().toString("base64")
        }]
    });
}
