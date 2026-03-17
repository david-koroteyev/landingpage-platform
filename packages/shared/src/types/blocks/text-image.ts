export interface TextImageBlockProps {
  heading?: string;
  body: string; // markdown
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
  ctaLabel?: string;
  ctaHref?: string;
}
