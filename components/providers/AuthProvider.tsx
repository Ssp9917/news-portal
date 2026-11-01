"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  isStaff?: boolean;
  preferences?: {
    language?: string;
    city?: string;
    state?: string;
    categories?: string[];
    notificationTypes?: {
      breaking: boolean;
      local: boolean;
      digest: boolean;
      marketing: boolean;
    };
    dailyDigest?: string;
  };
  bookmarks?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "signup" | "forgot";
  bookmarks: string[];
  openAuthModal: (tab?: "login" | "signup" | "forgot") => void;
  closeAuthModal: () => void;
  login: (userData: UserProfile) => void;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => void;
  toggleBookmark: (slugOrId: string) => Promise<boolean>;
  isBookmarked: (slugOrId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_BOOKMARKS_KEY = "bharat_pulse_guest_bookmarks";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup" | "forgot">("login");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // 1. Initial user check on mount
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user && isMounted) {
            setUser(data.user);
            setBookmarks(data.user.bookmarks || []);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Network or server error
      }

      // Guest fallback: load from localStorage
      if (typeof window !== "undefined" && isMounted) {
        try {
          const guest = localStorage.getItem(GUEST_BOOKMARKS_KEY);
          if (guest) setBookmarks(JSON.parse(guest));
        } catch {}
      }

      if (isMounted) setLoading(false);
    }

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const openAuthModal = useCallback((tab: "login" | "signup" | "forgot" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback((userData: UserProfile) => {
    setUser(userData);
    setBookmarks(userData.bookmarks || []);
    setIsAuthModalOpen(false);

    // Sync any guest bookmarks to the newly logged-in account
    if (typeof window !== "undefined") {
      try {
        const guest = localStorage.getItem(GUEST_BOOKMARKS_KEY);
        if (guest) {
          const guestList: string[] = JSON.parse(guest);
          guestList.forEach((slug) => {
            fetch("/api/user/bookmarks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ newsId: slug }),
            }).catch(() => {});
          });
          localStorage.removeItem(GUEST_BOOKMARKS_KEY);
        }
      } catch {}
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    setBookmarks([]);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  const updateUser = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const toggleBookmark = useCallback(
    async (slugOrId: string): Promise<boolean> => {
      const alreadySaved = bookmarks.includes(slugOrId);
      const nextBookmarks = alreadySaved
        ? bookmarks.filter((b) => b !== slugOrId)
        : [...bookmarks, slugOrId];

      setBookmarks(nextBookmarks);

      if (user) {
        try {
          await fetch("/api/user/bookmarks", {
            method: alreadySaved ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newsId: slugOrId }),
          });
        } catch (err) {
          console.error("Failed to sync bookmark:", err);
        }
      } else {
        // Save to guest localStorage
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(GUEST_BOOKMARKS_KEY, JSON.stringify(nextBookmarks));
          } catch {}
        }
      }

      return !alreadySaved;
    },
    [bookmarks, user]
  );

  const isBookmarked = useCallback(
    (slugOrId: string) => bookmarks.includes(slugOrId),
    [bookmarks]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authModalTab,
        bookmarks,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        updateUser,
        toggleBookmark,
        isBookmarked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

