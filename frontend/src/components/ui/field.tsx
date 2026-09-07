import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, type ReactNode, useMemo } from 'react';
import { cn } from '../../lib/class-names';
import { Label } from './label';

function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn('flex w-full flex-col gap-5', className)}
      {...props}
    />
  );
}

const fieldVariants = cva('group/field flex w-full gap-2 data-[invalid=true]:text-destructive', {
  variants: {
    orientation: {
      vertical: 'flex-col [&>*]:w-full [&>.sr-only]:w-auto',
      horizontal:
        'flex-row items-center has-[>[data-slot=field-content]]:items-start [&>[data-slot=field-label]]:flex-auto',
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

function Field({
  className,
  orientation = 'vertical',
  ...props
}: ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: This is the upstream shadcn Field grouping contract; a fieldset would require a legend.
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn('flex w-fit gap-2 leading-snug', className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('font-normal text-muted-foreground text-sm leading-normal', className)}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>;
  children?: ReactNode;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }
    const uniqueErrors = [
      ...new Map(errors?.map((error) => [error?.message, error])).values(),
    ].filter((error) => error?.message);
    if (uniqueErrors.length === 1) {
      return uniqueErrors[0]?.message;
    }
    return uniqueErrors.length > 1 ? (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map((error) => (
          <li key={error?.message}>{error?.message}</li>
        ))}
      </ul>
    ) : null;
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('font-normal text-destructive text-sm', className)}
      {...props}
    >
      {content}
    </div>
  );
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel };
