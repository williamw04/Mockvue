import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../test/test-utils';
import ResumeUploadStep from './ResumeUploadStep';

describe('ResumeUploadStep', () => {
    it('renders the page title', () => {
        renderWithProviders(<ResumeUploadStep onComplete={vi.fn()} />);

        expect(screen.getByText('Add Your Resume')).toBeInTheDocument();
    });

    it('renders upload section', () => {
        renderWithProviders(<ResumeUploadStep onComplete={vi.fn()} />);

        expect(screen.getByText(/Quick Fill with AI/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Gemini API Key')).toBeInTheDocument();
    });

    it('renders manual entry form fields', () => {
        renderWithProviders(<ResumeUploadStep onComplete={vi.fn()} />);

        expect(screen.getByText(/Work Experience/)).toBeInTheDocument();
        expect(screen.getByText(/Skills/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Company *')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Position *')).toBeInTheDocument();
    });

    it('disables Parse button when no file or API key', () => {
        renderWithProviders(<ResumeUploadStep onComplete={vi.fn()} />);

        // The parse button should be disabled by default
        const parseButton = screen.getByText('🚀 Parse');
        expect(parseButton).toBeDisabled();
    });

    it('disables Continue when no work experience entered', () => {
        renderWithProviders(<ResumeUploadStep onComplete={vi.fn()} />);

        const continueButton = screen.getByText('Continue');
        expect(continueButton).toBeDisabled();
    });

    it('enables Continue when work experience is filled', async () => {
        const user = userEvent.setup();
        renderWithProviders(<ResumeUploadStep onComplete={vi.fn()} />);

        const companyInput = screen.getByPlaceholderText('Company *');
        const positionInput = screen.getByPlaceholderText('Position *');

        await user.type(companyInput, 'Acme Corp');
        await user.type(positionInput, 'Engineer');

        const continueButton = screen.getByText('Continue');
        expect(continueButton).not.toBeDisabled();
    });

    it('calls onComplete after successful save', async () => {
        const onComplete = vi.fn();
        const user = userEvent.setup();
        const { services } = renderWithProviders(
            <ResumeUploadStep onComplete={onComplete} />,
        );

        services.user.saveResume = vi.fn().mockResolvedValue({});

        const companyInput = screen.getByPlaceholderText('Company *');
        const positionInput = screen.getByPlaceholderText('Position *');

        await user.type(companyInput, 'TestCo');
        await user.type(positionInput, 'Dev');

        const continueButton = screen.getByText('Continue');
        await user.click(continueButton);

        // Wait for async save
        await vi.waitFor(() => {
            expect(onComplete).toHaveBeenCalled();
        });
    });

    it('adds work experience entry when "Add Experience" is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<ResumeUploadStep onComplete={vi.fn()} />);

        const addButton = screen.getByText('+ Add Experience');
        await user.click(addButton);

        const companyInputs = screen.getAllByPlaceholderText('Company *');
        expect(companyInputs).toHaveLength(2);
    });

    it('renders skills textarea', () => {
        renderWithProviders(<ResumeUploadStep onComplete={vi.fn()} />);

        expect(
            screen.getByPlaceholderText(/Enter your skills separated by commas/),
        ).toBeInTheDocument();
    });
});
