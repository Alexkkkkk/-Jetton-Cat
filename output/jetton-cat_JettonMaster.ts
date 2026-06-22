import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwner(source: ChangeOwner) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type JettonData = {
    $$type: 'JettonData';
    totalSupply: bigint;
    mintable: boolean;
    owner: Address;
    content: Cell;
    walletCode: Cell;
}

export function storeJettonData(src: JettonData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.totalSupply, 257);
        b_0.storeBit(src.mintable);
        b_0.storeAddress(src.owner);
        b_0.storeRef(src.content);
        b_0.storeRef(src.walletCode);
    };
}

export function loadJettonData(slice: Slice) {
    const sc_0 = slice;
    const _totalSupply = sc_0.loadIntBig(257);
    const _mintable = sc_0.loadBit();
    const _owner = sc_0.loadAddress();
    const _content = sc_0.loadRef();
    const _walletCode = sc_0.loadRef();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, owner: _owner, content: _content, walletCode: _walletCode };
}

export function loadTupleJettonData(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _owner = source.readAddress();
    const _content = source.readCell();
    const _walletCode = source.readCell();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, owner: _owner, content: _content, walletCode: _walletCode };
}

export function loadGetterTupleJettonData(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _owner = source.readAddress();
    const _content = source.readCell();
    const _walletCode = source.readCell();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, owner: _owner, content: _content, walletCode: _walletCode };
}

export function storeTupleJettonData(source: JettonData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalSupply);
    builder.writeBoolean(source.mintable);
    builder.writeAddress(source.owner);
    builder.writeCell(source.content);
    builder.writeCell(source.walletCode);
    return builder.build();
}

export function dictValueParserJettonData(): DictionaryValue<JettonData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonData(src)).endCell());
        },
        parse: (src) => {
            return loadJettonData(src.loadRef().beginParse());
        }
    }
}

export type DeFiParams = {
    $$type: 'DeFiParams';
    apr: bigint;
    total_locked: bigint;
    last_update: bigint;
    synapse_depth: bigint;
    liquidity_ratio: bigint;
    ai_risk_score: bigint;
}

export function storeDeFiParams(src: DeFiParams) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.apr, 257);
        b_0.storeInt(src.total_locked, 257);
        b_0.storeInt(src.last_update, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.synapse_depth, 257);
        b_1.storeInt(src.liquidity_ratio, 257);
        b_1.storeInt(src.ai_risk_score, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadDeFiParams(slice: Slice) {
    const sc_0 = slice;
    const _apr = sc_0.loadIntBig(257);
    const _total_locked = sc_0.loadIntBig(257);
    const _last_update = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _synapse_depth = sc_1.loadIntBig(257);
    const _liquidity_ratio = sc_1.loadIntBig(257);
    const _ai_risk_score = sc_1.loadIntBig(257);
    return { $$type: 'DeFiParams' as const, apr: _apr, total_locked: _total_locked, last_update: _last_update, synapse_depth: _synapse_depth, liquidity_ratio: _liquidity_ratio, ai_risk_score: _ai_risk_score };
}

export function loadTupleDeFiParams(source: TupleReader) {
    const _apr = source.readBigNumber();
    const _total_locked = source.readBigNumber();
    const _last_update = source.readBigNumber();
    const _synapse_depth = source.readBigNumber();
    const _liquidity_ratio = source.readBigNumber();
    const _ai_risk_score = source.readBigNumber();
    return { $$type: 'DeFiParams' as const, apr: _apr, total_locked: _total_locked, last_update: _last_update, synapse_depth: _synapse_depth, liquidity_ratio: _liquidity_ratio, ai_risk_score: _ai_risk_score };
}

export function loadGetterTupleDeFiParams(source: TupleReader) {
    const _apr = source.readBigNumber();
    const _total_locked = source.readBigNumber();
    const _last_update = source.readBigNumber();
    const _synapse_depth = source.readBigNumber();
    const _liquidity_ratio = source.readBigNumber();
    const _ai_risk_score = source.readBigNumber();
    return { $$type: 'DeFiParams' as const, apr: _apr, total_locked: _total_locked, last_update: _last_update, synapse_depth: _synapse_depth, liquidity_ratio: _liquidity_ratio, ai_risk_score: _ai_risk_score };
}

export function storeTupleDeFiParams(source: DeFiParams) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.apr);
    builder.writeNumber(source.total_locked);
    builder.writeNumber(source.last_update);
    builder.writeNumber(source.synapse_depth);
    builder.writeNumber(source.liquidity_ratio);
    builder.writeNumber(source.ai_risk_score);
    return builder.build();
}

export function dictValueParserDeFiParams(): DictionaryValue<DeFiParams> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeFiParams(src)).endCell());
        },
        parse: (src) => {
            return loadDeFiParams(src.loadRef().beginParse());
        }
    }
}

export type NeuralState = {
    $$type: 'NeuralState';
    history_hash: bigint;
    evolution_cycles: bigint;
    threat_level: bigint;
    policy_weight: bigint;
    last_tx_time: bigint;
    mutation_seed: bigint;
    memory_bank: bigint;
}

