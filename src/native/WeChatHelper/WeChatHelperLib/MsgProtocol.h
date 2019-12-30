#pragma once
#include <string>

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

//====消息状态类消息表示====

//====动作请求类消息表示====
#define WM_HookReciveMsg 502	// hook消息接收
#define WM_HookAntiRevoke 504 // hook消息撤回
#define WM_ShowQrCode 1		// 取得微信登陆二维码
#define WM_CheckIsLogin 501	// 检查是否登录
#define WM_ReciveMsg 503	// 消息接收
#define WM_RegWeChatHelper 505 // WeChatHelper注册
#define WM_UnRegWeChatHelper 506 // WeChatHelper注销


//====代码覆写类HOOK====
void HOOK_ReciveMsg();
void HOOK_AntiRevoke();
void HOOK_SaveQrCode();

//====代码执行类HOOK====
// 显示登陆二维码
void WX_CallShowQrCode();
// 卸载WX_SaveQrCode
void WX_SaveQrCode_Unhook(DWORD dwHookOffset);
void invokeSaveImg();
void SaveImg(DWORD qrcode);
// 检查是否登录
void CheckIsLogin();

void RecieveWxMesage();
void SendWxMessage();

std::wstring GetMsgByAddress(DWORD memAddress);