export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  avatar?: string;
  rating?: number; // 1-5
}

export interface TestimonialBlockProps {
  heading?: string;
  subheading?: string;
  items: TestimonialItem[];
  layout?: 'grid' | 'carousel' | 'list';
}
