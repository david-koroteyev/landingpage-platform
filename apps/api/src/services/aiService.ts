import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { aiOperationsResponseSchema } from '@lp/shared';
import type { PageSchema, AiOperation } from '@lp/shared';
import { BLOCK_META } from '@lp/shared';
import { v4 as uuid } from 'uuid';

const client = env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'mock'
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : null;

const MODEL = 'claude-opus-4-6';

// The system prompt is kept constant and can be cached by the API.
// It defines the schema contract the model must follow.
const SYSTEM_PROMPT = `You are a landing page editor assistant for a marketing platform.
Your ONLY job is to return structured JSON edit operations — never raw HTML, never JSX, never CSS classes.

## Available block types
${Object.entries(BLOCK_META)
  .map(([type, meta]) => `- **${type}**: ${meta.description}`)
  .join('\n')}

## Operation schema
You must return a JSON object with exactly two keys:
- "operations": array of operation objects (max 10 per response)
- "explanation": 1-2 sentence human-readable summary of what you will do

## Available operations
1. add_block — { type: "add_block", blockType: "<type>", afterBlockId: "<id or null>", props: {}, styles: {} }
2. delete_block — { type: "delete_block", blockId: "<id>" }
3. move_block — { type: "move_block", blockId: "<id>", afterBlockId: "<id or null>" }
4. update_block_content — { type: "update_block_content", blockId: "<id>", props: {} }
5. update_block_style — { type: "update_block_style", blockId: "<id>", styles: {} }
6. update_page_settings — { type: "update_page_settings", settings: {} }
7. update_page_meta — { type: "update_page_meta", meta: {} }

## Rules
- NEVER output HTML, JSX, CSS, or code of any kind in props/styles values
- Props values must be plain strings, numbers, booleans, or nested objects matching the block schema
- For markdown body fields use plain markdown (no HTML tags)
- When adding a new questionnaire, always include at least 2 questions
- When adding a new FAQ, always include at least 3 items
- Do not delete locked blocks (blocks with locked: true)
- Limit operations to what is necessary and sufficient
- If the request is ambiguous, make a reasonable interpretation

Return only the JSON object — no prose before or after it.`;

export interface AiServiceResult {
  operations: AiOperation[];
  explanation: string;
  promptLogId: string;
  tokensUsed: number;
}

export async function runAiPrompt(
  pageId: string,
  userId: string,
  prompt: string,
  currentSchema: PageSchema
): Promise<AiServiceResult> {
  // Truncate the schema if it's very large to stay within context limits.
  // For pages with many blocks, we send a summary of block IDs+types+headings.
  const schemaContext = buildSchemaContext(currentSchema);

  const userMessage = `Current page schema context:
\`\`\`json
${JSON.stringify(schemaContext, null, 2)}
\`\`\`

User request: ${prompt}`;

  let rawContent = '';
  let tokensUsed = 0;

  if (!client) {
    // Mock mode for local dev without an API key
    const mockResult = generateMockOperations(prompt, currentSchema);
    rawContent = JSON.stringify(mockResult);
    tokensUsed = 0;
  } else {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const block = response.content[0];
    if (block.type !== 'text') throw new Error('Unexpected AI response type');
    rawContent = block.text;
    tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
  }

  // Parse and validate the AI response
  let parsed: unknown;
  try {
    // Extract JSON from the response (model might wrap in ```json ... ```)
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)```/) ||
                      rawContent.match(/```\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawContent.trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`AI returned invalid JSON: ${rawContent.slice(0, 200)}`);
  }

  const validated = aiOperationsResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`AI operations failed validation: ${JSON.stringify(validated.error.flatten())}`);
  }

  // Log to DB
  const log = await prisma.promptLog.create({
    data: {
      pageId,
      userId,
      prompt,
      operations: validated.data.operations as object[],
      model: MODEL,
      tokensUsed,
      applied: false,
    },
  });

  return {
    operations: validated.data.operations as AiOperation[],
    explanation: validated.data.explanation,
    promptLogId: log.id,
    tokensUsed,
  };
}

export async function markPromptApplied(promptLogId: string) {
  await prisma.promptLog.update({
    where: { id: promptLogId },
    data: { applied: true },
  });
}

