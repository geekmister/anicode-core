export interface Step {
  type: string;           // 'compare' | 'visit' | 'highlight' | 'found' | 'finished' 等
  data: any;              // 当前数据快照（如数组）
  indices?: number[];     // 涉及的下标
  codeLine?: number;
  metadata?: Record<string, any>;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Theme {
  primaryColor: string;
  compareColor: string;
  swapColor: string;
  foundColor: string;
  backgroundColor: string;
  textColor: string;
  barBorderRadius: number;
}