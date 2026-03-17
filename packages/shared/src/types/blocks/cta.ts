export interface CtaBlockProps {
  heading: string;
  subheading?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  backgroundStyle?: 'default' | 'branded' | 'dark';
}
