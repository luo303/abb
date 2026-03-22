import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const THEME_PRIMARY = '#f43f5e'

export default function AuthBackground() {
  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={['#fff1f2', '#ffe4e6', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobBottomRight]} />
      <View style={[styles.ring, styles.ringTopRight]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  blob: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(244, 63, 94, 0.16)'
  },
  blobTopLeft: {
    top: -90,
    left: -80
  },
  blobBottomRight: {
    width: 320,
    height: 320,
    borderRadius: 160,
    right: -140,
    bottom: -160,
    backgroundColor: 'rgba(244, 63, 94, 0.10)'
  },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(244, 63, 94, 0.18)'
  },
  ringTopRight: {
    top: 70,
    right: -70
  }
})
