import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { RecordItem } from '../../types/recordTypes'

interface RecordCardProps {
  item: RecordItem
}

export default function RecordCard({ item }: RecordCardProps) {
  return (
    <View style={styles.recordCard}>
      <View style={styles.recordContent}>
        <View style={styles.recordInfo}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={item.icon as any}
              size={32}
              color="#f43f5e"
            />
          </View>
          <View style={styles.recordTextInfo}>
            <Text style={styles.recordName}>{item.name}</Text>
            <Text style={styles.recordDetails}>{item.details}</Text>
          </View>
        </View>
        <View style={styles.recordTimeContainer}>
          <Text style={styles.recordTimeText}>{item.time}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  recordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  recordTextInfo: {
    marginLeft: 12,
    flex: 1
  },
  recordName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  recordDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  recordTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16
  },
  recordTimeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  }
})
