"use client";

/**
 * Human-to-human chat widget for Next.js. Connects users with brokers/agents
 * (e.g. "John Doe"). No AI/LLM — real person messaging only.
 */
import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender: "user" | "other";
  text: string;
  timestamp: Date;
}

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "other",
      text: "Hello, is this house still available?",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      sender: "user",
      text: "Yes, it is! Would you like to view it?",
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: "3",
      sender: "other",
      text: "That would be great! Can we meet tomorrow?",
      timestamp: new Date(Date.now() - 600000),
    },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageInput,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Trigger Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[60] bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-2xl shadow-primary/40 transition-all duration-300 hover:scale-110 active:scale-95 group"
          title="Open Chat"
        >
          <div className="relative">
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        </button>
      )}

      {/* Chat Panel */}
      <div
        className={`fixed bottom-0 right-0 md:right-6 z-[70] w-full md:w-[400px] bg-card border border-border md:rounded-t-2xl shadow-2xl transition-all duration-500 ease-in-out transform ${
          isOpen ? "translate-y-0" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border md:rounded-t-2xl bg-primary text-primary-foreground cursor-pointer" onClick={() => setIsOpen(false)}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                <User className="h-6 w-6 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm">John Doe</h3>
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Online Now</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-[450px] overflow-y-auto p-4 space-y-4 bg-muted/30 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-card border border-border text-foreground rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed break-words font-medium">{message.text}</p>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1 font-bold">
                {formatTime(message.timestamp)}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all"
          >
            <input
              type="text"
              placeholder="Type your message here..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 h-10 outline-none"
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-lg shadow-md shadow-primary/20"
              disabled={!messageInput.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-3 font-bold uppercase tracking-tight">
            Safe & Encrypted Chat by DigitalBroker
          </p>
        </div>
      </div>
    </>
  );
}
