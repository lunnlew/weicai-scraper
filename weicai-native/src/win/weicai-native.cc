#include <nan.h>
#include "wcWechat.h"

#include <direct.h>
#include <TlHelp32.h>

#include <Windows.h>
#include <Psapi.h>//EnumProcesses

bool GetPrivileges()
{
	// 取得当前进程的[Token](标识)句柄

	HANDLE hToken;
	if (!OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, &hToken)) {
		if (GetLastError() == ERROR_CALL_NOT_IMPLEMENTED) {
			return true;
		}
		else {
			return false;
		}
	}
	// 取得调试的[LUID](本地唯一的标识符)值

	TOKEN_PRIVILEGES tokenPrivilege = { 0 };

	TOKEN_PRIVILEGES oldPrivilege = { 0 };

	DWORD dwPrivilegeSize;

	if (!LookupPrivilegeValue(NULL, SE_DEBUG_NAME, &tokenPrivilege.Privileges[0].Luid)) {
		CloseHandle(hToken);
		return false;
	}

	// 设置特权数组的元素个数

	tokenPrivilege.PrivilegeCount = 1;

	// 设置[LUID]的属性值

	tokenPrivilege.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;

	// 为当前进程取得DEBUG权限

	if (!AdjustTokenPrivileges(hToken, FALSE, &tokenPrivilege, sizeof(TOKEN_PRIVILEGES), &oldPrivilege, &dwPrivilegeSize)) {
		CloseHandle(hToken);
		return false;
	}
	//程序结束时要记得释放句柄

	//CloseHandle(hToken);
	return true;
}

BOOL CheckIsInject(DWORD dwProcessid)
{
	HANDLE hModuleSnap = INVALID_HANDLE_VALUE;
	//初始化模块信息结构体
	MODULEENTRY32 me32 = { sizeof(MODULEENTRY32) };
	//创建模块快照 1 快照类型 2 进程ID
	hModuleSnap = CreateToolhelp32Snapshot(TH32CS_SNAPMODULE, dwProcessid);
	//如果句柄无效就返回false
	if (hModuleSnap == INVALID_HANDLE_VALUE)
	{
		Nan::ThrowError("创建模块快照失败");
		return FALSE;
	}
	//通过模块快照句柄获取第一个模块的信息
	if (!Module32First(hModuleSnap, &me32))
	{
		Nan::ThrowError("获取第一个模块的信息失败");
		//获取失败则关闭句柄
		CloseHandle(hModuleSnap);
		return FALSE;
	}

	//首先获得第一个
	BOOL bModule = Module32First(hModuleSnap, &me32);
	//循环获得所有
	while (bModule)
	{
		printf("%s\n", me32.szModule);
		if (strcmp("WeChatHelper.dll", me32.szModule) == 0)
		{
			return true;
		}
		bModule = Module32Next(hModuleSnap, &me32);
	}

	return false;
}

void injectDll(const Nan::FunctionCallbackInfo<v8::Value>& info) {
	if (info.Length() != 1) {
		Nan::ThrowTypeError("必须且仅支持一个参数\n");
		return;
	}
	if (!info[0]->IsString()) {
		Nan::ThrowTypeError("参数必须是字符串类型");
		return;
	}

	v8::Local<v8::String> str = v8::Local<v8::String>::Cast(info[0]);
	v8::String::Utf8Value utfValue(str);

	BOOL ret = GetPrivileges();
	printf("GetPrivileges -> %d\n", ret);

	//获取当前工作目录下的dll
	char szPath[MAX_PATH] = { 0 };
	char* buffer = NULL;
	if ((buffer = _getcwd(NULL, 0)) == NULL)
	{
		Nan::ThrowError("获取当前工作目录失败");
		return;
	}

	sprintf_s(szPath, "%s\\%s", buffer, "WeChatHelper.dll");
	printf("%s\n", szPath);

	// 根据进程名取得进程id
	DWORD dwPid = ProcessNameFindPID((LPCSTR)std::string(*utfValue).c_str());

	if (dwPid == 0)
	{
		Nan::ThrowError("无法找到指定的进程名称\n");
		return;
	}

	printf("%d\n", dwPid);
	if (CheckIsInject(dwPid))
	{
		Nan::ThrowError("进程已被注入，请勿重复注入\n");
		return;
	}

	//打开进程
	printf("打开进程\n");
	HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, dwPid);
	if (hProcess == NULL)
	{
		Nan::ThrowError("进程打开失败");
		return;
	}

	//在微信进程中申请内存
	printf("在微信进程中申请内存\n");
	LPVOID pAddress = VirtualAllocEx(hProcess, NULL, MAX_PATH, MEM_COMMIT, PAGE_EXECUTE_READWRITE);
	if (pAddress == NULL)
	{
		Nan::ThrowError("内存分配失败");
		return;
	}

	//写入dll路径到微信进程
	printf("写入dll路径到微信进程\n");
	if (WriteProcessMemory(hProcess, pAddress, szPath, MAX_PATH, NULL) == 0)
	{
		Nan::ThrowError("路径写入失败");
		return;
	}

	//获取LoadLibraryA函数地址
	printf("获取LoadLibraryA函数地址\n");
	FARPROC pLoadLibraryAddress = GetProcAddress(GetModuleHandleA("kernel32.dll"), "LoadLibraryA");
	if (pLoadLibraryAddress == NULL)
	{
		Nan::ThrowError("获取LoadLibraryA函数地址失败");
		return;
	}
	//远程线程注入dll
	printf("远程线程注入dll\n");
	HANDLE hRemoteThread = CreateRemoteThread(hProcess, NULL, 0, (LPTHREAD_START_ROUTINE)pLoadLibraryAddress, pAddress, 0, NULL);
	if (hRemoteThread == NULL)
	{
		Nan::ThrowError("远程线程注入失败");
		return;
	}

	WaitForSingleObject(hRemoteThread, -1);

	VirtualFreeEx(hProcess, pAddress, 1, MEM_DECOMMIT);

	CloseHandle(hRemoteThread);
	CloseHandle(hProcess);

	info.GetReturnValue().Set(Nan::New((bool)true));
}

void IsExistProgress(const Nan::FunctionCallbackInfo<v8::Value>& info) {
	if(info.Length()!=1) {
    	Nan::ThrowTypeError("必须且仅支持一个参数\n");
    	return;
  	}
	if (!info[0]->IsString()) {
		Nan::ThrowTypeError("参数必须是字符串类型");
		return;
	}
	v8::Local<v8::String> str = v8::Local<v8::String>::Cast(info[0]);
	v8::String::Utf8Value utfValue(str);
	DWORD dwPid = ProcessNameFindPID((LPCSTR)std::string(*utfValue).c_str());
	info.GetReturnValue().Set(Nan::New((bool)dwPid));
}

void Init(v8::Local<v8::Object> exports) {
	v8::Local<v8::Context> context = exports->CreationContext();

	exports->Set(context,
		Nan::New("IsExistProgress").ToLocalChecked(),
		Nan::New<v8::FunctionTemplate>(IsExistProgress)
		->GetFunction(context)
		.ToLocalChecked());

	exports->Set(context,
		Nan::New("injectDll").ToLocalChecked(),
		Nan::New<v8::FunctionTemplate>(injectDll)
		->GetFunction(context)
		.ToLocalChecked());
}

NODE_MODULE(weicaiNative, Init)