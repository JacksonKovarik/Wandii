import { Colors } from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Chat() {
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([
    { id: "1", text: "Welcome to the trip chat!", sender: "system" },
    { id: "2", text: "Feel free to drop updates here.", sender: "system" },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "me",
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === "me";

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myBubble : styles.theirBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trip Chat</Text>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom || 12 }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <MaterialIcons name="send" size={22} color="white" />
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: Colors.orange || "#FF8820",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },

  messagesContainer: {
    padding: 20,
    paddingBottom: 120,
    gap: 12,
  },

  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },

  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.orange || "#FF8820",
  },

  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1E293B",
  },

  messageText: {
    color: "white",
    fontSize: 15,
  },

  inputBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#E5E7EB",
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
  },

  input: {
    flex: 1,
    height: 42,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#111827",
    fontSize: 15,
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: Colors.orange || "#FF8820",
    padding: 10,
    borderRadius: 10,
  },
});