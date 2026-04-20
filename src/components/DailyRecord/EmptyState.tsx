import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { APP_COLORS } from '@/theme/paperTheme'

export default function EmptyState({
  onAddFeeding,
  onAddSleep,
  onAddDiaper
}: {
  onAddFeeding?: () => void
  onAddSleep?: () => void
  onAddDiaper?: () => void
}) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="calendar-outline"
        size={44}
        color={APP_COLORS.iconMuted}
      />
      <Text style={styles.emptyText}>暂无记录</Text>
      <Text style={styles.emptySubText}>从下面快速开始记录</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onAddFeeding}
          disabled={!onAddFeeding}
          style={[styles.actionButton, styles.actionButtonPrimary]}
        >
          <Text style={styles.actionButtonPrimaryText}>记喂养</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onAddSleep}
          disabled={!onAddSleep}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>记睡眠</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onAddDiaper}
          disabled={!onAddDiaper}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>记尿布</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: APP_COLORS.textMuted,
    marginTop: 16
  },
  emptySubText: {
    fontSize: 14,
    color: APP_COLORS.iconMuted,
    marginTop: 8
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18
  },
  actionButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant
  },
  actionButtonPrimary: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: APP_COLORS.text
  },
  actionButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: APP_COLORS.white
  }
})
