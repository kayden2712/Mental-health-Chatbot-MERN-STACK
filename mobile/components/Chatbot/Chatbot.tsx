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
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { API_ENDPOINTS } from '@/constants/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

interface Message {
  role: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

interface ChatSession {
  id: number;
  title: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const { width } = Dimensions.get('window');

export default function Chatbot() {
  const { isAuthenticated, token } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  
  // Voice chat states
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatHistory]);

  // Hiệu ứng đang nhập
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

  // Tải các phiên chat khi đã xác thực
  useEffect(() => {
    if (isAuthenticated) {
      loadChatSessions();
    } else {
      // Xóa lịch sử khi đăng xuất
      setChatSessions([]);
      setCurrentSessionId(null);
      setChatHistory([]);
    }
  }, [isAuthenticated]);

  // Lưu tin nhắn vào cơ sở dữ liệu khi lịch sử chat thay đổi
  useEffect(() => {
    // Tự động lưu được xử lý trong handleSubmit bây giờ
  }, [chatHistory, currentSessionId, isAuthenticated]);

  const loadChatSessions = async () => {
    if (!token) return;
    setIsLoadingSessions(true);
    try {
      const response = await fetch(API_ENDPOINTS.chatSessions, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });
      const data = await response.json();
      if (data.success) {
        const sessions: ChatSession[] = data.sessions.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
        setChatSessions(sessions);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const saveMessageToDatabase = async (sessionId: number, role: 'user' | 'bot', message: string) => {
    if (!token) return;
    try {
      await fetch(API_ENDPOINTS.chatSessionMessages(sessionId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ role, message }),
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const startNewSession = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.chatSessions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ title: 'Cuộc trò chuyện mới' }),
      });
      const data = await response.json();
      
