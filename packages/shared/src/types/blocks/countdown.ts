export interface CountdownBlockProps {
  heading?: string;
  subheading?: string;
  targetDate: string; // ISO 8601
  expiredMessage?: string;
  ctaLabel?: string;
  ctaHref?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
}
