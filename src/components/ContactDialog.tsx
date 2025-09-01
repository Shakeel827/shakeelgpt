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
      <DialogContent className="fixed inset-0 z-50 mx-0 flex max-h-screen w-full flex-col rounded-none border-none bg-white p-0 shadow-lg dark:bg-gray-900 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-gray-200 sm:dark:border-gray-800">
        {/* Mobile-optimized header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader className="flex-1">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Contact PandaNexus
            </DialogTitle>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-10 w-10 rounded-full sm:h-8 sm:w-8"
            aria-label="Close contact dialog"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="space-y-4 py-2">
            {/* Creator Info */}
            <div className="text-center space-y-3 pt-2">
              <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-md sm:h-16 sm:w-16">
                <span className="text-3xl font-bold text-white sm:text-2xl">S</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-lg">Shakeel</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Creator of PandaNexus</p>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="space-y-3">
              {/* LinkedIn */}
              <Card className="border-gray-200 bg-gray-50 p-4 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 sm:h-10 sm:w-10">
                      <Linkedin className="h-6 w-6 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">LinkedIn</p>
                      <p className="truncate text-sm text-gray-600 dark:text-gray-400">Professional Profile</p>
                    </div>
                  </div>
                  <div className="ml-2 flex shrink-0 gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(contactInfo.linkedin, 'LinkedIn')}
                      className="h-10 w-10 rounded-full sm:h-9 sm:w-9"
                      aria-label="Copy LinkedIn URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={openLinkedIn}
                      className="h-10 w-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 sm:h-9 sm:w-9"
                      aria-label="Open LinkedIn profile"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Email */}
              <Card className="border-gray-200 bg-gray-50 p-4 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 sm:h-10 sm:w-10">
                      <Mail className="h-6 w-6 text-green-600 dark:text-green-400 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Email</p>
                      <p className="truncate text-sm text-gray-600 dark:text-gray-400">{contactInfo.email}</p>
                    </div>
                  </div>
                  <div className="ml-2 flex shrink-0 gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(contactInfo.email, 'Email')}
                      className="h-10 w-10 rounded-full sm:h-9 sm:w-9"
                      aria-label="Copy email address"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={openEmail}
                      className="h-10 w-10 rounded-full bg-green-600 text-white hover:bg-green-700 sm:h-9 sm:w-9"
                      aria-label="Send email"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Phone */}
              <Card className="border-gray-200 bg-gray-50 p-4 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 sm:h-10 sm:w-10">
                      <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{contactInfo.phone}</p>
                    </div>
                  </div>
                  <div className="ml-2 flex shrink-0 gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(contactInfo.phone, 'Phone')}
                      className="h-10 w-10 rounded-full sm:h-9 sm:w-9"
                      aria-label="Copy phone number"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={openPhone}
                      className="h-10 w-10 rounded-full bg-purple-600 text-white hover:bg-purple-700 sm:h-9 sm:w-9"
                      aria-label="Call phone number"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Message */}
            <Card className="border-gray-200 bg-gray-50 p-4 dark:bg-gray-800 dark:border-gray-700">
              <div className="mb-3 flex items-center gap-3">
                <MessageCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="font-medium text-gray-900 dark:text-white">Quick Message</p>
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Have questions about PandaNexus? Need support? Connect with me on LinkedIn!
              </p>
              <Button 
                onClick={() => {
                  openLinkedIn();
                  setIsOpen(false);
                }}
                className="w-full rounded-xl bg-blue-600 py-3 text-white hover:bg-blue-700"
              >
                <Linkedin className="mr-2 h-5 w-5" />
                Connect on LinkedIn
              </Button>
            </Card>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-4 text-center dark:border-gray-800">
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
