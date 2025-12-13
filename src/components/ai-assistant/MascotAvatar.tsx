import { cn } from '@/lib/utils';

interface MascotAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  isAnimated?: boolean;
  className?: string;
}

export function MascotAvatar({ size = 'md', isAnimated = false, className }: MascotAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center",
        sizeClasses[size],
        isAnimated && "animate-pulse",
        className
      )}
    >
      {/* SVG Mascot - Professional male character in suit */}
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "w-full h-full",
          isAnimated && "animate-bounce"
        )}
        style={{ animationDuration: isAnimated ? '2s' : '0s' }}
      >
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="hsl(var(--primary))" opacity="0.1" />
        
        {/* Body/Suit */}
        <path
          d="M25 95 L25 70 Q25 55 50 55 Q75 55 75 70 L75 95"
          fill="hsl(var(--foreground))"
          opacity="0.9"
        />
        
        {/* Suit lapels */}
        <path
          d="M40 55 L50 75 L45 95 L40 95 Z"
          fill="hsl(var(--primary))"
        />
        <path
          d="M60 55 L50 75 L55 95 L60 95 Z"
          fill="hsl(var(--primary))"
        />
        
        {/* Shirt */}
        <path
          d="M43 55 L50 75 L57 55"
          fill="hsl(var(--card))"
        />
        
        {/* Tie */}
        <path
          d="M48 58 L50 95 L52 58 L50 62 Z"
          fill="hsl(var(--primary))"
        />
        
        {/* Neck */}
        <rect x="44" y="45" width="12" height="12" rx="2" fill="hsl(173 30% 50%)" />
        
        {/* Head */}
        <ellipse cx="50" cy="32" rx="20" ry="22" fill="hsl(173 30% 55%)" />
        
        {/* Hair */}
        <path
          d="M30 28 Q30 12 50 12 Q70 12 70 28 Q68 20 50 18 Q32 20 30 28"
          fill="hsl(var(--foreground))"
          opacity="0.8"
        />
        
        {/* Eyes */}
        <ellipse cx="42" cy="32" rx="4" ry="5" fill="white" />
        <ellipse cx="58" cy="32" rx="4" ry="5" fill="white" />
        <circle cx="43" cy="33" r="2" fill="hsl(var(--foreground))">
          {isAnimated && (
            <animate
              attributeName="cx"
              values="43;44;43;42;43"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle cx="59" cy="33" r="2" fill="hsl(var(--foreground))">
          {isAnimated && (
            <animate
              attributeName="cx"
              values="59;60;59;58;59"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        
        {/* Eyebrows */}
        <path d="M38 26 Q42 24 46 26" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M54 26 Q58 24 62 26" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.6" />
        
        {/* Nose */}
        <path d="M50 35 L48 42 L52 42" stroke="hsl(173 25% 45%)" strokeWidth="1" fill="none" />
        
        {/* Smile */}
        <path
          d="M42 46 Q50 52 58 46"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        >
          {isAnimated && (
            <animate
              attributeName="d"
              values="M42 46 Q50 52 58 46;M42 47 Q50 54 58 47;M42 46 Q50 52 58 46"
              dur="1s"
              repeatCount="indefinite"
            />
          )}
        </path>
        
        {/* Ears */}
        <ellipse cx="30" cy="35" rx="3" ry="5" fill="hsl(173 30% 50%)" />
        <ellipse cx="70" cy="35" rx="3" ry="5" fill="hsl(173 30% 50%)" />
        
        {/* Collar points */}
        <circle cx="42" cy="57" r="2" fill="hsl(var(--card))" />
        <circle cx="58" cy="57" r="2" fill="hsl(var(--card))" />
      </svg>
      
      {/* Speaking indicator */}
      {isAnimated && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card">
          <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
        </div>
      )}
    </div>
  );
}
