export interface ComparisonColumn {
  id: string;
  label: string;
  isHighlighted?: boolean;
}

export interface ComparisonRow {
  id: string;
  feature: string;
  values: Record<string, string | boolean>; // columnId -> value
}

export interface ComparisonTableBlockProps {
  heading?: string;
  subheading?: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
}
