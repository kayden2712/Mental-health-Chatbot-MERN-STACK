import React, { useEffect } from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { ClinicAuthProvider, useClinicAuth } from '@/contexts/ClinicAuthContext';
import DashboardScreen from '@/components/Admin/DashboardScreen';
import BookingsScreen from '@/components/Admin/BookingsScreen';
import MedicalRecordsScreen from '@/components/Admin/MedicalRecordsScreen';

const Stack = createNativeStackNavigator();

function AdminNavigator() {
  const { isAuthenticated, isLoading } = useClinicAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu không đăng nhập và không đang load, quay về trang chính
    if (!isLoading && !isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#185a9d" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Bookings" component={BookingsScreen} />
      <Stack.Screen name="MedicalRecords" component={MedicalRecordsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default function AdminScreen() {
  return (
    <ClinicAuthProvider>
      <NavigationIndependentTree>
        <NavigationContainer>
          <AdminNavigator />
        </NavigationContainer>
      </NavigationIndependentTree>
    </ClinicAuthProvider>
  );
}
