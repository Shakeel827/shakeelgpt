import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MessageCircle, Copy, ExternalLink, Linkedin, X } from "lucide-react";
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
      toast.success(`${type} copied!`, {
        description: text,
        duration: 1500,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error(`Failed to copy ${type}`);
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
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-gradient-glass backdrop-blur-xl border-glass-border shadow-glass max-h-[90vh] overflow-y-auto">
        {/* Mobile-optimized header */}
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">
            Contact PandaNexus
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Creator Info */}
          <div className="text-center space-y-3">
            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-glow">
              <span className="text-2xl sm:text-3xl font-bold text-white">S</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">Shakeel</h3>
              <p className="text-sm text-muted-foreground">Creator of PandaNexus</p>
            </div>
          </div>

          {/* Contact Methods - Mobile Optimized */}
          <div className="space-y-3">
            {/* LinkedIn */}
            <Card className="bg-gradient-glass border-glass-border p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">LinkedIn</p>
                    <p className="truncate text-xs sm:text-sm text-muted-foreground">Professional Profile</p>
                  </div>
                </div>
                <div className="ml-2 flex shrink-0 gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(contactInfo.linkedin, 'LinkedIn')}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-glass border-glass-border"
                  >
                    <Copy className="h-3 h-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={openLinkedIn}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Email */}
            <Card className="bg-gradient-glass border-glass-border p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Email</p>
                    <p className="truncate text-xs sm:text-sm text-muted-foreground">{contactInfo.email}</p>
                  </div>
                </div>
                <div className="ml-2 flex shrink-0 gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(contactInfo.email, 'Email')}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-glass border-glass-border"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={openEmail}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-green-600 text-white hover:bg-green-700"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Phone */}
            <Card className="bg-gradient-glass border-glass-border p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Phone</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{contactInfo.phone}</p>
                  </div>
                </div>
                <div className="ml-2 flex shrink-0 gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(contactInfo.phone, 'Phone')}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-glass border-glass-border"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={openPhone}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                  >
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Message */}
          <Card className="bg-gradient-glass border-glass-border p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-3">
              <MessageCircle className="h-4 h-4 sm:h-5 sm:w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="font-medium text-sm sm:text-base">Quick Message</p>
            </div>
            <p className="mb-4 text-xs sm:text-sm text-muted-foreground">
              Have questions about PandaNexus? Need support? Connect with me on LinkedIn!
            </p>
            <Button 
              onClick={() => {
                openLinkedIn();
                setIsOpen(false);
              }}
              className="w-full rounded-xl bg-blue-600 py-2 sm:py-3 text-white hover:bg-blue-700 text-sm sm:text-base"
            >
              <Linkedin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Connect on LinkedIn
            </Button>
          </Card>

          {/* Footer */}
          <div className="border-t border-glass-border pt-4 text-center">
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