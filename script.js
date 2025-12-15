
let ORIGINAL_TRENDS = null;
let DATA = null;

async function loadData(){
  const res = await fetch('data.json');
  return res.json();
}
function renderLegend(palette){
  const el = document.getElementById('legend');
  el.innerHTML='';
  Object.entries(palette).forEach(([k,v])=>{
    const item = document.createElement('div');
    item.className = 'legend-badge';
    const dot = document.createElement('span');
    dot.className = 'legend-dot';
    dot.style.background = v;
    item.append(dot, document.createTextNode(k));
    el.appendChild(item);
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

    // Initial position (percentages)
    const left = clamp(t.x ?? 50, 0, 100);
    const top = clamp(100 - (t.y ?? 50), 0, 100); // invert y (0 bottom -> 100 top)
    pill.style.left = `calc(${left}% - 60px)`;
    pill.style.top = `calc(${top}% - 16px)`;
    box.appendChild(pill);

    // Smooth drag: compute deltas from initial percentage
    let isDown = false, startX=0, startY=0, baseLeftPct=left, baseTopPct=top;
    pill.addEventListener('mousedown', e=>{ 
      const rect = box.getBoundingClientRect();
      isDown=true; startX=e.clientX; startY=e.clientY;
      // read current pct from style when drag starts
      const curLeft = parseFloat(pill.style.left.replace('calc(','').replace('% - 60px)',''));
      const curTop  = parseFloat(pill.style.top.replace('calc(','').replace('% - 16px)',''));
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
      pill.style.left = `calc(${nl}% - 60px)`;
      pill.style.top = `calc(${nt}% - 16px)`;
      // Update live but *without* snapping
      t.x = nl; t.y = 100 - nt;
    });
    document.addEventListener('mouseup', ()=> isDown=false);

    // Click detail
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
    // Restore from original
    data.trends = ORIGINAL_TRENDS.map(t => ({...t}));
    renderPills(data);
    const d = document.getElementById('detail');
    d.innerHTML = `<h2>Posições resetadas</h2><p>Voltamos às posições definidas em <code>data.json</code>.</p>`;
  });
}

loadData().then(data=>{
  DATA = data;
  // Save deep copy of original trend positions for reset
  ORIGINAL_TRENDS = data.trends.map(t => ({...t}));
  renderLegend(data.palette);
  renderPills(data);
  setupButtons(data);
});
