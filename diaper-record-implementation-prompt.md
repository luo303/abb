# 尿布记录功能实现指南

## 任务目标

实现尿布记录的完整功能，包括：

1. 按日期获取尿布记录列表
2. 创建新的尿布记录
3. 更新现有尿布记录
4. 确保数据的本地持久化和数据闭环

## 现有代码结构分析

### 1. 类型定义 (`src/types/diaper.ts`)

- 定义了 `DiaperType`、`PeeColor`、`PoopColor`、`PoopConsistency` 等枚举
- 定义了 `DiaperItem` 接口，包含尿布记录的完整数据结构
- 定义了 `DiaperRecordRequest` 接口，用于API请求

### 2. API 调用 (`src/api/diaper.ts`)

- `getDiaperListByDateReq`: 获取单日尿布记录列表
- `addDiaperRecordReq`: 新增尿布记录
- `updateDiaperRecordReq`: 修改尿布记录
- `getDiaperDetailReq`: 获取单条记录详情
- `deleteDiaperRecordReq`: 删除记录

### 3. 状态管理 (`src/store/modules/diaperStore.ts`)

- 使用 Redux Toolkit 创建状态管理
- 包含 `fetchDiaperList` 异步 thunk
- 提供 `addDiaperRecord`、`updateDiaperRecord`、`deleteDiaperRecord` 等 action
- 处理加载状态和错误状态

### 4. 组件 (`src/components/DailyRecord/DiaperRecord`)

- `DiaperTypeSelector`: 尿布类型选择器
- `PeeColorSelector`: 尿液颜色选择器
- `PoopColorSelector`: 粪便颜色选择器
- `PoopConsistencySelector`: 粪便性状选择器
- `RemarkInput`: 备注输入
- `TimePicker`: 时间选择器

## 实现步骤

### 步骤 1: 完善 API 调用函数

1. **更新 `src/api/diaper.ts` 文件**：
   - 确保所有 API 函数使用正确的接口地址
   - 为每个函数添加适当的错误处理
   - 确保类型定义与接口返回数据匹配

### 步骤 2: 优化 Redux Store

1. **更新 `src/store/modules/diaperStore.ts` 文件**：
   - 实现 `addDiaperItem` 异步 thunk，调用 `addDiaperRecordReq`
   - 实现 `updateDiaperItem` 异步 thunk，调用 `updateDiaperRecordReq`
   - 实现 `deleteDiaperItem` 异步 thunk，调用 `deleteDiaperRecordReq`
   - 添加本地存储逻辑，确保数据持久化
   - 实现错误处理和加载状态管理

### 步骤 3: 优化 DiaperFormScreen

1. **更新 `src/app/DiaperFormScreen.tsx` 文件**：
   - 简化组件逻辑，移除冗余代码
   - 确保表单提交时正确调用 API
   - 使用现有的选择器组件构建表单
   - 添加适当的加载状态和错误提示
   - 实现成功保存后的导航逻辑

### 步骤 4: 集成到 DailyRecord 页面

1. **更新 `src/app/(HomeNavGrid)/DailyRecord.tsx` 文件**：
   - 确保能够正确获取和显示尿布记录
   - 实现尿布记录的筛选和排序逻辑
   - 确保与其他类型记录（喂养、睡眠）的正确合并

## 最佳实践

### 代码组织

- **单一职责原则**: 每个文件和函数只负责一个功能
- **模块化**: 将相关功能组织到独立的模块中
- **代码简洁性**: 避免冗余代码，保持代码清晰易读
- **类型安全**: 使用 TypeScript 类型定义确保类型安全

### 数据管理

- **本地持久化**: 使用 AsyncStorage 实现数据的本地存储
- **数据同步**: 确保 Redux store 和本地存储的数据一致性
- **错误处理**: 为所有异步操作添加适当的错误处理
- **状态管理**: 合理管理加载状态、错误状态和成功状态

### API 调用

- **合理调用时机**: 只在必要时调用 API
- **参数验证**: 确保 API 调用参数格式正确
- **响应处理**: 正确处理 API 响应和错误
- **数据转换**: 确保 API 数据与前端数据结构的正确转换

### 性能优化

- **避免不必要的渲染**: 使用 React.memo 和 useCallback 优化组件性能
- **批量更新**: 避免频繁的状态更新
- **网络请求优化**: 合理使用缓存，避免重复请求

## 注意事项

- 确保所有时间戳使用统一的单位（毫秒）
- 确保日期格式一致（YYYY-MM-DD）
- 避免使用硬编码的 API 地址，使用环境变量或配置文件
- 确保错误信息清晰明确，便于调试
- 遵循项目现有的代码风格和命名规范

## 验证步骤

1. 测试创建尿布记录功能
2. 测试更新尿布记录功能
3. 测试按日期获取尿布记录功能
4. 测试本地存储和数据同步功能
5. 测试与其他记录类型的集成
6. 验证所有功能在不同场景下的表现

请按照以上步骤实现尿布记录功能，确保代码质量和功能完整性。
