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
      var availW = title.clientWidth, cs = getComputedStyle(title);
      var availH = title.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var sizes = lines.map(function (ln) {
        ln.style.fontSize = "100px"; ln.style.width = "max-content"; ln.style.alignSelf = "flex-start";
        var w = ln.getBoundingClientRect().width; ln.style.width = ""; ln.style.alignSelf = "";
        return 100 * availW / w * 0.995;
      });
      var size = Math.min.apply(null, sizes);
      size = Math.min(size, availH / (lines.length * 0.94));
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
    if (fine && !reduce) {
      hero.addEventListener("pointermove", function (e) { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(lens); });
      hero.addEventListener("pointerleave", function () { px = -9999; py = -9999; if (!raf) raf = requestAnimationFrame(lens); });
    }

    /* line field */
    var cv = $("#lines"), ctx = cv && cv.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, rows = 0, mx = -9999, my = -9999, tx = -9999, ty = -9999, vis = true, t0 = performance.now();
      var size = function () {
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        W = cv.clientWidth; H = cv.clientHeight;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        rows = Math.max(22, Math.round(H / 20));
      };
      var draw = function (now) {
        var t = (now - t0) * 0.00028;
        ctx.clearRect(0, 0, W, H); ctx.lineWidth = 1;
        var step = Math.max(10, W / 90);
        for (var r = 0; r < rows; r++) {
          var base = (r + 0.5) * (H / rows);
          ctx.strokeStyle = "rgba(255,255,255," + (0.07 + 0.12 * (1 - Math.abs(r / rows - 0.5) * 1.6)).toFixed(3) + ")";
          ctx.beginPath();
          for (var x = 0; x <= W + step; x += step) {
            var n = Math.sin(x * 0.0036 + t * 2.2 + r * 0.22) * 14 + Math.sin(x * 0.0085 - t * 3.1 + r * 0.5) * 6;
            var dx = x - mx, dy = base - my;
            var push = Math.exp(-(dx * dx + dy * dy) / 30000) * 52;
            var y = base + n - (dy === 0 ? 0 : (dy > 0 ? 1 : -1)) * push * 0.9;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      };
      size();
      window.addEventListener("resize", function () { size(); if (reduce) draw(performance.now()); });
      hero.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; });
      hero.addEventListener("pointerleave", function () { tx = -9999; ty = -9999; });
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(hero);
      if (reduce) draw(performance.now());
      else gsap.ticker.add(function (now) { mx += (tx - mx) * 0.08; my += (ty - my) * 0.08; if (vis) draw(performance.now()); });
    }

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
    curtain.style.display = "none";
    var o = { v: 0 };
    var tl = gsap.timeline();
    tl.to(o, { v: 100, duration: 1.9, ease: "power2.inOut", onUpdate: function () { cnt.textContent = Math.round(o.v); } }, 0)
      .to(bar, { scaleX: 1, duration: 1.9, ease: "power2.inOut" }, 0)
      .to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut" }, 2.05)
      .add(function () { playIntro(); }, 2.5)
      .add(function () { loader.style.display = "none"; }, 3.1);
    try { sessionStorage.setItem("vn-seen", "1"); } catch (e) {}
  }

  if (loader && !seen && !reduce) runLoader();
  else {
    if (loader) loader.style.display = "none";
    try { sessionStorage.setItem("vn-seen", "1"); } catch (e) {}
    liftCurtain();
  }

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

  window.addEventListener("load", function () { setTimeout(function () { ScrollTrigger.refresh(); }, 300); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
