import { BinarySearchVisualizer } from '@anicode/core';
import { useState } from 'react';

const initialArray = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];

export default function App() {
  const [target, setTarget] = useState(38);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>二分查找 · AniCode Demo</h1>
      <div style={{ marginBottom: 16 }}>
        <label>
          目标值：
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            style={{ marginLeft: 8, marginRight: 8 }}
          />
        </label>
        <span>数组：[{initialArray.join(', ')}]</span>
      </div>
      <BinarySearchVisualizer
        array={initialArray}
        target={target}
      />
      <p style={{ marginTop: 12, color: '#666' }}>
        点击 Play 自动播放，或 Step 手动步进。
      </p>
    </div>
  );
}