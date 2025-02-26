import { Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
}

export function Logo({
  variant = 'default',
  size = 'md',
  showText = true,
  className,
  href = '/'
}: LogoProps) {
  const sizes = {
    sm: {
      container: 'h-8 w-8',
      icon: 'h-5 w-5',
      text: 'text-lg'
    },
    md: {
      container: 'h-10 w-10',
      icon: 'h-6 w-6',
      text: 'text-2xl'
    },
    lg: {
      container: 'h-12 w-12',
      icon: 'h-7 w-7',
      text: 'text-3xl'
    }
  };

  const variants = {
    default: {
      container: 'bg-gradient-to-br from-brand-500 to-brand-600',
      icon: 'text-white',
      text: 'text-gray-900'
    },
    white: {
      container: 'bg-white',
      icon: 'text-brand-600',
      text: 'text-white'
    }
  };

  const LogoContent = () => (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'rounded-full flex items-center justify-center shadow-lg',
        sizes[size].container,
        variants[variant].container
      )}>
        <Sun className={cn(
          sizes[size].icon,
          variants[variant].icon
        )} />
      </div>
      {showText && (
        <span className={cn(
          'font-bold tracking-tight',
          sizes[size].text,
          variants[variant].text
        )}>
          Warmr
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="flex items-center">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}