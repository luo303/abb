import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'
import { SafeAreaView } from 'react-native-safe-area-context'

type RootStackParamList = {
  VaccineDetail: { url: string; title: string }
}

type VaccineDetailRouteProp = RouteProp<RootStackParamList, 'VaccineDetail'>

export default function VaccineDetailScreen() {
  const route = useRoute<VaccineDetailRouteProp>()
  const navigation = useNavigation()
  const { url, title } = route.params

  useEffect(() => {
    if (title) {
      navigation.setOptions({ title })
    }
  }, [title, navigation])

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0ea5e9" />
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  webview: {
    flex: 1
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
})