      if (data.success) {
        const newSession: ChatSession = {
          ...data.session,
          messageCount: 0,
          createdAt: new Date(data.session.createdAt),
          updatedAt: new Date(data.session.updatedAt),
        };
        setChatSessions([newSession, ...chatSessions]);
        setCurrentSessionId(newSession.id);
        setChatHistory([]);
        setShowHistoryModal(false);
      }
    } catch (error) {
      console.error('Error creating new session:', error);
      Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện mới');
    }
  };

  const loadSession = async (session: ChatSession) => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.chatSessionMessages(session.id), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        const messages: Message[] = data.messages.map((m: any) => ({
          role: m.role,
          message: m.message,
          timestamp: new Date(m.createdAt),
        }));
        setCurrentSessionId(session.id);
        setChatHistory(messages);
        setShowHistoryModal(false);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
      Alert.alert('Lỗi', 'Không thể tải tin nhắn');
    }
  };

  const deleteSession = async (sessionId: number) => {
    Alert.alert(
      'Xóa cuộc trò chuyện',
      'Bạn có chắc muốn xóa cuộc trò chuyện này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            
            try {
              const response = await fetch(API_ENDPOINTS.deleteSession(sessionId), {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token,
                },
              });
              const data = await response.json();
              
              if (data.success) {
                const updatedSessions = chatSessions.filter((s) => s.id !== sessionId);
                setChatSessions(updatedSessions);
                
                if (currentSessionId === sessionId) {
                  setCurrentSessionId(null);
                  setChatHistory([]);
                }
              }
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Lỗi', 'Không thể xóa cuộc trò chuyện');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    let sessionId = currentSessionId;

    // Tạo phiên mới nếu đã xác thực và chưa có phiên hiện tại
    if (isAuthenticated && token && !currentSessionId) {
      try {
        const response = await fetch(API_ENDPOINTS.chatSessions, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify({ title: currentInput.slice(0, 50) }),
        });
        const data = await response.json();
        
        if (data.success) {
          const newSession: ChatSession = {
            ...data.session,
            messageCount: 0,
            createdAt: new Date(data.session.createdAt),
            updatedAt: new Date(data.session.updatedAt),
          };
          setChatSessions([newSession, ...chatSessions]);
          setCurrentSessionId(newSession.id);
          sessionId = newSession.id;
        }
      } catch (error) {
        console.error('Error creating new session:', error);
      }
    }

    // Thêm tin nhắn người dùng ngay lập tức
    const userMessage: Message = {
      role: 'user',
      message: currentInput,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);

    // Lưu tin nhắn người dùng vào cơ sở dữ liệu
    if (isAuthenticated && token && sessionId) {
      await saveMessageToDatabase(sessionId, 'user', currentInput);
    }

    try {
      // Gửi kèm sessionId để backend tải lịch sử
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = token;
      }

      const response = await fetch(API_ENDPOINTS.chat, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          userInput: currentInput,
          sessionId: sessionId 
        }),
      });

      const data = await response.json();
      const botMessage: Message = {
        role: 'bot',
        message: data.response,
        timestamp: new Date(),
      };

      // Thêm tin nhắn bot
      setChatHistory((prev) => [...prev, botMessage]);

      // Lưu tin nhắn bot vào cơ sở dữ liệu
      if (isAuthenticated && token && sessionId) {
        await saveMessageToDatabase(sessionId, 'bot', data.response);
      }
    } catch (error) {
      console.error('Error:', error);
      // Thêm tin nhắn lỗi
      const errorMessage: Message = {
        role: 'bot',
        message: 'Xin lỗi, đã xảy ra lỗi. Vui lòng kiểm tra kết nối và thử lại.',
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

  // =============== CÁC HÀM CHAT BẰNG GIỌNG NÓI ===============
  
  // Ref để quản lý trình phát audio
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Text-to-Speech: Sử dụng Google TTS cho giọng hay hơn, dự phòng về expo-speech
  const speakMessage = async (text: string) => {
    // Dừng nếu đang nói
    if (isSpeaking) {
      await stopSpeaking();
      return;
    }

    setIsSpeaking(true);
    
    try {
      // Thử sử dụng Google TTS trước (giọng hay hơn)
      // Tùy chọn: 'warm' (nữ trầm ấm), 'female' (nữ chuẩn), 'male' (nam)
      const response = await fetch(API_ENDPOINTS.tts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          voiceType: 'warm' // Giọng nữ trầm ấm, truyền cảm
        }),
      });
      
      const data = await response.json();
      
      if (data.audioContent && !data.fallback) {
        // Phát âm thanh từ Google TTS
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        
        // Giải phóng âm thanh cũ nếu có
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/mp3;base64,${data.audioContent}` },
          { shouldPlay: true }
        );
        
        soundRef.current = sound;
        
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsSpeaking(false);
          }
        });
        
        return;
      }
    } catch (error) {
      console.log('Google TTS không khả dụng, dùng giọng mặc định');
    }
    
    // Dự phòng: sử dụng expo-speech (giọng mặc định của thiết bị)
    try {
      await Speech.speak(text, {
        language: 'vi-VN',
        pitch: 1.1,      // Cao hơn một chút
        rate: 0.85,      // Chậm hơn để rõ ràng
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  // Dừng đọc
  const stopSpeaking = async () => {
    // Dừng âm thanh Google TTS
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    // Dừng expo-speech
    await Speech.stop();
    setIsSpeaking(false);
  };

  // Dọn dẹp khi component bị gỡ bỏ
  useEffect(() => {
    return () => {
      Speech.stop();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Tự động đọc phản hồi của bot
  useEffect(() => {
    if (autoSpeak && chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage.role === 'bot' && !isLoading) {
        speakMessage(lastMessage.message);
      }
    }
  }, [chatHistory, isLoading, autoSpeak]);

  // =============== KẾT THÚC CÁC HÀM CHAT BẰNG GIỌNG NÓI ===============

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
        {/* Avatar Bot */}
        {!isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.botAvatar}>
              <Text style={styles.avatarText}>🤖</Text>
            </View>
          </View>
        )}

        {/* Nội dung tin nhắn */}
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
            {/* Nút nghe cho tin nhắn bot */}
            {!isUser && (
              <TouchableOpacity
                style={styles.speakButton}
                onPress={() => speakMessage(item.message)}
              >
                <Text style={styles.speakButtonText}>
                  {isSpeaking ? '⏹️' : '🔊'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>

        {/* Avatar người dùng */}
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Tiêu đề với gradient */}
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
            <Text style={styles.headerSubtitle}>Trợ lý Sức khỏe Tâm thần</Text>
          </View>
          {/* Nút lịch sử - Chỉ hiển thị khi đã xác thực */}
          {isAuthenticated && (
            <View style={styles.headerButtons}>
              {/* Nút bật/tắt tự động đọc */}
              <TouchableOpacity
                style={[styles.headerButton, autoSpeak && styles.headerButtonActive]}
                onPress={() => setAutoSpeak(!autoSpeak)}
              >
                <Text style={styles.headerButtonIcon}>{autoSpeak ? '🔊' : '🔇'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowHistoryModal(true)}
              >
                <Text style={styles.headerButtonIcon}>📋</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={startNewSession}
              >
                <Text style={styles.headerButtonIcon}>➕</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Nút voice cho người dùng chưa đăng nhập */}
          {!isAuthenticated && (
            <TouchableOpacity
              style={[styles.headerButton, autoSpeak && styles.headerButtonActive]}
              onPress={() => setAutoSpeak(!autoSpeak)}
            >
              <Text style={styles.headerButtonIcon}>{autoSpeak ? '🔊' : '🔇'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Khu vực chat */}
      <View style={styles.chatContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatHistory}
          contentContainerStyle={styles.chatHistoryContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Tin nhắn chào mừng */}
          {chatHistory.length === 0 && (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIconContainer}>
                <Text style={styles.welcomeIcon}>🌟</Text>
              </View>
              <Text style={styles.welcomeTitle}>Chào mừng đến WellBot!</Text>
              <Text style={styles.welcomeSubtitle}>
                Tôi ở đây để hỗ trợ hành trình sức khỏe tâm thần của bạn.{'\n'}
                Hôm nay bạn cảm thấy thế nào?
              </Text>

              {/* Nút trả lời nhanh */}
              <View style={styles.quickRepliesContainer}>
                <TouchableOpacity
                  style={styles.quickReplyButton}
                  onPress={() => setUserInput("Tôi đang cảm thấy lo lắng")}
                >
                  <Text style={styles.quickReplyText}>😰 Lo lắng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickReplyButton}
                  onPress={() => setUserInput("Tôi đang cảm thấy vui vẻ")}
                >
                  <Text style={styles.quickReplyText}>😊 Vui vẻ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickReplyButton}
                  onPress={() => setUserInput("Tôi đang cảm thấy căng thẳng")}
                >
                  <Text style={styles.quickReplyText}>😓 Căng thẳng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickReplyButton}
                  onPress={() => setUserInput("Tôi cần giúp đỡ")}
                >
                  <Text style={styles.quickReplyText}>🆘 Cần giúp</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tin nhắn */}
          {chatHistory.map((item, index) => renderMessage(item, index))}

          {/* Chỉ báo đang nhập */}
          {isLoading && renderTypingIndicator()}
          
          {/* Bottom Spacer to prevent messages from being hidden */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Khu vực nhập liệu */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Nhập tin nhắn của bạn..."
              placeholderTextColor="#999"
              multiline
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

      {/* Modal lịch sử chat - Chỉ dành cho người dùng đã xác thực */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📋 Lịch sử trò chuyện</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowHistoryModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {chatSessions.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryIcon}>💭</Text>
                <Text style={styles.emptyHistoryText}>Chưa có lịch sử trò chuyện</Text>
                <Text style={styles.emptyHistorySubtext}>Bắt đầu cuộc trò chuyện mới!</Text>
              </View>
            ) : (
              <FlatList
                data={chatSessions}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.sessionItem,
                      currentSessionId === item.id && styles.sessionItemActive,
                    ]}
                    onPress={() => loadSession(item)}
                  >
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.sessionDate}>
                        {formatDate(item.updatedAt)} • {item.messageCount} tin nhắn
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteSession(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.newChatButton}
              onPress={startNewSession}
            >
              <Text style={styles.newChatButtonText}>➕ Cuộc trò chuyện mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 100,
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
  // Các nút trên thanh tiêu đề cho lịch sử
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerButtonIcon: {
    fontSize: 18,
  },
  // Kiểu dáng chat bằng giọng nói
  speakButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  speakButtonText: {
    fontSize: 14,
  },
  // Kiểu dáng modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyHistoryIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyHistoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionItemActive: {
    backgroundColor: '#e8f5e9',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  newChatButton: {
    backgroundColor: '#43cea2',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  newChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
