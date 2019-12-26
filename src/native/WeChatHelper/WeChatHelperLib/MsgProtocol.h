#pragma once
#include <string>

// 窗口间通信协议

#define WM_ShowQrCode 1		// 取得微信登陆二维码
#define WM_CheckIsLogin 501	// 检查是否登录
#define WM_HookReciveMsg 502	// hook消息接收
#define WM_ReciveMsg 503	// 消息接收

void AntiRevoke();
// 显示登陆二维码
void WX_CallShowQrCode();
// 卸载WX_SaveQrCode
void WX_SaveQrCode_Unhook(DWORD dwHookOffset);
void invokeSaveImg();
void SaveImg(DWORD qrcode);
// 检查是否登录
void CheckIsLogin();


// 保存登陆二维码
void HOOK_SaveQrCode();

void HOOK_ReciveMsg();
void RecieveWxMesage();
void SendWxMessage();



//消息结构体
struct Message
{
	DWORD type;		//消息类型
	wchar_t typeStr[80];		//消息类型
	DWORD sourceType;		//消息来源
	wchar_t sourceTypeStr[80];		//消息来源
	wchar_t msgReciver[40];		//微信ID/群ID
	wchar_t msgSender[40];	//消息发送者
	wchar_t content[1];	//消息内容
};

std::wstring GetMsgByAddress(DWORD memAddress);
bool startWith(const std::string &str, const std::string &head);
bool endWith(const std::string &str, const std::string &tail);
