"use client";

import { useState } from "react";
import { Bell, Check, Trash2, Settings, Home, Car, Wrench } from "lucide-react";

type NotificationType = "property" | "vehicle" | "service" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const iconMap: Record<NotificationType, React.ReactNode> = {
  property: <Home className="h-4 w-4" />,
  vehicle: <Car className="h-4 w-4" />,
  service: <Wrench className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />,
};

const colorMap: Record<NotificationType, string> = {
  property:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",
  vehicle: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  service:
    "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  system: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const MOCK: Notification[] = [
  {
    id: "1",
    type: "property",
    title: "New property listing",
    message:
      "A 3-bedroom apartment in Bole has been listed matching your saved search.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "vehicle",
    title: "Price drop alert",
    message:
      "The Toyota Land Cruiser you saved dropped from ETB 4.2M to ETB 3.9M.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "3",
    type: "service",
    title: "Booking confirmed",
    message:
      "Your plumbing service request has been confirmed for tomorrow at 10:00 AM.",
    time: "3 hr ago",
    read: false,
  },
  {
    id: "4",
    type: "system",
    title: "Profile verified",
    message:
      "Your identity verification was successful. You can now post listings.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "5",
    type: "property",
    title: "Listing expiring soon",
    message:
      "Your Kirkos office space listing expires in 2 days. Renew to keep it active.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "6",
    type: "vehicle",
    title: "New inquiry",
    message: "Someone sent a message about your Honda CR-V listing.",
    time: "2 days ago",
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const visible =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const remove = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
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
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 p-1 w-fit">
          {(["all", "unread"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
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

        {/* List */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((n) => (
              <li
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`group relative flex items-start gap-3.5 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${
                  n.read
                    ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    : "border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/30"
                }`}
              >
                {/* Unread dot */}
                {!n.read && (
                  <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-indigo-500" />
                )}

                {/* Icon */}
                <div
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[n.type]}`}
                >
                  {iconMap[n.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-snug ${n.read ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-slate-100"}`}
                  >
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    {n.time}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(n.id);
                  }}
                  className="mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
