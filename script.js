
let ORIGINAL_TRENDS = null;
let DATA = null;

async function loadData(){
  const res = await fetch('data.json');
  return res.json();
}
function renderPillars(palette){
  const el = document.getElementById('pillars');
  el.innerHTML='';
  const order = [
    "Cliente no centro",
    "Eficiência e rentabilidade",
    "Tecnologia e inovação",
    "Pessoas, cultura e agilidade",
    "Sustentabilidade e cidadania",
    "Atuação em ecossistema"
  ];
  order.forEach(name=>{
    const color = palette[name];
    const badge = document.createElement('div');
    badge.className = 'pillar-badge';
    badge.style.background = color;
    badge.textContent = name;
    el.appendChild(badge);
  });
}

function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

function renderPills(data){
  const box = document.querySelector('.pills');
  box.innerHTML = '';

  data.trends.forEach(t => {
    const pill = document.createElement('div');
    pill.className = 'pill';
    pill.textContent = t.name;
    pill.dataset.id = t.id;
    pill.dataset.pillar = t.pillar;

    const left = clamp(t.x ?? 50, 0, 100);
    const top = clamp(100 - (t.y ?? 50), 0, 100);
    pill.style.left = `calc(${left}% - 55px)`;
    pill.style.top = `calc(${top}% - 14px)`;
    box.appendChild(pill);

    // Smooth drag with deltas
    let isDown = false, startX=0, startY=0, baseLeftPct=left, baseTopPct=top;
    pill.addEventListener('mousedown', e=>{ 
      const rect = box.getBoundingClientRect();
      isDown=true; startX=e.clientX; startY=e.clientY;
      const curLeft = parseFloat(pill.style.left.replace('calc(','').replace('% - 55px)',''));
      const curTop  = parseFloat(pill.style.top.replace('calc(','').replace('% - 14px)',''));
      baseLeftPct = isNaN(curLeft)? left : curLeft;
      baseTopPct  = isNaN(curTop)? top : curTop;
      e.preventDefault(); 
    });
    document.addEventListener('mousemove', e=>{
      if(!isDown) return;
      const rect = box.getBoundingClientRect();
      const dx = (e.clientX - startX) / rect.width * 100;
      const dy = (e.clientY - startY) / rect.height * 100;
      let nl = clamp(baseLeftPct + dx, 2, 98);
      let nt = clamp(baseTopPct + dy, 2, 98);
      pill.style.left = `calc(${nl}% - 55px)`;
      pill.style.top = `calc(${nt}% - 14px)`;
      t.x = nl; t.y = 100 - nt;
    });
    document.addEventListener('mouseup', ()=> isDown=false);

    pill.addEventListener('click', ()=> showDetail(t));
  });
}

function showDetail(t){
  const d = document.getElementById('detail');
  d.innerHTML = `
    <h2>${t.name}</h2>
    <div class="meta"><strong>Pilar:</strong> ${t.pillar}</div>
    <h3>Impacto no Cliente</h3><p>${t.impacto||'-'}</p>
    <h3>Riscos</h3><p>${t.riscos||'-'}</p>
    <h3>Oportunidades</h3><p>${t.oportunidades||'-'}</p>
    <h3>Alavancas de Inovação</h3><p>${(t.alavancas||[]).join(', ')}</p>
    <h3>Iniciativas Relacionadas</h3>
    <ul>${(t.iniciativas||[]).map(i=>`<li>${i}</li>`).join('')}</ul>
  `;
}

function setupButtons(data){
  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', ()=>{
    data.trends = ORIGINAL_TRENDS.map(t => ({...t}));
    renderPills(data);
    const d = document.getElementById('detail');
    d.innerHTML = `<h2>Posições resetadas</h2><p>Voltamos às posições definidas em <code>data.json</code>.</p>`;
  });
}

loadData().then(data=>{
  DATA = data;
  ORIGINAL_TRENDS = data.trends.map(t => ({...t}));
  renderPillars(data.palette);
  renderPills(data);
  setupButtons(data);
});
