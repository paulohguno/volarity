/* ============================================================
   Volarity · dashboard web do síndico (HTML/CSS/SVG, sem imagem)
   Montado em [data-dash-full] (seção 4) e [data-dash-mini] (hero)
   ============================================================ */
(function () {
  'use strict';

  var CARRO = '<svg class="carro-svg" viewBox="0 0 300 92" aria-hidden="true"><line class="chao" x1="0" y1="85" x2="300" y2="85"/><rect class="wb" x="6" y="18" width="28" height="48" rx="6"/><rect class="wb-tela" x="11.5" y="25" width="17" height="10" rx="2"/><circle class="led" cx="20" cy="46" r="3"/><path class="cabo" d="M20 66 C20 80 44 80 62 72 C74 66 82 60 86 54"/><g transform="translate(60 0)"><path class="corpo" d="M14 64 C14 56 16 50 22 47 L40 42 C52 30 66 24 84 22 L150 21 C166 21 178 28 190 38 L214 44 C224 46 230 52 230 60 L230 64 C230 66 228 68 226 68 L205 68 A20 20 0 0 0 165 68 L77 68 A20 20 0 0 0 37 68 L18 68 C16 68 14 66 14 64 Z"/><path class="vidro" d="M50 42 C60 32 70 27 86 26 L117 26 L117 42 Z"/><path class="vidro" d="M123 26 L148 26 C160 26 170 31 181 41 L123 42 Z"/><path class="friso" d="M120 46 V64 M30 54 H220"/><path class="farol" d="M215 48 L226 51"/><circle class="porta" cx="26" cy="53" r="2.6"/><circle class="roda" cx="57" cy="68" r="15"/><circle class="aro" cx="57" cy="68" r="8.5"/><circle class="roda" cx="185" cy="68" r="15"/><circle class="aro" cx="185" cy="68" r="8.5"/></g></svg>';

  var BARRAS = [3, 5, 2, 6, 4, 7, 3, 5, 8, 4, 6, 3, 5, 7, 4, 6, 2, 5, 7, 4, 6, 3, 5, 8, 4, 6, 3, 5, 4, 6];

  function barras() {
    var max = 8, out = '';
    for (var i = 0; i < BARRAS.length; i++) {
      out += '<i style="height:' + Math.round((BARRAS[i] / max) * 100) + '%"></i>';
    }
    return out;
  }

  function tabela(linhas) {
    var out = '<table class="dash-tabela"><thead><tr><th>Apto</th><th>Recargas</th><th>kWh</th><th>R$</th></tr></thead><tbody>';
    for (var i = 0; i < linhas.length; i++) {
      var l = linhas[i];
      out += '<tr><td>' + l[0] + '</td><td>' + l[1] + '</td><td>' + l[2] + '</td><td>' + l[3] + '</td></tr>';
    }
    out += '</tbody></table>';
    return out;
  }

  var LINHAS = [
    ['302', '4', '103,0', '94,89'],
    ['401', '2', '16,8', '15,48'],
    ['502', '2', '11,9', '10,96'],
    ['703', '1', '4,2', '3,87'],
    ['901', '1', '4,1', '3,78']
  ];

  function html(compacto) {
    return '' +
      '<aside class="dash__lado">' +
        '<div class="dash__marca">Volarity<span>gestão energética</span></div>' +
        '<ul class="dash__nav">' +
          '<li aria-current="page"><i></i>Painel</li>' +
          '<li><i></i>Recargas</li>' +
          '<li><i></i>Apartamentos</li>' +
          '<li><i></i>Relatórios</li>' +
        '</ul>' +
        '<p class="dash__selo">Bosque das Palmeiras<br>72 unidades · Chapecó, SC</p>' +
      '</aside>' +
      '<div class="dash__corpo">' +
        '<div class="dash__topo">' +
          '<div><h4>Painel · outubro</h4><p>Bosque das Palmeiras · 2 carregadores</p></div>' +
          '<span class="dash__chip">Medidor 14 · online</span>' +
        '</div>' +
        '<div class="dash__grade">' +
          '<div class="dash-card">' +
            '<div class="dash-card__rot">Vaga 14 · carregando <em>Apto 302</em></div>' +
            '<div class="carro-palco">' + CARRO +
                          '</div>' +
            '<div class="bateria"><i></i></div>' +
            '<div class="bateria__legenda"><span>18%</span><span>64%</span><span>100%</span></div>' +
            '<div class="dash-dados">' +
              '<div><span>Potência</span><b>7,2 kW</b></div>' +
              '<div><span>Energia</span><b>25,6 kWh</b></div>' +
              '<div><span>Custo</span><b>R$ 23,59</b></div>' +
              '<div><span>Restante</span><b>1 h 20</b></div>' +
            '</div>' +
            '<div class="bateria__legenda" style="margin-top:6px"><span>Início 22:41</span><span>Término 00:01</span></div>' +
          '</div>' +
          '<div class="dash-card">' +
            '<div class="dash-card__rot">Vaga 09 <em>livre</em></div>' +
            '<div class="vaga-livre">' +
              '<span class="vaga-livre__estado"><i></i>Disponível</span>' +
              '<p class="vaga-livre__prox">Próximo da fila<br><b>Apto 1104</b> · às 00:05</p>' +
              '<div class="vaga-livre__mini">' + barras() + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="dash__grade">' +
          '<div class="dash-card">' +
            '<div class="dash-card__rot">Custo por apartamento · outubro</div>' +
            tabela(LINHAS) +
          '</div>' +
          '<div class="dash-card">' +
            '<div class="dash-card__rot">kWh por dia <em>outubro</em></div>' +
            '<div class="dash-grafico">' + barras() + '</div>' +
            '<div class="dash-grafico__eixo"><span>01</span><span>15</span><span>31</span></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function montar() {
    var alvos = document.querySelectorAll('[data-dash-full], [data-dash-mini]');
    for (var i = 0; i < alvos.length; i++) {
      alvos[i].innerHTML = html(alvos[i].hasAttribute('data-dash-mini'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
