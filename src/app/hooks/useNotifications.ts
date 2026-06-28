// frontend/src/hooks/useNotifications.ts
// ─────────────────────────────────────────────────────────────────
// Hook universal untuk notifikasi.
// CustomerNotifikasi  → useNotifications("customer")
// AdminNotifikasi     → useNotifications("admin")
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";

const API = (import.meta.env.VITE_API_URL ?? "http://localhost:3001/api");

// ─── Tipe data notifikasi dari backend ─────────────────────────
export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  category: "pesanan" | "keuangan" | "sistem" | "pengguna" | "broadcast";
  read: boolean;
  createdAt: string;   // ISO string
  orderId: number | null;
}

type FilterType = "semua" | "belum-dibaca" | "pesanan" | "keuangan" | "sistem" | "pengguna" | "broadcast";
type Mode = "customer" | "admin";

// ─── Endpoint resolver ─────────────────────────────────────────
function ep(mode: Mode) {
  return mode === "customer"
    ? `${API}/notifications/me`
    : `${API}/notifications/admin`;
}

// ─── Hook ──────────────────────────────────────────────────────
export function useNotifications(mode: Mode) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [filterType,    setFilterType]    = useState<FilterType>("semua");

  // Polling interval ref (auto-refresh setiap 30 detik)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch dari backend ────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (filterType === "belum-dibaca") params.set("read", "false");
      else if (filterType !== "semua")   params.set("category", filterType);

      const res  = await fetch(`${ep(mode)}?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();
      setNotifications(json.data);
      setUnreadCount(json.unread);
    } catch (e: any) {
      setError(e.message ?? "Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  }, [mode, searchQuery, filterType]);

  // Initial load + re-fetch when filters change
  useEffect(() => {
    setLoading(true);
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    intervalRef.current = setInterval(fetchNotifications, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchNotifications]);

  // ── Toggle baca / belum baca ──────────────────────────────────
  const handleToggleRead = useCallback(async (id: number) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    );
    setUnreadCount(prev => {
      const notif = notifications.find(n => n.id === id);
      return notif?.read ? prev + 1 : Math.max(0, prev - 1);
    });

    try {
      await fetch(`${ep(mode)}/${id}/read`, { method: "PATCH", credentials: "include" });
    } catch {
      // Rollback on error
      fetchNotifications();
    }
  }, [mode, notifications, fetchNotifications]);

  // ── Tandai semua dibaca ───────────────────────────────────────
  const handleMarkAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch(`${ep(mode)}/read-all`, { method: "PATCH", credentials: "include" });
    } catch {
      fetchNotifications();
    }
  }, [mode, fetchNotifications]);

  // ── Hapus satu notifikasi ─────────────────────────────────────
  const handleDelete = useCallback(async (id: number) => {
    const notif = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await fetch(`${ep(mode)}/${id}`, { method: "DELETE", credentials: "include" });
    } catch {
      fetchNotifications();
    }
  }, [mode, notifications, fetchNotifications]);

  // ── Hapus semua (admin only) ──────────────────────────────────
  const handleClearAll = useCallback(async () => {
    if (!confirm("Hapus semua notifikasi?")) return;
    setNotifications([]);
    setUnreadCount(0);
    try {
      await fetch(`${ep(mode)}/clear-all`, { method: "DELETE", credentials: "include" });
    } catch {
      fetchNotifications();
    }
  }, [mode, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    searchQuery,
    filterType,
    setSearchQuery,
    setFilterType,
    refresh: fetchNotifications,
    handleToggleRead,
    handleMarkAllRead,
    handleDelete,
    handleClearAll,
  };
}

// ─────────────────────────────────────────────────────────────────
// Hook ringan khusus lonceng di navbar / CustomerHome
// Hanya fetch /me/preview (5 notif terbaru + unreadCount)
// ─────────────────────────────────────────────────────────────────
export function useNotificationPreview() {
  const [preview,     setPreview]     = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading,     setLoading]     = useState(true);

  const fetchPreview = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/notifications/me/preview`, { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json();
      setPreview(json.data);
      setUnreadCount(json.unread);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreview();
    const t = setInterval(fetchPreview, 30_000);
    return () => clearInterval(t);
  }, [fetchPreview]);

  // Tandai satu dibaca langsung dari preview
  const markRead = useCallback(async (id: number) => {
    setPreview(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    await fetch(`${API}/notifications/me/${id}/read`, { method: "PATCH", credentials: "include" });
  }, []);

  return { preview, unreadCount, loading, refresh: fetchPreview, markRead };
}