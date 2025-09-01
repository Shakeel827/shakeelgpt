import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MessageCircle, Copy, ExternalLink, Linkedin } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface ContactDialogProps {
  children: React.ReactNode;
}

const ContactDialog = ({ children }: ContactDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const contactInfo = {
    email: "shakeelsk@pandascanpros.in",
    phone: "+91 8074015276",
    linkedin: "https://www.linkedin.com/in/shaik-mohammad-shakeel-ba5a771b1/",
    name: "Shakeel"
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${type} copied to clipboard!`, {
        description: text,
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast(`Failed to copy ${type}`, {
        description: "Please try again",
        duration: 2000,
      });
    }
  };

  const openEmail = () => {
    window.open(`mailto:${contactInfo.email}?subject=Hello from PandaNexus&body=Hi Shakeel,%0D%0A%0D%0AI'm reaching out from PandaNexus...`, '_blank');
  };

  const openPhone = () => {
    window.open(`tel:${contactInfo.phone}`, '_blank');
  };

  const openLinkedIn = () => {
    window.open(contactInfo.linkedin, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-glass backdrop-blur-xl border-glass-border shadow-glass max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-text bg-clip-text text-transparent text-center">
            Contact PandaNexus
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Creator Info */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <span className="text-2xl font-bold text-primary-foreground">S</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">Shakeel</h3>
              <p className="text-sm text-muted-foreground">Creator of PandaNexus</p>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="space-y-3">
            {/* LinkedIn */}
            <Card className="p-3 sm:p-4 bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Linkedin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">LinkedIn</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Professional Profile</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(contactInfo.linkedin, 'LinkedIn')}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={openLinkedIn}
                    className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Email */}
            <Card className="p-3 sm:p-4 bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">Email</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{contactInfo.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(contactInfo.email, 'Email')}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={openEmail}
                    className="h-8 w-8 p-0 bg-gradient-primary hover:shadow-glow"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Phone */}
            <Card className="p-3 sm:p-4 bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">Phone</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{contactInfo.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(contactInfo.phone, 'Phone')}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={openPhone}
                    className="h-8 w-8 p-0 bg-gradient-primary hover:shadow-glow"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Message */}
          <Card className="p-3 sm:p-4 bg-gradient-glass border-glass-border">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-5 h-5 text-primary shrink-0" />
              <p className="font-medium">Quick Message</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Have questions about PandaNexus? Need support? Connect with me on LinkedIn!
            </p>
            <Button 
              onClick={() => {
                openLinkedIn();
                setIsOpen(false);
              }}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              Connect on LinkedIn
            </Button>
          </Card>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-glass-border">
            <p className="text-xs text-muted-foreground">
              Built with ❤️ by Shakeel • PandaNexus © 2025
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;