/* ============================================================
   Volarity · motion — GSAP + ScrollTrigger + Lenis (DESIGN §7)
   Sem JS: conteúdo visível. ?static=1 ou reduced-motion: estado final.
   O estado inicial é aplicado via JS (gsap.set), nunca em CSS.
   ============================================================ */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var ESTATICO = params.get('static') === '1';
  var REDUZ = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SEM_MOTION = ESTATICO || REDUZ;
  var E = 'power3.out';

  /* ---------- header mínimo ---------- */
  function ligarCabecalho() {
    var cabecalho = document.getElementById('cabecalho');
    var hero = document.getElementById('hero');
    if (!cabecalho || !hero || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entradas) {
      cabecalho.setAttribute('data-visivel', entradas[0].isIntersecting ? 'false' : 'true');
    }, { rootMargin: '-40% 0px 0px 0px' });
    obs.observe(hero);
  }

  /* ---------- anel de progresso ---------- */
  function desenharAnel() {
    var arcos = document.querySelectorAll('[data-arco]');
    for (var i = 0; i < arcos.length; i++) {
      var pct = parseFloat(arcos[i].getAttribute('data-arco')) || 0;
      var r = parseFloat(arcos[i].getAttribute('r')) || 82;
      var c = 2 * Math.PI * r;
      arcos[i].style.strokeDasharray = (c * pct / 100).toFixed(1) + ' ' + c.toFixed(1);
    }
  }

  /* ---------- escala do notebook (projeto de 960px) ---------- */
  function escalarNotebooks() {
    var nbs = document.querySelectorAll('.secao__produto .notebook');
    for (var i = 0; i < nbs.length; i++) {
      var nb = nbs[i];
      var pai = nb.parentElement;
      nb.style.transform = 'none';
      pai.style.height = '';
      var largura = pai.clientWidth;
      if (!largura) continue;
      var s = Math.min(1, largura / 960);
      nb.style.transform = 'scale(' + s + ')';
      pai.style.height = Math.ceil(nb.offsetHeight * s) + 'px';
    }
    /* hero: notebook decorativo atrás do iPhone */
    var mini = document.querySelector('.hero__palco .notebook');
    if (mini) {
      var palco = mini.parentElement;
      var w = palco.clientWidth;
      var s2 = Math.min(1, (w * 1.15) / 960);
      mini.style.transform = 'translate(-52%,-50%) scale(' + s2 + ')';
    }
  }

  /* ---------- contadores ---------- */
  function fmtMoeda(v) {
    return v.toFixed(2).replace('.', ',');
  }

  function contar(el, para, dur, formato) {
    var obj = { v: 0 };
    return gsap.to(obj, {
      v: para, duration: dur, ease: 'power3.out',
      onUpdate: function () { el.textContent = formato(obj.v); }
    });
  }

  /* ---------- estado final (estático / reduced motion) ---------- */
  function estadoFinal() {
    if (typeof gsap !== 'undefined') {
      gsap.set('.anim', { clearProps: 'all' });
    }
    var anims = document.querySelectorAll('.anim');
    for (var a = 0; a < anims.length; a++) {
      anims[a].style.opacity = '1';
      anims[a].style.transform = 'none';
    }
    var rs = document.querySelectorAll('[data-rs]');
    for (var j = 0; j < rs.length; j++) {
      rs[j].textContent = fmtMoeda(parseFloat(rs[j].getAttribute('data-rs')));
    }
    var linhas = document.querySelectorAll('[data-funil-linha]');
    for (var k = 0; k < linhas.length; k++) linhas[k].style.strokeDashoffset = '0';
  }

  /* ---------- motion ---------- */
  function iniciar() {
    desenharAnel();
    ligarCabecalho();
    escalarNotebooks();
    window.addEventListener('resize', escalarNotebooks);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(escalarNotebooks);

    if (SEM_MOTION || typeof gsap === 'undefined') {
      estadoFinal();
      return;
    }

    var temST = typeof ScrollTrigger !== 'undefined';
    if (temST) gsap.registerPlugin(ScrollTrigger);

    /* Lenis */
    if (typeof Lenis !== 'undefined') {
      var lenis = new Lenis({
        duration: 1.05,
        easing: function (t) { return 1 - Math.pow(1 - t, 3); },
        smoothWheel: true
      });
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      if (temST) lenis.on('scroll', ScrollTrigger.update);
    }

    /* prepara funil */
    var linhas = document.querySelectorAll('[data-funil-linha]');
    for (var l = 0; l < linhas.length; l++) {
      var len = linhas[l].getTotalLength ? linhas[l].getTotalLength() : 200;
      linhas[l].style.strokeDasharray = len;
      linhas[l].style.strokeDashoffset = len;
    }
    gsap.set('[data-funil-pulso]', { opacity: 0 });

    /* estado inicial dos elementos animados */
    var grupos = [
      { sel: '[data-anim="eyebrow"]', y: 8 },
      { sel: '[data-anim="titulo"]', y: 16 },
      { sel: '[data-anim="lead"]', y: 10 },
      { sel: '[data-anim="cta"]', y: 8 },
      { sel: '[data-anim="phone"]', y: 28 },
      { sel: '[data-anim="notebook"]', y: 30 },
      { sel: '[data-anim="tabela"]', y: 10 },
      { sel: '[data-anim="numero"]', y: 16 },
      { sel: '[data-anim="fecho"]', y: 16 },
      { sel: '[data-anim="no"]', y: 10 }
    ];
    for (var g = 0; g < grupos.length; g++) {
      gsap.set(grupos[g].sel, { opacity: 0, y: grupos[g].y });
    }

    /* ---- 1 · HERO (load) ---- */
    var tl = gsap.timeline({ defaults: { ease: E } });
    tl.to('.hero [data-anim="eyebrow"]', { opacity: 1, y: 0, duration: .4 }, .08)
      .to('.hero [data-anim="titulo"]', { opacity: 1, y: 0, duration: .62 }, .16)
      .to('.hero [data-anim="lead"]', { opacity: 1, y: 0, duration: .52 }, .38)
      .to('.hero [data-anim="cta"]', { opacity: 1, y: 0, duration: .48 }, .48)
      .to('.hero [data-anim="phone"]', { opacity: 1, y: 0, duration: .9, ease: 'power2.out' }, .3);

    /* telas do hero entram em seguida */
    gsap.fromTo('.hero .statusbar, .hero .card-recarga, .hero .botao-app, .hero .tabbar',
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: .42, stagger: .08, delay: .95, ease: E }
    );

    if (!temST) return;

    /* ---- entradas por seção ---- */
    function revelar(seletor, alvos, extra) {
      var alvo = document.querySelector(seletor);
      if (!alvo || !alvo.querySelector(alvos)) return;
      var cfg = { trigger: seletor, start: 'top 78%', once: true };
      if (extra) for (var k in extra) cfg[k] = extra[k];
      gsap.to(alvos, {
        opacity: 1, y: 0, duration: .56, ease: E, stagger: .07,
        scrollTrigger: cfg
      });
    }

    /* 2 · Morador */
    revelar('#morador', '#morador [data-anim="eyebrow"], #morador [data-anim="titulo"], #morador [data-anim="lead"]');
    gsap.to('#morador [data-anim="phone"]', {
      opacity: 1, y: 0, duration: .78, ease: 'power2.out',
      scrollTrigger: { trigger: '#morador', start: 'top 78%', once: true }
    });
    gsap.fromTo('#morador [data-push]',
      { opacity: 0, y: 10 },
      {
        opacity: 1, y: 0, duration: .38, ease: E, stagger: .11, delay: .4,
        scrollTrigger: { trigger: '#morador', start: 'top 78%', once: true }
      }
    );

    /* 3 · Fila */
    revelar('#fila', '#fila [data-anim="eyebrow"], #fila [data-anim="titulo"], #fila [data-anim="lead"]');
    gsap.to('#fila [data-anim="phone"]', {
      opacity: 1, y: 0, duration: .78, ease: 'power2.out',
      scrollTrigger: { trigger: '#fila', start: 'top 78%', once: true }
    });
    gsap.fromTo('#fila [data-fila-linha]',
      { opacity: 0, y: 8 },
      {
        opacity: 1, y: 0, duration: .32, ease: E, stagger: .07, delay: .3,
        scrollTrigger: { trigger: '#fila', start: 'top 78%', once: true }
      }
    );

    /* 4 · Síndico */
    revelar('#sindico', '#sindico [data-anim="eyebrow"], #sindico [data-anim="titulo"], #sindico [data-anim="lead"]');
    gsap.to('#sindico [data-anim="notebook"]', {
      opacity: 1, y: 0, duration: .8, ease: E,
      scrollTrigger: { trigger: '#sindico', start: 'top 78%', once: true }
    });
    gsap.to('#sindico [data-anim="tabela"]', {
      opacity: 1, y: 0, duration: .5, ease: E,
      scrollTrigger: { trigger: '#sindico [data-anim="tabela"]', start: 'top 85%', once: true }
    });

    /* contagem da coluna R$ */
    var rs = document.querySelectorAll('[data-rs]');
    for (var i = 0; i < rs.length; i++) {
      (function (el) {
        var alvo = parseFloat(el.getAttribute('data-rs'));
        el.textContent = '0,00';
        ScrollTrigger.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter: function () { contar(el, alvo, .8, fmtMoeda); }
        });
      })(rs[i]);
    }

    /* faixa Como funciona */
    gsap.timeline({ scrollTrigger: { trigger: '.funil', start: 'top 80%', once: true } })
      .to('[data-funil-linha]', {
        strokeDashoffset: 0, duration: .9, ease: 'power2.inOut', stagger: .12
      })
      .to('.funil [data-anim="no"]', {
        opacity: 1, y: 0, duration: .4, ease: E, stagger: .07
      }, .25)
      .to('[data-funil-pulso]', { opacity: 1, duration: .18, stagger: .1 }, .1)
      .to('[data-funil-pulso]', { opacity: 0, duration: .45, stagger: .1 }, .55);

    /* 5 · Prova */
    revelar('#prova', '#prova [data-anim="numero"]', { start: 'top 82%' });
    gsap.to('#prova [data-anim="fecho"]', {
      opacity: 1, y: 0, duration: .62, ease: E,
      scrollTrigger: { trigger: '#prova [data-anim="fecho"]', start: 'top 88%', once: true }
    });
    gsap.to('#prova [data-anim="phone"]', {
      opacity: 1, y: 0, duration: .8, ease: E,
      scrollTrigger: { trigger: '#prova [data-anim="phone"]', start: 'top 88%', once: true }
    });

    /* número 585 conta uma vez */
    var num = document.querySelector('[data-numero]');
    if (num) {
      var alvoNum = parseInt(num.getAttribute('data-numero'), 10);
      num.textContent = '0';
      ScrollTrigger.create({
        trigger: num, start: 'top 88%', once: true,
        onEnter: function () {
          contar(num, alvoNum, .8, function (v) { return Math.round(v).toString(); });
        }
      });
    }

    /* refresh após fontes */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
