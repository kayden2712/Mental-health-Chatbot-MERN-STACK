import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { API_ENDPOINTS } from '@/constants/api';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  role: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

const { width } = Dimensions.get('window');

export default function Chatbot() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatHistory]);

  // Typing animation
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isLoading]);

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      message: currentInput,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      const response = await fetch(API_ENDPOINTS.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: currentInput }),
      });

      const data = await response.json();
      const botMessage: Message = {
        role: 'bot',
        message: data.response,
        timestamp: new Date(),
      };

      // Add bot message
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      const errorMessage: Message = {
        role: 'bot',
        message: 'Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderMessage = (item: Message, index: number) => {
    const isUser = item.role === 'user';
    
    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {/* Bot Avatar */}
        {!isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.botAvatar}>
              <Text style={styles.avatarText}>🤖</Text>
            </View>
          </View>
        )}

        {/* Message Content */}
        <View style={styles.messageContent}>
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.botMessageText,
              ]}
            >
              {item.message}
            </Text>
          </View>
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>

        {/* User Avatar */}
        {isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    const dotOpacity = typingAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    return (
      <View style={[styles.messageContainer, styles.botMessageContainer]}>
        <View style={styles.avatarContainer}>
          <View style={styles.botAvatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
        </View>
        <View style={styles.typingIndicatorContainer}>
          <View style={styles.typingBubble}>
            <Animated.View style={[styles.typingDot, { opacity: dotOpacity }]} />
            <Animated.View
              style={[
                styles.typingDot,
                { opacity: dotOpacity, marginLeft: 4 },
              ]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                { opacity: dotOpacity, marginLeft: 4 },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#43cea2', '#185a9d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>💬</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>WellBot</Text>
            <Text style={styles.headerSubtitle}>Your Mental Health Companion</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Chat Area */}
      <View style={styles.chatContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatHistory}
          contentContainerStyle={styles.chatHistoryContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Message */}
          {chatHistory.length === 0 && (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIconContainer}>
                <Text style={styles.welcomeIcon}>🌟</Text>
              </View>
              <Text style={styles.welcomeTitle}>Welcome to WellBot!</Text>
              <Text style={styles.welcomeSubtitle}>
                I'm here to support your mental health journey.{'\n'}
                How are you feeling today?
              </Text>
              
              {/* Quick Reply Buttons */}
              <View style={styles.quickRepliesContainer}>
                <TouchableOpacity
                  style={styles.quickReplyButton}
                  onPress={() => setUserInput("I'm feeling anxious")}
                >
                  <Text style={styles.quickReplyText}>😰 Anxious</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickReplyButton}
                  onPress={() => setUserInput("I'm feeling happy")}
                >
                  <Text style={styles.quickReplyText}>😊 Happy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickReplyButton}
                  onPress={() => setUserInput("I'm feeling stressed")}
                >
                  <Text style={styles.quickReplyText}>😓 Stressed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickReplyButton}
                  onPress={() => setUserInput("I need help")}
                >
                  <Text style={styles.quickReplyText}>🆘 Need Help</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Messages */}
          {chatHistory.map((item, index) => renderMessage(item, index))}

          {/* Typing Indicator */}
          {isLoading && renderTypingIndicator()}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!userInput.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!userInput.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>
                {isLoading ? '...' : '▶'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.95,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  chatHistory: {
    flex: 1,
  },
  chatHistoryContent: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeIcon: {
    fontSize: 40,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 4,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickReplyText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#43cea2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#185a9d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  messageContent: {
    maxWidth: width * 0.7,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#43cea2',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#2c3e50',
  },
  timestamp: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 4,
    marginLeft: 4,
  },
  userTimestamp: {
    textAlign: 'right',
    marginRight: 4,
    marginLeft: 0,
  },
  typingIndicatorContainer: {
    maxWidth: width * 0.7,
  },
  typingBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#95a5a6',
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#43cea2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#43cea2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
