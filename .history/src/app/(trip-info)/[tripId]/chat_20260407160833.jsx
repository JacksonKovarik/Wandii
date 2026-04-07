import { Colors } from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <MaterialIcons name="send" size={22} color="white" />
        </TouchableOpacity>
      </View>

    </View>
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
    paddingBottom: 80,
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
    paddingVertical: 12,
    backgroundColor: "#0A0F1A",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },

  input: {
    flex: 1,
    height: 42,
    backgroundColor: "#1A2233",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "white",
    fontSize: 15,
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: Colors.orange || "#FF8820",
    padding: 10,
    borderRadius: 10,
  },
});