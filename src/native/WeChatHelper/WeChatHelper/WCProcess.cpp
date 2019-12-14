#include "stdafx.h"
#include <tlhelp32.h>

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

/*
* 检查进程是否存在指定的dll模块
*/
BOOL CheckProcessDllExists(DWORD dwProcessid, const wchar_t * DllName) {
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
		if (wcscmp(DllName, me32.szModule) == 0)
		{
			return true;
		}
		bModule = Module32Next(hModuleSnap, &me32);
	}

	return false;
}