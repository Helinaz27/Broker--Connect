import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  useGetCoinBalanceQuery,
  useGetMyPaymentsQuery,
  useGetMyTransactionsQuery,
} from "../../store/apis/paymentApi";
import { useTheme } from "../../hooks/useTheme";
import { API_BASE_URL } from "../../constants/api";

const PACKAGES = [
  { coins: 50, label: "Starter", popular: false },
  { coins: 100, label: "Basic", popular: false },
  { coins: 250, label: "Popular", popular: true },
  { coins: 500, label: "Pro", popular: false },
];

export default function CoinsScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const token = useSelector((s: RootState) => s.user.token);
  const currentUser = useSelector((s: RootState) => s.user.currentUser);

  const [selected, setSelected] = useState(100);
  const [custom, setCustom] = useState("");
  const [buying, setBuying] = useState(false);
  const [activeTab, setActiveTab] = useState<"buy" | "history">("buy");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: balanceData,
    refetch: refetchBalance,
    isLoading: balanceLoading,
  } = useGetCoinBalanceQuery(undefined, { skip: !token });

  const {
    data: paymentsData,
    refetch: refetchPayments,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useGetMyPaymentsQuery(
    { page: 1, limit: 20 },
    {
      skip: !token || activeTab !== "history",
      refetchOnMountOrArgChange: true,
    },
  );

  const {
    data: txData,
    refetch: refetchTx,
    isLoading: txLoading,
    error: txError,
  } = useGetMyTransactionsQuery(
    { page: 1, limit: 20 },
    {
      skip: !token || activeTab !== "history",
      refetchOnMountOrArgChange: true,
    },
  );

  const coins = balanceData?.data?.coins ?? currentUser?.coins ?? 0;
  const payments = paymentsData?.data?.payments ?? [];
  const transactions = txData?.data?.transactions ?? [];

  const amount = custom ? parseInt(custom) || 0 : selected;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBalance(), refetchPayments(), refetchTx()]);
    setRefreshing(false);
  };

  const handleBuy = async () => {
    if (amount < 1) {
      Alert.alert("Invalid", "Please enter a valid coin amount.");
      return;
    }
    setBuying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coinsRequested: amount }),
      });
      const json = await res.json();
      if (json?.data?.checkout_url) {
        Linking.openURL(json.data.checkout_url);
      } else {
        Alert.alert("Error", json?.message ?? "Payment initiation failed.");
      }
    } catch {
      Alert.alert("Error", "Could not connect to payment gateway.");
    } finally {
      setBuying(false);
    }
  };

  const statusColor = (status: string) =>
    status === "success"
      ? t.success
      : status === "failed"
        ? t.destructive
        : t.warning;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Coins & Payments</Text>
      </View>

      <View style={s.balanceCard}>
        <View style={s.balanceLeft}>
          <Text style={s.balanceLabel}>Your Balance</Text>
          {balanceLoading ? (
            <ActivityIndicator
              color="#fff"
              size="small"
              style={{ marginVertical: 8 }}
            />
          ) : (
            <>
              <Text style={s.balanceValue}>{coins.toLocaleString()}</Text>
              <Text style={s.balanceSub}>coins</Text>
            </>
          )}
        </View>
        <View style={s.coinIcon}>
          <Ionicons
            name="logo-bitcoin"
            size={40}
            color="rgba(255,255,255,0.6)"
          />
        </View>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, activeTab === "buy" && s.tabActive]}
          onPress={() => setActiveTab("buy")}
        >
          <Ionicons
            name="cart-outline"
            size={15}
            color={activeTab === "buy" ? "#fff" : t.textMuted}
          />
          <Text style={[s.tabText, activeTab === "buy" && s.tabTextActive]}>
            Buy Coins
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, activeTab === "history" && s.tabActive]}
          onPress={() => setActiveTab("history")}
        >
          <Ionicons
            name="time-outline"
            size={15}
            color={activeTab === "history" ? "#fff" : t.textMuted}
          />
          <Text style={[s.tabText, activeTab === "history" && s.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.primary}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {activeTab === "buy" ? (
          <>
            <Text style={s.sectionLabel}>Choose Package</Text>
            <View style={s.packages}>
              {PACKAGES.map((pkg) => (
                <TouchableOpacity
                  key={pkg.coins}
                  style={[
                    s.pkg,
                    selected === pkg.coins && !custom && s.pkgActive,
                  ]}
                  onPress={() => {
                    setSelected(pkg.coins);
                    setCustom("");
                  }}
                >
                  {pkg.popular && (
                    <View style={s.popularBadge}>
                      <Text style={s.popularText}>Popular</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      s.pkgCoins,
                      selected === pkg.coins && !custom && { color: t.primary },
                    ]}
                  >
                    {pkg.coins}
                  </Text>
                  <Text
                    style={[
                      s.pkgLabel,
                      selected === pkg.coins && !custom && { color: t.primary },
                    ]}
                  >
                    {pkg.label}
                  </Text>
                  <Text
                    style={[
                      s.pkgPrice,
                      selected === pkg.coins && !custom && { color: t.primary },
                    ]}
                  >
                    {pkg.coins} ETB
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sectionLabel}>Or Custom Amount</Text>
            <View style={[s.customInput, custom ? s.customInputActive : null]}>
              <Ionicons
                name="logo-bitcoin"
                size={18}
                color={custom ? t.primary : t.textMuted}
              />
              <TextInput
                style={[
                  s.customInputText,
                  { flex: 1, color: custom ? t.text : t.textMuted },
                ]}
                placeholder="Type amount..."
                placeholderTextColor={t.textMuted}
                keyboardType="numeric"
                value={custom}
                onChangeText={setCustom}
              />
            </View>
            <View style={s.stepper}>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() =>
                  setCustom(String(Math.max(1, (parseInt(custom) || 0) - 10)))
                }
              >
                <Ionicons name="remove" size={20} color={t.primary} />
              </TouchableOpacity>
              <Text style={s.stepValue}>{custom || "—"}</Text>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => setCustom(String((parseInt(custom) || 0) + 10))}
              >
                <Ionicons name="add" size={20} color={t.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.stepClear}
                onPress={() => setCustom("")}
              >
                <Text style={{ color: t.textMuted, fontSize: 12 }}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={s.summary}>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>You Pay</Text>
                <Text style={s.summaryValue}>{amount} ETB</Text>
              </View>
              <View
                style={[
                  s.summaryRow,
                  {
                    borderTopWidth: 1,
                    borderTopColor: t.border,
                    marginTop: 12,
                    paddingTop: 12,
                  },
                ]}
              >
                <Text style={s.summaryLabel}>You Get</Text>
                <Text
                  style={[s.summaryValue, { color: t.primary, fontSize: 22 }]}
                >
                  {amount} Coins
                </Text>
              </View>
              <Text style={s.summaryRate}>
                1 coin = 1 ETB · Powered by Chapa
              </Text>
            </View>

            <TouchableOpacity
              style={[s.buyBtn, (buying || amount < 1) && { opacity: 0.55 }]}
              onPress={handleBuy}
              disabled={buying || amount < 1}
            >
              {buying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={18} color="#fff" />
                  <Text style={s.buyBtnText}>Proceed to Payment</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={s.chapaNoteText}>
              Secure payment via Chapa · Opens browser to complete
            </Text>
          </>
        ) : (
          <>
            <Text style={s.sectionLabel}>Payment History</Text>
            {paymentsLoading ? (
              <ActivityIndicator
                color={t.primary}
                style={{ marginVertical: 24 }}
              />
            ) : paymentsError ? (
              <ErrorState
                message="Could not load payment history. Pull down to retry."
                t={t}
              />
            ) : payments.length === 0 ? (
              <EmptyState
                icon="card-outline"
                title="No payments yet"
                sub="Purchase coins to see history here."
                t={t}
              />
            ) : (
              <View style={s.card}>
                {payments.map((p, i) => (
                  <View
                    key={p.id}
                    style={[
                      s.historyRow,
                      i < payments.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: t.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.historyIcon,
                        { backgroundColor: `${statusColor(p.status)}15` },
                      ]}
                    >
                      <Ionicons
                        name="card-outline"
                        size={18}
                        color={statusColor(p.status)}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.historyTitle}>
                        +{p.coinsReceived} coins
                      </Text>
                      <Text style={s.historySub}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[s.historyAmount, { color: t.text }]}>
                        {p.amountBirr} ETB
                      </Text>
                      <View
                        style={[
                          s.statusBadge,
                          { backgroundColor: `${statusColor(p.status)}15` },
                        ]}
                      >
                        <Text
                          style={[
                            s.statusText,
                            { color: statusColor(p.status) },
                          ]}
                        >
                          {p.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Text style={[s.sectionLabel, { marginTop: 24 }]}>
              Coin Transactions
            </Text>
            {txLoading ? (
              <ActivityIndicator
                color={t.primary}
                style={{ marginVertical: 24 }}
              />
            ) : txError ? (
              <ErrorState
                message="Could not load coin transactions. Pull down to retry."
                t={t}
              />
            ) : transactions.length === 0 ? (
              <EmptyState
                icon="logo-bitcoin"
                title="No transactions yet"
                sub="Coins spent on listings will appear here."
                t={t}
              />
            ) : (
              <View style={s.card}>
                {transactions.map((tx, i) => (
                  <View
                    key={tx.id}
                    style={[
                      s.historyRow,
                      i < transactions.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: t.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.historyIcon,
                        { backgroundColor: `${t.primary}15` },
                      ]}
                    >
                      <Ionicons
                        name="logo-bitcoin"
                        size={18}
                        color={t.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.historyTitle}>
                        {tx.type === "credit"
                          ? "Coins Purchased"
                          : tx.type === "debit"
                            ? "Coins Spent"
                            : (tx.type ?? "Transaction")}
                      </Text>
                      <Text style={s.historySub}>
                        {tx.description
                          ? tx.description.length > 40
                            ? tx.description.substring(0, 40) + "..."
                            : tx.description
                          : new Date(tx.createdAt).toLocaleDateString()}
                      </Text>
                      <Text style={[s.historySub, { marginTop: 1 }]}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text
                      style={[
                        s.historyAmount,
                        {
                          color:
                            tx.type === "credit" ? t.success : t.destructive,
                        },
                      ]}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                      {Math.abs(tx.amount)} coins
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({ icon, title, sub, t }: any) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 32, gap: 8 }}>
      <Ionicons name={icon} size={40} color={t.textMuted} />
      <Text style={{ fontSize: 15, fontWeight: "600", color: t.text }}>
        {title}
      </Text>
      <Text style={{ fontSize: 13, color: t.textMuted, textAlign: "center" }}>
        {sub}
      </Text>
    </View>
  );
}

function ErrorState({ message, t }: any) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 24, gap: 8 }}>
      <Ionicons name="alert-circle-outline" size={36} color={t.destructive} />
      <Text style={{ fontSize: 13, color: t.textMuted, textAlign: "center" }}>
        {message}
      </Text>
    </View>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
    headerTitle: { fontSize: 26, fontWeight: "800", color: t.text },
    balanceCard: {
      marginHorizontal: 16,
      borderRadius: 20,
      backgroundColor: t.primary,
      padding: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    balanceLeft: {},
    balanceLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.75)",
      fontWeight: "600",
      marginBottom: 6,
    },
    balanceValue: {
      fontSize: 48,
      fontWeight: "900",
      color: "#fff",
      lineHeight: 52,
    },
    balanceSub: {
      fontSize: 14,
      color: "rgba(255,255,255,0.7)",
      fontWeight: "600",
    },
    coinIcon: {},
    tabs: {
      flexDirection: "row",
      marginHorizontal: 16,
      marginBottom: 4,
      gap: 8,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    tabActive: { backgroundColor: t.primary, borderColor: t.primary },
    tabText: { fontSize: 13, fontWeight: "700", color: t.textMuted },
    tabTextActive: { color: "#fff" },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: t.textMuted,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    packages: { flexDirection: "row", gap: 10, marginBottom: 20 },
    pkg: {
      flex: 1,
      backgroundColor: t.card,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: t.border,
      padding: 12,
      alignItems: "center",
      gap: 4,
      position: "relative",
      overflow: "hidden",
    },
    pkgActive: { borderColor: t.primary, backgroundColor: `${t.primary}0D` },
    pkgCoins: { fontSize: 22, fontWeight: "900", color: t.text },
    pkgLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: t.textMuted,
      textTransform: "uppercase",
    },
    pkgPrice: { fontSize: 11, fontWeight: "600", color: t.textMuted },
    popularBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      backgroundColor: t.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderBottomLeftRadius: 8,
    },
    popularText: {
      fontSize: 8,
      fontWeight: "800",
      color: "#fff",
      textTransform: "uppercase",
    },
    customInput: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: t.inputBg,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1.5,
      borderColor: t.border,
      marginBottom: 10,
    },
    customInputActive: { borderColor: t.primary },
    customInputText: { fontSize: 15 },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 20,
    },
    stepBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: `${t.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${t.primary}30`,
    },
    stepValue: {
      flex: 1,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "700",
      color: t.text,
    },
    stepClear: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    summary: {
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      padding: 18,
      marginBottom: 20,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: { fontSize: 13, fontWeight: "600", color: t.textMuted },
    summaryValue: { fontSize: 18, fontWeight: "800", color: t.text },
    summaryRate: {
      fontSize: 11,
      color: t.textMuted,
      marginTop: 12,
      textAlign: "center",
    },
    buyBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: t.primary,
      borderRadius: 16,
      paddingVertical: 16,
      marginBottom: 8,
    },
    buyBtnText: {
      fontSize: 15,
      fontWeight: "800",
      color: "#fff",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    chapaNoteText: {
      fontSize: 11,
      color: t.textMuted,
      textAlign: "center",
      marginBottom: 16,
    },
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      overflow: "hidden",
    },
    historyRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    historyIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    historyTitle: { fontSize: 14, fontWeight: "600", color: t.text },
    historySub: { fontSize: 12, color: t.textMuted, marginTop: 2 },
    historyAmount: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    statusText: {
      fontSize: 10,
      fontWeight: "700",
      textTransform: "capitalize",
    },
  });
}
