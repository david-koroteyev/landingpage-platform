import type { BlockType, BlockPropsMap } from '../types/block';

export interface BlockMeta {
  label: string;
  description: string;
  icon: string; // Lucide icon name
  defaultProps: Partial<BlockPropsMap[BlockType]>;
  category: 'layout' | 'content' | 'conversion' | 'social' | 'legal';
}

export const BLOCK_META: Record<BlockType, BlockMeta> = {
  hero: {
    label: 'Hero Section',
    description: 'Large header with headline, subheadline and CTA',
    icon: 'Sparkles',
    category: 'layout',
    defaultProps: {
      headline: 'Your Compelling Headline Here',
      subheadline: 'A supporting sentence that explains your value proposition.',
      ctaLabel: 'Get Started',
      ctaHref: '#',
      alignment: 'center',
    },
  },
  text_image: {
    label: 'Text + Image',
    description: 'Side-by-side text and image section',
    icon: 'Image',
    category: 'content',
    defaultProps: {
      heading: 'Feature Heading',
      body: 'Describe this feature or benefit in a few sentences.',
      imagePosition: 'right',
    },
  },
  faq: {
    label: 'FAQ Accordion',
    description: 'Expandable frequently asked questions',
    icon: 'HelpCircle',
    category: 'content',
    defaultProps: {
      heading: 'Frequently Asked Questions',
      items: [
        { id: 'q1', question: 'What is this?', answer: 'A great product that solves your problem.' },
        { id: 'q2', question: 'How does it work?', answer: 'Simply sign up and get started in minutes.' },
      ],
    },
  },
  questionnaire: {
    label: 'Questionnaire',
    description: 'Multi-question survey or quiz block',
    icon: 'ListChecks',
    category: 'conversion',
    defaultProps: {
      heading: 'Quick Quiz',
      submitLabel: 'See My Results',
      questions: [],
    },
  },
  form: {
    label: 'Lead Form',
    description: 'Customizable lead capture form',
    icon: 'FileText',
    category: 'conversion',
    defaultProps: {
      heading: 'Get in Touch',
      submitLabel: 'Submit',
      fields: [
        { id: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
        { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
      ],
    },
  },
  testimonial: {
    label: 'Testimonials',
    description: 'Customer quotes and social proof',
    icon: 'Quote',
    category: 'social',
    defaultProps: {
      heading: 'What Our Customers Say',
      layout: 'grid',
      items: [
        {
          id: 't1',
          quote: 'This product completely transformed our workflow. Highly recommended!',
          authorName: 'Jane Smith',
          authorTitle: 'CEO',
          authorCompany: 'Acme Corp',
          rating: 5,
        },
      ],
    },
  },
  cta: {
    label: 'CTA Block',
    description: 'Call-to-action section with headline and button',
    icon: 'Zap',
    category: 'conversion',
    defaultProps: {
      heading: 'Ready to Get Started?',
      subheading: "Join thousands of customers who've already made the switch.",
      primaryLabel: 'Start Free Trial',
      primaryHref: '#',
      backgroundStyle: 'branded',
    },
  },
  countdown: {
    label: 'Countdown Timer',
    description: 'Urgency countdown to a date/time',
    icon: 'Clock',
    category: 'conversion',
    defaultProps: {
      heading: 'Offer Ends In',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      ctaLabel: 'Claim Offer',
      ctaHref: '#',
    },
  },
  comparison_table: {
    label: 'Comparison Table',
    description: 'Side-by-side feature comparison',
    icon: 'Table',
    category: 'content',
    defaultProps: {
      heading: 'How We Compare',
      columns: [
        { id: 'us', label: 'Our Product', isHighlighted: true },
        { id: 'them', label: 'Competitor' },
      ],
      rows: [
        { id: 'r1', feature: 'Feature A', values: { us: true, them: false } },
        { id: 'r2', feature: 'Feature B', values: { us: true, them: true } },
      ],
    },
  },
  compliance: {
    label: 'Disclaimer / Compliance',
    description: 'Legal disclaimer or compliance text',
    icon: 'ShieldCheck',
    category: 'legal',
    defaultProps: {
      text: '*Results may vary. This product has not been evaluated by the FDA.',
      variant: 'subtle',
    },
  },
};

export const BLOCK_CATEGORIES = {
  layout: 'Layout',
  content: 'Content',
  conversion: 'Conversion',
  social: 'Social Proof',
  legal: 'Legal',
} as const;
