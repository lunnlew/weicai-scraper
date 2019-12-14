#include "stdafx.h"
#include "stdio.h"

#include "WndMsgLoop.h"
#include "HookOffset.h"
#include "MsgProtocol.h"
#include "LogRecord.h"

// 初始化消息循环窗口
void InitWindow(HMODULE hModule)
{
	LogRecord(L"InitWindow", ofs);

	RegisterWindow(hModule);
}

// 注册窗口及消息循环
void RegisterWindow(HMODULE hModule)
{
	LogRecord(L"RegisterWindowMsgLoop", ofs);

	//1  设计一个窗口类
	WNDCLASS wnd;
	wnd.style = CS_VREDRAW | CS_HREDRAW;	//风格
	wnd.lpfnWndProc = WndProc;	//窗口消息回调函数指针.
	wnd.cbClsExtra = NULL;
	wnd.cbWndExtra = NULL;
	wnd.hInstance = hModule;
	wnd.hIcon = NULL;
	wnd.hCursor = NULL;
	wnd.hbrBackground = (HBRUSH)COLOR_WINDOW;
	wnd.lpszMenuName = NULL;
	wnd.lpszClassName = TEXT("WeChatHelper");
	//2  注册窗口类
	RegisterClass(&wnd);
	//3  创建窗口
	HWND hWnd = CreateWindow(
		TEXT("WeChatHelper"),	//窗口类名
		TEXT("WeChatHelper"),	//窗口名
		WS_OVERLAPPEDWINDOW,	//窗口风格
		10, 10, 500, 300,	//窗口位置
		NULL,	//父窗口句柄
		NULL,	//菜单句柄
		hModule,	//实例句柄
		NULL	//传递WM_CREATE消息时的附加参数
	);
	//4  更新显示窗口
	ShowWindow(hWnd, SW_HIDE);
	UpdateWindow(hWnd);
	//5  消息循环（消息泵）
	MSG  msg = {};
	//	5.1获取消息
	while (GetMessage(&msg, 0, 0, 0))
	{
		//	5.2翻译消息
		TranslateMessage(&msg);
		//	5.3转发到消息回调函数
		DispatchMessage(&msg);
	}
}

// 窗口消息回调
LRESULT CALLBACK WndProc(HWND hWnd, UINT Message, WPARAM wParam, LPARAM lParam)
{
	// 仅处理WM_COPYDATA类消息
	if (Message == WM_COPYDATA)
	{
		LogRecord(L"收到WM_COPYDATA类消息", ofs);
		COPYDATASTRUCT *pCopyData = (COPYDATASTRUCT*)lParam;
		LogRecord(L"switch type", ofs);
		switch (pCopyData->dwData)
		{
		case WM_CheckIsLogin: {
			LogRecord(L"收到WM_CheckIsLogin指令", ofs);
			CheckIsLogin();
			break;
		}
		case WM_HookReciveMsg: {
			LogRecord(L"收到WM_HookReciveMsg指令", ofs);
			HOOK_ReciveMsg();
			break;
		}
		case WM_ShowQrCode: {
			LogRecord(L"收到WM_ShowQrCode指令", ofs);
			WX_CallShowQrCode();
			HOOK_SaveQrCode();
			break;
		}
		default:

			char ty[34] = { 0 };
			TCHAR * tchar = { 0 };
			int iLength;

			sprintf_s(ty, sizeof(ty), "%d", pCopyData->dwData);
			iLength = MultiByteToWideChar(CP_ACP, 0, ty, strlen(ty) + 1, NULL, 0);
			MultiByteToWideChar(CP_ACP, 0, ty, strlen(ty) + 1, tchar, iLength);

			LogRecord(tchar, ofs);
			break;
		}
	}
	return DefWindowProc(hWnd, Message, wParam, lParam);
}
