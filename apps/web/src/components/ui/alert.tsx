import { cn } from '@emirsign/utils';

interface AlertProps {
  variant?: 'default' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
  className?: string;
}

function Alert({ variant = 'default', children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg p-4 text-sm',
        {
          'bg-blue-50 text-blue-800': variant === 'default',
          'bg-green-50 text-green-800': variant === 'success',
          'bg-red-50 text-red-800': variant === 'error',
          'bg-yellow-50 text-yellow-800': variant === 'warning',
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

function AlertTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h5 className={cn('mb-1 font-medium', className)}>{children}</h5>;
}

function AlertDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-sm opacity-90', className)}>{children}</div>;
}

export { Alert, AlertTitle, AlertDescription };
