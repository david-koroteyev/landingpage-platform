export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'hidden';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select
  defaultValue?: string;
}

export interface FormBlockProps {
  heading?: string;
  subheading?: string;
  fields: FormField[];
  submitLabel: string;
  successMessage?: string;
  webhookUrl?: string;
  redirectUrl?: string;
}
