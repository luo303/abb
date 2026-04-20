import React, { useCallback, useMemo, useRef } from 'react'
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import dayjs from 'dayjs'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {
  ArrowsRotate,
  CheckCircle,
  Clock,
  Droplet,
  FoodTray,
  HeartCircle,
  PlusCircle,
  WavePulse
} from '@zappicon/react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { APP_COLORS } from '@/theme/paperTheme'
import { RecordItem } from '../../types/recordTypes'

interface RecordCardProps {
  item: RecordItem
}

type RootStackParamList = {
  DiaperForm: { diaper_id: string }
  FeedingRecord: { feeding_id: string }
  SleepRecord: { session_id: string }
}

type RecordCardNavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function RecordCard({ item }: RecordCardProps) {
  const navigation = useNavigation<RecordCardNavigationProp>()
  const pressScale = useRef(new Animated.Value(1)).current
  const pressTranslateY = useRef(new Animated.Value(0)).current

  const typeTheme = useMemo(() => {
    if (item.type === 'sleep') {
      return { accent: APP_COLORS.secondaryStrong, badgeBg: '#f3e8ff' }
    }
    if (item.type === 'diaper') {
      return { accent: APP_COLORS.secondaryStrong, badgeBg: '#fff3e0' }
    }
    return { accent: APP_COLORS.primary, badgeBg: APP_COLORS.surfaceVariant }
  }, [item.type])

  const handlePress = useCallback(() => {
    if (!item.id) return
    const originalId = item.id.replace(/^\w+_/, '')

    if (item.type === 'diaper') {
      navigation.navigate('DiaperForm', { diaper_id: originalId })
      return
    }
    if (item.type === 'feeding') {
      navigation.navigate('FeedingRecord', { feeding_id: originalId })
      return
    }
    navigation.navigate('SleepRecord', { session_id: originalId })
  }, [item.id, item.type, navigation])

  const formatTime = (time: string | number) => {
    if (typeof time === 'number') return dayjs(time).format('HH:mm')
    return time
  }

  const renderIcon = useMemo(() => {
    const size = 22
    const color = typeTheme.accent
    const variant = 'filled' as const

    switch (item.icon) {
      case 'diaper-pee':
        return <Droplet size={size} color={color} variant={variant} />
      case 'diaper-poop':
        return <WavePulse size={size} color={color} variant={variant} />
      case 'diaper-both':
        return <PlusCircle size={size} color={color} variant={variant} />
      case 'diaper-dry':
        return <CheckCircle size={size} color={color} variant={variant} />
      case 'feeding-milk':
        return (
          <MaterialCommunityIcons
            name="baby-bottle"
            size={size}
            color={color}
          />
        )
      case 'feeding-breast':
        return <HeartCircle size={size} color={color} variant={variant} />
      case 'feeding-pump':
        return <Droplet size={size} color={color} variant={variant} />
      case 'feeding-food':
        return <FoodTray size={size} color={color} variant={variant} />
      case 'sleep':
        return <Clock size={size} color={color} variant={variant} />
      case 'sleep-manual':
        return <Clock size={size} color={color} variant="regular" />
      default:
        return <Droplet size={size} color={color} variant={variant} />
    }
  }, [item.icon, typeTheme.accent])

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 24,
        bounciness: 0
      }),
      Animated.spring(pressTranslateY, {
        toValue: 1,
        useNativeDriver: true,
        speed: 24,
        bounciness: 0
      })
    ]).start()
  }, [pressScale, pressTranslateY])

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 22,
        bounciness: 6
      }),
      Animated.spring(pressTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 22,
        bounciness: 6
      })
    ]).start()
  }, [pressScale, pressTranslateY])

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.recordCard,
          {
            transform: [{ translateY: pressTranslateY }, { scale: pressScale }]
          }
        ]}
      >
        <View
          style={[styles.typeAccent, { backgroundColor: typeTheme.badgeBg }]}
        />
        <View style={styles.recordContent}>
          <View style={styles.recordInfo}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: typeTheme.badgeBg }
              ]}
            >
              {renderIcon}
            </View>

            <View style={styles.recordTextInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.recordName} numberOfLines={1}>
                  {item.name || item.title}
                </Text>
                {item.categoryLabel ? (
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: typeTheme.badgeBg }
                    ]}
                  >
                    <Text
                      style={[styles.categoryText, { color: typeTheme.accent }]}
                    >
                      {item.categoryLabel}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.recordTimeText} numberOfLines={1}>
                  {formatTime(item.time)}
                </Text>
              </View>

              {item.type === 'feeding' || item.type === 'diaper' ? (
                <Text style={styles.recordSubDetails} numberOfLines={2}>
                  {item.secondaryDetail ||
                    item.description ||
                    item.remark ||
                    '暂无备注'}
                </Text>
              ) : (
                <View style={styles.detailsRow}>
                  <Text style={styles.recordDetails} numberOfLines={1}>
                    {item.primaryDetail || item.details || item.description}
                  </Text>
                  {item.tags && item.tags.length > 0 ? (
                    <View style={styles.tagsRow}>
                      {item.tags.slice(0, 1).map(tag => (
                        <View
                          key={`${item.id}-${tag}`}
                          style={[
                            styles.tagChip,
                            { backgroundColor: typeTheme.badgeBg }
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagText,
                              { color: typeTheme.accent }
                            ]}
                          >
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  recordCard: {
    position: 'relative',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    minHeight: 92,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    overflow: 'hidden',
    ...(Platform.select({
      ios: {
        shadowColor: APP_COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18
      },
      android: {
        elevation: 4
      }
    }) as any)
  },
  typeAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4
  },
  recordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.select({
      ios: {
        shadowColor: APP_COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10
      },
      android: {
        elevation: 1
      }
    }) as any)
  },
  recordTextInfo: {
    marginLeft: 12,
    flex: 1,
    minWidth: 0
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8
  },
  recordName: {
    fontSize: 16,
    color: APP_COLORS.text,
    fontWeight: '600'
  },
  categoryBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700'
  },
  recordDetails: {
    fontSize: 14,
    color: APP_COLORS.text,
    flex: 1,
    minWidth: 0
  },
  recordSubDetails: {
    fontSize: 13,
    color: APP_COLORS.textMuted,
    marginTop: 4
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0
  },
  tagChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700'
  },
  recordTimeText: {
    fontSize: 13,
    color: APP_COLORS.primary,
    fontWeight: '600',
    marginLeft: 'auto'
  }
})
