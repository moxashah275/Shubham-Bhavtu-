export type FaqItem = {
  question: string;
  answer: string;
};

/** Shared FAQ list used on the FAQ page and the main dashboard. */
export const SITE_FAQS: FaqItem[] = [
  {
    question: 'How do I create and complete my profile on Gathbandhan?',
    answer:
      'After you register and sign in, open Profile. Fill Personal, Family, Education & Lifestyle, and About & Partner step by step. Add your photo from the header or About section, then save. You can edit anytime from Edit Profile.',
  },
  {
    question: 'How does partner search and Matches work?',
    answer:
      'Use Partner Search on the home dashboard to filter by age, location, and preference. Matches shows verified member profiles that fit your criteria so families can browse calmly and privately.',
  },
  {
    question: 'What is Shortlist and how do I use Interest?',
    answer:
      'Shortlist saves profiles you want to revisit later. Interest lets you send a respectful interest to a member. Both stay private — only the people involved see what you share.',
  },
  {
    question: 'How does Biodata Maker help my family?',
    answer:
      'Open Biodata Maker from the menu. It builds a clean marriage biodata from your saved profile details — name, age, height, education, family, and more — ready to share with elders when needed.',
  },
  {
    question: 'What will I find under Events and Gallery?',
    answer:
      'Events lists community meets, workshops, and gatherings you can explore. Gallery shows warm moments from past Gathbandhan occasions so you can feel the culture of the platform.',
  },
  {
    question: 'What is the difference between Membership and Subscription?',
    answer:
      'Membership shows the plans available — Free, Gold, and Premium — with benefits and price. Subscription shows your current plan, validity, auto-renewal, and a simple payment history.',
  },
  {
    question: 'Is my contact information and photos private?',
    answer:
      'Yes. Contact details stay protected. Profile photos and personal fields are shared only within the platform experience you choose. Introductions move with care — never public, never rushed.',
  },
  {
    question: 'How do I contact support or update account settings?',
    answer:
      'Use Contact Us for care-desk help, or open Settings for account preferences. Footer FAQ, Membership, and Subscription pages also guide you through plans and common questions.',
  },
];
