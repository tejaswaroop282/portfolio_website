// Project content. Every claim here is traceable to the resume or to the project's own README on GitHub.
// `live: null` means no verified public URL — the UI then shows nothing rather than a fake link.
// `why` describes the purpose of the project (from the README), NOT a personal-motivation story:
// the owner may rewrite it in their own words.

const GH = 'https://github.com/tejaswaroop282/'

export const projects = [
  {
    id: 'careerpilot',
    name: 'CareerPilot',
    subtitle: 'AI interview-prep & job-search copilot',
    glyph: 'C',
    cover: '#3a2a1a',
    status: 'Deployed as a single-instance demo on AWS (per README). Public URL: not provided.',
    problem:
      'Job search and interview preparation are scattered across job boards, notes and generic question lists, and generic AI answers are hard to trust.',
    why: 'An end-to-end applied-AI system: it finds and ranks live jobs with explainable scores, then prepares interview questions that cite their sources and are checked before the user sees them.',
    stack: ['React', 'Vite', 'Tailwind', 'FastAPI', 'LangGraph', 'LangChain', 'FastMCP', 'MongoDB', 'ChromaDB', 'S3', 'Docker Compose', 'AWS EC2'],
    arch: {
      caption: 'Request flow. Checkpoints live in MongoDB; the LLM is Groq gpt-oss-120b with an automatic OpenRouter fallback.',
      nodes: [
        { id: 'ui', label: 'React + Vite UI', sub: 'nginx container', col: 0, row: 0 },
        { id: 'api', label: 'FastAPI', sub: 'JWT · per-user isolation · SSE', col: 1, row: 0 },
        { id: 'graphs', label: 'LangGraph', sub: '3 graphs · 12 nodes · HITL interrupts', col: 2, row: 0 },
        { id: 'retr', label: 'Retrieval agent', sub: 'bounded ReAct', col: 3, row: 0 },
        { id: 'jobs', label: 'Job-search agent', sub: 'bounded ReAct', col: 3, row: 1 },
        { id: 'rag', label: 'Hybrid RAG', sub: 'bge-base + BM25 → RRF → cross-encoder', col: 4, row: 0 },
        { id: 'mcp', label: 'FastMCP server', sub: '10 tools', col: 4, row: 1 },
        { id: 'store', label: 'MongoDB · Chroma · S3', sub: 'data, checkpoints, vectors, files', col: 5, row: 0 },
        { id: 'src', label: 'Job sources', sub: 'RemoteOK, Remotive, Arbeitnow, Jobicy, Himalayas', col: 5, row: 1 },
      ],
      edges: [
        ['ui', 'api'],
        ['api', 'graphs'],
        ['graphs', 'retr'],
        ['graphs', 'jobs'],
        ['retr', 'rag'],
        ['jobs', 'mcp'],
        ['rag', 'store'],
        ['mcp', 'src'],
      ],
    },
    decisions: [
      'Code, not the model, scores job matches — every score comes with reasons and missing skills.',
      'One shared, explicit ReAct loop with a step cap, no-progress detection and typed tools; identity is bound by code, never passed as a tool argument.',
      'Retrieved text and job postings are treated as data, not instructions (prompt-injection defence).',
      'Hybrid retrieval: metadata filter, dense + BM25 per partition, reciprocal rank fusion, cross-encoder rerank, per-knowledge-base quotas.',
      'Grounding guardrail: every question carries citations and a judge checks model-written text against the cited record.',
      'Cost control: at most 15 postings scored per run, 14-day cache of parsed postings, per-user daily AI-run limit.',
    ],
    challenges: [
      {
        title: 'Retrieval misses on paraphrased questions',
        text: 'LangSmith experiments labelled each failing query by stage; the 4 failures were retrieval misses, not prompt drops, because only the short question had been embedded. Embedding questions together with their key points fixed it. The fix was then checked on a held-out set written afterwards.',
      },
      {
        title: 'Pausing and resuming long graphs',
        text: 'Plan confirmation, clarifying questions and interview answers use LangGraph interrupts, resumed from MongoDB checkpoints (6 of 6 pause/resume scenarios passed live).',
      },
    ],
    results: [
      { value: '108', label: 'automated tests passing' },
      { value: '1.0 / 0.933', label: 'role-retrieval hit@5: dev set (49) / held-out set (30)' },
      { value: '0.958', label: 'job-ranking precision@3 on 40 labelled pairs' },
      { value: '0 of 2', label: 'hostile inputs obeyed in live prompt-injection check' },
    ],
    resultsNote:
      'Evaluation sets are small and written by the author (8–60 queries), so differences of a few points are noise. The README states this too.',
    repo: GH + 'CareerPilot.AI',
    live: null,
  },
  {
    id: 'paybridge',
    name: 'PayBridge AI',
    subtitle: 'Razorpay webhook debugging platform',
    glyph: 'P',
    cover: '#2b2f1f',
    status:
      'Deployed on Render + MongoDB Atlas and exercised with a real Razorpay Test Mode payment (per README). Test Mode only. Public URL: not provided.',
    problem:
      'When a payment or webhook flow breaks, a merchant cannot easily tell whether the fault is in Razorpay, their own endpoint or the delivery path.',
    why: 'A mediator between a merchant app and Razorpay webhooks: it verifies and stores every event, forwards the original request to the merchant, records exactly what the endpoint answered, and explains failures with explicit uncertainty.',
    stack: ['Node.js', 'Express 5', 'React 19', 'Vite', 'Tailwind v4', 'MongoDB Atlas', 'LangGraph', 'MCP', 'zod', 'Render'],
    arch: {
      caption: 'Both rows persist to MongoDB. In Forward Mode, the 200 ack to Razorpay is sent only after the event and forward job are stored.',
      nodes: [
        { id: 'rz', label: 'Razorpay', sub: 'signed webhook', col: 0, row: 0 },
        { id: 'ingest', label: 'Ingest', sub: 'HMAC-SHA256 on raw bytes → persist → ack 200', col: 1, row: 0 },
        { id: 'worker', label: 'Forward worker', sub: 'Mongo lease queue · retries · replay', col: 2, row: 0 },
        { id: 'merchant', label: 'Merchant endpoint', sub: 'original body + signature', col: 3, row: 0 },
        { id: 'dash', label: 'React dashboard', sub: 'merchant + simulated reviewer', col: 0, row: 1 },
        { id: 'api', label: 'Express API', sub: 'token auth · rate limiting', col: 1, row: 1 },
        { id: 'graph', label: 'LangGraph triage', sub: 'rules first, LLM only if unclear', col: 2, row: 1 },
        { id: 'mcp', label: 'MCP server', sub: 'read-only tools, bound to one project', col: 3, row: 1 },
        { id: 'db', label: 'MongoDB Atlas', sub: 'events · jobs · attempts', col: 4, row: 1 },
      ],
      edges: [
        ['rz', 'ingest'],
        ['ingest', 'worker'],
        ['worker', 'merchant'],
        ['dash', 'api'],
        ['api', 'graph'],
        ['graph', 'mcp'],
        ['mcp', 'db'],
      ],
    },
    decisions: [
      'Rules-first diagnosis: deterministic classification runs first; an LLM (bring-your-own key) is used only for ambiguous cases.',
      'Fault attribution separates "where it was observed" from "who it points at". Neither the rules nor the AI may blame Razorpay — the validator strips it; only a reviewer can set it.',
      'The MCP server is bound to one project at spawn; no tool accepts a project id, so the model cannot read another merchant’s data or change payments.',
      'Original raw bytes and signature are forwarded untouched, so the merchant’s existing HMAC check keeps working (verified byte-for-byte in tests).',
      'Secrets at rest use AES-256-GCM with a versioned key ring; LLM input is whitelisted and PII-redacted.',
      'Delivery is at-least-once, never exactly-once — stated plainly in the docs, with idempotency guidance.',
    ],
    challenges: [
      {
        title: 'SSRF-safe forwarding',
        text: 'Destinations are validated at save time and again inside the connection’s own DNS lookup on every attempt, closing the DNS-rebinding window. Covered by 52 SSRF tests with a fake resolver.',
      },
      {
        title: 'Surviving a worker crash',
        text: 'A lease/fencing design lets another process pick up a job after a crash; a real SIGKILL recovery run demonstrates it. Known trade-off documented: head-of-line blocking per project.',
      },
    ],
    results: [
      { value: '336', label: 'backend tests passing (18 files)' },
      { value: '70', label: 'frontend tests passing (6 files)' },
      { value: '9', label: 'demo failure scenarios; 1–7 and 9 run live, 8 via recovery script' },
      { value: '3 events', label: 'real Test Mode payment delivered and verified on the deployed stack' },
    ],
    resultsNote:
      'The Razorpay Developer role is a simulated demo role with no access to Razorpay internals. PayBridge is an independent project with no Razorpay affiliation.',
    repo: GH + 'PayBridgeAI',
    live: null,
  },
  {
    id: 'civicconnect',
    name: 'CivicConnect',
    subtitle: 'Civic issue reporting platform',
    glyph: 'V',
    cover: '#1f2a33',
    status: 'Built during the Edunet Foundation internship (Jun–Aug 2025). Deployed copy on Vercel (repo homepage link).',
    problem:
      'Residents have no simple way to report potholes, broken streetlights or dumping, and municipal staff have no organised way to triage, deduplicate and resolve them.',
    why: 'A full-stack platform where citizens report geo-tagged issues and administrators triage, assign and resolve them, with AI-assisted classification and duplicate detection.',
    stack: ['React', 'Vite', 'Tailwind', 'Node.js', 'Express', 'MongoDB', 'Redis', 'AWS S3', 'Docker', 'Nginx', 'Gemini'],
    arch: {
      caption:
        'Redis, S3, Docker/EC2/Nginx and the benchmark figures are from the internship build as stated on the resume; the Gemini agents and Leaflet map are from the repository README.',
      nodes: [
        { id: 'spa', label: 'React SPA', sub: 'Leaflet map · Recharts', col: 0, row: 0 },
        { id: 'nginx', label: 'Nginx on EC2', sub: 'Docker container', col: 1, row: 0 },
        { id: 'api', label: 'Express REST API', sub: '12 APIs · role-based auth', col: 2, row: 0 },
        { id: 'mongo', label: 'MongoDB', sub: '2 schemas · 2dsphere index', col: 3, row: 0 },
        { id: 'ai', label: 'Gemini agents', sub: 'classify · duplicates · SLA', col: 2, row: 1 },
        { id: 'redis', label: 'Redis', sub: 'cache-aside', col: 3, row: 1 },
        { id: 's3', label: 'Private S3', sub: '1 h presigned URLs · IAM role', col: 3, row: 2 },
      ],
      edges: [
        ['spa', 'nginx'],
        ['nginx', 'api'],
        ['api', 'mongo'],
        ['api', 'ai'],
        ['api', 'redis'],
        ['api', 's3'],
      ],
    },
    decisions: [
      'Cache-aside Redis caching with invalidation on issue mutations.',
      'Geospatial duplicate detection with a MongoDB 2dsphere index and $near queries (100 m radius).',
      'Private S3 bucket, 1-hour presigned URLs and EC2 IAM roles instead of embedded credentials.',
      'Role-based access for citizens, department staff and administrators.',
    ],
    challenges: [
      {
        title: 'Latency on repeat reads',
        text: 'Measured across 35 benchmark runs, with cache invalidation verified on issue mutations.',
      },
      {
        title: 'Spotting duplicate reports',
        text: 'Nearby issues are found with a geospatial index rather than by scanning every document.',
      },
    ],
    results: [
      { value: '87.08 → 1.42 ms', label: 'median retrieval latency with Redis (~98% reduction, 35 runs)' },
      { value: '41.44 ms', label: 'median 100 m-radius proximity query (35 runs)' },
      { value: '12', label: 'REST APIs' },
    ],
    resultsNote: 'Figures are as reported on the resume for the internship build.',
    repo: GH + 'civicconnect_deploy',
    live: 'https://civicconnect-deploy.vercel.app',
  },
  {
    id: 'devpilot',
    name: 'DevPilot AI',
    subtitle: 'Deployment setup for student MERN projects, delivered as a pull request',
    glyph: 'D',
    cover: '#2a1f2f',
    status: 'Runs locally with Docker Compose (per README). No public deployment.',
    problem:
      'A student’s app works on their laptop, but putting it online needs a Dockerfile, CI workflow, Render config and safe secret handling.',
    why: 'It reads a student’s GitHub repo, works out how it is built, generates those files, proves them in a Docker sandbox, waits for approval, and opens a pull request. It never merges and never sees a secret.',
    stack: ['FastAPI', 'SQLAlchemy', 'PostgreSQL + pgvector', 'LangGraph', 'React 18', 'Vite', 'Docker', 'GitHub App'],
    arch: {
      caption: 'The workflow pauses for approval and survives restarts through a PostgreSQL checkpointer.',
      nodes: [
        { id: 'gh', label: 'GitHub App', sub: 'read-only first', col: 0, row: 0 },
        { id: 'analyze', label: 'Analyze', sub: 'rules over package.json', col: 1, row: 0 },
        { id: 'gen', label: 'Generate', sub: 'Dockerfile · CI · render.yaml', col: 2, row: 0 },
        { id: 'val', label: 'Validate', sub: 'policy rules + Docker sandbox', col: 3, row: 0 },
        { id: 'rag', label: 'Doc research', sub: 'bge-small + pgvector, 25 pages', col: 1, row: 1 },
        { id: 'ok', label: 'Human approval', sub: 'workflow pauses', col: 3, row: 1 },
        { id: 'pr', label: 'Pull request', sub: 'write access only now', col: 2, row: 1 },
      ],
      edges: [
        ['gh', 'analyze'],
        ['analyze', 'gen'],
        ['gen', 'val'],
        ['analyze', 'rag'],
        ['val', 'ok'],
        ['ok', 'pr'],
      ],
    },
    decisions: [
      'No language model writes or changes any file: generation uses fixed templates, validated values and policy rules.',
      'Generated files are proven in a throwaway Docker sandbox (no network, memory/CPU/pid limits, all capabilities dropped).',
      'GitHub access is read-only until the student approves; write access is requested only for the pull request.',
      'A separate worker handles GitHub and Docker and talks to the API only through the database.',
    ],
    challenges: [
      {
        title: 'Being honest about where AI is used',
        text: 'The README spells out each part: LangGraph orchestrates state, branching and the approval pause; RAG only cites docs in the report.',
      },
    ],
    results: [
      { value: '0.73 vs 0.58', label: 'doc-retrieval hit@1, embeddings vs keyword baseline (labelled set)' },
      { value: '25', label: 'official doc pages in the retrieval index' },
    ],
    resultsNote: 'Not deployed publicly; requires registering a GitHub App to use on a real repository.',
    repo: GH + 'devpilot-ai',
    live: null,
  },
  {
    id: 'cache',
    name: 'Cache Replacement Policy Simulator',
    subtitle: 'FIFO, LRU and LFU in C++17',
    glyph: 'S',
    cover: '#2e2a22',
    status: 'Complete; builds with g++ or CMake and includes a unit-test suite.',
    problem: 'Eviction policies behave very differently under different access patterns, and that is hard to see without measurement.',
    why: 'Three policies behind one abstract interface, benchmarked on identical workloads so the differences are measurable rather than asserted.',
    stack: ['C++17', 'STL', 'OOP', 'CMake'],
    arch: {
      caption: 'FIFO, LRU and LFU all implement the CachePolicy abstract base class (virtual get, put, clear).',
      nodes: [
        { id: 'gen', label: 'Workload generator', sub: 'uniform · 80/20 · 90/10', col: 0, row: 1 },
        { id: 'fifo', label: 'FIFOCache', sub: 'unordered_map + queue', col: 1, row: 0 },
        { id: 'lru', label: 'LRUCache', sub: 'unordered_map + list splice · O(1)', col: 1, row: 1 },
        { id: 'lfu', label: 'LFUCache', sub: 'frequency buckets · O(1)', col: 1, row: 2 },
        { id: 'bench', label: 'Benchmark', sub: '10 seeds · 20,000 accesses', col: 2, row: 1 },
      ],
      edges: [
        ['gen', 'fifo'],
        ['gen', 'lru'],
        ['gen', 'lfu'],
        ['fifo', 'bench'],
        ['lru', 'bench'],
        ['lfu', 'bench'],
      ],
    },
    decisions: [
      'Abstract base class with a virtual destructor and pure virtual get/put/clear gives runtime polymorphism across policies.',
      'LRU uses a hash map plus a linked list with splice; LFU uses frequency buckets with LRU tie-breaking — both O(1) on average.',
      'Identical workloads and 10 random seeds per experiment, reporting min and max as well as the mean.',
    ],
    challenges: [
      {
        title: 'Showing where each policy wins',
        text: 'On a uniform workload all three tie near 20%; on 80/20 hot-cold, LFU pulls clearly ahead; on a 90/10 skew LRU and LFU converge.',
      },
    ],
    results: [
      { value: '74.06%', label: 'LFU hit rate on 80/20 hot-cold (FIFO 51.64%, LRU 57.61%)' },
      { value: '+43.4%', label: 'LFU vs FIFO on the 80/20 workload' },
      { value: '20,000', label: 'accesses per trial, 1,000 keys, capacity 200' },
    ],
    resultsNote: 'Figures are the README’s 10-seed averages. The resume quotes different headline numbers (80.61% vs 57.55%).',
    repo: GH + 'Cache_simulator',
    live: null,
  },
]

// Smaller scrolls: real repositories, shown as one-line links only (no extra claims).
export const archive = [
  {
    name: 'Student Stress Level Prediction',
    text: '3-class stress classifier (Logistic Regression, Random Forest, XGBoost) with a Streamlit app. Best model: Logistic Regression, 98.77% accuracy and 97.86% Macro-F1 on a 406-sample held-out split.',
    repo: GH + 'Student_mental_health',
  },
  {
    name: 'QuickShow',
    text: 'Movie ticket booking app with seat selection, Stripe payments and background jobs that release unpaid seats (as described on the GitHub profile).',
    repo: GH + 'quickshow_deploy',
  },
  {
    name: 'The Lenny Growth Assistant',
    text: 'RAG chat application over podcast and newsletter transcripts: FastAPI, PostgreSQL + pgvector, Ollama or hosted models.',
    repo: GH + 'lenny-s-assistant',
  },
]
