import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  useGetChatRoomsQuery,
  useInitiateChatMutation,
  ChatRoom,
  ChatMessage,
} from "../../store/apis/chatApi";
import { connectSocket, getSocket } from "../../lib/socket";
import { useTheme } from "../../hooks/useTheme";
import { API_BASE_URL } from "../../constants/api";

export default function ChatScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const { listingId, otherUserId } = useLocalSearchParams<{
    listingId?: string;
    otherUserId?: string;
  }>();
  const currentUser = useSelector((st: RootState) => st.user.currentUser);
  const token = useSelector((st: RootState) => st.user.token);

  const [view, setView] = useState<"rooms" | "messages">("rooms");
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingRooms, setTypingRooms] = useState<Record<string, boolean>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatRef = useRef<FlatList>(null);
  const activeRoomRef = useRef<ChatRoom | null>(null);
  const socketListenersAttached = useRef(false);

  const [initiateChat] = useInitiateChatMutation();
  const {
    data: roomsData,
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useGetChatRoomsQuery({ page: 1, limit: 30 }, { skip: !token });

  const rooms = roomsData?.data?.rooms ?? [];

  const fetchMessagesViaRest = useCallback(
    async (roomId: string) => {
      if (!token) return;
      setMessagesLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/chat/rooms/${roomId}/messages?limit=50`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await res.json();
        const fetched: ChatMessage[] = json?.data?.messages ?? [];
        setMessages(fetched.slice().reverse());
      } catch {
        setMessages([]);
        Alert.alert("Error", "Could not load messages.");
      } finally {
        setMessagesLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token || socketListenersAttached.current) return;
    socketListenersAttached.current = true;

    let socket: ReturnType<typeof connectSocket>;
    try {
      socket = connectSocket(token);
    } catch {
      return;
    }

    socket.on("online_contacts", ({ userIds }: any) =>
      setOnlineUsers(new Set(userIds)),
    );
    socket.on("user_online", ({ userId }: any) =>
      setOnlineUsers((prev) => new Set(prev).add(userId)),
    );
    socket.on("user_offline", ({ userId }: any) =>
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      }),
    );
    socket.on("typing_update", ({ roomId, isTyping: ty }: any) =>
      setTypingRooms((prev) => ({ ...prev, [roomId]: ty })),
    );
    socket.on("new_message", (msg: ChatMessage) => {
      const currentRoom = activeRoomRef.current;
      if (currentRoom && msg.roomId === currentRoom.id) {
        setMessages((prev) =>
          prev.find((m) => m.id === msg.id) ? prev : [...prev, msg],
        );
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
        try {
          getSocket().emit("messages_read", { roomId: msg.roomId });
        } catch {}
      }
      refetchRooms();
    });

    return () => {
      socketListenersAttached.current = false;
      socket.off("online_contacts");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("typing_update");
      socket.off("new_message");
    };
  }, [token]);

  useEffect(() => {
    if (listingId && otherUserId) {
      handleStartChat(listingId, otherUserId);
    }
  }, [listingId, otherUserId]);

  const openRoom = useCallback(
    async (room: ChatRoom) => {
      activeRoomRef.current = room;
      setActiveRoom(room);
      setMessages([]);
      setView("messages");
      try {
        const socket = getSocket();
        socket.emit("join_room", { roomId: room.id });
        socket.emit("messages_read", { roomId: room.id });
      } catch {}
      await fetchMessagesViaRest(room.id);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 200);
    },
    [fetchMessagesViaRest],
  );

  const handleStartChat = async (lId: string, oId: string) => {
    try {
      const res = await initiateChat({
        listingId: lId,
        otherUserId: oId,
      }).unwrap();
      const room: ChatRoom = res.data.room;
      const initialMessages: ChatMessage[] = res.data.messages ?? [];
      activeRoomRef.current = room;
      setActiveRoom(room);
      setMessages(initialMessages.slice().reverse());
      setView("messages");
      try {
        const socket = getSocket();
        socket.emit("join_room", { roomId: room.id });
        socket.emit("messages_read", { roomId: room.id });
      } catch {}
      if (initialMessages.length === 0) {
        await fetchMessagesViaRest(room.id);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message ?? "Failed to open chat");
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !activeRoom) return;
    const content = input.trim();
    setInput("");
    stopTyping();
    try {
      getSocket().emit("send_message", {
        roomId: activeRoom.id,
        listingId: null,
        content,
        messageType: "text",
      });
    } catch {
      Alert.alert("Error", "Could not send message. Check your connection.");
    }
  };

  const startTyping = () => {
    if (!isTyping && activeRoom) {
      setIsTyping(true);
      try {
        getSocket().emit("typing_start", { roomId: activeRoom.id });
      } catch {}
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 2500);
  };

  const stopTyping = () => {
    if (activeRoomRef.current) {
      setIsTyping(false);
      try {
        getSocket().emit("typing_stop", { roomId: activeRoomRef.current.id });
      } catch {}
    }
  };

  const goBackToRooms = () => {
    activeRoomRef.current = null;
    setActiveRoom(null);
    setMessages([]);
    setView("rooms");
    refetchRooms();
  };

  const fmtTime = (d: string) => {
    const date = new Date(d);
    const isToday = date.toDateString() === new Date().toDateString();
    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (view === "messages" && activeRoom) {
    const other = activeRoom.otherUser;
    const isOnline = onlineUsers.has(other.id);
    const otherTyping = typingRooms[activeRoom.id];

    return (
      <SafeAreaView style={s.safe}>
        <View style={[s.chatHeader, { backgroundColor: t.primary }]}>
          <TouchableOpacity onPress={goBackToRooms} style={s.headerBack}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={s.chatAvatar}>
            <Text style={s.chatAvatarText}>
              {other.firstName?.[0]}
              {other.lastName?.[0]}
            </Text>
            <View
              style={[
                s.onlineDot,
                { backgroundColor: isOnline ? "#22c55e" : "#6b7280" },
              ]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.chatHeaderName}>
              {other.firstName} {other.lastName}
            </Text>
            <Text style={s.chatHeaderStatus}>
              {otherTyping ? "typing..." : isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {messagesLoading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator color={t.primary} />
              <Text style={{ color: t.textMuted, marginTop: 8, fontSize: 13 }}>
                Loading messages...
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatRef}
              data={messages}
              keyExtractor={(m) => m.id}
              contentContainerStyle={s.msgList}
              onContentSizeChange={() => {
                if (messages.length > 0)
                  flatRef.current?.scrollToEnd({ animated: false });
              }}
              ListEmptyComponent={
                <View style={s.emptyMsg}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={44}
                    color={t.textMuted}
                  />
                  <Text style={[s.emptyMsgText, { color: t.textMuted }]}>
                    No messages yet — say hello!
                  </Text>
                </View>
              }
              renderItem={({ item: msg }) => {
                const mine = msg.senderId === currentUser?.id;
                return (
                  <View
                    style={[s.msgRow, mine && { justifyContent: "flex-end" }]}
                  >
                    <View
                      style={[
                        s.bubble,
                        mine
                          ? [s.bubbleMine, { backgroundColor: t.primary }]
                          : [
                              s.bubbleOther,
                              {
                                backgroundColor: t.card,
                                borderColor: t.border,
                              },
                            ],
                      ]}
                    >
                      <Text
                        style={[
                          s.bubbleText,
                          { color: mine ? "#fff" : t.text },
                        ]}
                      >
                        {msg.content}
                      </Text>
                      <View style={s.bubbleFooter}>
                        <Text
                          style={[
                            s.bubbleTime,
                            {
                              color: mine
                                ? "rgba(255,255,255,0.65)"
                                : t.textMuted,
                            },
                          ]}
                        >
                          {fmtTime(msg.createdAt)}
                        </Text>
                        {mine && (
                          <Ionicons
                            name={msg.isRead ? "checkmark-done" : "checkmark"}
                            size={12}
                            color="rgba(255,255,255,0.65)"
                          />
                        )}
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}

          {otherTyping && !messagesLoading && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
              <View
                style={[
                  s.bubble,
                  s.bubbleOther,
                  {
                    backgroundColor: t.card,
                    borderColor: t.border,
                    alignSelf: "flex-start",
                  },
                ]}
              >
                <Text
                  style={{
                    color: t.textMuted,
                    fontStyle: "italic",
                    fontSize: 13,
                  }}
                >
                  typing...
                </Text>
              </View>
            </View>
          )}

          <View
            style={[
              s.inputBar,
              { borderTopColor: t.border, backgroundColor: t.background },
            ]}
          >
            <TextInput
              style={[
                s.inputField,
                {
                  backgroundColor: t.inputBg,
                  borderColor: t.border,
                  color: t.text,
                },
              ]}
              placeholder="Type a message..."
              placeholderTextColor={t.textMuted}
              value={input}
              onChangeText={(txt) => {
                setInput(txt);
                startTyping();
              }}
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[
                s.sendBtn,
                { backgroundColor: t.primary },
                !input.trim() && { opacity: 0.4 },
              ]}
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={[s.header, { borderBottomColor: t.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>Messages</Text>
        <TouchableOpacity
          onPress={() => refetchRooms()}
          style={{ marginLeft: "auto" }}
        >
          <Ionicons name="refresh-outline" size={22} color={t.textMuted} />
        </TouchableOpacity>
      </View>

      {roomsLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={t.primary} />
          <Text style={{ color: t.textMuted, marginTop: 8, fontSize: 13 }}>
            Loading conversations...
          </Text>
        </View>
      ) : rooms.length === 0 ? (
        <View style={s.emptyCenter}>
          <Ionicons name="chatbubbles-outline" size={56} color={t.textMuted} />
          <Text style={[s.emptyTitle, { color: t.text }]}>
            No conversations yet
          </Text>
          <Text style={[s.emptySub, { color: t.textMuted }]}>
            Unlock a listing's contact to start chatting
          </Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(r) => r.id}
          ItemSeparatorComponent={() => (
            <View
              style={{ height: 1, backgroundColor: t.border, marginLeft: 76 }}
            />
          )}
          renderItem={({ item: room }) => {
            const isOnline = onlineUsers.has(room.otherUser.id);
            const unread = room.unreadCount > 0;
            return (
              <TouchableOpacity
                style={s.roomRow}
                onPress={() => openRoom(room)}
                activeOpacity={0.7}
              >
                <View
                  style={[s.roomAvatar, { backgroundColor: `${t.primary}20` }]}
                >
                  <Text style={[s.roomAvatarText, { color: t.primary }]}>
                    {room.otherUser.firstName?.[0]}
                    {room.otherUser.lastName?.[0]}
                  </Text>
                  <View
                    style={[
                      s.onlineDot,
                      { backgroundColor: isOnline ? "#22c55e" : "#9ca3af" },
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <Text
                      style={[
                        s.roomName,
                        { color: t.text },
                        unread && { fontWeight: "700" },
                      ]}
                    >
                      {room.otherUser.firstName} {room.otherUser.lastName}
                    </Text>
                    {room.lastMessage && (
                      <Text style={[s.roomTime, { color: t.textMuted }]}>
                        {fmtTime(room.lastMessage.createdAt)}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={[
                        s.roomLast,
                        { color: unread ? t.text : t.textMuted },
                        unread && { fontWeight: "600" },
                      ]}
                      numberOfLines={1}
                    >
                      {room.lastMessage
                        ? (room.lastMessage.senderId === currentUser?.id
                            ? "You: "
                            : "") + room.lastMessage.content
                        : "No messages yet"}
                    </Text>
                    {unread && (
                      <View
                        style={[s.unreadBadge, { backgroundColor: t.primary }]}
                      >
                        <Text style={s.unreadText}>
                          {room.unreadCount > 99 ? "99+" : room.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 22, fontWeight: "800" },
    chatHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 10,
    },
    headerBack: { padding: 4 },
    chatAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    chatAvatarText: { color: "#fff", fontWeight: "800", fontSize: 14 },
    onlineDot: {
      width: 11,
      height: 11,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: "#fff",
      position: "absolute",
      bottom: 0,
      right: 0,
    },
    chatHeaderName: { color: "#fff", fontWeight: "700", fontSize: 15 },
    chatHeaderStatus: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 11,
      fontWeight: "600",
    },
    msgList: { padding: 16, gap: 4, flexGrow: 1 },
    msgRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginBottom: 4,
    },
    bubble: {
      maxWidth: "78%",
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
    },
    bubbleOther: { borderBottomLeftRadius: 4 },
    bubbleMine: { borderBottomRightRadius: 4, borderWidth: 0 },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 3,
      marginTop: 4,
    },
    bubbleTime: { fontSize: 10 },
    emptyMsg: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 12,
    },
    emptyMsgText: { fontSize: 14 },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      padding: 12,
      borderTopWidth: 1,
      gap: 8,
    },
    inputField: {
      flex: 1,
      borderRadius: 22,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 14,
      maxHeight: 100,
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 32,
    },
    emptyTitle: { fontSize: 18, fontWeight: "700" },
    emptySub: { fontSize: 14, textAlign: "center" },
    roomRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    roomAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    roomAvatarText: { fontSize: 16, fontWeight: "800" },
    roomName: { fontSize: 15, fontWeight: "500" },
    roomTime: { fontSize: 11 },
    roomLast: { flex: 1, fontSize: 13 },
    unreadBadge: {
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 5,
      marginLeft: 8,
    },
    unreadText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  });
}
