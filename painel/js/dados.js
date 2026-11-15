/* ============================================================
   Volarity · protótipo do app — dados simulados
   Condomínio piloto fictício, novembro/2026, tarifa real da Celesc
   (R$ 0,9213/kWh). Tudo determinístico: mesma seed, mesmos números.
   Expõe window.DADOS. Nada de rede, nada de build.
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------------- tarifa e condomínio ---------------- */

  var TARIFA = 0.9213;               // R$/kWh — energia.json (Celesc)
  var TARIFA_PUBLICA_MIN = 2.19;     // eletroposto público, R$/kWh
  var TARIFA_PUBLICA_MAX = 2.49;

  var CONDOMINIO = {
    nome: 'Residencial Bosque das Palmeiras',
    cidade: 'Chapecó · SC',
    unidades: 72,
    vaga: 14,
    pontos: 2,
    hoje: '2026-11-19',
    hora: '21:52',
    usuario: { apto: '302', nome: 'Você', vaga: 14 }
  };

  var CARREGADORES = [
    { id: 'Vaga 14', kw: 7, estado: 'em uso' },
    { id: 'Vaga 15', kw: 7, estado: 'livre' }
  ];

  /* ---------------- utilidades de número ---------------- */

  function r2(v) { return Math.round(v * 100) / 100; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function custo(kwh) { return r2(kwh * TARIFA); }

  function nf(v, casas) {
    return Number(v).toFixed(casas).replace('.', ',');
  }
  function nfMilhar(v, casas) {
    var p = Number(v).toFixed(casas).split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return p.join(',');
  }
  function kwh(v) { return nf(v, 1) + ' kWh'; }
  function rs(v) { return 'R$ ' + nfMilhar(v, 2); }
  /* tarifa com 4 casas, como no briefing: R$ 0,9213/kWh */
  var TARIFA_TXT = 'R$ ' + nf(TARIFA, 4);

  /* ---------------- PRNG determinístico (mulberry32) ---------------- */

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- recargas de novembro (tabela do MVP) ----------------
     Cada linha: dia, hora, kWh. O R$ é sempre kWh × 0,9213, arredondado
     a 2 casas — por isso os totais fecham com a tabela do briefing. */

  var BRUTO = [
    { apto: '302', carro: 'Hatch elétrico', rfid: 'RFID · 04A2', recargas: [
      ['03', '22:14', 52.4], ['11', '23:02', 47.8], ['19', '21:48', 55.1] ] },
    { apto: '504', carro: 'SUV elétrico', rfid: 'RFID · 11C7', recargas: [
      ['05', '21:37', 48.6], ['14', '22:05', 51.2], ['24', '23:19', 44.8] ] },
    { apto: '201', carro: 'Hatch elétrico', rfid: 'RFID · 2B90', recargas: [
      ['07', '20:52', 56.3], ['18', '21:14', 49.7], ['28', '22:47', 42.8] ] },
    { apto: '703', carro: 'SUV elétrico', rfid: 'RFID · 7D31', recargas: [
      ['09', '23:41', 58.1], ['21', '22:26', 46.4] ] },
    { apto: '402', carro: 'Hatch elétrico', rfid: 'RFID · 5E08', recargas: [
      ['12', '21:03', 51.0], ['25', '23:08', 53.6] ] },
    { apto: '601', carro: 'SUV elétrico', rfid: 'RFID · 9F44', recargas: [
      ['16', '20:39', 45.3], ['22', '21:55', 57.2], ['29', '22:18', 48.2] ] },
    { apto: '104', carro: 'Hatch elétrico', rfid: 'RFID · 3A16', recargas: [
      ['10', '22:18', 54.7], ['22', '23:33', 49.3] ] },
    { apto: '805', carro: 'SUV elétrico', rfid: 'RFID · 6C52', recargas: [
      ['15', '21:26', 51.8], ['26', '22:09', 47.7] ] }
  ];

  /* ---------------- monta apartamentos ---------------- */

  var apartamentos = BRUTO.map(function (a) {
    var recargas = a.recargas.map(function (r) {
      return {
        dia: r[0], hora: r[1], kwh: r[2],
        rs: custo(r[2]),
        data: '2026-11-' + r[0],
        rotulo: r[0] + '/11 · ' + r[1]
      };
    });
    var totalKwh = r1(recargas.reduce(function (s, r) { return s + r.kwh; }, 0));
    var totalRs = r2(recargas.reduce(function (s, r) { return s + r.rs; }, 0));
    return {
      apto: a.apto,
      carro: a.carro,
      rfid: a.rfid,
      recargas: recargas,
      n: recargas.length,
      kwh: totalKwh,
      rs: totalRs
    };
  });

  /* ---------------- totais do condomínio ---------------- */

  var totalKwh = r1(apartamentos.reduce(function (s, a) { return s + a.kwh; }, 0));
  var totalRs = r2(apartamentos.reduce(function (s, a) { return s + a.rs; }, 0));
  var totalRecargas = apartamentos.reduce(function (s, a) { return s + a.n; }, 0);

  var TOTAL = {
    kwh: totalKwh,
    rs: totalRs,
    recargas: totalRecargas,
    publicoMin: r2(totalKwh * TARIFA_PUBLICA_MIN),
    publicoMax: r2(totalKwh * TARIFA_PUBLICA_MAX)
  };

  /* ---------------- usuário: Apto 302 ---------------- */

  var eu = apartamentos.filter(function (a) { return a.apto === '302'; })[0];

  /* recarga ao vivo: começa em 64%, 6,8 kW, 22,4 kWh, R$ 20,64 */
  var AO_VIVO = {
    pct: 64,
    kw: 6.8,
    kwh: 22.4,
    rs: custo(22.4),
    faltamMin: 80,
    vaga: 14,
    apto: '302',
    inicio: '21:52'
  };

  /* ---------------- fila ---------------- */

  var FILA = {
    entrou: '22:40',
    minhaPosicao: 2,
    previsao: '00:52',
    pessoas: [
      { nome: 'Apto 504', apto: '504', pct: 41, previsao: '23:58', eu: false },
      { nome: 'Você', apto: '302', pct: 64, previsao: '00:52', eu: true },
      { nome: 'Apto 201', apto: '201', pct: 28, previsao: '01:44', eu: false }
    ]
  };

  /* ---------------- avisos ---------------- */

  var AVISOS = [
    { tipo: 'carregando', titulo: 'Carregando · 64% · faltam 1 h 20',
      corpo: 'Vaga 14 · Apto 302 · 6,8 kW', hora: 'agora', novo: true },
    { tipo: 'concluida', titulo: 'Carga concluída · 55,1 kWh · R$ 50,76',
      corpo: 'Apto 302 · Vaga 14 · lançado em novembro', hora: '19/11, 05:12', novo: false },
    { tipo: 'vez', titulo: 'Sua vez: Vaga 15 livre',
      corpo: 'Você tem 10 min para começar a recarga', hora: '18/11, 23:40', novo: false },
    { tipo: 'liberado', titulo: 'Carregador liberado · Vaga 14',
      corpo: 'Apto 504 terminou · 44,8 kWh', hora: '17/11, 06:02', novo: false }
  ];

  /* ---------------- semanas (mini-barras de Gastos) ---------------- */

  function semanaDe(dia) {
    var d = parseInt(dia, 10);
    if (d <= 7) return 0;
    if (d <= 14) return 1;
    if (d <= 21) return 2;
    return 3;
  }

  var semanas = [0, 0, 0, 0];
  eu.recargas.forEach(function (r) { semanas[semanaDe(r.dia)] += r.kwh; });
  semanas = semanas.map(r1);

  /* ---------------- cadastro (síndico) ---------------- */

  var rnd = mulberry32(0x5EED1A);     // seed fixa: as placas são sempre as mesmas
  var LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

  var CADASTRO = apartamentos.map(function (a) {
    var l1 = LETRAS[Math.floor(rnd() * LETRAS.length)];
    var l2 = LETRAS[Math.floor(rnd() * LETRAS.length)];
    var d1 = Math.floor(rnd() * 10);
    var d2 = Math.floor(rnd() * 10);
    return {
      apto: a.apto,
      carro: a.carro,
      rfid: a.rfid,
      placa: l1 + l2 + d1 + 'X' + d2 + a.apto.slice(0, 2),
      kwh: a.kwh,
      ativo: true
    };
  });

  /* ---------------- exporta ---------------- */

  global.DADOS = {
    TARIFA: TARIFA,
    TARIFA_TXT: TARIFA_TXT,
    TARIFA_PUBLICA_MIN: TARIFA_PUBLICA_MIN,
    TARIFA_PUBLICA_MAX: TARIFA_PUBLICA_MAX,
    CONDOMINIO: CONDOMINIO,
    CARREGADORES: CARREGADORES,
    apartamentos: apartamentos,
    TOTAL: TOTAL,
    eu: eu,
    AO_VIVO: AO_VIVO,
    FILA: FILA,
    AVISOS: AVISOS,
    semanas: semanas,
    CADASTRO: CADASTRO,
    /* formatadores */
    nf: nf,
    nfMilhar: nfMilhar,
    kwh: kwh,
    rs: rs,
    custo: custo,
    r1: r1,
    r2: r2,
    mulberry32: mulberry32
  };
})(window);
