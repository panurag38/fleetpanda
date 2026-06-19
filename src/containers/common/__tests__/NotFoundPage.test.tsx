import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';

describe('NotFoundPage', () => {
  it('shows the missing path and a link to home', () => {
    render(
      <MemoryRouter initialEntries={['/missing-page']}>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByText('/missing-page')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to home/i })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: /overview/i })).not.toBeInTheDocument();
  });
});
