export interface Contribution {
    idea: string;
    status: 'Under Consideration' | 'Approved' | 'Implemented';
}

export interface Contributor {
    id: string;
    name: string;
    avatarUrl?: string;
    profileUrl?: string;
    contributions: Contribution[];
}


export const contributors: Contributor[] = [
    {
        id: '1',
        name: 'Aastha Singh Thakur',
        contributions: [
            { idea: 'Feature Proposal: Rate Limiting.', status: 'Under Consideration' },
            { idea: 'Feature Proposal: API Usage Monitoring.', status: 'Implemented' },
        ],
        avatarUrl: '/assets/woman.png',
        profileUrl: 'https://www.linkedin.com/'
    }
];