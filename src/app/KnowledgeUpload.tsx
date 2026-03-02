import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { LinearGradient } from 'expo-linear-gradient'
import { uploadKnowledge } from '@/api/ai'
import { useMessage } from '@/components/Message'

interface PickedFileInfo {
  name?: string
  size?: number
  mimeType?: string
  uri: string
}

const SUPPORTED_MIME = new Set([
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv'
])

const SUPPORTED_EXT = new Set(['txt', 'md', 'json', 'csv'])

const isSupportedFile = (file: PickedFileInfo) => {
  if (file.mimeType && SUPPORTED_MIME.has(file.mimeType)) return true
  if (file.name) {
    const parts = file.name.split('.')
    const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
    if (SUPPORTED_EXT.has(ext)) return true
  }
  return false
}

const KnowledgeUploadScreen = () => {
  const [fileInfo, setFileInfo] = useState<PickedFileInfo | null>(null)
  const [content, setContent] = useState<string>('')
  const [rawContent, setRawContent] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [spaceType, setSpaceType] = useState<'public' | 'private'>('private')
  const { showMessage } = useMessage()
  const contentPlaceholder = useMemo(
    () => (fileInfo ? '暂无内容' : '请选择文件开始解析'),
    [fileInfo]
  )

  const handlePickFile = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setLoading(false)
        return
      }

      const asset = result.assets[0]
      const picked: PickedFileInfo = {
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType,
        uri: asset.uri
      }

      if (!isSupportedFile(picked)) {
        setFileInfo(picked)
        setContent('')
        setError('暂不支持解析该文件类型，请选择 txt/md/json/csv')
        setLoading(false)
        return
      }

      const raw = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: 'utf8'
      })

      let display = raw
      try {
        const json = JSON.parse(raw)
        display = JSON.stringify(json, null, 2)
      } catch {
        // keep original text
      }

      setFileInfo(picked)
      setContent(display)
      setRawContent(raw)
    } catch (err: any) {
      setError(err?.message || '读取文件失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (loading || uploading) return
    if (!fileInfo || !rawContent) {
      setError('请先选择文件')
      return
    }
    setError('')
    setUploading(true)
    try {
      await uploadKnowledge({
        space_type: spaceType,
        content: rawContent
      })
      showMessage('上传成功')
      setFileInfo(null)
      setContent('')
      setRawContent('')
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || '上传失败，请稍后重试'
      setError(msg)
      showMessage(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setFileInfo(null)
    setContent('')
    setRawContent('')
    setError('')
  }

  return (
    <View style={[styles.safeArea, { paddingTop: 0 }]}>
      <LinearGradient
        colors={['#0f172a', '#111827', '#1f2937']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.heroGlow}
      />
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerBadgeRow}>
            <View style={styles.headerBadge} />
            <Text style={styles.headerBadgeText}>Knowledge Hub</Text>
          </View>
          <Text style={styles.title}>上传知识库</Text>
          <Text style={styles.subtitle}>选择文件并解析展示内容</Text>
          <View style={styles.selectorRow}>
            <TouchableOpacity
              style={[
                styles.selectorOption,
                spaceType === 'private' && styles.selectorOptionActive
              ]}
              activeOpacity={0.85}
              onPress={() => setSpaceType('private')}
              disabled={loading || uploading}
            >
              <Text
                style={[
                  styles.selectorText,
                  spaceType === 'private' && styles.selectorTextActive
                ]}
              >
                私人知识库
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.selectorOption,
                spaceType === 'public' && styles.selectorOptionActive
              ]}
              activeOpacity={0.85}
              onPress={() => setSpaceType('public')}
              disabled={loading || uploading}
            >
              <Text
                style={[
                  styles.selectorText,
                  spaceType === 'public' && styles.selectorTextActive
                ]}
              >
                公共知识库
              </Text>
            </TouchableOpacity>
          </View>
          {spaceType === 'public' ? (
            <View style={styles.tipsBanner}>
              <Text style={styles.tipsText}>
                提示：公共知识库仅管理员可上传，普通用户请选择私人知识库
              </Text>
            </View>
          ) : null}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                (loading || uploading) && styles.buttonDisabled
              ]}
              onPress={fileInfo ? handleUpload : handlePickFile}
              activeOpacity={0.85}
              disabled={loading || uploading}
            >
              {loading || uploading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#0b1220" />
                  <Text style={styles.primaryButtonText}>
                    {loading ? '读取中...' : '上传中...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>
                  {fileInfo ? '上传' : '选择文件'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                (loading || uploading) && styles.buttonDisabled
              ]}
              onPress={handleClear}
              activeOpacity={0.85}
              disabled={loading || uploading}
            >
              <Text style={styles.secondaryButtonText}>清空</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {fileInfo ? (
          <View style={styles.fileCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>文件信息</Text>
              <View style={styles.sectionTag}>
                <Text style={styles.sectionTagText}>已选择</Text>
              </View>
            </View>
            <View style={styles.fileMetaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>名称</Text>
                <Text style={styles.metaValue}>{fileInfo.name || '-'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>大小</Text>
                <Text style={styles.metaValue}>
                  {fileInfo.size ?? '-'} bytes
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>类型</Text>
                <Text style={styles.metaValue}>{fileInfo.mimeType || '-'}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.contentCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>解析内容</Text>
            <View style={styles.sectionTagMuted}>
              <Text style={styles.sectionTagMutedText}>预览</Text>
            </View>
          </View>
          {loading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.loadingText}>正在解析文件内容...</Text>
            </View>
          ) : null}
          <Text style={styles.contentText}>
            {content || contentPlaceholder}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    paddingHorizontal: 16,
    paddingTop: 8
  },
  pageScroll: {
    flex: 1
  },
  pageContent: {
    paddingBottom: 24,
    paddingTop: 0
  },
  heroGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    opacity: 0.9
  },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.25)'
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  headerBadge: {
    width: 56,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#60a5fa',
    opacity: 0.9
  },
  headerBadgeText: {
    fontSize: 11,
    color: '#93c5fd',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb'
  },
  subtitle: {
    fontSize: 13,
    color: '#c7d2fe',
    marginTop: 6
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14
  },
  selectorRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 6,
    borderRadius: 12,
    marginTop: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  selectorOption: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  selectorOptionActive: {
    backgroundColor: '#7dd3fc'
  },
  selectorText: {
    color: '#c7d2fe',
    fontWeight: '600',
    fontSize: 13
  },
  selectorTextActive: {
    color: '#0b1220'
  },
  tipsBanner: {
    marginTop: 10,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.35)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  tipsText: {
    color: '#fecdd3',
    fontSize: 12,
    fontWeight: '600'
  },
  button: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDisabled: {
    opacity: 0.7
  },
  primaryButton: {
    backgroundColor: '#7dd3fc'
  },
  primaryButtonText: {
    color: '#0b1220',
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  secondaryButtonText: {
    color: '#e5e7eb',
    fontWeight: '600'
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 12
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600'
  },
  fileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827'
  },
  sectionTag: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  sectionTagText: {
    color: '#e11d48',
    fontSize: 11,
    fontWeight: '600'
  },
  sectionTagMuted: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  sectionTagMutedText: {
    color: '#3730a3',
    fontSize: 11,
    fontWeight: '600'
  },
  fileMetaGrid: {
    gap: 8
  },
  metaItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4
  },
  metaValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600'
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2
  },
  loadingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dbeafe'
  },
  loadingText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600'
  },
  contentText: {
    fontSize: 12,
    color: '#111827',
    lineHeight: 18,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace'
    })
  }
})

export default KnowledgeUploadScreen
