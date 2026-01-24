import React from 'react'
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
  targetPage: string // 跳转页面
  onPress?: () => void // 可选点击事件，用于处理同页面滚动效果
}

export default function BannerItem({
  imageSource,
  targetPage,
  onPress
}: BannerItemProps) {
  const navigation = useNavigation<NavigationProps>()
  return (
    <TouchableOpacity
      style={styles.page}
      activeOpacity={0.8}
      onPress={
        onPress
          ? onPress
          : () => {
              // 只有传入点击事件参数时再调用路由跳转事件
              navigation.navigate(targetPage as any) // 此处封装了目标页面的路由地址，使用类型断言，防止 ts 报错
            }
      }
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
