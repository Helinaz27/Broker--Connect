"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import {
  MessageCircle,
  X,
  ChevronLeft,
  Send,
  Paperclip,
  File,
  Check,
  CheckCheck,
  Search,
  ExternalLink,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { getSocket, connectSocket } from "@/lib/socket";
import {
  useGetChatRoomsQuery,
  useSearchContactsQuery,
  useGetMessagesQuery,
  useUploadMessageFileMutation,
  useInitiateChatMutation,
  ChatMessage,
  ChatRoom,
  OtherUser,
  ListingInfo,
} from "@/store/apis/chatApi";

type ChatView = "contacts" | "messages";

interface ActiveRoom {
  room: ChatRoom;
  otherUser: OtherUser;
  initialMessages: ChatMessage[];
  listingId: string;
}

interface ChatContextValue {
  openChat: (opts: { listingId: string; otherUserId: string }) => void;
}

const ChatContext = createContext<ChatContextValue>({ openChat: () => {} });

export const useChatWidget = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<ActiveRoom | null>(null);
  const [initiateChat] = useInitiateChatMutation();

  const openChat = useCallback(
    async (opts: { listingId: string; otherUserId: string }) => {
      setIsOpen(true);
      try {
        const res = await initiateChat(opts).unwrap();
        setActiveRoom({
          room: res.data.room,
          otherUser: res.data.otherUser,
          initialMessages: res.data.messages,
          listingId: opts.listingId,
        });
      } catch (err: any) {
        console.error("Failed to initiate chat:", err);
      }
    },
    [initiateChat],
  );

  return (
    <ChatContext.Provider value={{ openChat }}>
      {children}
      <ChatWidget
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        activeRoom={activeRoom}
        setActiveRoom={setActiveRoom}
      />
    </ChatContext.Provider>
  );
}

interface ChatWidgetProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  activeRoom: ActiveRoom | null;
  setActiveRoom: (room: ActiveRoom | null) => void;
}