export function storeNeuralState(src: NeuralState) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.history_hash, 257);
        b_0.storeInt(src.evolution_cycles, 257);
        b_0.storeInt(src.threat_level, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.policy_weight, 257);
        b_1.storeInt(src.last_tx_time, 257);
        b_1.storeInt(src.mutation_seed, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.memory_bank, 257);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadNeuralState(slice: Slice) {
    const sc_0 = slice;
    const _history_hash = sc_0.loadIntBig(257);
    const _evolution_cycles = sc_0.loadIntBig(257);
    const _threat_level = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _policy_weight = sc_1.loadIntBig(257);
    const _last_tx_time = sc_1.loadIntBig(257);
    const _mutation_seed = sc_1.loadIntBig(257);
    const sc_2 = sc_1.loadRef().beginParse();
    const _memory_bank = sc_2.loadIntBig(257);
    return { $$type: 'NeuralState' as const, history_hash: _history_hash, evolution_cycles: _evolution_cycles, threat_level: _threat_level, policy_weight: _policy_weight, last_tx_time: _last_tx_time, mutation_seed: _mutation_seed, memory_bank: _memory_bank };
}

export function loadTupleNeuralState(source: TupleReader) {
    const _history_hash = source.readBigNumber();
    const _evolution_cycles = source.readBigNumber();
    const _threat_level = source.readBigNumber();
    const _policy_weight = source.readBigNumber();
    const _last_tx_time = source.readBigNumber();
    const _mutation_seed = source.readBigNumber();
    const _memory_bank = source.readBigNumber();
    return { $$type: 'NeuralState' as const, history_hash: _history_hash, evolution_cycles: _evolution_cycles, threat_level: _threat_level, policy_weight: _policy_weight, last_tx_time: _last_tx_time, mutation_seed: _mutation_seed, memory_bank: _memory_bank };
}

export function loadGetterTupleNeuralState(source: TupleReader) {
    const _history_hash = source.readBigNumber();
    const _evolution_cycles = source.readBigNumber();
    const _threat_level = source.readBigNumber();
    const _policy_weight = source.readBigNumber();
    const _last_tx_time = source.readBigNumber();
    const _mutation_seed = source.readBigNumber();
    const _memory_bank = source.readBigNumber();
    return { $$type: 'NeuralState' as const, history_hash: _history_hash, evolution_cycles: _evolution_cycles, threat_level: _threat_level, policy_weight: _policy_weight, last_tx_time: _last_tx_time, mutation_seed: _mutation_seed, memory_bank: _memory_bank };
}

export function storeTupleNeuralState(source: NeuralState) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.history_hash);
    builder.writeNumber(source.evolution_cycles);
    builder.writeNumber(source.threat_level);
    builder.writeNumber(source.policy_weight);
    builder.writeNumber(source.last_tx_time);
    builder.writeNumber(source.mutation_seed);
    builder.writeNumber(source.memory_bank);
    return builder.build();
}

export function dictValueParserNeuralState(): DictionaryValue<NeuralState> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNeuralState(src)).endCell());
        },
        parse: (src) => {
            return loadNeuralState(src.loadRef().beginParse());
        }
    }
}

export type WalletData = {
    $$type: 'WalletData';
    balance: bigint;
    owner: Address;
    master: Address;
    walletCode: Cell;
    allowance: bigint;
}

export function storeWalletData(src: WalletData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.balance, 257);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.master);
        b_0.storeRef(src.walletCode);
        const b_1 = new Builder();
        b_1.storeInt(src.allowance, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadWalletData(slice: Slice) {
    const sc_0 = slice;
    const _balance = sc_0.loadIntBig(257);
    const _owner = sc_0.loadAddress();
    const _master = sc_0.loadAddress();
    const _walletCode = sc_0.loadRef();
    const sc_1 = sc_0.loadRef().beginParse();
    const _allowance = sc_1.loadIntBig(257);
    return { $$type: 'WalletData' as const, balance: _balance, owner: _owner, master: _master, walletCode: _walletCode, allowance: _allowance };
}

export function loadTupleWalletData(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    const _walletCode = source.readCell();
    const _allowance = source.readBigNumber();
    return { $$type: 'WalletData' as const, balance: _balance, owner: _owner, master: _master, walletCode: _walletCode, allowance: _allowance };
}

export function loadGetterTupleWalletData(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    const _walletCode = source.readCell();
    const _allowance = source.readBigNumber();
    return { $$type: 'WalletData' as const, balance: _balance, owner: _owner, master: _master, walletCode: _walletCode, allowance: _allowance };
}

export function storeTupleWalletData(source: WalletData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.master);
    builder.writeCell(source.walletCode);
    builder.writeNumber(source.allowance);
    return builder.build();
}

export function dictValueParserWalletData(): DictionaryValue<WalletData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWalletData(src)).endCell());
        },
        parse: (src) => {
            return loadWalletData(src.loadRef().beginParse());
        }
    }
}

export type TokenTransfer = {
    $$type: 'TokenTransfer';
    query_id: bigint;
    amount: bigint;
    destination: Address;
    response_destination: Address;
    custom_payload: Cell | null;
    forward_ton_amount: bigint;
    forward_payload: Slice;
}

