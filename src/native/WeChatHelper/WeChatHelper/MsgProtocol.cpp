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
		//5B950573  |.  B9 E8CF895C           mov ecx,WeChatWi.5C89CFE8
		//mov ecx,0x5C89CFE8
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
	wchar_t type[10];		//消息类型
	wchar_t source[20];		//消息来源
	wchar_t wxid[40];		//微信ID/群ID
	wchar_t msgSender[40];	//消息发送者
	wchar_t content[0x8000];	//消息内容
	BOOL isMoney = FALSE;	//是否是收款消息
};

void SendWxMessage()
{


	LogRecord(L"SendWxMessage", ofs);
	Message *msg = new Message;

	//信息块的位置
	DWORD** msgAddress = (DWORD * *)ReciveMsg_esp;
	//消息类型
	DWORD msgType = *((DWORD*)(**msgAddress + 0x30));

	BOOL isFriendMsg = FALSE;		//是否是好友消息
	BOOL isImageMessage = FALSE;	//是否是图片消息
	BOOL isRadioMessage = FALSE;	//是否是视频消息
	BOOL isVoiceMessage = FALSE;	//是否是语音消息
	BOOL isBusinessCardMessage = FALSE;	//是否是名片消息
	BOOL isExpressionMessage = FALSE;	//是否是名片消息
	BOOL isLocationMessage = FALSE;	//是否是位置消息
	BOOL isSystemMessage = FALSE;	//是否是系统或红包消息
	BOOL isFriendRequestMessage = FALSE;	//是否是好友请求消息
	BOOL isOther = FALSE;	//是否是其他消息

	switch (msgType)
	{
	case 0x01:
		memcpy(msg->type, L"文字", sizeof(L"文字"));
		break;
	case 0x03:
		memcpy(msg->type, L"图片", sizeof(L"图片"));
		isImageMessage = TRUE;
		break;
	case 0x22:
		memcpy(msg->type, L"语音", sizeof(L"语音"));
		isVoiceMessage = TRUE;
		break;
	case 0x25:
		memcpy(msg->type, L"好友确认", sizeof(L"好友确认"));
		isFriendRequestMessage = TRUE;
		break;
	case 0x28:
		memcpy(msg->type, L"POSSIBLEFRIEND_MSG", sizeof(L"POSSIBLEFRIEND_MSG"));
		isOther = TRUE;
		break;
	case 0x2A:
		memcpy(msg->type, L"名片", sizeof(L"名片"));
		isBusinessCardMessage = TRUE;
		break;
	case 0x2B:
		memcpy(msg->type, L"视频", sizeof(L"视频"));
		isRadioMessage = TRUE;
		break;
	case 0x2F:
		//石头剪刀布
		memcpy(msg->type, L"表情", sizeof(L"表情"));
		isExpressionMessage = TRUE;
		break;
	case 0x30:
		memcpy(msg->type, L"位置", sizeof(L"位置"));
		isLocationMessage = TRUE;
		break;
	case 0x31:
		//共享实时位置
		//文件
		//转账
		//链接
		//收款
		memcpy(msg->type, L"共享实时位置、文件、转账、链接", sizeof(L"共享实时位置、文件、转账、链接"));
		isOther = TRUE;
		break;
	case 0x32:
		memcpy(msg->type, L"VOIPMSG", sizeof(L"VOIPMSG"));
		isOther = TRUE;
		break;
	case 0x33:
		memcpy(msg->type, L"微信初始化", sizeof(L"微信初始化"));
		isOther = TRUE;
		break;
	case 0x34:
		memcpy(msg->type, L"VOIPNOTIFY", sizeof(L"VOIPNOTIFY"));
		isOther = TRUE;
		break;
	case 0x35:
		memcpy(msg->type, L"VOIPINVITE", sizeof(L"VOIPINVITE"));
		isOther = TRUE;
		break;
	case 0x3E:
		memcpy(msg->type, L"小视频", sizeof(L"小视频"));
		isRadioMessage = TRUE;
		break;
	case 0x270F:
		memcpy(msg->type, L"SYSNOTICE", sizeof(L"SYSNOTICE"));
		isOther = TRUE;
		break;
	case 0x2710:
		//系统消息
		//红包
		memcpy(msg->type, L"红包、系统消息", sizeof(L"红包、系统消息"));
		isSystemMessage = TRUE;
		break;
	default:
		memcpy(msg->type, std::to_string(msgType).c_str(), sizeof(std::to_string(msgType).c_str()));
		isOther = TRUE;
		break;
	}
	const wchar_t* c = L"";
	//消息内容
	std::wstring fullmessgaedata = GetMsgByAddress(**msgAddress + 0x68);	//完整的消息内容
	//判断消息来源是群消息还是好友消息
	std::wstring msgSource2 = L"<msgsource />\n";
	std::wstring msgSource = L"";
	msgSource.append(GetMsgByAddress(**msgAddress + 0x168));
	//好友消息
	if (msgSource.length() <= msgSource2.length())
	{
		memcpy(msg->source, L"好友消息", sizeof(L"好友消息"));
		isFriendMsg = TRUE;
	}
	else
	{
		//群消息
		memcpy(msg->source, L"群消息", sizeof(L"群消息"));
	}

	//显示微信ID/群ID
	LPVOID pWxid = *((LPVOID *)(**msgAddress + 0x40));
	swprintf_s(msg->wxid, L"%s", (wchar_t*)pWxid);

	//如果是群消息
	if (isFriendMsg == FALSE)
	{
		//显示消息发送者
		LPVOID pSender = *((LPVOID *)(**msgAddress + 0x114));
		swprintf_s(msg->msgSender, L"%s", (wchar_t*)pSender);
	}
	else
	{
		memcpy(msg->msgSender, L"NULL", sizeof(L"NULL"));
	}

	if (wcscmp(msg->wxid, L"gh")) {
		if ((wcscmp(msg->wxid, L"gh_3dfda90e39d6") == 0))
		{
			c = L"微信收款到账";
			msg->isMoney = TRUE;
		}
		else
		{
			memcpy(msg->type, L"公众号推送", sizeof(L"公众号推送"));
			c = fullmessgaedata.c_str();
		}
	}//过滤图片消息 
	else if (isImageMessage == TRUE)
	{
		c = L"收到图片消息,请在手机上查看";
	}
	else if (isRadioMessage == TRUE)
	{
		c = L"收到视频消息,请在手机上查看";
	}
	else if (isVoiceMessage == TRUE)
	{
		c = L"收到语音消息,请在手机上查";
	}
	else if (isBusinessCardMessage == TRUE)
	{
		c = L"收到名片消息,已自动添加好友";
	}
	else if (isExpressionMessage == TRUE)
	{
		c = L"收到表情消息,请在手机上查看";
	}
	//自动通过好友请求
	else if (isFriendRequestMessage == TRUE)
	{
		c = L"收收到好友请求,已自动通过";
	}
	else if (isOther == TRUE)
	{
		//取出消息内容
		wchar_t tempcontent[0x10000] = { 0 };
		LPVOID pContent = *((LPVOID *)(**msgAddress + 0x68));
		swprintf_s(tempcontent, L"%s", (wchar_t*)pContent);
		//判断是否是转账消息
		if (wcscmp(tempcontent, L"微信转账"))
		{
			c = L"收到转账消息,已自动收款";
		}
		else
		{
			c = L"收到共享实时位置、文件、链接等其他消息,请在手机上查看";
			c = fullmessgaedata.c_str();

		}
	}
	else if (isLocationMessage == TRUE)
	{
		c = L"收到位置消息,请在手机上查看";
	}
	else if (isSystemMessage == TRUE)
	{
		wchar_t tempbuff[0x1000];
		LPVOID pContent = *((LPVOID *)(**msgAddress + 0x68));
		swprintf_s(tempbuff, L"%s", (wchar_t*)pContent);

		//在这里处理加入群聊消息
		if ((wcscmp(tempbuff, L"移出了群聊") || wcscmp(tempbuff, L"加入了群聊")))
		{
			c = (wchar_t*)tempbuff;
		}
		else
		{
			c = L"收到红包或系统消息,请在手机上查看";
		}

	}
	//过滤完所有消息之后
	else
	{
		c = fullmessgaedata.c_str();
	}
	//swprintf_s(msg->content, wcslen(c) * sizeof(wchar_t), (wchar_t*)c);

	//msg->content = (wchar_t*)std::malloc(wcslen(c) * sizeof(wchar_t));
	wcscpy_s(msg->content, wcslen(c) + 1, c);

	//控制窗口
	HWND hWeChatRoot = FindWindow(NULL, L"WeChatCtl");
	if (hWeChatRoot == NULL)
	{
		LogRecord(L"未查找到WeChatCtl窗口", ofs);
		return;
	}

	COPYDATASTRUCT chatmsg;
	chatmsg.dwData = WM_ReciveMsg;//保存一个数值, 可以用来作标志等
	chatmsg.cbData = sizeof(Message);// strlen(szSendBuf);//待发送的数据的长
	chatmsg.lpData = msg;// szSendBuf;//待发送的数据的起始地址(可以为NULL)
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