/* ============================================================
   Volarity · protótipo do app — telas
   Cada função devolve o HTML de uma tela a partir de window.DADOS.
   Nenhum número é digitado à mão aqui: tudo vem de dados.js.
   app.js cuida de navegação e interações.
   ============================================================ */
(function (global) {
  'use strict';

  var D = global.DADOS;
  var kwh = D.kwh, rs = D.rs, nf = D.nf;

  /* ---------------- ícones ---------------- */

  var ICO = {
    app: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="#2B2D42"/><path d="M17 19l15 28 15-28" fill="none" stroke="#EDF2F4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="47" cy="19" r="5" fill="#D7951B"/></svg>',
    rfid: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M6 10h4M6 14h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    check: '<svg class="anel__check" viewBox="0 0 44 44" fill="none" aria-hidden="true"><circle cx="22" cy="22" r="20" stroke="currentColor" stroke-width="2.4"/><path d="M13.5 22.5l6 6 11-12" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    raio: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    vazio: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    seta: '<svg class="linha__seta" viewBox="0 0 8 13" fill="none" aria-hidden="true"><path d="M1.5 1.5 6.5 6.5l-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    esq: '<svg viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M7.5 1.5 1.5 7.5l6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dir: '<svg viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5 7.5 7.5l-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    carro: '<svg viewBox="0 0 120 60" fill="none" aria-hidden="true"><path d="M8 44h104M14 44c0-4 3-7 7-7h78c4 0 7 3 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M26 37c2-9 6-14 12-16 8-3 26-3 34 0 6 2 10 7 12 16" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M40 22h30" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="34" cy="45" r="6" stroke="currentColor" stroke-width="2.2"/><circle cx="86" cy="45" r="6" stroke="currentColor" stroke-width="2.2"/></svg>'
  };

  /* ---------------- helpers ---------------- */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function topo(rot, sub, dir) {
    return '<div class="tela__topo">' +
      '<div><p class="tela__local">' + esc(rot) + '</p>' +
      (sub ? '<p class="tela__sub">' + esc(sub) + '</p>' : '') + '</div>' +
      '<span class="tela__apto">' + esc(dir) + '</span></div>';
  }

  function anel(pct, fim) {
    var R = 80, C = 2 * Math.PI * R;
    var arco = (Math.max(0, Math.min(100, pct)) / 100) * C;
    return '<div class="anel-wrap">' +
      '<svg class="anel" viewBox="0 0 180 180" aria-hidden="true">' +
        '<circle class="anel__trilho" cx="90" cy="90" r="' + R + '"/>' +
        '<circle class="anel__arco' + (fim ? ' is-fim' : '') + '" id="anel-arco" cx="90" cy="90" r="' + R + '"' +
          ' stroke-dasharray="' + arco.toFixed(2) + ' ' + C.toFixed(2) + '"/>' +
      '</svg>' +
      '<div class="anel__centro">' +
        (fim ? ICO.check :
          '<span class="anel__pct" id="pct-val">' + pct + '<span>%</span></span>' +
          '<span class="anel__cap" id="pct-cap">até 100%</span>') +
      '</div></div>';
  }

  /* ============================================================
     (a) INÍCIO — #visao
     ============================================================ */

  function visao() {
    var A = D.AO_VIVO, C = D.CONDOMINIO;
    return topo(C.nome, 'Vaga ' + A.vaga, 'Apto ' + A.apto) +
      '<div class="card-recarga" id="card-recarga">' +
        '<span class="status" id="status-recarga">' +
          '<i class="status__ponto"></i>Carregando</span>' +
        anel(A.pct, false) +
        '<div class="dados">' +
          '<div class="dado"><span class="dado__rot">Potência</span>' +
            '<span class="dado__val" id="val-kw">' + nf(A.kw, 1) + ' kW</span></div>' +
          '<div class="dado"><span class="dado__rot">Energia</span>' +
            '<span class="dado__val" id="val-kwh">' + nf(A.kwh, 1) + ' kWh</span></div>' +
          '<div class="dado"><span class="dado__rot">Custo</span>' +
            '<span class="dado__val dado__val--realce" id="val-rs">' + rs(A.rs) + '</span></div>' +
        '</div>' +
        '<div class="card-recarga__pe">' +
          '<span id="pe-tempo">faltam <strong>1 h 20</strong> · até 100%</span>' +
          '<span>Vaga ' + A.vaga + ' · Apto ' + A.apto + '</span>' +
        '</div>' +
        '<div class="origem">' + ICO.rfid + 'Iniciada com o cartão RFID</div>' +
      '</div>' +
      '<div class="bloco-btn">' +
        '<button class="btn btn--contorno btn--bloco" id="btn-pausar">Pausar recarga</button>' +
      '</div>' +
      '<p class="rodape-dica">Tarifa Celesc de ' + D.TARIFA_TXT + '/kWh. O valor é o que você consumiu — não a conta dividida do prédio.</p>';
  }

  /* ============================================================
     (b) FILA — #fila
     ============================================================ */

  function fila() {
    var F = D.FILA;
    var linhas = F.pessoas.map(function (p, i) {
      return '<li class="linha' + (p.eu ? ' is-destaque' : '') + '">' +
        '<span class="linha__pos">' + (i + 1) + 'º</span>' +
        '<span class="linha__av' + (p.eu ? ' linha__av--tinta' : '') + '">' + esc(p.apto.slice(0, 2)) + '</span>' +
        '<span class="linha__meio">' +
          '<span class="linha__titulo">' + esc(p.nome) +
            (p.eu ? ' <span class="voce">Você</span>' : '') + '</span>' +
          '<span class="linha__meta">Apto ' + esc(p.apto) + ' · ' + p.pct + '%</span>' +
        '</span>' +
        '<span class="linha__dir">' + esc(p.previsao) + '<small>previsão</small></span>' +
      '</li>';
    }).join('');

    return topo('Carregador compartilhado', '2 pontos · Vaga 14 e 15', 'Apto ' + D.CONDOMINIO.usuario.apto) +
      '<div class="fila-topo">' +
        '<p class="fila-topo__rot">Sua posição</p>' +
        '<p class="fila-topo__pos" id="fila-pos">' + F.minhaPosicao + 'º <span>na fila</span></p>' +
        '<div class="fila-topo__pe">' +
          '<span>Entrou às <b>' + F.entrou + '</b></span>' +
          '<span>Sua vez às <b id="fila-previsao">' + F.previsao + '</b></span>' +
        '</div>' +
      '</div>' +
      '<ul class="lista" id="fila-lista">' + linhas + '</ul>' +
      '<div class="bloco-btn">' +
        '<button class="btn btn--contorno btn--bloco" id="btn-sair-fila">Sair da fila</button>' +
      '</div>' +
      '<p class="rodape-dica">A fila é a mesma no celular de todos os moradores. Quem chega depois vê a sua posição em tempo real.</p>';
  }

  /* ============================================================
     (c) GASTOS — #gastos
     ============================================================ */

  function gastos() {
    var eu = D.eu;
    var max = Math.max.apply(null, D.semanas) || 1;
    var imax = D.semanas.indexOf(Math.max.apply(null, D.semanas));
    var barras = D.semanas.map(function (v, i) {
      var h = Math.max(3, Math.round((v / max) * 46));
      return '<div class="semana">' +
        '<span class="semana__barra' + (i === imax ? ' is-atual' : '') + '" style="height:' + h + 'px"></span>' +
        '<span class="semana__rot">S' + (i + 1) + '</span></div>';
    }).join('');

    var linhas = eu.recargas.slice().reverse().map(function (r) {
      return '<li class="linha linha--recuo">' +
        '<span class="linha__meio">' +
          '<span class="linha__titulo">' + esc(r.rotulo) + '</span>' +
          '<span class="linha__meta">Vaga ' + D.CONDOMINIO.usuario.vaga + ' · cartão RFID</span>' +
        '</span>' +
        '<span class="linha__dir">' + rs(r.rs) + '<small>' + kwh(r.kwh) + '</small></span>' +
      '</li>';
    }).join('');

    return topo('Apto ' + eu.apto, 'Só o que você carregou', 'Novembro 2026') +
      '<div class="mes">' +
        '<span class="mes__nome">Novembro</span>' +
        '<span class="mes__nav">' +
          '<button class="mes__btn" id="mes-ant" aria-label="Mês anterior">' + ICO.esq + '</button>' +
          '<button class="mes__btn" id="mes-prox" aria-label="Próximo mês" disabled>' + ICO.dir + '</button>' +
        '</span>' +
      '</div>' +
      '<div class="total-mes">' +
        '<p class="total-mes__rot">Total do mês</p>' +
        '<span class="total-mes__val">' + rs(eu.rs) + '</span>' +
        '<p class="total-mes__sub">' + kwh(eu.kwh) + ' · ' + eu.n + ' recargas</p>' +
        '<div class="semanas">' + barras + '</div>' +
      '</div>' +
      '<ul class="lista">' + linhas + '</ul>' +
      '<div class="comparacao">No eletroposto público, os mesmos ' + kwh(eu.kwh) +
        ' custariam <b>' + rs(D.r2(eu.kwh * D.TARIFA_PUBLICA_MIN)) + '–' +
        rs(D.r2(eu.kwh * D.TARIFA_PUBLICA_MAX)) + '</b>.</div>';
  }

  /* ============================================================
     (d) AVISOS — #alertas
     ============================================================ */

  function alertas() {
    var itens = D.AVISOS.map(function (a, i) {
      return '<li class="aviso' + (a.novo ? '' : ' is-lido') + '" data-aviso="' + i + '">' +
        (a.novo ? '<span class="aviso__novo" aria-label="Novo"></span>' : '') +
        '<span class="aviso__ico">' + ICO.app + '</span>' +
        '<span class="aviso__meio">' +
          '<span class="aviso__topo">' +
            '<span class="aviso__titulo">' + esc(a.titulo) + '</span>' +
            '<span class="aviso__hora">' + esc(a.hora) + '</span>' +
          '</span>' +
          '<span class="aviso__corpo">' + esc(a.corpo) + '</span>' +
          (a.tipo === 'concluida' ? '<span class="aviso__tag">Carga concluída</span>' : '') +
        '</span>' +
      '</li>';
    }).join('');

    return topo('Avisos', 'Do app, no seu celular', 'Apto ' + D.CONDOMINIO.usuario.apto) +
      '<ul class="avisos" id="lista-avisos">' + itens + '</ul>' +
      '<p class="rodape-dica">Você recebe um aviso quando a recarga começa, quando termina e quando é a sua vez na fila.</p>';
  }

  /* ============================================================
     (e) SÍNDICO — #sindico
     ============================================================ */

  function sindico() {
    var T = D.TOTAL;
    var linhas = D.apartamentos.map(function (a) {
      return '<tr data-apto="' + a.apto + '" tabindex="0" aria-expanded="false">' +
          '<td>' + esc(a.apto) + '</td>' +
          '<td>' + a.n + '</td>' +
          '<td>' + nf(a.kwh, 1) + '</td>' +
          '<td>' + nf(a.rs, 2) + '</td>' +
        '</tr>';
    }).join('');

    return '<div class="sindico-cab">' +
        '<p class="sindico-cab__rot">Relatório do condomínio</p>' +
        '<p class="sindico-cab__titulo">Novembro 2026</p>' +
        '<div class="sindico-cab__meta">' +
          '<span class="chip">' + D.CONDOMINIO.unidades + ' unidades</span>' +
          '<span class="chip">' + D.CARREGADORES.length + ' carregadores · 7 kW</span>' +
          '<span class="chip">' + D.TARIFA_TXT + '/kWh</span>' +
        '</div>' +
      '</div>' +
      '<div class="tabela-wrap">' +
        '<table class="tabela">' +
          '<thead><tr><th>Apto</th><th>Recargas</th><th>kWh</th><th>R$</th></tr></thead>' +
          '<tbody id="tabela-corpo">' + linhas + '</tbody>' +
          '<tfoot><tr>' +
            '<td>Total</td><td>' + T.recargas + '</td>' +
            '<td>' + nf(T.kwh, 1) + '</td><td>' + nf(T.rs, 2) + '</td>' +
          '</tr></tfoot>' +
        '</table>' +
      '</div>' +
      '<div class="sindico-pe">' +
        '<p class="sindico-pe__frase">' +
          '<b>' + rs(T.rs) + ' saem hoje da conta do condomínio</b>' +
          'Recuperáveis de quem carregou, sem rateio para os outros ' +
          (D.CONDOMINIO.unidades - D.apartamentos.length) + ' apartamentos.</p>' +
        '<div class="sindico-pe__acoes">' +
          '<button class="btn btn--primario" id="btn-lancar">Lançar na taxa</button>' +
          '<button class="btn btn--contorno" id="btn-compartilhar">Compartilhar</button>' +
        '</div>' +
      '</div>' +
      '<p class="sindico-nota">Valores simulados de um condomínio piloto de Chapecó, com a tarifa real da Celesc. ' +
        'O medidor e a integração com a conta vêm na fase de piloto.</p>';
  }

  /* ============================================================
     CADASTRO — #cadastro (síndico)
     ============================================================ */

  function cadastro() {
    var itens = D.CADASTRO.map(function (c) {
      return '<li class="linha cadastro-item">' +
        '<span class="linha__av linha__av--tinta">' + esc(c.apto.slice(0, 2)) + '</span>' +
        '<span class="linha__meio">' +
          '<span class="linha__titulo">Apto ' + esc(c.apto) + '</span>' +
          '<span class="linha__meta">' + esc(c.carro) + '</span>' +
          '<span class="cadastro-item__cartao">' + ICO.rfid + esc(c.rfid) + '</span>' +
        '</span>' +
        '<span class="cadastro-item__placa">' + esc(c.placa) + '</span>' +
      '</li>';
    }).join('');

    return topo('Cadastro do piloto', 'Quem usa os carregadores', D.CONDOMINIO.unidades + ' unidades') +
      '<h1 class="h1-app">' + D.CADASTRO.length + ' veículos<small>' +
        'Cadastro por cartão RFID — o morador aproxima o cartão e a recarga entra no apartamento certo.</small></h1>' +
      '<ul class="lista">' + itens + '</ul>' +
      '<div class="bloco-btn">' +
        '<button class="btn btn--contorno btn--bloco" id="btn-add-rfid">Cadastrar outro cartão</button>' +
      '</div>' +
      '<p class="rodape-dica">Sem login, sem app para baixar: o cartão identifica o apartamento. ' +
        'O síndico vê a lista e o relatório fecha sozinho.</p>';
  }

  /* ============================================================
     PAINEL WEB — #dashboard (versão compacta, dentro do iPhone)
     ============================================================ */

  function dashboard() {
    var A = D.AO_VIVO, T = D.TOTAL;

    var max = Math.max.apply(null, D.semanas) || 1;
    var barras = D.semanas.map(function (v, i) {
      var h = Math.max(3, Math.round((v / max) * 56));
      return '<span class="barras__b' + (v === max ? ' is-pico' : '') + '" style="height:' + h + 'px"></span>';
    }).join('');

    var linhas = D.apartamentos.slice(0, 5).map(function (a) {
      return '<tr><td>' + esc(a.apto) + '</td><td>' + a.n + '</td>' +
        '<td>' + nf(a.kwh, 1) + '</td><td>' + nf(a.rs, 2) + '</td></tr>';
    }).join('');

    return '<div class="dash">' +
      '<div class="dash__cab">' +
        '<span class="dash__marca"><i><svg viewBox="0 0 64 64"><path d="M17 19l15 28 15-28" fill="none" stroke="#EDF2F4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg></i>Volarity</span>' +
        '<span class="dash__selo">ao vivo</span>' +
      '</div>' +
      '<div class="dash__grid">' +
        '<div class="dash-card dash-card--recarga">' +
          '<div class="dash-card__topo">' +
            '<span class="dash-card__rot">Carregando agora</span>' +
            '<span class="dash-card__vaga">Vaga ' + A.vaga + '</span>' +
          '</div>' +
          '<div class="carro">' + ICO.carro +
            '<span class="carro__wallbox"></span></div>' +
          '<div class="dash-num">' +
            '<div class="dash-num__item"><span class="dash-num__rot">Apto</span>' +
              '<span class="dash-num__val">' + A.apto + '</span></div>' +
            '<div class="dash-num__item"><span class="dash-num__rot">Potência</span>' +
              '<span class="dash-num__val" id="dash-kw">' + nf(A.kw, 1) + ' kW</span></div>' +
            '<div class="dash-num__item"><span class="dash-num__rot">Consumo</span>' +
              '<span class="dash-num__val" id="dash-kwh">' + nf(A.kwh, 1) + ' kWh</span></div>' +
          '</div>' +
          '<div class="barra-bat"><span class="barra-bat__fill" id="dash-fill" style="width:' + A.pct + '%"></span>' +
            '<span class="barra-bat__ponta" id="dash-ponta" style="left:calc(' + A.pct + '% - 2px)"></span></div>' +
          '<div class="barra-bat__legenda"><span id="dash-pct">' + A.pct + '% · faltam 1 h 20</span>' +
            '<span id="dash-rs">' + rs(A.rs) + '</span></div>' +
        '</div>' +
        '<div class="dash-card dash-card--livre">' +
          '<div class="dash-card__topo"><span class="dash-card__rot">Vaga 15</span>' +
            '<span class="dash-card__vaga">livre</span></div>' +
          '<div class="dash-livre">' +
            '<span class="dash-livre__ico">' + ICO.raio + '</span>' +
            '<span><span class="dash-livre__t">Disponível</span>' +
              '<span class="dash-livre__s">Apto 504 saiu às 06:02</span></span>' +
          '</div>' +
        '</div>' +
        '<div class="dash-card dash-card--tabela">' +
          '<div class="dash-card__topo"><span class="dash-card__rot">Custo por apartamento</span>' +
            '<span class="dash-card__vaga">nov/26</span></div>' +
          '<table class="dash-tabela">' +
            '<thead><tr><th>Apto</th><th>Rec.</th><th>kWh</th><th>R$</th></tr></thead>' +
            '<tbody>' + linhas + '</tbody>' +
            '<tfoot><tr><td>Total</td><td>' + T.recargas + '</td>' +
              '<td>' + nf(T.kwh, 1) + '</td><td>' + nf(T.rs, 2) + '</td></tr></tfoot>' +
          '</table>' +
        '</div>' +
        '<div class="dash-card dash-card--grafico">' +
          '<div class="dash-card__topo"><span class="dash-card__rot">Apto 302 · por semana</span></div>' +
          '<div class="barras">' + barras + '</div>' +
          '<div class="barras__eixo"><span>S1</span><span>S2</span><span>S3</span><span>S4</span></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---------------- exporta ---------------- */

  global.TELAS = {
    visao: visao,
    fila: fila,
    gastos: gastos,
    alertas: alertas,
    sindico: sindico,
    cadastro: cadastro,
    dashboard: dashboard,
    ICO: ICO,
    esc: esc,
    topo: topo,
    anel: anel
  };
})(window);
