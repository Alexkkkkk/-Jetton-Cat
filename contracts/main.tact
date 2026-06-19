import "@stdlib/deploy";
import "@stdlib/ownable";

// --- КОНСТАНТА ---
const DEV_ADDRESS: Address = address("UQDDgb2BTM-KCjntOoUg6uHllvnu3KGqEquKw6IySVP3hDgM");

// --- Структуры ---
struct JettonData { totalSupply: Int; mintable: Bool; adminAddress: Address; jettonContent: Cell; jettonWalletCode: Cell; }
struct WalletData { balance: Int; owner: Address; master: Address; walletCode: Cell; }

// --- Сообщения ---
message NeuralCommand { min_mint_ton: Int as coins; market_entropy_adj: Int; emergency_freeze: Bool; enable_arbitrage: Bool; ai_bias_adjustment: Int; }
message Buyback { amount: Int as coins; }
message Stake { amount: Int as coins; }
message TokenTransfer { query_id: Int as uint64; amount: Int as coins; destination: Address; response_destination: Address; custom_payload: Cell?; forward_ton_amount: Int as coins; forward_payload: Slice as remaining; }
message TokenTransferInternal { query_id: Int as uint64; amount: Int as coins; from: Address; response_destination: Address; forward_ton_amount: Int as coins; forward_payload: Slice as remaining; }
message TokenNotification { query_id: Int as uint64; amount: Int as coins; from: Address; forward_payload: Slice as remaining; }

// --- MASTER ---
contract JettonMaster with Ownable, Deployable {
    owner: Address;
    jetton_content: Cell;
    total_supply: Int as coins; // Зафиксированный объем
    total_staked: Int as coins = 0;
    reserve_fund: Int as coins = 0;
    
    market_entropy: Int = 100;
    ai_bias: Int = 1000; 
    last_tick: Int; 
    min_mint_ton: Int = 100_000_000; 
    is_frozen: Bool = false;
    arbitrage_enabled: Bool = false;

    init(owner: Address, logo_url: String) {
        self.owner = owner;
        self.last_tick = now();
        // Фиксированный объем: 100 миллиардов * 10^9
        self.total_supply = 100000000000000000000; 
        self.jetton_content = beginCell().storeUint(0, 8).storeSlice(logo_url.asSlice()).endCell();
        
        // Разовая выдача всех токенов на кошелек владельца при деплое
        let wallet_init = initOf JettonWallet(myAddress(), owner);
        send(SendParameters{
            to: contractAddress(wallet_init), value: ton("0.05"), mode: 0,
            body: TokenTransferInternal{ query_id: 0, amount: self.total_supply, from: myAddress(), response_destination: owner, forward_ton_amount: 0, forward_payload: emptySlice() }.toCell(),
            code: wallet_init.code, data: wallet_init.data
        });
    }

    // Запрет на минтинг после выпуска
    receive() {
        throw(1001); 
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

    get fun get_jetton_data(): JettonData {
        return JettonData{ totalSupply: self.total_supply, mintable: false, adminAddress: self.owner, jettonContent: self.jetton_content, jettonWalletCode: (initOf JettonWallet(myAddress(), self.owner)).code };
    }
}

// --- WALLET ---
contract JettonWallet {
    balance: Int as coins = 0;
    owner: Address;
    master: Address;
    is_frozen: Bool = false;
    synapse_depth: Int = 100;
    last_interaction: Int;

    init(master: Address, owner: Address) {
        self.master = master;
        self.owner = owner;
        self.last_interaction = now();
    }

    receive(msg: NeuralCommand) {
        require(sender() == self.master, "Access denied");
        self.is_frozen = msg.emergency_freeze;
    }

    receive(msg: TokenTransfer) {
        require(!self.is_frozen, "Wallet is frozen");
        require(sender() == self.owner, "Access denied");
        require(self.balance >= msg.amount, "Insufficient balance");
        
        // Комиссия 0.4%
        let fee = (msg.amount * 4) / 1000;
        let transfer_amount = msg.amount - fee;
        
        self.synapse_depth = (msg.amount > ton("1000")) ? max(10, self.synapse_depth - 10) : min(200, self.synapse_depth + 5);
        self.last_interaction = now(); 
        self.balance -= msg.amount;

        // Перевод пользователю
        let wallet_init = initOf JettonWallet(self.master, msg.destination);
        send(SendParameters{
            to: contractAddress(wallet_init), value: 0, mode: SendRemainingValue, bounce: true,
            body: TokenTransferInternal{ query_id: msg.query_id, amount: transfer_amount, from: self.owner, response_destination: msg.response_destination, forward_ton_amount: msg.forward_ton_amount, forward_payload: msg.forward_payload }.toCell(),
            code: wallet_init.code, data: wallet_init.data
        });

        // Отправка комиссии 0.4% разработчику
        let dev_init = initOf JettonWallet(self.master, DEV_ADDRESS);
        send(SendParameters{
            to: contractAddress(dev_init), value: 0, mode: SendRemainingValue,
            body: TokenTransferInternal{ query_id: msg.query_id, amount: fee, from: self.owner, response_destination: self.owner, forward_ton_amount: 0, forward_payload: emptySlice() }.toCell(),
            code: dev_init.code, data: dev_init.data
        });
    }
    
    receive(msg: TokenTransferInternal) { 
        self.balance += msg.amount; 
        if (msg.forward_ton_amount > 0) {
            send(SendParameters{ to: self.owner, value: msg.forward_ton_amount, mode: SendPayGasSeparately, body: TokenNotification{ query_id: msg.query_id, amount: msg.amount, from: msg.from, forward_payload: msg.forward_payload }.toCell() });
        }
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
    
    get fun get_wallet_data(): WalletData { return WalletData{ balance: self.balance, owner: self.owner, master: self.master, walletCode: (initOf JettonWallet(self.master, self.owner)).code }; }
    get fun get_neural_status(): Int { return self.synapse_depth; }
}
