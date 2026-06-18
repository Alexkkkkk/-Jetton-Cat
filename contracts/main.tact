import "@stdlib/ownable";
import "@stdlib/deploy";

// --- Структуры сообщений ---
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

// --- MASTER ---
contract JettonMaster with Ownable, Deployable {
    owner: Address;
    jetton_content: Cell;
    total_supply: Int as coins = 0;
    
    market_entropy: Int = 100;
    last_tick: Int = now();
    min_mint_ton: Int = 100_000_000; 

    init(owner: Address, logo_url: String) {
        self.owner = owner;
        self.jetton_content = beginCell().storeUint(0, 8).storeStringTail(logo_url).endCell();
    }

    // --- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: ПРИЕМ НАЛОГОВ ---
    receive(msg: TokenTransferInternal) {
        // Мастер просто накапливает токены (например, для ликвидности)
        // В будущем здесь можно добавить логику распределения
        self.total_supply += msg.amount; 
    }

    get fun get_wallet_address(owner: Address): Address {
        let init: StateInit = initOf JettonWallet(myAddress(), owner);
        return contractAddress(init);
    }

    // --- МИНТ (Создание токенов при приеме TON) ---
    receive() {
        let ctx: Context = context();
        require(ctx.value >= self.min_mint_ton, "Below min deposit");
        
        let time_delta: Int = max(1, now() - self.last_tick);
        self.market_entropy = min(1000, (self.market_entropy * 9 + (toNano("1") / time_delta)) / 10);
        self.last_tick = now();

        let rate: Int = max(50, 5000 - (self.market_entropy / 10));
        let amount_to_mint: Int = ctx.value * rate;
        self.total_supply += amount_to_mint;

        // Отправляем сминченные токены на кошелек отправителя
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

    init(master: Address, owner: Address) {
        self.master = master;
        self.owner = owner;
    }

    receive(msg: TokenTransfer) {
        require(!self.is_frozen, "Wallet is frozen");
        require(sender() == self.owner, "Access denied");
        require(self.balance >= msg.amount, "Low balance");

        // ИИ-ЛОГИКА: Адаптивное обучение
        self.synapse_depth = (msg.amount > toNano("1000")) ? max(0, self.synapse_depth - 10) : min(200, self.synapse_depth + 5);

        let tax: Int = (msg.amount / 100); 
        let transfer_amount: Int = msg.amount - tax;
        
        self.balance -= msg.amount;
        
        // 1. Отправляем налог мастеру
        send(SendParameters{
            to: self.master,
            value: toNano("0.02"),
            mode: SendIgnoreErrors,
            body: TokenTransferInternal{ query_id: msg.query_id, amount: tax, from: self.owner, response_destination: self.owner, forward_ton_amount: 0, forward_payload: emptySlice() }.toCell()
        });

        // 2. Отправляем токены получателю
        let wallet_init: StateInit = initOf JettonWallet(self.master, msg.destination);
        send(SendParameters{
            to: contractAddress(wallet_init),
            value: toNano("0.03"),
            mode: SendIgnoreErrors,
            bounce: true,
            body: TokenTransferInternal{ 
                query_id: msg.query_id, 
                amount: transfer_amount, 
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
    }

    get fun get_neural_status(): Int { return self.synapse_depth; }
    get fun get_balance(): Int { return self.balance; }
}