export function storeTokenTransfer(src: TokenTransfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4173833808, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
        b_0.storeAddress(src.response_destination);
        if (src.custom_payload !== null && src.custom_payload !== undefined) { b_0.storeBit(true).storeRef(src.custom_payload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forward_ton_amount);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadTokenTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4173833808) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    const _response_destination = sc_0.loadAddress();
    const _custom_payload = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _forward_ton_amount = sc_0.loadCoins();
    const _forward_payload = sc_0;
    return { $$type: 'TokenTransfer' as const, query_id: _query_id, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadTupleTokenTransfer(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _response_destination = source.readAddress();
    const _custom_payload = source.readCellOpt();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'TokenTransfer' as const, query_id: _query_id, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadGetterTupleTokenTransfer(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _response_destination = source.readAddress();
    const _custom_payload = source.readCellOpt();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'TokenTransfer' as const, query_id: _query_id, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function storeTupleTokenTransfer(source: TokenTransfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    builder.writeAddress(source.response_destination);
    builder.writeCell(source.custom_payload);
    builder.writeNumber(source.forward_ton_amount);
    builder.writeSlice(source.forward_payload.asCell());
    return builder.build();
}

export function dictValueParserTokenTransfer(): DictionaryValue<TokenTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTokenTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadTokenTransfer(src.loadRef().beginParse());
        }
    }
}

export type TokenTransferInternal = {
    $$type: 'TokenTransferInternal';
    query_id: bigint;
    amount: bigint;
    from: Address;
    response_destination: Address;
    forward_ton_amount: bigint;
    forward_payload: Slice;
}

export function storeTokenTransferInternal(src: TokenTransferInternal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(395134233, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.from);
        b_0.storeAddress(src.response_destination);
        b_0.storeCoins(src.forward_ton_amount);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadTokenTransferInternal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 395134233) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _from = sc_0.loadAddress();
    const _response_destination = sc_0.loadAddress();
    const _forward_ton_amount = sc_0.loadCoins();
    const _forward_payload = sc_0;
    return { $$type: 'TokenTransferInternal' as const, query_id: _query_id, amount: _amount, from: _from, response_destination: _response_destination, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadTupleTokenTransferInternal(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _from = source.readAddress();
    const _response_destination = source.readAddress();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'TokenTransferInternal' as const, query_id: _query_id, amount: _amount, from: _from, response_destination: _response_destination, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadGetterTupleTokenTransferInternal(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _from = source.readAddress();
    const _response_destination = source.readAddress();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'TokenTransferInternal' as const, query_id: _query_id, amount: _amount, from: _from, response_destination: _response_destination, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function storeTupleTokenTransferInternal(source: TokenTransferInternal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.from);
    builder.writeAddress(source.response_destination);
    builder.writeNumber(source.forward_ton_amount);
    builder.writeSlice(source.forward_payload.asCell());
    return builder.build();
}

export function dictValueParserTokenTransferInternal(): DictionaryValue<TokenTransferInternal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTokenTransferInternal(src)).endCell());
        },
        parse: (src) => {
            return loadTokenTransferInternal(src.loadRef().beginParse());
        }
    }
}

export type NeuralCommand = {
    $$type: 'NeuralCommand';
    market_entropy_adj: bigint;
    ai_bias_adjustment: bigint;
    emergency_freeze: boolean;
}

export function storeNeuralCommand(src: NeuralCommand) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2735106208, 32);
        b_0.storeInt(src.market_entropy_adj, 257);
        b_0.storeInt(src.ai_bias_adjustment, 257);
        b_0.storeBit(src.emergency_freeze);
    };
}

export function loadNeuralCommand(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2735106208) { throw Error('Invalid prefix'); }
    const _market_entropy_adj = sc_0.loadIntBig(257);
    const _ai_bias_adjustment = sc_0.loadIntBig(257);
    const _emergency_freeze = sc_0.loadBit();
    return { $$type: 'NeuralCommand' as const, market_entropy_adj: _market_entropy_adj, ai_bias_adjustment: _ai_bias_adjustment, emergency_freeze: _emergency_freeze };
}

export function loadTupleNeuralCommand(source: TupleReader) {
    const _market_entropy_adj = source.readBigNumber();
    const _ai_bias_adjustment = source.readBigNumber();
    const _emergency_freeze = source.readBoolean();
    return { $$type: 'NeuralCommand' as const, market_entropy_adj: _market_entropy_adj, ai_bias_adjustment: _ai_bias_adjustment, emergency_freeze: _emergency_freeze };
}

export function loadGetterTupleNeuralCommand(source: TupleReader) {
    const _market_entropy_adj = source.readBigNumber();
    const _ai_bias_adjustment = source.readBigNumber();
    const _emergency_freeze = source.readBoolean();
    return { $$type: 'NeuralCommand' as const, market_entropy_adj: _market_entropy_adj, ai_bias_adjustment: _ai_bias_adjustment, emergency_freeze: _emergency_freeze };
}

export function storeTupleNeuralCommand(source: NeuralCommand) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.market_entropy_adj);
    builder.writeNumber(source.ai_bias_adjustment);
    builder.writeBoolean(source.emergency_freeze);
    return builder.build();
}

export function dictValueParserNeuralCommand(): DictionaryValue<NeuralCommand> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNeuralCommand(src)).endCell());
        },
        parse: (src) => {
            return loadNeuralCommand(src.loadRef().beginParse());
        }
    }
}

export type CognitiveFeedback = {
    $$type: 'CognitiveFeedback';
    strategy_shift: bigint;
    confidence_level: bigint;
}

export function storeCognitiveFeedback(src: CognitiveFeedback) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3379491826, 32);
        b_0.storeInt(src.strategy_shift, 257);
        b_0.storeInt(src.confidence_level, 257);
    };
}

