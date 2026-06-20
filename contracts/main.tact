import "@stdlib/deploy";
import "@stdlib/ownable";

// --- КОНСТАНТЫ ---
const DEV_ADDRESS: Address = address("UQDDgb2BTM-KCjntOoUg6uHllvnu3KGqEquKw6IySVP3hDgM");
const GAS_CONSUMPTION: Int = ton("0.1"); 

// --- СТРУКТУРЫ ---
struct JettonData { totalSupply: Int; mintable: Bool; adminAddress: Address; jettonContent: Cell; jettonWalletCode: Cell; }
struct WalletData { balance: Int; owner: Address; master: Address; walletCode: Cell; allowance: Int; }
struct DeFiParams { apr: Int; total_locked: Int; last_update: Int; liquidity_ratio: Int; }

// --- СООБЩЕНИЯ ---
message(0xf8c7a650) TokenTransfer { query_id: Int as uint64; amount: Int as coins; destination: Address; response_destination: Address; custom_payload: Cell?; forward_ton_amount: Int as coins; forward_payload: Slice as remaining; }
message(0x236874db) TokenTransferFrom { query_id: Int as uint64; amount: Int as coins; from: Address; destination: Address; response_destination: Address; custom_payload: Cell?; forward_ton_amount: Int as coins; forward_payload: Slice as remaining; }
message(0x178d4519) TokenTransferInternal { query_id: Int as uint64; amount: Int as coins; from: Address; response_destination: Address; forward_ton_amount: Int as coins; forward_payload: Slice as remaining; }
message(0x7362d09c) TokenNotification { query_id: Int as uint64; amount: Int as coins; from: Address; forward_payload: Slice as remaining; }
message(0x07678a32) TokenApprove { query_id: Int as uint64; address: Address; amount: Int as coins; }

message NeuralCommand { min_mint_ton: Int as coins; market_entropy_adj: Int; emergency_freeze: Bool; enable_arbitrage: Bool; ai_bias_adjustment: Int; }
message Buyback { amount: Int as coins; }
message Stake { amount: Int as coins; }
message Unstake { amount: Int as coins; } 
message Burn { amount: Int as coins; }
message WithdrawReserve { amount: Int as coins; }

// --- MASTER ---
contract JettonMaster with Ownable, Deployable {
    owner: Address;
    jetton_content: Cell;
    total_supply: Int as coins;
    total_staked: Int as coins = 0;
    reserve_fund: Int as coins = 0;
    defi: DeFiParams = DeFiParams{ apr: 500, total_locked: 0, last_update: now(), liquidity_ratio: 2000 };
    market_entropy: Int = 100;
    ai_bias: Int = 1000;
    is_frozen: Bool = false;
    arbitrage_enabled: Bool = false;

    init(owner: Address, content_url: String) {
        self.owner = owner;
        self.total_supply = 100000000000000000000;
        self.jetton_content = beginCell().storeUint(0, 8).storeSlice(content_url.asSlice()).endCell();
        let wallet_init = initOf JettonWallet(myAddress(), owner);
        send(SendParameters{ to: contractAddress(wallet_init), value: ton("0.2"), mode: 0, body: TokenTransferInternal{ query_id: 0, amount: self.total_supply, from: myAddress(), response_destination: owner, forward_ton_amount: 0, forward_payload: emptySlice() }.toCell(), code: wallet_init.code, data: wallet_init.data });
    }

    get fun get_wallet_address(owner_address: Address): Address { return contractAddress(initOf JettonWallet(myAddress(), owner_address)); }
    get fun get_jetton_data(): JettonData { return JettonData{ totalSupply: self.total_supply, mintable: false, adminAddress: self.owner, jettonContent: self.jetton_content, jettonWalletCode: (initOf JettonWallet(myAddress(), self.owner)).code }; }
    get fun get_defi_status(): DeFiParams { return self.defi; }

    receive(msg: NeuralCommand) { self.requireOwner(); self.market_entropy = max(0, min(1000, self.market_entropy + msg.market_entropy_adj)); self.is_frozen = msg.emergency_freeze; self.arbitrage_enabled = msg.enable_arbitrage; self.ai_bias = max(100, min(5000, self.ai_bias + msg.ai_bias_adjustment)); self.defi.apr = (self.ai_bias * (1000 - self.market_entropy)) / 1000; }
    receive(msg: Burn) { self.requireOwner(); require(self.total_supply >= msg.amount, "Supply overflow"); self.total_supply -= msg.amount; }
    receive(msg: WithdrawReserve) { self.requireOwner(); require(self.reserve_fund >= msg.amount, "Insufficient reserve"); self.reserve_fund -= msg.amount; send(SendParameters{ to: self.owner, value: msg.amount, mode: SendRemainingValue, bounce: false }); }
    receive(msg: Buyback) { require(self.arbitrage_enabled, "Arbitrage disabled"); self.requireOwner(); require(self.reserve_fund >= msg.amount, "Reserve insufficient"); self.total_supply -= msg.amount; self.reserve_fund -= msg.amount; }
    
    receive(msg: Stake) { 
        require(!self.is_frozen, "System Frozen"); 
        let ctx: Context = context(); 
        require(ctx.value >= ton("0.5"), "Min 0.5 TON"); 
        self.total_staked += msg.amount; 
        self.reserve_fund += ctx.value / 10; 
        self.defi.total_locked += ctx.value; 
    }
    
    receive(msg: Unstake) { 
        require(self.total_staked >= msg.amount, "Insufficient staked");
        self.total_staked -= msg.amount;
        self.defi.total_locked -= msg.amount; // ИСПРАВЛЕНО: вычитаем сумму токенов
        send(SendParameters{ to: sender(), value: 0, mode: SendRemainingValue, bounce: false }); 
    }
}

