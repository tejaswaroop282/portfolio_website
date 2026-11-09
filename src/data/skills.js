// Every item below appears in the resume's TECHNICAL SKILLS section and/or in a repository README.
// No proficiency percentages are shown, by design. `evidence` explains where each skill was actually used.

export const skillGroups = [
  {
    id: 'programming',
    name: 'Programming',
    rune: 'ᚠ',
    items: ['C++', 'Python', 'JavaScript', 'SQL'],
    evidence: [
      'C++17 with STL and OOP: FIFO, LRU and LFU cache eviction simulator with O(1) LRU/LFU operations.',
      'Python: FastAPI + LangGraph backend for CareerPilot and DevPilot; scikit-learn / XGBoost for the stress-prediction model.',
      'JavaScript (no TypeScript): React front ends and Node/Express back ends in PayBridge AI and CivicConnect.',
      '300+ DSA problems solved across LeetCode, GeeksforGeeks and TakeUForward (resume).',
    ],
  },
  {
    id: 'backend',
    name: 'Backend & Web',
    rune: 'ᚦ',
    items: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'Webhooks', 'React.js', 'Tailwind CSS'],
    evidence: [
      'Edunet internship: civic-issue platform with 12 REST APIs and role-based authentication.',
      'PayBridge AI: Express 5 API with token auth, rate limiting, HMAC-SHA256 webhook verification, durable forwarding queue with retries.',
      'CareerPilot: FastAPI backend with JWT auth, per-user isolation and server-sent progress events.',
      'React 19 + Vite + Tailwind front ends across PayBridge, CareerPilot and CivicConnect.',
    ],
  },
  {
    id: 'ai',
    name: 'AI / GenAI',
    rune: 'ᚨ',
    items: [
      'LangChain',
      'LangGraph',
      'MCP / FastMCP',
      'RAG & hybrid retrieval',
      'ReAct agents',
      'Agent guardrails',
      'Hallucination control',
      'Prompt-injection defence',
    ],
    evidence: [
      'CareerPilot: 3 LangGraph graphs (12 nodes), MongoDB checkpointing, human-in-the-loop interrupts, two bounded ReAct agents, hybrid RAG (dense + BM25 + RRF + cross-encoder rerank).',
      'PayBridge AI: LangGraph triage agent calling read-only MCP tools bound to a single project; validator that checks AI claims against retrieved records.',
      'DevPilot AI: LangGraph workflow with approval pause and PostgreSQL checkpointer; RAG over 25 official doc pages for citations.',
      'Evaluated with LangSmith experiments and small hand-labelled sets (sizes are stated in each project).',
    ],
  },
  {
    id: 'data',
    name: 'Databases',
    rune: 'ᛗ',
    items: ['MongoDB', 'MySQL', 'Redis', 'ChromaDB', 'PostgreSQL + pgvector'],
    evidence: [
      'MongoDB: Mongoose schemas, 2dsphere geospatial indexes, TTL retention, a lease-based job queue (PayBridge), LangGraph checkpoints (CareerPilot).',
      'Redis cache-aside caching at Edunet: median retrieval latency 87.08 ms → 1.42 ms over 35 benchmark runs.',
      'ChromaDB vectors in CareerPilot; PostgreSQL + pgvector in DevPilot AI.',
      'MySQL and SQL appear in the resume skills list; the repositories shown here lean on MongoDB.',
    ],
  },
  {
    id: 'cloud',
    name: 'Cloud & Tools',
    rune: 'ᛏ',
    items: ['AWS (EC2, S3, IAM)', 'Docker', 'Docker Compose', 'Nginx', 'Git & GitHub', 'Postman', 'cURL'],
    evidence: [
      'Edunet: Docker on AWS EC2 behind Nginx; private S3 with 1-hour presigned URLs and IAM roles instead of embedded credentials.',
      'CareerPilot: Docker Compose, ECR images on EC2, Parameter Store secrets, Caddy HTTPS (deployment guide in the repo).',
      'PayBridge AI: deployed on Render with MongoDB Atlas (Test Mode).',
      'AWS Certified AI Practitioner (AIF-C01).',
    ],
  },
  {
    id: 'core',
    name: 'Computer Science Core',
    rune: 'ᛟ',
    items: ['DSA', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks', 'Debugging & root-cause analysis'],
    evidence: [
      'B.Tech CSE at SRM University AP, CGPA 8.90.',
      'Cache simulator applies OOP (abstract base class, polymorphism) and data-structure design (hash map + linked list / frequency buckets).',
      'PayBridge AI is built around root-cause analysis of payment and webhook failures.',
    ],
  },
]
