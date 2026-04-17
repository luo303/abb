import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { Alert, AlertButton, AlertOptions, StyleSheet } from 'react-native'
import { Button, Dialog, Portal, Snackbar, Text } from 'react-native-paper'
import { APP_COLORS } from '@/theme/paperTheme'

interface MessageContextType {
  showMessage: (message: string, duration?: number) => void
  hideMessage: () => void
  showDialog: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export const useMessage = () => {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider')
  }
  return context
}

type DialogState = {
  title: string
  message?: string
  buttons: AlertButton[]
  options?: AlertOptions
}

const normalizeButtons = (buttons?: AlertButton[]) => {
  if (buttons && buttons.length > 0) {
    return buttons
  }

  return [{ text: '确定' }]
}

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [snackbarState, setSnackbarState] = useState({
    visible: false,
    message: '',
    duration: 2000,
    key: 0
  })
  const [dialogState, setDialogState] = useState<DialogState | null>(null)
  const dialogQueueRef = useRef<DialogState[]>([])
  const originalAlertRef = useRef(Alert.alert)
  const originalGlobalAlertRef = useRef(globalThis.alert)

  const showNextDialog = useCallback(() => {
    const nextDialog = dialogQueueRef.current.shift() || null
    setDialogState(nextDialog)
  }, [])

  const hideMessage = useCallback(() => {
    setSnackbarState(prev => ({
      ...prev,
      visible: false
    }))
  }, [])

  const showMessage = useCallback((message: string, duration?: number) => {
    setSnackbarState(prev => ({
      visible: true,
      message,
      duration: duration ?? 2000,
      key: prev.key + 1
    }))
  }, [])

  const showDialog = useCallback(
    (
      title: string,
      message?: string,
      buttons?: AlertButton[],
      options?: AlertOptions
    ) => {
      const nextDialog: DialogState = {
        title: title || '提示',
        message,
        buttons: normalizeButtons(buttons),
        options
      }

      setDialogState(currentDialog => {
        if (currentDialog) {
          dialogQueueRef.current.push(nextDialog)
          return currentDialog
        }

        return nextDialog
      })
    },
    []
  )

  const runDialogAction = useCallback(
    (button?: AlertButton) => {
      setDialogState(null)
      setTimeout(() => {
        showNextDialog()
      }, 0)
      button?.onPress?.()
    },
    [showNextDialog]
  )

  const handleDialogDismiss = useCallback(() => {
    if (!dialogState) return

    const cancelButton = dialogState.buttons.find(
      button => button.style === 'cancel'
    )
    runDialogAction(cancelButton)
  }, [dialogState, runDialogAction])

  useEffect(() => {
    const previousAlert = originalAlertRef.current
    const previousGlobalAlert = originalGlobalAlertRef.current

    const bridgedAlert: typeof Alert.alert = (
      title,
      message,
      buttons,
      options
    ) => {
      showDialog(title || '提示', message, buttons, options)
    }

    Alert.alert = bridgedAlert
    globalThis.alert = (message?: any) => {
      showDialog('提示', String(message ?? ''))
    }

    return () => {
      Alert.alert = previousAlert
      globalThis.alert = previousGlobalAlert
    }
  }, [showDialog])

  return (
    <MessageContext.Provider value={{ showMessage, hideMessage, showDialog }}>
      {children}
      <Portal>
        <Dialog
          dismissable={dialogState?.options?.cancelable ?? true}
          dismissableBackButton={dialogState?.options?.cancelable ?? true}
          onDismiss={handleDialogDismiss}
          visible={!!dialogState}
        >
          <Dialog.Title>{dialogState?.title || '提示'}</Dialog.Title>
          {dialogState?.message ? (
            <Dialog.Content>
              <Text variant="bodyMedium">{dialogState.message}</Text>
            </Dialog.Content>
          ) : null}
          <Dialog.Actions>
            {dialogState?.buttons.map((button, index) => {
              const isPrimaryAction =
                dialogState.buttons.length === 1 ||
                index === dialogState.buttons.length - 1

              return (
                <Button
                  buttonColor={
                    button.style === 'destructive' && isPrimaryAction
                      ? APP_COLORS.surfaceVariant
                      : undefined
                  }
                  key={`${button.text || 'button'}-${index}`}
                  mode={isPrimaryAction ? 'contained-tonal' : 'text'}
                  onPress={() => runDialogAction(button)}
                  textColor={
                    button.style === 'destructive'
                      ? APP_COLORS.error
                      : undefined
                  }
                >
                  {button.text || (index === 0 ? '取消' : '确定')}
                </Button>
              )
            })}
          </Dialog.Actions>
        </Dialog>

        <Snackbar
          duration={snackbarState.duration}
          key={snackbarState.key}
          onDismiss={hideMessage}
          style={styles.snackbar}
          theme={{
            colors: {
              inverseSurface: APP_COLORS.primaryStrong,
              inverseOnSurface: APP_COLORS.white
            }
          }}
          visible={snackbarState.visible}
          wrapperStyle={styles.snackbarWrapper}
        >
          {snackbarState.message}
        </Snackbar>
      </Portal>
    </MessageContext.Provider>
  )
}

const styles = StyleSheet.create({
  snackbarWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  snackbar: {
    borderRadius: 16,
    backgroundColor: APP_COLORS.primaryStrong
  }
})
