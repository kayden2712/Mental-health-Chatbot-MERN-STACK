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
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_ENDPOINTS } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';

interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
  specialty: string;
  rating: number;
  openHours: string;
}

interface Booking {
  id: number;
  name: string;
  phone: string;
  age: number;
  address: string;
  timeslot: string;
  date: string;
  clinicId: number;
  clinicName: string;
  status: string;
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
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showClinicPicker, setShowClinicPicker] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    loadClinics();
    if (isAuthenticated) {
      loadUserBookings();
    }
  }, [isAuthenticated]);

  const loadClinics = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.clinics);
      const data = await response.json();
      if (data.success) {
        setClinics(data.clinics || []);
      }
    } catch (error) {
      console.error('Failed to load clinics:', error);
    }
  };

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

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
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
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt lịch');
      return;
    }

    if (!selectedClinic) {
      Alert.alert('Lỗi', 'Vui lòng chọn phòng khám');
      return;
    }

    if (!name || !phone || !age || !timeslot || !date) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại phải có 10 chữ số');
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
          address: address || selectedClinic.address,
          timeslot,
          date,
          clinicId: selectedClinic.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Thành công! 🎉',
          `Đã đặt lịch tại ${data.clinicName}\n\nThông tin đặt lịch:\n📅 Ngày: ${formatDisplayDate(date)}\n🕒 Giờ: ${timeslot}\n\nPhòng khám sẽ liên hệ xác nhận với bạn sớm nhất!`
        );
        setName('');
        setPhone('');
        setAge('');
        setAddress('');
        setTimeslot('');
        setDate('');
        setSelectedClinic(null);
        loadUserBookings();
      } else {
        Alert.alert('Lỗi', data.error || 'Đặt lịch thất bại');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Lỗi', 'Kết nối thất bại. Vui lòng kiểm tra mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#f44336';
      default: return '#FF9800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const renderClinicItem = ({ item }: { item: Clinic }) => (
    <TouchableOpacity
      style={[styles.clinicItem, selectedClinic?.id === item.id && styles.clinicItemSelected]}
      onPress={() => {
        setSelectedClinic(item);
        setShowClinicPicker(false);
      }}
    >
      <View style={styles.clinicHeader}>
        <Text style={styles.clinicName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>
      <Text style={styles.clinicSpecialty}>🩺 {item.specialty}</Text>
      <Text style={styles.clinicAddress}>📍 {item.address}</Text>
      <Text style={styles.clinicPhone}>📞 {item.phone}</Text>
      <Text style={styles.clinicHours}>🕐 {item.openHours}</Text>
    </TouchableOpacity>
  );
  
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
          <View style={styles.notAuthContainer}>
            <Text style={styles.notAuthIcon}>🔐</Text>
            <Text style={styles.notAuthText}>Vui lòng đăng nhập để đặt lịch khám</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>🏥 Đặt Lịch Khám</Text>
            <Text style={styles.subtitle}>Đặt lịch với các phòng khám liên kết</Text>

            <View style={styles.toggleContainer}>
              <TouchableOpacity style={[styles.toggleButton, !showBookings && styles.activeToggle]} onPress={() => setShowBookings(false)}>
                <Text style={[styles.toggleText, !showBookings && styles.activeToggleText]}>Đặt lịch mới</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleButton, showBookings && styles.activeToggle]} onPress={() => setShowBookings(true)}>
                <Text style={[styles.toggleText, showBookings && styles.activeToggleText]}>Lịch hẹn ({bookings.length})</Text>
              </TouchableOpacity>
            </View>

            {!showBookings ? (
              <>
                <Text style={styles.sectionTitle}>1. Chọn phòng khám</Text>
                <TouchableOpacity style={styles.clinicSelector} onPress={() => setShowClinicPicker(true)}>
                  {selectedClinic ? (
                    <View>
                      <Text style={styles.selectedClinicName}>{selectedClinic.name}</Text>
                      <Text style={styles.selectedClinicAddress}>{selectedClinic.address}</Text>
                    </View>
                  ) : (
                    <Text style={styles.clinicSelectorPlaceholder}>🏥 Nhấn để chọn phòng khám</Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>2. Thông tin cá nhân</Text>
                <TextInput style={styles.input} placeholder="Họ và tên" placeholderTextColor="#999" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Số điện thoại (10 chữ số)" placeholderTextColor="#999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
                <TextInput style={styles.input} placeholder="Tuổi" placeholderTextColor="#999" value={age} onChangeText={setAge} keyboardType="number-pad" />
                <TextInput style={styles.input} placeholder="Ghi chú (tùy chọn)" placeholderTextColor="#999" value={address} onChangeText={setAddress} multiline numberOfLines={2} />

                <Text style={styles.sectionTitle}>3. Chọn ngày giờ</Text>
                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.datePickerButtonText}>📅 {date ? formatDisplayDate(date) : "Chọn ngày khám"}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker value={selectedDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onDateChange} minimumDate={new Date()} />
                )}

                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.datePickerButtonText}>🕒 {timeslot || "Chọn giờ khám"}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker value={selectedTime} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onTimeChange} />
                )}

                <TouchableOpacity style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} onPress={handleBooking} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>✓ Xác nhận đặt lịch</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.bookingsContainer}>
                {bookings.length === 0 ? (
                  <View style={styles.emptyBookings}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.noBookingsText}>Chưa có lịch hẹn nào</Text>
                    <Text style={styles.noBookingsSubtext}>Đặt lịch ngay để được tư vấn!</Text>
                  </View>
                ) : (
                  bookings.map((booking) => (
                    <View key={booking.id} style={styles.bookingCard}>
                      <View style={styles.bookingHeader}>
                        <Text style={styles.bookingClinic}>{booking.clinicName || "Phòng khám"}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status || "pending") }]}>
                          <Text style={styles.statusText}>{getStatusText(booking.status || "pending")}</Text>
                        </View>
                      </View>
                      <Text style={styles.bookingName}>👤 {booking.name}</Text>
                      <Text style={styles.bookingDetail}>📞 {booking.phone}</Text>
                      <Text style={styles.bookingDetail}>📅 {formatDisplayDate(booking.date)}</Text>
                      <Text style={styles.bookingDetail}>🕒 {booking.timeslot}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Clinic Picker Modal */}
      <Modal visible={showClinicPicker} animationType="slide" transparent={true} onRequestClose={() => setShowClinicPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏥 Chọn phòng khám</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowClinicPicker(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList data={clinics} keyExtractor={(item) => item.id.toString()} renderItem={renderClinicItem} showsVerticalScrollIndicator={false} contentContainerStyle={styles.clinicList} />
          </View>
        </View>
      </Modal>
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
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
    marginBottom: 16,
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
  clinicSelector: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
  },
  clinicSelectorPlaceholder: {
    fontSize: 16,
    color: '#667eea',
    textAlign: 'center',
  },
  selectedClinicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedClinicAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  datePickerButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
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
    marginTop: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#aaa',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookingsContainer: {
    marginTop: 10,
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 16,
  },
  noBookingsText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  noBookingsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  bookingCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingClinic: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingName: {
    fontSize: 16,
    fontWeight: '600',
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
  notAuthIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  notAuthText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
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
    color: '#333',
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
  clinicList: {
    padding: 16,
  },
  clinicItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  clinicItemSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  clinicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
  clinicSpecialty: {
    fontSize: 13,
    color: '#667eea',
    marginBottom: 6,
  },
  clinicAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  clinicPhone: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  clinicHours: {
    fontSize: 13,
    color: '#666',
  },
});
