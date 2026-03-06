import React from 'react'
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native'

interface SleepManualEntryProps {
  onManualRecord: () => void
}

const SleepManualEntry: React.FC<SleepManualEntryProps> = ({
  onManualRecord
}) => {
  return (
    <TouchableOpacity style={styles.manualButton} onPress={onManualRecord}>
      <Text style={styles.manualButtonText}>手动记录</Text>
      <Text style={styles.manualButtonArrow}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 64,
    paddingVertical: 16,
    borderRadius: 32,
    marginHorizontal: 48,
    marginBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6
      },
      android: {
        elevation: 3
      }
    })
  },
  manualButtonEmoji: {
    fontSize: 20,
    marginRight: 8
  },
  manualButtonText: {
    color: '#f43f5e',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System'
  },
  manualButtonArrow: {
    color: '#f43f5e',
    fontSize: 20,
    marginLeft: 8,
    fontWeight: '600'
  }
})

export default SleepManualEntry
