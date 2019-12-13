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

## 使用
### 使用前设置
```powershell
## 在powershell(管理员模式)设置执行策略
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser
```

## 安装
### 二进制文件

|  操作系统  |         二进制包          |
| :----: | :-------------------: |
| winx64 |   [微采助手-Setup-x86-0.1.2.exe](https://github.com/lunnlew/weicai-scraper/releases/download/v0.1.2/Setup-x86-0.1.2.exe)   |

## 技术栈

## 开发
### 系统环境

	window10 x64
	node v12.8.1 32位
	python v2.7
	Visual Studio 2017

### 安装nvm
|  操作系统  |         二进制包          |
| :----: | :-------------------: |
| win10 |   [nvm-windows](https://github.com/coreybutler/nvm/releases)   |

### 安装Visual Studio 2017
|         下载地址          |
| :-------------------: |
|   [Visual Studio 2017](https://visualstudio.microsoft.com/downloads/)   |

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
yarn
```

### 安装Visual Studio 2017

## 编译打包

### 编译原生模块
### 打包主程序

## 调试

### 调试远程注入的DLL组件-WeChatHelper
#### 编译WeChatHelper
使用`vs2017`运行项目编译
#### 编译Detours
```sh
cd ~/Desktop
git clone https://github.com/microsoft/Detours.git
```
运行`vs2017工具x86 Native Tools Command Prompt for VS 2017`
```sh
cd ~/Desktop/Detours
nmake /f Makefile
```
#### 修改原始程序IAT
```
# 进入要调试的应用主程序
cd D:/Applications/WeChat
# 将要调试的dll复制到程序目录
cp ~/Desktop/WeChatHelper/Debug/WeChatHelper.dll .
cp ~/Desktop/WeChatHelper/Debug/WeChatHelper.pdb .
# 修改IAT
~/Desktop/Detours/bin.X86/setdll.exe /d:WeChatHelper.dll WeChat.exe
# 恢复IAT
~/Desktop/Detours/bin.X86/setdll.exe /r WeChat.exe

```
#### 配置vs2017的本地调试设置
将`配置属性`-`调试`-`本地windows调试`: `命令参数`改为主程序地址,如`D:/Applications/WeChat/WeChat.exe`,`工作目录`改为主程序目录址,如`D:/Applications/WeChat`

#### 运行调试
在DLL入口下个断点， F5启动调试即可。

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

