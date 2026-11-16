import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { fa } from '@/i18n/fa';
import { renderApp } from '@/test/render-app';

describe('design system page', () => {
  it('renders every reusable primitive', async () => {
    renderApp({ initialPath: '/design-system' });

    await screen.findByRole('heading', { level: 1, name: fa.designSystem.title });
    expect(screen.getByRole('button', { name: fa.designSystem.buttonSecondary })).toBeEnabled();
    expect(screen.getByRole('button', { name: fa.designSystem.buttonDisabled })).toBeDisabled();
    expect(screen.getByLabelText(fa.designSystem.inputLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(fa.designSystem.inputInvalidLabel)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText(fa.designSystem.inputInvalidMessage)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(fa.designSystem.loadingLabel);
    expect(screen.getByRole('alert')).toHaveTextContent(fa.designSystem.errorTitle);
    expect(screen.getByText(fa.designSystem.emptyTitle)).toBeInTheDocument();
  });

  it('opens and closes the example dialog', async () => {
    const user = userEvent.setup();
    renderApp({ initialPath: '/design-system' });

    await user.click(await screen.findByRole('button', { name: fa.designSystem.openDialog }));

    const dialog = await screen.findByRole('dialog', { name: fa.designSystem.dialogTitle });
    expect(dialog).toHaveTextContent(fa.designSystem.dialogDescription);

    await user.click(screen.getByRole('button', { name: fa.designSystem.dialogCancel }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exposes the dropdown menu items', async () => {
    const user = userEvent.setup();
    renderApp({ initialPath: '/design-system' });

    await user.click(await screen.findByRole('button', { name: fa.designSystem.dropdownLabel }));

    expect(
      await screen.findByRole('menuitem', { name: fa.designSystem.dropdownItemOne }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: fa.designSystem.dropdownItemTwo })).toBeVisible();
  });
});
