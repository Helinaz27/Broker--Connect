// app/dashboard/_layout.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useTheme } from "../../hooks/useTheme";

const { width: SCREEN_W } = Dimensions.get("window");
const DRAWER_W = Math.min(300, SCREEN_W * 0.82);

type NavItem = {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
  section: string;
};

const NAV: NavItem[] = [
  {
    label: "Overview",
    icon: "grid-outline",
    route: "/dashboard",
    section: "main",
  },
  {
    label: "My Listings",
    icon: "list-outline",
    route: "/dashboard/my-listings",
    section: "listings",
  },
  {
    label: "Post House",
    icon: "home-outline",
    route: "/dashboard/create-house",
    section: "listings",
  },
  {
    label: "Post Car",
    icon: "car-outline",
    route: "/dashboard/create-car",
    section: "listings",
  },
  {
    label: "Post Service",
    icon: "construct-outline",
    route: "/dashboard/create-service",
    section: "listings",
  },
  {
    label: "Edit Profile",
    icon: "person-outline",
    route: "/profile",
    section: "account",
  },
  {
    label: "Change Password",
    icon: "lock-closed-outline",
    route: "/profile",
    section: "account",
  },
  {
    label: "KYC Verification",
    icon: "shield-checkmark-outline",
    route: "/kyc",
    section: "account",
  },
  {
    label: "Messages",
    icon: "chatbubbles-outline",
    route: "/chat",
    section: "account",
  },
  {
    label: "KYC Requests",
    icon: "shield-outline",
    route: "/dashboard/admin-kyc",
    section: "admin",
    adminOnly: true,
  },
  {
    label: "Users",
    icon: "people-outline",
    route: "/dashboard/admin-users",
    section: "admin",
    adminOnly: true,
  },
  {
    label: "Platform Fees",
    icon: "cash-outline",
    route: "/dashboard/admin-fees",
    section: "admin",
    adminOnly: true,
  },
];

const SECTIONS = [
  { key: "main", label: "Dashboard" },
  { key: "listings", label: "My Listings" },
  { key: "account", label: "Account" },
  { key: "admin", label: "Admin Console" },
];

