"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Trash2,
  Settings,
  Home,
  Car,
  Wrench,
  MessageCircle,
  Coins,
  ShieldCheck,
  ShieldX,
  FileText,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { getSocket, connectSocket } from "@/lib/socket";
import {
  useGetMyNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkOneAsReadMutation,
  AppNotification,
} from "@/store/apis/notificationApi";

const iconMap: Record<string, React.ReactNode> = {
  kyc_submitted: <FileText className="h-4 w-4" />,
  kyc_approved: <ShieldCheck className="h-4 w-4" />,
  kyc_rejected: <ShieldX className="h-4 w-4" />,
  message: <MessageCircle className="h-4 w-4" />,
  payment_success: <Coins className="h-4 w-4" />,
  new_contact: <Home className="h-4 w-4" />,
  post_expired: <Home className="h-4 w-4" />,
  insufficient_coins: <Coins className="h-4 w-4" />,
  contact_access: <Home className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />,
  property: <Home className="h-4 w-4" />,
  vehicle: <Car className="h-4 w-4" />,
  service: <Wrench className="h-4 w-4" />,
};

const colorMap: Record<string, string> = {
  kyc_submitted:
    "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  kyc_approved:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  kyc_rejected: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  message:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",
  payment_success:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  new_contact:
    "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  post_expired:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",
  insufficient_coins:
    "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  contact_access:
    "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  system: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  property:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",
  vehicle: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  service:
    "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
};

const getIcon = (type: string) => iconMap[type] ?? <Bell className="h-4 w-4" />;
const getColor = (type: string) =>
  colorMap[type] ??
  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function NotificationsPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAppSelector((s) => s.user);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [liveNotifications, setLiveNotifications] = useState<AppNotification[]>(
    [],
  );

  const { data, isLoading, refetch } = useGetMyNotificationsQuery({
    page,
    limit: 20,
    ...(filter === "unread" ? { isRead: false } : {}),
  });

  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [markOneAsRead] = useMarkOneAsReadMutation();

  const serverNotifications = data?.data?.notifications ?? [];
  const pagination = data?.data?.pagination;

  const allNotifications = [
    ...liveNotifications.filter(
      (ln) => !serverNotifications.find((sn) => sn.id === ln.id),
    ),
    ...serverNotifications,
  ];

  const visible =
    filter === "unread"
      ? allNotifications.filter((n) => !n.isRead)
      : allNotifications;

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    connectSocket();
    const socket = getSocket();

    const handleNewNotification = (notification: AppNotification) => {
      setLiveNotifications((prev) => {
        if (prev.find((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    };

    socket.on("new_notification", handleNewNotification);
    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [isAuthenticated, currentUser]);

  const handleMarkOne = async (n: AppNotification) => {
    if (!n.isRead) {
      setLiveNotifications((prev) =>
        prev.map((ln) => (ln.id === n.id ? { ...ln, isRead: true } : ln)),
      );
      await markOneAsRead(n.id);
      refetch();
    }
    if (n.path) router.push(n.path);
  };

  const handleMarkAll = async () => {
    setLiveNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllAsRead();
    refetch();
  };

  const handleRemoveLive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 p-1 w-fit">
          {(["all", "unread"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setFilter(tab);
                setPage(1);
              }}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                filter === tab
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab}
              {tab === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 text-xs text-indigo-500">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {visible.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleMarkOne(n)}
                  className={`group relative flex items-start gap-3.5 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${
                    n.isRead
                      ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                      : "border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/30"
                  }`}
                >
                  {!n.isRead && (
                    <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                  <div
                    className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${getColor(n.type)}`}
                  >
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-snug ${
                        n.isRead
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveLive(n.id, e)}
                    className="mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                    aria-label="Dismiss"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="text-sm text-indigo-600 disabled:opacity-40 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Prev
                </button>
                <span className="text-sm text-slate-500">
                  {page} / {pagination.pages}
                </span>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-sm text-indigo-600 disabled:opacity-40 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
