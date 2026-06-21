import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';

export function useSimulation() {
  const simulation = useGameStore((s) => s.simulation);
  const tickSimulation = useGameStore((s) => s.tickSimulation);
  const tickRef = useRef(tickSimulation);
  tickRef.current = tickSimulation;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (simulation.status !== 'running') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const delta = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;
      tickRef.current(delta);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [simulation.status]);
}
