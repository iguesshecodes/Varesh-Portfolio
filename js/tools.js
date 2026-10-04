/* Tools page: campaign ROI and A/B test checker */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var gbp = function (n, d) {
    d = d || 0;
    return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  var paintRange = function (el) {
    var p = ((el.value - el.min) / (el.max - el.min)) * 100;
    el.style.setProperty("--p", p + "%");
  };

  /* tabs */
  var tabs = $$(".tab");
  var panels = $$(".tool");
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p) {
      var on = p.id === tab.getAttribute("aria-controls");
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
    roi();
    ab();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        n.focus();
        select(n);
      }
    });
  });

  /* ROI */
  var rIn = { spend: $("#iSpend"), cpc: $("#iCpc"), cr: $("#iCr"), rpc: $("#iRpc") };
  function sizeCanvas(cv) {
    var r = cv.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: r.width, h: r.height };
  }
  function roi() {
    var panel = $("#panelRoi");
    if (!panel || !panel.classList.contains("is-active")) return;
    Object.keys(rIn).forEach(function (k) { paintRange(rIn[k]); });
    var spend = +rIn.spend.value, cpc = +rIn.cpc.value, cr = +rIn.cr.value / 100, rpc = +rIn.rpc.value;
    $("#oSpend").textContent = gbp(spend);
    $("#oCpc").textContent = gbp(cpc, 2);
    $("#oCr").textContent = (cr * 100).toFixed(1) + "%";
    $("#oRpc").textContent = gbp(rpc);

    var clicks = spend / cpc, sales = clicks * cr;
    var returned = sales * rpc;
    var net = returned - spend;
    var roas = returned / spend;
    var cpa = sales > 0 ? spend / sales : 0;
    var maxCpc = cr * rpc;

    $("#kSales").textContent = Math.round(sales).toLocaleString("en-GB");
    $("#kCpa").textContent = gbp(cpa, 2);
    $("#kRoas").textContent = roas.toFixed(2) + "x";
    $("#kBe").textContent = gbp(maxCpc, 2);

    var v = $("#roiVerdict");
    var per100 = Math.abs((roas - 1) * 100);
    v.classList.remove("is-good", "is-bad", "is-meh");
    if (roas > 1.05) { v.textContent = "You keep about " + gbp(per100) + " of profit for every £100 spent."; v.classList.add("is-good"); }
    else if (roas < 0.95) { v.textContent = "You lose about " + gbp(per100) + " for every £100 spent."; v.classList.add("is-bad"); }
    else { v.textContent = "Right around break-even."; v.classList.add("is-meh"); }

    var cv = $("#roiChart");
    var s = sizeCanvas(cv), ctx = s.ctx, w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);
    var pad = { l: 6, r: 6, t: 24, b: 28 };
    var xMin = 0.1, xMax = 5;
    var f = function (x) { return spend * (maxCpc / x - 1); };
    var yHi = clamp(f(xMin), spend * 0.6, spend * 6);
    var yLo = -spend * 1.02;
    var X = function (x) { return pad.l + ((x - xMin) / (xMax - xMin)) * (w - pad.l - pad.r); };
    var Y = function (y) { return pad.t + (1 - (y - yLo) / (yHi - yLo)) * (h - pad.t - pad.b); };

    ctx.strokeStyle = "rgba(27,27,27,0.3)"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, Y(0)); ctx.lineTo(w - pad.r, Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath();
    for (var i = 0; i <= 160; i++) {
      var x = xMin + (i / 160) * (xMax - xMin);
      var y = clamp(f(x), yLo, yHi);
      if (i) ctx.lineTo(X(x), Y(y)); else ctx.moveTo(X(x), Y(y));
    }
    ctx.strokeStyle = "#0b1f66"; ctx.lineWidth = 3.5; ctx.lineJoin = "round"; ctx.stroke();
    if (maxCpc > xMin && maxCpc < xMax) {
      ctx.strokeStyle = "rgba(27,27,27,0.4)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(maxCpc), pad.t); ctx.lineTo(X(maxCpc), h - pad.b); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#06070c"; ctx.font = "600 13px 'Inter Tight', sans-serif";
      var right = X(maxCpc) > w * 0.6;
      ctx.textAlign = right ? "right" : "left";
      ctx.fillText("Break-even click cost " + gbp(maxCpc, 2), X(maxCpc) + (right ? -8 : 8), pad.t - 8);
    }
    var cy = clamp(net, yLo, yHi);
    ctx.fillStyle = net >= 0 ? "#06070c" : "#0b1f66";
    ctx.beginPath(); ctx.arc(X(cpc), Y(cy), 8, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#666666"; ctx.font = "500 12px 'Inter Tight', sans-serif"; ctx.textAlign = "left";
    ctx.fillText("Cost per click: £0.10", pad.l, h - 8);
    ctx.textAlign = "right"; ctx.fillText("£5.00", w - pad.r, h - 8);
  }
  Object.keys(rIn).forEach(function (k) { rIn[k].addEventListener("input", roi); });

  /* A/B */
  var erf = function (x) {
    var sg = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sg * y;
  };
  var Phi = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };
  var aIn = { aN: $("#aN"), aC: $("#aC"), bN: $("#bN"), bC: $("#bC") };
  var pct = function (x, d) { return (x * 100).toFixed(d == null ? 2 : d) + "%"; };
  function ab() {
    var panel = $("#panelAb");
    if (!panel || !panel.classList.contains("is-active")) return;
    var nA = Math.floor(+aIn.aN.value), cA = Math.floor(+aIn.aC.value), nB = Math.floor(+aIn.bN.value), cB = Math.floor(+aIn.bC.value);
    var v = $("#abVerdict");
    v.classList.remove("is-good", "is-bad", "is-meh");
    var bad = !(nA > 0 && nB > 0) || cA < 0 || cB < 0 || cA > nA || cB > nB || [nA, cA, nB, cB].some(function (n) { return !isFinite(n); });
    if (bad) {
      v.textContent = "Check the numbers: conversions can't be more than visitors.";
      v.classList.add("is-bad");
      ["kA", "kB", "kLift", "kP"].forEach(function (id) { $("#" + id).textContent = "-"; });
      $("#abBars").innerHTML = "";
      return;
    }
    var pA = cA / nA, pB = cB / nB;
    var pool = (cA + cB) / (nA + nB);
    var se = Math.sqrt(pool * (1 - pool) * (1 / nA + 1 / nB));
    var z = se > 0 ? (pB - pA) / se : 0;
    var p = se > 0 ? 2 * (1 - Phi(Math.abs(z))) : 1;
    var seD = Math.sqrt(pA * (1 - pA) / nA + pB * (1 - pB) / nB);
    var lo = (pB - pA) - 1.96 * seD, hi = (pB - pA) + 1.96 * seD;
    var pts = function (x) { return (x >= 0 ? "+" : "") + (x * 100).toFixed(2); };

    $("#kA").textContent = pct(pA);
    $("#kB").textContent = pct(pB);
    $("#kLift").textContent = pA > 0 ? (pB >= pA ? "+" : "") + (((pB - pA) / pA) * 100).toFixed(1) + "%" : "n/a";
    $("#kP").textContent = p < 0.001 ? "<0.001" : p.toFixed(3);

    if (p < 0.05) {
      var lead = pB > pA ? "B" : "A";
      v.textContent = "Version " + lead + " is ahead, and the gap is unlikely to be chance. The likely difference (B minus A) is " + pts(lo) + " to " + pts(hi) + " points.";
      v.classList.add("is-good");
    } else {
      v.textContent = "Not enough evidence yet. The gap could easily be noise (likely difference, B minus A: " + pts(lo) + " to " + pts(hi) + " points).";
      v.classList.add("is-meh");
    }
    var maxScale = Math.max(pA, pB, 0.0001) * 1.5;
    var bar = function (label, pr, n, cls) {
      var e = 1.96 * Math.sqrt(pr * (1 - pr) / n);
      var lft = clamp(pr - e, 0, maxScale) / maxScale * 100;
      var wid = (clamp(pr + e, 0, maxScale) - clamp(pr - e, 0, maxScale)) / maxScale * 100;
      return '<div class="abbar ' + cls + '"><span>' + label + '</span><div class="abbar__track"><div class="abbar__fill" style="width:' + (pr / maxScale * 100) + '%"></div><div class="abbar__err" style="left:' + lft + "%;width:" + wid + '%"></div></div></div>';
    };
    $("#abBars").innerHTML = bar("A", pA, nA, "abbar--a") + bar("B", pB, nB, "abbar--b");
  }
  Object.keys(aIn).forEach(function (k) { aIn[k].addEventListener("input", ab); });
  window.addEventListener("resize", roi);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(roi);
  roi();
})();
