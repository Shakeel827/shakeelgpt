import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Zap, Code, Palette, BookOpen, MessageCircle } from "lucide-react";

type ServiceType = 'auto' | 'code' | 'creative' | 'knowledge' | 'general';

interface ServiceSelectorProps {
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
  className?: string;
}

const serviceOptions = [
  { 
    value: 'auto', 
    label: 'Auto', 
    icon: Zap, 
    description: 'Smart AI routing',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  { 
    value: 'code', 
    label: 'Code', 
    icon: Code, 
    description: 'Code Studio Pro',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  { 
    value: 'creative', 
    label: 'Creative', 
    icon: Palette, 
    description: 'AI Art & Writing',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  { 
    value: 'knowledge', 
    label: 'Knowledge', 
    icon: BookOpen, 
    description: 'Research & Facts',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  { 
    value: 'general', 
    label: 'Chat', 
    icon: MessageCircle, 
    description: 'General AI Chat',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10'
  },
] as const;

export function ServiceSelector({ selectedService, onServiceChange, className }: ServiceSelectorProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile: Horizontal scroll with enhanced design */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {serviceOptions.map((service) => {
          const IconComponent = service.icon;
          const isSelected = selectedService === service.value;
          
          return (
            <Button
              key={service.value}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "shrink-0 h-9 px-4 text-sm bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300 relative overflow-hidden",
                isSelected && "bg-gradient-primary text-primary-foreground shadow-glow",
                !isSelected && `hover:${service.bgColor}`
              )}
              onClick={() => onServiceChange(service.value as ServiceType)}
            >
              <IconComponent className={cn("w-4 h-4 mr-2", isSelected ? "text-primary-foreground" : service.color)} />
              <span className="font-medium">{service.label}</span>
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
              )}
            </Button>
          );
        })}
      </div>
      
      {/* Service Description with enhanced styling */}
      <div className="mt-2 text-center">
        <Badge variant="outline" className="bg-gradient-glass border-glass-border text-xs px-3 py-1">
          <span className="flex items-center gap-1">
            {(() => {
              const service = serviceOptions.find(s => s.value === selectedService);
              const IconComponent = service?.icon || Zap;
              return <IconComponent className={cn("w-3 h-3", service?.color)} />;
            })()}
            {serviceOptions.find(s => s.value === selectedService)?.description}
          </span>
        </Badge>
      </div>
    </div>
  );
}

export default ServiceSelector;