function ChatWidget({
  isOpen,
  setIsOpen,
  activeRoom,
  setActiveRoom,
}: ChatWidgetProps) {
  const [view, setView] = useState<ChatView>("contacts");
  const [typingRooms, setTypingRooms] = useState<Record<string, string>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [liveLastMessages, setLiveLastMessages] = useState<
    Record<string, ChatMessage>
  >({});

  const currentUser = useSelector((s: RootState) => s.user.currentUser);

  useEffect(() => {
    if (activeRoom) setView("messages");
  }, [activeRoom]);

  useEffect(() => {
    if (!currentUser) return;

    connectSocket();
    const socket = getSocket();

    socket.on("online_contacts", ({ userIds }: { userIds: string[] }) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on("user_online", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socket.on("user_offline", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on(
      "typing_update",
      ({
        roomId,
        userId,
        isTyping,
      }: {
        roomId: string;
        userId: string;
        isTyping: boolean;
      }) => {
        setTypingRooms((prev) => {
          const next = { ...prev };
          if (isTyping) next[roomId] = userId;
          else delete next[roomId];
          return next;
        });
      },
    );

    const handleWidgetNewMessage = (msg: ChatMessage) => {
      setLiveLastMessages((prev) => ({ ...prev, [msg.roomId]: msg }));
    };

    socket.on("new_message", handleWidgetNewMessage);

    return () => {
      socket.off("online_contacts");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("typing_update");
      socket.off("new_message", handleWidgetNewMessage);
    };
  }, [currentUser]);

  const handleRoomSelect = (
    room: ChatRoom,
    otherUser: OtherUser,
    initialMessages: ChatMessage[],
  ) => {
    const listingId =
      liveLastMessages[room.id]?.listingId || room.lastMessage?.listingId || "";
    setActiveRoom({ room, otherUser, initialMessages, listingId });
    setView("messages");
  };

  const handleBack = () => {
    setView("contacts");
    setActiveRoom(null);
  };

  const isOtherUserOnline = (userId: string) => onlineUsers.has(userId);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[60] bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-2xl shadow-primary/40 transition-all duration-300 hover:scale-110 active:scale-95"
          title="Open Chat"
        >
          <div className="relative">
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          </div>
        </button>
      )}

      <div
        className={`fixed bottom-0 right-0 md:right-6 z-[70] w-full md:w-[400px] bg-card border border-border md:rounded-t-2xl shadow-2xl transition-all duration-500 ease-in-out transform overflow-hidden ${
          isOpen
            ? "translate-y-0"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{ height: "600px", display: "flex", flexDirection: "column" }}
      >
        {view === "contacts" ? (
          <ContactsList
            onClose={() => setIsOpen(false)}
            onSelectRoom={handleRoomSelect}
            typingRooms={typingRooms}
            isOtherUserOnline={isOtherUserOnline}
            currentUserId={currentUser?.id ?? ""}
            liveLastMessages={liveLastMessages}
          />
        ) : activeRoom ? (
          <MessagePanel
            activeRoom={activeRoom}
            onBack={handleBack}
            isOnline={isOtherUserOnline(activeRoom.otherUser.id)}
            currentUserId={currentUser?.id ?? ""}
            typingRooms={typingRooms}
          />
        ) : null}
      </div>
    </>
  );
}

interface ContactsListProps {
  onClose: () => void;
  onSelectRoom: (
    room: ChatRoom,
    otherUser: OtherUser,
    messages: ChatMessage[],
  ) => void;
  typingRooms: Record<string, string>;
  isOtherUserOnline: (id: string) => boolean;
  currentUserId: string;
  liveLastMessages: Record<string, ChatMessage>;
}

function ContactsList({
  onClose,
  onSelectRoom,
  typingRooms,
  isOtherUserOnline,
  currentUserId,
  liveLastMessages,
}: ContactsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data: roomsData, isLoading } = useGetChatRoomsQuery(
    { page, limit: 20 },
    { refetchOnMountOrArgChange: true },
  );
  const { data: searchData } = useSearchContactsQuery(searchQuery, {
    skip: searchQuery.length < 1,
  });

  const rooms = roomsData?.data?.rooms ?? [];
  const pagination = roomsData?.data?.pagination;
  const searchResults = searchData?.data ?? [];

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleSelect = (room: ChatRoom) => {
    onSelectRoom(room, room.otherUser, []);
  };

  const enrichedRooms = rooms
    .map((room) => ({
      ...room,
      lastMessage: liveLastMessages[room.id] ?? room.lastMessage,
    }))
    .sort((a, b) => {
      const aTime = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : new Date(a.updatedAt).getTime();
      const bTime = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : new Date(b.updatedAt).getTime();
      return bTime - aTime;
    });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-primary-foreground md:rounded-t-2xl">
        <h3 className="font-bold text-base tracking-tight">Messages</h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-3 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2 border border-border focus-within:border-primary transition-colors">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {isLoading && (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {searchQuery.length >= 1 ? (
          searchResults.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">
              No contacts found
            </p>
          ) : (
            searchResults.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  const matchedRoom = rooms.find(
                    (r) => r.otherUser.id === u.id,
                  );
                  if (matchedRoom) handleSelect(matchedRoom);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <Avatar user={u} isOnline={isOtherUserOnline(u.id)} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isOtherUserOnline(u.id) ? "Online" : "Offline"}
                  </p>
                </div>
              </button>
            ))
          )
        ) : enrichedRooms.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <MessageCircle className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Get contact access on a listing to start chatting
            </p>
          </div>
        ) : (
          enrichedRooms.map((room) => {
            const isTyping = typingRooms[room.id] === room.otherUser.id;
            const isOnline = isOtherUserOnline(room.otherUser.id);
            const isUnread = room.unreadCount > 0;

            return (
              <button
                key={room.id}
                onClick={() => handleSelect(room)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <Avatar user={room.otherUser} isOnline={isOnline} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm truncate ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}
                    >
                      {room.otherUser.firstName} {room.otherUser.lastName}
                    </p>
                    {room.lastMessage && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatTime(room.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    {isTyping ? (
                      <TypingDots />
                    ) : room.lastMessage ? (
                      <p
                        className={`text-xs truncate ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}
                      >
                        {room.lastMessage.senderId === currentUserId
                          ? "You: "
                          : ""}
                        {room.lastMessage.messageType === "text"
                          ? room.lastMessage.content
                          : room.lastMessage.messageType === "image"
                            ? "📷 Image"
                            : "📎 File"}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No messages yet
                      </p>
                    )}
                    {isUnread && (
                      <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                        {room.unreadCount > 99 ? "99+" : room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}

        {!searchQuery && pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 py-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs text-primary disabled:opacity-40 px-2 py-1 rounded hover:bg-muted"
            >
              Prev
            </button>
            <span className="text-xs text-muted-foreground">
              {page} / {pagination.pages}
            </span>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs text-primary disabled:opacity-40 px-2 py-1 rounded hover:bg-muted"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const LISTING_TYPE_ROUTES: Record<string, string> = {
  house: "house-listings",
  car: "car-listings",
  service: "service-listings",
};

function getListingRoute(listingType: string, listingId: string): string {
  const segment = LISTING_TYPE_ROUTES[listingType.toLowerCase()] ?? "listings";
  return `/${segment}/${listingId}`;
}

function ListingCard({ listing }: { listing: ListingInfo }) {
  const router = useRouter();
  const href = getListingRoute(listing.listingType, listing.id);
  const image = listing.images?.[0];

  return (
    <button
      onClick={() => router.push(href)}
      className="w-full text-left rounded-xl overflow-hidden border border-border bg-background hover:border-primary/50 transition-colors mb-1.5"
    >
      {image && (
        <img
          src={image}
          alt={listing.title}
          className="w-full h-28 object-cover"
        />
      )}
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {listing.title}
          </p>
          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
            {listing.listingType} listing
          </p>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
}

interface MessagePanelProps {
  activeRoom: ActiveRoom;
  onBack: () => void;
  isOnline: boolean;
  currentUserId: string;
  typingRooms: Record<string, string>;
}

function MessagePanel({
  activeRoom,
  onBack,
  isOnline,
  currentUserId,
  typingRooms,
}: MessagePanelProps) {
  const { room, otherUser, initialMessages } = activeRoom;
  const [listingId, setListingId] = useState<string>(
    activeRoom.listingId || initialMessages[0]?.listingId || "",
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const socketMessageBuffer = useRef<ChatMessage[]>([]);
  const messagesLoadedRef = useRef(false);

  const [uploadFile] = useUploadMessageFileMutation();

  const shouldFetch = initialMessages.length === 0;

  const { data: fetchedData } = useGetMessagesQuery(
    { roomId: room.id, limit: 30 },
    { skip: !shouldFetch, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
      setCursor(initialMessages.length === 30 ? initialMessages[0].id : null);
      setHasMore(initialMessages.length === 30);
      messagesLoadedRef.current = true;
      if (socketMessageBuffer.current.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newOnes = socketMessageBuffer.current.filter(
            (m) => !existingIds.has(m.id),
          );
          socketMessageBuffer.current = [];
          return [...prev, ...newOnes];
        });
      }
    }
  }, [room.id]);

  useEffect(() => {
    if (fetchedData?.data) {
      const fetched = fetchedData.data.messages;
      setCursor(fetchedData.data.nextCursor);
      setHasMore(!!fetchedData.data.nextCursor);
      if (!listingId && fetched[0]?.listingId)
        setListingId(fetched[0].listingId);
      setMessages(() => {
        const existingIds = new Set(fetched.map((m) => m.id));
        const buffered = socketMessageBuffer.current.filter(
          (m) => !existingIds.has(m.id),
        );
        socketMessageBuffer.current = [];
        messagesLoadedRef.current = true;
        return [...fetched, ...buffered];
      });
    }
  }, [fetchedData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();

    socket.emit("join_room", { roomId: room.id });
    socket.emit("messages_read", { roomId: room.id });

    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.roomId !== room.id) return;
      if (!listingId && msg.listingId) setListingId(msg.listingId);
      if (!messagesLoadedRef.current) {
        socketMessageBuffer.current.push(msg);
      } else {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        socket.emit("messages_read", { roomId: room.id });
      }
    };

    const handleReadAck = ({ roomId }: { roomId: string }) => {
      if (roomId === room.id) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read_ack", handleReadAck);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read_ack", handleReadAck);
      messagesLoadedRef.current = false;
      socketMessageBuffer.current = [];
    };
  }, [room.id]);

  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || !cursor) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/${room.id}/messages?cursor=${cursor}&limit=30`,
      { credentials: "include" },
    );
    const json = await res.json();
    if (json.success) {
      setMessages((prev) => [...json.data.messages, ...prev]);
      setCursor(json.data.nextCursor);
      setHasMore(!!json.data.nextCursor);
      if (!listingId && json.data.messages[0]?.listingId) {
        setListingId(json.data.messages[0].listingId);
      }
    }
  }, [hasMore, cursor, room.id, listingId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop < 60) loadOlderMessages();
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [loadOlderMessages]);

  const sendMessage = (
    content: string,
    messageType: "text" | "image" | "file" = "text",
  ) => {
    if (!content.trim() && messageType === "text") return;
    const socket = getSocket();
    socket.emit(
      "send_message",
      { roomId: room.id, listingId, content, messageType },
      (ack: any) => {
        if (ack?.error) console.error("send_message error:", ack.error);
      },
    );
  };

  const handleSend = () => {
    sendMessage(input);
    setInput("");
    stopTyping();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      getSocket().emit("typing_start", { roomId: room.id });
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => stopTyping(), 2500);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      getSocket().emit("typing_stop", { roomId: room.id });
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    const res = await uploadFile({ roomId: room.id, files: formData }).unwrap();
    const isImage = files[0].type.startsWith("image/");
    res.data.urls.forEach((url) =>
      sendMessage(url, isImage ? "image" : "file"),
    );
    e.target.value = "";
  };

  const otherIsTyping = typingRooms[room.id] === otherUser.id;

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const seenListingIds = useRef<Set<string>>(new Set());

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-primary text-primary-foreground md:rounded-t-2xl">
        <button
          onClick={onBack}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <Avatar user={otherUser} isOnline={isOnline} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">
            {otherUser.firstName} {otherUser.lastName}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
            {otherIsTyping ? "typing..." : isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-muted/20"
      >
        {hasMore && (
          <button
            onClick={loadOlderMessages}
            className="w-full text-center text-xs text-primary hover:underline py-1"
          >
            Load older messages
          </button>
        )}

        {(() => {
          seenListingIds.current = new Set();
          return messages.map((msg, idx) => {
            const isMine = msg.senderId === currentUserId;
            const showTime =
              idx === 0 ||
              new Date(msg.createdAt).getTime() -
                new Date(messages[idx - 1].createdAt).getTime() >
                5 * 60 * 1000;

            const showListingCard =
              !!msg.listing &&
              !seenListingIds.current.has(msg.listing.id) &&
              (() => {
                seenListingIds.current.add(msg.listing!.id);
                return true;
              })();

            return (
              <div key={msg.id}>
                {showTime && (
                  <p className="text-center text-[10px] text-muted-foreground my-2">
                    {formatTime(msg.createdAt)}
                  </p>
                )}

                {showListingCard && (
                  <div
                    className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}
                  >
                    <div className="max-w-[78%] w-full">
                      <ListingCard listing={msg.listing!} />
                    </div>
                  </div>
                )}

                <div
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card border border-border text-foreground rounded-bl-none"
                    }`}
                  >
                    {msg.messageType === "text" && (
                      <p className="text-sm leading-relaxed break-words">
                        {msg.content}
                      </p>
                    )}
                    {msg.messageType === "image" && (
                      <a
                        href={msg.content}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={msg.content}
                          alt="sent image"
                          className="rounded-lg max-w-full max-h-48 object-cover"
                        />
                      </a>
                    )}
                    {msg.messageType === "file" && (
                      <a
                        href={msg.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm underline"
                      >
                        <File className="h-4 w-4 shrink-0" />
                        <span className="truncate">Download file</span>
                      </a>
                    )}
                  </div>
                </div>

                {isMine && idx === messages.length - 1 && (
                  <div className="flex justify-end pr-1 mt-0.5">
                    {msg.isRead ? (
                      <CheckCheck className="h-3 w-3 text-primary" />
                    ) : (
                      <Check className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            );
          });
        })()}

        {otherIsTyping && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 py-3 border-t border-border bg-background">
        <div className="flex items-end gap-2 bg-muted/50 rounded-xl border border-border px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-primary transition-colors mb-1 shrink-0"
            title="Attach file or image"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <textarea
            rows={1}
            placeholder="Type a message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              startTyping();
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm resize-none max-h-24 overflow-y-auto py-0.5 placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 bg-primary text-primary-foreground rounded-lg p-1.5 disabled:opacity-40 hover:bg-primary/90 transition-all active:scale-95 mb-0.5"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2 font-bold uppercase tracking-tight">
          Safe & Encrypted Chat by DigitalBroker
        </p>
      </div>
    </div>
  );
}

function Avatar({
  user,
  isOnline,
  size,
}: {
  user: { firstName: string; lastName: string; profileImage?: string };
  isOnline: boolean;
  size: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-9 h-9" : "w-11 h-11";
  const dot = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";
  return (
    <div className={`relative shrink-0 ${dim}`}>
      {user.profileImage ? (
        <img
          src={user.profileImage}
          alt=""
          className={`${dim} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${dim} rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm`}
        >
          {user.firstName[0]}
          {user.lastName[0]}
        </div>
      )}
      <span
        className={`absolute bottom-0 right-0 ${dot} rounded-full border-2 border-card ${
          isOnline ? "bg-green-500" : "bg-muted-foreground/40"
        }`}
      />
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "800ms" }}
        />
      ))}
    </span>
  );
}
