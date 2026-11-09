// RICOCHET REAPER's sound effects, made with the Web Audio API (no files). The browser only allows sound after a key or
// tap, so the audio starts on the first one. M mutes (the choice is remembered).
var Sfx = (function () {
  "use strict";
  var ctx = null, out = null, muted = localStorage.getItem("ricochetReaperMute") === "1";
  var last = {};

  function wake() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      out = ctx.createGain();
      out.gain.value = muted ? 0 : 0.32;
      out.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
  }
  ["keydown", "pointerdown", "touchstart"].forEach(function (e) { document.addEventListener(e, wake, true); });

  // only play a sound if it hasn't played in the last gap seconds (so a big chain doesn't turn into noise)
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

  function noise(at, len, vol, freq) {
    var n = Math.floor(ctx.sampleRate * len), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    var s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = freq || 3000;
    s.buffer = buf; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(out);
    s.start(at);
  }

  return {
    toggleMute: function () {
      muted = !muted;
      localStorage.setItem("ricochetReaperMute", muted ? "1" : "0");
      if (out) out.gain.value = muted ? 0 : 0.32;
      return muted;
    },
    isMuted: function () { return muted; },
    shoot: function (bounces) {            // a falling laser zap, brighter with every bounce it will make
      if (!ok("shoot", 0.05)) return;
      var t = ctx.currentTime;
      tone("sawtooth", 1500, 220, t, 0.16, 0.16);
      tone("square", 2400, 600, t, 0.08, 0.06);
      for (var i = 0; i < bounces; i++) tone("sine", 1200 + i * 400, 1200 + i * 400, t + 0.03 + i * 0.035, 0.07, 0.12);
    },
    empty: function () {                   // a dry click: no charge
      if (!ok("empty", 0.2)) return;
      var t = ctx.currentTime;
      tone("square", 140, 90, t, 0.06, 0.15);
    },
    kill: function (mult) {                // a crunchy pop, pitched up with the multiplier
      if (!ok("kill", 0.04)) return;
      var t = ctx.currentTime, up = Math.min(2.2, 1 + mult * 0.06);
      noise(t, 0.18, 0.35, 2200);
      tone("square", 320 * up, 60, t, 0.16, 0.18);
    },
    shield: function () {                  // a metal clang
      if (!ok("shield", 0.08)) return;
      var t = ctx.currentTime;
      tone("triangle", 1900, 1700, t, 0.25, 0.2);
      tone("square", 2650, 2500, t, 0.12, 0.05);
    },
    soul: function () {                    // a soft high chime as a soul comes home
      if (!ok("soul", 0.05)) return;
      var t = ctx.currentTime;
      tone("sine", 1320 + Math.random() * 300, 1760, t, 0.09, 0.12);
    },
    hurt: function () {
      if (!ok("hurt", 0.2)) return;
      var t = ctx.currentTime;
      tone("sawtooth", 300, 50, t, 0.45, 0.3);
      noise(t, 0.35, 0.4, 900);
    },
    spit: function () {                    // a witch's curse leaving her
      if (!ok("spit", 0.1)) return;
      var t = ctx.currentTime;
      tone("triangle", 300, 700, t, 0.15, 0.12);
    },
    chainLost: function () {
      if (!ok("chain", 0.3)) return;
      var t = ctx.currentTime;
      tone("triangle", 660, 330, t, 0.25, 0.12);
    },
    wave: function () {                    // a creepy organ stab: a new wave
      if (!ok("wave", 0.5)) return;
      var t = ctx.currentTime;
      [220, 261.6, 311.1, 370].forEach(function (f, i) {
        tone("square", f, f * 0.98, t + i * 0.09, 0.6, 0.07);
        tone("triangle", f / 2, f / 2, t + i * 0.09, 0.7, 0.12);
      });
    },
    clear: function () {                   // a rising arpeggio: a wave cleared
      if (!ok("clear", 0.5)) return;
      var t = ctx.currentTime;
      [523, 659, 784, 1047].forEach(function (f, i) { tone("square", f, f, t + i * 0.08, 0.14, 0.09); });
    },
    over: function () {
      if (!ctx || muted) return;
      var t = ctx.currentTime;
      tone("square", 440, 55, t, 1.4, 0.22);
      tone("triangle", 220, 40, t, 1.6, 0.35);
      noise(t, 0.8, 0.3, 600);
    }
  };
})();
