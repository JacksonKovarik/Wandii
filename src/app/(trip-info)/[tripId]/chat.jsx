"use client";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { useTripDashboard } from "@/src/hooks/useTripDashboard";
import { supabase } from "@/src/lib/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// --- Helpers (unchanged) ---
const ONE_HOUR_MS = 60 * 60 * 1000;

const shouldShowTimestamp = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;
  const currentTime = new Date(currentMessage.sent_at).getTime();
  const prevTime = new Date(previousMessage.sent_at).getTime();
  if (!Number.isFinite(currentTime) || !Number.isFinite(prevTime)) return true;
  return currentTime - prevTime > ONE_HOUR_MS;
};

const formatChatTimestamp = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatTimeOnly = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getSenderName = (sender) => {
  if (!sender) return "Traveler";
  const fullName = [sender.first_name, sender.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || sender.username || "Traveler";
};

export default function Chat() {
  const router = useRouter();
  const { tripId } = useTripDashboard();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const flatListRef = useRef(null);

  // --- Data fetching ---
  const fetchMessages = useCallback(async () => {
    if (!tripId) return;
    try {
      const { data, error } = await supabase
        .from("Messages")
        .select(
          "message_id, sender_id, body, sent_at, Users(first_name, last_name, username, avatar_url)"
        )
        .eq("trip_id", tripId)
        .order("sent_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // --- Realtime subscription ---
  useEffect(() => {
    if (!tripId) return;
    const channel = supabase
      .channel(`trip-chat-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: `trip_id=eq.${tripId}`,
        },
        fetchMessages
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, tripId]);

  // --- Send message ---
  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || !user?.id || !tripId || sending) return;

    try {
      setSending(true);
      setInput("");
      setInputHeight(40);

      const { error } = await supabase.from("Messages").insert({
        body: messageText,
        sender_id: user.id,
        trip_id: tripId,
      });

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      setInput(messageText); // restore on failure
    } finally {
      setSending(false);
    }
  };

  // --- Keyboard listeners for scroll behavior ---
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // --- Auto-scroll when messages change or keyboard appears ---
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  useEffect(() => {
    if (isKeyboardVisible) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [isKeyboardVisible]);

  const handleClose = () => router.back();
  const isMultiline = inputHeight > 40;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={handleClose}>
          <MaterialIcons name="close" size={24} color={Colors.darkBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerIconBtn} />
      </View>

      {/* Chat area with keyboard avoiding */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Message list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) =>
            item.message_id?.toString?.() || index.toString()
          }
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Start the conversation…</Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            const isMyMessage = item.sender_id === user?.id;
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const showTimestamp = shouldShowTimestamp(item, previousMessage);
            const senderName = getSenderName(item.Users);

            return (
              <View>
                {showTimestamp && (
                  <Text style={styles.timestampBanner}>
                    {formatChatTimestamp(item.sent_at)}
                  </Text>
                )}

                <View
                  style={[
                    styles.messageWrapper,
                    isMyMessage
                      ? styles.myMessageWrapper
                      : styles.theirMessageWrapper,
                  ]}
                >
                  {!isMyMessage && (
                    <Text style={styles.senderName}>{senderName}</Text>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isMyMessage ? styles.myMessage : styles.theirMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMyMessage
                          ? styles.myMessageText
                          : styles.theirMessageText,
                      ]}
                    >
                      {item.body}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.tinyTimestamp,
                      isMyMessage
                        ? { alignSelf: "flex-end", marginRight: 4 }
                        : { alignSelf: "flex-start", marginLeft: 4 },
                    ]}
                  >
                    {formatTimeOnly(item.sent_at)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={[
              styles.input,
              {
                height: Math.max(40, inputHeight),
                textAlignVertical: isMultiline ? "top" : "center",
                paddingTop: isMultiline ? 10 : 0,
                paddingBottom: isMultiline ? 10 : 0,
              },
            ]}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
            multiline
            onContentSizeChange={(e) =>
              setInputHeight(Math.min(e.nativeEvent.contentSize.height, 120))
            }
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendIcon}>{sending ? "…" : "➤"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  headerIconBtn: {
    padding: 4,
    width: 32, // ensure consistent spacing
    alignItems: "center",
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "#bbb",
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  myMessageWrapper: {
    alignSelf: "flex-end",
  },
  theirMessageWrapper: {
    alignSelf: "flex-start",
  },
  senderName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
  messageBubble: {
    maxWidth: "100%",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  myMessage: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: Colors.darkBlue,
  },
  tinyTimestamp: {
    fontSize: 10,
    color: Colors.textSecondaryLight,
    marginTop: 2,
  },
  timestampBanner: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textSecondaryLight,
    marginVertical: 12,
    fontWeight: "500",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    color: "#fff",
    fontSize: 20,
    marginLeft: 1,
  },
});