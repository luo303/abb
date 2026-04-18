// 导出选项模态框

import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from 'react-native-paper'

interface ExportModalProps {
  visible: boolean
  onClose: () => void
  onExport: (type: string, recordType: string) => void
  recordType: string
}

export default function ExportModal({
  visible,
  onClose,
  onExport,
  recordType
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState('pdf')

  const exportFormats = [
    { value: 'pdf', label: 'PDF文件', icon: 'document-text-outline' },
    { value: 'excel', label: 'Excel表格', icon: 'grid-outline' },
    { value: 'image', label: '图片', icon: 'image-outline' }
  ]

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              导出{getRecordTypeName(recordType)}记录
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formatList}>
            {exportFormats.map(format => {
              // 对于日常记录和疫苗记录，不显示图片导出选项
              if (
                (recordType === 'daily' ||
                  recordType === 'vaccine' ||
                  recordType === 'ai_growth_report') &&
                format.value === 'image'
              ) {
                return null
              }
              return (
                <TouchableOpacity
                  key={format.value}
                  style={[
                    styles.formatItem,
                    selectedFormat === format.value && styles.formatItemSelected
                  ]}
                  onPress={() => setSelectedFormat(format.value)}
                >
                  <Ionicons
                    name={format.icon as any}
                    size={24}
                    color={selectedFormat === format.value ? '#10b981' : '#666'}
                  />
                  <Text
                    style={[
                      styles.formatLabel,
                      selectedFormat === format.value &&
                        styles.formatLabelSelected
                    ]}
                  >
                    {format.label}
                  </Text>
                  {selectedFormat === format.value && (
                    <Ionicons name="checkmark" size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <Button
            mode="contained"
            style={styles.exportButton}
            contentStyle={styles.exportButtonContent}
            labelStyle={styles.exportButtonText}
            onPress={() => onExport(selectedFormat, recordType)}
            buttonColor="#10b981"
            uppercase={false}
          >
            确认导出
          </Button>
        </View>
      </View>
    </Modal>
  )
}

function getRecordTypeName(recordType: string): string {
  const typeMap: Record<string, string> = {
    growth: '成长',
    vaccine: '疫苗',
    feeding: '喂养',
    daily: '日常',
    ai_growth_report: 'AI 成长报告'
  }
  return typeMap[recordType] || recordType
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 400
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  formatList: {
    marginBottom: 20
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10
  },
  formatItemSelected: {
    backgroundColor: '#e6f7f0'
  },
  formatLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333'
  },
  formatLabelSelected: {
    color: '#10b981',
    fontWeight: '500'
  },
  exportButton: {
    borderRadius: 8
  },
  exportButtonContent: {
    minHeight: 46
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})
