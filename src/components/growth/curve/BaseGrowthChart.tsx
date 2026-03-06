import React from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

export interface ChartPoint {
  label: string
  value: number
}

interface BaseGrowthChartProps {
  title: string
  unit: string
  xAxisName?: string // X轴名称，默认为"月龄"
  standardData: ChartPoint[]
  babyData: ChartPoint[]
  headlineValue?: number | string
  yMin: number
  yMax: number
  standardColor?: string
  babyColor?: string
  showDataZoomSlider?: boolean
}

export default function BaseGrowthChart({
  title,
  unit,
  xAxisName = '月龄',
  standardData = [],
  babyData = [],
  headlineValue,
  yMin,
  yMax,
  standardColor = '#5470C6', // 默认蓝色
  babyColor = '#EE6666', // 默认红色
  showDataZoomSlider = true
}: BaseGrowthChartProps) {
  // 从主题色提取的值
  const THEME_BLUE = '#3b66f5' // 标准范围颜色
  const THEME_RED = '#f46e6e' // 宝宝数据颜色

  // 覆盖默认颜色
  const finalStandardColor =
    standardColor === '#5470C6' ? THEME_BLUE : standardColor
  const finalBabyColor = babyColor === '#EE6666' ? THEME_RED : babyColor

  // 确保数据存在
  const safeStandardData = standardData || []
  const safeBabyData = babyData || []

  // 组合标准与宝宝数据的 label，保证至少能用宝宝数据渲染
  const standardLabelSet = (safeStandardData || []).map(d => String(d.label))
  const babyLabelSet = (safeBabyData || []).map(d => String(d.label))
  const labels = Array.from(
    new Set([...standardLabelSet, ...babyLabelSet])
  ).sort((a, b) => Number(a) - Number(b))

  // 构建映射，便于按统一的 labels 输出数值
  const standardMap = new Map<string, number>()
  for (const d of safeStandardData) {
    standardMap.set(String(d.label), d.value)
  }
  const babyMap = new Map<string, number>()
  for (const d of safeBabyData) {
    babyMap.set(String(d.label), d.value)
  }

  const standardValues = labels.map(l =>
    standardMap.has(l) ? standardMap.get(l) : null
  )
  const babyValues = labels.map(l => (babyMap.has(l) ? babyMap.get(l) : null))

  // 小数据量维持旧逻辑（最多显示 8 个点），大数据量改为显示总数的 1/4（向上取整）
  const LEGACY_VISIBLE_POINTS = 8
  const QUARTER_SWITCH_THRESHOLD = LEGACY_VISIBLE_POINTS * 4 // 32
  const defaultVisiblePoints =
    labels.length > QUARTER_SWITCH_THRESHOLD
      ? Math.max(1, Math.ceil(labels.length / 4))
      : LEGACY_VISIBLE_POINTS
  let startZoom = 0
  let endZoom = 100

  if (labels.length > defaultVisiblePoints) {
    // 默认显示最后 defaultVisiblePoints 个点
    // startZoom 计算公式： (1 - 可见点数 / 总数) * 100
    startZoom = Math.floor((1 - defaultVisiblePoints / labels.length) * 100)
    endZoom = 100
  }

  // 获取最新的宝宝数据值
  const lastBabyValue = babyValues.filter(v => v !== null).pop()
  const displayHeadlineValue =
    headlineValue ??
    (lastBabyValue !== null && lastBabyValue !== undefined
      ? lastBabyValue
      : '--')

  const gridBottom = showDataZoomSlider ? '18%' : '8%'
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
            -webkit-tap-highlight-color: transparent; /* 禁用点击高亮 */
            user-select: none; /* 禁止选中文本 */
            -webkit-user-select: none;
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
              backgroundColor: '#ffffff',
              grid: {
                top: '25%',
                left: '3%',
                right: '12%',
                bottom: '${gridBottom}',
                containLabel: true
              },
              title: {
                text: '{value|宝宝目前${title.replace('发育曲线', '')}} {num|${displayHeadlineValue}} {unit|${unit}}',
                left: 'center',
                top: '5%',
                textStyle: { 
                  rich: {
                    value: { color: '#666', fontSize: 14, fontWeight: '500' },
                    num: { color: '${THEME_BLUE}', fontSize: 24, fontWeight: '600', padding: [0, 4, 0, 8] },
                    unit: { color: '${THEME_BLUE}', fontSize: 14 }
                  }
                }
              },
              legend: {
                top: '15%',
                left: 'center',
                icon: 'circle',
                itemWidth: 8,
                itemHeight: 8,
                itemGap: 20,
                textStyle: { color: '#666', fontSize: 12 },
                data: [
                  { name: '标准范围', icon: 'circle' },
                  { name: '宝宝数据', icon: 'circle', itemStyle: { color: '#fff', borderColor: '${finalBabyColor}', borderWidth: 2 } }
                ]
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
                }${
                  showDataZoomSlider
                    ? `,
                {
                  type: 'slider',
                  xAxisIndex: 0,
                  start: ${startZoom},
                  end: ${endZoom},
                  height: 30,
                  bottom: 20,
                  handleSize: '150%',
                  moveHandleSize : '0',
                  brushSelect: false,
                  borderColor: 'transparent',
                  backgroundColor: '#f5f5f5',
                  fillerColor: '${finalBabyColor}33',
                  showDataShadow: false,
                  handleStyle: {
                    color: '${finalBabyColor}',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.2)',
                    shadowOffsetX: 1,
                    shadowOffsetY: 1
                  },
                  textStyle: { color: '#999' }
                }`
                    : ''
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
                  let res = '<div style="color:#999;font-size:12px;margin-bottom:8px;">' +' 第 '+ params[0].name + ' ${xAxisName}</div>';
                  params.forEach(item => {
                    // 只有当有有效数值时才显示
                    if (item.value != null && item.value !== undefined) {
                      let color = item.seriesName === '标准范围' ? '${finalStandardColor}' : '${finalBabyColor}';
                      let fontWeight = item.seriesName === '宝宝数据' ? '600' : '400';
                      // 手动构建图标样式
                      let iconStyle = item.seriesName === '宝宝数据' 
                        ? 'background-color:#fff;border:2px solid ' + color + ';width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:6px;'
                        : 'background-color:' + color + ';width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:6px;';
                      
                      res += '<div style="display:flex;align-items:center;justify-content:space-between;min-width:120px;margin-bottom:4px;">' +
                             '<div><span style="' + iconStyle + '"></span><span>' + item.seriesName + '</span></div>' +
                             '<span style="font-weight:' + fontWeight + ';color:' + color + ';margin-left:10px;">' + item.value + ' ${unit}</span>' +
                             '</div>';
                    }
                  });
                  return res;
                }
              },
              xAxis: {
                type: 'category',
                name: '${xAxisName}',
                nameTextStyle: { color: '#999', fontSize: 11 },
                data: ${JSON.stringify(labels)},
                axisLine: { lineStyle: { color: '#f0f0f0' } },
                axisTick: { show: false },
                axisLabel: { color: '#999', fontSize: 11, margin: 12 }
              },
              yAxis: {
                type: 'value',
                name: '${unit}', // 显示单位
                nameTextStyle: { 
                  color: '#999', 
                  fontSize: 11, 
                  align: 'right',
                },
                min: ${yMin},
                max: ${yMax},
                splitNumber: 5,
                axisLine: { show:true,lineStyle: { color: '#f0f0f0' } },
                axisTick: { show: false },
                splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
                axisLabel: { 
                  color: '#999', 
                  fontSize: 11
                }
              },
              series: [
                {
                  name: '标准范围',
                  type: 'line',
                  data: ${JSON.stringify(standardValues)},
                  smooth: false,
                  showSymbol: false,
                  lineStyle: { 
                    color: '${finalStandardColor}', 
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
                  symbolSize: 8,
                  itemStyle: { 
                    color: '#fff',
                    borderWidth: 3,
                    borderColor: '${finalBabyColor}',
                    shadowColor: 'rgba(0,0,0,0.1)',
                    shadowBlur: 2
                  },
                  lineStyle: { 
                    color: '${finalBabyColor}', 
                    width: 3,
                    shadowColor: '${finalBabyColor}4d',
                    shadowBlur: 4,
                    shadowOffsetY: 2
                  },
                  areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '${finalBabyColor}26' }, // 15% opacity
                      { offset: 1, color: '${finalBabyColor}00' }
                    ])
                  },
                  markPoint: {
                    symbol: 'path://M10,0 L20,10 L10,20 L0,10 Z', // Custom symbol if needed, or use 'pin'
                    symbolSize: 0, // Hide default symbol
                    label: {
                      show: true,
                      formatter: '{c} ${unit}',
                      offset: [0, -20],
                      backgroundColor: '#fff',
                      borderColor: '#eee',
                      borderWidth: 1,
                      borderRadius: 4,
                      padding: [4, 8],
                      color: '${THEME_BLUE}',
                      fontWeight: 'bold',
                      shadowColor: 'rgba(0,0,0,0.1)',
                      shadowBlur: 4
                    },
                    data: [
                      { type: 'max', name: '最大值' }
                    ]
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
