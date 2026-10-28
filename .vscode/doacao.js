
(function () {
  const PRAZO = 30;

  const normalizar = texto =>
    String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const dias = item =>
    Math.floor(
      (Date.now() - new Date(item.data + "T12:00:00").getTime()) /
        86400000
    );

  const paraDoacao = item =>
    item.st !== "entregue" && dias(item) >= PRAZO;

  ST.doado = "Doado";

  const estilo = document.createElement("style");
  estilo.textContent = `
    .tag.doar .pill {
      color: var(--accent);
    }

    .tag.doar .kind {
      background: var(--accent);
    }

    .aviso-doacao {
      grid-column: 1 / -1;
      border: 1.5px dashed var(--accent);
      border-radius: 8px;
      padding: 14px;
      color: var(--mute);
    }

    .aviso-doacao b {
      color: var(--ink);
    }
  `;
  document.head.appendChild(estilo);

  const seg = document.querySelector(".seg");

  seg.insertAdjacentHTML(
    "beforeend",
    '<button type="button" data-f="doacao" aria-pressed="false">Doação</button>'
  );

  const btn = seg.querySelector('[data-f="doacao"]');
  const renderOriginal = window.render;

  btn.addEventListener("click", () => {
    filtro = "doacao";

    seg.querySelectorAll("button").forEach(botao => {
      botao.setAttribute(
        "aria-pressed",
        String(botao === btn)
      );
    });

    render();
  });

  window.render = function () {
    const todos = itens;
    const doacoes = todos.filter(paraDoacao);

    btn.textContent = `Doação (${doacoes.length})`;

    if (filtro === "doacao") {
      const busca = normalizar($("q").value.trim());
      const categoria = $("cat").value;

      const lista = doacoes
        .filter(item =>
          (!categoria || item.cat === categoria) &&
          (!busca ||
            normalizar(
              (item.nome || "") +
              (item.local || "") +
              (item.desc || "") +
              (item.cor || "") +
              (item.marca || "")
            ).includes(busca))
        )
        .sort((a, b) =>
          Number(a.st === "doado") -
            Number(b.st === "doado") ||
          a.id - b.id
        );

      $("stats").innerHTML = `
        <span>
          <b>${doacoes.filter(i => i.st !== "doado").length}</b>
          aguardando doação
        </span>
        <span>
          <b>${doacoes.filter(i => i.st === "doado").length}</b>
          doados
        </span>
      `;

      const administrador = !!(me && me.admin);

      $("lista").innerHTML = `
        <p class="aviso-doacao">
          <b>Itens parados há ${PRAZO} dias ou mais.</b>
          Objetos perdidos que não foram recuperados e objetos
          encontrados que não foram reclamados podem ser destinados
          à doação, conforme as regras da escola.
        </p>
      ` + (
        lista.length
          ? lista.map(item => `
              <article class="tag doar ${
                item.st === "doado" ? "done" : ""
              }">
                <span class="pill">
                  ${item.st === "doado" ? "Doado" : "Para doação"}
                </span>

                <h3>${esc(item.nome)}</h3>

                ${
                  item.foto
                    ? `<img class="foto"
                        src="${esc(item.foto)}"
                        alt="Foto de ${esc(item.nome)}">`
                    : ""
                }

                <div class="chips">
                  ${item.cat ? `<span>${esc(item.cat)}</span>` : ""}
                  ${item.cor ? `<span>${esc(item.cor)}</span>` : ""}
                  ${item.marca ? `<span>${esc(item.marca)}</span>` : ""}
                </div>

                <p class="meta">
                  ${esc(item.local)}, ${fmt(item.data)}
                </p>

                ${item.desc ? `<p>${esc(item.desc)}</p>` : ""}

                <p class="st">
                  ${item.tipo === "perdi" ? "Perdido" : "Achado"}
                  · parado há ${dias(item)} dias
                </p>

                ${
                  administrador
                    ? `<button class="btn"
                        type="button"
                        data-a="doar"
                        data-id="${item.id}">
                        ${
                          item.st === "doado"
                            ? "Desfazer doação"
                            : "Marcar como doado"
                        }
                      </button>`
                    : ""
                }

                <span class="kind"></span>
              </article>
            `).join("")
          : '<p class="empty">Nenhum item para doação no momento.</p>'
      );

      return;
    }

    itens = todos.filter(item => !paraDoacao(item));

    try {
      renderOriginal();
    } finally {
      itens = todos;
    }

    const ultimo = $("stats").lastElementChild;

    if (ultimo) {
      ultimo.innerHTML = `
        <b>${doacoes.filter(i => i.st !== "doado").length}</b>
        para doação
      `;
    }
  };

  $("lista").addEventListener("click", evento => {
    const botao = evento.target.closest('button[data-a="doar"]');

    if (!botao || !(me && me.admin)) return;

    const item = itens.find(
      i => i.id === Number(botao.dataset.id)
    );

    if (!item) return;

    item.st = item.st === "doado" ? "aberto" : "doado";

    save();
    render();
  });

  // Validação do telefone ou e-mail
  const contato = $("contato");

  contato.insertAdjacentHTML(
    "afterend",
    '<p class="msg" id="cmsg" style="color:var(--lost);display:none"></p>'
  );

  const mensagem =
    "Contato inválido. Digite um e-mail válido ou um telefone com DDD.";

  function contatoValido(valor) {
    valor = valor.trim();

    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
      return true;
    }

    if (!/^\+?[\d\s().-]+$/.test(valor)) {
      return false;
    }

    const numero = valor.replace(/\D/g, "");

    return (
      numero.length === 10 ||
      numero.length === 11 ||
      (
        (numero.length === 12 || numero.length === 13) &&
        numero.startsWith("55")
      )
    );
  }

  function checarContato(mostrar) {
    const valor = contato.value.trim();
    const valido = !valor || contatoValido(valor);

    contato.setCustomValidity(valido ? "" : mensagem);
    $("cmsg").textContent = mensagem;
    $("cmsg").style.display =
      valido || !mostrar ? "none" : "block";
  }

  contato.addEventListener("input", () => checarContato(true));
  contato.addEventListener("blur", () => checarContato(true));

  $("frm").addEventListener("reset", () => {
    setTimeout(() => checarContato(false), 0);
  });

  $("frm").addEventListener("submit", evento => {
    checarContato(true);

    if (!contatoValido(contato.value.trim())) {
      evento.preventDefault();
      contato.reportValidity();
    }
  });

  render();
})();
