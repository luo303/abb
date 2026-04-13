// 导出工具函数

import { RecordType, ExportType } from '../../types/export'

/**
 * 获取导出文件名称
 * @param recordType 记录类型
 * @param exportType 导出类型
 * @returns 文件名称
 */
export function getExportFileName(
  recordType: RecordType,
  exportType: ExportType
): string {
  const typeMap: Record<RecordType, string> = {
    growth: '成长记录',
    vaccine: '疫苗记录',
    feeding: '喂养记录'
  }

  const extensionMap: Record<ExportType, string> = {
    pdf: '.pdf',
    excel: '.xlsx',
    image: '.png'
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${typeMap[recordType]}_${timestamp}${extensionMap[exportType]}`
}
