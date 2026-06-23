import crypto from "crypto";

export function getTelegramMiniAppHTML(): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>NeuroJetton · PLSH</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
  :root{
    --bg:#07070f;--card:#0d0d1a;--border:rgba(0,212,255,0.14);--border2:rgba(0,212,255,0.3);
    --text:#dde6f5;--muted:#556070;--accent:#00d4ff;--green:#00ff88;--red:#ff2244;
    --purple:#9b5fff;--yellow:#ffd700;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;font-size:14px;overflow-x:hidden}
  body::before{
    content:'';position:fixed;inset:0;
    background:radial-gradient(ellipse 80% 50% at 10% 0%,rgba(0,212,255,0.06) 0%,transparent 60%),
               radial-gradient(ellipse 60% 50% at 90% 100%,rgba(155,95,255,0.06) 0%,transparent 60%),
               repeating-linear-gradient(0deg,transparent,transparent 49px,rgba(0,212,255,0.02) 50px),
               repeating-linear-gradient(90deg,transparent,transparent 49px,rgba(0,212,255,0.02) 50px);
    pointer-events:none;z-index:0
  }
  #app{position:relative;z-index:1;min-height:100vh;padding:0 0 80px 0}
  h1,h2,h3{font-family:'Rajdhani',sans-serif;letter-spacing:.5px}
  code{font-family:'JetBrains Mono',monospace}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,.3);border-radius:2px}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
  @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(0,212,255,.4)}50%{box-shadow:0 0 22px rgba(0,212,255,.8)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

  .header{
    background:rgba(12,12,26,.96);backdrop-filter:blur(12px);
    border-bottom:1px solid var(--border);padding:14px 18px;
    display:flex;align-items:center;justify-content:space-between;
    position:sticky;top:0;z-index:50
  }
  .logo{display:flex;align-items:center;gap:10px}
  .logo-icon{font-size:24px;animation:float 3s ease-in-out infinite}
  .logo-text{font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;letter-spacing:1px}
  .logo-text span{color:var(--accent);text-shadow:0 0 12px rgba(0,212,255,.7)}
  .badge-live{display:flex;align-items:center;gap:5px;background:rgba(0,255,136,.08);
    border:1px solid rgba(0,255,136,.25);border-radius:20px;padding:4px 10px}
  .badge-live .dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:glow 2s infinite}
  .badge-live span{font-size:10px;color:var(--green);font-weight:700;letter-spacing:1px}

  .tabs{display:flex;background:rgba(12,12,26,.8);border-bottom:1px solid var(--border);overflow-x:auto;
    -webkit-overflow-scrolling:touch;scrollbar-width:none}
  .tabs::-webkit-scrollbar{display:none}
  .tab{flex:0 0 auto;padding:12px 16px;font-size:12px;font-weight:500;color:var(--muted);
    border:none;border-bottom:2px solid transparent;background:transparent;cursor:pointer;
    white-space:nowrap;transition:all .15s;display:flex;align-items:center;gap:5px}
  .tab.active{color:var(--accent);border-bottom-color:var(--accent);font-weight:700;
    font-family:'Rajdhani',sans-serif;font-size:13px;
    text-shadow:0 0 8px rgba(0,212,255,.5)}

  .content{padding:16px 14px;animation:fadeIn .3s ease}

  .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;
    margin-bottom:12px;position:relative;overflow:hidden}
  .card::before{content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(0,212,255,.03) 0%,transparent 50%);pointer-events:none}

  .section-title{font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;
    letter-spacing:1px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
  .label{color:var(--muted);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:5px}
  .value{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700}
  .value.sm{font-size:15px}
  .value.xs{font-size:12px;font-family:'JetBrains Mono',monospace}

  .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
  .stat{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:12px 14px}

  .bar-wrap{margin-bottom:12px}
  .bar-row{display:flex;justify-content:space-between;margin-bottom:6px}
  .bar-track{background:rgba(255,255,255,.05);border-radius:4px;height:7px;overflow:hidden}
  .bar-fill{height:100%;border-radius:4px;transition:width .8s cubic-bezier(.4,0,.2,1)}

  .btn{display:block;width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:700;
    border:none;cursor:pointer;letter-spacing:.5px;margin-bottom:10px;transition:all .2s;
    font-family:'Inter',sans-serif}
  .btn:active{transform:scale(.97)}
  .btn-freeze{background:linear-gradient(135deg,#ff2244,#cc0022);color:#fff;box-shadow:0 0 18px rgba(255,34,68,.4)}
  .btn-unfreeze{background:linear-gradient(135deg,var(--green),#00cc66);color:#07070f;box-shadow:0 0 18px rgba(0,255,136,.35)}
  .btn-accent{background:linear-gradient(135deg,var(--accent),#0099cc);color:#07070f;box-shadow:0 0 18px rgba(0,212,255,.35)}
  .btn-outline{background:rgba(0,212,255,.06);border:1px solid var(--border2);color:var(--accent)}
  .btn-ghost{background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--muted)}
  .btn:disabled{opacity:.45;cursor:not-allowed}

  .status-badge{display:inline-flex;align-items:center;gap:6px;
    padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;
    font-family:'Rajdhani',sans-serif}
  .status-OPTIMAL{background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);color:var(--green)}
  .status-STABLE{background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);color:var(--accent)}
  .status-WARNING{background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.3);color:var(--yellow)}
  .status-CRITICAL{background:rgba(255,34,68,.1);border:1px solid rgba(255,34,68,.3);color:var(--red)}

  .gauge-wrap{display:flex;flex-direction:column;align-items:center;padding:10px 0 4px}
  .metric-row{display:flex;justify-content:space-between;padding:8px 0;
    border-bottom:1px solid rgba(255,255,255,.04);font-size:13px}
  .metric-row:last-child{border-bottom:none}

  .event-item{display:flex;gap:10px;align-items:flex-start;
    padding:9px 10px;border-radius:8px;margin-bottom:4px;
    background:rgba(255,255,255,.02);border:1px solid transparent;transition:all .15s}
  .event-item:hover{background:rgba(255,255,255,.04);border-color:var(--border)}
  .event-type{font-size:10px;font-weight:700;letter-spacing:.8px;
    font-family:'JetBrains Mono',monospace}
  .event-desc{font-size:12px;color:var(--text);opacity:.8;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:calc(100% - 20px)}
  .event-time{font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace}

  .input-field{width:100%;background:rgba(255,255,255,.04);
    border:1px solid var(--border);color:var(--text);
    padding:11px 14px;border-radius:8px;font-size:14px;
    transition:border-color .2s;margin-bottom:12px;font-family:'Inter',sans-serif}
  .input-field:focus{outline:none;border-color:var(--accent)}
  .input-field::placeholder{color:var(--muted)}

  .spinner{width:28px;height:28px;border:2px solid var(--border);
    border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto}
  .loading-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;
    padding:40px 20px;color:var(--muted);font-size:13px}

  .info-row{display:flex;justify-content:space-between;align-items:center;
    padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04)}
  .info-row:last-child{border-bottom:none}
  .info-key{color:var(--muted);font-size:12px}
  .info-val{font-weight:600;font-size:12px;text-align:right;max-width:60%;word-break:break-all}

  .toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
    background:rgba(0,212,255,.15);border:1px solid var(--border2);
    color:var(--accent);padding:10px 20px;border-radius:20px;
    font-size:13px;font-weight:600;z-index:200;
    animation:fadeIn .3s ease;pointer-events:none}

  .bottom-note{text-align:center;color:var(--muted);font-size:11px;padding:16px;line-height:1.7}
