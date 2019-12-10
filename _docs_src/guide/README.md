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
weicai scraper是一个以NodeJs驱动的公众号文章采集工具，为了支持更方便地采集和本地浏览而创建并开源的。
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

## 安装
### 二进制文件

|  操作系统  |         二进制包          |
| :----: | :-------------------: |
| winx64 |   [weicai-scraper-Setup-x86-0.1.2.exe](https://github.com/lunnlew/weicai-scraper/releases/download/v0.1.2/Setup-x86-0.1.2.exe)   |

## 技术栈

## 开发
### 安装nvm
|  操作系统  |         二进制包          |
| :----: | :-------------------: |
| win10 |   [nvm-windows](https://github.com/coreybutler/nvm/releases)   |

### 指定Nodejs
```sh
## 安装nodejs版本
nvm install 12.8.1 32

## 指定nodejs版本
nvm use 12.8.1 32

## 查看生效nodejs版本
nvm list
node -v
```
### 更新依赖
```sh
yarn
```

## 开源许可
基于 [MIT license](https://opensource.org/licenses/MIT) 许可进行开源。

