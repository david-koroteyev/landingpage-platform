export type QuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'rating' | 'yes_no';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: QuestionOption[]; // for single/multiple choice
  minRating?: number; // for rating
  maxRating?: number; // for rating
}

export interface QuestionnaireBlockProps {
  heading?: string;
  subheading?: string;
  questions: Question[];
  submitLabel?: string;
  successMessage?: string;
  webhookUrl?: string;
}
