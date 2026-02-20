import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, createMockServices } from '../test/test-utils';
import ProfilePage from './ProfilePage';
import type { Resume, UserProfile } from '../types';

const mockProfile: UserProfile = {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    targetRole: 'Software Engineer',
    targetCompany: 'Google',
    onboardingCompleted: true,
    projects: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-16T00:00:00Z',
};

const mockResume: Resume = {
    id: 'resume-1',
    userId: 'user-1',
    workExperiences: [
        {
            id: 'exp-1',
            company: 'Acme Corp',
            position: 'Senior Engineer',
            startDate: '2024-01',
            endDate: '2026-01',
            description: 'Led backend development',
            achievements: ['Built scalable API', 'Reduced latency by 40%'],
        },
    ],
    education: [
        {
            id: 'edu-1',
            school: 'MIT',
            degree: 'B.S.',
            field: 'Computer Science',
            startDate: '2020',
            endDate: '2024',
        },
    ],
    projects: [
        {
            id: 'proj-1',
            title: 'Open Source CLI',
            description: 'A command-line tool for developers',
            role: 'Creator',
            technologies: ['TypeScript', 'Node.js'],
            url: 'https://github.com/example',
        },
    ],
    skills: ['TypeScript', 'React', 'Node.js'],
    resumePdfPath: '/path/to/resume.pdf',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-02-16T00:00:00Z',
};

function createServicesWithData(profile: UserProfile | null, resume: Resume | null) {
    const services = createMockServices();
    services.user.getUserProfile = vi.fn().mockResolvedValue(profile);
    services.user.getResume = vi.fn().mockResolvedValue(resume);
    return services;
}

describe('ProfilePage', () => {
    it('renders loading spinner initially', () => {
        const services = createMockServices();
        services.user.getUserProfile = vi.fn().mockReturnValue(new Promise(() => { }));
        services.user.getResume = vi.fn().mockReturnValue(new Promise(() => { }));

        renderWithProviders(<ProfilePage />, { services });

        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders profile name and target role', async () => {
        const services = createServicesWithData(mockProfile, null);

        renderWithProviders(<ProfilePage />, { services });

        expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText(/Software Engineer/)).toBeInTheDocument();
    });

    it('renders "No Resume Data" when resume is null', async () => {
        const services = createServicesWithData(mockProfile, null);

        renderWithProviders(<ProfilePage />, { services });

        expect(await screen.findByText('No Resume Data Yet')).toBeInTheDocument();
    });

    it('renders work experience with achievements', async () => {
        const services = createServicesWithData(mockProfile, mockResume);

        renderWithProviders(<ProfilePage />, { services });

        expect(await screen.findByText('Senior Engineer')).toBeInTheDocument();
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('Built scalable API')).toBeInTheDocument();
        expect(screen.getByText('Reduced latency by 40%')).toBeInTheDocument();
    });

    it('renders education section', async () => {
        const services = createServicesWithData(mockProfile, mockResume);

        renderWithProviders(<ProfilePage />, { services });

        expect(await screen.findByText('MIT')).toBeInTheDocument();
        expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
    });

    it('renders projects with technologies', async () => {
        const services = createServicesWithData(mockProfile, mockResume);

        renderWithProviders(<ProfilePage />, { services });

        expect(await screen.findByText('Open Source CLI')).toBeInTheDocument();
        expect(screen.getByText('A command-line tool for developers')).toBeInTheDocument();
        expect(screen.getAllByText('TypeScript').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Node.js').length).toBeGreaterThanOrEqual(1);
    });

    it('renders skills as tags', async () => {
        const services = createServicesWithData(mockProfile, mockResume);

        renderWithProviders(<ProfilePage />, { services });

        expect(await screen.findByText('React')).toBeInTheDocument();
    });

    it('renders "Open PDF" button when resumePdfPath exists', async () => {
        const services = createServicesWithData(mockProfile, mockResume);

        renderWithProviders(<ProfilePage />, { services });

        expect(await screen.findByText(/Open PDF/)).toBeInTheDocument();
    });

    it('does not render "Open PDF" when no PDF path', async () => {
        const resumeNoPdf = { ...mockResume, resumePdfPath: undefined };
        const services = createServicesWithData(mockProfile, resumeNoPdf);

        renderWithProviders(<ProfilePage />, { services });

        await screen.findByText('Jane Doe');
        expect(screen.queryByText(/Open PDF/)).not.toBeInTheDocument();
    });
});
