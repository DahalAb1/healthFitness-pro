import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountAvatar from '@/components/account/AccountAvatar';

function renderAvatar(overrides = {}) {
  const setAvatar = vi.fn();
  const props = {
    avatarSrc: null,
    setAvatar,
    displayName: 'Jane Doe',
    memberSince: 'Jan 2024',
    planLabel: 'Pro Plan — Active',
    ...overrides,
  };
  const utils = render(<AccountAvatar {...props} />);
  return { ...utils, setAvatar };
}

describe('AccountAvatar', () => {
  it('renders initials when no avatarSrc is provided', () => {
    renderAvatar({ displayName: 'Jane Doe' });
    expect(screen.getByText('JA')).toBeInTheDocument();
  });

  it('renders "?" initials when displayName is empty', () => {
    renderAvatar({ displayName: '' });
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders an <img> when avatarSrc is provided', () => {
    renderAvatar({ avatarSrc: 'data:image/png;base64,abc' });
    const img = screen.getByAltText('Profile');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/png;base64,abc');
  });

  it('renders the display name', () => {
    renderAvatar();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('renders the member since date', () => {
    renderAvatar();
    expect(screen.getByText('Member since Jan 2024')).toBeInTheDocument();
  });

  it('renders the plan label badge', () => {
    renderAvatar();
    expect(screen.getByText('Pro Plan — Active')).toBeInTheDocument();
  });

  it('renders the change picture button', () => {
    renderAvatar();
    expect(
      screen.getByRole('button', { name: 'Change profile picture' }),
    ).toBeInTheDocument();
  });

  it('renders the hidden file input for avatar upload', () => {
    const { container } = renderAvatar();
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('clicking the change picture button triggers the file input click', () => {
    const { container } = renderAvatar();
    const fileInput = container.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});
    fireEvent.click(screen.getByRole('button', { name: 'Change profile picture' }));
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('calls setAvatar with a data URL when a file is selected', async () => {
    const fakeDataUrl = 'data:image/png;base64,fakedata';

    // Stub FileReader with a class so it can be used with `new`
    class MockFileReader {
      readAsDataURL(_file) {
        // Synchronously fire onload so the component gets the result
        this.onload({ target: { result: fakeDataUrl } });
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    const { container, setAvatar } = renderAvatar();
    const fileInput = container.querySelector('input[type="file"]');

    const fakeFile = new File(['content'], 'photo.png', { type: 'image/png' });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });
    });

    expect(setAvatar).toHaveBeenCalledWith(fakeDataUrl);
    vi.unstubAllGlobals();
  });

  it('does not call setAvatar when no file is selected', () => {
    const { container, setAvatar } = renderAvatar();
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [] } });
    expect(setAvatar).not.toHaveBeenCalled();
  });
});
