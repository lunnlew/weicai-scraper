// dllmain.cpp : 定义 DLL 应用程序的入口点。
#include "stdafx.h"
// 窗口消息循环
#include "WndMsgLoop.h"


//在使用Debug远程调试DLL必须要有__declspec函数 导出
VOID __declspec(dllexport) test()
{
	OutputDebugStringA("__declspec(dllexport) test() \r\n");
}

BOOL APIENTRY DllMain( HMODULE hModule,
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

