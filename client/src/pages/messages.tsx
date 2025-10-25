import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Send, Inbox } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipientId: "",
    subject: "",
    content: "",
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
  });

  const sendMutation = useMutation({
    mutationFn: async (data: typeof newMessage) => {
      return await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setComposeOpen(false);
      setNewMessage({ recipientId: "", subject: "", content: "" });
      toast({
        title: "Message sent!",
        description: "Your message has been delivered.",
      });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await apiRequest("PUT", `/api/messages/${messageId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const handleMessageClick = (message: any) => {
    setSelectedMessage(message);
    if (!message.read && message.recipientId === user?.id) {
      markReadMutation.mutate(message.id);
    }
  };

  const unreadCount = messages?.filter(
    (m: any) => !m.read && m.recipientId === user?.id
  ).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Messages
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-compose">
              <Send className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">To</Label>
                <select
                  id="recipient"
                  className="w-full rounded-lg border bg-background px-4 py-2"
                  value={newMessage.recipientId}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, recipientId: e.target.value })
                  }
                  data-testid="select-recipient"
                >
                  <option value="">Select recipient...</option>
                  {contacts?.map((contact: any) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.fullName} ({contact.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter subject"
                  value={newMessage.subject}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, subject: e.target.value })
                  }
                  data-testid="input-subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  placeholder="Write your message..."
                  value={newMessage.content}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, content: e.target.value })
                  }
                  rows={5}
                  data-testid="textarea-message"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => sendMutation.mutate(newMessage)}
                disabled={
                  !newMessage.recipientId ||
                  !newMessage.subject ||
                  !newMessage.content ||
                  sendMutation.isPending
                }
                data-testid="button-send"
              >
                {sendMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Inbox</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="divide-y">
                {messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`p-4 cursor-pointer hover-elevate ${
                      selectedMessage?.id === message.id ? "bg-muted" : ""
                    } ${!message.read && message.recipientId === user?.id ? "font-medium" : ""}`}
                    onClick={() => handleMessageClick(message)}
                    data-testid={`message-${message.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback>
                          {message.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm truncate">{message.senderName}</p>
                          {!message.read && message.recipientId === user?.id && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate">
                          {message.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No messages yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedMessage ? (
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedMessage.senderAvatar} />
                    <AvatarFallback>
                      {selectedMessage.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {selectedMessage.subject}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      From: {selectedMessage.senderName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedMessage.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setNewMessage({
                    recipientId: selectedMessage.senderId,
                    subject: `Re: ${selectedMessage.subject}`,
                    content: "",
                  });
                  setComposeOpen(true);
                }}
                data-testid="button-reply"
              >
                Reply
              </Button>
            </CardContent>
          ) : (
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Select a message to read</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
