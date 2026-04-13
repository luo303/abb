import React, { useMemo, useState, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import BaseGrowthChart from './BaseGrowthChart'
import ViewShot from 'react-native-view-shot'
import { STANDARD_GROWTH_DATA } from '../../../data/mock/standard'
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector'
import DataDescription from './DataDescription'
import ExportModal from '../../export/ExportModal'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import {
  exportData,
  shareExportFile
} from '../../../services/export/exportService'

export default function CurveHeadChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const chartRef = useRef<ViewShot>(null)
  const { growthCurve, currentBabyDetail } = useSelector(
    (state: RootState) => state.baby
  )

  const handleExport = async (type: string) => {
    if (!currentBabyDetail) return

    setIsExporting(true)
    try {
      const exportDataObj = {
        babyInfo: {
          name: currentBabyDetail.name,
          gender: currentBabyDetail.gender,
          birthday: currentBabyDetail.birthday
        },
        heightData: growthCurve.height,
        weightData: growthCurve.weight,
        headData: growthCurve.head,
        viewRef: chartRef.current
      }

      const result = await exportData(
        {
          type: type as any,
          recordType: 'growth',
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

  const babyGrowthData = useMemo(() => {
    if (!currentBabyDetail || !growthCurve.head.length) return []

    const origin = currentBabyDetail.birthday
    return growthCurve.head
      .map(item => {
        const day = getDayDiff(origin, item.time)
        return {
          day: Math.max(0, day),
          value: item.value
        }
      })
      .sort((a, b) => a.day - b.day)
  }, [growthCurve.head, currentBabyDetail])

  const hasBabyHistory = babyGrowthData.length > 0

  const { standardData, babyData, xAxisName } = useMemo(() => {
    let xAxisName = '天'
    let baby: any[] = []

    if (!hasBabyHistory) {
      if (timeRange === 'day') {
        const standard = STANDARD_GROWTH_DATA.head.map(item => ({
          label: item.day,
          value: item.male
        }))
        return { standardData: standard, babyData: [], xAxisName: '天' }
      }
      const period = timeRange === 'week' ? 7 : 30
      xAxisName = timeRange === 'week' ? '周' : '月'
      const standard = STANDARD_GROWTH_DATA.head
        .filter(item => {
          const day = Number(item.day)
          return day >= period && day % period === 0
        })
        .map(item => ({
          label: (Number(item.day) / period).toString(),
          value: item.male
        }))
      return { standardData: standard, babyData: [], xAxisName }
    }

    if (timeRange === 'day') {
      baby = babyGrowthData.map(item => ({
        label: item.day.toString(),
        value: item.value,
        originalDay: item.day.toString()
      }))
    } else {
      const period = timeRange === 'week' ? 7 : 30
      xAxisName = timeRange === 'week' ? '周' : '月'

      const maxDay = Math.max(...babyGrowthData.map(d => d.day))
      const periodCount = Math.ceil(maxDay / period) || 1

      for (let i = 1; i <= periodCount; i++) {
        const startDay = (i - 1) * period
        const endDay = i * period

        const recordsInPeriod = babyGrowthData.filter(
          item => item.day > startDay && item.day <= endDay
        )

        if (recordsInPeriod.length > 0) {
          const lastRecord = recordsInPeriod[recordsInPeriod.length - 1]
          baby.push({
            label: i.toString(),
            value: lastRecord.value,
            originalDay: lastRecord.day.toString()
          })
        }
      }
    }

    const babyDays = new Set(baby.map(item => item.originalDay))

    const standard = STANDARD_GROWTH_DATA.head
      .filter(item => babyDays.has(item.day))
      .map(item => {
        const babyItem = baby.find(b => b.originalDay === item.day)
        return {
          label: babyItem ? babyItem.label : item.day,
          value: item.male
        }
      })

    return { standardData: standard, babyData: baby, xAxisName }
  }, [timeRange, babyGrowthData, hasBabyHistory])

  const { yMin, yMax } = useMemo(() => {
    const values = [
      ...standardData.map(d => d.value),
      ...babyData.map(d => d.value)
    ].filter(v => typeof v === 'number' && !Number.isNaN(v)) as number[]

    if (values.length === 0) {
      return { yMin: 32, yMax: 42 }
    }
    let min = Math.min(...values)
    let max = Math.max(...values)
    if (min === max) {
      min -= 1
      max += 1
    }
    const padding = Math.max((max - min) * 0.1, 0.5)
    return { yMin: Math.floor(min - padding), yMax: Math.ceil(max + padding) }
  }, [standardData, babyData])

  return (
    <>
      <View style={styles.headerContainer}>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowExportModal(true)}
          disabled={isExporting}
        >
          <LinearGradient
            colors={['#ff9a9e', '#f43f5e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.exportButton,
              isExporting && styles.exportButtonDisabled
            ]}
          >
            <Text style={styles.exportButtonText}>
              {isExporting ? '导出中...' : '导出'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <ViewShot ref={chartRef} options={{ format: 'png', quality: 0.9 }}>
        <BaseGrowthChart
          title="头围发育曲线"
          unit="cm"
          xAxisName={xAxisName}
          standardData={standardData}
          babyData={babyData}
          yMin={yMin}
          yMax={yMax}
          // 使用默认颜色：标准数据蓝线，宝宝数据红线
        />
      </ViewShot>
      <DataDescription type="head" />
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        recordType="growth"
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

const DAY_MS = 24 * 60 * 60 * 1000

const getDayDiff = (startTime: number, endTime: number) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.floor((end.getTime() - start.getTime()) / DAY_MS)
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10
  },
  exportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
