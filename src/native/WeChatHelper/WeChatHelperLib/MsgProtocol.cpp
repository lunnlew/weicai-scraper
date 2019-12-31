#include "stdafx.h"
#include <stdio.h>
#include <string>
#include <shlwapi.h>
#include "MsgProtocol.h"
#include "StringTool.h"
#include "HookOffset.h"
#include "LogRecord.h"
#include "HttpRequest.h"
#include "json.hpp"

using json = nlohmann::json;;

//====消息接收hook 开始===
DWORD ReciveMsg_esp = 0;
DWORD ReciveMsg_eax = 0;
DWORD ReciveMsg_dwParam = 0;
DWORD ReciveMsg_RetAddr = 0;

WeChatHookPoint * sWeChatHookPoint = new WeChatHookPoint();
WeChatHookReg *sWeChatHookReg = new WeChatHookReg();

void HOOK_ReciveMsg() {
	if (sWeChatHookPoint->enable_WX_ReciveMsg_Hook) {
		LogRecord(L"已经存在WX_ReciveMsg_HOOK", ofs);
		return;
	}
	DWORD WeChatWinBaseAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");
	LogRecord(L"WeChatWin.dll 基址", ofs);
	LogRecord(char2TCAHR(std::to_string(WeChatWinBaseAddr).c_str()), ofs);

	//计算需要HOOK的地址
	DWORD dwHookAddr = WeChatWinBaseAddr + offset_ReciveMessage;
	ReciveMsg_dwParam = WeChatWinBaseAddr + offset_ReciveMessageParam;
	ReciveMsg_RetAddr = dwHookAddr + 5;

	LogRecord(L"ReciveMsg_HOOK 地址", ofs);
	LogRecord(char2TCAHR(std::to_string(dwHookAddr).c_str()), ofs);

	LogRecord(L"ReciveMsg_RetAddr 地址", ofs);
	LogRecord(char2TCAHR(std::to_string(ReciveMsg_RetAddr).c_str()), ofs);

	//组装数据
	BYTE bJmpCode[5] = { 0xE9 };
	*(DWORD*)&bJmpCode[1] = (DWORD)RecieveWxMesage - dwHookAddr - 5;

	//保存当前位置的指令,在unhook的时候使用。
	bool r= ReadProcessMemory(GetCurrentProcess(), (LPVOID)dwHookAddr, sWeChatHookPoint->WX_ReciveMsg_Hook, 5, 0);

	//覆盖指令 B9 E8CF895C //mov ecx,0x5C89CFE8
	bool w = WriteProcessMemory(GetCurrentProcess(), (LPVOID)dwHookAddr, bJmpCode, 5, 0);

	if (r&&w) {
		sWeChatHookPoint->enable_WX_ReciveMsg_Hook = true;
		LogRecord(L"WX_ReciveMsg_HOOK成功", ofs);
	}
	else {
		LogRecord(L"WX_ReciveMsg_HOOK失败", ofs);
	}
}
void UnHOOK_ReciveMsg()
{
	if (!sWeChatHookPoint->enable_WX_ReciveMsg_Hook) {
		LogRecord(L"WX_ReciveMsg_HOOK不存在", ofs);
		return;
	}

	LogRecord(L"UnHOOK_ReciveMsg", ofs);
	DWORD WeChatWinBaseAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");
	//计算需要HOOK的地址
	DWORD dwHookAddr = WeChatWinBaseAddr + offset_ReciveMessage;

	// 原属性
	DWORD OldProtext = 0;

	// 更改可读写
	VirtualProtect((LPVOID*)dwHookAddr, 5, PAGE_EXECUTE_READWRITE, &OldProtext);

	// 还原原始指令
	memcpy((LPVOID*)dwHookAddr, sWeChatHookPoint->WX_ReciveMsg_Hook, 5);

	// 属性还原
	VirtualProtect((LPVOID*)dwHookAddr, 5, OldProtext, &OldProtext);
}


__declspec(naked) void RecieveWxMesage()
{
	//保存现场
	__asm
	{
		//补充被覆盖的代码
		//mov ecx,WeChatWin.dll+1624908 { (56B097FC) }
		mov ecx, ReciveMsg_dwParam

		//提取esp寄存器内容，放在一个变量中
		mov ReciveMsg_esp, esp
		mov ReciveMsg_eax, eax

		pushad
		pushfd
	}

	SendWxMessage();

	//恢复现场
	__asm
	{
		popfd
		popad
		//跳回被HOOK指令的下一条指令
		jmp ReciveMsg_RetAddr
	}
}

