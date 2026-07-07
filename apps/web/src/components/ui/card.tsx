import { cn } from '@/lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  );
}

function CardHeader({ children, className }: CardProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

function CardContent({ children, className }: CardProps) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>;
}

function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('flex items-center border-t border-gray-200 px-6 py-4', className)}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
