// 导出按钮组件

import React, { useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Button } from 'react-native-paper'
import ExportModal from './ExportModal'
import {
  exportData,
  shareExportFile
} from '../../services/export/exportService'

interface ExportButtonProps {
  recordType: string
  data: any
  viewRef?: any
  style?: any
  disabled?: boolean
}

export default function ExportButton({
  recordType,
  data,
  viewRef,
  style,
  disabled = false
}: ExportButtonProps) {
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (type: string) => {
    if (disabled) return

    setIsExporting(true)
    try {
      const exportDataObj = {
        ...data,
        viewRef: viewRef?.current
      }

      const result = await exportData(
        {
          type: type as any,
          recordType: recordType as any,
          includeCharts: true,
          includeStatistics: true
        },
        exportDataObj
      )

      if (result.success && result.filePath && result.fileName) {
        // 分享文件
        await shareExportFile(result.filePath, result.fileName)
      } else if (!result.success) {
        // 根据错误类型提供不同的错误信息
        let errorMessage = '导出失败'
        if (result.error) {
          if (result.error.includes('permission')) {
            errorMessage = '导出失败：缺少文件系统权限'
          } else if (result.error.includes('network')) {
            errorMessage = '导出失败：网络连接问题'
          } else {
            errorMessage = `导出失败：${result.error}`
          }
        }
        alert(errorMessage)
      }
    } catch (error) {
      alert(`导出失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }

  return (
    <>
      <View style={[styles.container, style]}>
        <Button
          mode="contained"
          onPress={() => setShowExportModal(true)}
          disabled={isExporting || disabled}
          style={[
            styles.exportButton,
            isExporting && styles.exportButtonDisabled
          ]}
          contentStyle={styles.exportButtonContent}
          labelStyle={styles.exportButtonText}
          buttonColor="#f43f5e"
          uppercase={false}
        >
          {isExporting ? '导出中...' : '导出'}
        </Button>
      </View>

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        recordType={recordType}
      />

      {isExporting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f43f5e" />
            <Text style={styles.loadingText}>导出中...</Text>
          </View>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 100
  },
  exportButton: {
    borderRadius: 20,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  exportButtonDisabled: {
    opacity: 0.6
  },
  exportButtonContent: {
    minHeight: 40,
    paddingHorizontal: 8
  },
  exportButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold'
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333'
  }
})
