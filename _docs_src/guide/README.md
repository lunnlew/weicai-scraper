---
sidebar: auto
---

# 指南

>
> 	声明!
> 	
> 	本项目仅供技术研究及个人学习使用，请勿用于任何商业用途，请勿用于非法用途，如有任何人凭此做任何非法事情，均于作者无关，特此声明。
>

## 介绍
微采助手是一个以NodeJs驱动的公众号文章采集工具，为了支持更方便地采集和本地浏览而创建并开源的。
当你浏览微信公众号发现一个有趣的文章时，你就可以使用它下载该资源以用于本地浏览存储等。
![1](./README/1.png)

## 支持平台
目前仅支持window10 x64
## 功能

1. 公众号历史文章采集
2. 文章列表查看及搜索，包含标题，发布时间，链接等
3. 支持手动生成文章图片，也支持后台批量生成图片任务模式
4. 文章阅读数，点赞数，赞赏量，评论数采集
5. 文章评论数据采集
6. 公众号列表查看及搜索，包含名称等
7. 简化的采集代理设置操作


## 安装
### 安装包

|  操作系统  |         二进制包          |
| :----: | :-------------------: |
| winx64 |   [微采助手-Setup-x86-0.1.4.exe](https://github.com/lunnlew/weicai-scraper/releases/download/v0.1.4/Setup-x86-0.1.4.exe)   |



## 使用
### 使用前设置
```powershell
## 在powershell(管理员模式)设置执行策略
## 设置采集代理模式时的脚本动作需要
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser
```
### 使用前注意

>    **公众号历史文章列表页不要频繁进行访问刷新，否则会导致提示`操作频繁`并封禁该接口访问24小时**。
>

### 代理模式
代理模式是在开启系统代理设置时，通过操作微信客户端访问并拦截内容来达成对`历史文章列表`，`文章页`，`文章评论数据`，`公众号信息`等采集。


1. 如何使用
   
   打开`微采助手`，进入点击`开始管理`进入主界面，然后启用`采集代理`开关即可。
   
   
   
2. 如何采集历史文章页

   在处于`采集代理模式`时，打开你想要采集的公众号的`历史文章列表`页面即可，注意：首次打开`历史文章列表`页面的时候，建议等待其完全采集，第二次及以后再次采集时将判断30分钟内采集重复文章次数是否达到3次来决定继续采集。

   

3. 如何自动采集下一个公众号的历史列表页

   在处于`采集代理模式`时，打开你想要采集的任意一个公众号的`历史文章列表`页面，会出现操作界面，目前你需要手动选择相应的选项并提交才会进行下一步的采集动作。

   

4. 如何采集文章评论数据

   在处于`采集代理模式`时，在微信内部浏览器中打开相应的文章即可，目前需要手动从微信中打开链接，如果在其他外部浏览器中打开仅会采集文章的基本信息，不会采集到评论信息

   

5. 如何采集文章阅读量数据

   在处于`采集代理模式`时，在微信内部浏览器中打开相应的文章即可，目前需要手动从微信中打开链接，如果在其他外部浏览器中打开仅会采集文章的基本信息，不会采集到阅读量信息

   

6. 如何生成文章的图片以便本地存储和预览

   先关闭`采集代理`开关，然后在软件文章列表页右侧操作`生成`按钮即可，生成成功后，可以点击`查看`按钮，浏览生成的文章图片内容。

   

7. 如何批量生成文章图片

   先关闭`采集代理`开关，然后在软件文章列表页上方启用`后台文章图片生成任务`开关即可，将会从`最早发布的未生成图片的文章`开始生成文章图片并存放在个人的主目录下。

   

8. 无法采集列表页数据

   请确认页面是否有操作界面提示信息，如没有可能是代理设置失败问题。可尝试手动将`127.0.0.1:6879`设置到系统代理并启用。然后刷新页面再次尝试采集。
   多次失败的情况下，建议先关闭软件再重启，然后再启用`采集代理`开关，及手动设置代理。

   


### 监控模式
目前软件支持对微信(版本为`2.7.1.88`,`2.7.2.76`)进行公众号文章推送数据的监控及采集，打开软件就自动启动该功能，注意：需要先运行微信客户端并登录，再运行本软件该机制才会生效。
当公众号有推送文章数据过来的时候，软件将会采集处理并展示到软件的文章列表界面。


## 开发
### 技术栈及语言

1. nodejs
2. electron
3. vue
4. nodejs native addons
5. c++ dll
6. powershell

### 系统开发环境

	window10 x64
	node v12.8.1 32位
	python v2.7
	Visual Studio 2017

### 安装nvm
|  操作系统  |         二进制包          |
| :----: | :-------------------: |
| win10 |   [nvm-windows](https://github.com/coreybutler/nvm/releases)   |

### 安装Nodejs
```sh
## 安装nodejs版本
nvm install 12.8.1 32

## 指定nodejs版本
nvm use 12.8.1 32

## 查看生效nodejs版本
nvm list
node -v
```

### 安装yarn
```sh
npm install -g yarn
```

### 更新依赖
```sh
## 主项目依赖
yarn

## worker依赖
cd src/worker && yarn
```

### 安装Python 2.7

[Python 下载地址](https://www.python.org/downloads/release/python-2717/)

### 安装Visual Studio 2017

[Visual Studio 下载地址](https://visualstudio.microsoft.com/downloads/)

## 下载源码
```sh
cd ~/Desktop
git clone https://github.com/lunnlew/weicai-scraper.git
```

## 编译打包
以`Visual Studio 2017`为例，原生模块`WeChatCtl`、`WeChatHelper`及`WeicaiBinding`支持通过ide运行构建及命令行方式运行构建，ide方式运行相应的`sln`文件即可

### 编译WeicaiBinding
```cmd
# 原始命令
cd src/native/WeicaiBinding && cross-env HOME=~/.electron-gyp node-gyp configure && cross-env HOME=~/.electron-gyp node-gyp rebuild --target=7.1.3 --runtime=electron --arch=ia32  --dist-url=https://electronjs.org/headers

# 或者项目目录运行
yarn run native:build-WeicaiBinding-ia32

```

### 编译WeChatCtl
```cmd
#命令方式
##调试版本
"C:/Program Files (x86)/Microsoft Visual Studio/2017/Professional/Common7/IDE/devenv" src/native/WeChatCtl/WeChatCtl.sln /Build "Debug|x86"
##发布版本版本
"C:/Program Files (x86)/Microsoft Visual Studio/2017/Professional/Common7/IDE/devenv" src/native/WeChatCtl/WeChatCtl.sln /Build "Release|x86"

# 或者项目目录运行构建Release
yarn run native:build-WeChatCtl
```


### 编译WeChatHelper
```cmd
#命令方式
##调试版本
"C:/Program Files (x86)/Microsoft Visual Studio/2017/Professional/Common7/IDE/devenv" src/native/WeChatHelper/WeChatHelper.sln /Build "Debug|x86"
##发布版本版本
"C:/Program Files (x86)/Microsoft Visual Studio/2017/Professional/Common7/IDE/devenv" src/native/WeChatHelper/WeChatHelper.sln /Build "Release|x86"

# 或者项目目录运行构建Release
yarn run native:build-WeChatHelper
```
### 运行开发模式
```sh
yarn run electron:serve
```

### 打包主程序
```sh
yarn run electron:build
```

## 调试远程注入DLL
以`WeChatHelper`为例
### 编译WeChatHelper
参考前文使用`vs2017`运行项目编译
### 编译Detours
```sh
cd ~/Desktop
git clone https://github.com/microsoft/Detours.git
```
运行`vs2017工具x86 Native Tools Command Prompt for VS 2017`
```sh
cd ~/Desktop/Detours
nmake /f Makefile
```
### 修改原始程序IAT
```
# 进入要调试的应用主程序
cd D:/Applications/WeChat
# 将要调试的dll复制到程序目录
cp ~/Desktop/weicai-scraper/src/native/WeChatHelper/Debug/WeChatHelper.dll .
cp ~/Desktop/weicai-scraper/src/native/WeChatHelper/Debug/WeChatHelper.pdb .
# 修改IAT
~/Desktop/Detours/bin.X86/setdll.exe /d:WeChatHelper.dll WeChat.exe
# 恢复IAT
~/Desktop/Detours/bin.X86/setdll.exe /r WeChat.exe

```
### 配置vs2017的本地调试设置

   将`配置属性`-`调试`-`本地windows调试`: 
   `命令参数`改为主程序地址如`D:/Applications/WeChat/WeChat.exe`;
   `工作目录`改为主程序目录址如`D:/Applications/WeChat`

### 运行调试
在DLL入口下个断点， 启动调试即可。

## 文档生成
### 安装vuepress
```sh
yarn add vuepress --dev
```
### 构建文档
```sh
yarn run docs:build
```

## 开源许可
基于 [MIT license](https://opensource.org/licenses/MIT) 许可进行开源。

