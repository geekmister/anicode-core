import React, { useEffect, useRef, useState } from 'react';
import { createAnimation, AnimationState } from './useAnimation';
import { drawArray } from './renderer';
import { binarySearchSteps } from './BinarySearchGenerator';
import { Theme } from './types';

interface Props {
  array: number[];
  target: number;
  width?: number;
  height?: number;
  theme?: Partial<Theme>;
}

export const BinarySearchVisualizer: React.FC<Props> = ({
  array,
  target,
  width = 800,
  height = 300,
  theme = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<ReturnType<typeof createAnimation>>();
  const [tick, setTick] = useState(0); // 用于强制重绘

  // 合并默认主题
  const mergedTheme: Theme = {
    primaryColor: '#3b82f6',
    compareColor: '#f59e0b',
    swapColor: '#ef4444',
    foundColor: '#10b981',
    backgroundColor: '#0b1120',
    textColor: '#e2e8f0',
    barBorderRadius: 4,
    ...theme,
  };

  // 每当 array 或 target 变化时，重新创建动画
  useEffect(() => {
    const generator = binarySearchSteps([...array], target);
    const animation = createAnimation(generator);
    animRef.current = animation;

    const unsub = animation.subscribe((state: AnimationState) => {
      setTick(t => t + 1);
    });

    // 自动绘制初始帧
    animation.next(); // 跳到第一步

    return () => {
      unsub();
      animation.stop();
    };
  }, [array, target]);

  // 绘制：当 tick（动画状态变化）、尺寸或主题变化时重绘
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !animRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = animRef.current.getState();
    if (state.currentStep) {
      drawArray(ctx, state.currentStep, { width, height }, mergedTheme);
    }
  }, [tick, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlay = () => animRef.current?.play();
  const handleStop = () => animRef.current?.stop();
  const handleStep = () => animRef.current?.next();

  return (
    <div style={{ display: 'inline-block', background: '#0b1120', borderRadius: 12, padding: 12 }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
        <button onClick={handlePlay}>▶ Play</button>
        <button onClick={handleStop}>⏹ Stop</button>
        <button onClick={handleStep}>⏭ Step</button>
      </div>
    </div>
  );
};