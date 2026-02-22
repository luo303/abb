import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Dropdown } from 'react-native-element-dropdown'
import * as ImagePicker from 'expo-image-picker'

import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { fetchBabies, setCurrentBabyId } from '../../store/modules/BabyStore'
import {
  UserMeResponse,
  UpdateAvatarResponse,
  updateAvatarReq,
  ApiResponse
} from '../../api/profile'
import { useMessage } from '../Message'
import { uploadFile } from '@/api/upload'
import { setUserInfo } from '../../store/modules/userStore'

interface UserInfoProps {
  userInfo: UserMeResponse | null
}

export default function UserInfo({ userInfo }: UserInfoProps) {
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useDispatch<AppDispatch>()
  const { babiesList, currentBabyId } = useSelector(
    (state: RootState) => state.baby
  )
  const [value, setValue] = useState<string | null>(null)
  const [isFocus, setIsFocus] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const dropdownRef = useRef<any>(null)
  const { showMessage } = useMessage()

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchBabies())
    }, [dispatch])
  )

  useEffect(() => {
    if (currentBabyId) {
      setValue(currentBabyId)
    } else if (babiesList.length > 0 && !value) {
      setValue(babiesList[0].baby_id)
    }
  }, [currentBabyId, babiesList, value])

  const renderItem = (item: any) => {
    return (
      <View style={styles.item}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.itemIcon} />
        ) : (
          <View style={[styles.itemIcon, styles.placeholderIcon]}>
            <Ionicons name="person" size={20} color="#ccc" />
          </View>
        )}
        <Text style={styles.textItem}>{item.name}</Text>
      </View>
    )
  }

  const handleChangeAvatar = async () => {
    if (uploadingAvatar) return

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      showMessage('需要访问相册权限才能更换头像')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    })

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return
    }

    const uri = result.assets[0].uri

    try {
      setUploadingAvatar(true)
      const response = await uploadFile(uri)

      let url = ''
      if (typeof response.data === 'string') {
        url = response.data
      } else if (response.data && typeof response.data.url === 'string') {
        url = response.data.url
      }

      if (!url) {
        showMessage('图片上传失败，请稍后重试')
        return
      }

      const avatarRes = (await updateAvatarReq({
        avatar: url
      })) as unknown as ApiResponse<UpdateAvatarResponse>

      if (avatarRes.code === 0) {
        if (userInfo) {
          dispatch(setUserInfo({ ...userInfo, avatar: url }))
        }
        showMessage('头像更新成功')
      } else {
        showMessage('头像更新失败')
      }
    } catch (error) {
      console.error(error)
      showMessage('头像更新失败，请稍后重试')
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={require('../../assets/poster_cjk.png')}
        style={styles.container}
        resizeMode="cover"
        imageStyle={{ borderRadius: 24 }}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(107, 106, 106, 0.2)',
            'rgba(63, 62, 62, 0.4)'
          ]}
          style={styles.gradient}
        >
          {/* 右上角装饰图标 */}
          <View style={styles.headerActions}>
            <Dropdown
              ref={dropdownRef}
              style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
              containerStyle={styles.dropdownListContainer}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={babiesList}
              maxHeight={300}
              labelField="name"
              valueField="baby_id"
              placeholder={
                !isFocus
                  ? babiesList.length === 0
                    ? '暂无宝宝'
                    : '选择宝宝'
                  : '...'
              }
              value={value}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setValue(item.baby_id)
                dispatch(setCurrentBabyId(item.baby_id))
                setIsFocus(false)
              }}
              renderLeftIcon={() => {
                const selectedItem = babiesList.find(
                  item => item.baby_id === value
                )
                if (!selectedItem) {
                  return (
                    <Ionicons
                      style={styles.icon}
                      color={'#ccc'}
                      name="person"
                      size={20}
                    />
                  )
                }
                return selectedItem.avatar ? (
                  <Image
                    source={{ uri: selectedItem.avatar }}
                    style={styles.selectedIcon}
                  />
                ) : (
                  <View style={[styles.selectedIcon, styles.placeholderIcon]}>
                    <Ionicons name="person" size={16} color="#ccc" />
                  </View>
                )
              }}
              renderItem={renderItem}
              flatListProps={{
                ListHeaderComponent: (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      dropdownRef.current?.close()
                      setIsFocus(false)
                      navigation.navigate('AddBaby')
                    }}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color="#007AFF"
                    />
                    <Text style={styles.addButtonText}>新增宝宝</Text>
                  </TouchableOpacity>
                )
              }}
            />
          </View>

          {/* 底部信息栏 */}
          <View style={styles.bottomBar}>
            <View style={styles.userInfo}>
              <TouchableOpacity
                style={styles.avatarContainer}
                activeOpacity={0.8}
                onPress={handleChangeAvatar}
                disabled={uploadingAvatar}
              >
                {userInfo?.avatar ? (
                  <Image
                    source={{ uri: userInfo.avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <Image
                    source={require('../../assets/testAvatar.png')}
                    style={styles.avatar}
                  />
                )}
              </TouchableOpacity>
              <View style={styles.userTexts}>
                <Text
                  style={styles.userName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {userInfo?.username || userInfo?.account || '稚慧宝用户'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.settingsGradient}
              >
                <Ionicons
                  name="pencil"
                  size={16}
                  color="#fff"
                  style={styles.settingsIcon}
                />
                <Text style={styles.settingsText}>编辑资料</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: '#954a72ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderRadius: 24
  },
  container: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden'
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20
  },
  headerActions: {
    alignItems: 'flex-end',
    marginTop: 10
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  bottomBar: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: 5
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
    marginRight: 15
  },
  userTexts: {
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  userSignature: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500'
  },
  settingsButton: {
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'flex-end'
  },
  settingsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20
  },
  settingsIcon: {
    marginRight: 6
  },
  settingsText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
  },
  dropdown: {
    height: 45,
    borderRadius: 24,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 140,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  dropdownListContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  icon: {
    marginRight: 8
  },
  selectedIcon: {
    width: 30,
    height: 30,
    borderRadius: 12.5,
    marginRight: 8
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#333'
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  iconStyle: {
    width: 20,
    height: 20,
    tintColor: '#666'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff'
  },
  addButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500'
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },
  itemIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 16
  },
  textItem: {
    fontSize: 14,
    color: '#333'
  },
  placeholderIcon: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
