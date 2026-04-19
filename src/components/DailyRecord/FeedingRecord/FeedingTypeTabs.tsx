import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Droplet, FoodTray } from '@zappicon/react-native'
import { APP_COLORS } from '@/theme/paperTheme'

interface FeedingTypeTabsProps {
  selectedType: '奶粉' | '母乳' | '辅食'
  onTypeChange: (type: '奶粉' | '母乳' | '辅食') => void
}

export const FeedingTypeTabs: React.FC<FeedingTypeTabsProps> = ({
  selectedType,
  onTypeChange
}) => {
  const renderIcon = (type: '奶粉' | '母乳' | '辅食', active: boolean) => {
    const color = active ? APP_COLORS.primary : APP_COLORS.textMuted
    const size = 18

    if (type === '母乳') {
      return (
        <Droplet
          size={size}
          color={color}
          variant={active ? 'filled' : 'regular'}
        />
      )
    }

    if (type === '辅食') {
      return (
        <FoodTray
          size={size}
          color={color}
          variant={active ? 'filled' : 'regular'}
        />
      )
    }

    return <MaterialCommunityIcons name="baby-bottle" size={20} color={color} />
  }

  const renderTab = (type: '奶粉' | '母乳' | '辅食') => {
    const active = selectedType === type
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onTypeChange(type)}
        style={[styles.tab, active && styles.tabActive]}
      >
        <View style={styles.tabInner}>
          {renderIcon(type, active)}
          <Text
            style={[styles.tabText, active && { color: APP_COLORS.primary }]}
          >
            {type}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.tabContainer}>
      {renderTab('辅食')}
      {renderTab('母乳')}
      {renderTab('奶粉')}
    </View>
  )
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: APP_COLORS.surfaceVariant,
    padding: 4,
    marginBottom: 8,
    borderRadius: 16
  },
  tab: {
    flex: 1,
    borderRadius: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabActive: {
    backgroundColor: APP_COLORS.surface,
    ...(Platform.select({
      ios: {
        shadowColor: APP_COLORS.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10
      },
      android: {
        elevation: 2
      }
    }) as any)
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  tabText: {
    fontSize: 14,
    color: APP_COLORS.textMuted,
    fontWeight: '600'
  }
})

export default FeedingTypeTabs
