import React from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

export interface ChartPoint {
  month: string
  value: number
}

interface BaseGrowthChartProps {
  title: string
  unit: string
  standardData: ChartPoint[]
  babyData: ChartPoint[]
  yMin: number
  yMax: number
  standardColor?: string
  babyColor?: string
}

export default function BaseGrowthChart({
  title,
  unit,
  standardData = [],
  babyData = [],
  yMin,
  yMax,
  standardColor = '#5470C6', // 默认蓝色
  babyColor = '#EE6666' // 默认红色
}: BaseGrowthChartProps) {
  // 确保数据存在
  const safeStandardData = standardData || []
  const safeBabyData = babyData || []

  // 使用标准数据的月份作为 x 轴
  const months = safeStandardData.map(d => d.month)
  const standardValues = safeStandardData.map(d => d.value)

  // 映射宝宝数据到对应的月份，没有数据的月份填 null
  const babyValues = months.map(m => {
    const point = safeBabyData.find(d => d.month === m)
    return point ? point.value : null
  })

  // 计算默认显示的缩放比例（如果数据点超过8个，则只显示前8个，支持滑动查看更多）
  const MAX_VISIBLE_POINTS = 8
  let startZoom = 0
  let endZoom = 100

  if (months.length > MAX_VISIBLE_POINTS) {
    endZoom = Math.floor((MAX_VISIBLE_POINTS / months.length) * 100)
  }

  const chartHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background-color: #ffffff; 
            width: 100%; 
            height: 100%; 
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          #main { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="main"></div>
        <script>
          function initChart() {
            if (typeof echarts === 'undefined') {
              setTimeout(initChart, 100);
              return;
            }
            var myChart = echarts.init(document.getElementById('main'), null, { renderer: 'svg' });
            
            var option = {
              animation: true,
              backgroundColor: '#fae7ebff',
              grid: {
                top: '25%',
                left: '3%',
                right: '12%',
                bottom: '18%',
                containLabel: true
              },
              title: {
                text: '${title}',
                left: 'center',
                top: '0%',
                textStyle: { 
                  color: '#333', 
                  fontSize: 18,
                  fontWeight: '600'
                }
              },
              legend: {
                top: '30',
                left: 'center',
                icon: 'circle',
                itemWidth: 8,
                itemHeight: 8,
                textStyle: { color: '#666', fontSize: 12 }
              },
              dataZoom: [
                {
                  type: 'inside',
                  xAxisIndex: 0,
                  start: ${startZoom},
                  end: ${endZoom},
                  zoomLock: false,
                  moveOnMouseWheel: true,
                  moveOnMouseMove: true
                },
                {
                  type: 'slider',
                  xAxisIndex: 0,
                  start: ${startZoom},
                  end: ${endZoom},
                  height: 24,
                  bottom: 5,
                  handleSize: '100%',
                  moveHandleSize : '0',
                  brushSelect: false,
                  borderColor: 'transparent',
                  backgroundColor: '#f5f5f5',
                  fillerColor: '${babyColor}33',
                  showDataShadow: false,
                  handleStyle: {
                    color: '${babyColor}',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.2)',
                    shadowOffsetX: 1,
                    shadowOffsetY: 1
                  },
                  textStyle: { color: '#999' }
                }
              ],
              tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                borderColor: '#eee',
                borderWidth: 1,
                padding: [10, 15],
                textStyle: { color: '#333', fontSize: 13 },
                extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
                formatter: function(params) {
                  let res = '<div style="font-weight:600;margin-bottom:4px;">' + params[0].name + ' 个月</div>';
                  params.forEach(item => {
                    // 只有当有有效数值时才显示
                    if (item.value != null && item.value !== undefined) {
                      res += '<div style="display:flex;align-items:center;justify-content:space-between;min-width:100px;">' +
                             '<span>' + item.marker + item.seriesName + '</span>' +
                             '<span style="font-weight:600;margin-left:10px;">' + item.value + ' ${unit}</span>' +
                             '</div>';
                    }
                  });
                  return res;
                }
              },
              xAxis: {
                type: 'category',
                name: '月龄',
                nameTextStyle: { color: '#999', fontSize: 11 },
                data: ${JSON.stringify(months)},
                axisLine: { lineStyle: { color: '#f0f0f0' } },
                axisTick: { show: false },
                axisLabel: { color: '#999', fontSize: 11, margin: 12 }
              },
              yAxis: {
                type: 'value',
                name: '单位: ${unit}',
                nameTextStyle: { color: '#999', fontSize: 11, padding: [0, 0, 0, 10] },
                min: ${yMin},
                max: ${yMax},
                splitNumber: 5,
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
                axisLabel: { color: '#999', fontSize: 11 }
              },
              series: [
                {
                  name: '标准范围',
                  type: 'line',
                  data: ${JSON.stringify(standardValues)},
                  smooth: false,
                  showSymbol: false,
                  lineStyle: { 
                    color: '${standardColor}', 
                    width: 2,
                    type: 'dashed',
                    opacity: 0.8
                  },
                  emphasis: { disabled: true }
                },
                {
                  name: '宝宝数据',
                  type: 'line',
                  data: ${JSON.stringify(babyValues)},
                  smooth: false,
                  connectNulls: true,
                  showSymbol: true,
                  symbol: 'circle',
                  symbolSize: 10,
                  itemStyle: { 
                    color: '#fff',
                    borderWidth: 3,
                    borderColor: '${babyColor}',
                    shadowColor: 'rgba(0,0,0,0.2)',
                    shadowBlur: 5
                  },
                  lineStyle: { 
                    color: '${babyColor}', 
                    width: 3,
                    shadowColor: '${babyColor}4d',
                    shadowBlur: 10,
                    shadowOffsetY: 4
                  },
                  areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '${babyColor}4d' },
                      { offset: 1, color: '${babyColor}00' }
                    ])
                  }
                }
              ]
            };
            
            myChart.setOption(option);
            window.onresize = function() { myChart.resize(); };
          }
          initChart();
        </script>
      </body>
    </html>
  `

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <WebView
          originWhitelist={['*']}
          source={{ html: chartHtml }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          androidLayerType="hardware"
          mixedContentMode="always"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 6,
    paddingVertical: 3
  },
  container: {
    height: 380,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  webview: {
    flex: 1,
    backgroundColor: '#f6f7fb'
  }
})