export function loadCognitiveFeedback(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3379491826) { throw Error('Invalid prefix'); }
    const _strategy_shift = sc_0.loadIntBig(257);
    const _confidence_level = sc_0.loadIntBig(257);
    return { $$type: 'CognitiveFeedback' as const, strategy_shift: _strategy_shift, confidence_level: _confidence_level };
}

export function loadTupleCognitiveFeedback(source: TupleReader) {
    const _strategy_shift = source.readBigNumber();
    const _confidence_level = source.readBigNumber();
    return { $$type: 'CognitiveFeedback' as const, strategy_shift: _strategy_shift, confidence_level: _confidence_level };
}

export function loadGetterTupleCognitiveFeedback(source: TupleReader) {
    const _strategy_shift = source.readBigNumber();
    const _confidence_level = source.readBigNumber();
    return { $$type: 'CognitiveFeedback' as const, strategy_shift: _strategy_shift, confidence_level: _confidence_level };
}

export function storeTupleCognitiveFeedback(source: CognitiveFeedback) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.strategy_shift);
    builder.writeNumber(source.confidence_level);
    return builder.build();
}

export function dictValueParserCognitiveFeedback(): DictionaryValue<CognitiveFeedback> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCognitiveFeedback(src)).endCell());
        },
        parse: (src) => {
            return loadCognitiveFeedback(src.loadRef().beginParse());
        }
    }
}

export type Stake = {
    $$type: 'Stake';
    amount: bigint;
}

export function storeStake(src: Stake) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3203459332, 32);
        b_0.storeCoins(src.amount);
    };
}

export function loadStake(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3203459332) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    return { $$type: 'Stake' as const, amount: _amount };
}

export function loadTupleStake(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'Stake' as const, amount: _amount };
}

export function loadGetterTupleStake(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'Stake' as const, amount: _amount };
}

export function storeTupleStake(source: Stake) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserStake(): DictionaryValue<Stake> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStake(src)).endCell());
        },
        parse: (src) => {
            return loadStake(src.loadRef().beginParse());
        }
    }
}

export type Unstake = {
    $$type: 'Unstake';
    amount: bigint;
}

export function storeUnstake(src: Unstake) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4284693473, 32);
        b_0.storeCoins(src.amount);
    };
}

export function loadUnstake(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4284693473) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    return { $$type: 'Unstake' as const, amount: _amount };
}

export function loadTupleUnstake(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'Unstake' as const, amount: _amount };
}

export function loadGetterTupleUnstake(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'Unstake' as const, amount: _amount };
}

export function storeTupleUnstake(source: Unstake) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserUnstake(): DictionaryValue<Unstake> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUnstake(src)).endCell());
        },
        parse: (src) => {
            return loadUnstake(src.loadRef().beginParse());
        }
    }
}

export type Mint = {
    $$type: 'Mint';
    amount: bigint;
    recipient: Address;
}

export function storeMint(src: Mint) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(122372062, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.recipient);
    };
}

export function loadMint(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 122372062) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _recipient = sc_0.loadAddress();
    return { $$type: 'Mint' as const, amount: _amount, recipient: _recipient };
}

export function loadTupleMint(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _recipient = source.readAddress();
    return { $$type: 'Mint' as const, amount: _amount, recipient: _recipient };
}

export function loadGetterTupleMint(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _recipient = source.readAddress();
    return { $$type: 'Mint' as const, amount: _amount, recipient: _recipient };
}

export function storeTupleMint(source: Mint) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.recipient);
    return builder.build();
}

export function dictValueParserMint(): DictionaryValue<Mint> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMint(src)).endCell());
        },
        parse: (src) => {
            return loadMint(src.loadRef().beginParse());
        }
    }
}

export type PeerKnowledgeExchange = {
    $$type: 'PeerKnowledgeExchange';
    sender_master: Address;
    apr_data: bigint;
    ai_risk_score: bigint;
    policy_weight: bigint;
}

export function storePeerKnowledgeExchange(src: PeerKnowledgeExchange) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1234992150, 32);
        b_0.storeAddress(src.sender_master);
        b_0.storeInt(src.apr_data, 257);
        b_0.storeInt(src.ai_risk_score, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.policy_weight, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadPeerKnowledgeExchange(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1234992150) { throw Error('Invalid prefix'); }
    const _sender_master = sc_0.loadAddress();
    const _apr_data = sc_0.loadIntBig(257);
    const _ai_risk_score = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _policy_weight = sc_1.loadIntBig(257);
    return { $$type: 'PeerKnowledgeExchange' as const, sender_master: _sender_master, apr_data: _apr_data, ai_risk_score: _ai_risk_score, policy_weight: _policy_weight };
}

export function loadTuplePeerKnowledgeExchange(source: TupleReader) {
    const _sender_master = source.readAddress();
    const _apr_data = source.readBigNumber();
    const _ai_risk_score = source.readBigNumber();
    const _policy_weight = source.readBigNumber();
    return { $$type: 'PeerKnowledgeExchange' as const, sender_master: _sender_master, apr_data: _apr_data, ai_risk_score: _ai_risk_score, policy_weight: _policy_weight };
}

export function loadGetterTuplePeerKnowledgeExchange(source: TupleReader) {
    const _sender_master = source.readAddress();
    const _apr_data = source.readBigNumber();
    const _ai_risk_score = source.readBigNumber();
    const _policy_weight = source.readBigNumber();
    return { $$type: 'PeerKnowledgeExchange' as const, sender_master: _sender_master, apr_data: _apr_data, ai_risk_score: _ai_risk_score, policy_weight: _policy_weight };
}

