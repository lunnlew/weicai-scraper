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



std::wstring GetMsgByAddress(DWORD memAddress);
bool startWith(const std::string &str, const std::string &head);
bool endWith(const std::string &str, const std::string &tail);
