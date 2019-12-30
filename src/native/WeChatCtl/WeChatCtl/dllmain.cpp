// dllmain.cpp : 定义 DLL 应用程序的入口点。
#include "stdafx.h"
// 窗口消息循环
#include "WndMsgLoop.h"
#include "MsgProtocol.h"
#include "LogRecord.h"
#include "StringTool.h"

//在使用Debug远程调试DLL必须要有__declspec函数 导出
VOID __declspec(dllexport) test()
{
	OutputDebugStringA("__declspec(dllexport) test() \r\n");
}

// 发送控制消息到WeChatHelper
extern "C"  __declspec(dllexport) VOID sendCtlMsg(int MsgType) {
	std::string WeChatHelperName = "WeChatHelper";
	if (wehcatHelpers.size() > 0) {
		WeChatHelperName = wehcatHelpers[0];
	}
	LogRecord(L"wehcatHelpers size:", ofs);
	LogRecord(CharToTchar(std::to_string(wehcatHelpers.size()).c_str()), ofs);

	LogRecord(L"wehcatHelpers list:", ofs);
	LogRecord(CharToTchar(ListToString(wehcatHelpers).c_str()), ofs);

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
	case DLL_THREAD_DETACH:
	case DLL_PROCESS_DETACH:
		break;
	}
	return TRUE;
}

