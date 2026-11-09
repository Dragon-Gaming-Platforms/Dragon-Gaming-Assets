// GRAVE DANGER's sound effects, made with the Web Audio API (no files). The browser only allows sound after a key or
// tap, so the audio starts on the first one. M mutes (the choice is remembered). With hundreds of skeletons fighting,
// every sound has a minimum gap so a battle stays a battle and not white noise.
var Sfx = (function () {
  "use strict";
  var ctx = null, out = null, muted = localStorage.getItem("graveDangerMute") === "1";
  var last = {};

  function wake() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      out = ctx.createGain();
      out.gain.value = muted ? 0 : 0.3;
      out.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
  }
  ["keydown", "pointerdown", "touchstart"].forEach(function (e) { document.addEventListener(e, wake, true); });

  function ok(name, gap) {
    if (!ctx || muted) return false;
    var t = ctx.currentTime;
    if (last[name] && t - last[name] < gap) return false;
    last[name] = t;
    return true;
  }

  function tone(type, f0, f1, at, len, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, at);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), at + len);
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + len);
    o.connect(g); g.connect(out);
    o.start(at); o.stop(at + len + 0.02);
  }

  function noise(at, len, vol, freq, type) {
    var n = Math.floor(ctx.sampleRate * len), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    var s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = type || "lowpass"; f.frequency.value = freq || 3000;
    s.buffer = buf; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(out);
    s.start(at);
  }

  return {
    toggleMute: function () {
      muted = !muted;
      localStorage.setItem("graveDangerMute", muted ? "1" : "0");
      if (out) out.gain.value = muted ? 0 : 0.3;
      return muted;
    },
    isMuted: function () { return muted; },
    cast: function () {                     // the necromancer's soul bolt
      if (!ok("cast", 0.08)) return;
      var t = ctx.currentTime;
      tone("triangle", 600, 1400, t, 0.1, 0.12);
      tone("sine", 900, 300, t + 0.05, 0.12, 0.08);
    },
    clack: function () {                    // bone on flesh, quietly, many times
      if (!ok("clack", 0.07)) return;
      var t = ctx.currentTime;
      noise(t, 0.05, 0.18, 2500 + Math.random() * 2000, "bandpass");
    },
    twang: function () {
      if (!ok("twang", 0.12)) return;
      var t = ctx.currentTime;
      tone("triangle", 520, 380, t, 0.08, 0.07);
    },
    die: function () {                      // a monster goes down
      if (!ok("die", 0.06)) return;
      var t = ctx.currentTime;
      noise(t, 0.16, 0.25, 1200);
      tone("square", 200, 60, t, 0.15, 0.08);
    },
    rise: function () {                     // a skeleton climbs out of the ground: an eerie rising wobble
      if (!ok("rise", 0.12)) return;
      var t = ctx.currentTime;
      tone("sine", 180, 720, t, 0.4, 0.1);
      tone("triangle", 270, 1080, t + 0.04, 0.36, 0.05);
      noise(t, 0.2, 0.08, 600);
    },
    boom: function () {
      if (!ok("boom", 0.1)) return;
      var t = ctx.currentTime;
      noise(t, 0.45, 0.45, 700);
      tone("sine", 140, 40, t, 0.4, 0.3);
    },
    hurt: function () {
      if (!ok("hurt", 0.25)) return;
      var t = ctx.currentTime;
      tone("sawtooth", 260, 80, t, 0.3, 0.2);
    },
    slam: function () {                     // a boss shakes the ground
      if (!ok("slam", 0.3)) return;
      var t = ctx.currentTime;
      noise(t, 0.8, 0.6, 400);
      tone("sine", 90, 30, t, 0.7, 0.5);
    },
    roar: function () {                     // a boss arrives
      if (!ctx || muted) return;
      var t = ctx.currentTime;
      tone("sawtooth", 110, 70, t, 1.4, 0.25);
      tone("square", 165, 98, t, 1.4, 0.1);
      noise(t, 1.2, 0.3, 500);
    },
    wave: function () {                     // a funeral bell for a new wave
      if (!ok("wave", 0.5)) return;
      var t = ctx.currentTime;
      [0, 0.55].forEach(function (d) {
        tone("sine", 196, 194, t + d, 1.4, 0.3);
        tone("sine", 392 * 1.18, 392 * 1.17, t + d, 0.9, 0.1);
        tone("triangle", 98, 98, t + d, 1.6, 0.2);
      });
    },
    buy: function () {
      if (!ok("buy", 0.05)) return;
      var t = ctx.currentTime;
      [659, 880, 1319].forEach(function (f, i) { tone("square", f, f, t + i * 0.06, 0.1, 0.08); });
    },
    nope: function () {
      if (!ok("nope", 0.1)) return;
      var t = ctx.currentTime;
      tone("square", 160, 120, t, 0.15, 0.12);
    },
    clear: function () {
      if (!ok("clear", 0.5)) return;
      var t = ctx.currentTime;
      [392, 466, 587, 784].forEach(function (f, i) { tone("triangle", f, f, t + i * 0.1, 0.35, 0.16); });
    },
    over: function () {
      if (!ctx || muted) return;
      var t = ctx.currentTime;
      tone("square", 392, 49, t, 1.8, 0.2);
      tone("triangle", 196, 30, t, 2, 0.35);
      noise(t, 1, 0.3, 500);
    }
  };
})();
