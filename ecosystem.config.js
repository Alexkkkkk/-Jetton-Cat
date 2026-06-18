module.exports = {
  apps: [{
    name: "ai-ton-bot",
    // Используем ts-node для прямого запуска, чтобы не зависеть от сборки, 
    // либо укажите путь к .js, если вы уже делаете tsc
    script: "./scripts/aiMonitor.ts", 
    interpreter: "node_modules/.bin/ts-node",
    
    watch: false,
    autorestart: true,
    
    // ИИ-стабильность: если бот "зациклится" или потечет память
    max_memory_restart: "500M",
    min_uptime: "60s",
    max_restarts: 10,
    
    env: {
      NODE_ENV: "production",
      // Принудительно задаем буфер для ИИ-вычислений
      NODE_OPTIONS: "--max-old-space-size=512" 
    },
    
    // Логи для аудита ИИ-агента
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    
    // Улучшенная стратегия перезапуска
    restart_delay: 5000 
  }]
};
