import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  useGetChatRoomsQuery, useInitiateChatMutation,
  ChatRoom, ChatMessage,
} from '../../store/apis/chatApi';
import { connectSocket, getSocket } from '../../lib/socket';
import { useTheme } from '../../hooks/useTheme';

export default function ChatScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const { listingId, otherUserId } = useLocalSearchParams<{ listingId?: string; otherUserId?: string }>();
  const currentUser = useSelector((st: RootState) => st.user.currentUser);
  const token = useSelector((st: RootState) => st.user.token);

  const [view, setView] = useState<'rooms' | 'messages'>('rooms');
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingRooms, setTypingRooms] = useState<Record<string, boolean>>({});
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatRef = useRef<FlatList>(null);
  const [initiateChat] = useInitiateChatMutation();
  const { data: roomsData, isLoading, refetch } = useGetChatRoomsQuery({ page: 1, limit: 30 }, { skip: !token });
  const rooms = roomsData?.data?.rooms ?? [];

  useEffect(() => {
    if (!token) return;
    try {
      const socket = connectSocket(token);
      socket.on('online_contacts', ({ userIds }: any) => setOnlineUsers(new Set(userIds)));
      socket.on('user_online', ({ userId }: any) => setOnlineUsers(p => new Set(p).add(userId)));
      socket.on('user_offline', ({ userId }: any) => setOnlineUsers(p => { const n = new Set(p); n.delete(userId); return n; }));
      socket.on('typing_update', ({ roomId, isTyping: ty }: any) => setTypingRooms(p => ({ ...p, [roomId]: ty })));
      socket.on('new_message', (msg: ChatMessage) => {
        if (msg.roomId === activeRoom?.id) {
          setMessages(p => p.find(m => m.id === msg.id) ? p : [...p, msg]);
          try { socket.emit('messages_read', { roomId: msg.roomId }); } catch {}
        }
        refetch();
      });
      return () => {
        socket.off('online_contacts'); socket.off('user_online'); socket.off('user_offline');
        socket.off('typing_update'); socket.off('new_message');
      };
    } catch {}
  }, [token, activeRoom?.id]);

  useEffect(() => {
    if (listingId && otherUserId) handleStartChat(listingId, otherUserId);
  }, [listingId, otherUserId]);

  const handleStartChat = async (lId: string, oId: string) => {
    try {
      const res = await initiateChat({ listingId: lId, otherUserId: oId }).unwrap();
      setActiveRoom(res.data.room);
      setMessages(res.data.messages);
      setView('messages');
      try {
        const socket = getSocket();
        socket.emit('join_room', { roomId: res.data.room.id });
        socket.emit('messages_read', { roomId: res.data.room.id });
      } catch {}
    } catch (e: any) {
      Alert.alert('Error', e?.data?.message ?? 'Failed to open chat');
    }
  };

  const openRoom = (room: ChatRoom) => {
    setActiveRoom(room);
    setMessages([]);
    setView('messages');
    try {
      const socket = getSocket();
      socket.emit('join_room', { roomId: room.id });
      socket.emit('messages_read', { roomId: room.id });
    } catch {}
  };

  const sendMessage = () => {
    if (!input.trim() || !activeRoom) return;
    try {
      getSocket().emit('send_message', { roomId: activeRoom.id, listingId: null, content: input.trim(), messageType: 'text' });
      setInput('');
      stopTyping();
    } catch {}
  };

  const startTyping = () => {
    if (!isTyping && activeRoom) { setIsTyping(true); try { getSocket().emit('typing_start', { roomId: activeRoom.id }); } catch {} }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 2500);
  };

  const stopTyping = () => {
    if (isTyping && activeRoom) { setIsTyping(false); try { getSocket().emit('typing_stop', { roomId: activeRoom.id }); } catch {} }
  };

  const fmtTime = (d: string) => {
    const date = new Date(d);
    const isToday = date.toDateString() === new Date().toDateString();
    return isToday ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (view === 'messages' && activeRoom) {
    const other = activeRoom.otherUser;
    const isOnline = onlineUsers.has(other.id);
    const otherTyping = typingRooms[activeRoom.id];
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.chatHeader}>
          <TouchableOpacity onPress={() => { setView('rooms'); setActiveRoom(null); }} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={s.chatAvatar}>
            <Text style={s.chatAvatarText}>{other.firstName?.[0]}{other.lastName?.[0]}</Text>
            <View style={[s.onlineDot, { backgroundColor: isOnline ? '#22c55e' : '#6b7280' }]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.chatHeaderName}>{other.firstName} {other.lastName}</Text>
            <Text style={s.chatHeaderStatus}>{otherTyping ? 'typing...' : isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={s.msgList}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={s.emptyMsg}>
                <Ionicons name="chatbubbles-outline" size={44} color={t.textMuted} />
                <Text style={[s.emptyText, { color: t.textMuted }]}>No messages yet — say hello!</Text>
              </View>
            }
            renderItem={({ item: msg }) => {
              const mine = msg.senderId === currentUser?.id;
              return (
                <View style={[s.msgRow, mine && { justifyContent: 'flex-end' }]}>
                  <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleOther]}>
                    <Text style={[s.bubbleText, mine && { color: '#fff' }]}>{msg.content}</Text>
                    <Text style={[s.bubbleTime, mine && { color: 'rgba(255,255,255,0.65)' }]}>{fmtTime(msg.createdAt)}</Text>
                  </View>
                </View>
              );
            }}
          />
          {otherTyping && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
              <View style={[s.bubble, s.bubbleOther, { alignSelf: 'flex-start' }]}>
                <Text style={{ color: t.textMuted, fontStyle: 'italic', fontSize: 13 }}>typing...</Text>
              </View>
            </View>
          )}
          <View style={s.inputBar}>
            <TextInput
              style={s.inputField}
              placeholder="Type a message..."
              placeholderTextColor={t.textMuted}
              value={input}
              onChangeText={txt => { setInput(txt); startTyping(); }}
              multiline maxLength={1000}
            />
            <TouchableOpacity style={[s.sendBtn, !input.trim() && { opacity: 0.4 }]} onPress={sendMessage} disabled={!input.trim()}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBack}>
          <Ionicons name="chevron-back" size={22} color={t.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Messages</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 48 }} />
      ) : rooms.length === 0 ? (
        <View style={s.emptyCenter}>
          <Ionicons name="chatbubbles-outline" size={56} color={t.textMuted} />
          <Text style={s.emptyTitle}>No conversations yet</Text>
          <Text style={s.emptySub}>Unlock a listing's contact to start chatting</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={r => r.id}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: t.border, marginLeft: 76 }} />}
          renderItem={({ item: room }) => {
            const isOnline = onlineUsers.has(room.otherUser.id);
            const unread = room.unreadCount > 0;
            return (
              <TouchableOpacity style={s.roomRow} onPress={() => openRoom(room)} activeOpacity={0.7}>
                <View style={s.roomAvatar}>
                  <Text style={s.roomAvatarText}>{room.otherUser.firstName?.[0]}{room.otherUser.lastName?.[0]}</Text>
                  <View style={[s.onlineDot, { backgroundColor: isOnline ? '#22c55e' : '#9ca3af' }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={[s.roomName, unread && { fontWeight: '700', color: t.text }]}>{room.otherUser.firstName} {room.otherUser.lastName}</Text>
                    {room.lastMessage && <Text style={s.roomTime}>{fmtTime(room.lastMessage.createdAt)}</Text>}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[s.roomLast, unread && { color: t.text, fontWeight: '600' }]} numberOfLines={1}>
                      {room.lastMessage ? (room.lastMessage.senderId === currentUser?.id ? 'You: ' : '') + room.lastMessage.content : 'No messages yet'}
                    </Text>
                    {unread && <View style={s.unreadBadge}><Text style={s.unreadText}>{room.unreadCount > 99 ? '99+' : room.unreadCount}</Text></View>}
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
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border },
    headerBack: { marginRight: 8, padding: 2 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: t.text },
    chatHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.primary, paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
    backBtn: { padding: 4 },
    chatAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    chatAvatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    onlineDot: { width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: '#fff', position: 'absolute', bottom: 0, right: 0 },
    chatHeaderName: { color: '#fff', fontWeight: '700', fontSize: 15 },
    chatHeaderStatus: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
    msgList: { padding: 16, gap: 6, flexGrow: 1 },
    msgRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 2 },
    bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleOther: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderBottomLeftRadius: 4 },
    bubbleMine: { backgroundColor: t.primary, borderBottomRightRadius: 4 },
    bubbleText: { fontSize: 14, color: t.text, lineHeight: 20 },
    bubbleTime: { fontSize: 10, color: t.textMuted, marginTop: 4, textAlign: 'right' },
    inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: t.border, backgroundColor: t.background, gap: 8 },
    inputField: { flex: 1, backgroundColor: t.inputBg, borderRadius: 22, borderWidth: 1, borderColor: t.border, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: t.text, maxHeight: 100 },
    sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' },
    emptyMsg: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 14 },
    emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: t.text },
    emptySub: { fontSize: 14, color: t.textMuted, textAlign: 'center' },
    roomRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    roomAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: `${t.primary}20`, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    roomAvatarText: { fontSize: 16, fontWeight: '800', color: t.primary },
    roomName: { fontSize: 15, fontWeight: '500', color: t.text },
    roomTime: { fontSize: 11, color: t.textMuted },
    roomLast: { flex: 1, fontSize: 13, color: t.textMuted },
    unreadBadge: { backgroundColor: t.primary, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginLeft: 8 },
    unreadText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  });
}
