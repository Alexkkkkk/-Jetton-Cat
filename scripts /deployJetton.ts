import { beginCell } from "@ton/core";

// Создаем "on-chain" контент (ссылку на метаданные)
const metadataUrl = "https://raw.githubusercontent.com/Alexkkkkk/-Jetton-Cat/main/metadata.json";
const content = beginCell()
    .storeUint(0, 8) // Префикс для URL
    .storeStringTail(metadataUrl)
    .endCell();

// Передаем этот 'content' в конструктор JettonMaster при деплое
