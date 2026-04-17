import { useKeyboardHandler } from 'react-native-keyboard-controller'
import Animated, {
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated'

type UseKeyboardTranslateStyleOptions = {
  bottomInset?: number
}

export function useKeyboardTranslateStyle({
  bottomInset = 0
}: UseKeyboardTranslateStyleOptions = {}) {
  const keyboardHeight = useSharedValue(0)
  const keyboardProgress = useSharedValue(0)
  const keyboardTransitionState = useSharedValue(0)

  useKeyboardHandler(
    {
      onStart: event => {
        'worklet'
        keyboardTransitionState.value = 1
        keyboardHeight.value = Math.max(event.height, 0)
        keyboardProgress.value = Math.max(event.progress, 0)
      },
      onMove: event => {
        'worklet'
        keyboardHeight.value = Math.max(event.height, 0)
        keyboardProgress.value = Math.max(event.progress, 0)
      },
      onInteractive: event => {
        'worklet'
        keyboardHeight.value = Math.max(event.height, 0)
        keyboardProgress.value = Math.max(event.progress, 0)
      },
      onEnd: event => {
        'worklet'
        keyboardHeight.value = Math.max(event.height, 0)
        keyboardProgress.value = Math.max(event.progress, 0)
        keyboardTransitionState.value = 0
      }
    },
    []
  )

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = -Math.max(keyboardHeight.value - bottomInset, 0)

    return {
      transform: [{ translateY }]
    }
  }, [bottomInset])

  return {
    animatedStyle,
    keyboardHeight,
    keyboardProgress,
    keyboardTransitionState
  }
}

export { Animated }
