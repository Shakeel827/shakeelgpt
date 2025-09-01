import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import PandaLogo from "./PandaLogo";
import { Mail, Lock, User, Sparkles } from "lucide-react";

interface User {
  name: string;
  email: string;
}

interface AuthFormProps {
  onLogin: (user: User) => void;
}

const AuthForm = ({ onLogin }: AuthFormProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (isSignUp && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user: User = {
        name: formData.name || formData.email.split('@')[0],
        email: formData.email
      };
      
      onLogin(user);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Branding */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <PandaLogo className="w-20 h-20" animate />
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-xl rounded-full animate-glow-pulse"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-text bg-clip-text text-transparent">
              PandaNexus
            </h1>
            <p className="text-muted-foreground">
              Your AI-powered hub for chat, code, and creativity
            </p>
          </div>
        </div>
        
        {/* Auth Form */}
        <Card className="backdrop-blur-xl border-glass-border shadow-glass bg-gradient-glass p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isSignUp 
                  ? 'Join the AI revolution with PandaNexus'
                  : 'Sign in to continue your AI journey'
                }
              </p>
            </div>
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  className="bg-input/50 border-glass-border backdrop-blur-sm"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="bg-input/50 border-glass-border backdrop-blur-sm"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                className="bg-input/50 border-glass-border backdrop-blur-sm"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </div>
              )}
            </Button>
            
            <div className="text-center pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>
          </form>
        </Card>
        
        {/* Contact Info */}
        <Card className="backdrop-blur-xl border-glass-border shadow-glass bg-gradient-glass p-4">
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Need Support?</p>
            <p>📧 shakeelsk@pandascanpros.in</p>
            <p>📞 +91 8074015276</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;