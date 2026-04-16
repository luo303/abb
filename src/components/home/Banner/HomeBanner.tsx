import React, { useMemo, useCallback } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import { useIsFocused } from '@react-navigation/native'
import BannerItem from './BannerItem'

const { width } = Dimensions.get('window')
const BANNER_WIDTH = width - 32

const RAW_DATA = [
  {
    id: '1',
    imageSource: require('../../../assets/poster_ai.jpg'),
    targetPage: 'AIAssistant'
  },
  {
    id: '3',
    imageSource: require('../../../assets/growthcurve.png'),
    targetPage: 'GrowthCurve'
  },
  {
    id: '4',
    imageSource: require('../../../assets/majorevents.png'),
    targetPage: 'MilestoneList'
  },
  {
    id: '5',
    imageSource: require('../../../assets/vaccinerecords.png'),
    targetPage: 'VaccineRecord'
  }
]

const HomeBanner = React.memo(function HomeBanner() {
  const isFocused = useIsFocused()

  const modeConfig = useMemo(
    () => ({
      parallaxScrollingScale: 0.92,
      parallaxScrollingOffset: 20,
      parallaxAdjacentItemScale: 0.88
    }),
    []
  )

  const renderItem = useCallback(
    ({ item }: { item: (typeof RAW_DATA)[number] }) => (
      <View style={styles.itemContainer}>
        <View style={styles.cardWrapper}>
          <BannerItem
            imageSource={item.imageSource}
            targetPage={item.targetPage}
          />
        </View>
      </View>
    ),
    []
  )

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={BANNER_WIDTH}
        height={150}
        autoPlay={isFocused}
        autoPlayInterval={3200}
        data={RAW_DATA}
        scrollAnimationDuration={850}
        mode="parallax"
        modeConfig={modeConfig}
        renderItem={renderItem}
      />
    </View>
  )
})

export default HomeBanner

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 4,
    alignItems: 'center'
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardWrapper: {
    width: BANNER_WIDTH,
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4
  }
})
