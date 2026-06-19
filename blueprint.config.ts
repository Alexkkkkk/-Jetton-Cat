import { Config } from '@ton/blueprint';
import "dotenv/config";
import chalk from 'chalk'; 

const AI_DEPLOY_PARAMS = {
    version: "1.0.0-NEURAL",
    features: ["AdaptiveTax", "NeuralReport", "EmergencyLiquidity", "AutonomousAgent"],
    environment: process.env.NETWORK_TYPE || 'testnet',
    timestamp: new Date().toISOString()
};

if (!process.env.TONCENTER_API_KEY) {
    console.error(chalk.red.bold("❌ CRITICAL: TONCENTER_API_KEY is missing in .env!"));
    process.exit(1);
}

export const config: Config = {
    // 1. Указываем путь к основному контракту
    target: 'contracts/main.tact',
    
    // 2. Настройки сети
    network: {
        endpoint: process.env.NETWORK_TYPE === 'mainnet' 
            ? 'https://toncenter.com/api/v2/jsonRPC' 
            : 'https://testnet.toncenter.com/api/v2/jsonRPC',
        type: (process.env.NETWORK_TYPE as 'mainnet' | 'testnet') || 'testnet',
        apiKey: process.env.TONCENTER_API_KEY,
    },
    
    // 3. Дополнительные метаданные для ИИ-мониторинга
    extra: {
        ai_agent: AI_DEPLOY_PARAMS
    }
};

console.log(chalk.cyan.bold("\n🚀 NEURAL-SYSTEM INITIALIZED"));
console.log(chalk.gray("-------------------------------------------"));
console.log(`${chalk.yellow("Target Contract:")} contracts/main.tact`);
console.log(`${chalk.yellow("Network Mode:   ")} ${config.network.type.toUpperCase()}`);
console.log(`${chalk.yellow("AI Version:     ")} ${AI_DEPLOY_PARAMS.version}`);
console.log(chalk.gray("-------------------------------------------\n"));
