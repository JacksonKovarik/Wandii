import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
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

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input, sender: "me" },
    ]);

    setInput("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
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

      {/* Input Bar */}
      <SafeAreaView style={styles.inputWrapper}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const ORANGE = "#FF8820";
const LIGHT_GRAY = "#E5E5E5";
const BG = "#F7F7F7";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  messagesContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  myMessage: {
    backgroundColor: ORANGE,
    alignSelf: "flex-end",
  },

  theirMessage: {
    backgroundColor: LIGHT_GRAY,
    alignSelf: "flex-start",
  },

  messageText: {
    color: "#000",
  },

  inputWrapper: {
    backgroundColor: "white",
  },

  inputBar: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "white",
  },

  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
  },

  sendButton: {
    marginLeft: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },

  sendIcon: {
    color: "white",
    fontSize: 18,
    marginLeft: 1,
  },
});