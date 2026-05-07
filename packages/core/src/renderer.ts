import { Step, Dimensions, Theme } from './types';

const defaultTheme: Theme = {
  primaryColor: '#3b82f6',
  compareColor: '#f59e0b',
  swapColor: '#ef4444',
  foundColor: '#10b981',
  backgroundColor: '#0b1120',
  textColor: '#e2e8f0',
  barBorderRadius: 4,
};

export function drawArray(
  ctx: CanvasRenderingContext2D,
  step: Step,
  dimensions: Dimensions,
  theme: Theme = defaultTheme
) {
  const { width, height } = dimensions;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const arr: number[] = step.data;
  if (!arr || arr.length === 0) return;

  const n = arr.length;
  const barWidth = (width * 0.8) / n;
  const startX = (width - barWidth * n) / 2;
  const maxVal = Math.max(...arr);
  const baseY = height - 40;

  arr.forEach((val, i) => {
    const barHeight = (val / maxVal) * (height - 80);
    const x = startX + i * barWidth;
    const y = baseY - barHeight;

    // 颜色选择
    let color = theme.primaryColor;
    if (step.type === 'compare' && step.indices?.includes(i)) {
      color = theme.compareColor;
    } else if (step.type === 'found' && step.indices?.includes(i)) {
      color = theme.foundColor;
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth - 4, barHeight, theme.barBorderRadius);
    ctx.fill();

    // 数值标签
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(val.toString(), x + (barWidth - 4) / 2, y - 6);
    ctx.textAlign = 'start';

    // 索引标签
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(i.toString(), x + (barWidth - 4) / 2, baseY + 14);
    ctx.textAlign = 'start';
  });
}