import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useClinicAuth } from '@/contexts/ClinicAuthContext';
import { API_ENDPOINTS } from '@/constants/api';

interface Stats {
  pending: number;
  approved: number;
  completed: number;
  totalRecords: number;
}

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { token, clinicInfo, logout } = useClinicAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.clinicStats, {
        headers: { Authorization: token || '' },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    onPress 
  }: { 
    title: string; 
    value: number; 
    icon: string; 
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.statIconContainer}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ 
    title, 
    icon, 
    color, 
    onPress 
  }: { 
    title: string; 
    icon: string; 
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.quickAction, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#185a9d', '#43cea2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Xin chào! 👋</Text>
            <Text style={styles.clinicName}>{clinicInfo?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#185a9d" />
          </View>
        ) : (
          <>
            {/* Stats Section */}
            <Text style={styles.sectionTitle}>📊 Tổng quan</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Chờ duyệt"
                value={stats?.pending || 0}
                icon="⏳"
                color="#f39c12"
                onPress={() => navigation.navigate('Bookings', { filter: 'pending' })}
              />
              <StatCard
                title="Đã duyệt"
                value={stats?.approved || 0}
                icon="✅"
                color="#3498db"
                onPress={() => navigation.navigate('Bookings', { filter: 'approved' })}
              />
              <StatCard
                title="Hoàn thành"
                value={stats?.completed || 0}
                icon="🎉"
                color="#27ae60"
                onPress={() => navigation.navigate('Bookings', { filter: 'completed' })}
              />
              <StatCard
                title="Hồ sơ bệnh án"
                value={stats?.totalRecords || 0}
                icon="📋"
                color="#9b59b6"
                onPress={() => navigation.navigate('MedicalRecords')}
              />
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
            <View style={styles.quickActions}>
              <QuickAction
                title="Lịch hẹn mới"
                icon="📅"
                color="#3498db"
                onPress={() => navigation.navigate('Bookings', { filter: 'pending' })}
              />
              <QuickAction
                title="Khám bệnh"
                icon="🩺"
                color="#27ae60"
                onPress={() => navigation.navigate('Bookings', { filter: 'approved' })}
              />
              <QuickAction
                title="Hồ sơ bệnh nhân"
                icon="📁"
                color="#9b59b6"
                onPress={() => navigation.navigate('MedicalRecords')}
              />
            </View>

            {/* Today's Summary */}
            <View style={styles.todaySummary}>
              <Text style={styles.todayTitle}>📆 Hôm nay</Text>
              <Text style={styles.todayDate}>
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <View style={styles.todayStats}>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{stats?.pending || 0}</Text>
                  <Text style={styles.todayStatLabel}>Cần xử lý</Text>
                </View>
                <View style={styles.todayDivider} />
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{stats?.approved || 0}</Text>
                  <Text style={styles.todayStatLabel}>Chờ khám</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  clinicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
    maxWidth: 280,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  logoutIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIcon: {
    fontSize: 22,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quickAction: {
    flex: 1,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  todaySummary: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  todayDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 15,
  },
  todayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
  },
  todayStat: {
    flex: 1,
    alignItems: 'center',
  },
  todayStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#185a9d',
  },
  todayStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  todayDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ddd',
    marginHorizontal: 20,
  },
});