export function storeTuplePeerKnowledgeExchange(source: PeerKnowledgeExchange) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.sender_master);
    builder.writeNumber(source.apr_data);
    builder.writeNumber(source.ai_risk_score);
    builder.writeNumber(source.policy_weight);
    return builder.build();
}

export function dictValueParserPeerKnowledgeExchange(): DictionaryValue<PeerKnowledgeExchange> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePeerKnowledgeExchange(src)).endCell());
        },
        parse: (src) => {
            return loadPeerKnowledgeExchange(src.loadRef().beginParse());
        }
    }
}

export type AddPeer = {
    $$type: 'AddPeer';
    peer_address: Address;
}

export function storeAddPeer(src: AddPeer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(43789747, 32);
        b_0.storeAddress(src.peer_address);
    };
}

export function loadAddPeer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 43789747) { throw Error('Invalid prefix'); }
    const _peer_address = sc_0.loadAddress();
    return { $$type: 'AddPeer' as const, peer_address: _peer_address };
}

export function loadTupleAddPeer(source: TupleReader) {
    const _peer_address = source.readAddress();
    return { $$type: 'AddPeer' as const, peer_address: _peer_address };
}

export function loadGetterTupleAddPeer(source: TupleReader) {
    const _peer_address = source.readAddress();
    return { $$type: 'AddPeer' as const, peer_address: _peer_address };
}

export function storeTupleAddPeer(source: AddPeer) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.peer_address);
    return builder.build();
}

export function dictValueParserAddPeer(): DictionaryValue<AddPeer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAddPeer(src)).endCell());
        },
        parse: (src) => {
            return loadAddPeer(src.loadRef().beginParse());
        }
    }
}

export type RemovePeer = {
    $$type: 'RemovePeer';
    peer_address: Address;
}

export function storeRemovePeer(src: RemovePeer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3332902847, 32);
        b_0.storeAddress(src.peer_address);
    };
}

export function loadRemovePeer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3332902847) { throw Error('Invalid prefix'); }
    const _peer_address = sc_0.loadAddress();
    return { $$type: 'RemovePeer' as const, peer_address: _peer_address };
}

export function loadTupleRemovePeer(source: TupleReader) {
    const _peer_address = source.readAddress();
    return { $$type: 'RemovePeer' as const, peer_address: _peer_address };
}

export function loadGetterTupleRemovePeer(source: TupleReader) {
    const _peer_address = source.readAddress();
    return { $$type: 'RemovePeer' as const, peer_address: _peer_address };
}

export function storeTupleRemovePeer(source: RemovePeer) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.peer_address);
    return builder.build();
}

export function dictValueParserRemovePeer(): DictionaryValue<RemovePeer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRemovePeer(src)).endCell());
        },
        parse: (src) => {
            return loadRemovePeer(src.loadRef().beginParse());
        }
    }
}

export type JettonMaster$Data = {
    $$type: 'JettonMaster$Data';
    owner: Address;
    jetton_content: Cell;
    total_supply: bigint;
    total_staked: bigint;
    reserve_fund: bigint;
    peers: Dictionary<Address, boolean>;
    defi: DeFiParams;
    market_entropy: bigint;
    ai_bias: bigint;
    neural: NeuralState;
    is_frozen: boolean;
}

export function storeJettonMaster$Data(src: JettonMaster$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeRef(src.jetton_content);
        b_0.storeCoins(src.total_supply);
        b_0.storeCoins(src.total_staked);
        b_0.storeCoins(src.reserve_fund);
        b_0.storeDict(src.peers, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        const b_1 = new Builder();
        b_1.store(storeDeFiParams(src.defi));
        const b_2 = new Builder();
        b_2.storeInt(src.market_entropy, 257);
        b_2.storeInt(src.ai_bias, 257);
        const b_3 = new Builder();
        b_3.store(storeNeuralState(src.neural));
        b_3.storeBit(src.is_frozen);
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadJettonMaster$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _jetton_content = sc_0.loadRef();
    const _total_supply = sc_0.loadCoins();
    const _total_staked = sc_0.loadCoins();
    const _reserve_fund = sc_0.loadCoins();
    const _peers = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _defi = loadDeFiParams(sc_1);
    const sc_2 = sc_1.loadRef().beginParse();
    const _market_entropy = sc_2.loadIntBig(257);
    const _ai_bias = sc_2.loadIntBig(257);
    const sc_3 = sc_2.loadRef().beginParse();
    const _neural = loadNeuralState(sc_3);
    const _is_frozen = sc_3.loadBit();
    return { $$type: 'JettonMaster$Data' as const, owner: _owner, jetton_content: _jetton_content, total_supply: _total_supply, total_staked: _total_staked, reserve_fund: _reserve_fund, peers: _peers, defi: _defi, market_entropy: _market_entropy, ai_bias: _ai_bias, neural: _neural, is_frozen: _is_frozen };
}

export function loadTupleJettonMaster$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _jetton_content = source.readCell();
    const _total_supply = source.readBigNumber();
    const _total_staked = source.readBigNumber();
    const _reserve_fund = source.readBigNumber();
    const _peers = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _defi = loadTupleDeFiParams(source);
    const _market_entropy = source.readBigNumber();
    const _ai_bias = source.readBigNumber();
    const _neural = loadTupleNeuralState(source);
    const _is_frozen = source.readBoolean();
    return { $$type: 'JettonMaster$Data' as const, owner: _owner, jetton_content: _jetton_content, total_supply: _total_supply, total_staked: _total_staked, reserve_fund: _reserve_fund, peers: _peers, defi: _defi, market_entropy: _market_entropy, ai_bias: _ai_bias, neural: _neural, is_frozen: _is_frozen };
}

