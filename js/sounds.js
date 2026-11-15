const Sounds = (() => {
  let ctx;
  let muted = false;

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, t, dur, type = "sine", gain = 0.08) {
    if (muted) return;
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function chord(freqs, dur = 0.8) {
    const c = ac();
    const t = c.currentTime;
    freqs.forEach((f, i) => tone(f, t + i * 0.04, dur, "triangle", 0.05));
  }

  return {
    unlock() { ac(); },
    click() { tone(880, ac().currentTime, 0.04, "square", 0.03); },
    ding() {
      const t = ac().currentTime;
      tone(880, t, 0.12, "sine", 0.07);
      tone(1174, t + 0.08, 0.18, "sine", 0.06);
    },
    error() {
      const t = ac().currentTime;
      tone(220, t, 0.18, "square", 0.06);
      tone(180, t + 0.12, 0.22, "square", 0.06);
    },
    startup() { chord([523.25, 659.25, 783.99, 1046.5], 1.1); },
    logoff() { chord([1046.5, 783.99, 659.25, 392], 0.7); },
    minimize() { tone(420, ac().currentTime, 0.08, "triangle", 0.04); },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; }
  };
})();
