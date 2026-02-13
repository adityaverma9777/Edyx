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
    },
    {
        id: '2',
        name: 'Prakhar Parikh',
        contributions: [
            { idea: 'Proper colors and UX (Currently red is used for even positive points)', status: 'Approved' },
            { idea: 'Feature Proposal: Implementing Google OAuth based faster login.', status: 'Approved' },
            { idea: 'A free GPT 4 API ', status: 'Under Consideration' },
            { idea: 'Future Scalability: Scaling platform using AWS/GCP infra at lower costs', status: 'Under Consideration' },
        ],
        avatarUrl: '/assets/boy.png',
        profileUrl: 'https://www.linkedin.com/in/prakhar-parikh/'
    }

];