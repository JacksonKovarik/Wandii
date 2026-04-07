"use client";

import { useState } from "react";
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

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text: input, sender: "me" },
    ]);

    setInput("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.container}>
        
        <View style={styles.chatArea}>
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesContainer}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender === "me" ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === "me" && { color: "white" },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            )}
          />
        </View>

        {/* ⭐ FLOATING LIGHT ORANGE INPUT BAR */}
        <View style={styles.bottomBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#777"
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const ORANGE = "#FF8820";
const LIGHT_GRAY = "#E5E5E5";
const BG = "#F7F7F7";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  chatArea: { flex: 1 },

  messagesContainer: { padding: 16, paddingBottom: 100 },

  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  myMessage: { backgroundColor: ORANGE, alignSelf: "flex-end" },

  theirMessage: { backgroundColor: LIGHT_GRAY, alignSelf: "flex-start" },

  messageText: { color: "#000" },

  
  bottomBar: {
    position: "absolute",
    bottom: 30,
    left: 10,
    right: 10,

    backgroundColor: "rgba(255, 136, 32, 0.1)", 
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 10,

    flexDirection: "row",
    alignItems: "center",

  
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
    paddingVertical: 6,
    fontSize: 16,
  },

  sendButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },

  sendIcon: { color: "white", fontSize: 20, marginLeft: 1 },
});