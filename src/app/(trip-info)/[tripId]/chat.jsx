"use client";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { useTrip } from "@/src/utils/TripContext";
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

const ONE_HOUR_MS = 60 * 60 * 1000;

const shouldShowTimestamp = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;

  const currentTime = new Date(currentMessage.sent_at).getTime();
  const prevTime = new Date(previousMessage.sent_at).getTime();

  if (!Number.isFinite(currentTime) || !Number.isFinite(prevTime)) {
    return true;
  }

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

  const fullName = [sender.first_name, sender.last_name].filter(Boolean).join(" ").trim();
  return fullName || sender.username || "Traveler";
};

export default function Chat() {
  const router = useRouter();
  const { tripId } = useTrip();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!tripId) return;

    try {
      const { data, error } = await supabase
        .from("Messages")
        .select("message_id, sender_id, body, sent_at, Users(first_name, last_name, username, avatar_url)")
        .eq("trip_id", tripId)
        .order("sent_at", { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (err) {
      console.error("Unexpected error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!tripId) return undefined;

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
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, tripId]);

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

      if (error) {
        throw error;
      }

      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      setInput(messageText);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomPosition = keyboardHeight > 0 ? keyboardHeight + 8 : 45;
  const isMultiline = inputHeight > 40;

  const handleClose = () => router.back();

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={handleClose}>
          <MaterialIcons name="close" size={24} color={Colors.darkBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.chatArea}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : null}

          {!loading && messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Start the conversation…</Text>
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) =>
              item.message_id?.toString?.() || index.toString()
            }
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListFooterComponent={<View style={{ height: 100 }} />}
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
                      isMyMessage ? styles.myMessageWrapper : styles.theirMessageWrapper,
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
                          isMyMessage ? styles.myMessageText : styles.theirMessageText,
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
        </View>

        <View style={[styles.bottomBar, { bottom: bottomPosition }]}>
          <TextInput
            style={[
              styles.input,
              {
                height: inputHeight,
                textAlignVertical: isMultiline ? "top" : "center",
                paddingTop: isMultiline ? 6 : 10,
                paddingBottom: isMultiline ? 6 : 10,
              },
            ]}
            placeholder="Type a message..."
            placeholderTextColor="#555"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  chatArea: { flex: 1 },
  messagesContainer: { padding: 16 },

  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 12,
    zIndex: 1,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: Colors.darkBlue,
    zIndex: -1,
  },
  headerIconBtn: { padding: 4 },

  loadingState: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },

  emptyState: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },

  emptyText: {
    color: "#bbb",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },

  messageBubble: {
    maxWidth: "85%",
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

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },

  myMessageText: {
    color: "#FFFFFF",
  },

  theirMessageText: {
    color: Colors.darkBlue,
  },

  bottomBar: {
    position: "absolute",
    left: 15,
    right: 15,
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "flex-end",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  input: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#000",
  },

  sendButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  sendButtonDisabled: {
    opacity: 0.55,
  },

  timestampBanner: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textSecondaryLight,
    marginTop: 16,
    marginBottom: 12,
    fontWeight: "500",
  },

  tinyTimestamp: {
    fontSize: 10,
    color: Colors.textSecondaryLight,
  },

  sendIcon: {
    color: "white",
    fontSize: 20,
    marginLeft: 1,
  },
});
