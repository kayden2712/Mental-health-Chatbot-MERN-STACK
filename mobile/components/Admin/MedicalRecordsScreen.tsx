import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useClinicAuth } from '@/contexts/ClinicAuthContext';
import { API_ENDPOINTS } from '@/constants/api';

interface MedicalRecord {
  id: number;
  bookingId: number;
  userId: number;
  patientName: string;
  patientAge: number;
  doctorName: string;
  diagnosis: string;
  symptoms: string;
  mentalHealthStatus: string;
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: string;
  medications: string;
  notes: string;
  createdAt: string;
  nextAppointment?: string;
}

export default function MedicalRecordsScreen() {
  const { token } = useClinicAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const fetchRecords = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.clinicMedicalRecords, {
        headers: { Authorization: token || '' },
      });
      const data = await response.json();
      if (data.success) {
        setRecords(data.records);
        setFilteredRecords(data.records);
      }
    } catch (error) {
      console.error('Fetch records error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    let filtered = records;
    
    // Lọc theo truy vấn tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.patientName?.toLowerCase().includes(query) ||
          r.diagnosis?.toLowerCase().includes(query) ||
          r.doctorName?.toLowerCase().includes(query)
      );
    }
    
    // Lọc theo mức độ nghiêm trọng
    if (severityFilter !== 'all') {
      filtered = filtered.filter((r) => r.severity === severityFilter);
    }
    
    setFilteredRecords(filtered);
  }, [searchQuery, severityFilter, records]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'mild': return 'Nhẹ';
      case 'moderate': return 'Trung bình';
      case 'severe': return 'Nặng';
      default: return severity;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#27ae60';
      case 'moderate': return '#f39c12';
      case 'severe': return '#e74c3c';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const FilterButton = ({ value, label, color }: { value: string; label: string; color?: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        severityFilter === value && styles.filterButtonActive,
        severityFilter === value && color ? { backgroundColor: color } : {},
      ]}
      onPress={() => setSeverityFilter(value)}
    >
      <Text style={[styles.filterText, severityFilter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderRecordItem = ({ item }: { item: MedicalRecord }) => (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={() => {
        setSelectedRecord(item);
        setShowModal(true);
      }}
    >
      <View style={styles.recordHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.patientName || 'Không xác định'}</Text>
          <Text style={styles.patientAge}>{item.patientAge} tuổi</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{getSeverityText(item.severity)}</Text>
        </View>
      </View>
      
      <View style={styles.recordBody}>
        <Text style={styles.diagnosisLabel}>Chẩn đoán:</Text>
        <Text style={styles.diagnosisText} numberOfLines={2}>{item.diagnosis}</Text>
      </View>
      
      <View style={styles.recordFooter}>
        <Text style={styles.doctorName}>👨‍⚕️ {item.doctorName || 'Chưa có'}</Text>
        <Text style={styles.recordDate}>📅 {formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#185a9d', '#43cea2']} style={styles.header}>
        <Text style={styles.headerTitle}>📋 Hồ sơ bệnh án</Text>
        <Text style={styles.headerSubtitle}>{records.length} hồ sơ</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm theo tên, chẩn đoán..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContentContainer}
      >
        <FilterButton value="all" label="Tất cả" />
        <FilterButton value="mild" label="Nhẹ" color="#27ae60" />
        <FilterButton value="moderate" label="Trung bình" color="#f39c12" />
        <FilterButton value="severe" label="Nặng" color="#e74c3c" />
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#185a9d" />
        </View>
      ) : filteredRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyText}>
            {searchQuery || severityFilter !== 'all' 
              ? 'Không tìm thấy hồ sơ phù hợp' 
              : 'Chưa có hồ sơ bệnh án nào'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecordItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Record Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>📋 Chi tiết hồ sơ</Text>
              
              {selectedRecord && (
                <>
                  {/* Patient Info */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>👤 Thông tin bệnh nhân</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Họ tên:</Text>
                      <Text style={styles.infoValue}>{selectedRecord.patientName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Tuổi:</Text>
                      <Text style={styles.infoValue}>{selectedRecord.patientAge} tuổi</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Bác sĩ khám:</Text>
                      <Text style={styles.infoValue}>{selectedRecord.doctorName || 'Không có'}</Text>
                    </View>
                  </View>

                  {/* Diagnosis */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>🔬 Kết quả khám</Text>
                    
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Triệu chứng:</Text>
                      <Text style={styles.fieldValue}>{selectedRecord.symptoms || 'Không có'}</Text>
                    </View>
                    
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Chẩn đoán:</Text>
                      <Text style={styles.fieldValue}>{selectedRecord.diagnosis}</Text>
                    </View>
                    
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Mức độ:</Text>
                      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(selectedRecord.severity), alignSelf: 'flex-start' }]}>
                        <Text style={styles.severityText}>{getSeverityText(selectedRecord.severity)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Mental Health Status */}
                  <View style={[styles.sectionCard, styles.highlightCard]}>
                    <Text style={styles.sectionTitle}>🧠 Tình trạng sức khỏe tâm thần</Text>
                    <Text style={styles.mentalHealthText}>
                      {selectedRecord.mentalHealthStatus || 'Chưa đánh giá'}
                    </Text>
                    <Text style={styles.chatbotNote}>
                      💡 Chatbot sẽ đọc thông tin này để tư vấn cá nhân hóa
                    </Text>
                  </View>

                  {/* Recommendations */}
                  {selectedRecord.recommendations && (
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionTitle}>💊 Khuyến nghị điều trị</Text>
                      <Text style={styles.fieldValue}>{selectedRecord.recommendations}</Text>
                    </View>
                  )}

                  {/* Medications */}
                  {selectedRecord.medications && (
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionTitle}>💉 Thuốc kê đơn</Text>
                      <Text style={styles.fieldValue}>{selectedRecord.medications}</Text>
                    </View>
                  )}

                  {/* Notes */}
                  {selectedRecord.notes && (
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionTitle}>📝 Ghi chú</Text>
                      <Text style={styles.fieldValue}>{selectedRecord.notes}</Text>
                    </View>
                  )}

                  {/* Date Info */}
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateText}>
                      Ngày tạo: {formatDate(selectedRecord.createdAt)}
                    </Text>
                    {selectedRecord.nextAppointment && (
                      <Text style={styles.dateText}>
                        Lịch tái khám: {formatDate(selectedRecord.nextAppointment)}
                      </Text>
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
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
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  listContainer: {
    padding: 15,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  patientAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  recordBody: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  diagnosisLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  diagnosisText: {
    fontSize: 15,
    color: '#333',
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doctorName: {
    fontSize: 13,
    color: '#666',
  },
  recordDate: {
    fontSize: 13,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  highlightCard: {
    backgroundColor: '#e8f4fd',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  mentalHealthText: {
    fontSize: 15,
    color: '#185a9d',
    lineHeight: 22,
    fontWeight: '500',
  },
  chatbotNote: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 10,
    fontStyle: 'italic',
  },
  dateInfo: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 10,
    marginBottom: 30,
    paddingVertical: 14,
    backgroundColor: '#185a9d',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
