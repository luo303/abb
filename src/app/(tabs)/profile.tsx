import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { useDispatch } from 'react-redux'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { clearToken } from '../../store/modules/userStore'
import { RootStackParamList } from '../../types/navigation'
import { LinearGradient } from 'expo-linear-gradient'

// 导入组件
import UserInfo from '../../components/profile/UserInfo'
import InfoCard from '../../components/profile/InfoCard'
import ActionMenu from '../../components/profile/ActionMenu'

type NavigationProps = NavigationProp<RootStackParamList>

export default function Profile() {
  const dispatch = useDispatch()
  const navigation = useNavigation<NavigationProps>()

  const handleLogout = () => {
    dispatch(clearToken())
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    })
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#cffafe', '#e0f2fe', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部个人信息 Banner */}
        <UserInfo />

        {/* 下方内容区域 */}
        <View style={styles.contentContainer}>
          <InfoCard />
          <ActionMenu onLogout={handleLogout} />
        </View>

        {/* 底部占位 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollView: {
    flex: 1
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%'
  },
  content: {
    paddingTop: 0
  },
  contentContainer: {
    paddingTop: 15
  }
})