export default function DashboardLayout() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useSelector((st: RootState) => st.user.currentUser);
  const isAdmin = currentUser?.roles?.includes("admin") ?? false;
  const isKYCVerified = currentUser?.isKYCVerified ?? false;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-DRAWER_W))[0];

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 14,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_W,
      useNativeDriver: true,
      duration: 220,
    }).start(() => setDrawerOpen(false));
  };

  const navigate = (route: string) => {
    closeDrawer();
    setTimeout(() => router.push(route as any), 240);
  };

  // ── KYC Guard ──────────────────────────────────────────────────────────────
  // Admin always has full access. Regular users need KYC approved.
  if (!isAdmin && !isKYCVerified) {
    return (
      <SafeAreaView
        style={[
          s.root,
          { justifyContent: "center", alignItems: "center", padding: 32 },
        ]}
      >
        <View
          style={[
            s.kycGate,
            { backgroundColor: t.card, borderColor: t.border },
          ]}
        >
          <View style={[s.kycGateIcon, { backgroundColor: `${t.warning}15` }]}>
            <Ionicons name="shield-outline" size={40} color={t.warning} />
          </View>
          <Text style={[s.kycGateTitle, { color: t.text }]}>KYC Required</Text>
          <Text style={[s.kycGateDesc, { color: t.textMuted }]}>
            You need to complete KYC verification before accessing the
            dashboard. This helps us keep the platform safe and trustworthy.
          </Text>
          <TouchableOpacity
            style={[s.kycGateBtn, { backgroundColor: t.primary }]}
            onPress={() => router.push("/kyc" as any)}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
            <Text style={s.kycGateBtnText}>Verify My Identity</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.kycGateBack} onPress={() => router.back()}>
            <Text style={[s.kycGateBackText, { color: t.textMuted }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const visibleNav = NAV.filter((item) => !item.adminOnly || isAdmin);
  const visibleSections = SECTIONS.filter(
    (sec) => sec.key !== "admin" || isAdmin,
  );
  const pageTitle = NAV.find((n) => n.route === pathname)?.label ?? "Dashboard";

  return (
    <SafeAreaView style={s.root}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.menuBtn} onPress={openDrawer}>
          <Ionicons name="menu-outline" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={s.pageTitle}>{pageTitle}</Text>
        <TouchableOpacity
          style={s.menuBtn}
          onPress={() => router.push("/notifications" as any)}
        >
          <Ionicons name="notifications-outline" size={22} color={t.text} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* Drawer */}
      {drawerOpen && (
        <Modal transparent animationType="none" visible statusBarTranslucent>
          <TouchableOpacity
            style={s.backdrop}
            activeOpacity={1}
            onPress={closeDrawer}
          />
          <Animated.View
            style={[
              s.drawer,
              {
                backgroundColor: t.card,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <SafeAreaView style={{ flex: 1 }}>
              {/* Header */}
              <View style={[s.drawerHeader, { borderBottomColor: t.border }]}>
                <View style={[s.drawerAvatar, { backgroundColor: t.primary }]}>
                  <Text style={s.drawerAvatarText}>
                    {currentUser?.firstName?.[0]}
                    {currentUser?.lastName?.[0]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[s.drawerName, { color: t.text }]}
                    numberOfLines={1}
                  >
                    {currentUser?.firstName} {currentUser?.lastName}
                  </Text>
                  <Text
                    style={[s.drawerEmail, { color: t.textMuted }]}
                    numberOfLines={1}
                  >
                    {currentUser?.email}
                  </Text>
                  <View style={s.badgeRow}>
                    {isAdmin && (
                      <View style={[s.chip, { backgroundColor: t.primary }]}>
                        <Ionicons
                          name="shield-checkmark"
                          size={9}
                          color="#fff"
                        />
                        <Text style={s.chipText}>Admin</Text>
                      </View>
                    )}
                    {isKYCVerified && (
                      <View style={[s.chip, { backgroundColor: t.success }]}>
                        <Ionicons
                          name="checkmark-circle"
                          size={9}
                          color="#fff"
                        />
                        <Text style={s.chipText}>Verified</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={closeDrawer}
                  style={[s.closeBtn, { backgroundColor: t.inputBg }]}
                >
                  <Ionicons name="close" size={18} color={t.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Nav */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
              >
                {visibleSections.map((sec) => {
                  const items = visibleNav.filter((n) => n.section === sec.key);
                  if (!items.length) return null;
                  return (
                    <View key={sec.key} style={s.navSection}>
                      <Text style={[s.sectionLabel, { color: t.textMuted }]}>
                        {sec.label}
                      </Text>
                      {items.map((item) => {
                        const isActive = pathname === item.route;
                        return (
                          <TouchableOpacity
                            key={item.route}
                            style={[
                              s.navItem,
                              isActive && { backgroundColor: `${t.primary}12` },
                            ]}
                            onPress={() => navigate(item.route)}
                          >
                            <View
                              style={[
                                s.navIconWrap,
                                {
                                  backgroundColor: isActive
                                    ? `${t.primary}20`
                                    : t.inputBg,
                                },
                              ]}
                            >
                              <Ionicons
                                name={item.icon as any}
                                size={18}
                                color={isActive ? t.primary : t.textMuted}
                              />
                            </View>
                            <Text
                              style={[
                                s.navLabel,
                                { color: isActive ? t.primary : t.textMuted },
                                isActive && { fontWeight: "700" },
                              ]}
                            >
                              {item.label}
                            </Text>
                            {isActive && (
                              <View
                                style={[
                                  s.activeIndicator,
                                  { backgroundColor: t.primary },
                                ]}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}
                <View style={{ height: 40 }} />
              </ScrollView>

              {/* Coins bar */}
              <View
                style={[
                  s.coinsBar,
                  {
                    backgroundColor: `${t.primary}10`,
                    borderColor: `${t.primary}20`,
                  },
                ]}
              >
                <Ionicons name="logo-bitcoin" size={18} color={t.primary} />
                <Text style={[s.coinsLabel, { color: t.primary }]}>
                  {(currentUser?.coins ?? 0).toLocaleString()} coins
                </Text>
                <TouchableOpacity
                  style={[s.buyCoinsBtn, { backgroundColor: t.primary }]}
                  onPress={() => navigate("/(tabs)/coins")}
                >
                  <Text style={s.buyCoinsText}>Buy</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Animated.View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      backgroundColor: t.card,
    },
    menuBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    pageTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700",
      color: t.text,
    },
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    drawer: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: DRAWER_W,
      shadowColor: "#000",
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 20,
    },
    drawerHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 20,
      paddingTop: 24,
      borderBottomWidth: 1,
    },
    drawerAvatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
    },
    drawerAvatarText: { color: "#fff", fontSize: 16, fontWeight: "800" },
    drawerName: { fontSize: 14, fontWeight: "700" },
    drawerEmail: { fontSize: 11, marginTop: 1 },
    badgeRow: { flexDirection: "row", gap: 5, marginTop: 5 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    chipText: {
      color: "#fff",
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.4,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    navSection: { paddingTop: 20, paddingHorizontal: 12 },
    sectionLabel: {
      fontSize: 9,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2,
      paddingHorizontal: 8,
      marginBottom: 6,
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 10,
      borderRadius: 12,
      marginBottom: 2,
    },
    navIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    navLabel: { flex: 1, fontSize: 14, fontWeight: "500" },
    activeIndicator: { width: 6, height: 6, borderRadius: 3 },
    coinsBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      margin: 16,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
    },
    coinsLabel: { flex: 1, fontSize: 14, fontWeight: "700" },
    buyCoinsBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
    buyCoinsText: { color: "#fff", fontSize: 12, fontWeight: "800" },

    // KYC gate
    kycGate: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 28,
      alignItems: "center",
      gap: 14,
      width: "100%",
    },
    kycGateIcon: {
      width: 80,
      height: 80,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    kycGateTitle: { fontSize: 22, fontWeight: "800", textAlign: "center" },
    kycGateDesc: { fontSize: 14, lineHeight: 22, textAlign: "center" },
    kycGateBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 24,
      marginTop: 4,
    },
    kycGateBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    kycGateBack: { paddingVertical: 8 },
    kycGateBackText: { fontSize: 14, fontWeight: "600" },
  });
}
