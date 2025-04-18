// src/mock/organizationData.ts
import { Member, Organization } from "./organization"

// Mock Members
export const MOCK_MEMBERS: Member[] = [
  { id: 'mem-001', name: 'Alex Johnson', role: 'Lead Developer' },
  { id: 'mem-002', name: 'Sarah Chen', role: 'Product Manager' },
  { id: 'mem-003', name: 'Michael Rodriguez', role: 'UX Designer' },
  { id: 'mem-004', name: 'Taylor Kim', role: 'Backend Engineer' },
  { id: 'mem-005', name: 'Jordan Smith', role: 'Frontend Developer' },
  { id: 'mem-006', name: 'Morgan Wilson', role: 'DevOps Engineer' },
  { id: 'mem-007', name: 'Casey Brown', role: 'Data Scientist' },
  { id: 'mem-008', name: 'Riley Thompson', role: 'QA Engineer' },
  { id: 'mem-009', name: 'Jamie Lee', role: 'Content Strategist' },
  { id: 'mem-010', name: 'Quinn Parker', role: 'Marketing Specialist' }
];

// Mock Organizations
export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-001',
    name: 'Design Team',
    members: [MOCK_MEMBERS[2], MOCK_MEMBERS[8]]
  },
  {
    id: 'org-002',
    name: 'Engineering',
    members: [MOCK_MEMBERS[0], MOCK_MEMBERS[3], MOCK_MEMBERS[4], MOCK_MEMBERS[5], MOCK_MEMBERS[7]]
  },
  {
    id: 'org-003',
    name: 'Marketing',
    members: [MOCK_MEMBERS[9]]
  },
  {
    id: 'org-004',
    name: 'Data Science',
    members: [MOCK_MEMBERS[6]]
  },
  {
    id: 'org-005',
    name: 'Product',
    members: [MOCK_MEMBERS[1]]
  }
];

// All members without organization assignment - for member selection
export const AVAILABLE_MEMBERS: Member[] = [
  ...MOCK_MEMBERS,
  { id: 'mem-011', name: 'Sam Patel', role: '' },
  { id: 'mem-012', name: 'Avery Williams', role: '' },
  { id: 'mem-013', name: 'Jordan Taylor', role: '' },
  { id: 'mem-014', name: 'Robin Garcia', role: '' },
  { id: 'mem-015', name: 'Alex Martinez', role: '' }
];