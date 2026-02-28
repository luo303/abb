import React from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { InputItem } from '@ant-design/react-native'

interface AmountInputProps {
  value: string
  onChange: (text: string) => void
  type: '奶粉' | '母乳' | '辅食'
  placeholder: string
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  type,
  placeholder
}) => {
  const getLabel = (type: '奶粉' | '母乳' | '辅食') => {
    switch (type) {
      case '奶粉':
        return '喂养量'
      case '母乳':
        return '喂养时长'
      case '辅食':
        return '喂养量'
      default:
        return '喂养量'
    }
  }

  const getUnit = (type: '奶粉' | '母乳' | '辅食') => {
    switch (type) {
      case '奶粉':
        return 'ml'
      case '母乳':
        return 'min'
      case '辅食':
        return 'g'
      default:
        return ''
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.labelText}>{getLabel(type)}</Text>
      <InputItem
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        keyboardType="numeric"
        style={styles.inputItem}
        extra={<Text style={styles.unitText}>{getUnit(type)}</Text>}
        last
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16
  },
  inputItem: {
    paddingVertical: 8,
    borderBottomWidth: 0,
    width: '100%'
  },
  unitText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8
  },
  labelText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8
  }
})

export default AmountInput
