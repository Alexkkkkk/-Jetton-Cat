---
name: evolve() integer overflow fix
description: mutation_seed * CONTRACT_HASH_SEED overflows 257-bit signed int in TVM, causing exit code 4 on all evolve() callers
---

The contract's `evolve()` function had:
```
self.neural.mutation_seed = (self.neural.mutation_seed * CONTRACT_HASH_SEED % 1000000);
```
`CONTRACT_HASH_SEED = 93425221564777052312547156632767519476422384225883353702068648528814168237530`
`7 * HASH ≈ 5.67 × 2^256` which overflows 257-bit signed int (max ≈ 1 × 2^256) → TVM exit code 4.

**Fix applied in contracts/main.tact:**
```
self.neural.mutation_seed = (self.neural.mutation_seed * (CONTRACT_HASH_SEED % 1000000)) % 1000000;
```
`CONTRACT_HASH_SEED % 1000000 = 237530`. Max product ≤ 999999 × 237530 = 237,529,762,470 — safely within 257-bit.

**Why:** TVM's `*` operator does NOT do extended-precision multiply — overflow throws exit code 4. Tact does NOT optimize `a * b % c` to MULMOD automatically.

**How to apply:** Any time a Tact contract multiplies two large constants or a large constant by a state variable, ensure the intermediate product fits in 257-bit signed int (max ~1.16×10^77). Use `% smallMod` on constants before multiplying, or use `muldivr` if available.

**Impact:** ALL callers of evolve() (Stake, Unstake, NeuralCommand, CognitiveFeedback) failed with exit code 4. Only Mint (which skips evolve()) worked. Required contract redeployment.

**New contract address (mainnet):** EQB3MHn-evpJkzKW9H89yAVYsHF74YOcKVedaMzNbewj-VOQ
**Old broken address:** EQATi7SzUQv1Z_SlprfEarJ54_p6zoTQZX5WjeLZLysUC9KJ
