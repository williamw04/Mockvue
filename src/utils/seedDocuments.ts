import type { IDocumentService } from '../services/interfaces';

const SEED_KEY = 'mockvue_seeded';

interface SeedDoc {
  title: string;
  description: string;
  tags: string[];
  questions: { text: string; response: string }[];
}

const seedData: SeedDoc[] = [
  {
    title: 'Amazon Leadership Principles',
    description:
      'Preparation notes for Amazon behavioral interviews covering key leadership principles with STAR stories.',
    tags: ['amazon', 'leadership', 'behavioral'],
    questions: [
      {
        text: 'Tell me about a time you went above and beyond for a customer.',
        response:
          'At my previous company, a client reported a critical bug on Friday evening that blocked their weekend release. Even though it was outside my scope, I stayed late to diagnose the root cause—a race condition in our payment processing pipeline. I coordinated with the DevOps team, deployed a hotfix by 9 PM, and followed up Monday morning with a post-mortem. The client renewed their contract and specifically cited our responsiveness.',
      },
      {
        text: 'Describe a situation where you had to make a decision without all the information.',
        response:
          'During a product launch, our analytics pipeline went down and we had to decide whether to delay the release or proceed without real-time metrics. I gathered what data we had from cached dashboards, consulted with the team leads, and decided to launch with enhanced manual monitoring. We hit our revenue targets that week and fixed the pipeline within 48 hours.',
      },
      {
        text: 'Tell me about a time you disagreed with your manager.',
        response:
          'My manager wanted to build a custom authentication system, but I believed we should use an established identity provider. I prepared a comparison document showing maintenance cost, security audit results, and time-to-market differences. After reviewing the data together, my manager agreed to go with the third-party solution, which saved us an estimated 3 months of development time.',
      },
    ],
  },
  {
    title: 'System Design Interview Notes',
    description:
      'Key concepts and frameworks for approaching system design interviews, including scalability patterns and trade-offs.',
    tags: ['technical', 'system-design', 'architecture'],
    questions: [
      {
        text: 'How would you design a URL shortener like bit.ly?',
        response:
          'I would use a hash-based approach with Base62 encoding for short URLs. The architecture includes: a load balancer distributing traffic, an application tier that generates short codes and handles redirects, a primary database (PostgreSQL) for URL mappings with read replicas, and a Redis cache layer for hot URLs. For scalability, I would partition the database by hash prefix and use consistent hashing for cache distribution.',
      },
      {
        text: 'Design a real-time chat application.',
        response:
          'Core components: WebSocket servers behind a load balancer for persistent connections, a message broker (Kafka) for reliable message delivery, a NoSQL database (Cassandra) for message storage partitioned by conversation ID, and a presence service using Redis to track online status. For group chats, use pub/sub channels. Message ordering is maintained through server-assigned timestamps and sequence numbers.',
      },
    ],
  },
  {
    title: 'Behavioral STAR Stories',
    description:
      'Collection of STAR-format stories covering leadership, teamwork, conflict resolution, and problem-solving competencies.',
    tags: ['behavioral', 'STAR', 'stories'],
    questions: [
      {
        text: 'Describe a time you led a team through a difficult project.',
        response:
          'Situation: Our team was tasked with migrating 50 microservices to a new cloud provider within 6 months. Task: As tech lead, I needed to create the migration plan and keep the team motivated despite tight timelines. Action: I broke the migration into 3 phases, set up automated testing pipelines, and held weekly demos to celebrate progress. I also paired senior engineers with juniors to spread knowledge. Result: We completed the migration 2 weeks early with zero production incidents, and team satisfaction scores increased by 15%.',
      },
      {
        text: 'Tell me about a time you failed and what you learned.',
        response:
          'Situation: I pushed for adopting a new frontend framework for a critical project without sufficient team buy-in. Task: Deliver the feature on time using the new technology. Action: The team struggled with the learning curve and we missed our deadline by 3 weeks. Result: I learned the importance of building consensus before making technology decisions. Now I always run proof-of-concept sprints and gather team feedback before proposing major tech changes.',
      },
      {
        text: 'Give an example of how you handled a conflict with a coworker.',
        response:
          'Situation: A backend engineer and I disagreed on the API contract for a new feature. Task: Reach alignment without blocking the sprint. Action: I scheduled a 30-minute whiteboard session where we mapped out both approaches and evaluated them against our requirements. I acknowledged the strengths of their approach and proposed a hybrid solution. Result: We agreed on a design that incorporated the best of both ideas, and the feature shipped on time with clean interfaces.',
      },
    ],
  },
  {
    title: 'Product Sense Questions',
    description:
      'Practice questions and frameworks for product management interviews, including metrics definition and product strategy.',
    tags: ['product', 'PM', 'strategy'],
    questions: [
      {
        text: 'How would you improve Instagram Stories?',
        response:
          'First, I would define the goal: increase daily active Stories creators. I would look at the funnel—how many users view Stories vs. create them. A key insight: many users want to share but feel pressure to be "polished." My proposal: introduce a "casual mode" with lower-fidelity tools (quick text posts, auto-generated photo collages from camera roll). Success metrics: % of non-creators who become creators, Stories creation frequency, and 7-day retention of new creators.',
      },
      {
        text: 'Define success metrics for a food delivery app.',
        response:
          'North Star metric: Monthly orders per active user. Supporting metrics broken into categories—Growth: new user signups, activation rate (first order within 7 days); Engagement: order frequency, average basket size, reorder rate; Quality: delivery time accuracy, customer satisfaction (CSAT), restaurant rating; Retention: 30/60/90 day retention, churn rate; Economics: customer acquisition cost, lifetime value, unit economics per order.',
      },
    ],
  },
  {
    title: 'Technical Deep-Dive Prep',
    description:
      'Notes on past technical projects for deep-dive interviews. Covers architecture decisions, trade-offs, and learnings.',
    tags: ['technical', 'deep-dive', 'projects'],
    questions: [
      {
        text: 'Walk me through the most technically challenging project you worked on.',
        response:
          'I built a real-time collaborative document editor supporting 100+ concurrent users. The core challenge was conflict resolution—we implemented Operational Transformation (OT) with a central server that maintained document state. I designed the WebSocket layer for low-latency sync, built an undo/redo system that worked across collaborative edits, and implemented cursor presence indicators. The system handled 10,000 operations per second with sub-100ms sync latency.',
      },
      {
        text: 'What trade-offs did you consider in your architecture?',
        response:
          'We evaluated OT vs. CRDTs—chose OT because it was more predictable for rich text formatting and our use case had reliable server connectivity. For storage, we debated event-sourcing vs. snapshot-based and went with a hybrid: event log for real-time sync with periodic snapshots for fast document loading. We accepted higher server complexity in exchange for simpler client logic and better offline support.',
      },
    ],
  },
  {
    title: 'Company Research: Google',
    description:
      'Research notes on Google culture, recent products, team structures, and potential interview topics.',
    tags: ['google', 'research', 'preparation'],
    questions: [
      {
        text: 'What excites you about working at Google?',
        response:
          'I am drawn to Google\'s commitment to building products at scale that genuinely improve people\'s daily lives. The engineering culture of tackling hard technical problems—from search ranking to distributed systems—aligns with my passion for systems design. I am particularly excited about the team\'s work on making AI tools accessible to developers, which connects directly to my experience building developer platforms.',
      },
      {
        text: 'How do you align with Google\'s engineering culture?',
        response:
          'Google values data-driven decision making, code quality, and collaborative design reviews—all practices I have championed in my current role. I introduced design doc reviews for major features, which reduced post-launch bugs by 40%. I also believe in Google\'s emphasis on 20% time and continuous learning; I regularly contribute to open-source projects and mentor junior engineers.',
      },
      {
        text: 'What questions do you have for us?',
        response:
          'How does the team balance technical debt reduction with feature delivery? What does the on-call rotation look like, and how has it evolved? Can you describe a recent project where the team had to pivot direction—what was the decision process? What opportunities exist for cross-team collaboration?',
      },
    ],
  },
];

export async function seedDocumentsIfEmpty(
  documentService: IDocumentService
): Promise<boolean> {
  if (localStorage.getItem(SEED_KEY)) return false;

  const existing = await documentService.getDocuments();
  if (existing.length > 0) {
    localStorage.setItem(SEED_KEY, 'true');
    return false;
  }

  for (const seed of seedData) {
    await documentService.createDocument({
      title: seed.title,
      description: seed.description,
      tags: seed.tags,
      questions: seed.questions.map((q, i) => ({
        id: `q-${i}-${Date.now()}`,
        text: q.text,
        response: q.response,
        isExpanded: false,
      })),
    });
  }

  localStorage.setItem(SEED_KEY, 'true');
  return true;
}
