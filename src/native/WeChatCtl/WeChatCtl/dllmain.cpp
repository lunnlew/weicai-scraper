// dllmain.cpp : 定义 DLL 应用程序的入口点。
#include "stdafx.h"
// 窗口消息循环
#include "WndMsgLoop.h"
#include "MsgProtocol.h"


//在使用Debug远程调试DLL必须要有__declspec函数 导出
VOID __declspec(dllexport) test()
{
	OutputDebugStringA("__declspec(dllexport) test() \r\n");
}

extern "C"  __declspec(dllexport) VOID sendCtlMsg() {
	//发送到服务端
	HWND hWnd = FindWindow(NULL, L"WeChatHelper");
	if (hWnd == NULL)
	{
		OutputDebugStringA("未查找到WeChatHelper窗口");
		return;
	}
	COPYDATASTRUCT chatmsg;
	chatmsg.dwData = WM_HookReciveMsg;
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

