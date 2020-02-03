#include "stdafx.h"
#include "stdio.h"
#include "WndMsgLoop.h"
#include "MsgProtocol.h"
#include "StringTool.h"
#include "LogRecord.h"
#include "WCProcess.h"
#include "HttpRequest.h"
#include "json.hpp"

#pragma comment(lib, "rpcrt4.lib")
#include <rpc.h>

using json = nlohmann::json;

using namespace std;

DWORD isRegisterWnd;
LPCWSTR WeChatHelper;
HWND hWnd;
HMODULE dlModule;
HANDLE hThread;
DWORD checkFailNum;
DWORD pProcessId;

// 初始化消息循环窗口
void InitWindow(HMODULE hModule)
{
	LogRecord(L"InitWindow", ofs);
	dlModule = hModule;
	checkFailNum = 0;

	UUID uuid;
	UuidCreate(&uuid);
	char *str;
	UuidToStringA(&uuid, (RPC_CSTR*)&str);

	char ty[1024] = { 0 };
	sprintf_s(ty, sizeof(ty), "%s%s", "WeChatHelper", str);
	TCHAR tstr[1024] = TEXT("");
	CharToTchar(ty, tstr);
	WeChatHelper = (LPCWSTR)tstr;
	LogRecord(WeChatHelper, ofs);

	RpcStringFreeA((RPC_CSTR*)&str);

	RegisterWindow(hModule);
}

void UnloadProc(HMODULE hModule) {
	LogRecord(L"进行卸载dll", ofs);
	FreeLibraryAndExitThread(dlModule, 0);
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
	wnd.lpszClassName = WeChatHelper;
	//2  注册窗口类
	RegisterClass(&wnd);
	//3  创建窗口
	hWnd = CreateWindow(
		WeChatHelper,	//窗口类名
		WeChatHelper,	//窗口名
		WS_OVERLAPPEDWINDOW,	//窗口风格
		10, 10, 500, 300,	//窗口位置
		NULL,	//父窗口句柄
		NULL,	//菜单句柄
		hModule,	//实例句柄
		NULL	//传递WM_CREATE消息时的附加参数
	);

	SetTimer(hWnd, 1, 1*1000, Do_RegisterWeChatHelper);
	SetTimer(hWnd, 2, 60*1000, Do_CheckWeChatCtrl);

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
void UnRegisterWeChatHelper() {
	//控制窗口
	HWND hWeChatRoot = FindWindow(NULL, L"WeChatCtl");
	if (hWeChatRoot == NULL)
	{
		LogRecord(L"UnRegisterWeChatHelper:未查找到WeChatCtl窗口", ofs);
		return;
	}

	const wchar_t* c = StringToWchar_t(LPCWSTRtoString(WeChatHelper));

	//分配长度
	DWORD len = sizeof(WeChatHookReg) + sizeof(wchar_t*)*wcslen(c) + 1;
	WeChatHookReg *msg = (WeChatHookReg *)malloc(len);

	COPYDATASTRUCT chatmsg;
	chatmsg.dwData = WM_UnRegWeChatHelper;

	msg->pProcessId = pProcessId;
	wcscpy_s(msg->WeChatHelperName, wcslen(c) + 1, c);

	chatmsg.cbData = len;// 待发送的数据的长
	chatmsg.lpData = msg;// 待发送的数据的起始地址

	SendMessage(hWeChatRoot, WM_COPYDATA, NULL, (LPARAM)&chatmsg);

	isRegisterWnd = false;

	if(hThread)
	CloseHandle(hThread);

	// 未知原因，如果在此处使用sock发送的话，无法发送。
}

void RegisterWeChatHelper() {
	//控制窗口
	HWND hWeChatRoot = FindWindow(NULL, L"WeChatCtl");
	if (hWeChatRoot == NULL)
	{
		LogRecord(L"RegisterWeChatHelper:未查找到WeChatCtl窗口", ofs);
		return;
	}

	const wchar_t* c = StringToWchar_t(LPCWSTRtoString(WeChatHelper));

	//分配长度
	DWORD len = sizeof(WeChatHookReg) + sizeof(wchar_t*)*wcslen(c) + 1;
	WeChatHookReg *msg = (WeChatHookReg *)malloc(len);

	COPYDATASTRUCT chatmsg;
	chatmsg.dwData = WM_RegWeChatHelper;// 保存一个数值, 可以用来作标志等

	msg->pProcessId = pProcessId;
	wcscpy_s(msg->WeChatHelperName, wcslen(c) + 1, c);

	chatmsg.cbData = len;// 待发送的数据的长
	chatmsg.lpData = msg;// 待发送的数据的起始地址

	SendMessage(hWeChatRoot, WM_COPYDATA, NULL, (LPARAM)&chatmsg);

	WeChatLoginInfo *sWeChatLoginInfo = GetWechatLoginInfo();

	// 尝试注册
	json o;
	o["WeChatHelperName"] = stringToUTF8(LPCWSTRtoString(WeChatHelper));
	o["Act"] = "RegisterWeChatHelper";
	o["ProcessId"] = pProcessId;
	o["Login_WechatName"] = stringToUTF8(TcharToChar(sWeChatLoginInfo->WechatName));

	HttpRequest httpReq("127.0.0.1", 6877);
	std::string res = httpReq.HttpPost("/wechatRobot", o.dump());
	std::string body = httpReq.getBody(res);
	int code = 201;
	if (body != "") {
		auto bd = json::parse(body);
		code = bd["code"].get<int>();
	}

	if (code == 200) {
		isRegisterWnd = true;
		LogRecord(L"RegisterWeChatHelper:WeChatHelper注册成功", ofs);
	}
	else {
		isRegisterWnd = false;
		LogRecord(L"RegisterWeChatHelper:WeChatHelper注册失败", ofs);
	}
}

// 服务信息注册
void  CALLBACK Do_RegisterWeChatHelper(HWND   hwnd, UINT   uMsg, UINT   idEvent, DWORD   dwTime)
{
	// 注册成功
	if (isRegisterWnd) {
		KillTimer(hwnd, 1);
	}
	else {
		RegisterWeChatHelper();
	}
}

// 控制端心跳检测
void  CALLBACK Do_CheckWeChatCtrl(HWND   hwnd, UINT   uMsg, UINT   idEvent, DWORD   dwTime)
{
	HWND hWeChatRoot = FindWindow(NULL, L"WeChatCtl");
	if (hWeChatRoot == NULL)
	{
		// 检查失败数增加1
		LogRecord(L"Do_CheckWeChatCtrl:检查WeChatCtl:不存在", ofs);
		checkFailNum = checkFailNum + 1;
	}
	else {
		LogRecord(L"Do_CheckWeChatCtrl:检查WeChatCtl:存在,重新注册WeChatHelper", ofs);
		// 一定期限内再次恢复
		checkFailNum = 0;
		RegisterWeChatHelper();
	}
	
	// 失败次数过多
	if (checkFailNum > 5) {
		LogRecord(L"Do_CheckWeChatCtrl:检查WeChatCtl:失败次数过多,开始进行DLL卸载", ofs);

		checkFailNum = 0;
		KillTimer(hwnd, 1);
		KillTimer(hwnd, 2);
		LogRecord(L"Do_CheckWeChatCtrl:复原所有的HOOK点", ofs);
		if (sWeChatHookPoint->enable_WX_ReciveMsg_Hook) {
			LogRecord(L"Do_CheckWeChatCtrl:复原WX_ReciveMsg_Hook", ofs);
			UnHOOK_ReciveMsg();
		}
		if (sWeChatHookPoint->enable_GetItemInfo_Hook) {
			LogRecord(L"Do_CheckWeChatCtrl:复原UnHOOK_GetFriendList", ofs);
			UnHOOK_GetItemInfo();
		}
		LogRecord(L"Do_CheckWeChatCtrl:卸载DLL", ofs);
		HANDLE hThread = CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE)UnloadProc, NULL, 0, NULL);
		CloseHandle(hThread);
	}
}

