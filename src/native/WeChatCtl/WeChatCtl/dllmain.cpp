// dllmain.cpp : 定义 DLL 应用程序的入口点。
#include "stdafx.h"
// 窗口消息循环
#include "WndMsgLoop.h"
#include "MsgProtocol.h"
#include "LogRecord.h"
#include "StringTool.h"
#include "WCProcess.h"
#include "openwechat.h"

//在使用Debug远程调试DLL必须要有__declspec函数 导出
VOID __declspec(dllexport) test()
{
	OutputDebugStringA("__declspec(dllexport) test() \r\n");
}

// 发送控制消息到WeChatHelper
extern "C"  __declspec(dllexport) VOID sendCtlMsg(const char* wName, int MsgType) {
	LogRecord(L"sendCtlMsg", ofs);
	std::string WeChatHelperName = "WeChatHelper";
	WeChatHelperName = wName;

	LogRecord(L"WeChatHelperName", ofs);
	LogRecord(CharToTchar(WeChatHelperName.c_str()), ofs);
	LogRecord(L"MsgType", ofs);
	LogRecord(CharToTchar(std::to_string(MsgType).c_str()), ofs);

	HWND hWnd = FindWindow(NULL, StringToLPCWSTR(WeChatHelperName));
	if (hWnd == NULL)
	{
		LogRecord(L"未查找到WeChatHelper窗口", ofs);
		return;
	}
	COPYDATASTRUCT chatmsg;
	chatmsg.dwData = MsgType;
	chatmsg.cbData = 0;
	chatmsg.lpData = NULL;
	SendMessage(hWnd, WM_COPYDATA, NULL, (LPARAM)&chatmsg);
}

// 新开微信
extern "C"  __declspec(dllexport) bool openNewWechat(const char* dllpath, const char* dllname) {
	DWORD pid = WXOpenWechat();
	LogRecord(CharToTchar(std::to_string(pid).c_str()), ofs);
	bool ret = ProcessDllInject(pid, dllpath, dllname);
	LogRecord(CharToTchar(std::to_string(ret).c_str()), ofs);
	return ret;
}
// 关闭微信
extern "C"  __declspec(dllexport) bool closeAllWechat() {
	return closeAllProcess(L"WeChat.exe");
}
extern "C"  __declspec(dllexport) bool closeWechatProcess(int processId) {
	return closeProcess((DWORD)processId);
}

BOOL APIENTRY DllMain(HMODULE hModule,
	DWORD  ul_reason_for_call,
	LPVOID lpReserved
)
{
	switch (ul_reason_for_call)
	{
	case DLL_PROCESS_ATTACH: {
		CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE)InitWindow, hModule, 0, NULL);
		break;
	}
	case DLL_THREAD_ATTACH:
		break;
	case DLL_THREAD_DETACH:
		break;
	case DLL_PROCESS_DETACH:
		FreeLibraryAndExitThread(hModule, 0);
		break;
	}
	return TRUE;
}

