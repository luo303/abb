import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef
} from 'react'
import { StyleSheet, Text, View, Dimensions, Animated } from 'react-native'

interface MessageContextType {
  showMessage: (message: string, duration?: number) => void
  hideMessage: () => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export const useMessage = () => {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider')
  }
  return context
}

export function MessageProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const fadeAnim = useRef(new Animated.Value(0)).current
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hideMessage = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) {
        setVisible(false)
      }
    })
  }

  const showMessage = (msg: string, duration?: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setMessage(msg)
    setVisible(true)

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()

    const delay = duration ?? 2000
    timerRef.current = setTimeout(() => {
      hideMessage()
    }, delay)
  }

  return (
    <MessageContext.Provider value={{ showMessage, hideMessage }}>
      {children}
      {visible && (
        <View style={styles.container} pointerEvents="none">
          <Animated.View style={[styles.toastView, { opacity: fadeAnim }]}>
            <Text style={styles.toastText}>{message}</Text>
          </Animated.View>
        </View>
      )}
    </MessageContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
    zIndex: 9999,
    elevation: 9999
  },
  toastView: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    maxWidth: Dimensions.get('window').width * 0.8
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center'
  }
})
