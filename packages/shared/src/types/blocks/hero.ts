export interface HeroBlockProps {
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaVariant?: 'primary' | 'secondary' | 'ghost';
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
  backgroundOverlay?: boolean;
  alignment?: 'left' | 'center' | 'right';
  minHeight?: string;
}
