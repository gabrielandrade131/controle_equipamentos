import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen when unauthenticated', () => {
  render(<App />);
  expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
});