// --- WALLET ---
contract JettonWallet {
    balance: Int as coins = 0;
    allowance: Int as coins = 0;
    spender: Address? = null;
    owner: Address;
    master: Address;
    is_frozen: Bool = false;
    synapse_depth: Int = 100;
    max_transfer_limit: Int = ton("50000");
    last_interaction: Int;

    init(master: Address, owner: Address) { self.master = master; self.owner = owner; self.last_interaction = now(); }

    receive(msg: TokenTransfer) {
        require(!self.is_frozen, "Wallet is frozen");
        require(sender() == self.owner, "Access denied");
        require(self.balance >= msg.amount, "Insufficient balance");
        require(msg.amount <= self.max_transfer_limit, "Exceeds limit");
        self.perform_transfer(msg.amount, msg.destination, msg.response_destination, msg.forward_ton_amount, msg.forward_payload, msg.query_id);
    }

    receive(msg: TokenTransferFrom) {
        require(self.spender != null, "No spender allowed");
        require(sender() == self.spender!!, "Not allowed");
        require(self.allowance >= msg.amount, "Allowance exceeded");
        require(self.balance >= msg.amount, "Insufficient balance");
        self.allowance -= msg.amount;
        self.perform_transfer(msg.amount, msg.destination, msg.response_destination, msg.forward_ton_amount, msg.forward_payload, msg.query_id);
    }

    fun perform_transfer(amount: Int, dest: Address, resp: Address, fwd_ton: Int, fwd_payload: Slice, query_id: Int) {
        let fee = (amount * 4) / 1000;
        require(amount > fee, "Amount too small");
        require(fee > 0, "Fee too small");
        self.balance -= amount;
        
        send(SendParameters{ to: contractAddress(initOf JettonWallet(self.master, dest)), value: GAS_CONSUMPTION, mode: SendIgnoreErrors, bounce: true, body: TokenTransferInternal{ query_id: query_id, amount: amount - fee, from: self.owner, response_destination: resp, forward_ton_amount: fwd_ton, forward_payload: fwd_payload }.toCell() });
        send(SendParameters{ to: contractAddress(initOf JettonWallet(self.master, DEV_ADDRESS)), value: GAS_CONSUMPTION, mode: SendIgnoreErrors, body: TokenTransferInternal{ query_id: query_id, amount: fee, from: self.owner, response_destination: self.owner, forward_ton_amount: 0, forward_payload: emptySlice() }.toCell() });
        
        self.last_interaction = now();
    }

    receive(msg: TokenApprove) {
        require(sender() == self.owner, "Access denied");
        self.allowance = msg.amount;
        self.spender = msg.address;
    }

    receive(msg: TokenTransferInternal) { self.balance += msg.amount; if (msg.forward_ton_amount > 0) { send(SendParameters{ to: self.owner, value: msg.forward_ton_amount, mode: 1, body: TokenNotification{ query_id: msg.query_id, amount: msg.amount, from: msg.from, forward_payload: msg.forward_payload }.toCell() }); } }
    bounced(msg: Slice) { msg.loadUint(32); let op = msg.loadUint(32); if (op == 0x178d4519) { self.balance += msg.loadCoins(); } }
    
    receive("withdraw_yield") { require(sender() == self.owner, "Access denied"); let yield = self.get_pending_yield(); require(yield > 0, "No yield"); self.balance += yield; self.last_interaction = now(); }
    get fun get_pending_yield(): Int { let time_passed = now() - self.last_interaction; return (self.balance * time_passed * self.synapse_depth) / 31536000000; }
    get fun get_wallet_data(): WalletData { return WalletData{ balance: self.balance, owner: self.owner, master: self.master, walletCode: (initOf JettonWallet(self.master, self.owner)).code, allowance: self.allowance }; }
}
