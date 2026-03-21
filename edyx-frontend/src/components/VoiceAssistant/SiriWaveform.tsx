import { useEffect, useRef } from "react";
import type AudioMeter from "../../lib/AudioMeter";
import type { MutableRefObject } from "react";

type WaveformProps = {
  userMeter: AudioMeter | null;
  assistantMeter?: AudioMeter | null;
  status: "idle" | "listening" | "thinking" | "speaking";
  ttsEventRef: MutableRefObject<number>;
  muted?: boolean;
};

const BAR_COUNT = 64;
const ASSISTANT_FALLBACK_BINS = 48;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function reduceFreqToBars(freqData: Uint8Array, outBars: Float32Array) {
  if (!freqData.length) {
    for (let i = 0; i < outBars.length; i += 1) outBars[i] = 0;
    return;
  }

  const step = Math.max(1, Math.floor(freqData.length / outBars.length));
  for (let i = 0; i < outBars.length; i += 1) {
    let sum = 0;
    for (let j = 0; j < step; j += 1) {
      const idx = i * step + j;
      if (idx < freqData.length) sum += freqData[idx] / 255;
    }
    outBars[i] = sum / step;
  }
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export default function SiriWaveform({ userMeter, assistantMeter = null, status, ttsEventRef, muted = false }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const meterRef = useRef(userMeter);
  const assistantMeterRef = useRef(assistantMeter);
  const statusRef = useRef(status);
  const mutedRef = useRef(muted);
  useEffect(() => { meterRef.current = userMeter; }, [userMeter]);
  useEffect(() => { assistantMeterRef.current = assistantMeter; }, [assistantMeter]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const userLevel = useRef(0);
  const asstLevel = useRef(0);
  const userFreqBars = useRef(new Float32Array(BAR_COUNT));
  const asstFreqBars = useRef(new Float32Array(BAR_COUNT));
  const userFreqSmooth = useRef(new Float32Array(BAR_COUNT));
  const asstFreqSmooth = useRef(new Float32Array(BAR_COUNT));
  const barDisplay = useRef(new Float32Array(BAR_COUNT));
  const rawTargets = useRef(new Float32Array(BAR_COUNT));
  const asstTarget = useRef(0);
  const shimmerPhase = useRef(0);
  const lastTtsEvent = useRef(0);
  const lastT = useRef(0);

  useEffect(() => {
    let raf = 0;

    const frame = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) { raf = requestAnimationFrame(frame); return; }
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(frame); return; }

      const dt = Math.min(now - (lastT.current || now), 50) / 16.667;
      lastT.current = now;

      const dpr = window.devicePixelRatio || 1;
      const dw = canvas.clientWidth;
      const dh = canvas.clientHeight;
      if (canvas.width !== dw * dpr || canvas.height !== dh * dpr) {
        canvas.width = dw * dpr;
        canvas.height = dh * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, dw, dh);

      const W = dw;
      const H = dh;
      const cy = H / 2;
      const st = statusRef.current;
      const isMuted = mutedRef.current;
      const userBars = userFreqBars.current;
      const asstBars = asstFreqBars.current;
      const userSm = userFreqSmooth.current;
      const asstSm = asstFreqSmooth.current;
      const display = barDisplay.current;
      const targets = rawTargets.current;

      const gap = 3;
      const barWidth = Math.max(5, Math.floor((W - gap * (BAR_COUNT - 1)) / BAR_COUNT));
      const totalWidth = barWidth * BAR_COUNT + gap * (BAR_COUNT - 1);
      const startX = Math.floor((W - totalWidth) / 2);

      let rawUserLevel = 0;
      const meter = meterRef.current;
      if (meter) {
        const reading = meter.read(dt);
        rawUserLevel = reading.level;
        reduceFreqToBars(reading.freqData, userBars);
      } else {
        for (let i = 0; i < BAR_COUNT; i += 1) userBars[i] = 0;
      }

      userLevel.current = lerp(
        userLevel.current, rawUserLevel,
        1 - Math.pow(0.86, dt)
      );

      let rawAssistantLevel = 0;
      const assistant = assistantMeterRef.current;
      if (assistant) {
        const reading = assistant.read(dt);
        rawAssistantLevel = reading.level;
        reduceFreqToBars(reading.freqData, asstBars);
        asstLevel.current = lerp(asstLevel.current, rawAssistantLevel, 1 - Math.pow(0.86, dt));
      }

      const curTtsEv = ttsEventRef.current;
      if (!assistant) {
        if (curTtsEv !== lastTtsEvent.current) {
          lastTtsEvent.current = curTtsEv;
          asstTarget.current = 0.55 + Math.random() * 0.28;
        }

        if (st === "speaking") {
          const base = 0.16 + Math.sin(now * 0.004) * 0.05 + Math.sin(now * 0.0021) * 0.04;
          const target = Math.max(base, asstTarget.current);
          asstLevel.current = lerp(asstLevel.current, target, 1 - Math.pow(0.85, dt));
          asstTarget.current = lerp(asstTarget.current, base, 1 - Math.pow(0.97, dt));

          for (let i = 0; i < BAR_COUNT; i += 1) {
            const p = i / Math.max(1, BAR_COUNT - 1);
            const pattern =
              Math.max(0, Math.sin((p * ASSISTANT_FALLBACK_BINS + now * 0.013) * 0.9)) * 0.6 +
              Math.max(0, Math.sin((p * ASSISTANT_FALLBACK_BINS - now * 0.009) * 0.55)) * 0.4;
            asstBars[i] = Math.min(1, pattern * (0.45 + asstLevel.current * 0.75));
          }
        } else {
          asstLevel.current = lerp(asstLevel.current, 0, 1 - Math.pow(0.96, dt));
          asstTarget.current = lerp(asstTarget.current, 0, 1 - Math.pow(0.97, dt));
          for (let i = 0; i < BAR_COUNT; i += 1) asstBars[i] = lerp(asstBars[i], 0, 1 - Math.pow(0.95, dt));
        }
      }

      const uL = isMuted ? 0 : Math.min(1, userLevel.current);
      const aL = isMuted ? 0 : Math.min(1, asstLevel.current);
      shimmerPhase.current += (0.02 + Math.max(uL, aL) * 0.03) * dt;

      const idleBase = isMuted
        ? 0.012
        : st === "thinking"
          ? 0.05
          : 0.03;

      for (let i = 0; i < BAR_COUNT; i += 1) {
        userSm[i] = lerp(userSm[i], userBars[i], 1 - Math.pow(0.86, dt));
        asstSm[i] = lerp(asstSm[i], asstBars[i], 1 - Math.pow(0.86, dt));

        const p = i / Math.max(1, BAR_COUNT - 1);
        const edgeEnvelope = Math.pow(Math.sin(p * Math.PI), 0.72);
        const lead = Math.sin(shimmerPhase.current - i * 0.18) * 0.5 + 0.5;
        const idle = idleBase * (0.55 + lead * 0.45) * (0.5 + edgeEnvelope * 0.5);

        const userEnergy = userSm[i] * (0.62 + uL * 0.9);
        const asstEnergy = asstSm[i] * (0.62 + aL * 0.9);
        const merged = Math.max(userEnergy, asstEnergy);
        targets[i] = Math.min(1, Math.max(idle, merged));
      }

      for (let i = 0; i < BAR_COUNT; i += 1) {
        const propagation = 0.18;
        const fromNeighbor = i > 0 ? display[i - 1] : targets[i];
        const propagatedTarget = targets[i] * (1 - propagation) + fromNeighbor * propagation;

        const current = display[i];
        const rise = propagatedTarget > current;
        const smoothing = rise ? 1 - Math.pow(0.78, dt) : 1 - Math.pow(0.92, dt);
        display[i] = lerp(current, propagatedTarget, smoothing);
      }

      const maxHalfHeight = H * 0.42;
      const segH = 4;
      const segGap = 2;
      const unit = segH + segGap;

      for (let i = 0; i < BAR_COUNT; i += 1) {
        const energy = Math.min(1, Math.max(0, display[i]));

        const halfHeight = Math.max(unit, Math.min(maxHalfHeight, energy * maxHalfHeight));
        const segments = Math.max(1, Math.floor(halfHeight / unit));
        const x = Math.round(startX + i * (barWidth + gap));

        for (let s = 0; s < segments; s += 1) {
          const topY = Math.round(cy - (s + 1) * unit);
          const botY = Math.round(cy + s * unit + 1);
          const falloff = 1 - s / Math.max(1, segments);
          const alpha = Math.max(0.24, Math.min(0.94, 0.2 + energy * 0.78 * falloff));
          ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;

          drawRoundedRect(ctx, x, topY, barWidth, segH, 1.6);
          ctx.fill();
          drawRoundedRect(ctx, x, botY, barWidth, segH, 1.6);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [ttsEventRef]);

  return (
    <div className="siri-wave-shell" aria-live="polite">
      <canvas
        ref={canvasRef}
        className="siri-wave-canvas"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