export function loadGetterTupleJettonMaster$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _jetton_content = source.readCell();
    const _total_supply = source.readBigNumber();
    const _total_staked = source.readBigNumber();
    const _reserve_fund = source.readBigNumber();
    const _peers = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _defi = loadGetterTupleDeFiParams(source);
    const _market_entropy = source.readBigNumber();
    const _ai_bias = source.readBigNumber();
    const _neural = loadGetterTupleNeuralState(source);
    const _is_frozen = source.readBoolean();
    return { $$type: 'JettonMaster$Data' as const, owner: _owner, jetton_content: _jetton_content, total_supply: _total_supply, total_staked: _total_staked, reserve_fund: _reserve_fund, peers: _peers, defi: _defi, market_entropy: _market_entropy, ai_bias: _ai_bias, neural: _neural, is_frozen: _is_frozen };
}

export function storeTupleJettonMaster$Data(source: JettonMaster$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeCell(source.jetton_content);
    builder.writeNumber(source.total_supply);
    builder.writeNumber(source.total_staked);
    builder.writeNumber(source.reserve_fund);
    builder.writeCell(source.peers.size > 0 ? beginCell().storeDictDirect(source.peers, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    builder.writeTuple(storeTupleDeFiParams(source.defi));
    builder.writeNumber(source.market_entropy);
    builder.writeNumber(source.ai_bias);
    builder.writeTuple(storeTupleNeuralState(source.neural));
    builder.writeBoolean(source.is_frozen);
    return builder.build();
}

export function dictValueParserJettonMaster$Data(): DictionaryValue<JettonMaster$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonMaster$Data(src)).endCell());
        },
        parse: (src) => {
            return loadJettonMaster$Data(src.loadRef().beginParse());
        }
    }
}

export type JettonWallet$Data = {
    $$type: 'JettonWallet$Data';
    balance: bigint;
    owner: Address;
    master: Address;
}

export function storeJettonWallet$Data(src: JettonWallet$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.master);
    };
}

export function loadJettonWallet$Data(slice: Slice) {
    const sc_0 = slice;
    const _balance = sc_0.loadCoins();
    const _owner = sc_0.loadAddress();
    const _master = sc_0.loadAddress();
    return { $$type: 'JettonWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function loadTupleJettonWallet$Data(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    return { $$type: 'JettonWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function loadGetterTupleJettonWallet$Data(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    return { $$type: 'JettonWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function storeTupleJettonWallet$Data(source: JettonWallet$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.master);
    return builder.build();
}

export function dictValueParserJettonWallet$Data(): DictionaryValue<JettonWallet$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonWallet$Data(src)).endCell());
        },
        parse: (src) => {
            return loadJettonWallet$Data(src.loadRef().beginParse());
        }
    }
}

 type JettonMaster_init_args = {
    $$type: 'JettonMaster_init_args';
    owner: Address;
    content_url: string;
}

function initJettonMaster_init_args(src: JettonMaster_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeStringRefTail(src.content_url);
    };
}

