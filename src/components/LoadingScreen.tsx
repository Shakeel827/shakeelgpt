import { useEffect, useState } from "react";
import PandaLogo from "./PandaLogo";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  const phases = [
    "Initializing Neural Networks...",
    "Loading AI Models...", 
    "Connecting to PandaNexus Cloud...",
    "Optimizing Performance...",
    "Ready to Launch!"
  ];

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({length: 15}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2; // Faster loading
        
        // Update phase based on progress
        const phaseIndex = Math.floor((newProgress / 100) * phases.length);
        setCurrentPhase(Math.min(phaseIndex, phases.length - 1));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // Faster transition
          return 100;
        }
        return newProgress;
      });
    }, 25); // Faster updates

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center z-50 overflow-hidden">
      {/* Optimized Background Particles */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Responsive Neural Network Background */}
      <div className="absolute inset-0 opacity-5 sm:opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Optimized connection lines */}
          <g className="animate-pulse">
            <line x1="100" y1="200" x2="300" y2="400" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite"/>
            </line>
            <line x1="700" y1="300" x2="500" y2="600" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5">
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite"/>
            </line>
          </g>
        </svg>
      </div>

      <div className="text-center space-y-6 sm:space-y-8 md:space-y-12 z-10 max-w-2xl mx-auto px-4 sm:px-8">
        {/* Responsive Holographic Panda Logo */}
        <div className="relative">
          <div className="absolute -inset-8 sm:-inset-12 md:-inset-16 bg-gradient-primary opacity-20 blur-2xl sm:blur-3xl rounded-full animate-glow-pulse"></div>
          <div className="absolute -inset-4 sm:-inset-6 md:-inset-8 border border-primary/20 rounded-full animate-spin" style={{animationDuration: '8s'}}></div>
          <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 border border-primary/30 rounded-full animate-spin" style={{animationDuration: '4s', animationDirection: 'reverse'}}></div>
          
          <div className="relative bg-gradient-glass backdrop-blur-xl border border-glass-border rounded-full p-4 sm:p-6 md:p-8 shadow-glass">
            <PandaLogo className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 animate-float relative z-10" animate />
            
            {/* Responsive orbiting elements */}
            <div className="absolute inset-0 animate-spin" style={{animationDuration: '6s'}}>
              <div className="absolute -top-1 sm:-top-2 left-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full transform -translate-x-1/2"></div>
              <div className="absolute top-1/2 -right-1 sm:-right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full transform -translate-y-1/2"></div>
              <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full transform -translate-x-1/2"></div>
              <div className="absolute top-1/2 -left-1 sm:-left-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full transform -translate-y-1/2"></div>
            </div>
          </div>
        </div>

        {/* Responsive Brand Name */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-text bg-clip-text text-transparent animate-fade-in">
            <span className="inline-block animate-bounce" style={{animationDelay: '0ms'}}>P</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '100ms'}}>a</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '200ms'}}>n</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '300ms'}}>d</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '400ms'}}>a</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '500ms'}}>N</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '600ms'}}>e</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '700ms'}}>x</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '800ms'}}>u</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '900ms'}}>s</span>
          </h1>
          
          <div className="relative">
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground animate-fade-in animation-delay-300">
              Where AI meets Excellence
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-0.5 bg-gradient-primary animate-pulse"></div>
          </div>
        </div>

        {/* Responsive Progress System */}
        <div className="space-y-4 sm:space-y-6">
          {/* Enhanced Progress Bar */}
          <div className="relative">
            <div className="h-2 sm:h-3 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm border border-glass-border">
              <div className="relative h-full">
                <div 
                  className="h-full bg-gradient-primary transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Progress percentage */}
            <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary drop-shadow-glow">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Phase indicator */}
          <div className="space-y-2 sm:space-y-3">
            <p className="text-sm sm:text-base md:text-lg text-foreground font-medium">
              {phases[currentPhase]}
            </p>
            
            {/* Phase dots */}
            <div className="flex justify-center gap-1 sm:gap-2">
              {phases.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                    index <= currentPhase 
                      ? 'bg-primary shadow-glow scale-125' 
                      : 'bg-muted/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Feature Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-8 sm:mt-10 md:mt-12">
          {[
            { icon: '🧠', label: 'Neural AI', delay: '0ms' },
            { icon: '💻', label: 'Code Gen', delay: '200ms' },
            { icon: '🎨', label: 'Creative', delay: '400ms' },
            { icon: '⚡', label: 'Lightning', delay: '600ms' }
          ].map((feature, index) => (
            <div 
              key={feature.label}
              className="bg-gradient-glass backdrop-blur-xl border border-glass-border rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-glass animate-fade-in hover:shadow-glow transition-all duration-300"
              style={{ animationDelay: feature.delay }}
            >
              <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2 animate-bounce" style={{animationDelay: feature.delay}}>
                {feature.icon}
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {feature.label}
              </p>
            </div>
          ))}
        </div>

        {/* Enhanced Loading Animation */}
        <div className="flex justify-center items-center gap-2 sm:gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
          <span className="ml-2 sm:ml-4 text-xs sm:text-sm text-muted-foreground animate-pulse">
            Preparing your AI experience...
          </span>
        </div>
      </div>

      {/* Responsive corner decorations */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-l-2 border-t-2 border-primary/30 animate-pulse"></div>
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-r-2 border-t-2 border-primary/30 animate-pulse"></div>
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-l-2 border-b-2 border-primary/30 animate-pulse"></div>
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-r-2 border-b-2 border-primary/30 animate-pulse"></div>
    </div>
  );
};

export default LoadingScreen;