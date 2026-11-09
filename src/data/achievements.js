// Source: resume (Education, Experience, Achievements and Certifications).
// Items from the GitHub profile README that are NOT on the resume are kept in `unverified`
// and are never rendered until the owner confirms them.

export const education = [
  {
    id: 'srm',
    kind: 'degree',
    title: 'B.Tech, Computer Science and Engineering',
    org: 'SRM University AP',
    place: 'Guntur, AP',
    period: 'Aug 2023 – May 2027 (expected)',
    detail: 'CGPA 8.90',
  },
  {
    id: 'xii',
    kind: 'school',
    title: 'Class XII',
    org: 'Sri Chaitanya Junior College',
    place: 'Tirupati, AP',
    period: 'Aug 2021 – Mar 2023',
    detail: '95.7%',
  },
]

export const experience = [
  {
    id: 'edunet',
    kind: 'internship',
    title: 'Full-Stack Developer Intern',
    org: 'Edunet Foundation',
    period: 'Jun 2025 – Aug 2025',
    bullets: [
      'Architected a full-stack civic issue reporting platform with 12 REST APIs, role-based authentication and a 2-schema MongoDB data model, deployed with Docker on AWS EC2 behind Nginx.',
      'Implemented Redis cache-aside caching, reducing median data-retrieval latency from 87.08 ms to 1.42 ms (~98%) across 35 benchmark runs, with cache invalidation verified on issue mutations.',
      'Engineered geospatial duplicate detection with MongoDB 2dsphere indexing and $near queries: 41.44 ms median query latency across 35 runs for 100 m-radius proximity checks.',
      'Secured images with private AWS S3 storage, 1-hour presigned URLs and EC2 IAM roles instead of embedded credentials.',
    ],
  },
]

export const certifications = [
  {
    id: 'aws-aip',
    kind: 'certification',
    title: 'AWS Certified AI Practitioner',
    org: 'Amazon Web Services',
    detail: 'Exam code AIF-C01',
  },
]

export const milestones = [
  {
    id: 'dsa',
    kind: 'achievement',
    title: '300+ DSA problems solved',
    org: 'LeetCode · GeeksforGeeks · TakeUForward',
    detail: 'Problem solving across three platforms.',
    link: 'https://leetcode.com/u/tejaswaroopreddy',
    linkLabel: 'LeetCode profile',
  },
]

// Appear on the GitHub profile README but not on the resume. NOT displayed. Ask the owner to confirm.
export const unverified = ['MongoDB Associate Developer Certification', 'Oracle Java SE 17 Certification']

// What the Hall of Achievements displays as collectible artifacts, in order along the hall.
export const hallItems = [
  { ...education[0], artifact: 'scroll', label: 'Degree scroll' },
  { ...education[1], artifact: 'scroll', label: 'Class XII scroll' },
  { ...experience[0], artifact: 'banner', label: 'Edunet banner' },
  { ...certifications[0], artifact: 'medallion', label: 'AWS medallion' },
  { ...milestones[0], artifact: 'shield', label: 'DSA shield' },
]
