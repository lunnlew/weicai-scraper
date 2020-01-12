#include "stdafx.h"
#include <stdio.h>
#include <string>
#include <shlwapi.h>
#include "MsgProtocol.h"
#include "StringTool.h"
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
WeChatLoginInfo *sWeChatLoginInfo = new WeChatLoginInfo();
std::vector<std::wstring> vUserList;

void HOOK_ReciveMsg() {
	LogRecord(L"HOOK_ReciveMsg", ofs);
	if (sWeChatHookPoint->enable_WX_ReciveMsg_Hook) {
		LogRecord(L"已经存在WX_ReciveMsg_HOOK", ofs);
		return;
	}
	if (sWechatOffset->offsetReciveMessage == 0x0) {
		LogRecord(L"未支持 ReciveMsg_HOOK", ofs);
		return;
	}
	if (IsLogin()!=1) {
		LogRecord(L"还未登录", ofs);
		return;
	}
	else {
		LogRecord(L"已登录", ofs);
	}

	DWORD WeChatWinBaseAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");
	LogRecord(L"WeChatWin.dll 基址", ofs);
	LogRecord(char2TCAHR(std::to_string(WeChatWinBaseAddr).c_str()), ofs);

	//计算需要HOOK的地址
	DWORD dwHookAddr = WeChatWinBaseAddr + sWechatOffset->offsetReciveMessage;
	ReciveMsg_dwParam = WeChatWinBaseAddr + sWechatOffset->offsetReciveMessageParam;
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
	LogRecord(L"UnHOOK_ReciveMsg", ofs);

	if (sWechatOffset->offsetReciveMessage == 0x0) {
		LogRecord(L"未支持 ReciveMsg_HOOK", ofs);
		return;
	}

	if (!sWeChatHookPoint->enable_WX_ReciveMsg_Hook) {
		LogRecord(L"WX_ReciveMsg_HOOK不存在", ofs);
		return;
	}

	DWORD WeChatWinBaseAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");
	//计算需要HOOK的地址
	DWORD dwHookAddr = WeChatWinBaseAddr + sWechatOffset->offsetReciveMessage;

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
	DWORD msgType = *((DWORD*)(**msgAddress + sWechatOffset->offsetReciveMessageParam_MsgType));
	//消息来源类型
	DWORD msgSource = *((DWORD*)(**msgAddress + sWechatOffset->offsetReciveMessageParam_MsgSourceType));
	//消息发送者
	LPVOID pSender = *((LPVOID *)(**msgAddress + sWechatOffset->offsetReciveMessageParam_MsgSender));
	//消息接收者
	LPVOID pWxid = *((LPVOID *)(**msgAddress + sWechatOffset->offsetReciveMessageParam_MsgReciver));
	DWORD tl = 0;
	//完整的消息内容
	std::wstring msgContent = GetMsgByAddress(**msgAddress + sWechatOffset->offsetReciveMessageParam_MsgContent, tl);
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
	case 0x23:
		memcpy(msg->typeStr, L"邮箱提醒", sizeof(L"邮箱提醒"));
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
	case 0x2712:
		memcpy(msg->typeStr, L"撤回消息", sizeof(L"撤回消息"));
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

std::wstring GetMsgByAddress(DWORD addr, DWORD &clen)
{
	std::wstring tmp;
	DWORD len = *(DWORD*)(addr + 4);
	clen += len;
	if (len > 0) {
		WCHAR* msg = new WCHAR[len + 1]{ 0 };
		wmemcpy_s(msg, len + 1, (WCHAR*)(*(DWORD*)addr), len + 1);
		tmp = msg;
		delete[]msg;
	}
	return  tmp;
}


//====消息接收hook 结束===



WeChatLoginInfo * GetWechatLoginInfo() {
	DWORD WeChatWinBaseAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");
	DWORD infoAddr = WeChatWinBaseAddr + sWechatOffset->offsetLoginInfoBlock;
	DWORD tl = 0;
	wchar_t *wxid = pToTchar(infoAddr + sWechatOffset->offsetLoginInfoBlock_WxId, tl);
	wchar_t *wxname = pToTchar(infoAddr + sWechatOffset->offsetLoginInfoBlock_WechatName, tl);
	wchar_t *email = pToTchar(infoAddr + sWechatOffset->offsetLoginInfoBlock_Email, tl);
	wchar_t *mobile = pToTchar(infoAddr + sWechatOffset->offsetLoginInfoBlock_Mobile, tl);
	DWORD sex = *((DWORD*)(infoAddr + sWechatOffset->offsetLoginInfoBlock_Sex));
	DWORD islogin = *((DWORD*)(infoAddr + sWechatOffset->offsetLoginInfoBlock_IsLogin));
	wchar_t *province = pToTchar(infoAddr + sWechatOffset->offsetLoginInfoBlock_Province, tl);
	wchar_t *city = pToTchar(infoAddr + sWechatOffset->offsetLoginInfoBlock_City, tl);
	wchar_t *signer = pToTchar(infoAddr + sWechatOffset->offsetLoginInfoBlock_Signer, tl);
	wchar_t *country = pToTchar(infoAddr + sWechatOffset->offsetLoginInfoBlock_Country, tl);
	wchar_t *avatar = pToTchar(infoAddr + sWechatOffset->offsetLoginInfoBlock_Avatar, tl);
	wchar_t *device = pToTchar(infoAddr + sWechatOffset->offsetLoginInfoBlock_Device, tl);

	wcscpy_s(sWeChatLoginInfo->WechatName, wcslen(wxname) + 1, wxname);

	return sWeChatLoginInfo;
}

int IsLogin() {
	DWORD WeChatWinBaseAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");
	DWORD infoAddr = WeChatWinBaseAddr + sWechatOffset->offsetLoginInfoBlock;
	int ret = (int) * (int*)(infoAddr + sWechatOffset->offsetLoginInfoBlock_IsLogin);
	return ret;
}

void HOOK_AntiRevoke()
{
	LogRecord(L"执行 HOOK_AntiRevoke", ofs);
	if (sWechatOffset->offsetAntiRevoke == 0x0) {
		LogRecord(L"未支持 HOOK_AntiRevoke", ofs);
		return;
	}
	unsigned char fix[1] = { 0xEB };
	DWORD dwPathcAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll") + sWechatOffset->offsetAntiRevoke;
	DWORD dwOldAttr = 0;

	VirtualProtect((LPVOID)dwPathcAddr, 1, PAGE_EXECUTE_READWRITE, &dwOldAttr);
	memcpy((LPVOID)dwPathcAddr, fix, 1);
	VirtualProtect((LPVOID)dwPathcAddr, 5, dwOldAttr, &dwOldAttr);
}


DWORD GetItemInfoCall_RetAddr;
DWORD GetItemInfoCall_Add;
DWORD dwItemInfo_eax;
void HOOK_GetItemInfo() {
	LogRecord(L"HOOK_GetItemInfo", ofs);
	if (sWeChatHookPoint->enable_GetItemInfo_Hook) {
		LogRecord(L"已经存在HOOK_GetItemInfo", ofs);
		return;
	}
	if (sWechatOffset->offsetInfoCall == 0x0) {
		LogRecord(L"未支持HOOK_GetItemInfo", ofs);
		return;
	}

	DWORD WeChatWinBaseAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");
	DWORD dwHookAddr = WeChatWinBaseAddr + sWechatOffset->offsetInfoCall;
	GetItemInfoCall_Add = WeChatWinBaseAddr + sWechatOffset->offsetInfoCallAdd;
	GetItemInfoCall_RetAddr = dwHookAddr + 5;

	//组装数据
	BYTE bJmpCode[5] = { 0xE9 };
	*(DWORD*)&bJmpCode[1] = (DWORD)GetItemInfo - dwHookAddr - 5;

	//保存当前位置的指令,在unhook的时候使用。
	bool r = ReadProcessMemory(GetCurrentProcess(), (LPVOID)dwHookAddr, sWeChatHookPoint->GetItemInfo_Hook, 5, 0);

	//覆盖指令 B9 E8CF895C //mov ecx,0x5C89CFE8
	bool w = WriteProcessMemory(GetCurrentProcess(), (LPVOID)dwHookAddr, bJmpCode, 5, 0);

	if (r&&w) {
		sWeChatHookPoint->enable_GetItemInfo_Hook = true;
		LogRecord(L"HOOK_GetItemInfo成功", ofs);
	}
	else {
		LogRecord(L"HOOK_GetItemInfo失败", ofs);
	}
}
__declspec(naked) void GetItemInfo()
{
	__asm
	{
		// 执行被覆盖的指令
		call GetItemInfoCall_Add;

		// 保存信息地址
		mov dwItemInfo_eax, eax

		pushad
		pushf
	}

	SendItemInfo();

	__asm
	{
		popf
		popad

		//跳回被HOOK指令的下一条指令
		jmp GetItemInfoCall_RetAddr
	}
}

void SendItemInfo()
{
	DWORD tl = 0;
	std::wstring wxid = GetMsgByAddress(dwItemInfo_eax + 0x10, tl);
	std::vector<std::wstring>::iterator it;
	DWORD ishas = 0;
	for (it = vUserList.begin(); it != vUserList.end();)
	{
		if (strcmp(Wchar_tToString((wchar_t *)it->c_str()).c_str(), Wchar_tToString((wchar_t *)wxid.c_str()).c_str()) == 0) {
			ishas = 1;
			break;
		}
			++it;
	}
	if (ishas == 1) {
		return;
	}
	else {
		vUserList.push_back(wxid);
	}

	UserInfo *user = new UserInfo;
	LPVOID pUserWxid = *((LPVOID *)(dwItemInfo_eax + 0x10));
	LPVOID pUserWxname = *((LPVOID *)(dwItemInfo_eax + 0x44));
	LPVOID pUserWxv1 = *((LPVOID *)(dwItemInfo_eax + 0x58));
	DWORD unflag = *((DWORD*)(dwItemInfo_eax + 0x74));
	LPVOID pUserRealname = *((LPVOID *)(dwItemInfo_eax + 0x78));
	DWORD unflag1 = *((DWORD*)(dwItemInfo_eax + 0x78));

	LPVOID pUserNickname = *((LPVOID *)(dwItemInfo_eax + 0x8C));
	DWORD accflag = *((DWORD*)(dwItemInfo_eax + 0xC8));
	LPVOID pUserFNickname = *((LPVOID *)(dwItemInfo_eax + 0xCC));
	LPVOID pUserPNickname = *((LPVOID *)(dwItemInfo_eax + 0xE0));
	LPVOID pUserFRealname = *((LPVOID *)(dwItemInfo_eax + 0xF4));
	LPVOID pUserPRealname = *((LPVOID *)(dwItemInfo_eax + 0x108));

	swprintf_s(user->wxid, L"%s", (wchar_t*)pUserWxid);
	swprintf_s(user->wxname, L"%s", (wchar_t*)pUserWxname);
	swprintf_s(user->wxv1, L"%s", (wchar_t*)pUserWxv1);
	swprintf_s(user->realname, L"%s", (wchar_t*)pUserRealname);
	swprintf_s(user->nickname, L"%s", (wchar_t*)pUserNickname);
	swprintf_s(user->f_nickname, L"%s", (wchar_t*)pUserFNickname);
	swprintf_s(user->p_nickname, L"%s", (wchar_t*)pUserPNickname);
	swprintf_s(user->f_realname, L"%s", (wchar_t*)pUserFRealname);
	swprintf_s(user->p_realname, L"%s", (wchar_t*)pUserPRealname);
	user->sex = 0;
	user->unflag = unflag;
	if (unflag == 0x0) {
		// 好友 群聊
		user->type = 1;
	}
	else {
		if (unflag1 == 0x0) {
			// 公众号
			user->type = 2;
		}
	}

	//控制窗口
	HWND hWeChatRoot = FindWindow(NULL, L"WeChatCtl");
	if (hWeChatRoot == NULL)
	{
		LogRecord(L"未查找到WeChatCtl窗口", ofs);
		return;
	}

	COPYDATASTRUCT chatmsg;
	chatmsg.dwData = WM_GetFriendList;
	chatmsg.cbData = sizeof(UserInfo);
	chatmsg.lpData = user;
	SendMessage(hWeChatRoot, WM_COPYDATA, NULL, (LPARAM)&chatmsg);
}

void UnHOOK_GetItemInfo()
{
	LogRecord(L"UnHOOK_GetFriendList", ofs);

	LogRecord(L"GetFriendList", ofs);
	if (!sWeChatHookPoint->enable_GetItemInfo_Hook) {
		LogRecord(L"不存在GetFriendList_HOOK", ofs);
		return;
	}
	if (sWechatOffset->offsetGetFriendListCall == 0x0) {
		LogRecord(L"未支持 GetFriendList_HOOK", ofs);
		return;
	}

	DWORD WeChatWinBaseAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");
	//计算需要HOOK的地址
	DWORD dwHookAddr = WeChatWinBaseAddr + sWechatOffset->offsetGetFriendList;

	// 原属性
	DWORD OldProtext = 0;

	// 更改可读写
	VirtualProtect((LPVOID*)dwHookAddr, 5, PAGE_EXECUTE_READWRITE, &OldProtext);

	// 还原原始指令
	memcpy((LPVOID*)dwHookAddr, sWeChatHookPoint->GetItemInfo_Hook, 5);

	// 属性还原
	VirtualProtect((LPVOID*)dwHookAddr, 5, OldProtext, &OldProtext);
}