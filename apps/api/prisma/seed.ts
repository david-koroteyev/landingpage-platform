import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type { PageSchema } from '@lp/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Brand
  const brand = await prisma.brand.upsert({
    where: { id: 'brand-default' },
    update: {},
    create: {
      id: 'brand-default',
      name: 'Acme Media',
      preset: {
        primaryColor: '#3b82f6',
        secondaryColor: '#6366f1',
        fontFamily: 'Inter, sans-serif',
        logoUrl: 'https://placehold.co/200x60/3b82f6/white?text=AcmeMedia',
        buttonRadius: '8px',
      },
    },
  });

  // Users
  const adminPw = await bcrypt.hash('admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPw,
      name: 'Alex Admin',
      role: 'ADMIN',
      brandId: brand.id,
    },
  });

  const marketerPw = await bcrypt.hash('marketer123!', 12);
  const marketer = await prisma.user.upsert({
    where: { email: 'marketer@example.com' },
    update: {},
    create: {
      email: 'marketer@example.com',
      password: marketerPw,
      name: 'Morgan Marketer',
      role: 'MARKETER',
      brandId: brand.id,
    },
  });

  const viewerPw = await bcrypt.hash('viewer123!', 12);
  await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      password: viewerPw,
      name: 'Val Viewer',
      role: 'VIEWER',
      brandId: brand.id,
    },
  });

  // ---- Sample Templates ----
  const blankTemplate = await prisma.template.upsert({
    where: { id: 'tpl-blank' },
    update: {},
    create: {
      id: 'tpl-blank',
      name: 'Blank Page',
      description: 'Start from scratch',
      category: 'General',
      isGlobal: true,
      schema: {
        schemaVersion: 1,
        blocks: [],
        settings: { backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif', maxWidth: '1200px', primaryColor: '#3b82f6', secondaryColor: '#6366f1' },
        meta: {},
      },
    },
  });

  // ---- Sample Landing Page 1: Weight Loss Offer ----
  const weightLossSchema: PageSchema = {
    schemaVersion: 1,
    settings: {
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      maxWidth: '1100px',
      primaryColor: '#10b981',
      secondaryColor: '#059669',
    },
    meta: {
      title: 'Burn Fat Fast — The 30-Day System',
      description: 'Clinically-backed weight loss program for busy professionals.',
    },
    blocks: [
      {
        id: uuid(),
        type: 'hero',
        order: 0,
        locked: false,
        visible: true,
        styles: { backgroundColor: '#f0fdf4' },
        props: {
          headline: 'Lose 15 Lbs in 30 Days — Guaranteed',
          subheadline: 'The science-backed system thousands of busy professionals use to drop weight fast without giving up their lifestyle.',
          ctaLabel: 'Start Your Free Trial',
          ctaHref: '#order',
          ctaVariant: 'primary',
          alignment: 'center',
        },
      },
      {
        id: uuid(),
        type: 'questionnaire',
        order: 1,
        locked: false,
        visible: true,
        styles: {},
        props: {
          heading: 'Find Your Perfect Plan',
          subheading: 'Answer 3 quick questions to get your personalized recommendation.',
          submitLabel: 'Show My Plan →',
          successMessage: 'Great! Based on your answers, we recommend our 30-Day Rapid Reset program.',
          questions: [
            {
              id: uuid(),
              type: 'single_choice',
              text: 'What is your primary weight loss goal?',
              required: true,
              options: [
                { id: uuid(), label: 'Lose 10–20 lbs', value: '10_20' },
                { id: uuid(), label: 'Lose 20–40 lbs', value: '20_40' },
                { id: uuid(), label: 'Lose 40+ lbs', value: '40_plus' },
              ],
            },
            {
              id: uuid(),
              type: 'single_choice',
              text: "How would you describe your current activity level?",
              required: true,
              options: [
                { id: uuid(), label: 'Sedentary (desk job, minimal exercise)', value: 'sedentary' },
                { id: uuid(), label: 'Lightly active (1–2 workouts/week)', value: 'light' },
                { id: uuid(), label: 'Active (3–5 workouts/week)', value: 'active' },
              ],
            },
            {
              id: uuid(),
              type: 'yes_no',
              text: 'Have you tried other weight loss programs before?',
              required: true,
            },
          ],
        },
      },
      {
        id: uuid(),
        type: 'testimonial',
        order: 2,
        locked: false,
        visible: true,
        styles: {},
        props: {
          heading: 'Real Results from Real People',
          layout: 'grid',
          items: [
            {
              id: uuid(),
              quote: "I lost 22 lbs in my first month. I was skeptical at first but the system genuinely works. My energy is through the roof.",
              authorName: 'Sarah K.',
              authorTitle: 'Marketing Director',
              rating: 5,
            },
            {
              id: uuid(),
              quote: "After trying every diet out there, this is the first thing that actually stuck. Down 35 lbs and counting.",
              authorName: 'James R.',
              authorTitle: 'Software Engineer',
              rating: 5,
            },
            {
              id: uuid(),
              quote: "The science behind this program made me trust it. My doctor was impressed at my 3-month checkup.",
              authorName: 'Priya M.',
              authorTitle: 'Nurse Practitioner',
              rating: 5,
            },
          ],
        },
      },
      {
        id: uuid(),
        type: 'faq',
        order: 3,
        locked: false,
        visible: true,
        styles: {},
        props: {
          heading: 'Common Questions',
          items: [
            { id: uuid(), question: 'Is this safe?', answer: 'Yes. Our program is developed with licensed nutritionists and is backed by peer-reviewed research. Always consult your physician before starting any weight loss program.' },
            { id: uuid(), question: 'What if it does not work for me?', answer: "We offer a full 60-day money-back guarantee. If you don't see results, we'll refund every cent — no questions asked." },
            { id: uuid(), question: 'How quickly will I see results?', answer: 'Most participants report noticeable changes within the first 2 weeks. Full results are typically visible after 30 days of consistent use.' },
            { id: uuid(), question: 'Do I need special equipment or a gym membership?', answer: 'No. Our program is designed to work with a standard kitchen and no gym. All you need is 20 minutes a day.' },
          ],
        },
      },
      {
        id: uuid(),
        type: 'cta',
        order: 4,
        locked: false,
        visible: true,
        styles: {},
        props: {
          heading: 'Start Your 30-Day Transformation Today',
          subheading: 'Join over 47,000 people who have already changed their lives.',
          primaryLabel: 'Get Instant Access — $47',
          primaryHref: '#order',
          backgroundStyle: 'branded',
        },
      },
      {
        id: uuid(),
        type: 'compliance',
        order: 5,
        locked: true, // Brand/legal lock — cannot be moved or deleted
        visible: true,
        styles: {},
        props: {
          text: '*Results may vary. Individual results are not guaranteed. This product has not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease. Consult your physician before starting any weight loss program.',
          variant: 'subtle',
        },
      },
    ],
  };

  const weightLossPage = await prisma.page.upsert({
    where: { slug: 'burn-fat-fast-offer' },
    update: {},
    create: {
      title: 'Burn Fat Fast — The 30-Day System',
      slug: 'burn-fat-fast-offer',
      status: 'DRAFT',
      schema: weightLossSchema as object,
      authorId: marketer.id,
      brandId: brand.id,
      campaign: 'Q3 Weight Loss Push',
      tags: ['weight-loss', 'health', 'offer'],
    },
  });

  // Create initial version for the seed page
  await prisma.pageVersion.upsert({
    where: { pageId_version: { pageId: weightLossPage.id, version: 1 } },
    update: {},
    create: {
      pageId: weightLossPage.id,
      version: 1,
      schema: weightLossSchema as object,
      message: 'Initial seed version',
      authorId: admin.id,
    },
  });

  // ---- Sample Landing Page 2: SaaS Trial ----
  const saasSchema: PageSchema = {
    schemaVersion: 1,
    settings: {
      backgroundColor: '#fafafa',
      fontFamily: 'Inter, sans-serif',
      maxWidth: '1200px',
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
    },
    meta: {
      title: 'ProjectFlow — Ship Faster with AI Project Management',
      description: 'The project management tool built for modern dev teams.',
    },
    blocks: [
      {
        id: uuid(),
        type: 'hero',
        order: 0,
        locked: false,
        visible: true,
        styles: {},
        props: {
          headline: 'Ship 3× Faster with AI-Powered Project Management',
          subheadline: 'ProjectFlow automatically writes tickets, assigns tasks, and keeps your sprints on track — so your team can focus on building.',
          ctaLabel: 'Start Free — No Credit Card',
          ctaHref: '#signup',
          secondaryCtaLabel: 'Watch Demo',
          secondaryCtaHref: '#demo',
          alignment: 'center',
        },
      },
      {
        id: uuid(),
        type: 'text_image',
        order: 1,
        locked: false,
        visible: true,
        styles: {},
        props: {
          heading: 'AI Writes Your Tickets So You Do not Have To',
          body: 'Stop wasting engineering time on ticket writing. Describe a feature in plain English and ProjectFlow generates fully-structured tickets, acceptance criteria, and story points automatically.\n\nIntegrates natively with GitHub, Jira, Linear, and Slack.',
          imageUrl: 'https://placehold.co/600x400/3b82f6/white?text=AI+Ticket+Writer',
          imageAlt: 'AI ticket writer interface',
          imagePosition: 'right',
        },
      },
      {
        id: uuid(),
        type: 'comparison_table',
        order: 2,
        locked: false,
        visible: true,
        styles: {},
        props: {
          heading: 'Why Teams Switch to ProjectFlow',
          columns: [
            { id: 'pf', label: 'ProjectFlow', isHighlighted: true },
            { id: 'jira', label: 'Jira' },
            { id: 'linear', label: 'Linear' },
          ],
          rows: [
            { id: 'r1', feature: 'AI ticket generation', values: { pf: true, jira: false, linear: false } },
            { id: 'r2', feature: 'Automatic sprint planning', values: { pf: true, jira: false, linear: false } },
            { id: 'r3', feature: 'GitHub PR auto-link', values: { pf: true, jira: true, linear: true } },
            { id: 'r4', feature: 'Slack notifications', values: { pf: true, jira: true, linear: true } },
            { id: 'r5', feature: 'Free tier available', values: { pf: 'Up to 5 users', jira: 'Up to 10 users', linear: 'Up to 10 users' } },
          ],
        },
      },
      {
        id: uuid(),
        type: 'form',
        order: 3,
        locked: false,
        visible: true,
        styles: {},
        props: {
          heading: 'Start Your Free 14-Day Trial',
          subheading: 'No credit card required. Up and running in 5 minutes.',
          submitLabel: 'Create My Account',
          successMessage: "You're in! Check your email for your login link.",
          fields: [
            { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Jane Smith', required: true },
            { id: 'email', type: 'email', label: 'Work Email', placeholder: 'jane@company.com', required: true },
            { id: 'company', type: 'text', label: 'Company Name', placeholder: 'Acme Inc.', required: true },
            { id: 'team_size', type: 'select', label: 'Team Size', required: false, options: ['1–5', '6–20', '21–50', '50+'] },
          ],
        },
      },
    ],
  };

  await prisma.page.upsert({
    where: { slug: 'projectflow-trial' },
    update: {},
    create: {
      title: 'ProjectFlow — AI Project Management',
      slug: 'projectflow-trial',
      status: 'DRAFT',
      schema: saasSchema as object,
      authorId: admin.id,
      brandId: brand.id,
      campaign: 'SaaS Trial Acquisition',
      tags: ['saas', 'b2b', 'trial'],
    },
  });

  console.log('Seed complete!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  admin@example.com     / admin123!');
  console.log('  marketer@example.com  / marketer123!');
  console.log('  viewer@example.com    / viewer123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
