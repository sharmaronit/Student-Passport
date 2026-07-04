-- ============================================
-- Seed Data for Development (Web3)
-- Uses sample Ethereum-style wallet addresses
-- ============================================

-- Sample Issuer: TechCorp Industries
INSERT INTO profiles (id, wallet_address, role, full_name, email, org_name, org_type, org_website, org_verified)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '0x1234567890abcdef1234567890abcdef12345678',
    'issuer',
    'TechCorp Admin',
    'admin@techcorp.dev',
    'TechCorp Industries',
    'company',
    'https://techcorp.dev',
    TRUE
);

-- Sample Issuer: HackOrg Events
INSERT INTO profiles (id, wallet_address, role, full_name, email, org_name, org_type, org_website, org_verified)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    'issuer',
    'HackOrg Organizer',
    'organizer@hackorg.io',
    'HackOrg Events',
    'hackathon_org',
    'https://hackorg.io',
    TRUE
);

-- Sample Student: Jane Doe
INSERT INTO profiles (id, wallet_address, role, full_name, email, university, graduation_year, github_url, linkedin_url)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    '0x9876543210fedcba9876543210fedcba98765432',
    'student',
    'Jane Doe',
    'jane.doe@university.edu',
    'MIT',
    2025,
    'https://github.com/janedoe',
    'https://linkedin.com/in/janedoe'
);

-- Sample Credentials (off-chain cache, no on-chain data yet)
INSERT INTO credentials (id, student_id, issuer_id, credential_type, title, description, status, issued_at, metadata)
VALUES
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'hackathon',
    'HackMIT 2024 — 1st Place',
    'Won first place at HackMIT 2024 in the AI track',
    'issued',
    NOW(),
    '{
        "event_name": "HackMIT 2024",
        "event_date": "2024-10-15",
        "team_name": "Neural Ninjas",
        "team_size": 4,
        "placement": "1st",
        "tracks": ["AI", "Education"],
        "event_url": "https://hackmit.org/2024"
    }'::jsonb
),
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'internship',
    'SWE Intern at TechCorp',
    'Summer 2024 internship on the Platform team',
    'issued',
    NOW(),
    '{
        "company": "TechCorp Industries",
        "role": "Software Engineering Intern",
        "start_date": "2024-06-01",
        "end_date": "2024-08-31",
        "tech_stack": ["Go", "PostgreSQL", "Docker", "gRPC"],
        "manager_name": "John Smith",
        "manager_email": "john.smith@techcorp.dev"
    }'::jsonb
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    NULL,
    'certification',
    'AWS Solutions Architect Associate',
    'Amazon Web Services cloud certification',
    'issued',
    NOW(),
    '{
        "platform": "AWS",
        "cert_id": "AWS-SAA-C03-2024-12345",
        "cert_url": "https://aws.amazon.com/verification/12345",
        "skill_tags": ["cloud", "architecture", "devops"],
        "level": "associate"
    }'::jsonb
),
(
    '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    NULL,
    'project',
    'Student Skill Passport',
    'A blockchain-powered digital wallet for verifiable credentials',
    'pending',
    NULL,
    '{
        "repo_url": "https://github.com/janedoe/skill-passport",
        "live_url": "https://skillpassport.dev",
        "tech_stack": ["Go", "Solidity", "React", "PostgreSQL"],
        "contributors": ["Jane Doe", "Alex Chen"],
        "description": "Full-stack Web3 verifiable credentials platform"
    }'::jsonb
);
