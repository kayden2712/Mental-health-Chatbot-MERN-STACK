import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useClinicAuth } from '@/contexts/ClinicAuthContext';
import { API_ENDPOINTS } from '@/constants/api';

interface Booking {
  id: number;
  userId: number;
  name: string;
  phone: string;
  age: number;
  address: string;
  timeslot: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  userEmail?: string;
}

interface BookingsScreenProps {
  route: any;
  navigation: any;
}

export default function BookingsScreen({ route, navigation }: BookingsScreenProps) {
  const { token } = useClinicAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>(route?.params?.filter || 'all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  
  // Medical record form
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [mentalHealthStatus, setMentalHealthStatus] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [recommendations, setRecommendations] = useState('');
  const [medications, setMedications] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const url = filter !== 'all' 
        ? `${API_ENDPOINTS.clinicBookings}?status=${filter}`
        : API_ENDPOINTS.clinicBookings;
        
      const response = await fetch(url, {
        headers: { Authorization: token || '' },
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token, filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (route?.params?.filter) {
      setFilter(route.params.filter);
    }
  }, [route?.params?.filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const updateStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.updateBookingStatus(bookingId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        fetchBookings();
        setShowModal(false);
        Alert.alert('Thành công', `Đã cập nhật trạng thái thành "${getStatusText(newStatus)}"`);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const saveMedicalRecord = async () => {
    if (!selectedBooking) return;
    
    if (!diagnosis.trim() || !mentalHealthStatus.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập chẩn đoán và tình trạng sức khỏe tâm thần');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(API_ENDPOINTS.clinicMedicalRecords, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          userId: selectedBooking.userId,
          doctorName,
          diagnosis,
          symptoms,
          mentalHealthStatus,
          severity,
          recommendations,
          medications,
          notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Cập nhật trạng thái thành completed
        await updateStatus(selectedBooking.id, 'completed');
        
        setShowRecordModal(false);
        resetForm();
        Alert.alert('Thành công', 'Đã lưu hồ sơ bệnh án và hoàn thành khám');
      } else {
        Alert.alert('Lỗi', data.error || 'Không thể lưu hồ sơ');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu hồ sơ bệnh án');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setDiagnosis('');
    setSymptoms('');
    setMentalHealthStatus('');
    setSeverity('mild');
    setRecommendations('');
    setMedications('');
    setDoctorName('');
    setNotes('');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'approved': return '#3498db';
      case 'rejected': return '#e74c3c';
      case 'completed': return '#27ae60';
      case 'cancelled': return '#95a5a6';
      default: return '#333';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const FilterButton = ({ value, label }: { value: string; label: string }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => {
        setSelectedBooking(item);
        setShowModal(true);
      }}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.patientName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.bookingInfo}>
        <Text style={styles.infoRow}>📞 {item.phone}</Text>
        <Text style={styles.infoRow}>🎂 {item.age} tuổi</Text>
        <Text style={styles.infoRow}>📅 {formatDate(item.date)} - {item.timeslot}</Text>
        <Text style={styles.infoRow} numberOfLines={1}>📍 {item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#185a9d', '#43cea2']} style={styles.header}>
        <Text style={styles.headerTitle}>📅 Quản lý lịch hẹn</Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContentContainer}
      >
        <FilterButton value="all" label="Tất cả" />
        <FilterButton value="pending" label="Chờ duyệt" />
        <FilterButton value="approved" label="Đã duyệt" />
        <FilterButton value="completed" label="Hoàn thành" />
        <FilterButton value="rejected" label="Từ chối" />
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#185a9d" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Không có lịch hẹn nào</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Booking Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Chi tiết lịch hẹn</Text>
              
              {selectedBooking && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Bệnh nhân</Text>
                    <Text style={styles.detailValue}>{selectedBooking.name}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Số điện thoại</Text>
                    <Text style={styles.detailValue}>{selectedBooking.phone}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Tuổi</Text>
                    <Text style={styles.detailValue}>{selectedBooking.age} tuổi</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Địa chỉ</Text>
                    <Text style={styles.detailValue}>{selectedBooking.address}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Ngày khám</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedBooking.date)}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Khung giờ</Text>
                    <Text style={styles.detailValue}>{selectedBooking.timeslot}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Trạng thái</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedBooking.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(selectedBooking.status)}</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    {selectedBooking.status === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={() => updateStatus(selectedBooking.id, 'approved')}
                        >
                          <Text style={styles.actionButtonText}>✅ Duyệt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => updateStatus(selectedBooking.id, 'rejected')}
                        >
                          <Text style={styles.actionButtonText}>❌ Từ chối</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    
                    {selectedBooking.status === 'approved' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() => {
                          setShowModal(false);
                          setTimeout(() => setShowRecordModal(true), 300);
                        }}
                      >
                        <Text style={styles.actionButtonText}>🩺 Khám & Nhập hồ sơ</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Medical Record Modal */}
      <Modal
        visible={showRecordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.recordModal]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>📋 Nhập hồ sơ bệnh án</Text>
              
              {selectedBooking && (
                <Text style={styles.patientInfo}>
                  Bệnh nhân: {selectedBooking.name} ({selectedBooking.age} tuổi)
                </Text>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên bác sĩ khám</Text>
                <TextInput
                  style={styles.formInput}
                  value={doctorName}
                  onChangeText={setDoctorName}
                  placeholder="Nhập tên bác sĩ"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Triệu chứng *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={symptoms}
                  onChangeText={setSymptoms}
                  placeholder="Mô tả triệu chứng của bệnh nhân"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Chẩn đoán *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="Kết quả chẩn đoán"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tình trạng sức khỏe tâm thần * (Chatbot sẽ đọc)</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={mentalHealthStatus}
                  onChangeText={setMentalHealthStatus}
                  placeholder="Mô tả chi tiết tình trạng tâm lý: lo âu, trầm cảm, stress..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mức độ</Text>
                <View style={styles.severityButtons}>
                  {(['mild', 'moderate', 'severe'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.severityButton,
                        severity === level && styles.severityButtonActive,
                        { backgroundColor: level === 'mild' ? '#27ae60' : level === 'moderate' ? '#f39c12' : '#e74c3c' }
                      ]}
                      onPress={() => setSeverity(level)}
                    >
                      <Text style={styles.severityButtonText}>
                        {level === 'mild' ? 'Nhẹ' : level === 'moderate' ? 'Trung bình' : 'Nặng'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Khuyến nghị của bác sĩ (Chatbot sẽ đọc)</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={recommendations}
                  onChangeText={setRecommendations}
                  placeholder="Lời khuyên, hướng dẫn cho bệnh nhân..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Thuốc kê đơn (nếu có)</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={medications}
                  onChangeText={setMedications}
                  placeholder="Danh sách thuốc và liều lượng"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ghi chú thêm</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Ghi chú khác..."
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.saveButton]}
                  onPress={saveMedicalRecord}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.formButtonText}>💾 Lưu hồ sơ</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={() => {
                    setShowRecordModal(false);
                    resetForm();
                  }}
                >
                  <Text style={[styles.formButtonText, { color: '#666' }]}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexGrow: 0,
    maxHeight: 60,
  },
  filterContentContainer: {
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    height: 36,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#185a9d',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  bookingInfo: {
    gap: 5,
  },
  infoRow: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '80%',
  },
  recordModal: {
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  patientInfo: {
    fontSize: 16,
    color: '#185a9d',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  detailSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#27ae60',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  completeButton: {
    backgroundColor: '#3498db',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.5,
  },
  severityButtonActive: {
    opacity: 1,
  },
  severityButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  formButtons: {
    gap: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  formButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  formButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
