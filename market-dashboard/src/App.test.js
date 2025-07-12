import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dark/light mode toggle button', () => {
  render(<App />);
  // The button should contain either 'Dark Mode' or 'Light Mode' text or icon
  const toggleButton = screen.getByRole('button', { name: /dark mode|light mode|🌙|☀️/i });
  expect(toggleButton).toBeInTheDocument();
});
