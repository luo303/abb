import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Xmark } from '@zappicon/react-native'

export default function AddPostHeader({
  title = '发布帖子',
  rightText,
  onRightPress
}: {
  title?: string
  rightText?: string
  onRightPress?: () => void
}) {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.cancelButton}
      >
        <Xmark size={28} color="#333" variant="regular" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {rightText && onRightPress ? (
        <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
          <Text style={styles.rightText}>{rightText}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 38 }} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
    // paddingTop is handled dynamically via useSafeAreaInsets
  },
  cancelButton: {
    padding: 5
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333'
  },
  rightButton: {
    minWidth: 38,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  rightText: {
    fontSize: 14,
    color: '#f43f5e',
    fontWeight: '600'
  }
})
