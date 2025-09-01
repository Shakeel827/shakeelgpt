import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ServiceType = 'auto' | 'code' | 'creative' | 'knowledge' | 'general';

interface ServiceSelectorProps {
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
  className?: string;
}

const serviceOptions = [
  { value: 'auto', label: 'Auto', icon: '🤖', description: 'Smart AI routing' },
  { value: 'code', label: 'Code', icon: '💻', description: 'Programming help' },
  { value: 'creative', label: 'Creative', icon: '🎨', description: 'Writing & ideas' },
  { value: 'knowledge', label: 'Knowledge', icon: '📚', description: 'Research & facts' },
  { value: 'general', label: 'Chat', icon: '💬', description: 'General chat' },
] as const;

export function ServiceSelector({ selectedService, onServiceChange, className }: ServiceSelectorProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile: Horizontal scroll with better spacing */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {serviceOptions.map((service) => (
          <Button
            key={service.value}
            variant={selectedService === service.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              "shrink-0 h-9 px-4 text-sm bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300",
              selectedService === service.value && "bg-gradient-primary text-primary-foreground shadow-glow"
            )}
            onClick={() => onServiceChange(service.value as ServiceType)}
          >
            <span className="mr-2">{service.icon}</span>
            {service.label}
          </Button>
        ))}
      </div>
      
      {/* Service Description */}
      <div className="mt-2 text-center">
        <Badge variant="outline" className="bg-gradient-glass border-glass-border text-xs">
          {serviceOptions.find(s => s.value === selectedService)?.description}
        </Badge>
      </div>
    </div>
  );
}

export default ServiceSelector;