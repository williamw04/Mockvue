import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../test/test-utils';
import SurveyStep from './SurveyStep';

describe('SurveyStep', () => {
  // ─── Rendering ─────────────────────────────────────────────────

  it('renders the first survey screen by default', () => {
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    expect(screen.getByText('The "Curveball" Problem')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
  });

  it('renders all five Likert options', () => {
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    expect(screen.getByText('Exactly')).toBeInTheDocument();
    expect(screen.getByText('A little')).toBeInTheDocument();
    expect(screen.getByText('Somewhat')).toBeInTheDocument();
    expect(screen.getByText('Barely')).toBeInTheDocument();
    expect(screen.getByText('Not at all')).toBeInTheDocument();
  });

  it('renders the statement text for the first screen', () => {
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    expect(screen.getByText(/I frequently feel caught off guard/)).toBeInTheDocument();
  });

  // ─── Navigation ────────────────────────────────────────────────

  it('disables Next button when no option is selected', () => {
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('enables Next button after selecting a Likert option', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    await user.click(screen.getByText('A little'));

    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
  });

  it('navigates to screen 2 when Next is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    await user.click(screen.getByText('Exactly'));
    await user.click(screen.getByText('Next'));

    expect(screen.getByText('The "Feedback Gap" Problem')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
  });

  it('navigates back to screen 1 when Back is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    // Go to screen 2
    await user.click(screen.getByText('Exactly'));
    await user.click(screen.getByText('Next'));

    // Go back
    await user.click(screen.getByText('Back'));

    expect(screen.getByText('The "Curveball" Problem')).toBeInTheDocument();
  });

  it('disables Back button on the first screen', () => {
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    const backButton = screen.getByText('Back');
    expect(backButton).toBeDisabled();
  });

  it('shows Continue instead of Next on the last screen', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    // Navigate through all 3 screens
    await user.click(screen.getByText('A little'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('A little'));
    await user.click(screen.getByText('Next'));

    expect(screen.getByText('Continue')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  // ─── Value Proposition Cards ───────────────────────────────────

  it('shows value proposition card when Exactly is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    await user.click(screen.getByText('Exactly'));

    expect(screen.getByText('Your 10 Core Stories')).toBeInTheDocument();
    expect(screen.getByText(/You don't need to memorize 1,000 answers/)).toBeInTheDocument();
  });

  it('shows value proposition card when A little is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    await user.click(screen.getByText('A little'));

    expect(screen.getByText('Your 10 Core Stories')).toBeInTheDocument();
  });

  it('shows value proposition card when Somewhat is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    await user.click(screen.getByText('Somewhat'));

    expect(screen.getByText('Your 10 Core Stories')).toBeInTheDocument();
  });

  it('shows disagree acknowledgement when Barely is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    await user.click(screen.getByText('Barely'));

    expect(screen.getByText(/sounds like you're already confident/)).toBeInTheDocument();
  });

  it('shows disagree acknowledgement when Not at all is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    await user.click(screen.getByText('Not at all'));

    expect(screen.getByText(/sounds like you're already confident/)).toBeInTheDocument();
  });

  // ─── Completion ────────────────────────────────────────────────

  it('calls onComplete with all survey responses after final screen', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={onComplete} />);

    // Screen 1 — Exactly (strongly-agree)
    await user.click(screen.getByText('Exactly'));
    await user.click(screen.getByText('Next'));

    // Screen 2 — Somewhat (neutral)
    await user.click(screen.getByText('Somewhat'));
    await user.click(screen.getByText('Next'));

    // Screen 3 — Barely (disagree)
    await user.click(screen.getByText('Barely'));
    await user.click(screen.getByText('Continue'));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith([
      { questionId: 'curveball', value: 'strongly-agree' },
      { questionId: 'feedback-gap', value: 'neutral' },
      { questionId: 'delivery-pressure', value: 'disagree' },
    ]);
  });

  it('does not call onComplete if final screen has no selection', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={onComplete} />);

    // Navigate to screen 3 without selecting on screen 3
    await user.click(screen.getByText('A little'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('A little'));
    await user.click(screen.getByText('Next'));

    // Continue should be disabled
    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeDisabled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  // ─── State Persistence Across Screens ──────────────────────────

  it('remembers selections when navigating back and forward', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SurveyStep onComplete={vi.fn()} />);

    // Select A little on screen 1
    await user.click(screen.getByText('A little'));
    await user.click(screen.getByText('Next'));

    // Go back to screen 1 — selection should be remembered
    await user.click(screen.getByText('Back'));

    // Value prop should still be visible
    expect(screen.getByText('Your 10 Core Stories')).toBeInTheDocument();
  });
});
