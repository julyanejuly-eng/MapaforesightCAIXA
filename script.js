
async function loadData(){
  const res = await fetch('data.json');
  return res.json();
}
function renderLegend(palette){
  const el = document.getElementById('legend');
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
    const left = clamp(t.x, 0, 100);
    const top = clamp(100 - t.y, 0, 100); // invert y (0 bottom -> 100 top)
    pill.style.left = `calc(${left}% - 70px)`;
    pill.style.top = `calc(${top}% - 18px)`;
    box.appendChild(pill);

    // Dragging
    let isDown = false, startX=0, startY=0;
    pill.addEventListener('mousedown', e=>{ isDown=true; startX=e.clientX; startY=e.clientY; e.preventDefault(); });
    document.addEventListener('mousemove', e=>{
      if(!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const rect = box.getBoundingClientRect();
      const cur = pill.getBoundingClientRect();
      let nl = clamp((cur.left + dx - rect.left)/rect.width*100, 0, 100);
      let nt = clamp((cur.top + dy - rect.top)/rect.height*100, 0, 100);
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
    <h3>Status</h3><p>${t.status||'-'}</p>
    <h3>Alavancas de Inovação</h3><p>${(t.alavancas||[]).join(', ')}</p>
    <h3>Iniciativas Relacionadas</h3>
    <ul>${(t.iniciativas||[]).map(i=>`<li>${i}</li>`).join('')}</ul>
  `;
}

function setupCopy(data){
  const btn = document.getElementById('copyBtn');
  const out = document.getElementById('positionsOut');
  btn.addEventListener('click', ()=>{
    const payload = data.trends.map(({id,name,x,y,pillar})=>({id,name,x:Math.round(x),y:Math.round(y),pillar}));
    const txt = JSON.stringify(payload, null, 2);
    out.value = txt;
    navigator.clipboard?.writeText(txt);
  });
}

loadData().then(data=>{
  renderLegend(data.palette);
  renderPills(data);
  setupCopy(data);
});
