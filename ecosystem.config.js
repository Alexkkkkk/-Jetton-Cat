module.exports = {
  apps: [{
    name: "ai-ton-bot",
    script: "./scripts/aiMonitor.js", // Убедитесь, что это скомпилированный .js файл
    watch: false,
    autorestart: true,
    max_memory_restart: "500M",
    env: {
      NODE_ENV: "production",
    },
    // Логи для отладки
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss"
  }]
};
