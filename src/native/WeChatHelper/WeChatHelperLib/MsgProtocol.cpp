#include "stdafx.h"
#include <stdio.h>
#include <string>
#include <shlwapi.h>
#include "MsgProtocol.h"
#include "HookOffset.h"
#include "LogRecord.h"

// hook指令 
BYTE WX_SaveQrCode_jmpCode[5] = { 0 };
// 原始指令备份
BYTE WX_SaveQrCode_BACK_HOOK[5] = { 0 };
// 返回地址
DWORD WX_SaveQrCode_RetAddr = 0;
// ecx寄存器
DWORD qrcode_ecx = 0;

void AntiRevoke()
{
	unsigned char fix[1] = { 0xEB };
	DWORD dwPathcAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll") + offset_WxAntiRevoke;
	//修改代码段属性
	DWORD dwOldAttr = 0;
	VirtualProtect((LPVOID)dwPathcAddr, 1, PAGE_EXECUTE_READWRITE, &dwOldAttr);

	//Patch
	memcpy((LPVOID)dwPathcAddr, fix, 1);

	//恢复属性
	VirtualProtect((LPVOID)dwPathcAddr, 5, dwOldAttr, &dwOldAttr);
}

// 显示微信登陆二维码
void WX_CallShowQrCode()
{

	LogRecord(L"WX_CallShowQrCode", ofs);

	DWORD dwWeChatWinAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");
	DWORD dwCallAddr1 = dwWeChatWinAddr + offset_GoToQrCode1;
	DWORD dwCallAddr2 = dwWeChatWinAddr + offset_GoToQrCode2;

	__asm {
		call dwCallAddr1;
		mov ecx, eax;
		call dwCallAddr2;
	}
}

// 保存微信登陆二维码
void HOOK_SaveQrCode()
{

	LogRecord(L"HOOK_SaveQrCode", ofs);

	//拿到模块基址
	DWORD dwWeChatWinAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");

	//计算需要HOOK的地址
	DWORD dwHookAddr = dwWeChatWinAddr + offset_QrCode;
	//计算返回地址
	WX_SaveQrCode_RetAddr = dwWeChatWinAddr + offset_QrCode + 5;
	
	//填充数据
	WX_SaveQrCode_jmpCode[0] = 0xE9;

	//计算偏移
	*(DWORD*)(&WX_SaveQrCode_jmpCode[1]) = (DWORD)invokeSaveImg - dwHookAddr - 5;

	// 保存以前的属性用于还原
	DWORD OldProtext = 0;

	// 因为要往代码段写入数据，又因为代码段是不可写的，所以需要修改属性
	VirtualProtect((LPVOID)dwHookAddr, 5, PAGE_EXECUTE_READWRITE, &OldProtext);

	//保存原有的指令
	memcpy(WX_SaveQrCode_BACK_HOOK, (void*)dwHookAddr, 5);

	//写入自己的代码
	memcpy((void*)dwHookAddr, WX_SaveQrCode_jmpCode, 5);

	// 执行完了操作之后需要进行还原
	VirtualProtect((LPVOID)dwHookAddr, 5, OldProtext, &OldProtext);
}


void __declspec(naked) invokeSaveImg()
{
	//备份寄存器
	__asm pushad;
	__asm pushfd;
	//取出ecx的内容
	__asm mov qrcode_ecx, ecx;
	SaveImg(qrcode_ecx);
	//恢复寄存器
	__asm popfd;
	__asm popad;

	//跳转到返回地址
	__asm jmp WX_SaveQrCode_RetAddr;
}