/** Builds a compact representation of the page schema to fit in context */
function buildSchemaContext(schema: PageSchema) {
  return {
    settings: schema.settings,
    blocks: schema.blocks.map((b) => ({
      id: b.id,
      type: b.type,
      order: b.order,
      locked: b.locked,
      visible: b.visible,
      // Include a summary of key props to help the AI reference blocks
      summary: getBlockSummary(b),
    })),
  };
}

function getBlockSummary(block: PageSchema['blocks'][number]): string {
  const props = block.props as Record<string, unknown>;
  if (props.headline) return String(props.headline).slice(0, 80);
  if (props.heading) return String(props.heading).slice(0, 80);
  if (props.text) return String(props.text).slice(0, 80);
  return block.type;
}

/** Generates mock AI operations for development without an API key */
function generateMockOperations(prompt: string, schema: PageSchema) {
  const lower = prompt.toLowerCase();

  if (lower.includes('faq') || lower.includes('accordion')) {
    return {
      operations: [{
        type: 'add_block',
        blockType: 'faq',
        afterBlockId: schema.blocks.at(-1)?.id ?? null,
        props: {
          heading: 'Frequently Asked Questions',
          items: [
            { id: uuid(), question: 'What makes this product different?', answer: 'Our product offers unmatched quality and support.' },
            { id: uuid(), question: 'How long does shipping take?', answer: 'We ship within 1-2 business days with tracking.' },
            { id: uuid(), question: 'What is your return policy?', answer: '30-day no-questions-asked returns.' },
          ],
        },
      }],
      explanation: 'Adding an FAQ accordion section with 3 common questions.',
    };
  }

  if (lower.includes('quiz') || lower.includes('questionnaire')) {
    return {
      operations: [{
        type: 'add_block',
        blockType: 'questionnaire',
        afterBlockId: schema.blocks.find(b => b.type === 'hero')?.id ?? null,
        props: {
          heading: 'Quick Quiz — Find Your Perfect Match',
          submitLabel: 'See My Results',
          questions: [
            {
              id: uuid(), type: 'single_choice', text: 'What is your primary goal?', required: true,
              options: [
                { id: uuid(), label: 'Lose weight', value: 'weight_loss' },
                { id: uuid(), label: 'Build muscle', value: 'muscle' },
                { id: uuid(), label: 'Improve energy', value: 'energy' },
              ],
            },
            {
              id: uuid(), type: 'single_choice', text: 'How active are you currently?', required: true,
              options: [
                { id: uuid(), label: 'Sedentary', value: 'sedentary' },
                { id: uuid(), label: 'Lightly active', value: 'light' },
                { id: uuid(), label: 'Very active', value: 'active' },
              ],
            },
          ],
        },
      }],
      explanation: 'Adding a 2-question quiz to qualify leads.',
    };
  }

  if (lower.includes('testimonial')) {
    return {
      operations: [{
        type: 'add_block',
        blockType: 'testimonial',
        afterBlockId: schema.blocks.at(-2)?.id ?? null,
        props: {
          heading: 'What Our Customers Are Saying',
          layout: 'grid',
          items: [
            { id: uuid(), quote: 'This product changed my life. I lost 20 lbs in 60 days!', authorName: 'Sarah M.', authorTitle: 'Verified Customer', rating: 5 },
            { id: uuid(), quote: 'Amazing results. My energy levels are through the roof.', authorName: 'Mike T.', authorTitle: 'Verified Customer', rating: 5 },
          ],
        },
      }],
      explanation: 'Adding a testimonial block with 2 customer reviews.',
    };
  }

  if (lower.includes('cta') || lower.includes('call to action')) {
    return {
      operations: [{
        type: 'add_block',
        blockType: 'cta',
        afterBlockId: null,
        props: {
          heading: 'Ready to Transform Your Life?',
          subheading: 'Join over 10,000 happy customers today.',
          primaryLabel: 'Get Started Now',
          primaryHref: '#order',
          backgroundStyle: 'branded',
        },
      }],
      explanation: 'Adding a CTA block at the end of the page.',
    };
  }

  // Default: update the hero headline if there is one
  const hero = schema.blocks.find(b => b.type === 'hero');
  if (hero) {
    return {
      operations: [{
        type: 'update_block_content',
        blockId: hero.id,
        props: { subheadline: `Updated based on your request: "${prompt.slice(0, 100)}"` },
      }],
      explanation: `Updating the hero section based on your prompt.`,
    };
  }

  return {
    operations: [],
    explanation: 'No applicable changes found for this prompt. Try being more specific.',
  };
}
