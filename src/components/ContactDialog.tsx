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
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[95vw] p-0 bg-white dark:bg-gray-900 backdrop-blur-xl border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
        {/* Mobile-optimized header with close button */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <DialogHeader className="flex-1">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Contact PandaNexus
            </DialogTitle>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: 'calc(90vh - 57px)' }}>
          <div className="space-y-4 py-2">
            {/* Creator Info */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-3xl font-bold text-white">S</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Shakeel</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Creator of PandaNexus</p>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="space-y-3">
              {/* LinkedIn */}
              <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                      <Linkedin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">LinkedIn</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">Professional Profile</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(contactInfo.linkedin, 'LinkedIn')}
                      className="h-10 w-10 rounded-full"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={openLinkedIn}
                      className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Email */}
              <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{contactInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(contactInfo.email, 'Email')}
                      className="h-10 w-10 rounded-full"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={openEmail}
                      className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Phone */}
              <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{contactInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(contactInfo.phone, 'Phone')}
                      className="h-10 w-10 rounded-full"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={openPhone}
                      className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Message */}
            <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="font-medium text-gray-900 dark:text-white">Quick Message</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Have questions about PandaNexus? Need support? Connect with me on LinkedIn!
              </p>
              <Button 
                onClick={() => {
                  openLinkedIn();
                  setIsOpen(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
              >
                <Linkedin className="w-5 h-5 mr-2" />
                Connect on LinkedIn
              </Button>
            </Card>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Built with ❤️ by Shakeel • PandaNexus © 2025
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
