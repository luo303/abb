import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { TabooItem } from '@/types/taboo'
import StatusTag from './StatusTag'

interface FoodCardProps {
  item: TabooItem
  onPress?: () => void
}

export default function FoodCard({ item, onPress }: FoodCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={item.image} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {item.description}
        </Text>

        <View style={styles.tagsRow}>
          <StatusTag category="pregnant" status={item.status.pregnant} />
          <StatusTag category="baby" status={item.status.baby} />
          <StatusTag
            category="breastfeeding"
            status={item.status.breastfeeding}
          />
          <StatusTag category="postpartum" status={item.status.postpartum} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    alignItems: 'center'
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F7F8FA'
  },
  content: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    height: 80
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4
  },
  description: {
    fontSize: 13,
    color: '#95A5A6',
    marginBottom: 8
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2
  }
})
