import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_ENDPOINTS } from '@/constants/api';

interface Thought {
  id: number;
  joketext: string;
}

export default function GoodThoughtsScreen() {
  const [thought, setThought] = useState<Thought | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    fetchThought();
  }, []);

  const fetchThought = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.goodThoughts);
      const data = await response.json();
      
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
      setThought({
        id: 0,
        joketext: 'Stay positive and keep smiling! 😊',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f093fb', '#f5576c', '#ffd676']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>✨ Good Thoughts ✨</Text>
        <Text style={styles.subtitle}>Daily Motivation</Text>

        <Animated.View
          style={[
            styles.thoughtCard,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
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
              {isLoading ? 'Loading...' : '🔄 Get New Thought'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.motivationalSection}>
          <Text style={styles.sectionTitle}>Remember:</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>🌟 Every day is a new beginning</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>💪 You are stronger than you think</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>🌈 Positivity is a choice</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>❤️ Take care of your mental health</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  thoughtCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  quoteIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  thoughtText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 32,
  },
  newThoughtButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivationalSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
