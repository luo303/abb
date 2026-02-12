import React, { useState } from 'react'
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

const DATA = [
  { label: '大宝', value: '1', icon: require('../../assets/poster_cjk.png') },
  {
    label: '二宝',
    value: '2',
    icon: require('../../assets/poster_ai 2.0.jpg')
  },
  {
    label: '三宝',
    value: '3',
    icon: require('../../assets/poster_community.png')
  }
]

export default function UserInfo() {
  const [value, setValue] = useState<string>('1')
  const [isFocus, setIsFocus] = useState(false)

  const renderItem = (item: any) => {
    return (
      <View style={styles.item}>
        <Image source={item.icon} style={styles.itemIcon} />
        <Text style={styles.textItem}>{item.label}</Text>
      </View>
    )
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
              style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
              containerStyle={styles.dropdownListContainer}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={DATA}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? '选择宝宝' : '...'}
              value={value}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setValue(item.value)
                setIsFocus(false)
              }}
              renderLeftIcon={() => {
                const selectedItem = DATA.find(item => item.value === value)
                return selectedItem ? (
                  <Image
                    source={selectedItem.icon}
                    style={styles.selectedIcon}
                  />
                ) : (
                  <Ionicons
                    style={styles.icon}
                    color={isFocus ? 'blue' : 'black'}
                    name="people-outline"
                    size={20}
                  />
                )
              }}
              renderItem={renderItem}
              flatListProps={{
                ListHeaderComponent: (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setIsFocus(false)
                      // Handle add logic here
                      console.log('Add new baby clicked')
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
              <View style={styles.avatarContainer}>
                <Image
                  source={require('../../assets/testAvatar.png')}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.userTexts}>
                <Text
                  style={styles.userName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Piaodaqiang
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.settingsButton}>
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
  }
})
