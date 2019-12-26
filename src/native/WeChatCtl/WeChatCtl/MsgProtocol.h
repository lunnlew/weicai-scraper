#pragma once
#include <string>

# define WeChatMessageA(size) (WeChatMessage*) std::malloc(size)

//消息结构体
struct WeChatMessage
{
	DWORD type;		//消息类型
	wchar_t typeStr[80];		//消息类型
	DWORD sourceType;		//消息来源
	wchar_t sourceTypeStr[80];		//消息来源
	wchar_t msgReciver[40];		//微信ID/群ID
	wchar_t msgSender[40];	//消息发送者
	wchar_t content[1];	//消息内容
};

// 窗口间通信协议

#define WM_ShowQrCode 1		// 取得微信登陆二维码
#define WM_CheckIsLogin 501	// 检查是否登录
#define WM_HookReciveMsg 502	// hook消息接收
#define WM_ReciveMsg 503	// 消息接收


void sendWeChatMessage(WeChatMessage *msg);