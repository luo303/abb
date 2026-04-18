// Excel导出实现

import {
  RecordType,
  ExportOptions,
  ExportResult,
  ExportData,
  GrowthExportData,
  VaccineExportData,
  FeedingExportData,
  AIGrowthReportExportData
} from '../../types/export'
import {
  transformGrowthDataToTable,
  transformVaccineDataToTable,
  transformFeedingDataToTable,
  transformDailyDataToTable,
  transformAIGrowthReportToTable
} from '../../utils/dataTransformUtils'
import { getExportFileName } from './exportUtils'

// 使用真实的xlsx库
import * as XLSX from 'xlsx'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'

/**
 * 导出为Excel
 * @param recordType 记录类型
 * @param data 导出数据
 * @param options 导出选项
 * @returns 导出结果
 */
export async function exportToExcel(
  recordType: RecordType,
  data: ExportData,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const wb = XLSX.utils.book_new()

    switch (recordType) {
      case 'growth':
        generateGrowthExcelSheets(wb, data as GrowthExportData, options)
        break
      case 'vaccine':
        generateVaccineExcelSheets(wb, data as VaccineExportData, options)
        break
      case 'feeding':
        generateFeedingExcelSheets(wb, data as FeedingExportData, options)
        break
      case 'daily':
        generateDailyExcelSheets(wb, data as any, options)
        break
      case 'ai_growth_report':
        generateAIGrowthReportExcelSheets(wb, data as AIGrowthReportExportData)
        break
      default:
        throw new Error('不支持的记录类型')
    }

    const fileName = getExportFileName(recordType, 'excel')

    // 使用XLSX.write生成Excel文件的base64数据
    const excelBase64 = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'base64'
    })

    // 创建文件路径
    const fileUri = FileSystem.documentDirectory + fileName

    // 写入文件
    await FileSystem.writeAsStringAsync(fileUri, excelBase64, {
      encoding: FileSystem.EncodingType.Base64
    })

    // 检查是否可以分享
    const isAvailable = await Sharing.isAvailableAsync()
    if (isAvailable) {
      // 分享文件
      await Sharing.shareAsync(fileUri, {
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: '分享Excel文件'
      })
    }

    return {
      success: true,
      filePath: fileUri,
      fileName
    }
  } catch (error) {
    console.error('Excel导出失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Excel导出失败'
    }
  }
}

/**
 * 生成成长曲线Excel工作表
 * @param wb 工作簿
 * @param data 成长曲线数据
 * @param options 导出选项
 */
function generateGrowthExcelSheets(
  wb: any,
  data: GrowthExportData,
  options: ExportOptions
) {
  // 生成成长数据明细工作表
  const growthTable = transformGrowthDataToTable(data)
  const growthSheet = XLSX.utils.aoa_to_sheet(growthTable)
  autoFitColumns(growthSheet, growthTable)
  XLSX.utils.book_append_sheet(wb, growthSheet, '成长数据明细')

  // 生成成长统计工作表
  if (options.includeStatistics) {
    const statsSheet = generateGrowthStatsSheet(data)
    const statsData = [
      ['统计项', '身高(cm)', '体重(kg)', '头围(cm)'],
      [
        '平均值',
        data.heightData.length > 0
          ? data.heightData.map(item => item.value).reduce((a, b) => a + b, 0) /
            data.heightData.length
          : 0,
        data.weightData.length > 0
          ? data.weightData.map(item => item.value).reduce((a, b) => a + b, 0) /
            data.weightData.length
          : 0,
        data.headData.length > 0
          ? data.headData.map(item => item.value).reduce((a, b) => a + b, 0) /
            data.headData.length
          : 0
      ],
      [
        '最大值',
        data.heightData.length > 0
          ? Math.max(...data.heightData.map(item => item.value))
          : 0,
        data.weightData.length > 0
          ? Math.max(...data.weightData.map(item => item.value))
          : 0,
        data.headData.length > 0
          ? Math.max(...data.headData.map(item => item.value))
          : 0
      ],
      [
        '最小值',
        data.heightData.length > 0
          ? Math.min(...data.heightData.map(item => item.value))
          : 0,
        data.weightData.length > 0
          ? Math.min(...data.weightData.map(item => item.value))
          : 0,
        data.headData.length > 0
          ? Math.min(...data.headData.map(item => item.value))
          : 0
      ],
      [
        '数据点数量',
        data.heightData.length,
        data.weightData.length,
        data.headData.length
      ]
    ]
    autoFitColumns(statsSheet, statsData)
    XLSX.utils.book_append_sheet(wb, statsSheet, '成长统计')
  }
}

