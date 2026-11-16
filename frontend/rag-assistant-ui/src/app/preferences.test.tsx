import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { en } from '@/i18n/en';
import { fa } from '@/i18n/fa';
import { renderApp } from '@/test/render-app';

describe('theme switching', () => {
  it('applies and persists the dark theme', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: fa.header.themeToggle }));
    await user.click(await screen.findByRole('menuitemradio', { name: fa.header.themeDark }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('removes the dark theme when light is selected', async () => {
    localStorage.setItem('theme', 'dark');
    const user = userEvent.setup();
    renderApp();

    expect(document.documentElement).toHaveClass('dark');

    await user.click(screen.getByRole('button', { name: fa.header.themeToggle }));
    await user.click(await screen.findByRole('menuitemradio', { name: fa.header.themeLight }));

    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('keeps the system theme and follows the media query', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: fa.header.themeToggle }));
    await user.click(await screen.findByRole('menuitemradio', { name: fa.header.themeSystem }));

    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('system');
  });
});

describe('language and direction switching', () => {
  it('switches the interface to English and LTR', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: fa.header.languageToggle }));
    await user.click(await screen.findByRole('menuitemradio', { name: fa.header.languageEn }));

    expect(screen.getByRole('heading', { level: 1, name: en.home.title })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: en.primaryNavigation })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(localStorage.getItem('language')).toBe('en');
  });

  it('switches back to Persian and RTL', async () => {
    localStorage.setItem('language', 'en');
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: en.home.title })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: en.header.languageToggle }));
    await user.click(await screen.findByRole('menuitemradio', { name: en.header.languageFa }));

    expect(screen.getByRole('heading', { level: 1, name: fa.home.title })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'fa');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(localStorage.getItem('language')).toBe('fa');
  });

  it('restores persisted preferences on load', () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('language', 'en');

    renderApp();

    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('heading', { level: 1, name: en.home.title })).toBeInTheDocument();
  });
});
