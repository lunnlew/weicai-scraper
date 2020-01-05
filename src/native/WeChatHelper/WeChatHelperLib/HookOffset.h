#pragma once
//偏移地址定义

#if WECHAT_WINDLL_VERSION == 26852

#define offset_ReciveMessage 0x315E98-5			//接收消息
#define offset_ReciveMessageParam 0x126D7F8		//接收消息的参数
#define offset_ReciveMessageParam_MsgType 0x30 //消息类型
#define offset_ReciveMessageParam_MsgSourceType 0x34 //消息来源类型
#define offset_ReciveMessageParam_MsgReciver 0x40 //消息的接收者
#define offset_ReciveMessageParam_MsgContent 0x68 //消息主体
#define offset_ReciveMessageParam_MsgSender 0x114 //消息的发送者

#define offset_LoginInfoBlock 0x0 //登录用户信息块起始
#define offset_LoginInfoBlock_WxId 0x0 // 微信ID
#define offset_LoginInfoBlock_NickName 0x0 //昵称
#define offset_LoginInfoBlock_Email 0x0 //邮箱
#define offset_LoginInfoBlock_Mobile 0x0 //手机号码
#define offset_LoginInfoBlock_Sex 0x0 //性别
#define offset_LoginInfoBlock_IsLogin 0x0 //登录标志位
#define offset_LoginInfoBlock_Province 0x0 //省份
#define offset_LoginInfoBlock_City 0x0 //城市
#define offset_LoginInfoBlock_Signer 0x0 //个性签名
#define offset_LoginInfoBlock_WechatName 0x0 //微信名
#define offset_LoginInfoBlock_Country 0x0 // 国家
#define offset_LoginInfoBlock_Avatar 0x0 // 头像
#define offset_LoginInfoBlock_Device 0x0 // 登陆设备

#elif WECHAT_WINDLL_VERSION == 27188

#define offset_ReciveMessage 0x325373		//接收消息
#define offset_ReciveMessageParam 0x13971B8		//接收消息的参数
#define offset_ReciveMessageParam_MsgType 0x30 //消息类型
#define offset_ReciveMessageParam_MsgSourceType 0x34 //消息来源类型
#define offset_ReciveMessageParam_MsgReciver 0x40 //消息的接收者
#define offset_ReciveMessageParam_MsgContent 0x68 //消息主体
#define offset_ReciveMessageParam_MsgSender 0x114 //消息的发送者

#define offset_LoginInfoBlock 0x0 //登录用户信息块起始
#define offset_LoginInfoBlock_WxId 0x0 // 微信ID
#define offset_LoginInfoBlock_NickName 0x0 //昵称
#define offset_LoginInfoBlock_Email 0x0 //邮箱
#define offset_LoginInfoBlock_Mobile 0x0 //手机号码
#define offset_LoginInfoBlock_Sex 0x0 //性别
#define offset_LoginInfoBlock_IsLogin 0x0 //登录标志位
#define offset_LoginInfoBlock_Province 0x0 //省份
#define offset_LoginInfoBlock_City 0x0 //城市
#define offset_LoginInfoBlock_Signer 0x0 //个性签名
#define offset_LoginInfoBlock_WechatName 0x0 //微信名
#define offset_LoginInfoBlock_Country 0x0 // 国家
#define offset_LoginInfoBlock_Avatar 0x0 // 头像
#define offset_LoginInfoBlock_Device 0x0 // 登陆设备

#elif WECHAT_WINDLL_VERSION == 27276

#define offset_ReciveMessage 0x34DF18-5		//接收消息
#define offset_ReciveMessageParam 0x1624908		//接收消息的参数
#define offset_ReciveMessageParam_MsgType 0x30 //消息类型
#define offset_ReciveMessageParam_MsgSourceType 0x34 //消息来源类型
#define offset_ReciveMessageParam_MsgReciver 0x40 //消息的接收者
#define offset_ReciveMessageParam_MsgContent 0x68 //消息主体
#define offset_ReciveMessageParam_MsgSender 0x118 //消息的发送者

