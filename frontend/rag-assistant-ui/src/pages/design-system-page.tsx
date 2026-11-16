import { Inbox, Info, Plus } from 'lucide-react';
import { useId } from 'react';

import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/i18n/use-language';

export function DesignSystemPage() {
  const { t } = useLanguage();
  const nameInputId = useId();
  const nameHelpId = useId();
  const invalidInputId = useId();
  const invalidMessageId = useId();

  return (
    <div className="space-y-6">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-xl font-bold sm:text-2xl">{t.designSystem.title}</h1>
        <p className="text-sm leading-7 text-muted-foreground">{t.designSystem.description}</p>
        <p className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3 text-xs leading-6 text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{t.designSystem.notice}</span>
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.designSystem.buttonsTitle}</CardTitle>
            <CardDescription>{t.designSystem.buttonsDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <Button>{t.designSystem.buttonDefault}</Button>
              <Button variant="secondary">{t.designSystem.buttonSecondary}</Button>
              <Button variant="outline">{t.designSystem.buttonOutline}</Button>
              <Button variant="ghost">{t.designSystem.buttonGhost}</Button>
              <Button variant="destructive">{t.designSystem.buttonDestructive}</Button>
              <Button disabled>{t.designSystem.buttonDisabled}</Button>
              <Button size="icon" aria-label={t.designSystem.buttonIcon}>
                <Plus aria-hidden />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.designSystem.formTitle}</CardTitle>
            <CardDescription>{t.designSystem.formDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor={nameInputId} className="block text-sm font-medium">
                  {t.designSystem.inputLabel}
                </label>
                <Input
                  id={nameInputId}
                  placeholder={t.designSystem.inputPlaceholder}
                  aria-describedby={nameHelpId}
                />
                <p id={nameHelpId} className="text-xs leading-6 text-muted-foreground">
                  {t.designSystem.inputHelp}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor={invalidInputId} className="block text-sm font-medium">
                  {t.designSystem.inputInvalidLabel}
                </label>
                <Input
                  id={invalidInputId}
                  aria-invalid
                  aria-describedby={invalidMessageId}
                  defaultValue="??"
                />
                <p id={invalidMessageId} className="text-xs font-medium text-destructive">
                  {t.designSystem.inputInvalidMessage}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.designSystem.overlaysTitle}</CardTitle>
            <CardDescription>{t.designSystem.overlaysDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">{t.designSystem.openDialog}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.designSystem.dialogTitle}</DialogTitle>
                    <DialogDescription>{t.designSystem.dialogDescription}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">{t.designSystem.dialogCancel}</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button>{t.designSystem.dialogConfirm}</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{t.designSystem.dropdownLabel}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>{t.designSystem.dropdownLabel}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>{t.designSystem.dropdownItemOne}</DropdownMenuItem>
                  <DropdownMenuItem>{t.designSystem.dropdownItemTwo}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost">{t.designSystem.tooltipLabel}</Button>
                </TooltipTrigger>
                <TooltipContent>{t.designSystem.tooltipContent}</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.designSystem.feedbackTitle}</CardTitle>
            <CardDescription>{t.designSystem.feedbackDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border bg-background/60 p-4">
                <Spinner label={t.designSystem.loadingLabel} />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>

              <EmptyState
                icon={Inbox}
                title={t.designSystem.emptyTitle}
                description={t.designSystem.emptyDescription}
                action={<Button variant="outline">{t.designSystem.emptyAction}</Button>}
              />

              <ErrorState
                title={t.designSystem.errorTitle}
                description={t.designSystem.errorDescription}
                action={<Button variant="outline">{t.designSystem.errorAction}</Button>}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
