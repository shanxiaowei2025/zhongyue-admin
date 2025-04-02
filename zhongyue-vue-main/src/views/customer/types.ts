// src/views/customer/types.ts

export interface ColumnItem {
  label: string;
  prop: string;
  fixed?: "right" | "left";
  width?: number;
  slot?: string;
}

export type TableColumnList = ColumnItem[];
