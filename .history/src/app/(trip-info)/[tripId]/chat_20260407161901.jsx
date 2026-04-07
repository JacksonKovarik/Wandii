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
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trip Chat</Text>
        </View>

        <View style={{ flex: 1 }}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.inputBar}>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
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