async function JettonMaster_init(owner: Address, content_url: string) {
    const __code = Cell.fromHex('b5ee9c7241022f01000c3e00022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d9010c020271020702012003050389b8fdaed44d0d200018ea8db3c57161114111511141113111411131112111311121111111211111110111111100f11100f550e8e89fa40d401d01202d101e2db3c6ce76c8780d0f04000e54776554776527038db851ded44d0d200018ea8db3c57161114111511141113111411131112111311121111111211111110111111100f11100f550e8e89fa40d401d01202d101e2db3c57105f0f6c6180d0f0600045615020120080a0389b9e2ded44d0d200018ea8db3c57161114111511141113111411131112111311121111111211111110111111100f11100f550e8e89fa40d401d01202d101e2db3c6cf56c7580d0f09012270f8285617db3c30561559561801561801170389b8e71ed44d0d200018ea8db3c57161114111511141113111411131112111311121111111211111110111111100f11100f550e8e89fa40d401d01202d101e2db3c6cc66ca680d0f0b000c547fed547fed04e801d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018ea8db3c57161114111511141113111411131112111311121111111211111110111111100f11100f550e8e89fa40d401d01202d101e21117945f0f5f08e01115d70d1ff2e08221820a9c2db3bae302218210c6a80fbfba0d0f101101f6fa40d4fa00fa00fa00d401d0f404810101d700810101d700810101d700d401d0810101d700810101d700810101d7003010361035103406d430d0810101d700810101d700d430d0810101d700810101d700810101d700d401d0810101d700810101d700810101d700d430d0810101d7003010471046104507d200300e006411111116111111111115111111111114111111111113111111111112111110ef10de10cd10bc10ab1067105610451034413000f270206d8101f4532280648107d0223380648103e882f0ce8ccd3092f5b3a49290043971cd7da2bc31126e12a8137146034bd7a56a65da54799221772132708238056bc75e2d63100000c87101cb07011113cf16c9f823f8230211140202111302021112020211110202111002102f4ed01c4ab048904670445302fc31fa40301114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411164130db3c0111100181010b0111177f71216e955b59f4593098c801cf004133f441e2111411151114111311141113111211131112111111121111111011112213043ce302218210499c7c16bae302218210074b3fdebae302218210c96ef3f2ba1214162002fc31fa40301114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411164130db3c0111100181010b0111176d71216e955b59f4593098c801cf004133f441e2111411151114111311141113111211131112111111121111111011112213016810ef10de10cd10bc10ab109a1089107810671056104510344130c87f01ca00111611151114111311121111111055e0db3cc9ed542d01fe31fa4031810101d70031810101d700d430d0810101d700308200e65581010bf842561359714133f40a6fa19401d70030925b6de27f216e925b7091bae2f2f450aaa0ab005039a0ab001113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046103515023e504403db3cc87f01ca00111611151114111311121111111055e0db3cc9ed54262d03fe31fa00fa4030011116011117db3c11135616a0f828011118db3c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d082100bebc2007270f82821c8c9d0103403111c03561b59c855508210178d45195007cb1f15cb3f5003fa02cece01fa02cec941300111180122171f011688c87001ca005a02cecec91803deff008e88f4a413f4bcf2c80bed53208f5a3001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200019afa00fa40fa4055206c139afa40fa405902d1017002e204925f04e002d70d1ff2e082218210f8c7a650bae302018210178d4519bae3025f04f2c082e1ed43d9191b1e0149a65ec0bb513434800066be803e903e9015481b04e6be903e901640b4405c00b8b6cf1b0d601a01185301db3c30702454443024591c02fe31d33ffa00fa40fa40f40431fa008200c13df84229c705f2f45164a15284db3c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d045407080402948135079c855508210178d45195007cb1f15cb3f5003fa02cece01fa02cec91443305a6d6d40037fc8cf85801c1d0018f82ac87001ca005a02cecec9007aca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002c87f01ca0055205afa0212cecec9ed5400d2d33f31fa00fa4031fa4031fa005aa022c2008e407202c801cf16c92444335a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00926c21e202c87f01ca0055205afa0212cecec9ed5401dc5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb001113111511131112111411121110111211100f11110f0e11100e10df551cc87f01ca00111611151114111311121111111055e0db3cc9ed542d04f68ff031810101d700810101d70030011116011117db3c7a058103e81118a001111701b60814b6098064088113881118a001111701b60817b6091113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079081057104613154440db3ce0218210a30668a0ba22262c2104fe8ffd31810101d700810101d70031d20030011116011117db3c3070098103e81117a001111601b60818b6091113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a091068105710461035443012db3cc87f01ca00111611151114111311121111111055e0db3cc9ed5422262d230012f8425616c705f2e08403fee0218210bef0e904ba8f7331fa0030817b815617b3f2f4f8416f24135f038127fd2182101dcd6500bef2f4111201a00d5611a08064288032a904a101111201a88064a90401111001a01113111511131112111411121111111311110c11120c11110e11100e10df10bd10ac109b108a10791068105710461035443012db3ce0262c240236218210ff633be1bae302018210946a98b6bae3025f0f5f08f2c082252b04fe31fa00308200d1732ac13cf2f48200ca2a561222bef2f411115611a111111da11113111511131112111411121111111311111110111211100f11110f0e11100e10df0e10bd10ac109b108a107910681057104610354403db3cf84270804070136d6d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb08a8a2628292a01f63a3c3df82301a182015180bc927f37de258101f4bc9e09a48064a908806402a60512b608987002a6fe12b60919e221aa00268014a904a0806401b6082a75a904267aa904806423a1a88064a90401a00d82f0ce8ccd3092f5b3a49290043971cd7da2bc31126e12a8137146034bd7a56a65daa882080f4240a9080427001aa4f823f8230d103a461450550300065bcf81001a58cf8680cf8480f400f400cf810142e2f400c901fb00c87f01ca00111611151114111311121111111055e0db3cc9ed542d01e6d33f30c8018210aff90f5758cb1fcb3fc91114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb002c0134c87f01ca00111611151114111311121111111055e0db3cc9ed542d01c4011115011116ce01111301cc011111fa02500ffa02500dfa020bc8f40006105a10491038470a5056810101cf0013810101cf00810101cf0001c8810101cf0012810101cf0012810101cf00cd03c8810101cf0012810101cf00c8461710454413489a2e006c5067810101cf0014810101cf0012810101cf0001c8810101cf0012810101cf0012810101cf0002c8810101cf0012cdcd14ca00cdcdcd78779342');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initJettonMaster_init_args({ $$type: 'JettonMaster_init_args', owner, content_url })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const JettonMaster_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    10237: { message: "Min 0.5 TON" },
    31617: { message: "AI Brain: Hibernation Mode" },
    49469: { message: "Access denied" },
    51754: { message: "Insufficient funds" },
    53619: { message: "AI Intuition: Liquidity locked for safety" },
    58965: { message: "Security Alert: Untrusted Agent" },
} as const

export const JettonMaster_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Min 0.5 TON": 10237,
    "AI Brain: Hibernation Mode": 31617,
    "Access denied": 49469,
    "Insufficient funds": 51754,
    "AI Intuition: Liquidity locked for safety": 53619,
    "Security Alert: Untrusted Agent": 58965,
} as const

