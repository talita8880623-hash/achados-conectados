
(function () {
const SALAS = ["sala 22", "sala 23", "sala 24", "sala 25", "sala 02", "sala 03", "sala 07", "sala 08", "sala 27", "sala 28", "sala 29"];
  const LOCAIS = [{ n: "Quadra", k: "quadra" }, { n: "Pátio", k: "patio" }, { n: "Biblioteca", k: "biblioteca" },
    { n: "Refeitório", k: "refeitorio" }, { n: "Salas", k: "sala" }, { n: "Secretaria", k: "secretaria" }];
  const PRAZO = 30; // dias até virar "não reclamado"
  const SUG = { "Documentos": "Qual o nome que está no documento?", "Eletrônicos": "Qual adesivo ou capinha tem no aparelho?",
    "Bolsas e mochilas": "O que tem dentro da parte da frente?", "Chaves": "Quantas chaves tem e como é o chaveiro?",
    "Roupas e acessórios": "Qual a marca e tem nome na etiqueta?", "Outros": "Qual detalhe só o dono saberia?" };

  let chip = "", ord = "recentes";
  const nz = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dias = i => Math.floor((Date.now() - new Date(i.data + "T12:00:00")) / 864e5);
  const est = i => i.st === "entregue" ? "entregue" : (dias(i) >= PRAZO ? "naoreclamado" : i.st);
  ST.naoreclamado = "Não reclamado";

  $("sta").insertAdjacentHTML("beforeend", '<option value="naoreclamado">Não reclamado</option>');
  document.querySelector(".seg").insertAdjacentHTML("beforebegin",
    '<select id="ord" aria-label="Ordenar"><option value="recentes">Mais recentes</option><option value="antigos">Mais antigos</option><option value="nome">Nome A-Z</option></select>');
  document.querySelector(".bar").insertAdjacentHTML("beforebegin", '<div id="mapa" class="mapa" aria-label="Mapa da escola"></div>');
  $("londe").insertAdjacentHTML("beforebegin", '<label for="sala" id="lsala"></label><select id="sala"></select>');
  $("area").insertAdjacentHTML("beforebegin", '<button class="btn ghost" id="tema" type="button">Modo escuro</button>');
  document.querySelector("footer div").insertAdjacentHTML("beforeend",
    '<span style="display:flex;gap:10px;align-items:center"><span id="qr"></span><small>Escaneie para abrir o site</small></span>');

  window.render = function () {
    const q = nz($("q").value.trim()), c = $("cat").value, t = $("sta").value;
    const n = s => itens.filter(i => est(i) === s).length;
    $("stats").innerHTML = `<span><b>${n("aberto")}</b>em aberto</span><span><b>${n("dono")}</b>donos encontrados</span><span><b>${n("entregue")}</b>entregues</span><span><b>${n("naoreclamado")}</b>não reclamados</span>`;
    $("mapa").innerHTML = LOCAIS.map(l => {
      const k = itens.filter(i => est(i) !== "entregue" && nz(i.local).includes(l.k)).length;
      return `<button type="button" class="bloco${chip === l.k ? " sel" : ""}" data-k="${l.k}">${l.n}<small>${k} item(ns)</small></button>`;
    }).join("");
    const rank = i => ({ entregue: 2, naoreclamado: 1 }[est(i)] || 0);
    const l = itens.filter(i => (filtro === "todos" || i.tipo === filtro) && (!c || i.cat === c) && (!t || est(i) === t) &&
      (!chip || nz(i.local).includes(chip)) &&
      (!q || nz((i.nome || "") + (i.local || "") + (i.desc || "") + (i.cor || "") + (i.marca || "") + (i.sala || "")).includes(q)))
      .sort((a, b) => rank(a) - rank(b) || (ord === "nome" ? a.nome.localeCompare(b.nome, "pt") : ord === "antigos" ? a.id - b.id : b.id - a.id));
    $("lista").innerHTML = l.length ? l.map(i => {
      const lock = i.tipo === "achei" && !me && !unlocked.has(i.id), e = est(i);
      return `<article class="tag ${i.tipo} ${e === "entregue" || e === "naoreclamado" ? "done" : ""}">
      <span class="pill">${i.tipo === "perdi" ? "Perdido" : "Achado"}</span>
      <h3>${esc(i.nome)}</h3>
      ${i.foto ? `<img class="foto" src="${esc(i.foto)}" alt="Foto de ${esc(i.nome)}">` : ""}
      <div class="chips">${i.cat ? `<span>${esc(i.cat)}</span>` : ""}${i.cor ? `<span>${esc(i.cor)}</span>` : ""}${i.marca ? `<span>${esc(i.marca)}</span>` : ""}${i.sala ? `<span>Sala: ${esc(i.sala)}</span>` : ""}${i.ident ? `<span>Identificação: ${esc(i.ident)}</span>` : ""}</div>
      <p class="meta">${esc(i.local)}, ${fmt(i.data)}</p>
      ${i.desc ? `<p>${esc(i.desc)}</p>` : ""}
      ${i.onde ? `<p class="meta">${i.tipo === "achei" ? "Está:" : "Última vez visto:"} ${esc(i.onde)}</p>` : ""}
      <p class="st">${ST[e]}${e === "naoreclamado" ? ` (há ${dias(i)} dias)` : ""}</p>
      ${lock ? (i.st === "entregue" ? '<p class="hint">Este objeto já foi entregue ao dono.</p>' : `<div class="claim"><button class="btn" data-a="meu" data-id="${i.id}">É meu</button><p class="hint">Responda às perguntas de verificação para ver o contato.</p></div>`)
        : `<p class="contact">${esc(i.contato)}</p>`}
      ${i.tipo === "perdi" && i.st !== "entregue" ? `<button class="btn" data-a="enc" data-id="${i.id}" style="margin-bottom:10px">Achei este objeto</button>` : ""}
      ${me && me.admin ? `<div class="row">
        <select data-a="st" data-id="${i.id}" aria-label="Alterar situação" style="width:auto;padding:5px 8px">${["aberto", "encontrado", "dono", "entregue"].map(k => `<option value="${k}" ${k === i.st ? "selected" : ""}>${ST[k]}</option>`).join("")}</select>
        <button class="link" data-a="del" data-id="${i.id}">Excluir</button>
      </div>` : ""}
      <span class="kind"></span>
    </article>`;
    }).join("") : '<p class="empty">Nenhum item encontrado. Ajuste os filtros ou registre um item.</p>';
  };

  $("q").oninput = () => render();
  $("cat").onchange = () => render();
  $("sta").onchange = () => render();
  $("ord").onchange = () => { ord = $("ord").value; render(); };
  $("mapa").addEventListener("click", e => {
    const b = e.target.closest("button[data-k]");
    if (!b) return;
    chip = chip === b.dataset.k ? "" : b.dataset.k;
    render();
  });

  function sugerir() {
    const p = $("perg");
    if ($("tipo").value === "achei" && (!p.value || p.dataset.auto)) { p.value = SUG[$("fcat").value] || ""; p.dataset.auto = "1"; }
  }
  function ajuste() {
    const perdi = $("tipo").value === "perdi", atual = $("sala").value;
    $("lsala").textContent = perdi ? "Sua sala" : "Sala onde achou (se foi em sala)";
    $("sala").innerHTML = `<option value="">${perdi ? "Escolha sua sala" : "Não foi em sala"}</option>` + SALAS.map(s => `<option>${s}</option>`).join("");
    $("sala").value = atual; $("sala").required = perdi;
    sugerir();
  }
  $("tipo").addEventListener("change", ajuste);
  $("fcat").addEventListener("change", sugerir);
  $("perg").addEventListener("input", () => delete $("perg").dataset.auto);
  document.querySelectorAll("[data-abrir]").forEach(b => b.addEventListener("click", () => { $("perg").dataset.auto = "1"; ajuste(); }));
  $("frm").addEventListener("submit", () => {
    const it = itens[itens.length - 1];
    if (it && $("sala").value) { it.sala = $("sala").value; save(); render(); }
  });

  $("onde").insertAdjacentHTML("afterend",
    '<input id="onde-outro" maxlength="60" placeholder="Digite onde foi" aria-label="Digite onde viu o objeto" style="display:none;margin-top:8px">');
  function ondeOutro() {
    const o = $("onde");
    if (![...o.options].some(x => x.value === "Outros")) o.add(new Option("Outros", "Outros"));
    const mostrar = o.value === "Outros";
    $("onde-outro").style.display = mostrar ? "block" : "none";
    $("onde-outro").required = mostrar;
  }
  $("onde").addEventListener("change", ondeOutro);
  $("tipo").addEventListener("change", ondeOutro);
  document.querySelectorAll("[data-abrir]").forEach(b => b.addEventListener("click", () => { $("onde-outro").value = ""; ondeOutro(); }));
  $("frm").addEventListener("submit", () => {
    const it = itens[itens.length - 1], t = $("onde-outro").value.trim();
    if (it && $("onde").value === "Outros" && t) { it.onde = t; save(); render(); }
  });

  const adm = () => !!(me && me.admin);
  ["click", "change"].forEach(ev => $("lista").addEventListener(ev, e => {
    const a = e.target.dataset && e.target.dataset.a;
    if (!adm() && (a === "st" || a === "del")) e.stopImmediatePropagation();
  }, true));
  let antes = [];
  $("mbody").addEventListener("click", () => { antes = itens.map(i => [i.id, i.st]); }, true);
  $("mbody").addEventListener("click", () => {
    if (adm()) return;
    let mudou = false;
    antes.forEach(([id, st]) => { const i = itens.find(x => x.id === id); if (i && i.st !== st) { i.st = st; mudou = true; } });
    if (mudou) { save(); render(); }
  });

  const root = document.documentElement;
  const escuro = () => (root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
  const rotulo = () => { $("tema").textContent = escuro() ? "Modo claro" : "Modo escuro"; };
  try { const t = localStorage.getItem("achei-tema"); if (t) root.dataset.theme = t; } catch (e) {}
  $("tema").onclick = () => {
    root.dataset.theme = escuro() ? "light" : "dark";
    try { localStorage.setItem("achei-tema", root.dataset.theme); } catch (e) {}
    rotulo();
  };
  rotulo();

  if (window.QRCode) new QRCode($("qr"), { text: location.href, width: 84, height: 84 });

  render();

})();