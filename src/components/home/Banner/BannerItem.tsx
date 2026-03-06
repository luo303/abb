import React, { useContext } from 'react'
import { HomeScrollToContext } from '@/context/HomeScrollContext'
import {
  View,
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet
} from 'react-native'
import { NavigationProps } from '../../../types/navigation'
import { useNavigation } from '@react-navigation/native'

interface BannerItemProps {
  imageSource: number | string
  targetPage?: string
  onPress?: () => void
  ScrollToCommunity?: string
}

export default function BannerItem({
  imageSource,
  targetPage
}: BannerItemProps) {
  const navigation = useNavigation<NavigationProps>()
  const { scrollToCommunity } = useContext(HomeScrollToContext)

  const handlePress = () => {
    if (targetPage === 'scrollToCommunity') {
      scrollToCommunity()
    } else {
      navigation.navigate(targetPage as any)
    }
  }
  return (
    <TouchableOpacity
      style={styles.page}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <ImageBackground
        source={
          typeof imageSource === 'number' ? imageSource : { uri: imageSource }
        }
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.bannerText}></Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  overlay: {
    padding: 10
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
