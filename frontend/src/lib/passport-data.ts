export type Role = "student" | "issuer" | "verifier";

export const student = {
  name: "Ava Chen",
  handle: "@ava.eth",
  university: "MIT",
  gradYear: 2026,
  wallet: "0x71C4a08bE4F2B9a1D34c6E71d3f2b7C0a5b9e3A9",
  avatar: "AC",
  github: "ava-chen",
  linkedin: "avachen",
};

export const shortWallet = (w: string) => `${w.slice(0, 5)}…${w.slice(-3)}`;

export type Credential = {
  id: string;
  tokenId: string;
  category: "Hackathons" | "Certifications" | "Internships" | "Projects";
  title: string;
  issuer: string;
  issuerVerified: boolean;
  date: string;
  txHash: string;
  ipfs: string;
  meta: Record<string, string>;
};

export const credentials: Credential[] = [
  {
    id: "c1",
    tokenId: "SBT-0421",
    category: "Hackathons",
    title: "ETHGlobal — Grand Prize",
    issuer: "ETHGlobal",
    issuerVerified: true,
    date: "Mar 2025",
    txHash: "0x9f3a4c1e7b2d8f6a4c9e1b3d7a5f2c9e8b1a4d6f3c9e2b7a1d4f6c9e3a2b5d8f",
    ipfs: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    meta: {
      Event: "ETHGlobal Istanbul",
      "Team Size": "4",
      Placement: "1st Place — Grand Prize",
      Tracks: "Zero Knowledge · Public Goods",
    },
  },
  {
    id: "c2",
    tokenId: "SBT-0387",
    category: "Hackathons",
    title: "Solana Radar — Finalist",
    issuer: "Solana Foundation",
    issuerVerified: true,
    date: "Nov 2024",
    txHash: "0x2c7f4b9e1a3d6c8f5b2e9a4d7c1f3b8e6a2d5c9f1b7e4a8d3c6f2b9e5a1d7c4f",
    ipfs: "bafybeif2rl5lrtjy4rk4tge6nrq3z7xj4h6ihtjnkdmuysu5x3zqwex72e",
    meta: {
      Event: "Solana Radar Global",
      "Team Size": "3",
      Placement: "Finalist (Top 10)",
      Tracks: "DePIN · Consumer",
    },
  },
  {
    id: "c3",
    tokenId: "SBT-0298",
    category: "Certifications",
    title: "Ethereum Developer — Advanced",
    issuer: "Polygon Academy",
    issuerVerified: true,
    date: "Aug 2024",
    txHash: "0x4d8a2c7f1b6e9a3d5c8f2b4e7a1d9c6f3b8e5a2d4c7f1b9e6a3d8c5f2b7e4a1d",
    ipfs: "bafybeihq2j5cqfr4srlcmqzo7vddmqhb7v5w7cmxb2yz3vzxlz3n7oa5p4",
    meta: {
      Platform: "Polygon Academy",
      "Certificate ID": "PA-ADV-2024-4102",
      Skills: "Solidity · EVM · Gas Optimization · Foundry",
      Score: "94 / 100",
    },
  },
  {
    id: "c4",
    tokenId: "SBT-0221",
    category: "Internships",
    title: "Protocol Engineering Intern",
    issuer: "Uniswap Labs",
    issuerVerified: true,
    date: "Jun — Sep 2024",
    txHash: "0x7e1b4d9c2a5f8b3e6a1d4c7f9b2e5a8d1c4f7b3e6a9d2c5f8b1e4a7d3c6f9b2e",
    ipfs: "bafybeif4o5dz3vrtggmwesq7d5eqjyxvqz6gxq4tnjqz5b6vsnfqjc3rwm",
    meta: {
      Company: "Uniswap Labs",
      Role: "Protocol Engineering Intern",
      "Tech Stack": "Rust · Solidity · TypeScript",
      Dates: "Jun 2024 — Sep 2024",
    },
  },
  {
    id: "c5",
    tokenId: "SBT-0163",
    category: "Projects",
    title: "zkAttest — Anonymous Credentials",
    issuer: "Self-Attested (MIT DCI)",
    issuerVerified: false,
    date: "Feb 2024",
    txHash: "0x1a6f3c9b2e5d8a4c7f1b9e6a3d2c5f8b4e7a1d9c6f3b2e5a8d4c7f1b6e9a3d2c",
    ipfs: "bafybeihb3n7cxk4mrxvw2vzq5jyaz7yfclmqkbv2v6ubkacsgz3n5eftgu",
    meta: {
      Repository: "github.com/ava-chen/zkattest",
      "Tech Stack": "Circom · Halo2 · Next.js",
      Stars: "1.2k",
    },
  },
  {
    id: "c6",
    tokenId: "SBT-0134",
    category: "Projects",
    title: "Onchain Reputation Graph",
    issuer: "Self-Attested",
    issuerVerified: false,
    date: "Oct 2023",
    txHash: "0x5b9e2a7d4c1f6b3e8a2d5c9f1b7e4a8d3c6f2b9e5a1d7c4f8b2e6a9d3c5f1b7e",
    ipfs: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzda",
    meta: {
      Repository: "github.com/ava-chen/rep-graph",
      "Tech Stack": "Go · The Graph · Postgres",
    },
  },
];

export const issuedHistory = [
  { id: "i1", recipient: "0x71C4…3A9", title: "Ethereum Developer — Advanced", date: "2024-08-14", tx: "0x4d8a2c7f…4a1d", type: "Certification" },
  { id: "i2", recipient: "0x8fA3…19C", title: "Ethereum Developer — Foundational", date: "2024-08-14", tx: "0x9c2e7b1a…3f8d", type: "Certification" },
  { id: "i3", recipient: "0x22bE…7d1", title: "ZK Circuits — Practitioner", date: "2024-07-02", tx: "0x1f4a8c2e…9b5d", type: "Certification" },
  { id: "i4", recipient: "0x4fCd…a02", title: "Ethereum Developer — Advanced", date: "2024-06-19", tx: "0x7a3c9e1b…2d6f", type: "Certification" },
  { id: "i5", recipient: "0xB19a…c44", title: "L2 Scaling — Deep Dive", date: "2024-05-30", tx: "0x5e8b2d4c…1a9f", type: "Certification" },
];

export const issuer = {
  name: "Polygon Academy",
  type: "Education · Ecosystem",
  wallet: "0xACA0…D3E1",
  issued: 1284,
  verified: true,
};

// Heatmap: 52 weeks x 7 days, intensity 0-4
export const contributionHeatmap: number[][] = Array.from({ length: 52 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => {
    const seed = (w * 7 + d) * 9301 + 49297;
    const rnd = (seed % 233280) / 233280;
    if (rnd < 0.35) return 0;
    if (rnd < 0.6) return 1;
    if (rnd < 0.8) return 2;
    if (rnd < 0.93) return 3;
    return 4;
  }),
);

export const githubStats = {
  stars: 2843,
  followers: 412,
  repos: 47,
  topLanguages: [
    { name: "TypeScript", pct: 42 },
    { name: "Solidity", pct: 27 },
    { name: "Rust", pct: 18 },
    { name: "Go", pct: 13 },
  ],
};