#define offset_LoginInfoBlock 0x0 //登录用户信息块起始
#define offset_LoginInfoBlock_WxId 0x0 // 微信ID
#define offset_LoginInfoBlock_NickName 0x0 //昵称
#define offset_LoginInfoBlock_Email 0x0 //邮箱
#define offset_LoginInfoBlock_Mobile 0x0 //手机号码
#define offset_LoginInfoBlock_Sex 0x0 //性别
#define offset_LoginInfoBlock_IsLogin 0x0 //登录标志位
#define offset_LoginInfoBlock_Province 0x0 //省份
#define offset_LoginInfoBlock_City 0x0 //城市
#define offset_LoginInfoBlock_Signer 0x0 //个性签名
#define offset_LoginInfoBlock_WechatName 0x0 //微信名
#define offset_LoginInfoBlock_Country 0x0 // 国家
#define offset_LoginInfoBlock_Avatar 0x0 // 头像
#define offset_LoginInfoBlock_Device 0x0 // 登陆设备


#elif WECHAT_WINDLL_VERSION == 27278

#define offset_ReciveMessage 0x34E238-5		//接收消息
#define offset_ReciveMessageParam 0x16268B0		//接收消息的参数
#define offset_ReciveMessageParam_MsgType 0x30 //消息类型
#define offset_ReciveMessageParam_MsgSourceType 0x34 //消息来源类型
#define offset_ReciveMessageParam_MsgReciver 0x40 //消息的接收者
#define offset_ReciveMessageParam_MsgContent 0x68 //消息主体
#define offset_ReciveMessageParam_MsgSender 0x118 //消息的发送者

#define offset_LoginInfoBlock 0x1396E38 //登录用户信息块起始
#define offset_LoginInfoBlock_WxId 0x42C // 微信ID
#define offset_LoginInfoBlock_NickName 0x4A4 //昵称
#define offset_LoginInfoBlock_Email 0x4C0 //邮箱
#define offset_LoginInfoBlock_Mobile 0x4D8 //手机号码
#define offset_LoginInfoBlock_Sex 0x574 //性别
#define offset_LoginInfoBlock_IsLogin 0x57C //登录标志位
#define offset_LoginInfoBlock_Province 0x590 //省份
#define offset_LoginInfoBlock_City 0x5A8 //城市
#define offset_LoginInfoBlock_Signer 0x5c0 //个性签名
#define offset_LoginInfoBlock_WechatName 0x608 //微信名
#define offset_LoginInfoBlock_Country 0x680 // 国家
#define offset_LoginInfoBlock_Avatar 0x76C // 头像
#define offset_LoginInfoBlock_Device 0x8E0 // 登陆设备

#elif WECHAT_WINDLL_VERSION == 28088

#define offset_ReciveMessage 0x350878-5		//接收消息
#define offset_ReciveMessageParam 0x16288F8		//接收消息的参数
#define offset_ReciveMessageParam_MsgType 0x30 //消息类型
#define offset_ReciveMessageParam_MsgSourceType 0x34 //消息来源类型
#define offset_ReciveMessageParam_MsgReciver 0x40 //消息的接收者
#define offset_ReciveMessageParam_MsgContent 0x68 //消息主体
#define offset_ReciveMessageParam_MsgSender 0x118 //消息的发送者

#define offset_LoginInfoBlock 0x1611300 //登录用户信息块起始
#define offset_LoginInfoBlock_WxId 0x3D4 // 微信ID
#define offset_LoginInfoBlock_NickName 0x44C //昵称
#define offset_LoginInfoBlock_Email 0x468 //邮箱
#define offset_LoginInfoBlock_Mobile 0x480 //手机号码
#define offset_LoginInfoBlock_Sex 0x534 //性别
#define offset_LoginInfoBlock_IsLogin 0x53C //登录标志位
#define offset_LoginInfoBlock_Province 0x538 //省份
#define offset_LoginInfoBlock_City 0x550 //城市
#define offset_LoginInfoBlock_Signer 0x568 //个性签名
#define offset_LoginInfoBlock_WechatName 0x5B0 //微信名
#define offset_LoginInfoBlock_Country 0x628 // 国家
#define offset_LoginInfoBlock_Avatar 0x714 // 头像
#define offset_LoginInfoBlock_Device 0x888 // 登陆设备

#endif