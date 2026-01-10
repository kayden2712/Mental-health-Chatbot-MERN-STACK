import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_ENDPOINTS } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';

interface Booking {
  id: number;
  name: string;
  phone: string;
  age: number;
  address: string;
  timeslot: string;
  date: string;
}

export default function BookingScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [timeslot, setTimeslot] = useState('');
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookings, setShowBookings] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadUserBookings();
    }
  }, [isAuthenticated]);

  const loadUserBookings = async () => {
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.userBookings, {
        headers: {
          'Authorization': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setDate(formatDate(selectedDate));
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSelectedTime(selectedTime);
      setTimeslot(formatTime(selectedTime));
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please login first to make a booking');
      return;
    }

    if (!name || !phone || !age || !address || !timeslot || !date) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      Alert.alert('Error', 'Phone number must be 10 digits');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.booking, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token!,
        },
        body: JSON.stringify({
          name,
          phone,
          age: parseInt(age),
          address,
          timeslot,
          date,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Booking created successfully!');
        setName('');
        setPhone('');
        setAge('');
        setAddress('');
        setTimeslot('');
        setDate('');
        loadUserBookings();
      } else {
        Alert.alert('Error', data.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Connection failed. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradient}
        >
          <View style={styles.notAuthContainer}>
            <Text style={styles.notAuthText}>Please login to make a booking</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Book an Appointment</Text>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !showBookings && styles.activeToggle]}
                onPress={() => setShowBookings(false)}
              >
                <Text style={[styles.toggleText, !showBookings && styles.activeToggleText]}>
                  New Booking
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, showBookings && styles.activeToggle]}
                onPress={() => setShowBookings(true)}
              >
                <Text style={[styles.toggleText, showBookings && styles.activeToggleText]}>
                  My Bookings ({bookings.length})
                </Text>
              </TouchableOpacity>
            </View>

            {!showBookings ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Phone Number (10 digits)"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  placeholderTextColor="#999"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  placeholderTextColor="#999"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerButtonText}>
                    📅 {date || 'Select Date'}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                  />
                )}

                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.datePickerButtonText}>
                    🕒 {timeslot || 'Select Time'}
                  </Text>
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimeChange}
                  />
                )}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleBooking}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Book Appointment</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.bookingsContainer}>
                {bookings.length === 0 ? (
                  <Text style={styles.noBookingsText}>No bookings yet</Text>
                ) : (
                  bookings.map((booking) => (
                    <View key={booking.id} style={styles.bookingCard}>
                      <Text style={styles.bookingName}>{booking.name}</Text>
                      <Text style={styles.bookingDetail}>📞 {booking.phone}</Text>
                      <Text style={styles.bookingDetail}>🕒 {booking.timeslot}</Text>
                      <Text style={styles.bookingDetail}>📅 {booking.date}</Text>
                      <Text style={styles.bookingDetail}>📍 {booking.address}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#667eea',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  datePickerButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookingsContainer: {
    marginTop: 10,
  },
  noBookingsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  bookingCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  bookingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bookingDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAuthText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