</style>
</head>
<body>
<div id="app">
  <div class="header">
    <div class="logo">
      <span class="logo-icon">🐱</span>
      <span class="logo-text">NEURO<span>JETTON</span></span>
    </div>
    <div class="badge-live">
      <div class="dot"></div>
      <span>В СЕТИ</span>
    </div>
  </div>

  <div class="tabs" id="tabs">
    <button class="tab active" data-tab="overview" onclick="switchTab('overview')">📊 Обзор</button>
    <button class="tab" data-tab="neural" onclick="switchTab('neural')">🧬 Нейромозг</button>
    <button class="tab" data-tab="ai" onclick="switchTab('ai')">🧠 ИИ Анализ</button>
    <button class="tab" data-tab="control" onclick="switchTab('control')">⚙️ Управление</button>
    <button class="tab" data-tab="events" onclick="switchTab('events')">📡 События</button>
  </div>

  <div id="content" class="content"></div>
</div>

<script>
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

let activeTab = 'overview';
let cachedStats = null;
let cachedNeural = null;
let cachedAi = null;
let cachedEvents = null;

function esc(s){ return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function showToast(msg){
  const el = document.createElement('div');
  el.className='toast'; el.textContent=msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}

function copyText(text){
  navigator.clipboard.writeText(text).then(()=>showToast('✓ Скопировано')).catch(()=>{});
}

function switchTab(tab){
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t=>{
    t.classList.toggle('active', t.dataset.tab===tab);
  });
  renderTab();
}

