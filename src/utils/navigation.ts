import { useNavigation } from '@react-navigation/native'
import { RecordType } from '../types/recordTypes'
import { Toast } from '@ant-design/react-native'

/**
 * 导航工具函数，提供常用的导航方法
 */
export const useNavigationHelper = () => {
  const navigation = useNavigation<any>()

  return {
    /**
     * 跳转到记录页面
     * @param type 记录类型
     */
    navigateToRecord: (type: RecordType) => {
      switch (type) {
        case 'feeding':
          navigation.navigate('FeedingRecord')
          break
        case 'sleep':
          navigation.navigate('SleepRecord')
          break
        case 'diaper':
          navigation.navigate('DiaperForm')
          break
        default:
          break
      }
    },

    /**
     * 返回上一页
     */
    goBack: () => {
      navigation.goBack()
    },

    /**
     * 跳转到手动睡眠记录页面
     */
    navigateToSleepManualInput: () => {
      navigation.navigate('SleepManualInput')
    }
  }
}
