import React from 'react'
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps
} from 'react-native'

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

/**
 * 通用卡片组件
 * 封装了统一的背景色、圆角和阴影样式
 * 如果传入 onPress 属性，则渲染为 TouchableOpacity
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  ...props
}) => {
  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyles.card, style]}
        onPress={onPress}
        activeOpacity={0.9}
        {...props}
      >
        {children}
      </TouchableOpacity>
    )
  }
  return (
    <View style={[cardStyles.card, style]} {...props}>
      {children}
    </View>
  )
}

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  }
})

export default Card
