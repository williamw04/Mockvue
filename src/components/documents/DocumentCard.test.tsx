import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../test/test-utils';
import { DocumentCard } from './DocumentCard';
import type { Document } from '../../types';

const mockDocument: Document = {
  id: 'doc-1',
  userId: 'user-1',
  title: 'Behavioral Interview Questions',
  description: 'Common questions for PM interviews',
  questions: [
    { id: 'q1', text: 'Tell me about leadership', response: 'I once led...', isExpanded: false },
    { id: 'q2', text: 'Describe a failure', response: '', isExpanded: false },
    { id: 'q3', text: 'Teamwork example', response: 'In my last team...', isExpanded: false },
  ],
  tags: ['pm', 'behavioral'],
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-02-10T14:30:00Z',
  lastModified: '2026-02-10T14:30:00Z',
};

describe('DocumentCard', () => {
  it('renders document title', () => {
    renderWithProviders(
      <DocumentCard document={mockDocument} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('Behavioral Interview Questions')).toBeInTheDocument();
  });

  it('renders document description', () => {
    renderWithProviders(
      <DocumentCard document={mockDocument} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('Common questions for PM interviews')).toBeInTheDocument();
  });

  it('shows question count', () => {
    renderWithProviders(
      <DocumentCard document={mockDocument} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('3 questions')).toBeInTheDocument();
  });

  it('shows answered count', () => {
    renderWithProviders(
      <DocumentCard document={mockDocument} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('2/3 answered')).toBeInTheDocument();
  });

  it('links to the document editor', () => {
    renderWithProviders(
      <DocumentCard document={mockDocument} onDelete={vi.fn()} />,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/document/doc-1');
  });

  it('does not render description when empty', () => {
    const docWithoutDesc = { ...mockDocument, description: undefined };
    renderWithProviders(
      <DocumentCard document={docWithoutDesc} onDelete={vi.fn()} />,
    );

    expect(screen.queryByText('Common questions for PM interviews')).not.toBeInTheDocument();
  });

  it('calls onDelete with document id when delete is confirmed', async () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();

    renderWithProviders(
      <DocumentCard document={mockDocument} onDelete={onDelete} />,
    );

    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('doc-1');
  });

  it('does not call onDelete when delete is cancelled', async () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();

    renderWithProviders(
      <DocumentCard document={mockDocument} onDelete={onDelete} />,
    );

    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
