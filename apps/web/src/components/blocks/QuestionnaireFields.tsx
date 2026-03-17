'use client';

import { useEditorStore } from '@/store/editorStore';
import type { QuestionnaireBlock, Question, QuestionOption } from '@lp/shared';
import { Field } from './HeroFields';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

export function QuestionnaireFields({ block }: { block: QuestionnaireBlock }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const u = (patch: Partial<typeof p>) => updateBlockProps(block.id, patch as Parameters<typeof updateBlockProps>[1]);

  function updateQuestion(id: string, patch: Partial<Question>) {
    u({ questions: p.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) });
  }

  function addQuestion() {
    u({
      questions: [...p.questions, {
        id: uuid(), type: 'single_choice', text: 'New question', required: true,
        options: [
          { id: uuid(), label: 'Option A', value: 'option_a' },
          { id: uuid(), label: 'Option B', value: 'option_b' },
        ],
      }],
    });
  }

  function removeQuestion(id: string) {
    u({ questions: p.questions.filter((q) => q.id !== id) });
  }

  function addOption(questionId: string) {
    const q = p.questions.find((x) => x.id === questionId)!;
    const newOpt: QuestionOption = { id: uuid(), label: 'New option', value: `option_${uuid().slice(0, 4)}` };
    updateQuestion(questionId, { options: [...(q.options || []), newOpt] });
  }

  function updateOption(questionId: string, optId: string, patch: Partial<QuestionOption>) {
    const q = p.questions.find((x) => x.id === questionId)!;
    updateQuestion(questionId, {
      options: (q.options || []).map((o) => (o.id === optId ? { ...o, ...patch } : o)),
    });
  }

  function removeOption(questionId: string, optId: string) {
    const q = p.questions.find((x) => x.id === questionId)!;
    updateQuestion(questionId, { options: (q.options || []).filter((o) => o.id !== optId) });
  }

  return (
    <div className="space-y-4">
      <Field label="Heading">
        <input className="input" value={p.heading || ''} onChange={(e) => u({ heading: e.target.value })} />
      </Field>
      <Field label="Submit Button Label">
        <input className="input" value={p.submitLabel || 'Submit'} onChange={(e) => u({ submitLabel: e.target.value })} />
      </Field>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Questions ({p.questions.length})</label>
          <button onClick={addQuestion} className="btn-secondary py-1 px-2 text-xs gap-1">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>

        <div className="space-y-4">
          {p.questions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Q{idx + 1}</span>
                <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                className="input text-xs"
                placeholder="Question text"
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              />
              <select
                className="input text-xs"
                value={q.type}
                onChange={(e) => updateQuestion(q.id, { type: e.target.value as Question['type'] })}
              >
                <option value="single_choice">Single choice</option>
                <option value="multiple_choice">Multiple choice</option>
                <option value="text">Text answer</option>
                <option value="rating">Rating</option>
                <option value="yes_no">Yes / No</option>
              </select>

              {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                <div className="space-y-1">
                  {(q.options || []).map((opt) => (
                    <div key={opt.id} className="flex items-center gap-1">
                      <input
                        className="input text-xs flex-1"
                        value={opt.label}
                        onChange={(e) => updateOption(q.id, opt.id, { label: e.target.value })}
                      />
                      <button onClick={() => removeOption(q.id, opt.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addOption(q.id)} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
