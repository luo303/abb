import { View, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ImagePreviewModalProps {
  visible: boolean
  imageUrl: string | null
  onClose: () => void
}

export default function ImagePreviewModal({
  visible,
  imageUrl,
  onClose
}: ImagePreviewModalProps) {
  if (!imageUrl) return null

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.previewContainer}>
        <TouchableOpacity style={styles.previewClose} onPress={onClose}>
          <Ionicons name="close-circle" size={40} color="#fff" />
        </TouchableOpacity>
        <Image
          source={{ uri: imageUrl }}
          style={styles.previewImageFull}
          resizeMode="contain"
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1
  },
  previewImageFull: {
    width: '100%',
    height: '100%'
  }
})