void SaveImg(DWORD qrcode)
{

	LogRecord(L"SaveImg", ofs);
	//获取图片长度
	DWORD dwPicLen = qrcode + 0x4;
	size_t cpyLen = (size_t)*((LPVOID*)dwPicLen);
	//拷贝图片的数据
	char PicData[0xFFF] = { 0 };
	memcpy(PicData, *((LPVOID*)qrcode), cpyLen);

	char szTempPath[MAX_PATH] = { 0 };
	char szPicturePath[MAX_PATH] = { 0 };
	GetTempPathA(MAX_PATH, szTempPath);

	sprintf_s(szPicturePath, "%s%s", szTempPath, "qrcode.png");
	//将文件写到Temp目录下
	HANDLE hFile = CreateFileA(szPicturePath, GENERIC_ALL, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
	if (hFile == NULL)
	{
		LogRecord(L"创建图片文件失败", ofs);
		return;
	}

	DWORD dwRead = 0;
	if (WriteFile(hFile, PicData, cpyLen, &dwRead, NULL) == 0)
	{
		LogRecord(L"写入图片文件失败", ofs);
		return;
	}
	CloseHandle(hFile);

	//完成之后卸载HOOK
	WX_SaveQrCode_Unhook(offset_QrCode);

}

// 卸载WX_SaveQrCode
void WX_SaveQrCode_Unhook(DWORD dwHookOffset)
{

	LogRecord(L"WX_SaveQrCode_Unhook", ofs);
	//拿到模块基址
	DWORD dwWeChatWinAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");

	DWORD dwHookAddr = dwWeChatWinAddr + dwHookOffset;

	// 保存以前的属性用于还原
	DWORD OldProtext = 0;

	// 因为要往代码段写入数据，又因为代码段是不可写的，所以需要修改属性
	VirtualProtect((LPVOID*)dwHookAddr, 5, PAGE_EXECUTE_READWRITE, &OldProtext);

	// Hook 就是向其中写入自己的代码
	memcpy((LPVOID*)dwHookAddr, WX_SaveQrCode_BACK_HOOK, 5);

	// 执行完了操作之后需要进行还原
	VirtualProtect((LPVOID*)dwHookAddr, 5, OldProtext, &OldProtext);
}


CHAR WX_ReciveMsg_BACK_HOOK[5] = { 0 };
DWORD ReciveMsg_esp = 0;
DWORD ReciveMsg_eax = 0;
DWORD WX_ReciveMsg_HOOK = 0;
//参数的偏移
DWORD ReciveMsg_dwParam = 0;
//返回地址
DWORD ReciveMsg_RetAddr = 0;


void HOOK_ReciveMsg() {
	if (WX_ReciveMsg_HOOK == 1) {
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
	bool r= ReadProcessMemory(GetCurrentProcess(), (LPVOID)dwHookAddr, WX_ReciveMsg_BACK_HOOK, 5, 0);

	//覆盖指令 B9 E8CF895C //mov ecx,0x5C89CFE8
	bool w = WriteProcessMemory(GetCurrentProcess(), (LPVOID)dwHookAddr, bJmpCode, 5, 0);

	if (r&&w) {
		//WX_ReciveMsg_HOOK = 1;
		LogRecord(L"WX_ReciveMsg_HOOK成功", ofs);
	}
	else {
		LogRecord(L"WX_ReciveMsg_HOOK失败", ofs);
	}
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

//消息结构体
struct Message
{
	DWORD type;		//消息类型
	wchar_t typeStr[10];		//消息类型
	DWORD sourceType;		//消息来源
	wchar_t sourceTypeStr[20];		//消息来源
	wchar_t msgReciver[40];		//微信ID/群ID
	wchar_t msgSender[40];	//消息发送者
	wchar_t content[1];	//消息内容
};

bool endWith(const std::string &str, const std::string &tail) {
	return str.compare(str.size() - tail.size(), tail.size(), tail) == 0;
}

bool startWith(const std::string &str, const std::string &head) {
	return str.compare(0, head.size(), head) == 0;
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
	DWORD len = sizeof(Message)+sizeof(wchar_t)*wcslen(c);
	Message *msg = (Message *)malloc(len);

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

// 检查是否登录
void CheckIsLogin()
{
	// 获取WeChatWin的基址
	DWORD  dwWeChatWinAddr = (DWORD)GetModuleHandle(L"WeChatWin.dll");
	DWORD dwIsLogin = dwWeChatWinAddr + offset_LoginSign + 0x194;
	// 控制窗口
	HWND hWeChatRoot = FindWindow(NULL, L"Login");
	if (hWeChatRoot == NULL)
	{
		OutputDebugStringA("未查找到WeChatRoot窗口");
		return;
	}
	COPYDATASTRUCT login_msg;
	login_msg.dwData = WM_CheckIsLogin;
	login_msg.lpData = (LPVOID)dwIsLogin;
	login_msg.cbData = sizeof((DWORD*)dwIsLogin);
	// 发送消息给控制端
	SendMessage(hWeChatRoot, WM_COPYDATA, NULL, (LPARAM)&login_msg);
}