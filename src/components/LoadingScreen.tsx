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
    "🧠 Initializing Quantum Neural Networks...",
    "⚡ Loading World's Most Advanced AI Models...", 
    "🌐 Connecting to PandaNexus Quantum Cloud...",
    "🚀 Optimizing Performance to Light Speed...",
    "✨ Activating Revolutionary AI Capabilities...",
    "🎯 Calibrating Genius-Level Intelligence...",
    "🔥 Ready to Shock the World!"
  ];

  useEffect(() => {
    // Generate more particles for epic effect
    const newParticles = Array.from({length: 25}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1.5; // Optimized speed
        
        const phaseIndex = Math.floor((newProgress / 100) * phases.length);
        setCurrentPhase(Math.min(phaseIndex, phases.length - 1));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800); // Dramatic pause
          return 100;
        }
        return newProgress;
      });
    }, 30); // Smooth updates

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center z-50 overflow-hidden">
      {/* Enhanced Background Particles */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              boxShadow: '0 0 10px hsl(var(--primary))'
            }}
          />
        ))}
      </div>

      {/* Revolutionary Neural Network Background */}
      <div className="absolute inset-0 opacity-10 sm:opacity-15">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="quantum-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#quantum-grid)" />
          
          {/* Quantum connection lines */}
          <g filter="url(#glow)">
            <line x1="100" y1="200" x2="300" y2="400" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
            </line>
            <line x1="700" y1="300" x2="500" y2="600" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6">
              <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite"/>
            </line>
            <line x1="200" y1="700" x2="800" y2="200" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite"/>
            </line>
          </g>
        </svg>
      </div>

      <div className="text-center space-y-6 sm:space-y-8 md:space-y-12 z-10 max-w-2xl mx-auto px-4 sm:px-8">
        {/* Revolutionary Holographic Panda Logo */}
        <div className="relative">
          <div className="absolute -inset-12 sm:-inset-16 md:-inset-20 bg-gradient-primary opacity-30 blur-3xl sm:blur-4xl rounded-full animate-glow-pulse"></div>
          <div className="absolute -inset-6 sm:-inset-8 md:-inset-10 border border-primary/30 rounded-full animate-spin" style={{animationDuration: '10s'}}></div>
          <div className="absolute -inset-3 sm:-inset-4 md:-inset-5 border border-primary/40 rounded-full animate-spin" style={{animationDuration: '5s', animationDirection: 'reverse'}}></div>
          <div className="absolute -inset-1 sm:-inset-2 border border-primary/50 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
          
          <div className="relative bg-gradient-glass backdrop-blur-xl border border-glass-border rounded-full p-6 sm:p-8 md:p-10 shadow-intense">
            <PandaLogo className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 animate-float relative z-10" animate />
            
            {/* Quantum orbiting elements */}
            <div className="absolute inset-0 animate-spin" style={{animationDuration: '8s'}}>
              <div className="absolute -top-2 sm:-top-3 left-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full transform -translate-x-1/2 shadow-glow"></div>
              <div className="absolute top-1/2 -right-2 sm:-right-3 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full transform -translate-y-1/2 shadow-glow"></div>
              <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full transform -translate-x-1/2 shadow-glow"></div>
              <div className="absolute top-1/2 -left-2 sm:-left-3 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full transform -translate-y-1/2 shadow-glow"></div>
            </div>
          </div>
        </div>

        {/* Revolutionary Brand Name */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold bg-gradient-text bg-clip-text text-transparent animate-fade-in">
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
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground animate-fade-in animation-delay-300 font-medium">
              Where AI Meets Revolutionary Excellence
            </p>
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 sm:w-40 h-1 bg-gradient-primary animate-pulse rounded-full shadow-glow"></div>
          </div>
        </div>

        {/* Revolutionary Progress System */}
        <div className="space-y-6 sm:space-y-8">
          {/* Enhanced Progress Bar */}
          <div className="relative">
            <div className="h-3 sm:h-4 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm border border-glass-border shadow-glass">
              <div className="relative h-full">
                <div 
                  className="h-full bg-gradient-primary transition-all duration-500 ease-out relative overflow-hidden shadow-glow"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Progress percentage */}
            <div className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary drop-shadow-glow animate-pulse">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Phase indicator */}
          <div className="space-y-3 sm:space-y-4">
            <p className="text-base sm:text-lg md:text-xl text-foreground font-semibold animate-pulse">
              {phases[currentPhase]}
            </p>
            
            {/* Phase dots */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {phases.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ${
                    index <= currentPhase 
                      ? 'bg-primary shadow-glow scale-125 animate-pulse' 
                      : 'bg-muted/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Revolutionary Feature Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-10 sm:mt-12 md:mt-16">
          {[
            { icon: '🧠', label: 'Quantum AI', delay: '0ms', desc: 'Neural Networks' },
            { icon: '💻', label: 'Code Studio', delay: '200ms', desc: 'Pro Development' },
            { icon: '🎨', label: 'AI Art', delay: '400ms', desc: 'Creative Engine' },
            { icon: '⚡', label: 'Lightning', delay: '600ms', desc: 'Instant Speed' }
          ].map((feature, index) => (
            <div 
              key={feature.label}
              className="bg-gradient-glass backdrop-blur-xl border border-glass-border rounded-xl p-3 sm:p-4 md:p-6 shadow-glass animate-fade-in hover:shadow-glow transition-all duration-500 group"
              style={{ animationDelay: feature.delay }}
            >
              <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 animate-bounce group-hover:scale-110 transition-transform duration-300" style={{animationDelay: feature.delay}}>
                {feature.icon}
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground mb-1">
                {feature.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Enhanced Loading Animation */}
        <div className="flex justify-center items-center gap-3 sm:gap-4">
          <div className="flex gap-1 sm:gap-2">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-bounce shadow-glow"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <span className="ml-3 sm:ml-4 text-sm sm:text-base text-muted-foreground animate-pulse font-medium">
            Preparing your revolutionary AI experience...
          </span>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-primary animate-pulse">∞</div>
            <div className="text-xs text-muted-foreground">Speed</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-accent animate-pulse">100%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-primary animate-pulse">🌟</div>
            <div className="text-xs text-muted-foreground">Quality</div>
          </div>
        </div>
      </div>

      {/* Enhanced corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-l-2 border-t-2 border-primary/40 animate-pulse rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-r-2 border-t-2 border-primary/40 animate-pulse rounded-tr-lg"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-l-2 border-b-2 border-primary/40 animate-pulse rounded-bl-lg"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-r-2 border-b-2 border-primary/40 animate-pulse rounded-br-lg"></div>
      
      {/* Quantum energy beams */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse opacity-30"></div>
      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse opacity-30"></div>
    </div>
  );
};

export default LoadingScreen;