'use client';

import { useState } from 'react';
import type { QuestionnaireBlock, Question } from '@lp/shared';
import { cn } from '@/lib/cn';
import { CheckCircle } from 'lucide-react';

interface Props {
  block: QuestionnaireBlock;
  isPreview?: boolean;
}

export function QuestionnaireRenderer({ block, isPreview = false }: Props) {
  const { props } = block;
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleAnswer(questionId: string, value: string, type: Question['type'], isMulti = false) {
    if (isMulti) {
      const current = (answers[questionId] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  }

  if (submitted) {
    return (
      <div className="py-16 px-6 text-center" style={{ backgroundColor: block.styles.backgroundColor }}>
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
        <p className="text-gray-600">{props.successMessage || 'Your responses have been recorded.'}</p>
      </div>
    );
  }

  return (
    <div className="py-16 px-6 md:px-12" style={{ backgroundColor: block.styles.backgroundColor }}>
      <div className="mx-auto max-w-2xl">
        {props.heading && <h2 className="text-3xl font-bold text-gray-900 mb-3">{props.heading}</h2>}
        {props.subheading && <p className="text-gray-500 mb-8">{props.subheading}</p>}

        <div className="space-y-8">
          {props.questions.map((question, idx) => (
            <div key={question.id} className="rounded-xl border border-gray-200 p-6">
              <p className="font-semibold text-gray-900 mb-4">
                <span className="text-brand-600 mr-2">{idx + 1}.</span>
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </p>

              {(question.type === 'single_choice' || question.type === 'yes_no') && (
                <div className="space-y-2">
                  {(question.type === 'yes_no'
                    ? [{ id: 'yes', label: 'Yes', value: 'yes' }, { id: 'no', label: 'No', value: 'no' }]
                    : question.options || []
                  ).map((opt) => (
                    <label key={opt.id} className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                      answers[question.id] === opt.value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}>
                      <input
                        type="radio"
                        name={question.id}
                        value={opt.value}
                        checked={answers[question.id] === opt.value}
                        onChange={() => handleAnswer(question.id, opt.value, question.type)}
                        className="text-brand-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {(question.options || []).map((opt) => {
                    const selected = ((answers[question.id] as string[]) || []).includes(opt.value);
                    return (
                      <label key={opt.id} className={cn(
                        'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                        selected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                      )}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleAnswer(question.id, opt.value, question.type, true)}
                          className="text-brand-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.type === 'text' && (
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Your answer..."
                  value={(answers[question.id] as string) || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value, question.type)}
                />
              )}

              {question.type === 'rating' && (
                <div className="flex gap-2">
                  {Array.from({ length: (question.maxRating || 5) - (question.minRating || 1) + 1 }, (_, i) => {
                    const val = String((question.minRating || 1) + i);
                    return (
                      <button
                        key={val}
                        onClick={() => handleAnswer(question.id, val, question.type)}
                        className={cn(
                          'h-10 w-10 rounded-lg border text-sm font-medium transition-colors',
                          answers[question.id] === val
                            ? 'border-brand-500 bg-brand-600 text-white'
                            : 'border-gray-300 hover:border-brand-300'
                        )}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          className="btn-primary w-full mt-8 py-3 text-base"
          onClick={() => isPreview ? setSubmitted(true) : setSubmitted(true)}
        >
          {props.submitLabel || 'Submit'}
        </button>
      </div>
    </div>
  );
}