/**
 * 生成疫苗记录Excel工作表
 * @param wb 工作簿
 * @param data 疫苗记录数据
 * @param options 导出选项
 */
function generateVaccineExcelSheets(
  wb: any,
  data: VaccineExportData,
  options: ExportOptions
) {
  // 生成疫苗接种记录工作表
  const vaccineTable = transformVaccineDataToTable(data)
  const vaccineSheet = XLSX.utils.aoa_to_sheet(vaccineTable)
  autoFitColumns(vaccineSheet, vaccineTable)
  XLSX.utils.book_append_sheet(wb, vaccineSheet, '疫苗接种记录')

  // 生成疫苗分类统计工作表
  if (options.includeStatistics) {
    const statsSheet = generateVaccineStatsSheet(data)
    const statsData = [
      ['统计项', '数量'],
      ['总疫苗数', data.vaccines.length.toString()],
      [
        '已接种',
        data.vaccines.filter(v => v.status === 'given').length.toString()
      ],
      [
        '未接种',
        data.vaccines.filter(v => v.status === 'not_given').length.toString()
      ],
      [
        '接种率',
        `${((data.vaccines.filter(v => v.status === 'given').length / data.vaccines.length) * 100).toFixed(2)}%`
      ]
    ]
    autoFitColumns(statsSheet, statsData)
    XLSX.utils.book_append_sheet(wb, statsSheet, '疫苗统计')
  }
}

/**
 * 生成喂养记录Excel工作表
 * @param wb 工作簿
 * @param data 喂养记录数据
 * @param options 导出选项
 */
function generateFeedingExcelSheets(
  wb: any,
  data: FeedingExportData,
  options: ExportOptions
) {
  // 生成喂养记录明细工作表
  const feedingTable = transformFeedingDataToTable(data)
  const feedingSheet = XLSX.utils.aoa_to_sheet(feedingTable)
  autoFitColumns(feedingSheet, feedingTable)
  XLSX.utils.book_append_sheet(wb, feedingSheet, '喂养记录明细')

  // 生成喂养统计工作表
  if (options.includeStatistics) {
    const statsSheet = generateFeedingStatsSheet(data)
    const feedTypeCount: Record<string, number> = {}
    const feedTypeAmount: Record<string, number> = {}

    data.feedingRecords.forEach(record => {
      const type = record.feed_type
      feedTypeCount[type] = (feedTypeCount[type] || 0) + 1
      if (record.amount) {
        feedTypeAmount[type] = (feedTypeAmount[type] || 0) + record.amount
      }
    })

    const statsData = [
      ['喂养类型', '次数', '总喂养量(ml)'],
      ...Object.entries(feedTypeCount).map(([type, count]) => [
        getFeedTypeName(type),
        count.toString(),
        (feedTypeAmount[type] || 0).toFixed(0)
      ]),
      [
        '总计',
        Object.values(feedTypeCount)
          .reduce((sum, count) => sum + count, 0)
          .toString(),
        Object.values(feedTypeAmount)
          .reduce((sum, amount) => sum + amount, 0)
          .toFixed(0)
      ]
    ]
    autoFitColumns(statsSheet, statsData)
    XLSX.utils.book_append_sheet(wb, statsSheet, '喂养统计')
  }
}

