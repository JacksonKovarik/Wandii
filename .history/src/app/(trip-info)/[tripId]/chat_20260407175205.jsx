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
      
      {/* MAIN CONTENT MUST HAVE flex: 1 */}
      <View style={styles.chatArea}>
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
      </View>

      {/* THIS BAR WILL NOW STRETCH FULL WIDTH AT THE BOTTOM */}
      <View style={styles.bottomBar}>
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

  chatArea: {
    flex: 1,               // ⭐ THIS is the missing piece
  },

  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
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

  bottomBar: {
    width: "100%",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
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