async function api(path, opts={}){
  const r = await fetch(path, {credentials:'include', ...opts});
  if(!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}

const statusRu = {OPTIMAL:'ОПТИМАЛЬНО',STABLE:'СТАБИЛЬНО',WARNING:'ПРЕДУПРЕЖДЕНИЕ',CRITICAL:'КРИТИЧНО'};
const riskRu = {LOW:'НИЗКИЙ',MEDIUM:'СРЕДНИЙ',HIGH:'ВЫСОКИЙ'};
const trendRu = {RISING:'↑ РОСТ',STABLE:'→ СТАБИЛЬНО',FALLING:'↓ ПАДЕНИЕ'};
const eventTypeRu = {
  EMERGENCY_FREEZE:'ЭКСТР. ЗАМОРОЗКА',EMERGENCY_FREEZE_AUTO:'АВТО-ЗАМОРОЗКА',
  MONITOR_ERROR:'ОШИБКА',MONITOR_CYCLE:'ЦИКЛ МОНИТОРА',AI_ANALYSIS_RUN:'ИИ АНАЛИЗ',
  NEURAL_COMMAND:'НЕЙРО-КОМАНДА',TG_FREEZE:'ТГ: ЗАМОРОЗКА',TG_UNFREEZE:'ТГ: РАЗМОРОЗКА',
  TG_ENTROPY_ADJ:'ТГ: ЭНТРОПИЯ',MINT:'ЧЕКАНКА',STAKE:'СТЕЙКИНГ',UNSTAKE:'ВЫВОД',
};
const eventIcons={EMERGENCY_FREEZE:'🔴',EMERGENCY_FREEZE_AUTO:'🔴',MONITOR_ERROR:'❌',
  MONITOR_CYCLE:'🔄',AI_ANALYSIS_RUN:'🧠',NEURAL_COMMAND:'⚡',TG_FREEZE:'🔴',
  TG_UNFREEZE:'🟢',TG_ENTROPY_ADJ:'⚙️',MINT:'🪙',STAKE:'🔒',UNSTAKE:'🔓'};
const eventColors={EMERGENCY_FREEZE:'var(--red)',EMERGENCY_FREEZE_AUTO:'var(--red)',
  MONITOR_ERROR:'var(--red)',AI_ANALYSIS_RUN:'var(--purple)',NEURAL_COMMAND:'var(--accent)',
  TG_FREEZE:'var(--red)',TG_UNFREEZE:'var(--green)',MINT:'var(--green)',STAKE:'var(--green)'};

function healthColor(h){ return h>=700?'var(--green)':h>=400?'var(--yellow)':h>=100?'var(--orange)':'var(--red)'; }
function healthLabel(h){ return h>=700?'ОПТИМАЛЬНО':h>=400?'СТАБИЛЬНО':h>=100?'ПРЕДУПРЕЖДЕНИЕ':'КРИТИЧНО'; }

function gaugeHTML(health){
  const pct=Math.min(100,Math.round(health/10));
  const color=healthColor(health);
  const r=44,cx=52,cy=52,circ=2*Math.PI*r,arc=circ*0.75,offset=arc-(arc*pct/100);
  return \`<div class="gauge-wrap">
    <svg width="104" height="90" viewBox="0 0 104 90">
      <defs><filter id="gl"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <circle cx="\${cx}" cy="\${cy}" r="\${r}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="9"
        stroke-dasharray="\${arc} \${circ}" stroke-dashoffset="0"
        transform="rotate(135 \${cx} \${cy})" stroke-linecap="round"/>
      <circle cx="\${cx}" cy="\${cy}" r="\${r}" fill="none" stroke="\${color}" stroke-width="9"
        stroke-dasharray="\${arc} \${circ}" stroke-dashoffset="\${offset}"
        transform="rotate(135 \${cx} \${cy})" stroke-linecap="round" filter="url(#gl)"
        style="transition:stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)"/>
      <text x="\${cx}" y="\${cy-4}" text-anchor="middle" fill="\${color}" font-size="18" font-weight="bold"
        font-family="Rajdhani,sans-serif" style="filter:drop-shadow(0 0 5px \${color})">\${health}</text>
      <text x="\${cx}" y="\${cy+13}" text-anchor="middle" fill="var(--muted)" font-size="9">/ 1000</text>
    </svg>
    <span style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:\${color};
      padding:3px 12px;border-radius:20px;background:\${color}18;border:1px solid \${color}44;
      font-family:'Rajdhani',sans-serif;box-shadow:0 0 8px \${color}33">\${healthLabel(health)}</span>
  </div>\`;
}

function barHTML(value,max,color,label,sublabel){
  const pct=Math.min(100,Math.round(value/max*100));
  return \`<div class="bar-wrap">
    <div class="bar-row"><span class="info-key">\${label}</span>
      <span style="color:\${color};font-size:12px;font-weight:700;font-family:'Rajdhani',sans-serif">\${sublabel}</span></div>
    <div class="bar-track"><div class="bar-fill" style="width:\${pct}%;background:linear-gradient(90deg,\${color}88,\${color});box-shadow:0 0 8px \${color}88"></div></div>
  </div>\`;
}

async function renderOverview(){
  const c = document.getElementById('content');
  c.innerHTML='<div class="loading-wrap"><div class="spinner"></div>Загрузка данных...</div>';
  try {
    if(!cachedStats) cachedStats = await api('/api/admin/stats');
    const s=cachedStats, cs=s.contractStats||{}, ok=!cs.error;
    const hc=healthColor(cs.health||0);
    c.innerHTML=\`
      <div class="card">
        <div class="section-title">📊 Статус Контракта</div>
        \${ok?gaugeHTML(cs.health||0):'<div style="color:var(--muted);text-align:center;padding:20px">Контракт не активен</div>'}
        <div class="stat-grid" style="margin-top:14px">
          \${[['💎 Баланс',s.balance?parseFloat(s.balance).toFixed(3)+' TON':'—','var(--green)'],
             ['📈 Доходность',ok&&cs.apr!==undefined?cs.apr+'%':'—','var(--purple)'],
             ['🔒 Заблокировано',ok&&cs.total_locked?parseFloat(cs.total_locked).toFixed(3)+' TON':'—','var(--accent)'],
             ['⚡ Синапсы',ok?cs.synapse_depth??'—':'—','var(--yellow)'],
          ].map(([l,v,col])=>\`<div class="stat">
            <div class="label">\${l}</div>
            <div class="value sm" style="color:\${col}">\${v}</div>
          </div>\`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="section-title">📋 Контракт</div>
        <div class="info-row"><span class="info-key">Сеть</span><span class="info-val" style="color:var(--accent)">\${(s.network||'mainnet').toUpperCase()}</span></div>
        <div class="info-row"><span class="info-key">Адрес</span>
          <span class="info-val" style="color:var(--accent);cursor:pointer;font-size:11px" onclick="copyText('\${esc(s.masterAddress||'')}')">
            \${s.masterAddress?(s.masterAddress.slice(0,16)+'…'):'Не развёрнут'} 📋</span></div>
        <div class="info-row"><span class="info-key">Статус</span>
          <span class="info-val" style="color:\${s.config?.deployed?'var(--green)':'var(--yellow)'}">\${s.config?.deployed?'✅ Активен':'⏳ Ожидание'}</span></div>
        \${s.tonscanUrl?\`<a href="\${esc(s.tonscanUrl)}" target="_blank"
          style="display:block;margin-top:12px;padding:8px;text-align:center;
          background:rgba(0,212,255,.08);border:1px solid var(--border2);border-radius:8px;
          color:var(--accent);font-size:12px;font-weight:600;text-decoration:none">🔗 Открыть в TONScan</a>\`:''}
      </div>
    \`;
  } catch(e){ c.innerHTML=\`<div class="loading-wrap" style="color:var(--red)">❌ \${esc(e.message)}</div>\`; }
}

async function renderNeural(){
  const c=document.getElementById('content');
  c.innerHTML='<div class="loading-wrap"><div class="spinner"></div>Загрузка нейропрофиля...</div>';
  try {
    if(!cachedNeural) cachedNeural = await api('/api/admin/neural-profile');
    const n=cachedNeural;
    const secAgo=Math.floor(Date.now()/1000)-n.last_tx_time;
    const minAgo=Math.floor(secAgo/60);
    const lastTxt=minAgo<1?'Только что':minAgo<60?minAgo+' мин назад':Math.floor(minAgo/60)+'ч назад';
    c.innerHTML=\`
      <div class="card">
        <div class="section-title">🧬 Нейронный Профиль</div>
        \${barHTML(n.threat_level,100,'var(--red)','Уровень Угрозы',n.threat_level+'/100')}
        \${barHTML(n.memory_bank,100,'var(--purple)','Банк Памяти',n.memory_bank+'/100')}
        \${barHTML(n.policy_weight,1000,'var(--accent)','Вес Политики',n.policy_weight+'/1000')}
        <div class="stat-grid" style="margin-top:14px">
          \${[['Циклы Эволюции',n.evolution_cycles,'var(--accent)'],
             ['Семя Мутации',n.mutation_seed,'var(--purple)'],
             ['Последняя Активность',lastTxt,'var(--green)'],
             ['Хэш Истории',(n.history_hash||'').slice(0,10)+'…','var(--muted)'],
          ].map(([l,v,col])=>\`<div class="stat">
            <div class="label">\${l}</div>
            <div class="value sm" style="color:\${col}">\${v}</div>
          </div>\`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="section-title">📖 Как работает нейродвижок</div>
        \${[['evolve()','Вызывается при каждой транзакции — обновляет APR и память'],
           ['memory_bank','Накапливает рыночное давление (0–100)'],
           ['threat_level','Растёт при энтропии, падает при стабильности'],
           ['policy_weight','Множитель интеллекта для расчёта APR'],
           ['mutation_seed','Криптосемя — обеспечивает непредсказуемость'],
        ].map(([k,d])=>\`<div class="info-row">
          <code style="color:var(--accent);font-size:11px;background:rgba(0,212,255,.08);
            padding:2px 7px;border-radius:4px;border:1px solid rgba(0,212,255,.2)">\${k}</code>
          <span style="font-size:11px;color:var(--muted);max-width:58%;text-align:right">\${d}</span>
        </div>\`).join('')}
      </div>
    \`;
  } catch(e){ c.innerHTML=\`<div class="loading-wrap" style="color:var(--red)">❌ \${esc(e.message)}</div>\`; }
}

async function renderAi(){
  const c=document.getElementById('content');
  c.innerHTML='<div class="loading-wrap"><div class="spinner"></div>Нейросеть анализирует контракт...</div>';
  try {
    if(!cachedAi) cachedAi = await api('/api/admin/ai-analysis');
    const a=cachedAi.analysis;
    if(!a) throw new Error(cachedAi.error||'Нет данных');
    const sc=a.status==='OPTIMAL'?'var(--green)':a.status==='STABLE'?'var(--accent)':a.status==='WARNING'?'var(--yellow)':'var(--red)';
    const rc=a.riskLevel==='LOW'?'var(--green)':a.riskLevel==='MEDIUM'?'var(--yellow)':'var(--red)';
    const tc=a.trend==='RISING'?'var(--green)':a.trend==='FALLING'?'var(--red)':'var(--muted)';
    c.innerHTML=\`
      <div class="card">
        <div class="section-title">🧠 ИИ Разведывательный Отчёт</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
          <span class="status-badge status-\${a.status}">\${a.statusEmoji} \${statusRu[a.status]||a.status}</span>
          <span style="font-size:11px;color:var(--muted)">\${new Date(a.timestamp).toLocaleTimeString('ru-RU')}</span>
        </div>
        <div class="stat-grid">
          <div class="stat"><div class="label">РИСК</div>
            <div class="value sm" style="color:\${rc}">\${riskRu[a.riskLevel]||a.riskLevel}</div></div>
          <div class="stat"><div class="label">ТРЕНД APR</div>
            <div class="value sm" style="color:\${tc}">\${trendRu[a.trend]||a.trend} \${a.predictedApr}%</div></div>
          <div class="stat"><div class="label">АВТОНОМИЯ</div>
            <div class="value sm" style="color:var(--purple)">\${a.autonomyIndex}%</div></div>
          <div class="stat"><div class="label">ОЦЕНКА</div>
            <div class="value sm" style="color:\${sc}">\${a.score}/100</div></div>
        </div>
        <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:12px 14px;border:1px solid var(--border);margin-bottom:12px">
          <div class="label">СВОДКА ИИ</div>
          <div style="font-size:13px;line-height:1.7;margin-top:5px">\${esc(a.summary)}</div>
        </div>
        \${a.insights.length?\`<div style="margin-bottom:12px">
          <div class="label">ИНСАЙТЫ</div>
          \${a.insights.map(i=>\`<div style="font-size:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);
            display:flex;gap:6px;line-height:1.6"><span style="color:var(--accent)">›</span><span>\${esc(i)}</span></div>\`).join('')}
        </div>\`:''}
        \${a.recommendations.length?\`<div style="background:rgba(0,212,255,.04);border:1px solid rgba(0,212,255,.18);
          border-radius:10px;padding:12px 14px">
          <div class="label" style="color:var(--accent)">РЕКОМЕНДАЦИИ ИИ</div>
          \${a.recommendations.map((r,i)=>\`<div style="font-size:12px;display:flex;gap:8px;line-height:1.6;margin-top:7px">
            <span style="color:var(--accent);font-weight:700">\${i+1}.</span><span>\${esc(r)}</span></div>\`).join('')}
        </div>\`:''}
      </div>
      <button class="btn btn-accent" onclick="cachedAi=null;renderAi()">⟳ Обновить анализ</button>
    \`;
  } catch(e){ c.innerHTML=\`<div class="loading-wrap" style="color:var(--red)">❌ \${esc(e.message)}</div>
    <button class="btn btn-outline" style="margin-top:10px" onclick="cachedAi=null;renderAi()">Повторить</button>\`; }
}

let cmdFreeze=false;
function renderControl(){
  const c=document.getElementById('content');
  c.innerHTML=\`
    <div class="card">
      <div class="section-title">🔴 Экстренная Заморозка</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:16px;line-height:1.7">
        Немедленно останавливает стейкинг и защищает резервный фонд.
      </p>
      <button class="btn btn-freeze" onclick="sendCmd(true,0)">🔴 ЗАМОРОЗИТЬ КОНТРАКТ</button>
      <button class="btn btn-unfreeze" onclick="sendCmd(false,0)">🟢 РАЗМОРОЗИТЬ КОНТРАКТ</button>
    </div>
    <div class="card">
      <div class="section-title">⚡ Коррекция Энтропии</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Диапазон: -500 до +500. Отрицательный = успокоить, положительный = нагреть.</p>
      <input type="number" id="entropyVal" class="input-field" placeholder="напр. -50" min="-500" max="500"/>
      <button class="btn btn-accent" onclick="sendEntropyCmd()">⚡ Применить Энтропию</button>
    </div>
    <div class="card">
      <div class="section-title">📡 Telegram Бот</div>
      <button class="btn btn-ghost" onclick="tgTest()">📨 Тест уведомления</button>
      <div class="bottom-note">Команды бота: /status · /neural · /ai · /freeze · /unfreeze · /entropy</div>
    </div>
    <div id="cmdResult"></div>
  \`;
}

async function sendCmd(freeze,entropy){
  const btn=event.target; btn.disabled=true;
  btn.textContent=freeze?'⏳ Замораживаю...':'⏳ Размораживаю...';
  try {
    const r=await api('/api/admin/neural-command',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({freeze,entropyAdj:entropy,biasAdj:0})
    });
    showToast(r.success?'✅ '+r.message:'❌ '+r.error);
  } catch(e){ showToast('❌ '+e.message); }
  finally{ renderControl(); }
}

async function sendEntropyCmd(){
  const v=parseInt(document.getElementById('entropyVal')?.value||'0',10);
  if(isNaN(v)||v<-500||v>500){showToast('❌ Укажите значение -500 до +500');return;}
  await sendCmd(false,v);
}

async function tgTest(){
  try{
    const r=await api('/api/admin/telegram-test',{method:'POST'});
    showToast(r.success?'✅ Отправлено!':'❌ '+r.error);
  }catch(e){showToast('❌ '+e.message);}
}

async function renderEvents(){
  const c=document.getElementById('content');
  c.innerHTML='<div class="loading-wrap"><div class="spinner"></div>Загрузка событий...</div>';
  try {
    if(!cachedEvents) cachedEvents=await api('/api/admin/ai-events');
    const evs=cachedEvents;
    if(!evs.length){
      c.innerHTML='<div class="loading-wrap">📭 Событий пока нет</div>'; return;
    }
    const fmt=iso=>new Date(iso).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    c.innerHTML=\`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <span style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;letter-spacing:1px">📡 Поток ИИ Событий</span>
        <span style="font-size:11px;color:var(--accent);background:rgba(0,212,255,.1);
          border:1px solid rgba(0,212,255,.25);border-radius:10px;padding:2px 8px">\${evs.length}</span>
      </div>
      \${evs.map(ev=>{
        const col=eventColors[ev.eventType]||'var(--muted)';
        return \`<div class="event-item">
          <span style="font-size:13px;flex-shrink:0">\${eventIcons[ev.eventType]||'•'}</span>
          <div style="flex:1;min-width:0">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px">
              <span class="event-type" style="color:\${col}">\${eventTypeRu[ev.eventType]||ev.eventType}</span>
              <span class="event-time">\${fmt(ev.createdAt)}</span>
            </div>
            <div class="event-desc">\${esc(ev.description)}</div>
          </div>
        </div>\`;
      }).join('')}
      <button class="btn btn-outline" style="margin-top:10px" onclick="cachedEvents=null;renderEvents()">⟳ Обновить</button>
    \`;
  } catch(e){ c.innerHTML=\`<div class="loading-wrap" style="color:var(--red)">❌ \${esc(e.message)}</div>\`; }
}

function renderTab(){
  cachedStats=cachedNeural=cachedAi=cachedEvents=null;
  switch(activeTab){
    case 'overview': renderOverview(); break;
    case 'neural':   renderNeural();   break;
    case 'ai':       renderAi();       break;
    case 'control':  renderControl();  break;
    case 'events':   renderEvents();   break;
  }
}

renderOverview();
</script>
</body>
</html>`;
}

export function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return false;
    params.delete("hash");
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    return computedHash === hash;
  } catch {
    return false;
  }
}
