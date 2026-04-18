// 数据转换工具

import {
  GrowthExportData,
  VaccineExportData,
  FeedingExportData,
  AIGrowthReportExportData
} from '../types/export'
import { formatDate } from './dateUtils'
import { calculatePercentile, getGrowthDataStats } from './growthUtils'

/**
 * 转换成长曲线数据为表格格式
 * @param data 成长曲线数据
 * @returns 二维数组格式的表格数据
 */
export function transformGrowthDataToTable(data: GrowthExportData): string[][] {
  // 合并所有数据点，按时间排序
  const allDataPoints = new Map<
    number,
    { height?: number; weight?: number; head?: number }
  >()

  // 添加身高数据
  data.heightData.forEach(item => {
    const existing = allDataPoints.get(item.time) || {}
    allDataPoints.set(item.time, { ...existing, height: item.value })
  })

  // 添加体重数据
  data.weightData.forEach(item => {
    const existing = allDataPoints.get(item.time) || {}
    allDataPoints.set(item.time, { ...existing, weight: item.value })
  })

  // 添加头围数据
  data.headData.forEach(item => {
    const existing = allDataPoints.get(item.time) || {}
    allDataPoints.set(item.time, { ...existing, head: item.value })
  })

  // 转换为数组并按时间排序
  const sortedData = Array.from(allDataPoints.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([time, values]) => {
      // 计算天数（从出生日期到记录时间）
      const day = Math.floor(
        (time - data.babyInfo.birthday) / (24 * 60 * 60 * 1000)
      )

      // 计算百分位
      const gender: 'male' | 'female' =
        data.babyInfo.gender === 'male' ? 'male' : 'female'
      const heightPercentile = values.height
        ? calculatePercentile('height', values.height, day, gender)
        : ''
      const weightPercentile = values.weight
        ? calculatePercentile('weight', values.weight, day, gender)
        : ''
      const headPercentile = values.head
        ? calculatePercentile('head', values.head, day, gender)
        : ''

      return [
        formatDate(time, 'YYYY-MM-DD'),
        values.height?.toFixed(1) || '',
        String(heightPercentile || ''),
        values.weight?.toFixed(2) || '',
        String(weightPercentile || ''),
        values.head?.toFixed(1) || '',
        String(headPercentile || '')
      ]
    })

  // 添加表头
  return [
    [
      '日期',
      '身高(cm)',
      '身高百分位',
      '体重(kg)',
      '体重百分位',
      '头围(cm)',
      '头围百分位'
    ],
    ...sortedData
  ]
}

/**
 * 转换疫苗记录数据为表格格式
 * @param data 疫苗记录数据
 * @returns 二维数组格式的表格数据
 */
export function transformVaccineDataToTable(
  data: VaccineExportData
): string[][] {
  const sortedVaccines = data.vaccines.sort((a, b) => a.due_time - b.due_time)

  const tableData = sortedVaccines.map(vaccine => [
    vaccine.name,
    vaccine.dose_number.toString(),
    formatDate(vaccine.due_time),
    vaccine.status === 'given' ? formatDate(vaccine.actual_time) : '未接种',
    vaccine.status === 'given' ? '已接种' : '未接种',
    vaccine.disease
  ])

  return [
    ['疫苗名称', '剂次', '推荐接种时间', '实际接种时间', '状态', '预防疾病'],
    ...tableData
  ]
}

/**
 * 转换喂养记录数据为表格格式
 * @param data 喂养记录数据
 * @returns 二维数组格式的表格数据
 */
export function transformFeedingDataToTable(
  data: FeedingExportData
): string[][] {
  const sortedRecords = data.feedingRecords.sort(
    (a, b) => a.feed_time - b.feed_time
  )

  const tableData = sortedRecords.map(record => {
    const feedTypeMap: Record<string, string> = {
      formula: '奶粉',
      breast: '母乳',
      pump: '泵奶',
      food: '辅食'
    }

    return [
      formatDate(record.feed_time, 'YYYY-MM-DD HH:mm'),
      feedTypeMap[record.feed_type] || record.feed_type,
      record.amount
        ? `${record.amount}ml`
        : record.duration
          ? `${record.duration}分钟`
          : '',
      record.remark || ''
    ]
  })

  return [['时间', '喂养类型', '量/时长', '备注'], ...tableData]
}

/**
 * 转换成长曲线数据为HTML格式
 * @param data 成长曲线数据
 * @returns HTML字符串
 */
