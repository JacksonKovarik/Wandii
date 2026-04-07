"use client";

import { useEffect, useState } from "react";
import {
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

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text: input, sender: "me" },
    ]);

    setInput("");
    setInputHeight(40);
    Keyboard.dismiss();
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        <View style={styles.chatArea}>

          {/* EMPTY STATE MESSAGE */}
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Start the conversation…</Text>
            </View>
          )}

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
      </View>
    </KeyboardAvoidingView>
  );
}

const ORANGE = "#FF8820";
const BG = "#F7F7F7";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  chatArea: { flex: 1 },
  messagesContainer: { padding: 16, paddingBottom: 100 },

  emptyState: {
    position: "absolute",
    top: "40%",          // centers vertically
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },

  emptyText: {
    color: "#bbb",
    fontSize: 22,        // bigger text
    fontWeight: "600",
    textAlign: "center",
  },

  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 10,
  },

  myMessage: {
    backgroundColor: ORANGE,
    alignSelf: "flex-end",
    borderBottomRightRadius: 6,
  },

  theirMessage: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 6,
  },

  messageText: { color: "#000" },

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
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },

  sendIcon: { color: "white", fontSize: 20, marginLeft: 1 },
});