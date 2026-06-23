---
name: Mint receiver doesn't deploy recipient wallet
description: Deployed PLSH JettonMaster Mint bounces for fresh recipients; how to actually deliver tokens
---

The deployed PLSH (Jetton-Cat) JettonMaster `Mint` receiver computes the recipient's
JettonWallet address and sends it a `TokenTransferInternal` (opcode 0x178d4519) with
`value: ton("0.2"), mode: SendIgnoreErrors` **but without stateInit (code+data)**.

**Effect:** Minting to an address whose jetton wallet has never been deployed:
- increments `total_supply` (the `self.total_supply += msg.amount` runs), BUT
- the transfer message hits an uninit account, cannot be processed, and bounces back
  to the master (~full value returns). The recipient receives **nothing**.
So a "successful" mint can inflate supply while delivering zero tokens.

**Why it can't be fixed in place:** contract is live on mainnet; bytecode is immutable.

**How to actually deliver tokens (workaround used):** the JettonWallet
`TokenTransferInternal` receiver does `self.balance += msg.amount` with **no sender
check**. So send ONE internal message straight from the owner wallet to the computed
wallet address with BOTH `init` (stateInit from `JettonWallet.init(master, owner)` in
`output/jetton-cat_JettonWallet.ts`) AND a `TokenTransferInternal` body. That deploys
the wallet and credits the balance in one shot, without touching `total_supply` again.
~0.15 TON value covers deploy+storage. See `scripts/deliverMint.ts`.

**Gotcha:** owner wallet must hold > the message value; a plain Mint needs the master
to forward 0.2 TON, which it does from its own balance, so the owner only needs gas.

**Note on initial supply:** `init` sets `total_supply = 100000000000000000000` (10^20 =
100B PLSH at 9 decimals) but creates no wallet — that initial supply is a storage number
held by nobody.
