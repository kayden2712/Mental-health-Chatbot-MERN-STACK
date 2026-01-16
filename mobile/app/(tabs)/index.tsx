import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/constants/api';

interface Thought {
  id: number;
  joketext: string;
}

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const [thought, setThought] = useState<Thought | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchThought();
  }, []);

  const fetchThought = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching thought from:', API_ENDPOINTS.goodThoughts);
      const response = await fetch(API_ENDPOINTS.goodThoughts);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received thought:', data);
      
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setThought(data);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      console.error('Failed to fetch thought:', error);
      console.error('API endpoint:', API_ENDPOINTS.goodThoughts);
      setThought({
        id: 0,
        joketext: 'Hãy sống tích cực và mỉm cười! 😊\n\n(Lỗi kết nối server - vui lòng kiểm tra backend)',
      });
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🧠 WellBot</Text>
          <Text style={styles.subtitle}>Trợ lý Sức khỏe Tâm thần của bạn</Text>
          {!isAuthenticated && (
            <Text style={styles.loginPrompt}>👉 Đăng nhập từ tab Hồ sơ để sử dụng đầy đủ tính năng</Text>
          )}
        </View>

        {/* Daily Motivation Section */}
        <View style={styles.motivationSection}>
          <Text style={styles.motivationTitle}>✨ Động lực hàng ngày ✨</Text>
          
          <Animated.View
            style={[
              styles.thoughtCard,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#667eea" />
            ) : (
              <>
                <Text style={styles.quoteIcon}>💭</Text>
                <Text style={styles.thoughtText}>{thought?.joketext}</Text>
              </>
            )}
          </Animated.View>

          <TouchableOpacity
            style={styles.newThoughtButton}
            onPress={fetchThought}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Đang tải...' : '🔄 Lấy câu mới'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureTitle}>Hỗ trợ Chat AI</Text>
            <Text style={styles.featureDescription}>
              Trò chuyện với chatbot AI thấu hiểu bất cứ khi nào bạn cần hỗ trợ
            </Text>
            <Link href="/(tabs)/chatbot" asChild>
              <TouchableOpacity style={styles.featureButton}>
                <Text style={styles.featureButtonText}>Bắt đầu Chat</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureTitle}>Đặt lịch hẹn</Text>
            <Text style={styles.featureDescription}>
              Đặt lịch với các chuyên gia tâm lý chuyên nghiệp
            </Text>
            <Link href={"/(tabs)/booking" as any} asChild>
              <TouchableOpacity style={styles.featureButton}>
                <Text style={styles.featureButtonText}>Đặt ngay</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Tại sao Sức khỏe Tâm thần quan trọng</Text>
          <Text style={styles.infoText}>
            Chăm sóc sức khỏe tâm thần cũng quan trọng như sức khỏe thể chất.
            WellBot luôn sẵn sàng hỗ trợ bạn 24/7 với trợ lý AI thấu hiểu,
            nguồn lực chuyên nghiệp và động lực hàng ngày.
          </Text>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Mẹo nhanh</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>🌟 Nghỉ ngơi và chăm sóc bản thân</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>💪 Kết nối với những người thân yêu</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>🧘 Thực hành chánh niệm và thiền định</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.95,
  },
  loginPrompt: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 10,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  featureButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  featureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  tipsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
  },
  motivationSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  motivationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 15,
  },
  thoughtCard: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  quoteIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  thoughtText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
  },
  newThoughtButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
