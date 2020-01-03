#include "stdafx.h"
#include <tlhelp32.h>
#include "StringTool.h"
#include "LogRecord.h"

/*
* 根据进程名称获得进程ID
*/
DWORD FindProcessPidByName(const wchar_t *ProcessName)
{
	//PROCESSENTRY32结构体，保存进程具体信息
	PROCESSENTRY32 pe32 = { 0 };
	pe32.dwSize = sizeof(pe32);

	//获得系统进程快照的句柄
	HANDLE hProcessSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
	if (hProcessSnap == INVALID_HANDLE_VALUE)
	{
		return 0;
	}
	//首先获得第一个进程
	BOOL bProcess = Process32First(hProcessSnap, &pe32);
	//循环获得所有进程
	while (bProcess)
	{
		if (wcscmp(ProcessName, pe32.szExeFile) == 0)
		{
			return pe32.th32ProcessID;
		}
		bProcess = Process32Next(hProcessSnap, &pe32);
	}
	CloseHandle(hProcessSnap);
	return 0;
}

DWORD GetWechatInstalledPath(WCHAR * InstallLocation) {

	HKEY hKey;
	LONG lRet = 0;

	DWORD dwBuflen = MAX_PATH;

	lRet = RegCreateKeyEx(HKEY_LOCAL_MACHINE, L"SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WeChat", 0, NULL, REG_OPTION_NON_VOLATILE,
		KEY_EXECUTE | KEY_WOW64_64KEY, NULL, &hKey, NULL);

	//下面开始查询
	lRet = RegQueryValueEx(hKey, //打开注册表时返回的句柄
		TEXT("InstallLocation"), //要查询的名称,查询的软件安装目录在这里
		NULL, //一定为NULL或者0
		NULL,
		(LPBYTE)InstallLocation, //我们要的东西放在这里
		&dwBuflen);

	RegCloseKey(hKey);

	return lRet;
}

/*
* 检查进程是否存在指定的dll模块
*/
BOOL CheckProcessDllExists(DWORD dwProcessid, LPCSTR DllName) {
	HANDLE hModuleSnap = INVALID_HANDLE_VALUE;
	//初始化模块信息结构体
	MODULEENTRY32 me32 = { sizeof(MODULEENTRY32) };
	//创建模块快照 1 快照类型 2 进程ID
	hModuleSnap = CreateToolhelp32Snapshot(TH32CS_SNAPMODULE, dwProcessid);
	//如果句柄无效就返回false
	if (hModuleSnap == INVALID_HANDLE_VALUE)
	{
		return false;
	}
	//通过模块快照句柄获取第一个模块的信息
	if (!Module32First(hModuleSnap, &me32))
	{
		//获取失败则关闭句柄
		CloseHandle(hModuleSnap);
		return false;
	}

	//首先获得第一个
	BOOL bModule = Module32First(hModuleSnap, &me32);
	//循环获得所有
	while (bModule)
	{
		if (strcmp(DllName,Wchar_tToString(me32.szModule).c_str()) == 0)
		{
			return true;
		}
		bModule = Module32Next(hModuleSnap, &me32);
	}

	return false;
}


/*
* 进程Dll注入
*/
BOOL ProcessDllInject(DWORD dwProcessid, LPCSTR DllPath, LPCSTR DllName) {
	if (dwProcessid == 0)
	{
		return false;
	}
	if (CheckProcessDllExists(dwProcessid, DllName))
	{
		return false;
	}

	char szPath[MAX_PATH] = { 0 };

	//打开进程
	HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, dwProcessid);
	if (hProcess == NULL)
	{
		return false;
	}

	//在微信进程中申请内存
	LPVOID pAddress = VirtualAllocEx(hProcess, NULL, MAX_PATH, MEM_COMMIT, PAGE_EXECUTE_READWRITE);
	if (pAddress == NULL)
	{
		return false;
	}

	//写入dll路径到微信进程
	LogRecord(L"写入dll路径到微信进程", ofs);
	if (WriteProcessMemory(hProcess, pAddress, szPath, MAX_PATH, NULL) == 0)
	{
		return false;
	}

	//获取LoadLibraryA函数地址
	LogRecord(L"获取LoadLibraryA函数地址", ofs);
	FARPROC pLoadLibraryAddress = GetProcAddress(GetModuleHandleA("kernel32.dll"), "LoadLibraryA");
	if (pLoadLibraryAddress == NULL)
	{
		return false;
	}
	//远程线程注入dll
	LogRecord(L"远程线程注入dl", ofs);
	HANDLE hRemoteThread = CreateRemoteThread(hProcess, NULL, 0, (LPTHREAD_START_ROUTINE)pLoadLibraryAddress, pAddress, 0, NULL);
	if (hRemoteThread == NULL)
	{
		return false;
	}

	/*WaitForSingleObject(hRemoteThread, -1);
	VirtualFreeEx(hProcess, pAddress, 1, MEM_DECOMMIT);*/
	CloseHandle(hRemoteThread);
	CloseHandle(hProcess);

	return true;
}

bool closeAllProcess(const wchar_t *ProcessName)
{
	char debugInfo[0x1000] = { 0 };
	HANDLE ProcesssAll = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, NULL);
	PROCESSENTRY32 proessInfo = { 0 };
	proessInfo.dwSize = sizeof(PROCESSENTRY32);
	do
	{
		if (wcscmp(ProcessName, proessInfo.szExeFile) == 0) {
			HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, false, proessInfo.th32ProcessID);
			if (hProcess != NULL) {
				TerminateProcess(hProcess, 0);
			}
		}
	} while (Process32Next(ProcesssAll, &proessInfo));

	return true;
}

bool closeProcess(DWORD ProcessID)
{
	HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, false, ProcessID);
	if (hProcess != NULL) {
		TerminateProcess(hProcess, 0);
	}
	return true;
}