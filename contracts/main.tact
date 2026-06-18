import "@stdlib/deploy";
import "@stdlib/ownable";

// --- Структуры для соответствия стандартам ---
struct JettonData {
    totalSupply: Int;
    mintable: Bool;
    adminAddress: Address;
    jettonContent: Cell;
    jettonWalletCode: Cell;
}

struct WalletData {
    balance: Int;
    owner: Address;
    master: Address;
    walletCode: Cell;
}

// --- Сообщения ---
message NeuralCommand {
    min_mint_ton: Int as coins;
    market_entropy_adj: Int; 
    emergency_freeze: Bool;
    enable_arbitrage: Bool;
    ai_bias_adjustment: Int; 
}

message Buyback { amount: Int as coins; }
message Stake { amount: Int as coins; }

message TokenTransfer { 
    query_id: Int as uint64; 
    amount: Int as coins; 
    destination: Address; 
    response_destination: Address; 
    custom_payload: Cell?; 
    forward_ton_amount: Int as coins; 
    forward_payload: Slice as remaining; 
}

message TokenTransferInternal { 
    query_id: Int as uint64; 
    amount: Int as coins; 
    from: Address; 
    response_destination: Address; 
    forward_ton_amount: Int as coins; 
    forward_payload: Slice as remaining; 
}

message TokenNotification {
    query_id: Int as uint64;
    amount: Int as coins;
    from: Address;
    forward_payload: Slice as remaining;
}

// --- MASTER ---
contract JettonMaster with Ownable, Deployable {
    owner: Address;
    jetton_content: Cell;
    total_supply: Int as coins = 0;
    total_staked: Int as coins = 0;
    reserve_fund: Int as coins = 0;
    
    market_entropy: Int = 100;
    ai_bias: Int = 1000; 
    last_tick: Int = now();
    min_mint_ton: Int = 100_000_000; 
    is_frozen: Bool = false;
    arbitrage_enabled: Bool = false;

    init(owner: Address, logo_url: String) {
        self.owner = owner;
        // Исправлено: используем .asSlice() для корректной записи строки
        self.jetton_content = beginCell().storeUint(0, 8).storeSlice(logo_url.asSlice()).endCell();
    }

    get fun get_jetton_data(): JettonData {
        let wallet_code: Cell = (initOf JettonWallet(myAddress(), self.owner)).code;
        return JettonData{
            totalSupply: self.total_supply,
            mintable: false,
            adminAddress: self.owner,
            jettonContent: self.jetton_content,
            jettonWalletCode: wallet_code
        };
    }

    receive(msg: NeuralCommand) {
        self.requireOwner();
        self.min_mint_ton = msg.min_mint_ton;
        self.market_entropy = max(0, min(1000, self.market_entropy + msg.market_entropy_adj));
        self.is_frozen = msg.emergency_freeze;
        self.arbitrage_enabled = msg.enable_arbitrage;
        self.ai_bias = max(100, min(5000, self.ai_bias + msg.ai_bias_adjustment)); 
        emit("AI Neural Core Updated".asComment());
    }

    receive(msg: Buyback) {
        require(self.arbitrage_enabled, "Arbitrage disabled by AI");
        self.requireOwner(); 
        require(self.reserve_fund >= msg.amount, "Reserve insufficient");
        self.total_supply -= msg.amount;
        self.reserve_fund -= msg.amount;
        emit("Arbitrage Buyback Executed".asComment());
    }

    receive(msg: Stake) {
        require(!self.is_frozen, "System Frozen");
        let ctx: Context = context();
        require(ctx.value >= ton("0.5"), "Minimum liquidity 0.5 TON");
        self.total_staked += msg.amount;
        self.reserve_fund += ctx.value / 10;
    }

    receive() {
        require(!self.is_frozen, "System Frozen");
        let ctx: Context = context();
        require(ctx.value >= self.min_mint_ton, "Below min deposit");
        
        let time_delta: Int = max(1, now() - self.last_tick);
        self.market_entropy = min(1000, (self.market_entropy * 9 + (ton("1") / time_delta)) / 10);
        self.last_tick = now();

        let rate: Int = (self.ai_bias * 5) - (self.market_entropy / 10);
        let amount_to_mint: Int = ctx.value * max(50, rate);
        self.total_supply += amount_to_mint;

        let wallet_init: StateInit = initOf JettonWallet(myAddress(), ctx.sender);
        send(SendParameters{
            to: contractAddress(wallet_init),
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: TokenTransferInternal{ 
                query_id: 0, 
                amount: amount_to_mint, 
                from: myAddress(), 
                response_destination: ctx.sender, 
                forward_ton_amount: 0, 
                forward_payload: emptySlice() 
            }.toCell(),
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

    get fun get_wallet_data(): WalletData {
        let code: Cell = (initOf JettonWallet(self.master, self.owner)).code;
        return WalletData{
            balance: self.balance,
            owner: self.owner,
            master: self.master,
            walletCode: code
        };
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
        require(self.balance >= msg.amount, "Insufficient balance");
        
        self.synapse_depth = (msg.amount > ton("1000")) ? max(10, self.synapse_depth - 10) : min(200, self.synapse_depth + 5);
        self.last_interaction = now(); 
        self.balance -= msg.amount;

        let wallet_init: StateInit = initOf JettonWallet(self.master, msg.destination);
        let gas_for_transfer: Int = ton("0.1"); 
        require(context().value > gas_for_transfer, "Insufficient gas for transfer");

        send(SendParameters{
            to: contractAddress(wallet_init),
            value: gas_for_transfer,
            mode: SendPayGasSeparately,
            bounce: true,
            body: TokenTransferInternal{ 
                query_id: msg.query_id, 
                amount: msg.amount, 
                from: self.owner, 
                response_destination: msg.response_destination, 
                forward_ton_amount: msg.forward_ton_amount, 
                forward_payload: msg.forward_payload 
            }.toCell(),
            code: wallet_init.code,
            data: wallet_init.data
        });
    }
    
    receive(msg: TokenTransferInternal) { 
        self.balance += msg.amount; 
        if (msg.forward_ton_amount > 0) {
            send(SendParameters{
                to: self.owner,
                value: msg.forward_ton_amount,
                mode: SendPayGasSeparately,
                body: TokenNotification{
                    query_id: msg.query_id,
                    amount: msg.amount,
                    from: msg.from,
                    forward_payload: msg.forward_payload
                }.toCell()
            });
        }
    }
    
    get fun get_neural_status(): Int { return self.synapse_depth; }
}
