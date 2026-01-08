import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🧠 WellBot</Text>
          <Text style={styles.subtitle}>Your Mental Health Companion</Text>
          {!isAuthenticated && (
            <Text style={styles.loginPrompt}>👉 Login from Profile tab to access all features</Text>
          )}
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureTitle}>AI Chat Support</Text>
            <Text style={styles.featureDescription}>
              Talk to our empathetic AI chatbot anytime you need support
            </Text>
            <Link href="/(tabs)/chatbot" asChild>
              <TouchableOpacity style={styles.featureButton}>
                <Text style={styles.featureButtonText}>Start Chatting</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureTitle}>Book Appointments</Text>
            <Text style={styles.featureDescription}>
              Schedule sessions with professional therapists
            </Text>
            <Link href={"/(tabs)/booking" as any} asChild>
              <TouchableOpacity style={styles.featureButton}>
                <Text style={styles.featureButtonText}>Book Now</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>✨</Text>
            <Text style={styles.featureTitle}>Daily Motivation</Text>
            <Text style={styles.featureDescription}>
              Get inspiring thoughts to brighten your day
            </Text>
            <Link href={"/(tabs)/motivation" as any} asChild>
              <TouchableOpacity style={styles.featureButton}>
                <Text style={styles.featureButtonText}>Get Inspired</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Mental Health Matters</Text>
          <Text style={styles.infoText}>
            Taking care of your mental health is just as important as physical health.
            WellBot is here to support you 24/7 with compassionate AI assistance,
            professional resources, and daily motivation.
          </Text>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Quick Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>🌟 Take breaks and practice self-care</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>💪 Stay connected with loved ones</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>🧘 Practice mindfulness and meditation</Text>
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
});
