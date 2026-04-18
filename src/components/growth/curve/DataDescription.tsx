import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface DataDescriptionProps {
  type: 'height' | 'weight' | 'head'
  footer?: React.ReactNode
}

export default function DataDescription({
  type,
  footer
}: DataDescriptionProps) {
  const renderContent = () => {
    switch (type) {
      case 'height':
        return (
          <>
            <Text style={styles.title}>数据来源说明：</Text>
            <Text style={styles.text}>
              1. 参照国家卫健委《中国7岁以下儿童生长发育参照标准》按月推算。
            </Text>
            <Text style={styles.text}>
              2. 仅为全国平均参考值，每个宝宝发育节奏不同，上下浮动属正常现象。
            </Text>
          </>
        )
      case 'weight':
        return (
          <>
            <Text style={styles.title}>数据来源说明：</Text>
            <Text style={styles.text}>1. 参照国家卫健委标准按月线性推算。</Text>
            <Text style={styles.text}>
              2. 官方参考值(1岁)：男宝约10.05kg，女宝约9.40kg。
            </Text>
            <Text style={styles.text}>
              3. 数据仅供对照参考，非严格达标要求。
            </Text>
          </>
        )
      case 'head':
        return (
          <>
            <Text style={styles.title}>数据来源说明：</Text>
            <Text style={styles.text}>1. 参照国家卫健委标准按月推算。</Text>
            <Text style={styles.text}>2. 官方参考值(出生→1岁)：</Text>
            <Text style={styles.subText}>• 男宝：34.5cm → 46.3cm</Text>
            <Text style={styles.subText}>• 女宝：34.0cm → 45.2cm</Text>
          </>
        )
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle-outline" size={16} color="#94a3b8" />
        <Text style={styles.headerText}>参考说明</Text>
      </View>
      <View style={styles.content}>{renderContent()}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4
  },
  content: {
    paddingLeft: 4
  },
  footer: {
    marginTop: 12,
    alignItems: 'flex-end'
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4
  },
  text: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 2
  },
  subText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginLeft: 12
  }
})