void SendWxMessage()
{


	LogRecord(L"SendWxMessage", ofs);

	//信息块的位置
	DWORD** msgAddress = (DWORD * *)ReciveMsg_esp;
	//消息类型
	DWORD msgType = *((DWORD*)(**msgAddress + offset_ReciveMessageParam_MsgType));
	//消息来源类型
	DWORD msgSource = *((DWORD*)(**msgAddress + offset_ReciveMessageParam_MsgSourceType));
	//消息发送者
	LPVOID pSender = *((LPVOID *)(**msgAddress + offset_ReciveMessageParam_MsgSender));
	//消息接收者
	LPVOID pWxid = *((LPVOID *)(**msgAddress + offset_ReciveMessageParam_MsgReciver));
	//完整的消息内容
	std::wstring msgContent = GetMsgByAddress(**msgAddress + offset_ReciveMessageParam_MsgContent);
	const wchar_t* c = msgContent.c_str();

	//分配长度
	DWORD len = sizeof(WeChatMessage)+sizeof(wchar_t)*wcslen(c);
	WeChatMessage *msg = (WeChatMessage *)malloc(len);

	msg->type = msgType;
	msg->sourceType = msgSource;
	wcscpy_s(msg->content, wcslen(c) + 1, c);

	swprintf_s(msg->msgReciver, L"%s", (wchar_t*)pWxid);
	swprintf_s(msg->msgSender, L"%s", (wchar_t*)pSender);

	switch (msgType)
	{
	case 0x01:
		memcpy(msg->typeStr, L"文字", sizeof(L"文字"));
		break;
	case 0x03:
		memcpy(msg->typeStr, L"图片", sizeof(L"图片"));
		break;
	case 0x22:
		memcpy(msg->typeStr, L"语音", sizeof(L"语音"));
		break;
	case 0x25:
		memcpy(msg->typeStr, L"好友确认", sizeof(L"好友确认"));
		break;
	case 0x28:
		memcpy(msg->typeStr, L"POSSIBLEFRIEND_MSG", sizeof(L"POSSIBLEFRIEND_MSG"));
		break;
	case 0x2A:
		memcpy(msg->typeStr, L"名片", sizeof(L"名片"));
		break;
	case 0x2B:
		memcpy(msg->typeStr, L"视频", sizeof(L"视频"));
		break;
	case 0x2F:
		//石头剪刀布
		memcpy(msg->typeStr, L"表情", sizeof(L"表情"));
		break;
	case 0x30:
		memcpy(msg->typeStr, L"位置", sizeof(L"位置"));
		break;
	case 0x31:
		//共享实时位置
		//文件
		//转账
		//链接
		//收款
		memcpy(msg->typeStr, L"共享实时位置、文件、转账、链接", sizeof(L"共享实时位置、文件、转账、链接"));
		break;
	case 0x32:
		memcpy(msg->typeStr, L"VOIPMSG", sizeof(L"VOIPMSG"));
		break;
	case 0x33:
		memcpy(msg->typeStr, L"微信初始化", sizeof(L"微信初始化"));
		break;
	case 0x34:
		memcpy(msg->typeStr, L"VOIPNOTIFY", sizeof(L"VOIPNOTIFY"));
		break;
	case 0x35:
		memcpy(msg->typeStr, L"VOIPINVITE", sizeof(L"VOIPINVITE"));
		break;
	case 0x3E:
		memcpy(msg->typeStr, L"小视频", sizeof(L"小视频"));
		break;
	case 0x270F:
		memcpy(msg->typeStr, L"SYSNOTICE", sizeof(L"SYSNOTICE"));
		break;
	case 0x2710:
		//系统消息
		//红包
		memcpy(msg->typeStr, L"红包、系统消息", sizeof(L"红包、系统消息"));
		break;
	default:
		memcpy(msg->typeStr, std::to_string(msgType).c_str(), sizeof(std::to_string(msgType).c_str()));
		break;
	}

	if (msgSource == 0x01) {
		memcpy(msg->sourceTypeStr, L"好友消息", sizeof(L"好友消息"));
	}
	else {
		memcpy(msg->sourceTypeStr, L"非好友消息", sizeof(L"非好友消息"));
	}

	// 测试是否为公众号来源
	char strOut[2 * 40] = { 0 };
	WideCharToMultiByte(CP_ACP, 0, msg->msgReciver, sizeof(msg->msgReciver), strOut, sizeof(strOut), 0, 0);
	if (startWith(strOut, "gh_")) {
		memcpy(msg->typeStr, L"公众号推送", sizeof(L"公众号推送"));
	}

	//控制窗口
	HWND hWeChatRoot = FindWindow(NULL, L"WeChatCtl");
	if (hWeChatRoot == NULL)
	{
		LogRecord(L"未查找到WeChatCtl窗口", ofs);
		return;
	}

	COPYDATASTRUCT chatmsg;
	chatmsg.dwData = WM_ReciveMsg;// 保存一个数值, 可以用来作标志等
	chatmsg.cbData = len;// 待发送的数据的长
	chatmsg.lpData = msg;// 待发送的数据的起始地址
	SendMessage(hWeChatRoot, WM_COPYDATA, NULL, (LPARAM)&chatmsg);
}

std::wstring GetMsgByAddress(DWORD memAddress)
{
	std::wstring tmp;
	DWORD msgLength = *(DWORD*)(memAddress + 4);
	if (msgLength > 0) {
		WCHAR* msg = new WCHAR[msgLength + 1]{ 0 };
		wmemcpy_s(msg, msgLength + 1, (WCHAR*)(*(DWORD*)memAddress), msgLength + 1);
		tmp = msg;
		delete[]msg;
	}
	return  tmp;
}


//====消息接收hook 结束===