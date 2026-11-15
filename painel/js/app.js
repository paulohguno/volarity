/* ============================================================
   Volarity · protótipo do app — comportamento
   Abas por hash, persona, recarga ao vivo, push, fila, compartilhar.
   Sem build, sem dependência. GSAP é opcional (só enfeite).
   ============================================================ */
(function (global) {
  'use strict';

  var D = global.DADOS, T = global.TELAS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var ESTATICO = /[?&]static=1/.test(location.search) ||
    (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (ESTATICO) document.documentElement.classList.add('is-estatico');

  var conteudo = $('#conteudo');
  var tabbar = $('#tabbar');

  var estado = {
    persona: 'morador',
    tela: 'visao',
    pausado: false,
    naFila: true,
    avosLidos: false,
    pct: D.AO_VIVO.pct,
    pctF: D.AO_VIVO.pct,
    kwh: D.AO_VIVO.kwh
  };

  /* ---------------- abas por persona ---------------- */

  var ABAS = {
    morador: [
      { id: 'visao', rot: 'Início', ico: 'M3 10.6 12 3l9 7.6V21h-6v-6.4H9V21H3V10.6Z' },
      { id: 'fila', rot: 'Fila', ico: 'M9 4.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4ZM3 20c0-3.2 2.7-5.4 6-5.4s6 2.2 6 5.4' },
      { id: 'gastos', rot: 'Gastos', ico: 'M5 20V11M12 20V4M19 20v-6' },
      { id: 'alertas', rot: 'Avisos', ico: 'M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z' }
    ],
    sindico: [
      { id: 'sindico', rot: 'Relatório', ico: 'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5' },
      { id: 'cadastro', rot: 'Cadastro', ico: 'M4 5h16v14H4zM4 10h16M8 15h4' },
      { id: 'dashboard', rot: 'Painel', ico: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z' }
    ]
  };

  function montarTabbar() {
    var abas = ABAS[estado.persona];
    tabbar.innerHTML = abas.map(function (a) {
      return '<a class="tab" href="#' + a.id + '" data-aba="' + a.id + '">' +
        '<span class="tab__ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none">' +
          '<path d="' + a.ico + '" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg></span><span class="tab__lbl">' + a.rot + '</span>' +
        (a.id === 'alertas' && !estado.avosLidos
          ? '<span class="tab__ponto" id="tab-ponto"></span>' : '') +
      '</a>';
    }).join('');
    tabbar.style.gridTemplateColumns = 'repeat(' + abas.length + ', 1fr)';
    marcarTab(estado.tela);
  }

  function marcarTab(id) {
    $$('.tab', tabbar).forEach(function (a) {
      var on = a.getAttribute('data-aba') === id;
      a.classList.toggle('is-ativo', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ---------------- render ---------------- */

  function telaDoHash() {
    var id = (location.hash || '#visao').slice(1);
    var ok = ABAS[estado.persona].some(function (a) { return a.id === id; });
    return ok ? id : ABAS[estado.persona][0].id;
  }

  function personaDoHash() {
    var id = (location.hash || '').slice(1);
    if (!id) return 'morador';
    return ABAS.sindico.some(function (a) { return a.id === id; }) ? 'sindico' : 'morador';
  }

  function render() {
    var p = personaDoHash();
    if (p !== estado.persona) aplicarPersona(p);

    var id = telaDoHash();
    estado.tela = id;

    var sec = document.getElementById(id);
    if (!sec) return;
    if (!sec.innerHTML.trim()) sec.innerHTML = T[id] ? T[id]() : '';

    $$('.tela').forEach(function (s) {
      s.classList.toggle('is-ativa', s.id === id);
    });

    marcarTab(id);
    conteudo.scrollTop = 0;

    depoisDeRender(id);
  }

  /* persona: só pinta os botões e remonta a tab bar (não mexe na URL) */
  function aplicarPersona(p) {
    estado.persona = p;
    $$('.persona__btn').forEach(function (b) {
      var on = b.getAttribute('data-persona') === p;
      b.classList.toggle('is-ativo', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    montarTabbar();
  }

  function depoisDeRender(id) {
    if (id === 'visao') { ligarVisao(); ligarRecargaAoVivo(); }
    if (id === 'fila') ligarFila();
    if (id === 'gastos') ligarGastos();
    if (id === 'alertas') ligarAvisos();
    if (id === 'sindico') ligarSindico();
    if (id === 'cadastro') ligarCadastro();
    if (id === 'dashboard') ligarRecargaAoVivo();
  }

  /* ---------------- persona ---------------- */

  function trocarPersona(p) {
    if (!ABAS[p] || p === estado.persona) return;
    aplicarPersona(p);
    location.hash = '#' + ABAS[p][0].id;
  }

  /* ---------------- Início: recarga ao vivo ---------------- */

  function ligarVisao() {
    var btn = $('#btn-pausar');
    umaVez(btn, 'click', function () {
      estado.pausado = !estado.pausado;
      btn.textContent = estado.pausado ? 'Retomar recarga' : 'Pausar recarga';
      var st = $('#status-recarga');
      if (st) {
        st.className = 'status' + (estado.pausado ? ' status--parado' : '');
        st.innerHTML = '<i class="status__ponto"></i>' + (estado.pausado ? 'Recarga pausada' : 'Carregando');
      }
      if (estado.pausado) pararAoVivo(); else ligarRecargaAoVivo();
    });
  }

  function pintarAoVivo() {
    var kwh = D.kwh(estado.kwh), rs = D.rs(Math.round(estado.kwh * D.TARIFA * 100) / 100);

    setTxt('#val-kwh', kwh);
    setTxt('#val-rs', rs);
    setTxt('#dash-kwh', kwh);
    setTxt('#dash-rs', rs);
    setTxt('#dash-pct', estado.pct + '% · faltam ' + restaTempo());

    var pct = $('#pct-val');
    if (pct) pct.innerHTML = estado.pct + '<span>%</span>';
    var arco = $('#anel-arco');
    if (arco) {
      var C = 2 * Math.PI * 80;
      arco.setAttribute('stroke-dasharray', ((estado.pct / 100) * C).toFixed(2) + ' ' + C.toFixed(2));
    }
    var fill = $('#dash-fill');
    if (fill) fill.style.width = estado.pct + '%';
    var ponta = $('#dash-ponta');
    if (ponta) ponta.style.left = 'calc(' + estado.pct + '% - 2px)';
  }

  function restaTempo() {
    var min = Math.max(0, Math.round((100 - estado.pct) * (80 / 36)));
    var h = Math.floor(min / 60), m = min % 60;
    if (h && m) return h + ' h ' + (m < 10 ? '0' + m : m);
    if (h) return h + ' h';
    return m + ' min';
  }

  function setTxt(sel, txt) {
    var el = $(sel);
    if (el) el.textContent = txt;
  }

  /* liga um handler uma única vez por elemento (render roda a cada hashchange) */
  function umaVez(el, ev, fn) {
    if (!el) return;
    var chave = 'lig_' + ev;
    if (el.dataset[chave]) return;
    el.dataset[chave] = '1';
    el.addEventListener(ev, fn);
  }

  var timerAoVivo = null;
  var KWH_INI = D.AO_VIVO.kwh;      // 22,4 kWh em 64%
  var KWH_FIM = 55.1;               // 55,1 kWh em 100% (recarga concluída do MVP)
  var PCT_INI = D.AO_VIVO.pct;

  /* kWh acompanha o %: os dois sobem juntos, R$ = kWh × 0,9213 */
  function kwhDePorcento(pf) {
    var t = Math.max(0, Math.min(1, (pf - PCT_INI) / (100 - PCT_INI)));
    return KWH_INI + t * (KWH_FIM - KWH_INI);
  }

  function ligarRecargaAoVivo() {
    if (ESTATICO || estado.pausado) return;
    pararAoVivo();
    estado.pctF = estado.pct;
    estado.kwh = kwhDePorcento(estado.pctF);
    pintarAoVivo();

    timerAoVivo = global.setInterval(function () {
      if (estado.tela !== 'visao' && estado.tela !== 'dashboard') return;
      /* +1% a cada ~6 s (900 ms × 6,7), como no roteiro da demo */
      estado.pctF = Math.min(100, estado.pctF + 0.15);
      estado.pct = Math.floor(estado.pctF);
      estado.kwh = kwhDePorcento(estado.pctF);
      if (estado.pctF >= 100) {
        estado.pct = 100;
        estado.kwh = KWH_FIM;
        pararAoVivo();
        concluirRecarga();
        mostrarPush('Carga concluída', D.kwh(KWH_FIM) + ' · ' + D.rs(50.76), 'Apto 302 · Vaga 14');
      }
      pintarAoVivo();
    }, 900);
  }

  function pararAoVivo() {
    if (timerAoVivo) { global.clearInterval(timerAoVivo); timerAoVivo = null; }
  }

  function concluirRecarga() {
    var st = $('#status-recarga');
    if (st) { st.className = 'status status--fim'; st.innerHTML = '<i class="status__ponto"></i>Carga concluída'; }
    var arco = $('#anel-arco');
    if (arco) arco.classList.add('is-fim');
    var centro = $('.anel__centro');
    if (centro) centro.innerHTML = T.ICO.check;
    var pe = $('#pe-tempo');
    if (pe) pe.innerHTML = '<strong>' + D.kwh(KWH_FIM) + ' · ' + D.rs(50.76) + '</strong>';
    var btn = $('#btn-pausar');
    if (btn) { btn.textContent = 'Nova recarga'; }
  }

  /* ---------------- Fila ---------------- */

  function ligarFila() {
    var sair = $('#btn-sair-fila');
    umaVez(sair, 'click', function () {
      estado.naFila = false;
      var lista = $('#fila-lista');
      var topo = $('.fila-topo');
      if (topo) topo.remove();
      if (lista) lista.innerHTML =
        '<li class="fila-vazia">Você saiu da fila. Toque em <b>Entrar na fila</b> quando quiser voltar.</li>';
      sair.outerHTML =
        '<button class="btn btn--primario btn--bloco" id="btn-entrar-fila">Entrar na fila</button>';
      ligarFila();
      mostrarPush('Fila', 'Você saiu da fila', 'Vaga 14 · Apto ' + D.CONDOMINIO.usuario.apto);
    });

    var entrar = $('#btn-entrar-fila');
    umaVez(entrar, 'click', function () {
      estado.naFila = true;
      avancoFeito = false;
      var sec = document.getElementById('fila');
      sec.innerHTML = T.fila();
      depoisDeRender('fila');
      mostrarPush('Vaga 15 livre', 'Sua vez em breve', 'Você entrou na fila · 1º da fila');
      ligarAvancoFila();
    });

    var comecar = $('#btn-comecar');
    umaVez(comecar, 'click', function () {
      location.hash = '#visao';
      mostrarPush('Recarga iniciada', 'Vaga 15 · Apto ' + D.CONDOMINIO.usuario.apto, 'Cartão RFID lido');
    });

    ligarAvancoFila();
  }

  var avancoFeito = false;

  function ligarAvancoFila() {
    if (ESTATICO || avancoFeito) return;
    var alvo = $('#fila-pos');
    if (!alvo) return;
    avancoFeito = true;
    global.setTimeout(function () {
      if (estado.tela !== 'fila') return;
      var lista = $('#fila-lista');
      if (!lista) return;
      var voce = $('.linha.is-destaque', lista);
      var anterior = lista.firstElementChild;
      if (voce && anterior && anterior !== voce) {
        lista.insertBefore(voce, anterior);
        $$('.linha__pos', lista).forEach(function (p, i) { p.textContent = (i + 1) + 'º'; });
        var pos = $('#fila-pos');
        if (pos) pos.innerHTML = '1º <span>na fila</span>';
        setTxt('#fila-previsao', 'agora');
        var rot = $('.fila-topo__rot');
        if (rot) rot.textContent = 'Sua vez';
        var pe = $('.fila-topo__pe');
        if (pe) pe.innerHTML = '<span>Carregador da Vaga 15 livre</span><span><b>10 min</b> para começar</span>';
        var btnSair = $('#btn-sair-fila');
        if (btnSair) {
          /* troca o botão por um novo (o handler antigo de "sair" não vem junto) */
          var novo = document.createElement('button');
          novo.id = 'btn-comecar';
          novo.className = 'btn btn--primario btn--bloco';
          novo.textContent = 'Começar recarga';
          btnSair.replaceWith(novo);
          umaVez(novo, 'click', function () {
            location.hash = '#visao';
            mostrarPush('Recarga iniciada', 'Vaga 15 · Apto ' + D.CONDOMINIO.usuario.apto, 'Cartão RFID lido');
          });
        }
        mostrarPush('Sua vez', 'Carregador da Vaga 15 livre', 'Você tem 10 min para começar');
        ligarFila();
      }
    }, 5200);
  }

  /* ---------------- Gastos ---------------- */

  function ligarGastos() {
    var ant = $('#mes-ant');
    umaVez(ant, 'click', function () {
      var sec = document.getElementById('gastos');
      sec.innerHTML =
        '<div class="tela__topo"><div><p class="tela__local">Apto ' + D.eu.apto + '</p>' +
        '<p class="tela__sub">Só o que você carregou</p></div>' +
        '<span class="tela__apto">Outubro 2026</span></div>' +
        '<div class="mes"><span class="mes__nome">Outubro</span>' +
        '<span class="mes__nav"><button class="mes__btn" id="mes-voltar" aria-label="Voltar">' +
        T.ICO.dir + '</button></span></div>' +
        '<div class="vazio"><span class="vazio__ico">' + T.ICO.vazio + '</span>' +
        '<p class="vazio__t">Nenhuma recarga em outubro</p>' +
        '<p class="vazio__s">O carro elétrico entrou no prédio em novembro.</p></div>';
      $('#mes-voltar').addEventListener('click', function () {
        sec.innerHTML = T.gastos();
        ligarGastos();
      });
    });
  }

  /* ---------------- Avisos ---------------- */

  function ligarAvisos() {
    estado.avosLidos = true;
    var ponto = $('#tab-ponto');
    if (ponto) ponto.remove();
    $$('.aviso').forEach(function (a) {
      umaVez(a, 'click', function () {
        a.classList.add('is-lido');
        var novo = $('.aviso__novo', a);
        if (novo) novo.remove();
      });
    });
  }

  /* ---------------- Síndico ---------------- */

  function ligarSindico() {
    $$('tr[data-apto]').forEach(function (tr) {
      function alterna() {
        var apto = tr.getAttribute('data-apto');
        var aberta = tr.classList.contains('is-aberta');
        $$('.tabela__detalhe').forEach(function (d) { d.remove(); });
        $$('tr.is-aberta').forEach(function (r) {
          r.classList.remove('is-aberta');
          r.setAttribute('aria-expanded', 'false');
        });
        if (aberta) return;

        var a = D.apartamentos.filter(function (x) { return x.apto === apto; })[0];
        var det = document.createElement('tr');
        det.className = 'tabela__detalhe';
        det.innerHTML = '<td colspan="4"><ul>' + a.recargas.map(function (r) {
          return '<li><span>' + r.rotulo + '</span><b>' + D.kwh(r.kwh) + ' · ' + D.rs(r.rs) + '</b></li>';
        }).join('') + '</ul></td>';
        tr.after(det);
        tr.classList.add('is-aberta');
        tr.setAttribute('aria-expanded', 'true');
      }
      umaVez(tr, 'click', alterna);
      umaVez(tr, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alterna(); }
      });
    });

    var lancar = $('#btn-lancar');
    umaVez(lancar, 'click', function () {
      lancar.textContent = 'Lançado na taxa ✓';
      lancar.disabled = true;
      mostrarPush('Volarity · Síndico', 'Lançado na taxa de novembro',
        D.rs(D.TOTAL.rs) + ' em ' + D.apartamentos.length + ' apartamentos');
    });

    var comp = $('#btn-compartilhar');
    umaVez(comp, 'click', compartilhar);
  }

  /* ---------------- compartilhar ---------------- */

  function resumoTexto() {
    var T2 = D.TOTAL;
    var linhas = D.apartamentos.map(function (a) {
      return a.apto + ': ' + D.nf(a.kwh, 1) + ' kWh · ' + D.rs(a.rs);
    }).join('\n');
    return 'Recarga de carro elétrico · ' + D.CONDOMINIO.nome + ' · novembro 2026\n\n' +
      linhas + '\n\n' +
      'Total: ' + D.nf(T2.kwh, 1) + ' kWh · ' + D.rs(T2.rs) + ' em ' + T2.recargas + ' recargas\n' +
      'Tarifa Celesc ' + D.TARIFA_TXT + '/kWh · ' +
      D.apartamentos.length + ' de ' + D.CONDOMINIO.unidades + ' apartamentos com carro elétrico\n\n' +
      'Sem rateio: cada morador paga o que carregou.\n' +
      '(Dados simulados de um condomínio piloto.)';
  }

  function compartilhar() {
    var texto = resumoTexto();
    var res = $('#sheet-resumo');
    if (res) res.textContent = texto;
    var sheet = $('#sheet');
    if (sheet) { sheet.hidden = false; }

    if (navigator.share) {
      navigator.share({ title: 'Relatório Volarity · novembro', text: texto })
        .catch(function () { /* usuário cancelou */ });
      return;
    }
    copiar(texto, '#sheet-copiar', 'Copiar resumo');
  }

  function copiar(texto, sel, rotOriginal) {
    var btn = $(sel);
    function feito() {
      if (!btn) return;
      btn.textContent = 'Copiado ✓';
      global.setTimeout(function () { btn.textContent = rotOriginal; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(feito).catch(function () { fallback(); });
    } else { fallback(); }

    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:absolute;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); feito(); } catch (e) { /* ignora */ }
      document.body.removeChild(ta);
    }
  }

  /* ---------------- Cadastro ---------------- */

  function ligarCadastro() {
    var btn = $('#btn-add-rfid');
    umaVez(btn, 'click', function () {
      btn.textContent = 'Cartão lido · cadastro na fase de piloto';
      btn.disabled = true;
    });
  }

  /* ---------------- push ---------------- */

  var pushTimer = null;

  function mostrarPush(titulo, corpo, sub) {
    var push = $('#push');
    if (!push) return;
    setTxt('#push-hora', 'agora');
    setTxt('#push-titulo', titulo);
    setTxt('#push-corpo', corpo);
    push.classList.add('is-visivel');
    if (pushTimer) global.clearTimeout(pushTimer);
    pushTimer = global.setTimeout(function () {
      push.classList.remove('is-visivel');
    }, ESTATICO ? 6000 : 5200);
  }

  /* ---------------- relógio / init ---------------- */

  function relogio() {
    var el = $('#hora-status');
    if (!el) return;
    var d = new Date();
    el.textContent = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  }

  function ligarSheet() {
    $$('[data-fechar-sheet]').forEach(function (el) {
      el.addEventListener('click', function () { $('#sheet').hidden = true; });
    });
    var copiarBtn = $('#sheet-copiar');
    if (copiarBtn) copiarBtn.addEventListener('click', function () {
      copiar(resumoTexto(), '#sheet-copiar', 'Copiar resumo');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') $('#sheet').hidden = true;
    });
  }

  function init() {
    $$('.persona__btn').forEach(function (b) {
      b.addEventListener('click', function () { trocarPersona(b.getAttribute('data-persona')); });
    });

    montarTabbar();
    render();
    relogio();
    ligarSheet();

    global.addEventListener('hashchange', render);

    /* push de abertura: recarga em andamento */
    global.setTimeout(function () {
      if (estado.tela === 'visao') {
        mostrarPush('Carregando · ' + estado.pct + '% · faltam ' + restaTempo(), 'Vaga 14 · Apto 302');
      }
    }, ESTATICO ? 400 : 2200);

    /* quando a bateria chega em 100%, concluirRecarga() avisa (acima) */

    if (!ESTATICO) {
      document.documentElement.classList.add('is-vivo');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})(window);