// 窗口消息回调
LRESULT CALLBACK WndProc(HWND hWnd, UINT Message, WPARAM wParam, LPARAM lParam)
{
	// 仅处理WM_COPYDATA类消息
	if (Message == WM_COPYDATA)
	{
		LogRecord(L"收到WM_COPYDATA类消息-开始", ofs);
		COPYDATASTRUCT *pCopyData = (COPYDATASTRUCT*)lParam;
		LogRecord(L"switch type", ofs);
		switch (pCopyData->dwData)
		{
		case WM_CheckIsLogin: {
			LogRecord(L"收到WM_CheckIsLogin指令", ofs);
			break;
		}
		case WM_HookReciveMsg: {
			LogRecord(L"收到WM_HookReciveMsg指令", ofs);
			HOOK_ReciveMsg();
			HOOK_AntiRevoke();
			HOOK_GetItemInfo();
			break;
		}
		case WM_HookAntiRevoke: {
			LogRecord(L"收到WM_HookAntiRevoke指令", ofs);
			break;
		}
		case WM_ShowQrCode: {
			LogRecord(L"收到WM_ShowQrCode指令", ofs);
			break;
		}
		default:

			LogRecord(L"Not_Support_Msg", ofs);
			break;
		}
		LogRecord(L"收到WM_COPYDATA类消息-结束", ofs);
	}
	return DefWindowProc(hWnd, Message, wParam, lParam);
}
