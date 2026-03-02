import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { RecordItem } from '../../types/recordTypes'

interface RecordCardProps {
  item: RecordItem
}

export default function RecordCard({ item }: RecordCardProps) {
  return (
    <LinearGradient
      colors={['#ffffff', '#fef5f5']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.recordCard}
    >
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
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#f43f5e"
          />
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  recordCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    ...(Platform.select({
      ios: {
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8
      },
      android: {
        elevation: 4
      }
    }) as any)
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
    alignItems: 'center',
    ...(Platform.select({
      ios: {
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
      },
      android: {
        elevation: 3
      }
    }) as any)
  },
  recordTextInfo: {
    marginLeft: 12,
    flex: 1
  },
  recordName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
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
    color: '#f43f5e',
    fontWeight: '600'
  }
})
