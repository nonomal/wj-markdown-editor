# wj-markdown-editor

[源码地址](https://github.com/nlbwqmz/wj-markdown-editor)

[下载地址](https://github.com/nlbwqmz/wj-markdown-editor/releases)

[反馈地址](https://github.com/nlbwqmz/wj-markdown-editor/issues)

## 简介

一款开源桌面端**markdown**编辑器，支持`windows`、`linux`系统。

## 特性

- 支持本地MD文件打开
- 支持暗黑模式
- 精准同步滚动
- 支持公式、流程图
- 支持Github Alert、Container、文字颜色
- 支持图片粘贴上传、截图（支持涂鸦、框选等）上传等
- 支持本地附件
- 水印
- 图片预览支持放大、旋转等
- 主题切换
- 自定义预览宽度
- 目录提取
- **支持导出为PDF、图片**

## 界面

### 编辑

![light_home.png](<https://cdn.jsdelivr.net/gh/nlbwqmz/static-resource@main/imagelight_home_p_fbiT.png>)

![dark_home.png](<https://cdn.jsdelivr.net/gh/nlbwqmz/static-resource@main/imagedark_home_F5yOu4.png>)

### 预览

![preview_light.png](<https://cdn.jsdelivr.net/gh/nlbwqmz/static-resource@main/imagepreview_light_dr6YJF.png>)

![preview_dark.png](<https://cdn.jsdelivr.net/gh/nlbwqmz/static-resource@main/imagepreview_dark_sg7gLg.png>)

### 设置

![setting_light.png](<https://cdn.jsdelivr.net/gh/nlbwqmz/static-resource@main/imagesetting_light_HvFPeg.png>)

![setting_dark.png](<https://cdn.jsdelivr.net/gh/nlbwqmz/static-resource@main/imagesetting_dark_iOVisC.png>)

### 示例

![demo_light.png](<https://cdn.jsdelivr.net/gh/nlbwqmz/static-resource@main/imagedemo_light_MG_RpR.png>)

![demo_dark.png](<https://cdn.jsdelivr.net/gh/nlbwqmz/static-resource@main/imagedemo_dark_pyswx9.png>)

## 注意
- **便携版**不支持自动升级，需手动下载，解压后直接替换根目录即可。

## 更新记录

### 2.8.2

1. 优化搜索/替换功能。

### 2.8.1

1. 完善暗黑模式。

### 2.8.0

1. 优化搜索/替换功能。
2. 优化预览样式。

### 2.7.0

1. 支持调整字体大小。


### 2.6.0

1. 修复某些情况程序不能正常启动的问题。
2. 支持暗黑模式。
3. 导出时设置默认文件名。

### 2.5.1

1. 支持文字颜色（纯色、渐变色）。
2. 增加示例。

### 2.4.0

1. 支持美化文本

### 2.3.2

1. 优化最近文件历史功能

### 2.3.1

1. **container**和**alert**支持自动完成

### 2.3.0

1. 支持上传文件

### 2.2.1

1. 优化预览样式

### 2.2.0

1. 支持配置启动页
2. 添加、优化预览主题
3. 处理alert渲染异常问题

### 2.1.0

1. 支持记录最近打开历史
2. 支持打开最近一次记录

### 2.0.3

1. 修复图片保存问题
2. 修复右键打开图片位置问题
3. 修复配置解析问题

### 2.0.2

1. 新增打开功能
2. 新增置顶功能
3. 优化同步滚动
4. 新增跳转到目标行功能

### 2.0.1

1. 优化部分功能
2. 添加 linux 系统 md 文件关联

### 2.0.0

**全新版本**

1. 支持自定义快捷键
2. 内置图床工具（当前版本支持github、smms）
3. 取消webdav支持（可自行挂载到本地）
4. 取消多tab支持

### 1.4.5

1. 代码块支持显示行号
2. 修复导出代码块异常问题

### 1.4.4

1. 使用sqlite替换配置文件

### 1.4.3

1. 优化搜索

### 1.4.2

1. 支持导出为图片
2. windows支持右键新建Markdown文件
3. 标题栏显示版本号

### 1.4.1

1. 修复导出docx时，模板不生效的问题
2. 配置文件异常时恢复默认设置

### 1.4.0

1. 支持导出DOCX

### 1.3.0

1. 导出PDF支持添加水印
2. 支持导出带书签的PDF
3. 优化导出样式
4. 调整首屏LOGO移除时机

### 1.2.5

1. 修复当最小化到托盘后，无法通过快捷方式或文件关联激活窗口的问题
2. 修复历史文件关闭时提示未保存的问题
3. 优化使用体验

### 1.2.4

1. 修复PDF导出问题，导出的PDF内容支持复制
2. 修复其他问题

### 1.2.3

1. 新增linux版本
2. 优化使用体验

### 1.2.2

1. 截图支持框选、马赛克、涂鸦等
2. 支持最小化到系统托盘
3. 解决编辑切换到预览时未获取到最新内容的问题
4. 优化使用体验

### 1.2.1

1. 记住上次使用时文件打开列表
2. 优化使用体验

### 1.1.2

1. 样式优化
2. 启动检查更新

### 1.1.1

1. 首屏优化
2. 解决已登录webdav的情况下，关闭并保存时不能选择保存到webdav的问题

### 1.1.0

1. 添加程序边框，解决当操作系统设置不显示窗口下的阴影时的样式问题
2. 更新应用图标，解决图标颜色和背景色相近的时候会出现的问题
3. webdav支持自动登录
4. 优化新建文件保存逻辑
5. 优化使用体验

### 1.0.2

1. 修复自动保存webdav文件时的问题

### 1.0.1

1. 优化图片预览

### 1.0.0

1. 优化使用体验
2. 增加webdav同步支持

### 0.0.5

1. 新增：右键打开文件所在文件夹
2. 优化：相同文件路径不再重复打开新标签页，而是激活已存在的标签
3. 问题：修复程序未完全退出的问题

### 0.0.3

1. 新增：多标签页
