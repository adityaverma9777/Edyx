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
            { idea: 'Proper colors and UX (Currently red is used for even positive points)', status: 'Implemented' },
            { idea: 'Feature Proposal: Implementing Google OAuth based faster login.', status: 'Implemented' },
            { idea: 'A free GPT 4 API ', status: 'Under Consideration' },
            { idea: 'Future Scalability: Scaling platform using AWS/GCP infra at lower costs', status: 'Under Consideration' },
        ],
        avatarUrl: '/assets/boy.png',
        profileUrl: 'https://www.linkedin.com/in/prakhar-parikh/'
    },
    {
        id: '3',
        name: 'Aditi Patro',
        contributions: [
            { idea: 'Implemented : Proper colors and UX (Greenis used for positive points)', status: 'Implemented' },
        ],
        avatarUrl: '/assets/woman.png',
        profileUrl: 'https://www.linkedin.com/in/aditi-patro/'
    },
    {
        id: '4',
        name: 'Indrasena Reddy Bala',
        contributions: [
            { idea: ' Dockerization via a docker-compose setup to streamline the local development environment for the backend, frontend, and gateway', status: 'Under Consideration' },
            { idea: ' Improve the Docs.tsx page by adding interactive code snippets (cURL/Python) to help users connect to the AI models more efficiently', status: 'Implemented' },
        ],
        avatarUrl: '/assets/boy.png',
        profileUrl: 'https://www.linkedin.com/in/indrasenareddybala'
    },
    {
        id: '5',
        name: 'Hemkumar',
        contributions: [
            { idea: 'Github Issue : Evolution log font size and formatting', status: 'Approved' },
            { idea: 'Github Issue : Add profile and feedback sections in dashboard', status: 'Under Consideration' },
            { idea: 'Github Issue : “Four Brains One API” and “Convo 2.0” positioning', status: 'Approved' },
            { idea: 'Github Issue : Error feedback could be more descriptive', status: 'Approved' },
            { idea: 'Github Issue : Landing page messaging could be clearer', status: 'Approved' },
            { idea: 'Github Issue : Model selection flow could prioritize API key and docs', status: 'Approved' },
            { idea: 'Github Issue : Feature section demo email flow not working', status: 'Implemented' },
        ],
        avatarUrl: '/assets/boy.png',
        profileUrl: 'https://www.linkedin.com/in/hemkumar05/'
    },
    {
        id: '6',
        name: 'Aisha Gupta',
        contributions: [
            { idea: 'Github Issue : No Guidance After API Key Generation', status: 'Approved' },
        ],
        avatarUrl: '/assets/woman.png',
        profileUrl: 'https://www.linkedin.com/in/aisha-gupta-1st-3a4550228/'
    },
    {
        id: '7',
        name: 'Aditya',
        contributions: [
            { idea: 'Github Issue #14: Docs page not responsive on mobile devices ', status: 'Implemented' },
        ],
        avatarUrl: '/assets/boy.png',
        profileUrl: 'https://github.com/adiaditya78'
    },
    {
        id: '8',
        name: 'Akshay',
        contributions: [
            { idea: 'Github Issue #15: Missing variables in the readme file ', status: 'Implemented' },
        ],
        avatarUrl: '/assets/boy.png',
        profileUrl: 'https://github.com/Akshay175'
    },
    {
        id: '9',
        name: 'Manasa Devi Akula',
        contributions: [
            { idea: 'Github Issue #15: Layout Improvements for Better usability & Beginner Demo Video for Edyx #16 ', status: 'Under Consideration' },
        ],
        avatarUrl: '/assets/woman.png',
        profileUrl: 'https://www.linkedin.com/in/manasa-devi-akula-a36a51375/'
    }
];