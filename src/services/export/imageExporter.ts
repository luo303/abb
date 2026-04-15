// 图片导出实现

import {
  RecordType,
  ExportOptions,
  ExportResult,
  ExportData
} from '../../types/export'
import { getExportFileName } from './exportUtils'

// 使用真实的react-native-view-shot库
import { captureRef as rnCaptureRef } from 'react-native-view-shot'

async function captureRef(ref: any, options: any): Promise<string> {
  try {
    // 捕获图片
    console.log('捕获图片:', options)
    const uri = await rnCaptureRef(ref, options)
    return uri
  } catch (error) {
    console.error('图片捕获失败:', error)
    throw new Error('图片捕获失败')
  }
}

/**
 * 导出为图片
 * @param recordType 记录类型
 * @param data 导出数据
 * @param options 导出选项
 * @returns 导出结果
 */
export async function exportToImage(
  recordType: RecordType,
  data: ExportData,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    // 检查是否提供了视图引用
    if (!data || !('viewRef' in data) || !data.viewRef) {
      throw new Error('缺少视图引用，无法导出图片')
    }

    const viewRef = data.viewRef

    // 捕获图片
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 0.9,
      result: 'tmpfile'
    })

    const fileName = getExportFileName(recordType, 'image')

    return {
      success: true,
      filePath: uri,
      fileName
    }
  } catch (error) {
    console.error('图片导出失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '图片导出失败'
    }
  }
}