function generateAIGrowthReportExcelSheets(
  wb: any,
  data: AIGrowthReportExportData
) {
  const detailTable = transformAIGrowthReportToTable(data)
  const detailSheet = XLSX.utils.aoa_to_sheet(detailTable)
  autoFitColumns(detailSheet, detailTable)
  XLSX.utils.book_append_sheet(wb, detailSheet, '成长数据明细')

  const markdownLines = (data.markdown || '').split(/\r?\n/).map(line => [line])
  const markdownSheet = XLSX.utils.aoa_to_sheet([
    ['AI 成长报告（Markdown）'],
    ...markdownLines
  ])
  autoFitColumns(markdownSheet, [['AI 成长报告（Markdown）'], ...markdownLines])
  XLSX.utils.book_append_sheet(wb, markdownSheet, '报告正文')
}

/**
 * 生成成长统计工作表
 * @param data 成长曲线数据
 * @returns 工作表
 */
function generateGrowthStatsSheet(data: GrowthExportData) {
  // 计算身高统计
  const heightValues = data.heightData.map(item => item.value)
  const heightStats = calculateStats(heightValues)

  // 计算体重统计
  const weightValues = data.weightData.map(item => item.value)
  const weightStats = calculateStats(weightValues)

  // 计算头围统计
  const headValues = data.headData.map(item => item.value)
  const headStats = calculateStats(headValues)

  const statsData = [
    ['统计项', '身高(cm)', '体重(kg)', '头围(cm)'],
    [
      '平均值',
      heightStats.avg.toFixed(2),
      weightStats.avg.toFixed(2),
      headStats.avg.toFixed(2)
    ],
    [
      '最大值',
      heightStats.max.toFixed(2),
      weightStats.max.toFixed(2),
      headStats.max.toFixed(2)
    ],
    [
      '最小值',
      heightStats.min.toFixed(2),
      weightStats.min.toFixed(2),
      headStats.min.toFixed(2)
    ],
    [
      '数据点数量',
      heightValues.length.toString(),
      weightValues.length.toString(),
      headValues.length.toString()
    ]
  ]

  return XLSX.utils.aoa_to_sheet(statsData)
}

/**
 * 生成疫苗统计工作表
 * @param data 疫苗记录数据
 * @returns 工作表
 */
function generateVaccineStatsSheet(data: VaccineExportData) {
  const givenVaccines = data.vaccines.filter(v => v.status === 'given')
  const notGivenVaccines = data.vaccines.filter(v => v.status === 'not_given')

  const statsData = [
    ['统计项', '数量'],
    ['总疫苗数', data.vaccines.length.toString()],
    ['已接种', givenVaccines.length.toString()],
    ['未接种', notGivenVaccines.length.toString()],
    [
      '接种率',
      `${((givenVaccines.length / data.vaccines.length) * 100).toFixed(2)}%`
    ]
  ]

  return XLSX.utils.aoa_to_sheet(statsData)
}

/**
 * 生成喂养统计工作表
 * @param data 喂养记录数据
 * @returns 工作表
 */
function generateFeedingStatsSheet(data: FeedingExportData) {
  const feedTypeCount: Record<string, number> = {}
  const feedTypeAmount: Record<string, number> = {}

  data.feedingRecords.forEach(record => {
    const type = record.feed_type
    feedTypeCount[type] = (feedTypeCount[type] || 0) + 1
    if (record.amount) {
      feedTypeAmount[type] = (feedTypeAmount[type] || 0) + record.amount
    }
  })

  const statsData = [
    ['喂养类型', '次数', '总喂养量(ml)'],
    ...Object.entries(feedTypeCount).map(([type, count]) => [
      getFeedTypeName(type),
      count.toString(),
      (feedTypeAmount[type] || 0).toFixed(0)
    ]),
    [
      '总计',
      Object.values(feedTypeCount)
        .reduce((sum, count) => sum + count, 0)
        .toString(),
      Object.values(feedTypeAmount)
        .reduce((sum, amount) => sum + amount, 0)
        .toFixed(0)
    ]
  ]

  return XLSX.utils.aoa_to_sheet(statsData)
}

