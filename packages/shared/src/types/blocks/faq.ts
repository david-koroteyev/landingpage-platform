export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqBlockProps {
  heading?: string;
  subheading?: string;
  items: FaqItem[];
}
