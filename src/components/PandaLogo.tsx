import { useState, useEffect } from "react";

const PandaLogo = ({ className = "w-8 h-8", animate = false }: { className?: string; animate?: boolean }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (animate) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  return (
    <div className={`${className} ${isAnimating ? 'animate-glow-pulse' : ''}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        fill="none"
      >
        {/* Panda face base */}
        <circle cx="50" cy="50" r="35" fill="hsl(var(--foreground))" />
        
        {/* Eye patches */}
        <ellipse cx="38" cy="40" rx="8" ry="12" fill="hsl(var(--background))" />
        <ellipse cx="62" cy="40" rx="8" ry="12" fill="hsl(var(--background))" />
        
        {/* Eyes */}
        <circle cx="38" cy="42" r="3" fill="hsl(var(--background))" />
        <circle cx="62" cy="42" r="3" fill="hsl(var(--background))" />
        <circle cx="37" cy="41" r="1.5" fill="hsl(var(--foreground))" />
        <circle cx="61" cy="41" r="1.5" fill="hsl(var(--foreground))" />
        
        {/* Nose */}
        <ellipse cx="50" cy="52" rx="2" ry="1.5" fill="hsl(var(--background))" />
        
        {/* Mouth */}
        <path d="M 45 58 Q 50 62 55 58" stroke="hsl(var(--background))" strokeWidth="2" fill="none" />
        
        {/* Ears */}
        <circle cx="30" cy="25" r="12" fill="hsl(var(--background))" />
        <circle cx="70" cy="25" r="12" fill="hsl(var(--background))" />
        
        {/* AI circuit pattern overlay */}
        <g className="opacity-30">
          <path d="M20 20 L25 25 M75 25 L80 20 M20 80 L25 75 M75 75 L80 80" 
                stroke="hsl(var(--primary))" strokeWidth="1" />
          <circle cx="25" cy="25" r="1" fill="hsl(var(--primary))" />
          <circle cx="75" cy="25" r="1" fill="hsl(var(--primary))" />
          <circle cx="25" cy="75" r="1" fill="hsl(var(--primary))" />
          <circle cx="75" cy="75" r="1" fill="hsl(var(--primary))" />
        </g>
      </svg>
    </div>
  );
};

export default PandaLogo;