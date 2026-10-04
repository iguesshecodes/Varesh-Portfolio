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

  /* ---------- selected work: pinned horizontal strip (desktop only) ---------- */
  (function () {
    var section = $(".hwork"), track = $("#hworkTrack"), pct = $("#hworkPct");
    if (!section || !track || reduce) return;
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", function () {
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: {
          trigger: section, start: "top top", end: function () { return "+=" + dist(); },
          pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (self) { if (pct) pct.textContent = Math.round(self.progress * 100); }
        }
      });
      return function () { tween.kill(); gsap.set(track, { clearProps: "transform" }); };
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
    var photo = $(".hero__photo");
    if (photo) { gsap.set(photo, { y: 120, opacity: 0 }); tl.to(photo, { y: 0, opacity: 1, duration: 1.5, ease: "expo.out" }, 0.2); }
    var disc = $(".hero__disc");
    if (disc) { gsap.set(disc, { scale: 0.5 }); tl.to(disc, { scale: 0.86, duration: 1.6, ease: "expo.out" }, 0.1); }
    var trend = $(".hero__trend");
    if (trend) { gsap.set(trend, { clipPath: "inset(0 100% 0 0)" }); tl.to(trend, { clipPath: "inset(0 0% 0 0)", duration: 2, ease: "power2.inOut" }, 0.5); }
    // Safety: never leave anything hidden if the timeline stalls
    setTimeout(function () { splits.forEach(function (s) { gsap.set(s.words, { yPercent: 0 }); }); gsap.set(fades, { opacity: 1, y: 0 }); }, 6000);
  }

  var seen = false;
  try { seen = sessionStorage.getItem("vn-seen") === "1"; } catch (e) { seen = false; }

  function liftCurtain() {
    var label = $(".curtain__label", curtain);
    var name = curtain.getAttribute("data-label") || "";
    if (label) label.textContent = name;
    if (reduce) { curtain.style.display = "none"; playIntro(); return; }
    var tl = gsap.timeline();
    tl.fromTo(label, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0)
      .to(label, { opacity: 0, y: -30, duration: 0.35, ease: "power2.in" }, 0.55)
      .to(curtain, { yPercent: -100, duration: 0.95, ease: "expo.inOut" }, 0.6)
      .add(function () { playIntro(); }, 1.0)
      .add(function () { curtain.style.display = "none"; }, 1.7);
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
    curtain.style.display = "grid";
    var label = $(".curtain__label", curtain);
    if (label) { label.textContent = name || ""; gsap.set(label, { opacity: 0, y: 40 }); }
    gsap.set(curtain, { yPercent: 100 });
    var go = false;
    var tl = gsap.timeline({ onComplete: function () { if (!go) { go = true; window.location.href = href; } } });
    tl.to(curtain, { yPercent: 0, duration: 0.75, ease: "expo.inOut" })
      .to(label, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, 0.45)
      .to({}, { duration: 0.2 });
    setTimeout(function () { if (!go) { go = true; window.location.href = href; } }, 2200);
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
    if (e.persisted && curtain) { gsap.set(curtain, { yPercent: -100 }); curtain.style.display = "none"; }
  });

  window.addEventListener("load", function () { setTimeout(function () { ScrollTrigger.refresh(); }, 300); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
