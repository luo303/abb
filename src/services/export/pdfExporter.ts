// PDF导出实现

import {
  RecordType,
  ExportOptions,
  ExportResult,
  ExportData,
  GrowthExportData,
  VaccineExportData
} from '../../types/export'
import {
  transformGrowthDataToHtml,
  transformVaccineDataToHtml,
  transformDailyDataToHtml
} from '../../utils/dataTransformUtils'
import { getExportFileName } from './exportUtils'

// 使用expo-print库生成PDF
import * as Print from 'expo-print'
import * as FileSystem from 'expo-file-system/legacy'

async function generatePdf(
  options: any
): Promise<{ filePath: string; success: boolean; error?: string }> {
  try {
    // 生成PDF
    console.log('生成PDF:', options.fileName)
    const { uri } = await Print.printToFileAsync({
      html: options.html,
      base64: false
    })

    // 复制到指定位置
    const outputPath = FileSystem.documentDirectory + options.fileName
    await FileSystem.copyAsync({
      from: uri,
      to: outputPath
    })

    return {
      filePath: outputPath,
      success: true
    }
  } catch (error) {
    console.error('PDF生成失败:', error)
    return {
      filePath: '',
      success: false,
      error: error instanceof Error ? error.message : 'PDF生成失败'
    }
  }
}

/**
 * 导出为PDF
 * @param recordType 记录类型
 * @param data 导出数据
 * @param options 导出选项
 * @returns 导出结果
 */
export async function exportToPdf(
  recordType: RecordType,
  data: ExportData,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    let html = ''

    switch (recordType) {
      case 'growth':
        html = transformGrowthDataToHtml(data as GrowthExportData)
        break
      case 'vaccine':
        html = transformVaccineDataToHtml(data as VaccineExportData)
        break
      case 'daily':
        html = transformDailyDataToHtml(data as any)
        break
      default:
        throw new Error('不支持的记录类型')
    }

    const fileName = getExportFileName(recordType, 'pdf')

    const result = await generatePdf({
      html,
      fileName,
      pageSize: 'A4',
      header: `<div style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">
                <h3>宝宝${getRecordTypeName(recordType)}记录</h3>
              </div>`,
      footer: `<div style="text-align: center; padding: 10px; border-top: 1px solid #eee;">
                <p>第 {page} 页，共 {total} 页</p>
                <p>导出时间：${new Date().toLocaleString()}</p>
              </div>`,
      headerHeight: 80,
      footerHeight: 80,
      showPageNumbers: true
    })

    if (result.success) {
      return {
        success: true,
        filePath: result.filePath,
        fileName
      }
    } else {
      return {
        success: false,
        error: result.error || 'PDF生成失败'
      }
    }
  } catch (error) {
    console.error('PDF导出失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDF导出失败'
    }
  }
}

/**
 * 获取记录类型的中文名称
 * @param recordType 记录类型
 * @returns 中文名称
 */
function getRecordTypeName(recordType: RecordType): string {
  const typeMap: Record<RecordType, string> = {
    growth: '成长',
    vaccine: '疫苗',
    feeding: '喂养',
    daily: '日常'
  }
  return typeMap[recordType] || recordType
}
