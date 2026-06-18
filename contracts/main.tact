import "@stdlib/ownable";
import "@stdlib/deploy";

// --- Сообщения ---
message NeuralCommand {
    min_mint_ton: Int as coins;
    market_entropy_adj: Int; 
    emergency_freeze: Bool;
    enable_arbitrage: Bool; // <--- Новый параметр: включение арбитража
}

message Buyback { amount: Int as coins; }
message Stake { amount: Int as coins; }
message TokenTransfer { query_id: Int as uint64; amount: Int as coins; destination: Address; response_destination: Address; custom_payload: Cell?; forward_ton_amount: Int as coins; forward_payload: Slice as remaining; }
message TokenTransferInternal { query_id: Int as uint64; amount: Int as coins; from: Address; response_destination: Address; forward_ton_amount: Int as coins; forward_payload: Slice as remaining; }

// --- MASTER ---
contract JettonMaster with Ownable, Deployable {
    owner: Address;
    jetton_content: Cell;
    total_supply: Int as coins = 0;
    
    total_staked: Int as coins = 0;
    reserve_fund: Int as coins = 0;
    
    market_entropy: Int = 100;
    last_tick: Int = now();
    min_mint_ton: Int = 100_000_000; 
    is_frozen: Bool = false;
    arbitrage_enabled: Bool = false; // Состояние арбитража

    init(owner: Address, logo_url: String) {
        self.owner = owner;
        self.jetton_content = beginCell().storeUint(0, 8).storeStringTail(logo_url).endCell();
    }

    // --- УПРАВЛЕНИЕ ОТ ИИ ---
    receive(msg: NeuralCommand) {
        self.requireOwner();
        self.min_mint_ton = msg.min_mint_ton;
        self.market_entropy = max(0, min(1000, self.market_entropy + msg.market_entropy_adj));
        self.is_frozen = msg.emergency_freeze;
        self.arbitrage_enabled = msg.enable_arbitrage; // Обновляем переключатель
        emit("AI Neural Update Applied".asComment());
    }

    // --- АРБИТРАЖ (BUYBACK) ---
    receive(msg: Buyback) {
        require(self.arbitrage_enabled, "Arbitrage is disabled");
        self.requireOwner(); 
        require(self.reserve_fund >= msg.amount, "Reserve insufficient");
        
        // Сжигание для поддержания курса
        self.total_supply -= msg.amount;
        self.reserve_fund -= msg.amount;
        emit("Arbitrage Buyback Executed".asComment());
    }

    // --- DeFi МЕХАНИКА ---
    fun apply_defi_stabilizer(deposit: Int) {
        if (self.total_staked < toNano("1000")) {
            self.min_mint_ton += deposit / 50; 
        } else {
            self.min_mint_ton = max(toNano("0.1"), self.min_mint_ton - (deposit / 100));
        }
    }

    receive(msg: Stake) {
        require(!self.is_frozen, "System Frozen");
        let ctx: Context = context();
        require(ctx.value >= toNano("0.5"), "Minimum liquidity 0.5 TON");
        self.total_staked += msg.amount;
        self.reserve_fund += ctx.value / 10;
        emit("Liquidity Added".asComment());
    }

    receive() {
        require(!self.is_frozen, "System Frozen");
        let ctx: Context = context();
        require(ctx.value >= self.min_mint_ton, "Below min deposit");
        
        self.apply_defi_stabilizer(ctx.value);
        
        let time_delta: Int = max(1, now() - self.last_tick);
        self.market_entropy = min(1000, (self.market_entropy * 9 + (toNano("1") / time_delta)) / 10);
        self.last_tick = now();

        let rate: Int = max(50, 5000 - (self.market_entropy / 10));
        let amount_to_mint: Int = ctx.value * rate;
        self.total_supply += amount_to_mint;

        let wallet_init: StateInit = initOf JettonWallet(myAddress(), ctx.sender);
        send(SendParameters{
            to: contractAddress(wallet_init),
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: TokenTransferInternal{ query_id: 0, amount: amount_to_mint, from: myAddress(), response_destination: ctx.sender, forward_ton_amount: 0, forward_payload: emptySlice() }.toCell(),
            code: wallet_init.code,
            data: wallet_init.data
        });
    }
}

// --- WALLET ---
contract JettonWallet {
    balance: Int as coins = 0;
    owner: Address;
    master: Address;
    is_frozen: Bool = false;
    synapse_depth: Int = 100;
    last_interaction: Int = now();

    init(master: Address, owner: Address) {
        self.master = master;
        self.owner = owner;
    }

    receive(msg: NeuralCommand) {
        require(sender() == self.master, "Access denied");
        self.is_frozen = msg.emergency_freeze;
    }

    get fun get_pending_yield(): Int {
        let time_passed: Int = now() - self.last_interaction;
        return (self.balance * time_passed * self.synapse_depth) / 3153600000;
    }

    receive("withdraw_yield") {
        let yield: Int = self.get_pending_yield();
        require(yield > 0, "No yield available");
        self.balance += yield;
        self.last_interaction = now();
    }

    receive(msg: TokenTransfer) {
        require(!self.is_frozen, "Wallet is frozen");
        require(sender() == self.owner, "Access denied");
        
        self.synapse_depth = (msg.amount > toNano("1000")) ? max(0, self.synapse_depth - 10) : min(200, self.synapse_depth + 5);
        self.last_interaction = now(); 

        let tax: Int = (msg.amount / 100); 
        self.balance -= msg.amount;
    }
    
    receive(msg: TokenTransferInternal) { self.balance += msg.amount; }
    get fun get_neural_status(): Int { return self.synapse_depth; }
}
