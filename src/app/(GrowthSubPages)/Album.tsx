import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import dayjs from 'dayjs'
import { Ionicons } from '@expo/vector-icons'
import ImageViewing from 'react-native-image-viewing'
import * as ImagePicker from 'expo-image-picker'
import { uploadFile } from '@/api/upload'
import {
  BabyPhotoItem,
  BabyPhotoUploadResponse,
  getBabyPhotoListReq,
  uploadBabyPhotosReq
} from '@/api/baby'
import { useAppSelector } from '@/hooks/redux'

interface AlbumPhoto extends BabyPhotoItem {
  status?: 'uploading' | 'error'
  isLocal?: boolean
}

export default function AlbumScreen() {
  const insets = useSafeAreaInsets()
  const babyId = useAppSelector(state => state.baby.currentBabyId)
  const [photos, setPhotos] = useState<AlbumPhoto[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  const fetchPage = useCallback(
    async (targetPage: number, isRefresh = false) => {
      if (!babyId) return
      if (loading && !isRefresh) return
      if (!hasMore && !isRefresh) return

      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        const res = await getBabyPhotoListReq(babyId, targetPage, 12)
        const ok = res?.code === 0 || res?.code === 200
        const items = ok ? res.data?.items || [] : []
        setPhotos(prev => {
          if (targetPage === 1) return items
          const existing = new Set(prev.map(p => p.photo_id))
          const merged = items.filter(p => !existing.has(p.photo_id))
          return [...prev, ...merged]
        })
        setPage(targetPage)
        setHasMore(res.data?.has_more ?? false)
      } catch (error) {
        console.error('Failed to fetch album:', error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [babyId, hasMore, loading]
  )

  useEffect(() => {
    fetchPage(1, true)
  }, [fetchPage])

  const groupedPhotos = useMemo(() => {
    const sorted = [...photos].sort((a, b) => (b.ctime || 0) - (a.ctime || 0))
    const map = new Map<string, AlbumPhoto[]>()
    sorted.forEach(photo => {
      const dayKey = dayjs(photo.ctime).format('YYYY-MM-DD')
      if (!map.has(dayKey)) map.set(dayKey, [])
      map.get(dayKey)!.push(photo)
    })
    return Array.from(map.entries()).map(([date, items]) => ({
      date,
      items
    }))
  }, [photos])

  const orderedPhotos = useMemo(
    () => groupedPhotos.flatMap(group => group.items),
    [groupedPhotos]
  )

  const handleRefresh = () => fetchPage(1, true)

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPage(page + 1)
    }
  }

  const extractUploadUrl = (response: any) => {
    if (typeof response?.data === 'string') return response.data
    if (response?.data && typeof response.data.url === 'string')
      return response.data.url
    return ''
  }

  const handleAddPhoto = async () => {
    if (!babyId) {
      Alert.alert('提示', '请先选择宝宝')
      return
    }
    if (uploading) return

    const permissonResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissonResult.granted) {
      Alert.alert('提示', '需要访问相册权限才能上传图片')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 9,
      quality: 1
    })

    if (result.canceled) return

    const now = Date.now()
    const tempItems: AlbumPhoto[] = result.assets.map((asset, index) => ({
      photo_id: `local-${now}-${index}`,
      link: asset.uri,
      ctime: now,
      status: 'uploading',
      isLocal: true
    }))

    setPhotos(prev => [...tempItems, ...prev])

    try {
      setUploading(true)
      const urls: string[] = []
      for (const asset of result.assets) {
        const response = await uploadFile(asset.uri)
        const url = extractUploadUrl(response)
        if (url) urls.push(url)
      }

      if (urls.length === 0) {
        setPhotos(prev =>
          prev.map(item =>
            tempItems.some(t => t.photo_id === item.photo_id)
              ? { ...item, status: 'error' }
              : item
          )
        )
        Alert.alert('提示', '上传失败，请重试')
        return
      }

      const res = (await uploadBabyPhotosReq(
        babyId,
        urls
      )) as BabyPhotoUploadResponse
      console.log(res)

      const ok = res?.code === 0 || res?.code === 200
      const newItems = ok ? res.data?.items || [] : []

      if (newItems.length > 0) {
        setPhotos(prev =>
          prev.map(item => {
            const idx = tempItems.findIndex(t => t.photo_id === item.photo_id)
            if (idx === -1) return item
            return newItems[idx] || item
          })
        )
      }
    } catch (error) {
      console.error('Upload album photo failed:', error)
      setPhotos(prev =>
        prev.filter(item => !tempItems.some(t => t.photo_id === item.photo_id))
      )
      Alert.alert('提示', '上传失败，请稍后再试')
    } finally {
      setUploading(false)
    }
  }

  const renderGroup = ({
    item
  }: {
    item: { date: string; items: AlbumPhoto[] }
  }) => (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{item.date}</Text>
      <View style={styles.grid}>
        {item.items.map(photo => (
          <TouchableOpacity
            key={photo.photo_id}
            style={styles.gridItem}
            activeOpacity={0.9}
            onPress={() => {
              const globalIndex = orderedPhotos.findIndex(
                p => p.photo_id === photo.photo_id
              )
              setPreviewIndex(globalIndex >= 0 ? globalIndex : 0)
              setPreviewVisible(true)
            }}
          >
            <Image
              source={{ uri: (photo.link || '').trim() }}
              style={[
                styles.image,
                photo.status === 'uploading' && styles.uploadingImage
              ]}
            />
            {photo.status === 'uploading' && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>暂无照片</Text>
      <Text style={styles.emptySubtitle}>快添加宝宝的第一张照片吧</Text>
    </View>
  )

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={groupedPhotos}
        keyExtractor={item => item.date}
        renderItem={renderGroup}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 96 + insets.bottom }
        ]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={
          loading ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#f43f5e" />
              <Text style={styles.footerText}>閸旂姾娴囨稉?..</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#f43f5e']}
            tintColor="#f43f5e"
          />
        }
      />
      <ImageViewing
        images={orderedPhotos.map(item => ({
          uri: (item.link || '').trim()
        }))}
        imageIndex={previewIndex}
        visible={previewVisible}
        onRequestClose={() => setPreviewVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        keyExtractor={(_, index) => `album-preview-${index}`}
      />
      <TouchableOpacity
        style={[
          styles.addButton,
          { bottom: 24 + insets.bottom },
          uploading && styles.addButtonDisabled
        ]}
        activeOpacity={0.9}
        onPress={handleAddPhoto}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="add" size={28} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 0
  },
  group: {
    marginBottom: 18
  },
  groupTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 10,
    fontWeight: '600'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  gridItem: {
    width: (Dimensions.get('window').width - 16 * 2 - 8 * 2) / 3,
    height: (Dimensions.get('window').width - 16 * 2 - 8 * 2) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9'
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  uploadingImage: {
    opacity: 0.7
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999'
  },
  footerLoading: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  footerText: {
    marginTop: 6,
    fontSize: 12,
    color: '#999'
  },
  addButton: {
    position: 'absolute',
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },
  addButtonDisabled: {
    opacity: 0.7
  }
})
