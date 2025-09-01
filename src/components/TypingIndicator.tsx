import PandaLogo from "./PandaLogo";

const TypingIndicator = () => {
  return (
    <div className="flex gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-6 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-glow-pulse">
          <PandaLogo className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" animate />
        </div>
      </div>
      
      <div className="max-w-[85%] sm:max-w-[80%]">
        <div className="backdrop-blur-xl border border-glass-border shadow-glass bg-gradient-glass text-foreground rounded-r-2xl rounded-tl-2xl p-2 sm:p-3 md:p-4 transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs sm:text-sm">PandaNexus is thinking</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Routing to optimal AI model...
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;