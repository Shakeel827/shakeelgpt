import { useEffect, useState } from "react";
import PandaLogo from "./PandaLogo";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number, size: number}>>([]);
  const [neuralConnections, setNeuralConnections] = useState<Array<{id: number, x1: number, y1: number, x2: number, y2: number, opacity: number}>>([]);

  const phases = [
    "🧠 Initializing Quantum Neural Networks...",
    "⚡ Loading Revolutionary AI Models...", 
    "🌐 Connecting to PandaNexus Quantum Cloud...",
    "🚀 Optimizing Performance to Light Speed...",
    "✨ Activating World-Class AI Capabilities...",
    "🎯 Calibrating Genius-Level Intelligence...",
    "🔥 Ready to Shock the World!"
  ];

  useEffect(() => {
    // Generate enhanced particles
    const newParticles = Array.from({length: 40}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      size: 0.5 + Math.random() * 1.5
    }));
    setParticles(newParticles);

    // Generate neural network connections
    const connections = Array.from({length: 15}, (_, i) => ({
      id: i,
      x1: Math.random() * 100,
      y1: Math.random() * 100,
      x2: Math.random() * 100,
      y2: Math.random() * 100,
      opacity: 0.2 + Math.random() * 0.6
    }));
    setNeuralConnections(connections);

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2; // Faster loading
        
        const phaseIndex = Math.floor((newProgress / 100) * phases.length);
        setCurrentPhase(Math.min(phaseIndex, phases.length - 1));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // Quicker transition
          return 100;
        }
        return newProgress;
      });
    }, 25); // Smoother updates

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center z-50 overflow-hidden">
      {/* Revolutionary Neural Network Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="quantum-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
            <filter id="neural-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="1"/>
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#quantum-grid)" />
          
          {/* Dynamic neural connections */}
          <g filter="url(#neural-glow)">
            {neuralConnections.map(conn => (
              <line 
                key={conn.id}
                x1={`${conn.x1}%`} 
                y1={`${conn.y1}%`} 
                x2={`${conn.x2}%`} 
                y2={`${conn.y2}%`} 
                stroke="url(#connection-gradient)" 
                strokeWidth="1" 
                opacity={conn.opacity}
              >
                <animate 
                  attributeName="opacity" 
                  values={`${conn.opacity * 0.3};${conn.opacity};${conn.opacity * 0.3}`} 
                  dur={`${2 + Math.random() * 2}s`} 
                  repeatCount="indefinite"
                />
              </line>
            ))}
          </g>
          
          {/* Quantum data streams */}
          <g>
            <path d="M0,500 Q250,300 500,500 T1000,500" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.4">
              <animate attributeName="stroke-dasharray" values="0,1000;1000,0" dur="3s" repeatCount="indefinite"/>
            </path>
            <path d="M0,300 Q250,100 500,300 T1000,300" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5" opacity="0.3">
              <animate attributeName="stroke-dasharray" values="0,800;800,0" dur="4s" repeatCount="indefinite"/>
            </path>
            <path d="M0,700 Q250,500 500,700 T1000,700" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.2">
              <animate attributeName="stroke-dasharray" values="0,600;600,0" dur="5s" repeatCount="indefinite"/>
            </path>
          </g>
        </svg>
      </div>

      {/* Enhanced floating particles */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute bg-primary/60 rounded-full animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
              boxShadow: `0 0 ${particle.size * 8}px hsl(var(--primary))`
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-4 sm:space-y-6 md:space-y-8 z-10 max-w-4xl mx-auto px-4 sm:px-8">
        {/* Revolutionary Holographic Panda Logo */}
        <div className="relative">
          <div className="absolute -inset-8 sm:-inset-12 md:-inset-16 lg:-inset-20 bg-gradient-primary opacity-40 blur-3xl sm:blur-4xl rounded-full animate-glow-pulse"></div>
          
          {/* Multiple rotating rings */}
          <div className="absolute -inset-8 sm:-inset-10 md:-inset-12 border border-primary/40 rounded-full animate-spin" style={{animationDuration: '12s'}}></div>
          <div className="absolute -inset-6 sm:-inset-8 md:-inset-10 border border-primary/50 rounded-full animate-spin" style={{animationDuration: '8s', animationDirection: 'reverse'}}></div>
          <div className="absolute -inset-4 sm:-inset-6 md:-inset-8 border border-primary/60 rounded-full animate-spin" style={{animationDuration: '6s'}}></div>
          <div className="absolute -inset-2 sm:-inset-4 md:-inset-6 border border-primary/70 rounded-full animate-spin" style={{animationDuration: '4s', animationDirection: 'reverse'}}></div>
          <div className="absolute -inset-1 sm:-inset-2 md:-inset-3 border border-primary/80 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
          
          <div className="relative bg-gradient-glass backdrop-blur-xl border border-glass-border rounded-full p-4 sm:p-6 md:p-8 lg:p-10 shadow-intense">
            <PandaLogo className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 animate-float relative z-10" animate />
            
            {/* Quantum orbiting elements */}
            <div className="absolute inset-0 animate-spin" style={{animationDuration: '10s'}}>
              <div className="absolute -top-2 sm:-top-3 left-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full transform -translate-x-1/2 shadow-glow"></div>
              <div className="absolute top-1/2 -right-2 sm:-right-3 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full transform -translate-y-1/2 shadow-glow"></div>
              <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full transform -translate-x-1/2 shadow-glow"></div>
              <div className="absolute top-1/2 -left-2 sm:-left-3 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full transform -translate-y-1/2 shadow-glow"></div>
            </div>
            
            {/* Inner energy core */}
            <div className="absolute inset-4 sm:inset-6 md:inset-8 bg-gradient-primary opacity-20 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Revolutionary Brand Name with enhanced animation */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold bg-gradient-text bg-clip-text text-transparent animate-fade-in">
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
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground animate-fade-in animation-delay-300 font-medium">
              Where AI Meets Revolutionary Excellence
            </p>
            <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 md:w-40 h-1 bg-gradient-primary animate-pulse rounded-full shadow-glow"></div>
          </div>
        </div>

        {/* Revolutionary Progress System */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Enhanced Progress Bar with neural activity */}
          <div className="relative">
            <div className="h-2 sm:h-3 md:h-4 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm border border-glass-border shadow-glass">
              <div className="relative h-full">
                <div 
                  className="h-full bg-gradient-primary transition-all duration-300 ease-out relative overflow-hidden shadow-glow"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-accent/60 animate-pulse"></div>
                  
                  {/* Neural activity indicators */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    {Array.from({length: 5}).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-1/2 w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                          left: `${20 + i * 15}%`,
                          animationDelay: `${i * 200}ms`,
                          transform: 'translateY(-50%)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress percentage with enhanced styling */}
            <div className="absolute -top-6 sm:-top-8 md:-top-10 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary drop-shadow-glow animate-pulse">
                  {Math.round(progress)}%
                </span>
                <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full animate-glow-pulse"></div>
              </div>
            </div>
          </div>

          {/* Enhanced phase indicator */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground font-semibold animate-pulse">
                {phases[currentPhase]}
              </p>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 h-0.5 bg-gradient-primary animate-pulse rounded-full"></div>
            </div>
            
            {/* Enhanced phase dots */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {phases.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 relative ${
                    index <= currentPhase 
                      ? 'bg-primary shadow-glow scale-125 animate-pulse' 
                      : 'bg-muted/50'
                  }`}
                >
                  {index <= currentPhase && (
                    <div className="absolute -inset-1 bg-primary/30 rounded-full animate-ping"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revolutionary Feature Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-6 sm:mt-8 md:mt-12">
          {[
            { icon: '🧠', label: 'Quantum AI', delay: '0ms', desc: 'Neural Networks', color: 'from-blue-500 to-purple-600' },
            { icon: '💻', label: 'Code Studio', delay: '200ms', desc: 'Pro Development', color: 'from-green-500 to-blue-600' },
            { icon: '🎨', label: 'AI Art', delay: '400ms', desc: 'Creative Engine', color: 'from-purple-500 to-pink-600' },
            { icon: '⚡', label: 'Lightning', delay: '600ms', desc: 'Instant Speed', color: 'from-yellow-500 to-orange-600' }
          ].map((feature, index) => (
            <div 
              key={feature.label}
              className="relative bg-gradient-glass backdrop-blur-xl border border-glass-border rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-glass animate-fade-in hover:shadow-glow transition-all duration-500 group overflow-hidden"
              style={{ animationDelay: feature.delay }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 sm:mb-2 md:mb-3 animate-bounce group-hover:scale-110 transition-transform duration-300" style={{animationDelay: feature.delay}}>
                  {feature.icon}
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground mb-1">
                  {feature.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
              
              {/* Feature activation indicator */}
              {index <= currentPhase && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-glow"></div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced Loading Animation */}
        <div className="flex justify-center items-center gap-3 sm:gap-4">
          <div className="flex gap-1 sm:gap-2">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-bounce shadow-glow"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
          <span className="ml-3 sm:ml-4 text-sm sm:text-base text-muted-foreground animate-pulse font-medium">
            Preparing your revolutionary AI experience...
          </span>
        </div>

        {/* Enhanced Performance Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 text-center">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary animate-pulse relative">
              ∞
              <div className="absolute -inset-2 bg-primary/20 blur-lg rounded-full animate-glow-pulse"></div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Speed</div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-accent animate-pulse relative">
              100%
              <div className="absolute -inset-2 bg-accent/20 blur-lg rounded-full animate-glow-pulse"></div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary animate-pulse relative">
              🌟
              <div className="absolute -inset-2 bg-primary/20 blur-lg rounded-full animate-glow-pulse"></div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Quality</div>
          </div>
        </div>

        {/* System status indicators */}
        <div className="flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Neural Networks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Quantum Core</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">AI Engine</span>
          </div>
        </div>
      </div>

      {/* Enhanced corner decorations with neural patterns */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
        <div className="w-full h-full border-l-2 border-t-2 border-primary/40 animate-pulse rounded-tl-lg relative">
          <div className="absolute top-1 left-1 w-1 h-1 bg-primary rounded-full animate-ping"></div>
        </div>
      </div>
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
        <div className="w-full h-full border-r-2 border-t-2 border-primary/40 animate-pulse rounded-tr-lg relative">
          <div className="absolute top-1 right-1 w-1 h-1 bg-primary rounded-full animate-ping"></div>
        </div>
      </div>
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
        <div className="w-full h-full border-l-2 border-b-2 border-primary/40 animate-pulse rounded-bl-lg relative">
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-primary rounded-full animate-ping"></div>
        </div>
      </div>
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
        <div className="w-full h-full border-r-2 border-b-2 border-primary/40 animate-pulse rounded-br-lg relative">
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-primary rounded-full animate-ping"></div>
        </div>
      </div>
      
      {/* Quantum energy beams */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse opacity-40"></div>
      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse opacity-40"></div>
      
      {/* Diagonal energy streams */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-primary/30 via-transparent to-accent/30 animate-pulse transform rotate-45 origin-top-left"></div>
        <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-accent/30 via-transparent to-primary/30 animate-pulse transform -rotate-45 origin-top-right"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;