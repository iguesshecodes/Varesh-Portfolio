/* Varesh Nirbhavne portfolio: shared behaviour for every page */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var body = document.body;
  var curtain = $("#curtain");
  var loader = $("#loader");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  /* If anything essential is missing, show the page plainly and stop. */
  function plain() {
    if (curtain) curtain.style.display = "none";
    if (loader) loader.style.display = "none";
  }
  if (!hasGsap) { plain(); wireBasics(); return; }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- toast + copy (works without motion) ---------- */
  var toast = $("#toast"), toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }
  function copyText(text, done) {
    function fallback() {
      var t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", "");
      t.style.cssText = "position:fixed;opacity:0;left:0;top:0";
      document.body.appendChild(t); t.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      t.remove();
      done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else fallback();
  }
  function wireBasics() {
    $$("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        copyText(b.getAttribute("data-copy"), function (ok) {
          showToast(ok ? (b.getAttribute("data-done") || "Copied") : "Press Ctrl or Cmd + C to copy");
        });
      });
    });
    var burger = $("#menuBtn"), menu = $("#menu");
    if (burger && menu) {
      burger.addEventListener("click", function () {
        var open = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", open ? "false" : "true");
        menu.style.visibility = open ? "hidden" : "visible";
        menu.style.clipPath = open ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)";
        body.classList.toggle("is-locked", !open);
      });
    }
  }
  wireBasics();

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function lockScroll(on) {
    body.classList.toggle("is-locked", on);
    if (lenis) { if (on) lenis.stop(); else lenis.start(); }
  }

  /* ---------- menu (animated) ---------- */
  (function () {
    var burger = $("#menuBtn"), menu = $("#menu");
    if (!burger || !menu) return;
    var label = $(".bar__menu-label", burger);
    var clone = burger.cloneNode(true);
    burger.parentNode.replaceChild(clone, burger);
    burger = clone;
    label = $(".bar__menu-label", burger);
    var items = $$(".menu__links span", menu);
    var open = false;
    function set(next) {
      open = next;
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = open ? "Close" : "Menu";
      lockScroll(open);
      if (open) {
        menu.style.visibility = "visible";
        gsap.fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0.01 : 0.9, ease: "expo.inOut" });
        gsap.fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: reduce ? 0.01 : 1, stagger: 0.07, ease: "expo.out", delay: reduce ? 0 : 0.35 });
      } else {
        gsap.to(menu, { clipPath: "inset(0 0 100% 0)", duration: reduce ? 0.01 : 0.7, ease: "expo.inOut", onComplete: function () { menu.style.visibility = "hidden"; } });
      }
    }
    burger.addEventListener("click", function () { set(!open); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) set(false); });
    window.__closeMenu = function () { if (open) set(false); };
  })();

  /* ---------- top bar hide on scroll down ---------- */
  (function () {
    var bar = $(".bar"); if (!bar) return;
    var last = 0;
    function onScroll(y) {
      bar.classList.toggle("is-solid", y > 40);
      var d = y - last;
      if (y < 120) bar.classList.remove("is-hidden");
      else if (d > 6) bar.classList.add("is-hidden");
      else if (d < -6) bar.classList.remove("is-hidden");
      last = y;
    }
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (self) { onScroll(self.scroll()); } });
  })();

  /* ---------- progress ---------- */
  (function () {
    var p = $(".progress span"); if (!p) return;
    gsap.to(p, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });
  })();

  /* ---------- split text ---------- */
  function splitNode(node, out) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var parts = n.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span"); w.className = "w";
          var c = document.createElement("span"); c.className = "c"; c.textContent = part;
          w.appendChild(c); frag.appendChild(w); out.push(c);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== "BR") splitNode(n, out);
    });
  }
  var splits = [];
  $$("[data-split]").forEach(function (el) {
    var label = el.textContent.replace(/\s+/g, " ").trim();
    el.setAttribute("aria-label", label);
    var out = [];
    splitNode(el, out);
    $$(".w", el).forEach(function (w) { w.setAttribute("aria-hidden", "true"); });
    splits.push({ el: el, words: out, intro: el.hasAttribute("data-intro") });
  });
  if (!reduce) splits.forEach(function (s) { gsap.set(s.words, { yPercent: 115 }); });

  /* ---------- rotating word ---------- */
  (function () {
    var rot = $(".rot"); if (!rot || reduce) return;
    var words = (rot.getAttribute("data-words") || "").split("|").filter(Boolean);
    var span = $("span", rot); if (words.length < 2 || !span) return;
    var i = 0;
    setInterval(function () {
      span.classList.add("out");
      setTimeout(function () {
        i = (i + 1) % words.length;
        span.textContent = words[i];
        span.classList.add("pre"); span.classList.remove("out");
        void span.offsetWidth;
        span.classList.remove("pre");
      }, 480);
    }, 2400);
  })();

  /* ---------- marquee tied to scroll speed ---------- */
  (function () {
    var track = $(".marquee__track"); if (!track || reduce) return;
    var x = 0, vel = 0;
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (self) { vel = self.getVelocity() / 60; } });
    gsap.ticker.add(function (time, dt) {
      var half = track.scrollWidth / 2; if (!half) return;
      var sp = 1.1 + Math.abs(vel) * 0.06;
      vel *= 0.9;
      x -= sp * (dt / 16.7);
      if (x <= -half) x += half;
      gsap.set(track, { x: x });
    });
  })();

  /* ---------- statement: words light up with scroll (reading emphasis) ---------- */
  (function () {
    var el = $("[data-scrub]"); if (!el) return;
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "sw"; w.textContent = part;
            frag.appendChild(w); words.push(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    if (reduce) { words.forEach(function (w) { w.classList.add("is-on"); }); return; }
    ScrollTrigger.create({
      trigger: el, start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: function (self) {
        var n = Math.round(self.progress * words.length);
        words.forEach(function (w, i) { w.classList.toggle("is-on", i < n); });
      }
    });
  })();

  /* ---------- selected work: cards stack and settle as the next one arrives ---------- */
  (function () {
    var cards = $$(".scard"); if (cards.length < 2 || reduce) return;
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", function () {
      var tws = [];
      cards.forEach(function (card, i) {
        var next = cards[i + 1]; if (!next) return;
        tws.push(gsap.to(card, {
          scale: 0.94, filter: "brightness(0.7)", ease: "none",
          scrollTrigger: { trigger: next, start: "top 90%", end: "top 20%", scrub: true }
        }));
      });
      return function () { tws.forEach(function (t) { t.kill(); }); gsap.set(cards, { clearProps: "transform,filter" }); };
    });
  })();

  /* ---------- hero: fitted giant type with a lens, living line field ---------- */
  var heroIn = null;
  (function () {
    var hero = $(".hero"); if (!hero) return;
    var lines = $$("[data-ln]", hero), chars = [];
    lines.forEach(function (ln) {
      var out = document.createDocumentFragment();
      Array.prototype.slice.call(ln.childNodes).forEach(function (n) {
        var cls = n.nodeType === 1 ? n.className : "";
        var txt = n.textContent;
        txt.split("").forEach(function (ch) {
          if (ch === " ") { out.appendChild(document.createTextNode(" ")); return; }
          var sp = document.createElement("span");
          sp.className = "ch" + (cls === "amp" ? " ch--amp" : "");
          sp.textContent = ch; out.appendChild(sp); chars.push(sp);
        });
      });
      ln.textContent = ""; ln.appendChild(out);
    });
    var title = $(".hero__title", hero);
    function fit() {
      if (!title || !lines.length) return;
      lines.forEach(function (ln) { ln.style.fontSize = "20px"; });
      var availW = title.clientWidth, cs = getComputedStyle(title);
      var availH = title.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var sizes = lines.map(function (ln) {
        ln.style.fontSize = "100px"; ln.style.width = "max-content"; ln.style.alignSelf = "flex-start";
        var w = ln.getBoundingClientRect().width; ln.style.width = ""; ln.style.alignSelf = "";
        return 100 * availW / w * 0.995;
      });
      var size = Math.min.apply(null, sizes);
      size = Math.min(size, availH / (lines.length * 1.03));
      lines.forEach(function (ln) { ln.style.fontSize = size.toFixed(1) + "px"; });
    }
    fit();
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    /* lens: letters near the pointer turn to outline */
    var px = -9999, py = -9999, raf = 0, R = 190;
    function lens() {
      raf = 0;
      chars.forEach(function (c) {
        var r = c.getBoundingClientRect();
        var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        c.style.setProperty("--k", Math.max(0, 1 - d / R).toFixed(3));
      });
    }
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    /* cursor-reactive orbs */
    var orbs = $$(".hero__orb", hero);
    var orbFactors = [0.04, -0.06, 0.03];
    if (fine && !reduce) {
      hero.addEventListener("pointermove", function (e) {
        px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(lens);
        var rect = hero.getBoundingClientRect();
        var mx = (e.clientX - rect.left) / rect.width - 0.5;
        var my = (e.clientY - rect.top) / rect.height - 0.5;
        orbs.forEach(function (orb, i) {
          var f = orbFactors[i] || 0.04;
          orb.style.transform = "translate(" + (mx * rect.width * f).toFixed(1) + "px," + (my * rect.height * f).toFixed(1) + "px)";
        });
      });
      hero.addEventListener("pointerleave", function () {
        px = -9999; py = -9999; if (!raf) raf = requestAnimationFrame(lens);
        orbs.forEach(function (orb) { orb.style.transform = "translate(0,0)"; });
      });
    }

    /* interactive dot grid with cursor glow */
    (function () {
      var canvas = document.getElementById("heroGrid");
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var gap = 44;
      var mx = -9999, my = -9999;
      var glowRadius = 180;

      function resize() {
        var rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      window.addEventListener("resize", resize);

      function draw() {
        var w = canvas.width / dpr, h = canvas.height / dpr;
        ctx.clearRect(0, 0, w, h);
        var cols = Math.ceil(w / gap) + 1;
        var rows = Math.ceil(h / gap) + 1;
        for (var r = 0; r < rows; r++) {
          for (var c = 0; c < cols; c++) {
            var x = c * gap;
            var y = r * gap;
            var dx = x - mx, dy = y - my;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var t = Math.max(0, 1 - dist / glowRadius);
            var alpha = 0.06 + t * 0.35;
            var size = 1 + t * 2.5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255," + alpha.toFixed(3) + ")";
            ctx.fill();
          }
        }
        requestAnimationFrame(draw);
      }
      draw();

      hero.addEventListener("pointermove", function (e) {
        var rect = canvas.parentElement.getBoundingClientRect();
        mx = e.clientX - rect.left;
        my = e.clientY - rect.top;
      });
      hero.addEventListener("pointerleave", function () {
        mx = -9999; my = -9999;
      });
    })();

    if (reduce) return;
    gsap.set(chars, { yPercent: 115 });
    heroIn = function () {
      gsap.to(chars, { yPercent: 0, duration: 1.25, ease: "expo.out", stagger: 0.035 });
    };
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", function () {
      var st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
      var tws = [
        gsap.to(lines[0], { xPercent: -7, ease: "none", scrollTrigger: st }),
        gsap.to(lines[1], { xPercent: 7, ease: "none", scrollTrigger: st })
      ];
      return function () { tws.forEach(function (t) { t.kill(); }); gsap.set(lines, { clearProps: "transform" }); };
    });
  })();

  /* ---------- counters ---------- */
  function counters() {
    $$("[data-count]").forEach(function (el) {
      var end = parseFloat(el.getAttribute("data-count"));
      var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
      var pre = el.getAttribute("data-pre") || "", suf = el.getAttribute("data-suf") || "";
      var fmt = function (v) { return pre + v.toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
      if (reduce) { el.textContent = fmt(end); return; }
      var o = { v: 0 };
      el.textContent = fmt(0);
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: function () { gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", onUpdate: function () { el.textContent = fmt(o.v); }, onComplete: function () { el.textContent = fmt(end); } }); }
      });
    });
  }

  /* ---------- reveals ---------- */
  function armReveals() {
    splits.forEach(function (s) {
      if (s.intro || reduce) return;
      ScrollTrigger.create({
        trigger: s.el, start: "top 90%", once: true,
        onEnter: function () { gsap.to(s.words, { yPercent: 0, duration: 1.1, stagger: 0.035, ease: "expo.out" }); }
      });
    });
    if (!reduce) {
      $$("[data-reveal]").forEach(function (el, i) {
        gsap.set(el, { opacity: 0, y: 46 });
        ScrollTrigger.create({
          trigger: el, start: "top 92%", once: true,
          onEnter: function () { gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", delay: parseFloat(el.getAttribute("data-delay") || "0") }); }
        });
      });
      $$("[data-stagger]").forEach(function (g) {
        var kids = Array.prototype.slice.call(g.children);
        gsap.set(kids, { opacity: 0, y: 40 });
        ScrollTrigger.create({
          trigger: g, start: "top 88%", once: true,
          onEnter: function () { gsap.to(kids, { opacity: 1, y: 0, duration: 1, stagger: 0.09, ease: "expo.out" }); }
        });
      });
      $$("[data-img-in]").forEach(function (el) {
        var im = $("img", el);
        gsap.set(el, { clipPath: "inset(10% 6% 10% 6% round 28px)" });
        if (im) gsap.set(im, { scale: 1.25 });
        ScrollTrigger.create({
          trigger: el, start: "top 90%", once: true,
          onEnter: function () {
            gsap.to(el, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.5, ease: "expo.out", onComplete: function () { el.style.clipPath = "none"; } });
            if (im) gsap.to(im, { scale: 1, duration: 1.8, ease: "expo.out" });
          }
        });
      });
    }
    counters();
    ScrollTrigger.refresh();
  }

  /* ---------- intro choreography ---------- */
  function playIntro() {
    var tl = gsap.timeline({ onComplete: armReveals });
    var intro = splits.filter(function (s) { return s.intro; });
    if (reduce) { armReveals(); return; }
    intro.forEach(function (s, i) {
      tl.to(s.words, { yPercent: 0, duration: 1.3, stagger: 0.06, ease: "expo.out" }, i * 0.12);
    });
    var fades = $$("[data-intro-fade]");
    if (fades.length) {
      gsap.set(fades, { opacity: 0, y: 30 });
      tl.to(fades, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "expo.out" }, 0.35);
    }
    if (heroIn) heroIn();
    // Safety: never leave anything hidden if the timeline stalls
    setTimeout(function () { splits.forEach(function (s) { gsap.set(s.words, { yPercent: 0 }); }); gsap.set(fades, { opacity: 1, y: 0 }); gsap.set($$(".hero .ch"), { yPercent: 0 }); }, 6000);
  }

  var seen = false;
  try { seen = sessionStorage.getItem("vn-seen") === "1"; } catch (e) { seen = false; }

  var strips = curtain ? $$("i", curtain) : [];
  function liftCurtain() {
    var label = $(".curtain__label", curtain);
    var name = curtain.getAttribute("data-label") || "";
    if (label) label.textContent = name;
    if (reduce) { curtain.style.display = "none"; playIntro(); return; }
    gsap.set(strips, { yPercent: 0 });
    var tl = gsap.timeline();
    tl.fromTo(label, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0)
      .to(label, { opacity: 0, y: -30, duration: 0.35, ease: "power2.in" }, 0.55)
      .to(strips, { yPercent: -100, duration: 0.9, ease: "expo.inOut", stagger: 0.07 }, 0.6)
      .add(function () { playIntro(); }, 1.05)
      .add(function () { curtain.style.display = "none"; }, 1.95);
  }

  function runLoader() {
    var cnt = $(".loader__count b", loader), bar = $(".loader__bar span", loader);
    var words = $$(".loader__words span", loader);
    curtain.style.display = "none";
    words.forEach(function (w, i) { gsap.set(w, { yPercent: i ? 105 : 0 }); });
    var o = { v: 0 };
    var tl = gsap.timeline();
    tl.to(o, { v: 100, duration: 2.5, ease: "power2.inOut", onUpdate: function () { cnt.textContent = Math.round(o.v); } }, 0)
      .to(bar, { scaleX: 1, duration: 2.5, ease: "power2.inOut" }, 0);
    words.forEach(function (w, i) {
      var t = i * 0.9;
      if (i > 0) tl.fromTo(w, { yPercent: 105 }, { yPercent: 0, duration: 0.5, ease: "expo.out" }, t);
      if (i < words.length - 1) tl.to(w, { yPercent: -105, duration: 0.32, ease: "expo.in" }, t + 0.58);
    });
    tl.to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut" }, 2.7)
      .add(function () { playIntro(); }, 3.15)
      .add(function () { loader.style.display = "none"; }, 3.8);
    try { sessionStorage.setItem("vn-seen", "1"); } catch (e) {}
  }

  if (loader && !seen && !reduce) runLoader();
  else {
    if (loader) loader.style.display = "none";
    try { sessionStorage.setItem("vn-seen", "1"); } catch (e) {}
    liftCurtain();
  }

  /* ---------- magnetic buttons + how-I-work card scrub (desktop) ---------- */
  gsap.matchMedia().add("(min-width: 900px) and (hover: hover)", function () {
    $$(".btn").forEach(function (b) {
      var xt = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3" }), yt = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3" });
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); xt((e.clientX - r.left - r.width / 2) * 0.22); yt((e.clientY - r.top - r.height / 2) * 0.3); });
      b.addEventListener("pointerleave", function () { xt(0); yt(0); });
    });
  });

  /* ---------- page transitions ---------- */
  function leave(href, name) {
    if (window.__closeMenu) window.__closeMenu();
    if (reduce || !curtain) { window.location.href = href; return; }
    curtain.style.display = "flex";
    var label = $(".curtain__label", curtain);
    if (label) { label.textContent = name || ""; gsap.set(label, { opacity: 0, y: 40 }); }
    gsap.set(strips, { yPercent: 100 });
    var go = false;
    var tl = gsap.timeline({ onComplete: function () { if (!go) { go = true; window.location.href = href; } } });
    tl.to(strips, { yPercent: 0, duration: 0.7, ease: "expo.inOut", stagger: 0.06 })
      .to(label, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, 0.5)
      .to({}, { duration: 0.2 });
    setTimeout(function () { if (!go) { go = true; window.location.href = href; } }, 2400);
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
    if (/^(https?:|mailto:|tel:|sms:)/i.test(href)) return;
    if (href.charAt(0) === "#") {
      var t = $(href); if (t) { e.preventDefault(); if (lenis) lenis.scrollTo(t, { offset: -80, duration: 1.4 }); else t.scrollIntoView({ behavior: "smooth" }); }
      return;
    }
    e.preventDefault();
    var name = a.getAttribute("data-label") || (a.textContent || "").replace(/[\s↗→]+/g, " ").trim().split(" ").slice(0, 4).join(" ");
    leave(href, name);
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && curtain) { gsap.set(strips, { yPercent: -100 }); curtain.style.display = "none"; }
  });

  /* ---------- custom cursor ---------- */
  gsap.matchMedia().add("(min-width: 900px) and (hover: hover)", function () {
    var cur = $(".cursor");
    if (!cur) return;
    var dot = $(".cursor__dot", cur), ring = $(".cursor__ring", cur);
    var xD = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power2" });
    var yD = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power2" });
    var xR = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    var yR = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("pointermove", function (e) {
      xD(e.clientX); yD(e.clientY); xR(e.clientX); yR(e.clientY);
    });
    var hovers = "a, button, .btn, .prow, [data-magnetic], input, textarea, select, .nav__link, .topbar__logo";
    document.addEventListener("pointerover", function (e) {
      if (e.target.closest && e.target.closest(hovers)) cur.classList.add("is-hover");
    });
    document.addEventListener("pointerout", function (e) {
      if (e.target.closest && e.target.closest(hovers)) cur.classList.remove("is-hover");
    });
    document.addEventListener("pointerdown", function () { cur.classList.add("is-click"); });
    document.addEventListener("pointerup", function () { cur.classList.remove("is-click"); });
    gsap.set(cur, { autoAlpha: 1 });
    document.documentElement.style.cursor = "none";
    $$("a, button, .btn").forEach(function (el) { el.style.cursor = "none"; });
  });

  /* ---------- project row cursor-following preview ---------- */
  (function () {
    var preview = $("#prowPreview");
    if (!preview) return;
    var img = $("img", preview);
    var rows = $$(".prow[data-thumb]");
    if (!rows.length) return;
    var xP = gsap.quickTo(preview, "left", { duration: 0.4, ease: "power3" });
    var yP = gsap.quickTo(preview, "top", { duration: 0.4, ease: "power3" });
    var active = false;
    rows.forEach(function (row) {
      row.addEventListener("pointerenter", function () {
        var src = row.getAttribute("data-thumb");
        if (src && img.src !== src) img.src = src;
        preview.classList.add("is-on");
        active = true;
      });
      row.addEventListener("pointermove", function (e) {
        if (!active) return;
        xP(e.clientX + 24);
        yP(e.clientY - 120);
      });
      row.addEventListener("pointerleave", function () {
        preview.classList.remove("is-on");
        active = false;
      });
    });
  })();

  /* ---------- scroll-velocity skew ---------- */
  (function () {
    if (reduce) return;
    var skewEls = $$(".sec, .prow, .scard");
    if (!skewEls.length) return;
    var proxy = { skew: 0 };
    ScrollTrigger.create({
      onUpdate: function (self) {
        var v = self.getVelocity();
        var clamp = gsap.utils.clamp(-4, 4, v / -600);
        if (Math.abs(clamp - proxy.skew) > 0.1) {
          proxy.skew = clamp;
          gsap.to(skewEls, { skewY: proxy.skew, duration: 0.6, ease: "power3", overwrite: true });
        }
      }
    });
    ScrollTrigger.addEventListener("scrollEnd", function () {
      gsap.to(skewEls, { skewY: 0, duration: 1.2, ease: "elastic.out(1, 0.3)", overwrite: true });
    });
  })();

  /* ---------- text scramble on nav link hover ---------- */
  (function () {
    if (reduce) return;
    var chars = "!<>-_\\/[]{}=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var links = $$(".nav__link, .topbar__logo span");
    links.forEach(function (el) {
      var original = el.textContent;
      var running = false;
      el.addEventListener("mouseenter", function () {
        if (running) return;
        running = true;
        var length = original.length;
        var iteration = 0;
        var interval = setInterval(function () {
          el.textContent = original.split("").map(function (c, i) {
            if (i < iteration) return original[i];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join("");
          if (iteration >= length) { clearInterval(interval); running = false; }
          iteration += 1 / 2;
        }, 35);
      });
    });
  })();

  window.addEventListener("load", function () { setTimeout(function () { ScrollTrigger.refresh(); }, 300); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
