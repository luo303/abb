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
// 定义组件属性接口
interface BannerItemProps {
  imageSource: number | string // 图片路径
  // 采用两种类型，string 代表网络图片路径，需使用 uri，number 代表本地图片路径
  targetPage?: string // 跳转页面
  onPress?: () => void // 可选点击事件，用于处理同页面滚动效果
  ScrollToCommunity?: string // 滚动到社区模块
}

export default function BannerItem({
  imageSource,
  targetPage
}: BannerItemProps) {
  const navigation = useNavigation<NavigationProps>()
  const { scrollToCommunity } = useContext(HomeScrollToContext)

  // 封装点击处理逻辑
  const handlePress = () => {
    if (targetPage === 'scrollToCommunity') {
      // 设置一个标志 'scrollToContext' 标记滚动
      scrollToCommunity()
    } else {
      navigation.navigate(targetPage as any)
    }
  }
  return (
    <TouchableOpacity
      style={styles.page}
      activeOpacity={0.8}
      onPress={handlePress} // 调用封装好的点击逻辑
    >
      <ImageBackground
        source={
          typeof imageSource === 'number' ? imageSource : { uri: imageSource }
          // 一个是本地图片路径，一个是网络图片路径，通过 typeof 判断，可以使用不同的方式处理
        }
        style={styles.backgroundImage}
        imageStyle={{ borderRadius: 15 }}
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
    padding: 10,
    borderRadius: 5
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
