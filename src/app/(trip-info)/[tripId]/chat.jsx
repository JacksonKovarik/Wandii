"use client";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// 1 hour in milliseconds
const ONE_HOUR_MS = 60 * 60 * 1000;

const shouldShowTimestamp = (currentMessage, previousMessage) => {
  // Always show on the very first message
  if (!previousMessage) return true; 

  // Make sure you are pulling 'created_at' from your Supabase query!
  const currentTime = new Date(currentMessage.created_at).getTime();
  const prevTime = new Date(previousMessage.created_at).getTime();

  return (currentTime - prevTime) > ONE_HOUR_MS;
};

const formatChatTimestamp = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  
  // Format example: "Today 1:50 PM" or "Sun, 1:50 PM"
  // For a simpler version, we'll just do "Jan 12, 1:50 PM"
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit' 
  });
};

const formatTimeOnly = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit' 
  });
};

export default function Chat() {
  const router = useRouter();
  const { tripId } = useTrip();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("Messages")
          .select("*, Users(first_name)")
          .eq("trip_id", tripId)
          .order("sent_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          return;
        }
        setMessages(data);
      } catch (err) {
        console.error("Unexpected error fetching messages:", err);
      }
    };

    fetchMessages();

    // 2. Set up the Real-time Listener
    const channel = supabase
      .channel(`chat_room_${tripId}`)
      .on(
        "postgres",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: `trip_id=eq.${tripId}`, // Only listen to messages for THIS trip
        },
        async (payload) => {
          // Ignore messages sent by ourselves (to avoid duplicates with Optimistic UI)
          if (payload.new.sender_id === user?.id) return;

          // Fetch the full message data so we get the sender's first_name
          const { data: fullMessage } = await supabase
            .from("Messages")
            .select("*, Users(first_name)")
            .eq("id", payload.new.id)
            .single();

          if (fullMessage) {
            setMessages((prev) => [...prev, fullMessage]);
          }
        }
      )
      .subscribe();

    // 3. Cleanup the listener when leaving the screen
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, user?.id]); // Added user?.id to dependencies

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || !user?.id) return;

    // 1. Clear input immediately so the UI feels instantly responsive
    setInput("");
    setInputHeight(40);

    const tempId = Date.now().toString();

    // 2. Optimistic UI update (shows the message instantly)
    setMessages(prev => [
      ...prev,
      { id: tempId, body: messageText, sender_id: user.id }, // Make sure these keys match how you render items in your FlatList
    ]);

    // 3. Insert into Supabase
    const { data, error } = await supabase
      .from("Messages")
      .insert({ 
        body: messageText, 
        sender_id: user.id, // Update this to match your actual column name
        trip_id: tripId,     // Assuming messages are tied to a specific trip/group
        sent_at: new Date().toISOString()
      })
      .select() // Add .select() to return the newly inserted row (with the real DB ID)
      .single();

    // 4. Handle the result
    if (error) {
      console.error("Error sending message:", error);
      // Optional: If it fails, remove the optimistic message so they know it didn't send
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      return;
    }

    // 5. Replace the temporary ID with the real database ID
    setMessages(prev =>
      prev.map(msg => (msg.id === tempId ? { ...msg, id: data.id } : msg))
    );
  };

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, e => {
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

  const handleClose = () => router.back()


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

          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Start the conversation…</Text>
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id || item.message_id || index.toString()}
            contentContainerStyle={styles.messagesContainer}

            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListFooterComponent={<View style={{ height: 100 }} />}
            renderItem={({ item, index }) => {
              const isMyMessage = item.sender_id === user?.id; 
              
              // Grab the previous message if it exists
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showTimestamp = shouldShowTimestamp(item, previousMessage);

              return (
                <View>
                  {/* Render the Timestamp Banner if the 1-hour condition is met */}
                  {showTimestamp && (
                    <Text style={styles.timestampBanner}>
                      {formatChatTimestamp(item.sent_at || new Date().toISOString())}
                    </Text>
                  )}

                  <View style={[
                    styles.messageWrapper, 
                    isMyMessage ? styles.myMessageWrapper : styles.theirMessageWrapper
                  ]}>
                    
                    {!isMyMessage && (
                      <Text style={styles.senderName}>
                        {item.Users.first_name || "Unknown"}
                      </Text>
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
                          isMyMessage ? { color: "#FFFFFF" } : { color: Colors.darkBlue },
                        ]}
                      >
                        {item.body}
                      </Text>
                    </View>
                    <Text style={[
                      styles.tinyTimestamp, 
                      isMyMessage ? { alignSelf: 'flex-end', marginRight: 4 } : { alignSelf: 'flex-start', marginLeft: 4 }
                    ]}>
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
            onContentSizeChange={e =>
              setInputHeight(Math.min(e.nativeEvent.contentSize.height, 120))
            }
          />

          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  chatArea: { flex: 1 },
  messagesContainer: { padding: 16 },

  customHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 12, paddingTop: 12, zIndex: 1 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Colors.darkBlue, zIndex: -1 },
  headerIconBtn: { padding: 4 },


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
    paddingVertical: 10,   // slightly smaller
    paddingHorizontal: 16, // slightly smaller
    borderRadius: 20,      // slightly smaller
  },

  myMessage: {
    backgroundColor: Colors.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 6,
  },

  theirMessage: {
    backgroundColor: Colors.background,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 6,
  },

  messageText: {
    color: "#000",
    fontSize: 17,   // slightly smaller
    lineHeight: 21,
  },

  messageWrapper: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end', // Aligns the whole block to the right
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start', // Aligns the whole block to the left
  },
  senderName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  myMessage: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4, // Gives that classic iMessage tail effect
  },
  theirMessage: {
    backgroundColor: Colors.background, // Usually a light gray
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
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
  timestampBanner: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondaryLight, // Use a very light gray/blue
    marginTop: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  tinyTimestamp: {
    fontSize: 10,
    color: Colors.textSecondaryLight,
  },
  sendIcon: { color: "white", fontSize: 20, marginLeft: 1 },
});