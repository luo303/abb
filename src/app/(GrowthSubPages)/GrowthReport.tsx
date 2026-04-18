import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from 'react-native-paper'
import Markdown from 'react-native-markdown-display'
import dayjs from 'dayjs'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

import { APP_COLORS } from '@/theme/paperTheme'
import { NavigationProps } from '@/types/navigation'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ExportButton from '@/components/export/ExportButton'
import {
  GrowthReportLanguage,
  GrowthReportRequest,
  makeGrowthReportCacheKey
} from '@/api/ai'
import {
  fetchGrowthReport,
  selectGrowthReportCacheItemByKey
} from '@/store/modules/AIReportStore'

const RANGE_OPTIONS = [7, 30, 90, 180] as const
const LANGUAGE_OPTIONS: { value: GrowthReportLanguage; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' }
]

export default function GrowthReport() {
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const babyId = useAppSelector(state => state.baby.currentBabyId)
  const babyDetail = useAppSelector(state => state.baby.currentBabyDetail)
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(90)
  const [language, setLanguage] = useState<GrowthReportLanguage>('zh')

  const request: GrowthReportRequest | null = useMemo(() => {
    if (!babyId) return null
    return { baby_id: babyId, range_days: rangeDays, language }
  }, [babyId, language, rangeDays])

  const cacheKey = useMemo(() => {
    if (!request) return null
    return makeGrowthReportCacheKey(request)
  }, [request])

  const cacheItem = useAppSelector(state => {
    if (!cacheKey) return undefined
    return selectGrowthReportCacheItemByKey(state, cacheKey)
  })

  const report = cacheItem?.report
  const status = cacheItem?.status || 'idle'
  const errorText = cacheItem?.error

  useEffect(() => {
    if (!request) return
    if (status === 'loading' || status === 'succeeded') return
    dispatch(fetchGrowthReport(request))
  }, [dispatch, request, status])

  const handleGenerate = useCallback(() => {
    if (!request) return
    dispatch(fetchGrowthReport(request))
  }, [dispatch, request])

  const markdownStyle = useMemo<any>(() => {
    return {
      body: {
        width: '100%',
        color: APP_COLORS.text
      },
      text: {
        fontSize: 16,
        lineHeight: 26,
        color: APP_COLORS.text
      },
      paragraph: {
        width: '100%',
        marginTop: 0,
        marginBottom: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      },
      ordered_list: {
        width: '100%',
        marginVertical: 0
      },
      bullet_list: {
        width: '100%',
        marginVertical: 0
      },
      list_item: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6
      },
      ordered_list_icon: {
        width: 28,
        marginLeft: 0,
        marginRight: 6,
        lineHeight: 26,
        color: APP_COLORS.text
      },
      ordered_list_content: {
        flex: 1,
        flexShrink: 1
      },
      bullet_list_icon: {
        width: 22,
        marginLeft: 0,
        marginRight: 6,
        lineHeight: 26,
        color: APP_COLORS.text
      },
      bullet_list_content: {
        flex: 1,
        flexShrink: 1
      },
      heading1: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '700',
        marginBottom: 10,
        color: APP_COLORS.text
      },
      heading2: {
        fontSize: 22,
        lineHeight: 30,
        fontWeight: '700',
        marginBottom: 10,
        color: APP_COLORS.text
      },
      heading3: {
        fontSize: 19,
        lineHeight: 28,
        fontWeight: '700',
        marginBottom: 8,
        color: APP_COLORS.text
      },
      strong: {
        fontWeight: '700',
        color: APP_COLORS.text
      },
      blockquote: {
        marginVertical: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderLeftWidth: 3,
        borderLeftColor: APP_COLORS.outlineVariant,
        backgroundColor: APP_COLORS.backgroundSoft
      },
      code_inline: {
        borderWidth: 1,
        borderColor: APP_COLORS.outlineVariant,
        backgroundColor: APP_COLORS.backgroundSoft,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        color: APP_COLORS.text
      },
      code_block: {
        borderWidth: 1,
        borderColor: APP_COLORS.outlineVariant,
        backgroundColor: APP_COLORS.backgroundSoft,
        borderRadius: 10,
        padding: 12,
        color: APP_COLORS.text
      },
      fence: {
        borderWidth: 1,
        borderColor: APP_COLORS.outlineVariant,
        backgroundColor: APP_COLORS.backgroundSoft,
        borderRadius: 10,
        padding: 12,
        color: APP_COLORS.text
      }
    }
  }, [])

  const meta = useMemo(() => {
    const babyName = babyDetail?.name || '宝宝'
    const lastUpdatedText =
      cacheItem?.fetchedAt && status === 'succeeded'
        ? dayjs(cacheItem.fetchedAt).format('YYYY-MM-DD HH:mm')
        : null

    const items = report?.data?.growth?.items || []
    const lastItem = items.length > 0 ? items[items.length - 1] : null
    const rangeFrom = report?.data?.range?.from
    const rangeTo = report?.data?.range?.to

    return {
      babyName,
      lastUpdatedText,
      itemsCount: items.length,
      lastItem,
      rangeText:
        typeof rangeFrom === 'number' && typeof rangeTo === 'number'
          ? `${dayjs(rangeFrom).format('YYYY-MM-DD')} ~ ${dayjs(rangeTo).format('YYYY-MM-DD')}`
          : null
    }
  }, [
    babyDetail?.name,
    cacheItem?.fetchedAt,
    report?.data?.growth?.items,
    report?.data?.range?.from,
    report?.data?.range?.to,
    status
  ])

  const exportData = useMemo(() => {
    if (!report?.data) return null
    const baby = report.data.baby
    const babyInfo = {
      name: baby?.name || babyDetail?.name || '',
      gender: baby?.gender || babyDetail?.gender || '',
      birthday: baby?.birthday || babyDetail?.birthday || 0
    }
    const range = {
      from: report.data.range?.from,
      to: report.data.range?.to,
      days: report.data.range?.days ?? rangeDays
    }
    const items = report.data.growth?.items || []

    return {
      babyInfo,
      range,
      language,
      markdown: report.markdown || '',
      items
    }
  }, [
    babyDetail?.birthday,
    babyDetail?.gender,
    babyDetail?.name,
    language,
    rangeDays,
    report
  ])

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="sparkles" size={18} color={APP_COLORS.primary} />
            </View>
            <Text style={styles.headerTitle}>AI 成长报告</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            选择周期，一键生成结构化成长分析与可读报告
          </Text>
        </View>

        {!babyId ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>暂无宝宝信息</Text>
            <Text style={styles.emptySubtitle}>
              先添加并选择宝宝后即可生成报告
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AddBaby')}
              buttonColor={APP_COLORS.primary}
              textColor={APP_COLORS.white}
              style={styles.emptyButton}
              uppercase={false}
            >
              去添加宝宝
            </Button>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>周期</Text>
              <View style={styles.chipRow}>
                {RANGE_OPTIONS.map(days => {
                  const selected = days === rangeDays
                  return (
                    <TouchableOpacity
                      key={days}
                      activeOpacity={0.85}
                      onPress={() => setRangeDays(days)}
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : styles.chipUnselected
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected
                            ? styles.chipTextSelected
                            : styles.chipTextUnselected
                        ]}
                      >
                        近{days}天
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
                语言
              </Text>
              <View style={styles.chipRow}>
                {LANGUAGE_OPTIONS.map(option => {
                  const selected = option.value === language
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.85}
                      onPress={() => setLanguage(option.value)}
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : styles.chipUnselected
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected
                            ? styles.chipTextSelected
                            : styles.chipTextUnselected
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <View style={styles.actionRow}>
                <Button
                  mode="contained"
                  onPress={handleGenerate}
                  disabled={status === 'loading'}
                  buttonColor={APP_COLORS.primary}
                  textColor={APP_COLORS.white}
                  style={styles.actionButton}
                  uppercase={false}
                >
                  {status === 'loading' ? '生成中...' : '生成 / 刷新'}
                </Button>
                {meta.lastUpdatedText ? (
                  <Text style={styles.updatedText}>
                    更新于 {meta.lastUpdatedText}
                  </Text>
                ) : null}
              </View>
            </View>

            {status === 'loading' && !report ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color={APP_COLORS.primary} />
                <Text style={styles.loadingText}>正在生成报告...</Text>
              </View>
            ) : status === 'failed' && !report ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>生成失败</Text>
                <Text style={styles.errorSubtitle}>
                  {errorText || '请稍后重试'}
                </Text>
                <Button
                  mode="contained"
                  onPress={handleGenerate}
                  buttonColor={APP_COLORS.primary}
                  textColor={APP_COLORS.white}
                  style={styles.retryButton}
                  uppercase={false}
                >
                  重试
                </Button>
              </View>
            ) : report ? (
              <>
                <View style={styles.metaGrid}>
                  <View style={styles.metaCell}>
                    <Text style={styles.metaLabel}>宝宝</Text>
                    <Text style={styles.metaValue}>{meta.babyName}</Text>
                  </View>
                  <View style={styles.metaCell}>
                    <Text style={styles.metaLabel}>周期</Text>
                    <Text style={styles.metaValue}>近{rangeDays}天</Text>
                  </View>
                  <View style={styles.metaCell}>
                    <Text style={styles.metaLabel}>记录条数</Text>
                    <Text style={styles.metaValue}>{meta.itemsCount}</Text>
                  </View>
                  <View style={styles.metaCell}>
                    <Text style={styles.metaLabel}>日期范围</Text>
                    <Text style={styles.metaValueSmall}>
                      {meta.rangeText || '--'}
                    </Text>
                  </View>
                </View>

                {meta.lastItem ? (
                  <View style={styles.lastCard}>
                    <View style={styles.lastHeader}>
                      <Text style={styles.lastTitle}>最新记录</Text>
                      <Text style={styles.lastTime}>
                        {dayjs(meta.lastItem.time).format('YYYY-MM-DD')}
                      </Text>
                    </View>
                    <View style={styles.lastGrid}>
                      <View style={styles.lastCell}>
                        <Text style={styles.lastLabel}>身高</Text>
                        <Text style={styles.lastValue}>
                          {typeof meta.lastItem.height === 'number'
                            ? `${meta.lastItem.height} cm`
                            : '--'}
                        </Text>
                      </View>
                      <View style={styles.lastCell}>
                        <Text style={styles.lastLabel}>体重</Text>
                        <Text style={styles.lastValue}>
                          {typeof meta.lastItem.weight === 'number'
                            ? `${meta.lastItem.weight} kg`
                            : '--'}
                        </Text>
                      </View>
                      <View style={styles.lastCell}>
                        <Text style={styles.lastLabel}>头围</Text>
                        <Text style={styles.lastValue}>
                          {typeof meta.lastItem.head_circumference === 'number'
                            ? `${meta.lastItem.head_circumference} cm`
                            : '--'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                <View style={styles.reportCard}>
                  <Text style={styles.reportTitle}>报告正文</Text>
                  {report.markdown ? (
                    <View style={styles.markdownHost}>
                      <Markdown style={markdownStyle}>
                        {report.markdown}
                      </Markdown>
                    </View>
                  ) : (
                    <Text style={styles.emptyReportText}>暂无报告内容</Text>
                  )}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
      {exportData ? (
        <ExportButton
          recordType="ai_growth_report"
          data={exportData}
          disabled={!exportData.markdown}
        />
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_COLORS.background
  },
  container: {
    flex: 1
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28
  },
  header: {
    marginBottom: 14
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: APP_COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: APP_COLORS.textMuted
  },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    padding: 16
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  sectionTitleSpacing: {
    marginTop: 14
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1
  },
  chipSelected: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary
  },
  chipUnselected: {
    backgroundColor: APP_COLORS.surfaceVariant,
    borderColor: APP_COLORS.outlineVariant
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700'
  },
  chipTextSelected: {
    color: APP_COLORS.white
  },
  chipTextUnselected: {
    color: APP_COLORS.text
  },
  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  actionButton: {
    borderRadius: 14
  },
  updatedText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: APP_COLORS.textMuted
  },
  loadingCard: {
    marginTop: 14,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: APP_COLORS.textMuted
  },
  errorCard: {
    marginTop: 14,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    padding: 16
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  errorSubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: APP_COLORS.textMuted
  },
  retryButton: {
    marginTop: 14,
    borderRadius: 14,
    alignSelf: 'flex-start'
  },
  metaGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  metaCell: {
    flexGrow: 1,
    flexBasis: '48%',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    padding: 14
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.textMuted
  },
  metaValue: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '900',
    color: APP_COLORS.text
  },
  metaValueSmall: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  lastCard: {
    marginTop: 14,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    padding: 16
  },
  lastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  lastTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: APP_COLORS.text
  },
  lastTime: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.textMuted
  },
  lastGrid: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10
  },
  lastCell: {
    flex: 1,
    backgroundColor: APP_COLORS.surfaceVariant,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  lastLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.textMuted
  },
  lastValue: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '900',
    color: APP_COLORS.text
  },
  reportCard: {
    marginTop: 14,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    padding: 16
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: APP_COLORS.text
  },
  markdownHost: {
    marginTop: 12
  },
  emptyReportText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: APP_COLORS.textMuted
  },
  emptyCard: {
    marginTop: 10,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    padding: 18
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: APP_COLORS.text
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: APP_COLORS.textMuted
  },
  emptyButton: {
    marginTop: 14,
    borderRadius: 14,
    alignSelf: 'flex-start'
  }
})
