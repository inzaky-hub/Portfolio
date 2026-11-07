import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EchoCenter from '../components/EchoCenter/index';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EchoCenter component', () => {
  it('displays the list of available commands when typing "help"', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <EchoCenter collapsed={false} />
        </AppProvider>
      </BrowserRouter>
    );

    const input = screen.getByLabelText('Echo Center command input');
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/Available commands:/i)).toBeTruthy();
    expect(screen.getByText(/book → navigate to Cover/i)).toBeTruthy();
    expect(screen.getByText(/rack 1 → Architect/i)).toBeTruthy();
    expect(screen.getByText(/rack 4 → AskInza/i)).toBeTruthy();
    expect(screen.queryByText(/Commande inconnue/i)).toBeNull();
    expect(screen.queryByText(/Unknown command/i)).toBeNull();
  });

  it('navigates to /ask when typing "rack 4"', () => {
    mockNavigate.mockClear();

    render(
      <BrowserRouter>
        <AppProvider>
          <EchoCenter collapsed={false} />
        </AppProvider>
      </BrowserRouter>
    );

    const input = screen.getByLabelText('Echo Center command input');
    fireEvent.change(input, { target: { value: 'rack 4' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledWith('/ask');
  });

  it('renders minimized 40px bar with prompt and hint when collapsed', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <EchoCenter collapsed={true} />
        </AppProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('echo:~$')).toBeTruthy();
    expect(screen.getByText(/Cliquez pour ouvrir/i)).toBeTruthy();
  });

  it('has accessible minimize, position toggle and resize handle controls', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <EchoCenter collapsed={false} />
        </AppProvider>
      </BrowserRouter>
    );

    const minimizeBtn = screen.getByLabelText(/Minimiser le terminal/i);
    expect(minimizeBtn).toBeTruthy();

    const positionBtn = screen.getByLabelText(/Positionner le terminal/i);
    expect(positionBtn).toBeTruthy();
    fireEvent.click(positionBtn);

    const resizeHandle = screen.getByLabelText(/Redimensionner la hauteur du terminal/i);
    expect(resizeHandle).toBeTruthy();
    fireEvent.keyDown(resizeHandle, { key: 'ArrowUp' });
  });
});