const JettonMaster_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonData","header":null,"fields":[{"name":"totalSupply","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}},{"name":"walletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"DeFiParams","header":null,"fields":[{"name":"apr","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"total_locked","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"last_update","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"synapse_depth","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"liquidity_ratio","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"ai_risk_score","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"NeuralState","header":null,"fields":[{"name":"history_hash","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"evolution_cycles","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"threat_level","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"policy_weight","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"last_tx_time","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mutation_seed","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"memory_bank","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"WalletData","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}},{"name":"walletCode","type":{"kind":"simple","type":"cell","optional":false}},{"name":"allowance","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"TokenTransfer","header":4173833808,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"custom_payload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forward_ton_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"TokenTransferInternal","header":395134233,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"from","type":{"kind":"simple","type":"address","optional":false}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"forward_ton_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"NeuralCommand","header":2735106208,"fields":[{"name":"market_entropy_adj","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"ai_bias_adjustment","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"emergency_freeze","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"CognitiveFeedback","header":3379491826,"fields":[{"name":"strategy_shift","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"confidence_level","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Stake","header":3203459332,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"Unstake","header":4284693473,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"Mint","header":122372062,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"PeerKnowledgeExchange","header":1234992150,"fields":[{"name":"sender_master","type":{"kind":"simple","type":"address","optional":false}},{"name":"apr_data","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"ai_risk_score","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"policy_weight","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"AddPeer","header":43789747,"fields":[{"name":"peer_address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RemovePeer","header":3332902847,"fields":[{"name":"peer_address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonMaster$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"jetton_content","type":{"kind":"simple","type":"cell","optional":false}},{"name":"total_supply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"total_staked","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"reserve_fund","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"peers","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"defi","type":{"kind":"simple","type":"DeFiParams","optional":false}},{"name":"market_entropy","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"ai_bias","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"neural","type":{"kind":"simple","type":"NeuralState","optional":false}},{"name":"is_frozen","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"JettonWallet$Data","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}}]},
]

const JettonMaster_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "TokenTransfer": 4173833808,
    "TokenTransferInternal": 395134233,
    "NeuralCommand": 2735106208,
    "CognitiveFeedback": 3379491826,
    "Stake": 3203459332,
    "Unstake": 4284693473,
    "Mint": 122372062,
    "PeerKnowledgeExchange": 1234992150,
    "AddPeer": 43789747,
    "RemovePeer": 3332902847,
}

const JettonMaster_getters: ABIGetter[] = [
    {"name":"get_jetton_data","methodId":106029,"arguments":[],"returnType":{"kind":"simple","type":"JettonData","optional":false}},
    {"name":"get_vital_signs","methodId":118385,"arguments":[],"returnType":{"kind":"simple","type":"DeFiParams","optional":false}},
    {"name":"get_neural_profile","methodId":69594,"arguments":[],"returnType":{"kind":"simple","type":"NeuralState","optional":false}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const JettonMaster_getterMapping: { [key: string]: string } = {
    'get_jetton_data': 'getGetJettonData',
    'get_vital_signs': 'getGetVitalSigns',
    'get_neural_profile': 'getGetNeuralProfile',
    'owner': 'getOwner',
}

const JettonMaster_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"AddPeer"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RemovePeer"}},
    {"receiver":"internal","message":{"kind":"typed","type":"PeerKnowledgeExchange"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Mint"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CognitiveFeedback"}},
    {"receiver":"internal","message":{"kind":"typed","type":"NeuralCommand"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Stake"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Unstake"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]

export const DEV_ADDRESS = address("EQDDgb2BTM-KCjntOoUg6uHllvnu3KGqEquKw6IySVP3hGXJ");
export const GAS_CONSUMPTION = 50000000n;
export const CONTRACT_HASH_SEED = 93425221564777052312547156632767519476422384225883353702068648528814168237530n;

export class JettonMaster implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = JettonMaster_errors_backward;
    public static readonly opcodes = JettonMaster_opcodes;
    
    static async init(owner: Address, content_url: string) {
        return await JettonMaster_init(owner, content_url);
    }
    
    static async fromInit(owner: Address, content_url: string) {
        const __gen_init = await JettonMaster_init(owner, content_url);
        const address = contractAddress(0, __gen_init);
        return new JettonMaster(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new JettonMaster(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  JettonMaster_types,
        getters: JettonMaster_getters,
        receivers: JettonMaster_receivers,
        errors: JettonMaster_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: AddPeer | RemovePeer | PeerKnowledgeExchange | Mint | CognitiveFeedback | NeuralCommand | Stake | Unstake | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'AddPeer') {
            body = beginCell().store(storeAddPeer(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RemovePeer') {
            body = beginCell().store(storeRemovePeer(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PeerKnowledgeExchange') {
            body = beginCell().store(storePeerKnowledgeExchange(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Mint') {
            body = beginCell().store(storeMint(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CognitiveFeedback') {
            body = beginCell().store(storeCognitiveFeedback(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'NeuralCommand') {
            body = beginCell().store(storeNeuralCommand(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Stake') {
            body = beginCell().store(storeStake(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Unstake') {
            body = beginCell().store(storeUnstake(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetJettonData(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_jetton_data', builder.build())).stack;
        const result = loadGetterTupleJettonData(source);
        return result;
    }
    
    async getGetVitalSigns(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_vital_signs', builder.build())).stack;
        const result = loadGetterTupleDeFiParams(source);
        return result;
    }
    
    async getGetNeuralProfile(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_neural_profile', builder.build())).stack;
        const result = loadGetterTupleNeuralState(source);
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}