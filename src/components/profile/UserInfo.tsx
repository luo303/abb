import React from 'react'
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

export default function UserInfo() {
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
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="color-palette-outline" size={20} color="#fff" />
            </TouchableOpacity>
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
                <Text style={styles.userName}>Piaodaqiang</Text>
                <Text style={styles.userSignature}>Keep to yourself!</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 5
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
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
    justifyContent: 'center'
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
    overflow: 'hidden'
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
  }
})
