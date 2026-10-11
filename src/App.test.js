import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('shows the city search and popular city shortcuts', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /weather, where you are/i })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: /search for a city/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'London' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Tokyo' })).toBeInTheDocument();
});

test('searches a city and displays its current weather', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', latitude: 35.68, longitude: 139.69 }],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 24,
          relative_humidity_2m: 68,
          apparent_temperature: 26,
          weather_code: 1,
          wind_speed_10m: 12,
          time: '2026-10-12T09:00',
        },
      }),
    });

  const { container } = render(<App />);
  fireEvent.change(screen.getByRole('searchbox', { name: /search for a city/i }), {
    target: { value: 'Tokyo' },
  });
  fireEvent.click(screen.getByRole('button', { name: /search/i }));

  expect(await screen.findByRole('heading', { name: 'Tokyo' })).toBeInTheDocument();
  await waitFor(() => expect(container.querySelector('.detail-value')).toHaveTextContent('68%'));
  expect(container.querySelector('.temperature')).toHaveTextContent('24°');
  expect(container.querySelectorAll('.detail-value')[1]).toHaveTextContent('26°');
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
