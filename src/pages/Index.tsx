import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import LoadingScreen from "@/components/LoadingScreen";
import { ThemeProvider } from "@/components/ThemeProvider";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Auto-skip loading after 2 seconds
  useState(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  });
  
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }
  
  return (
    <ThemeProvider>
      <ChatInterface />
    </ThemeProvider>
  );
};

export default Index;