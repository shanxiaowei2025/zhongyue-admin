# 中岳管理系统

## 1.前端 zhongyue-vue

### 项目结构

### 组件说明

#### ReAnimateSelector 动画选择器组件 src/components/ReAnimateSelector/src/index.vue

基于 [animate.css](https://animate.style/) 的动画效果选择器组件。支持搜索过滤、实时预览动画效果。

#### ReAuth 权限组件 src/components/ReAuth/src/auth.tsx

用于控制页面元素权限的组件。根据传入的权限值判断是否显示子元素内容。

#### ReBarcode 条形码组件 src/components/ReBarcode/src/index.vue

基于 [JsBarcode](https://github.com/lindell/JsBarcode) 的条形码生成组件。支持多种条形码格式。

#### ReCol 栅格列组件 src/components/ReCol/index.ts

对 Element Plus 的 el-col 组件进行封装,简化响应式栅格的使用。

#### ReCountTo 数字动画组件 src/components/ReCountTo/

提供两种数字动画效果:

- ReNormalCountTo: 普通数字动画
- ReboundCountTo: 回弹式数字动画

#### ReCropper 图片裁剪组件 src/components/ReCropper/src/index.tsx

基于 [cropperjs](https://github.com/fengyuanchen/cropperjs) 的图片裁剪组件。支持圆形/矩形裁剪、旋转缩放、键盘操作等。

#### ReDialog 对话框组件 src/components/ReDialog/src/index.vue

对 Element Plus 的 el-dialog 组件进行封装,支持拖拽、全屏、自定义标题等功能。

#### ReDrawer 抽屉组件 src/components/ReDrawer/src/index.vue

对 Element Plus 的 el-drawer 组件进行封装,支持多层嵌套、自定义宽度等功能。

#### ReEditor 富文本编辑器组件 src/components/ReEditor/src/index.vue

基于 [wangEditor](https://www.wangeditor.com/) 的富文本编辑器组件。支持图片上传、表格、代码等功能。

#### ReForm 表单组件 src/components/ReForm/src/index.vue

对 Element Plus 的 el-form 组件进行封装,支持动态表单项、表单验证等功能。

#### ReIcon 图标组件 src/components/ReIcon/src/index.tsx

支持 SVG 图标和 IconFont 图标的统一封装组件。

#### ReImageVerify 图片验证码组件 src/components/ReImageVerify/src/index.vue

滑动验证码组件,支持自定义背景图片、验证规则等。

#### ReMap 地图组件 src/components/ReMap/src/index.vue

基于高德地图的地图组件。支持标记点、路线规划、地址搜索等功能。

#### ReQrcode 二维码组件 src/components/ReQrcode/src/index.vue

基于 [qrcode.js](https://github.com/davidshimjs/qrcodejs) 的二维码生成组件。支持自定义样式、Logo等。

#### ReSelect 选择器组件 src/components/ReSelect/src/index.vue

对 Element Plus 的 el-select 组件进行封装,支持远程搜索、多选等功能。

#### ReTable 表格组件 src/components/ReTable/src/index.vue

对 Element Plus 的 el-table 组件进行封装,支持分页、排序、筛选、导出等功能。

#### Upload 上传组件 src/components/Upload/src/index.vue

对 Element Plus 的 el-upload 组件进行封装,支持图片预览、文件限制等功能。

#### ReSearch 搜索组件 src/components/ReSearch/src/index.vue

高级搜索组件,支持多条件组合查询、条件保存、快捷搜索等功能。

#### ReSplitPane 分割面板组件 src/components/ReSplitPane/src/index.vue

可拖拽的分割面板组件,支持垂直/水平分割、最小尺寸限制等。

#### ReSticky 粘性布局组件 src/components/ReSticky/src/index.vue

实现元素在滚动时的粘性定位效果,支持自定义偏移值和滚动容器。

#### ReTagsView 标签页组件 src/components/ReTagsView/src/index.vue

多标签页导航组件,支持页面缓存、关闭操作、右键菜单等功能。

#### ReTextEditor 文本编辑器组件 src/components/ReTextEditor/src/index.vue

基于 [Monaco Editor](https://microsoft.github.io/monaco-editor/) 的代码编辑器组件,支持多种语言高亮。

#### ReTime 时间组件 src/components/ReTime/src/index.vue

时间显示组件,支持多种格式化方式、自动更新、倒计时等功能。

#### ReTreeSelect 树形选择器组件 src/components/ReTreeSelect/src/index.vue

树形结构的选择器组件,支持单选/多选、异步加载、搜索过滤等功能。

#### ReVerify 验证码组件 src/components/ReVerify/src/index.vue

多种验证码组件集合,包括数字验证码、滑块验证码、拼图验证码等。

#### ReWatermark 水印组件 src/components/ReWatermark/src/index.vue

页面水印组件,支持自定义文字、图片、角度、透明度等。

#### ReContextMenu 右键菜单组件 src/components/ReContextMenu/src/index.vue

自定义右键菜单组件,支持多级菜单、快捷键、分割线等功能。

#### ReDraggable 拖拽组件 src/components/ReDraggable/src/index.vue

基于 [Sortable.js](https://github.com/SortableJS/Sortable) 的拖拽排序组件,支持列表/网格拖拽。

#### ReEcharts 图表组件 src/components/ReEcharts/src/index.vue

基于 [ECharts](https://echarts.apache.org/) 的图表组件,支持自适应、主题切换等功能。

#### ReMarkdown 编辑器组件 src/components/ReMarkdown/src/index.vue

基于 [markdown-it](https://github.com/markdown-it/markdown-it) 的 Markdown 编辑器,支持预览、导出等功能。

#### RePdf PDF预览组件 src/components/RePdf/src/index.vue

基于 [pdf.js](https://mozilla.github.io/pdf.js/) 的 PDF 预览组件,支持缩放、翻页、打印等功能。

#### RePlayer 播放器组件 src/components/RePlayer/src/index.vue

视频播放器组件,支持多种格式、弹幕、倍速播放等功能。

#### ReSignature 签名组件 src/components/ReSignature/src/index.vue

电子签名组件,支持手写签名、触摸屏签名、签名保存等功能。

### 页面说明

### 功能逻辑

## 2.后端 zhongyue-django

### 接口说明

#### 用户管理接口 (zhongyue-django/apps/users)

##### /login 用户登录

- 实现：`zhongyue-django/apps/users/views.py:LoginView`
- 请求方式：POST
- 参数：`{ "username": "string", "password": "string" }`
- 返回格式：`{ "code": 200, "data": { "token": "string" }, "message": "登录成功" }`

##### /refresh-token 刷新token

- 实现：`zhongyue-django/apps/users/views.py:RefreshTokenView`
- 请求方式：POST
- 参数：`{ "token": "string" }`
- 返回格式：`{ "code": 200, "data": { "token": "string" }, "message": "刷新成功" }`

##### /get-async-routes 获取路由

- 实现：`zhongyue-django/apps/users/views.py:get_async_routes`
- 请求方式：GET
- 参数：无
- 返回格式：`{ "code": 200, "data": { "routes": [] } }`

##### /user 用户列表

- 实现：`zhongyue-django/apps/users/views.py:get_user_list`
- 请求方式：GET
- 参数：`{ "page": "number", "size": "number", "keyword": "string?", "role_id": "number?", "dept_id": "number?" }`
- 返回格式：`{ "code": 200, "data": { "total": "number", "items": [{ "id": "number", "username": "string", "role": "string", "dept": "string" }] } }`

##### /list-role-ids 获取角色ID列表

- 实现：`zhongyue-django/apps/users/views.py:get_role_ids`
- 请求方式：GET
- 参数：无
- 返回格式：`{ "code": 200, "data": ["number"] }`

##### /user/create 创建用户

- 实现：`zhongyue-django/apps/users/views.py:create_user`
- 请求方式：POST
- 参数：`{ "username": "string", "password": "string", "role_id": "number", "dept_id": "number", "email": "string?", "phone": "string?" }`
- 返回格式：`{ "code": 200, "message": "创建成功" }`

##### /user/update 更新用户

- 实现：`zhongyue-django/apps/users/views.py:update_user`
- 请求方式：PUT
- 参数：`{ "id": "number", "role_id": "number?", "dept_id": "number?", "email": "string?", "phone": "string?" }`
- 返回格式：`{ "code": 200, "message": "更新成功" }`

##### /user/delete 删除用户

- 实现：`zhongyue-django/apps/users/views.py:delete_user`
- 请求方式：DELETE
- 参数：`{ "id": "number" }`
- 返回格式：`{ "code": 200, "message": "删除成功" }`

##### /user/reset-password 重置密码

- 实现：`zhongyue-django/apps/users/views.py:reset_password`
- 请求方式：POST
- 参数：`{ "id": "number", "password": "string" }`
- 返回格式：`{ "code": 200, "message": "重置成功" }`

##### /user/upload-avatar 上传头像

- 实现：`zhongyue-django/apps/users/views.py:upload_avatar`
- 请求方式：POST
- 参数：`{ "file": "File" }`
- 返回格式：`{ "code": 200, "data": { "url": "string" }, "message": "上传成功" }`

##### /user-roles 获取用户角色

- 实现：`zhongyue-django/apps/users/views.py:get_user_roles`
- 请求方式：GET
- 参数：`{ "user_id": "number" }`
- 返回格式：`{ "code": 200, "data": ["number"] }`

##### /user/update-roles 更新用户角色

- 实现：`zhongyue-django/apps/users/views.py:update_user_roles`
- 请求方式：PUT
- 参数：`{ "user_id": "number", "role_ids": ["number"] }`
- 返回格式：`{ "code": 200, "message": "更新成功" }`

##### /role 角色列表

- 实现：`zhongyue-django/apps/users/views.py:get_role_list`
- 请求方式：GET
- 参数：`{ "page": "number", "size": "number" }`
- 返回格式：`{ "code": 200, "data": { "total": "number", "items": [{ "id": "number", "name": "string", "description": "string", "permissions": ["string"] }] } }`

##### /list-all-role 获取所有角色

- 实现：`zhongyue-django/apps/users/views.py:get_all_roles`
- 请求方式：GET
- 参数：无
- 返回格式：`{ "code": 200, "data": [{ "id": "number", "name": "string" }] }`

##### /role/create 创建角色

- 实现：`zhongyue-django/apps/users/views.py:create_role`
- 请求方式：POST
- 参数：`{ "name": "string", "description": "string?", "permissions": ["string"] }`
- 返回格式：`{ "code": 200, "message": "创建成功" }`

##### /role/update 更新角色

- 实现：`zhongyue-django/apps/users/views.py:update_role`
- 请求方式：PUT
- 参数：`{ "id": "number", "name": "string?", "description": "string?", "permissions": ["string"]? }`
- 返回格式：`{ "code": 200, "message": "更新成功" }`

##### /role/delete 删除角色

- 实现：`zhongyue-django/apps/users/views.py:delete_role`
- 请求方式：DELETE
- 参数：`{ "id": "number" }`
- 返回格式：`{ "code": 200, "message": "删除成功" }`

##### /dept 部门列表

- 实现：`zhongyue-django/apps/users/views.py:get_dept_list`
- 请求方式：GET
- 参数：`{ "page": "number", "size": "number" }`
- 返回格式：`{ "code": 200, "data": { "total": "number", "items": [{ "id": "number", "name": "string", "parent_id": "number", "leader": "string" }] } }`

##### /dept/create 创建部门

- 实现：`zhongyue-django/apps/users/views.py:create_dept`
- 请求方式：POST
- 参数：`{ "name": "string", "parent_id": "number?", "leader": "string?" }`
- 返回格式：`{ "code": 200, "message": "创建成功" }`

##### /dept/update 更新部门

- 实现：`zhongyue-django/apps/users/views.py:update_dept`
- 请求方式：PUT
- 参数：`{ "id": "number", "name": "string?", "parent_id": "number?", "leader": "string?" }`
- 返回格式：`{ "code": 200, "message": "更新成功" }`

##### /dept/delete 删除部门

- 实现：`zhongyue-django/apps/users/views.py:delete_dept`
- 请求方式：DELETE
- 参数：`{ "id": "number" }`
- 返回格式：`{ "code": 200, "message": "删除成功" }`

##### /permission 权限列表

- 实现：`zhongyue-django/apps/users/views.py:get_permissions_list`
- 请求方式：GET
- 参数：`{ "page": "number", "size": "number" }`
- 返回格式：`{ "code": 200, "data": { "total": "number", "items": [{ "id": "number", "name": "string", "code": "string" }] } }`

##### /permission/update 更新权限

- 实现：`zhongyue-django/apps/users/views.py:update_permission`
- 请求方式：PUT
- 参数：`{ "id": "number", "name": "string?", "code": "string?" }`
- 返回格式：`{ "code": 200, "message": "更新成功" }`

##### /current-user-permissions 获取当前用户权限

- 实现：`zhongyue-django/apps/users/views.py:get_current_user_permissions`
- 请求方式：GET
- 参数：无
- 返回格式：`{ "code": 200, "data": ["string"] }`

#### 费用管理接口 (zhongyue-django/apps/expense)

##### /expense 费用列表

- 实现：`zhongyue-django/apps/expense/views.py:get_expense_list`
- 请求方式：GET
- 参数：`{ "page": "number", "size": "number", "start_date": "date?", "end_date": "date?", "type": "string?", "status": "string?" }`
- 返回格式：`{ "code": 200, "data": { "total": "number", "items": [{ "id": "number", "type": "string", "amount": "number", "description": "string", "status": "string", "create_time": "datetime" }] } }`

##### /expense/create 创建费用

- 实现：`zhongyue-django/apps/expense/views.py:create_expense`
- 请求方式：POST
- 参数：`{ "type": "string", "amount": "number", "description": "string", "attachments": ["string"]? }`
- 返回格式：`{ "code": 200, "data": { "id": "number" }, "message": "创建成功" }`

##### /expense/update 更新费用

- 实现：`zhongyue-django/apps/expense/views.py:update_expense`
- 请求方式：PUT
- 参数：`{ "id": "number", "type": "string?", "amount": "number?", "description": "string?", "attachments": ["string"]? }`
- 返回格式：`{ "code": 200, "message": "更新成功" }`

##### /expense/delete 删除费用

- 实现：`zhongyue-django/apps/expense/views.py:delete_expense`
- 请求方式：DELETE
- 参数：`{ "id": "number" }`
- 返回格式：`{ "code": 200, "message": "删除成功" }`

##### /expense/audit 审核费用

- 实现：`zhongyue-django/apps/expense/views.py:audit_expense`
- 请求方式：POST
- 参数：`{ "id": "number", "status": "string", "comment": "string?" }`
- 返回格式：`{ "code": 200, "message": "审核成功" }`

##### /expense/cancel-audit 取消审核

- 实现：`zhongyue-django/apps/expense/views.py:cancel_audit_expense`
- 请求方式：POST
- 参数：`{ "id": "number" }`
- 返回格式：`{ "code": 200, "message": "取消审核成功" }`

##### /expense/export 导出费用

- 实现：`zhongyue-django/apps/expense/views.py:export_expenses`
- 请求方式：GET
- 参数：`{ "start_date": "date?", "end_date": "date?", "type": "string?", "status": "string?" }`
- 返回格式：`文件流`

##### /expense/autocomplete 自动完成选项

- 实现：`zhongyue-django/apps/expense/views.py:get_autocomplete_options`
- 请求方式：GET
- 参数：`{ "keyword": "string" }`
- 返回格式：`{ "code": 200, "data": [{ "value": "string", "label": "string" }] }`

#### 客户管理接口 (zhongyue-django/apps/customer)

##### /customer/list 客户列表

- 实现：`zhongyue-django/apps/customer/views.py:get_customer_list`
- 请求方式：GET
- 参数：`{ "page": "number", "size": "number", "keyword": "string?" }`
- 返回格式：`{ "code": 200, "data": { "total": "number", "items": [{ "id": "number", "name": "string", "contact": "string", "phone": "string", "address": "string", "create_time": "datetime" }] } }`

##### /customer/create 创建客户

- 实现：`zhongyue-django/apps/customer/views.py:create_customer`
- 请求方式：POST
- 参数：`{ "name": "string", "contact": "string", "phone": "string", "address": "string?" }`
- 返回格式：`{ "code": 200, "data": { "id": "number" }, "message": "创建成功" }`

##### /customer/update/<id> 更新客户

- 实现：`zhongyue-django/apps/customer/views.py:update_customer`
- 请求方式：PUT
- 参数：`{ "name": "string?", "contact": "string?", "phone": "string?", "address": "string?" }`
- 返回格式：`{ "code": 200, "message": "更新成功" }`

##### /customer/delete/<id> 删除客户

- 实现：`zhongyue-django/apps/customer/views.py:delete_customer`
- 请求方式：DELETE
- 参数：无
- 返回格式：`{ "code": 200, "message": "删除成功" }`

##### /customer/detail/<id> 客户详情

- 实现：`zhongyue-django/apps/customer/views.py:get_customer_detail`
- 请求方式：GET
- 参数：无
- 返回格式：`{ "code": 200, "data": { "id": "number", "name": "string", "contact": "string", "phone": "string", "address": "string", "create_time": "datetime" } }`

##### /customer/related-customers 相关客户

- 实现：`zhongyue-django/apps/customer/views.py:get_related_customers`
- 请求方式：GET
- 参数：`{ "customer_id": "number" }`
- 返回格式：`{ "code": 200, "data": [{ "id": "number", "name": "string", "relation": "string" }] }`

##### /customer/export 导出客户

- 实现：`zhongyue-django/apps/customer/views.py:export_customers`
- 请求方式：GET
- 参数：`{ "keyword": "string?", "type": "string?" }`
- 返回格式：`文件流`

##### /customer/autocomplete 自动完成选项

- 实现：`zhongyue-django/apps/customer/views.py:get_autocomplete_options`
- 请求方式：GET
- 参数：`{ "keyword": "string" }`
- 返回格式：`{ "code": 200, "data": [{ "value": "string", "label": "string" }] }`

#### 文件上传接口 (zhongyue-django/apps/fileupload)

##### /fileupload/upload 获取预签名URL

- 实现：`zhongyue-django/apps/fileupload/views.py:get_presigned_url`
- 请求方式：POST
- 参数：`{ "filename": "string", "content_type": "string" }`
- 返回格式：`{ "code": 200, "data": { "url": "string", "fields": { "key": "string", "policy": "string", "x-amz-algorithm": "string", "x-amz-credential": "string", "x-amz-date": "string", "x-amz-signature": "string" } } }`

#### 合同管理接口 (zhongyue-django/apps/contract)

##### /contract/list 合同列表

- 实现：`zhongyue-django/apps/contract/views.py:contract_list`
- 请求方式：GET
- 参数：`{ "company_name": "string?", "contract_type": "string?", "business_type": "string?", "start_date": "date?", "end_date": "date?" }`
- 返回格式：`{ "success": true, "data": [{ "id": "number", "company_name": "string", "contract_type": "string", "business_type": "string", "contract_files": ["string"], "submitter_id": "number", "submitter_name": "string", "contract_amount": "number", "start_date": "date", "end_date": "date", "remarks": "string", "created_at": "datetime", "updated_at": "datetime" }] }`

##### /contract/create 创建合同

- 实现：`zhongyue-django/apps/contract/views.py:create_contract`
- 请求方式：POST
- 参数：`{ "company_name": "string", "contract_type": "string", "business_type": "string", "contract_files": ["string"], "contract_amount": "number", "start_date": "date", "end_date": "date", "remarks": "string?" }`
- 返回格式：`{ "success": true, "message": "合同创建成功", "data": { "id": "number", ... } }`

##### /contract/update/{id} 更新合同

- 实现：`zhongyue-django/apps/contract/views.py:update_contract`
- 请求方式：PUT
- 参数：`{ "company_name": "string?", "contract_type": "string?", "business_type": "string?", "contract_files": ["string"]?, "contract_amount": "number?", "start_date": "date?", "end_date": "date?", "remarks": "string?" }`
- 返回格式：`{ "success": true, "message": "合同更新成功", "data": { "id": "number", ... } }`

##### /contract/delete/{id} 删除合同

- 实现：`zhongyue-django/apps/contract/views.py:delete_contract`
- 请求方式：DELETE
- 参数：无
- 返回格式：`{ "success": true, "message": "合同删除成功" }`

## Token认证机制

### 基本说明

项目采用基于 JWT（JSON Web Token）的认证机制，实现了完整的token自动刷新流程：

- `accessToken`: 接口访问令牌，用于日常接口认证
- `refreshToken`: 刷新令牌，用于刷新 accessToken
- `expires`: accessToken的过期时间戳

### 存储机制

- Cookie存储：
    - `authorized-token`: 存储 accessToken、refreshToken、expires 信息
    - `multiple-tabs`: 用于多标签页共享登录状态
- LocalStorage存储：
    - `user-info`: 存储用户完整信息（包含token信息及用户数据）

### 自动刷新机制

1. Token 提前刷新：
   - 系统会在 token 过期前 5 分钟自动触发刷新
   - 后台静默刷新，不影响用户操作

2. Token 过期处理：
   - 检测到 token 过期后自动使用 refreshToken 获取新token
   - 刷新过程中的请求会被缓存，刷新成功后自动重试
   - 刷新失败则跳转登录页，保存当前页面用于登录后回跳

3. 并发请求处理：
   - 多个并发请求同时触发刷新时，只会发起一次刷新请求
   - 使用请求队列机制，确保所有请求都能正确执行

### 接口认证

- 请求头格式：`Authorization: Bearer ${token}`
- 白名单接口：`/login/`、`/refresh-token/` 无需携带token

### 注意事项

1. refreshToken 有效期应大于 accessToken，建议：
   - accessToken: 2小时
   - refreshToken: 30天
2. 浏览器完全关闭后需要重新登录
3. 支持记住登录功能，可自定义保持登录天数
