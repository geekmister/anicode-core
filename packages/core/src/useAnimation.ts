import { Step } from './types';
import { GeneratorType } from './generator';

export interface AnimationState {
  currentStep: Step | null;
  stepIndex: number;
  isPlaying: boolean;
  isFinished: boolean;
}

type Listener = (state: AnimationState) => void;

export function createAnimation(generator: GeneratorType) {
  let state: AnimationState = {
    currentStep: null,
    stepIndex: -1,
    isPlaying: false,
    isFinished: false,
  };

  let listeners: Listener[] = [];
  let autoTimer: number | null = null;
  let speed = 800; // ms

  function notify() {
    listeners.forEach(fn => fn({ ...state }));
  }

  function next() {
    if (state.isFinished) return;
    const { value, done } = generator.next();
    if (done) {
      state.isFinished = true;
      state.isPlaying = false;
      if (autoTimer) clearInterval(autoTimer);
    } else {
      state.currentStep = value;
      state.stepIndex++;
    }
    notify();
  }

  function prev() {
    // 简化：暂不支持回退，只支持从头重置
    reset();
  }

  function play() {
    if (state.isFinished) return;
    state.isPlaying = true;
    next(); // 先走一步避免延迟
    autoTimer = window.setInterval(() => {
      if (state.isFinished) {
        stop();
        return;
      }
      next();
    }, speed);
    notify();
  }

  function stop() {
    if (autoTimer) clearInterval(autoTimer);
    state.isPlaying = false;
    notify();
  }

  function reset() {
    stop();
    // 重新创建 generator 需要外部处理，这里简单重置索引
    // 实际使用时，外部重新调用 createAnimation
    // 此处为了简单，抛出不支持，推荐外部重置
  }

  function setSpeed(ms: number) {
    speed = ms;
    if (state.isPlaying) {
      stop();
      play();
    }
  }

  function subscribe(fn: Listener) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  }

  return {
    next,
    prev,
    play,
    stop,
    reset: () => { /* 外部重置 */ },
    setSpeed,
    subscribe,
    getState: () => state,
  };
}