/**
 * 生成日常记录Excel工作表
 * @param wb 工作簿
 * @param data 日常记录数据
 * @param options 导出选项
 */
function generateDailyExcelSheets(wb: any, data: any, options: ExportOptions) {
  // 生成日常记录明细工作表
  const dailyTable = transformDailyDataToTable(data)
  const dailySheet = XLSX.utils.aoa_to_sheet(dailyTable)
  autoFitColumns(dailySheet, dailyTable)
  XLSX.utils.book_append_sheet(wb, dailySheet, '日常记录明细')

  // 生成日常记录统计工作表
  if (options.includeStatistics) {
    const statsSheet = generateDailyStatsSheet(data)
    const statsData = [
      ['统计项', '数量'],
      ['总记录数', data.records.length.toString()],
      ['喂养次数', data.statistics.feedingCount.toString()],
      ['睡眠次数', data.statistics.sleepCount.toString()],
      ['睡眠时长(小时)', data.statistics.sleepDuration.toString()],
      ['尿布更换次数', data.statistics.diaperCount.toString()]
    ]
    autoFitColumns(statsSheet, statsData)
    XLSX.utils.book_append_sheet(wb, statsSheet, '日常记录统计')
  }
}

/**
 * 生成日常记录统计工作表
 * @param data 日常记录数据
 * @returns 工作表
 */
function generateDailyStatsSheet(data: any) {
  const statsData = [
    ['统计项', '数量'],
    ['总记录数', data.records.length.toString()],
    ['喂养次数', data.statistics.feedingCount.toString()],
    ['睡眠次数', data.statistics.sleepCount.toString()],
    ['睡眠时长(小时)', data.statistics.sleepDuration.toString()],
    ['尿布更换次数', data.statistics.diaperCount.toString()]
  ]

  return XLSX.utils.aoa_to_sheet(statsData)
}

/**
 * 计算数组的统计值
 * @param values 数值数组
 * @returns 统计结果
 */
function calculateStats(values: number[]): {
  avg: number
  max: number
  min: number
} {
  if (values.length === 0) {
    return { avg: 0, max: 0, min: 0 }
  }

  const sum = values.reduce((acc, val) => acc + val, 0)
  const avg = sum / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)

  return { avg, max, min }
}

/**
 * 获取喂养类型的中文名称
 * @param type 喂养类型
 * @returns 中文名称
 */
function getFeedTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    formula: '奶粉',
    breast: '母乳',
    pump: '泵奶',
    food: '辅食'
  }
  return typeMap[type] || type
}

/**
 * 自动调整工作表列宽
 * @param worksheet 工作表
 * @param data 数据数组
 */
function autoFitColumns(worksheet: any, data: any[]) {
  if (!data || data.length === 0) return

  // 计算每列的最大宽度
  const maxWidths = data[0].map((_: any, colIndex: number) =>
    Math.max(...data.map(row => (row[colIndex] || '').toString().length))
  )

  // 设置列宽（适当增加一些余量，增加上限到150）
  worksheet['!cols'] = maxWidths.map((width: number) => ({
    wch: Math.min(width * 1.5 + 10, 150)
  }))

  // 设置行高，增加一些高度以容纳可能的换行
  worksheet['!rows'] = data.map(() => ({ hpt: 25 }))

  // 为所有单元格设置自动换行
  for (const cell in worksheet) {
    // 跳过特殊单元格（如!cols, !rows等）
    if (cell.startsWith('!')) continue

    // 为单元格添加自动换行属性
    if (worksheet[cell] && typeof worksheet[cell] === 'object') {
      if (!worksheet[cell].s) {
        worksheet[cell].s = {}
      }
      if (!worksheet[cell].s.alignment) {
        worksheet[cell].s.alignment = {}
      }
      worksheet[cell].s.alignment.wrapText = true
    }
  }
}
