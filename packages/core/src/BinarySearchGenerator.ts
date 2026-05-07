import { Step } from './types';

export function* binarySearchSteps(arr: number[], target: number): Generator<Step, void, unknown> {
  let left = 0;
  let right = arr.length - 1;

  // 初始状态
  yield {
    type: 'init',
    data: [...arr],
    indices: [],
    metadata: { left, right, target }
  };

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    yield {
      type: 'compare',
      data: [...arr],
      indices: [mid],
      metadata: { left, right, mid, target }
    };

    if (arr[mid] === target) {
      yield {
        type: 'found',
        data: [...arr],
        indices: [mid],
        metadata: { left, right, mid, target }
      };
      return;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // 未找到
  yield {
    type: 'not-found',
    data: [...arr],
    indices: [],
    metadata: { left, right, target }
  };
}