export function transformGrowthDataToHtml(data: GrowthExportData): string {
  const tableData = transformGrowthDataToTable(data)

  // 生成表格HTML（跳过表头行）
  const tableHtml = tableData
    .slice(1) // 跳过表头行
    .map(row => {
      return `<tr>${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}</tr>`
    })
    .join('')

  // 计算统计信息
  const heightStats = getGrowthDataStats(
    data.heightData.map(item => ({
      day: Math.floor(
        (item.time - data.babyInfo.birthday) / (24 * 60 * 60 * 1000)
      ),
      value: item.value
    }))
  )

  const weightStats = getGrowthDataStats(
    data.weightData.map(item => ({
      day: Math.floor(
        (item.time - data.babyInfo.birthday) / (24 * 60 * 60 * 1000)
      ),
      value: item.value
    }))
  )

  const headStats = getGrowthDataStats(
    data.headData.map(item => ({
      day: Math.floor(
        (item.time - data.babyInfo.birthday) / (24 * 60 * 60 * 1000)
      ),
      value: item.value
    }))
  )

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="text-align: center; color: #333;">${data.babyInfo.name}的成长记录</h1>
      
      <div style="margin: 20px 0;">
        <h2>基本信息</h2>
        <p>姓名: ${data.babyInfo.name}</p>
        <p>性别: ${data.babyInfo.gender === 'male' ? '男孩' : '女孩'}</p>
        <p>出生日期: ${formatDate(data.babyInfo.birthday)}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h2>成长统计</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">指标</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">数据点数量</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">平均值</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">最小值</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">最大值</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">最新值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">身高(cm)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${heightStats.count}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${heightStats.average}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${heightStats.min}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${heightStats.max}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${heightStats.latest}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">体重(kg)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${weightStats.count}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${weightStats.average}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${weightStats.min}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${weightStats.max}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${weightStats.latest}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">头围(cm)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${headStats.count}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${headStats.average}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${headStats.min}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${headStats.max}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${headStats.latest}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style="margin: 20px 0;">
        <h2>成长数据详情</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            ${tableData[0].map(cell => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${cell}</th>`).join('')}
          </thead>
          <tbody>
            ${tableHtml}
          </tbody>
        </table>
      </div>
    </div>
  `
}

/**
 * 转换疫苗记录数据为HTML格式
 * @param data 疫苗记录数据
 * @returns HTML字符串
 */
export function transformVaccineDataToHtml(data: VaccineExportData): string {
  const tableData = transformVaccineDataToTable(data)

  // 生成表格HTML（跳过表头行）
  const tableHtml = tableData
    .slice(1) // 跳过表头行
    .map(row => {
      return `<tr>${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}</tr>`
    })
    .join('')

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="text-align: center; color: #333;">${data.babyInfo.name}的疫苗接种记录</h1>
      
      <div style="margin: 20px 0;">
        <h2>基本信息</h2>
        <p>姓名: ${data.babyInfo.name}</p>
        <p>性别: ${data.babyInfo.gender === 'male' ? '男孩' : '女孩'}</p>
        <p>出生日期: ${formatDate(data.babyInfo.birthday)}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h2>疫苗接种记录</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            ${tableData[0].map(cell => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${cell}</th>`).join('')}
          </thead>
          <tbody>
            ${tableHtml}
          </tbody>
        </table>
      </div>
    </div>
  `
}

/**
 * 转换喂养记录数据为HTML格式
 * @param data 喂养记录数据
 * @returns HTML字符串
 */
export function transformFeedingDataToHtml(data: FeedingExportData): string {
  const tableData = transformFeedingDataToTable(data)

  // 生成表格HTML（跳过表头行）
  const tableHtml = tableData
    .slice(1) // 跳过表头行
    .map(row => {
      return `<tr>${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}</tr>`
    })
    .join('')

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="text-align: center; color: #333;">${data.babyInfo.name}的喂养记录</h1>
      
      <div style="margin: 20px 0;">
        <h2>基本信息</h2>
        <p>姓名: ${data.babyInfo.name}</p>
        <p>性别: ${data.babyInfo.gender === 'male' ? '男孩' : '女孩'}</p>
        <p>出生日期: ${formatDate(data.babyInfo.birthday)}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h2>喂养记录</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            ${tableData[0].map(cell => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${cell}</th>`).join('')}
          </thead>
          <tbody>
            ${tableHtml}
          </tbody>
        </table>
      </div>
    </div>
  `
}

/**
 * 转换日常记录数据为表格格式
 * @param data 日常记录数据
 * @returns 二维数组格式的表格数据
 */
export function transformDailyDataToTable(data: any): string[][] {
  const sortedRecords = data.records.sort((a: any, b: any) => {
    const timeA =
      typeof a.time === 'string' ? new Date(a.time).getTime() : a.time
    const timeB =
      typeof b.time === 'string' ? new Date(b.time).getTime() : b.time
    return timeB - timeA
  })

  const tableData = sortedRecords.map((record: any) => {
    const typeMap: Record<string, string> = {
      feeding: '喂养',
      sleep: '睡眠',
      diaper: '尿布'
    }

    return [
      formatDate(
        typeof record.time === 'string' ? record.time : record.time,
        'YYYY-MM-DD HH:mm'
      ),
      typeMap[record.type] || record.type,
      record.details || '',
      record.remark || ''
    ]
  })

  return [['时间', '类型', '详情', '备注'], ...tableData]
}

/**
 * 转换日常记录数据为HTML格式
 * @param data 日常记录数据
 * @returns HTML字符串
 */
export function transformDailyDataToHtml(data: any): string {
  const tableData = transformDailyDataToTable(data)

  // 生成表格HTML（跳过表头行）
  const tableHtml = tableData
    .slice(1) // 跳过表头行
    .map(row => {
      return `<tr>${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}</tr>`
    })
    .join('')

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="text-align: center; color: #333;">宝宝的日常记录</h1>
      
      <div style="margin: 20px 0;">
        <h2>基本信息</h2>
        <p>宝宝ID: ${data.babyId}</p>
        <p>记录日期: ${data.date}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h2>日常记录统计</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">统计项</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">数量</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">总记录数</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.records.length}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">喂养次数</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.statistics.feedingCount}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">睡眠次数</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.statistics.sleepCount}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">睡眠时长(小时)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.statistics.sleepDuration}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">尿布更换次数</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.statistics.diaperCount}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style="margin: 20px 0;">
        <h2>日常记录详情</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            ${tableData[0].map(cell => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${cell}</th>`).join('')}
          </thead>
          <tbody>
            ${tableHtml}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function escapeHtml(raw: string) {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function markdownToHtml(markdown: string) {
  const source = typeof markdown === 'string' ? markdown : ''
  const normalized = source.replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')

  const parts: string[] = []
  let inCodeBlock = false
  let codeLang = ''
  let codeLines: string[] = []
  let pendingList: { type: 'ul' | 'ol'; items: string[] } | null = null

  const flushList = () => {
    if (!pendingList) return
    const tag = pendingList.type
    const items = pendingList.items
      .map(item => `<li style="margin: 6px 0;">${item}</li>`)
      .join('')
    parts.push(
      `<${tag} style="margin: 10px 0 12px 22px; padding: 0;">${items}</${tag}>`
    )
    pendingList = null
  }

  const applyInline = (text: string) => {
    const escaped = escapeHtml(text)
    const withCode = escaped.replace(/`([^`]+?)`/g, '<code>$1</code>')
    const withBold = withCode.replace(
      /\*\*([^*]+?)\*\*/g,
      '<strong>$1</strong>'
    )
    return withBold
  }

  for (const rawLine of lines) {
    const line = rawLine ?? ''

    const codeFenceMatch = line.match(/^```(\w+)?\s*$/)
    if (codeFenceMatch) {
      if (!inCodeBlock) {
        flushList()
        inCodeBlock = true
        codeLang = codeFenceMatch[1] || ''
        codeLines = []
      } else {
        const code = escapeHtml(codeLines.join('\n'))
        parts.push(
          `<pre style="background: #f5f7fa; border: 1px solid #e5e7eb; padding: 12px; border-radius: 10px; overflow: auto;"><code class="language-${escapeHtml(codeLang)}">${code}</code></pre>`
        )
        inCodeBlock = false
        codeLang = ''
        codeLines = []
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      continue
    }

    const h3 = trimmed.match(/^###\s+(.*)$/)
    if (h3) {
      flushList()
      parts.push(
        `<h3 style="margin: 18px 0 10px; color: #111827;">${applyInline(h3[1])}</h3>`
      )
      continue
    }
    const h2 = trimmed.match(/^##\s+(.*)$/)
    if (h2) {
      flushList()
      parts.push(
        `<h2 style="margin: 20px 0 12px; color: #111827;">${applyInline(h2[1])}</h2>`
      )
      continue
    }
    const h1 = trimmed.match(/^#\s+(.*)$/)
    if (h1) {
      flushList()
      parts.push(
        `<h1 style="margin: 22px 0 14px; color: #111827; text-align: center;">${applyInline(h1[1])}</h1>`
      )
      continue
    }

    const ul = trimmed.match(/^[-*]\s+(.*)$/)
    if (ul) {
      const item = applyInline(ul[1])
      if (!pendingList || pendingList.type !== 'ul') {
        flushList()
        pendingList = { type: 'ul', items: [] }
      }
      pendingList.items.push(item)
      continue
    }

    const ol = trimmed.match(/^\d+\.\s+(.*)$/)
    if (ol) {
      const item = applyInline(ol[1])
      if (!pendingList || pendingList.type !== 'ol') {
        flushList()
        pendingList = { type: 'ol', items: [] }
      }
      pendingList.items.push(item)
      continue
    }

    flushList()
    parts.push(
      `<p style="margin: 0 0 10px; line-height: 1.7;">${applyInline(trimmed)}</p>`
    )
  }

  flushList()

  if (inCodeBlock && codeLines.length > 0) {
    const code = escapeHtml(codeLines.join('\n'))
    parts.push(
      `<pre style="background: #f5f7fa; border: 1px solid #e5e7eb; padding: 12px; border-radius: 10px; overflow: auto;"><code class="language-${escapeHtml(codeLang)}">${code}</code></pre>`
    )
  }

  return parts.join('\n')
}

export function transformAIGrowthReportToTable(
  data: AIGrowthReportExportData
): string[][] {
  const sortedItems = [...(data.items || [])].sort((a, b) => a.time - b.time)
  const rows = sortedItems.map(item => [
    formatDate(item.time, 'YYYY-MM-DD'),
    typeof item.height === 'number' ? item.height.toFixed(1) : '',
    typeof item.weight === 'number' ? item.weight.toFixed(2) : '',
    typeof item.head_circumference === 'number'
      ? item.head_circumference.toFixed(1)
      : '',
    item.remark || ''
  ])

  return [['日期', '身高(cm)', '体重(kg)', '头围(cm)', '备注'], ...rows]
}

export function transformAIGrowthReportToHtml(
  data: AIGrowthReportExportData
): string {
  const tableData = transformAIGrowthReportToTable(data)
  const tableHtml = tableData
    .slice(1)
    .map(row => {
      return `<tr>${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(cell)}</td>`).join('')}</tr>`
    })
    .join('')

  const fromText =
    typeof data.range?.from === 'number' ? formatDate(data.range.from) : ''
  const toText =
    typeof data.range?.to === 'number' ? formatDate(data.range.to) : ''
  const rangeText =
    fromText && toText ? `${fromText} ~ ${toText}` : `近${data.range.days}天`

  const markdownHtml = markdownToHtml(data.markdown || '')

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #111827;">
      <h1 style="text-align: center; color: #111827;">AI 成长报告</h1>
      <div style="margin: 18px 0; padding: 14px; border: 1px solid #ffe4e6; background: #fff7f9; border-radius: 12px;">
        <div style="font-size: 14px; line-height: 1.8;">
          <div><strong>宝宝：</strong>${escapeHtml(data.babyInfo.name || '')}</div>
          <div><strong>性别：</strong>${data.babyInfo.gender === 'male' ? '男孩' : '女孩'}</div>
          <div><strong>出生日期：</strong>${formatDate(data.babyInfo.birthday)}</div>
          <div><strong>周期：</strong>${escapeHtml(rangeText)}</div>
          <div><strong>语言：</strong>${escapeHtml(data.language)}</div>
        </div>
      </div>

      <div style="margin: 18px 0;">
        <h2 style="margin: 0 0 12px;">报告正文</h2>
        <div>${markdownHtml}</div>
      </div>

      <div style="margin: 22px 0 0;">
        <h2 style="margin: 0 0 12px;">成长数据明细</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            ${tableData[0].map(cell => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${escapeHtml(cell)}</th>`).join('')}
          </thead>
          <tbody>
            ${tableHtml}
          </tbody>
        </table>
      </div>
    </div>
  `
}
