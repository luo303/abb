import { RecordItem } from '../../types/recordTypes'

// 日常记录模拟数据 - 按日期存储
const dailyRecordMock: Record<string, RecordItem[]> = {
  '2026-02-27': [
    {
      id: '1',
      type: 'feeding',
      time: '07:20',
      details: '母乳',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '2',
      type: 'diaper',
      time: '08:45',
      details: '便便',
      icon: 'baby-carriage',
      name: '换尿布'
    },
    {
      id: '3',
      type: 'sleep',
      time: '10:15',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    },
    {
      id: '4',
      type: 'feeding',
      time: '12:30',
      details: '奶粉',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '5',
      type: 'diaper',
      time: '14:10',
      details: '小便',
      icon: 'baby-carriage',
      name: '换尿布'
    },
    {
      id: '6',
      type: 'sleep',
      time: '15:30',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    },
    {
      id: '7',
      type: 'feeding',
      time: '18:00',
      details: '母乳',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '8',
      type: 'feeding',
      time: '20:30',
      details: '奶粉',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '9',
      type: 'diaper',
      time: '21:15',
      details: '便便',
      icon: 'baby-carriage',
      name: '换尿布'
    },
    {
      id: '10',
      type: 'sleep',
      time: '22:00',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    },
    {
      id: '11',
      type: 'feeding',
      time: '23:30',
      details: '母乳',
      icon: 'baby-bottle',
      name: '喂养记录'
    }
  ],
  '2026-02-26': [
    {
      id: '8',
      type: 'feeding',
      time: '06:45',
      details: '奶粉',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '9',
      type: 'diaper',
      time: '09:20',
      details: '便便',
      icon: 'baby-carriage',
      name: '换尿布'
    },
    {
      id: '10',
      type: 'sleep',
      time: '11:00',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    },
    {
      id: '11',
      type: 'feeding',
      time: '13:45',
      details: '母乳',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '12',
      type: 'diaper',
      time: '16:30',
      details: '小便',
      icon: 'baby-carriage',
      name: '换尿布'
    }
  ],
  '2026-02-25': [
    {
      id: '13',
      type: 'feeding',
      time: '08:00',
      details: '奶粉',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '14',
      type: 'sleep',
      time: '09:30',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    },
    {
      id: '15',
      type: 'diaper',
      time: '12:15',
      details: '便便',
      icon: 'baby-carriage',
      name: '换尿布'
    },
    {
      id: '16',
      type: 'feeding',
      time: '14:00',
      details: '母乳',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '17',
      type: 'sleep',
      time: '16:30',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    },
    {
      id: '18',
      type: 'diaper',
      time: '19:00',
      details: '小便',
      icon: 'baby-carriage',
      name: '换尿布'
    }
  ],
  '2026-02-24': [
    {
      id: '19',
      type: 'feeding',
      time: '07:30',
      details: '奶粉',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '20',
      type: 'diaper',
      time: '09:15',
      details: '便便',
      icon: 'baby-carriage',
      name: '换尿布'
    },
    {
      id: '21',
      type: 'sleep',
      time: '10:45',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    },
    {
      id: '22',
      type: 'feeding',
      time: '13:30',
      details: '母乳',
      icon: 'baby-bottle',
      name: '喂养记录'
    }
  ],
  '2026-02-23': [
    {
      id: '23',
      type: 'sleep',
      time: '08:30',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    },
    {
      id: '24',
      type: 'feeding',
      time: '11:45',
      details: '奶粉',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '25',
      type: 'diaper',
      time: '13:20',
      details: '小便',
      icon: 'baby-carriage',
      name: '换尿布'
    },
    {
      id: '26',
      type: 'sleep',
      time: '15:00',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    },
    {
      id: '27',
      type: 'feeding',
      time: '17:30',
      details: '母乳',
      icon: 'baby-bottle',
      name: '喂养记录'
    }
  ],
  '2026-02-22': [
    {
      id: '28',
      type: 'feeding',
      time: '06:30',
      details: '母乳',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '29',
      type: 'diaper',
      time: '08:45',
      details: '便便',
      icon: 'baby-carriage',
      name: '换尿布'
    },
    {
      id: '30',
      type: 'sleep',
      time: '10:00',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    },
    {
      id: '31',
      type: 'feeding',
      time: '12:30',
      details: '奶粉',
      icon: 'baby-bottle',
      name: '喂养记录'
    },
    {
      id: '32',
      type: 'diaper',
      time: '14:15',
      details: '小便',
      icon: 'baby-carriage',
      name: '换尿布'
    },
    {
      id: '33',
      type: 'sleep',
      time: '16:00',
      details: '睡眠时长',
      icon: 'weather-night',
      name: '睡眠记录'
    }
  ]
}

export default dailyRecordMock
