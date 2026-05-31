import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  useGetMyNotificationsQuery, useMarkAllAsReadMutation,
  useMarkOneAsReadMutation, AppNotification,
} from '../../store/apis/notificationApi';
import { connectSocket } from '../../lib/socket';
import { useTheme } from '../../hooks/useTheme';

const ICON_MAP: Record<string, { icon: string; color: string }> = {
  kyc_approved:    { icon: 'shield-checkmark', color: '#10b981' },
  kyc_rejected:    { icon: 'shield-outline',   color: '#ef4444' },
  kyc_submitted:   { icon: 'document-text',    color: '#3b82f6' },
  message:         { icon: 'chatbubble',        color: '#6366f1' },
  payment_success: { icon: 'card',             color: '#10b981' },
  contact_access:  { icon: 'person-add',       color: '#f59e0b' },
  post_expired:    { icon: 'time',             color: '#f97316' },
  system:          { icon: 'settings',         color: '#6b7280' },
};
function getIcon(type: string) {
  return ICON_MAP[type] ?? { icon: 'notifications', color: '#6366f1' };
}
function fmtTime(d: string) {
  const date = new Date(d);
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 2880) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NotificationsScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const token = useSelector((st: RootState) => st.user.token);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [liveNotifs, setLiveNotifs] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useGetMyNotificationsQuery(
    { page: 1, limit: 40, ...(filter === 'unread' ? { isRead: false } : {}) },
    { skip: !token }
  );
  const [markAll] = useMarkAllAsReadMutation();
  const [markOne] = useMarkOneAsReadMutation();

  const serverNotifs = data?.data?.notifications ?? [];
  const allNotifs = [
    ...liveNotifs.filter(ln => !serverNotifs.find(sn => sn.id === ln.id)),
    ...serverNotifs,
  ];
  const visible = filter === 'unread' ? allNotifs.filter(n => !n.isRead) : allNotifs;
  const unreadCount = allNotifs.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!token) return;
    try {
      const socket = connectSocket(token);
      socket.on('new_notification', (n: AppNotification) => {
        setLiveNotifs(p => p.find(x => x.id === n.id) ? p : [n, ...p]);
      });
      return () => { socket.off('new_notification'); };
    } catch {}
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleTap = async (n: AppNotification) => {
    if (!n.isRead) {
      setLiveNotifs(p => p.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      await markOne(n.id);
      refetch();
    }
    if (n.path) router.push(n.path as any);
  };

  const handleMarkAll = async () => {
    setLiveNotifs(p => p.map(n => ({ ...n, isRead: true })));
    await markAll();
    refetch();
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={t.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={s.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={s.headerBadge}>
              <Text style={s.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAll} style={s.markAllBtn}>
            <Ionicons name="checkmark-done" size={14} color={t.primary} />
            <Text style={s.markAllText}>All read</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.tabs}>
        {(['all', 'unread'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, filter === tab && s.tabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[s.tabText, filter === tab && s.tabTextActive]}>
              {tab === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 48 }} />
      ) : visible.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="notifications-outline" size={52} color={t.textMuted} />
          <Text style={s.emptyTitle}>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</Text>
          <Text style={s.emptySub}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={n => n.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
          contentContainerStyle={{ paddingVertical: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: t.border }} />}
          renderItem={({ item: n }) => {
            const { icon, color } = getIcon(n.type);
            return (
              <TouchableOpacity
                style={[s.notifItem, !n.isRead && { backgroundColor: `${t.primary}08` }]}
                onPress={() => handleTap(n)}
                activeOpacity={0.7}
              >
                <View style={[s.iconWrap, { backgroundColor: `${color}18` }]}>
                  <Ionicons name={icon as any} size={19} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.notifTitle, !n.isRead && { fontWeight: '700', color: t.text }]}>{n.title}</Text>
                  <Text style={s.notifBody} numberOfLines={2}>{n.body}</Text>
                  <Text style={s.notifTime}>{fmtTime(n.createdAt)}</Text>
                </View>
                {!n.isRead && <View style={s.unreadDot} />}
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
    backBtn: { marginRight: 8, padding: 2 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: t.text },
    headerBadge: { backgroundColor: t.primary, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
    headerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: `${t.primary}15` },
    markAllText: { fontSize: 12, fontWeight: '700', color: t.primary },
    tabs: { flexDirection: 'row', padding: 12, gap: 8 },
    tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    tabActive: { backgroundColor: t.primary, borderColor: t.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: t.textMuted },
    tabTextActive: { color: '#fff' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 60 },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: t.text },
    emptySub: { fontSize: 13, color: t.textMuted },
    notifItem: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    iconWrap: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
    notifTitle: { fontSize: 14, fontWeight: '500', color: t.text, marginBottom: 3 },
    notifBody: { fontSize: 13, color: t.textMuted, lineHeight: 18 },
    notifTime: { fontSize: 11, color: t.textMuted, marginTop: 5 },
    unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: t.primary, marginTop: 5, flexShrink: 0 },
  });
}
