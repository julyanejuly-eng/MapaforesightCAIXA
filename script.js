
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
    // Positioning based on percentages
    const left = clamp(t.x ?? 50, 0, 100);
    const top = clamp(100 - (t.y ?? 50), 0, 100); // invert y (0 bottom -> 100 top)
    pill.style.left = `calc(${left}% - 70px)`;
    pill.style.top = `calc(${top}% - 18px)`;
    box.appendChild(pill);

    // Dragging within safe bounds (2%..98%)
    let isDown = false, startX=0, startY=0;
    pill.addEventListener('mousedown', e=>{ 
      isDown=true; startX=e.clientX; startY=e.clientY; e.preventDefault(); 
    });
    document.addEventListener('mousemove', e=>{
      if(!isDown) return;
      const rect = box.getBoundingClientRect();
      const pillRect = pill.getBoundingClientRect();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let nl = clamp(((pillRect.left + dx) - rect.left)/rect.width*100, 2, 98);
      let nt = clamp(((pillRect.top + dy) - rect.top)/rect.height*100, 2, 98);
      pill.style.left = `calc(${nl}% - 70px)`;
      pill.style.top = `calc(${nt}% - 18px)`;
      startX = e.clientX; startY = e.clientY;
      // persist to model (invert Y back)
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
  const copyBtn = document.getElementById('copyBtn');
  const resetBtn = document.getElementById('resetBtn');
  const out = document.getElementById('positionsOut');

  copyBtn.addEventListener('click', ()=>{
    const payload = data.trends.map(({id,name,x,y,pillar})=>({id,name,x:Math.round(x),y:Math.round(y),pillar}));
    const txt = JSON.stringify(payload, null, 2);
    out.value = txt;
    navigator.clipboard?.writeText(txt);
  });

  resetBtn.addEventListener('click', ()=>{
    // Restore from original
    data.trends = ORIGINAL_TRENDS.map(t => ({...t}));
    renderPills(data);
    out.value = '';
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
