#include "WCProcess.h"
#include <nan.h>
#include <TlHelp32.h>


/*
* 获取文件的版本信息
*/
std::string GetFileVersion(LPCSTR filename)
{
	std::string asVer = "";
	VS_FIXEDFILEINFO *pVsInfo;
	unsigned int iFileInfoSize = sizeof(VS_FIXEDFILEINFO);
	int iVerInfoSize = GetFileVersionInfoSizeA(filename, NULL);
	if (iVerInfoSize != 0)
	{
		char *pBuf = NULL;

		while (!pBuf)
		{
			pBuf = new char[iVerInfoSize];
		}
		if (GetFileVersionInfoA(filename, 0, iVerInfoSize, pBuf))
		{
			if (VerQueryValueA(pBuf, "\\", (void **)&pVsInfo, &iFileInfoSize))
			{
				sprintf(pBuf, "%d.%d.%d.%d", HIWORD(pVsInfo->dwFileVersionMS), LOWORD(pVsInfo->dwFileVersionMS), HIWORD(pVsInfo->dwFileVersionLS), LOWORD(pVsInfo->dwFileVersionLS));
				asVer = pBuf;
			}
		}
		delete pBuf;
	}
	return asVer;
}

/*
* 检查指定进程名称是否存在
*/
BOOL CheckProcessExists(LPCSTR ProcessName) {
	//PROCESSENTRY32结构体，保存进程具体信息
	PROCESSENTRY32 pe32 = { 0 };
	pe32.dwSize = sizeof(pe32);

	//获得系统进程快照的句柄
	HANDLE hProcessSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
	if (hProcessSnap == INVALID_HANDLE_VALUE)
	{
		return false;
	}
	//首先获得第一个进程
	BOOL bProcess = Process32First(hProcessSnap, &pe32);
	//循环获得所有进程
	while (bProcess)
	{
		if (strcmp(ProcessName, pe32.szExeFile) == 0)
		{
			return true;
		}
		bProcess = Process32Next(hProcessSnap, &pe32);
	}
	CloseHandle(hProcessSnap);
	return false;
}
/*
* 根据进程名称获得进程ID
*/
DWORD FindProcessPidByName(LPCSTR ProcessName)
{
	//PROCESSENTRY32结构体，保存进程具体信息
	PROCESSENTRY32 pe32 = { 0 };
	pe32.dwSize = sizeof(pe32);

	//获得系统进程快照的句柄
	HANDLE hProcessSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
	if (hProcessSnap == INVALID_HANDLE_VALUE)
	{
		printf("CreateToolhelp32Snapshot error.\n");
		return 0;
	}
	//首先获得第一个进程
	BOOL bProcess = Process32First(hProcessSnap, &pe32);
	//循环获得所有进程
	while (bProcess)
	{
		//打印进程名和进程ID
		//printf("%d --- %s\n", pe32.th32ProcessID, pe32.szExeFile);
		if (strcmp(ProcessName, pe32.szExeFile) == 0)
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
BOOL CheckProcessDllExists(DWORD dwProcessid, LPCSTR DllName) {
	HANDLE hModuleSnap = INVALID_HANDLE_VALUE;
	//初始化模块信息结构体
	MODULEENTRY32 me32 = { sizeof(MODULEENTRY32) };
	//创建模块快照 1 快照类型 2 进程ID
	hModuleSnap = CreateToolhelp32Snapshot(TH32CS_SNAPMODULE, dwProcessid);
	//如果句柄无效就返回false
	if (hModuleSnap == INVALID_HANDLE_VALUE)
	{
		Nan::ThrowError("创建模块快照失败");
		return false;
	}
	//通过模块快照句柄获取第一个模块的信息
	if (!Module32First(hModuleSnap, &me32))
	{
		Nan::ThrowError("获取第一个模块的信息失败");
		//获取失败则关闭句柄
		CloseHandle(hModuleSnap);
		return false;
	}

	//首先获得第一个
	BOOL bModule = Module32First(hModuleSnap, &me32);
	//循环获得所有
	while (bModule)
	{
		//printf("%s\n", me32.szModule);
		if (strcmp(DllName, me32.szModule) == 0)
		{
			return true;
		}
		bModule = Module32Next(hModuleSnap, &me32);
	}

	return false;
}


/*
* 根据进程名称及模块名称获得dll模块基地址
*/
LPVOID FindDllAddressByProcssIdAndDllName(DWORD dwProcessid, LPCSTR DllName) {
	HANDLE hModuleSnap = INVALID_HANDLE_VALUE;
	//初始化模块信息结构体
	MODULEENTRY32 me32 = { sizeof(MODULEENTRY32) };
	//创建模块快照 1 快照类型 2 进程ID
	hModuleSnap = CreateToolhelp32Snapshot(TH32CS_SNAPMODULE, dwProcessid);
	//如果句柄无效就返回false
	if (hModuleSnap == INVALID_HANDLE_VALUE)
	{
		Nan::ThrowError("创建模块快照失败");
		return NULL;
	}
	//通过模块快照句柄获取第一个模块的信息
	if (!Module32First(hModuleSnap, &me32))
	{
		Nan::ThrowError("获取第一个模块的信息失败");
		//获取失败则关闭句柄
		CloseHandle(hModuleSnap);
		return NULL;
	}

	//首先获得第一个
	BOOL bModule = Module32First(hModuleSnap, &me32);
	//循环获得所有
	while (bModule)
	{
		//printf("%s\n", me32.szModule);
		if (strcmp(DllName, me32.szModule) == 0)
		{
			return me32.modBaseAddr;
		}
		bModule = Module32Next(hModuleSnap, &me32);
	}

	return NULL;
}

/*
* 进程Dll注入
*/
BOOL ProcessDllInject(DWORD dwProcessid, LPCSTR DllPath, LPCSTR DllName) {
	if (dwProcessid == 0)
	{
		Nan::ThrowError("无法找到指定的进程名称\n");
		return false;
	}
	if (CheckProcessDllExists(dwProcessid, DllName))
	{
		Nan::ThrowError("进程已被注入，请勿重复注入\n");
		return false;
	}

	char szPath[MAX_PATH] = { 0 };

	sprintf_s(szPath, "%s\\%s", DllPath, DllName);

	printf("准备注入: %s\n", szPath);

	//打开进程
	printf("打开进程\n");
	HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, dwProcessid);
	if (hProcess == NULL)
	{
		Nan::ThrowError("进程打开失败");
		return false;
	}

	//在微信进程中申请内存
	printf("在微信进程中申请内存\n");
	LPVOID pAddress = VirtualAllocEx(hProcess, NULL, MAX_PATH, MEM_COMMIT, PAGE_EXECUTE_READWRITE);
	if (pAddress == NULL)
	{
		Nan::ThrowError("内存分配失败");
		return false;
	}

	//写入dll路径到微信进程
	printf("写入dll路径到微信进程\n");
	if (WriteProcessMemory(hProcess, pAddress, szPath, MAX_PATH, NULL) == 0)
	{
		Nan::ThrowError("路径写入失败");
		return false;
	}

	//获取LoadLibraryA函数地址
	printf("获取LoadLibraryA函数地址\n");
	FARPROC pLoadLibraryAddress = GetProcAddress(GetModuleHandleA("kernel32.dll"), "LoadLibraryA");
	if (pLoadLibraryAddress == NULL)
	{
		Nan::ThrowError("获取LoadLibraryA函数地址失败");
		return false;
	}
	//远程线程注入dll
	printf("远程线程注入dll\n");
	HANDLE hRemoteThread = CreateRemoteThread(hProcess, NULL, 0, (LPTHREAD_START_ROUTINE)pLoadLibraryAddress, pAddress, 0, NULL);
	if (hRemoteThread == NULL)
	{
		Nan::ThrowError("创建远程线程失败");
		return false;
	}

	/*WaitForSingleObject(hRemoteThread, -1);
	VirtualFreeEx(hProcess, pAddress, 1, MEM_DECOMMIT);*/
	CloseHandle(hRemoteThread);
	CloseHandle(hProcess);

	return true;
}


/*
* 进程Dll卸载
*/
BOOL ProcessDllUninstall(DWORD dwProcessid, LPCSTR DllName) {
	if (dwProcessid == 0)
	{
		Nan::ThrowError("无法找到指定的进程名称\n");
		return false;
	}

	LPVOID dllBaseAdress = FindDllAddressByProcssIdAndDllName(dwProcessid, DllName);
	if (dllBaseAdress == NULL) {
		Nan::ThrowError("进程不存在该Dll模块\n");
		return false;
	}

	printf("准备卸载: %s\n", DllName);

	//打开进程
	printf("打开进程\n");
	HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, dwProcessid);
	if (hProcess == NULL)
	{
		Nan::ThrowError("进程打开失败");
		return false;
	}

	//获取FreeLibrary函数地址
	printf("获取FreeLibrary函数地址\n");
	FARPROC pFreeLibraryAddress = GetProcAddress(GetModuleHandleA("kernel32.dll"), "FreeLibrary");
	if (pFreeLibraryAddress == NULL)
	{
		Nan::ThrowError("获取FreeLibrary函数地址失败");
		return false;
	}

	//远程线程卸载dll
	printf("远程线程卸载dll\n");
	HANDLE hRemoteThread = CreateRemoteThread(hProcess, NULL, 0, (LPTHREAD_START_ROUTINE)pFreeLibraryAddress, dllBaseAdress, 0, NULL);
	if (hRemoteThread == NULL)
	{
		Nan::ThrowError("创建远程线程失败");
		return false;
	}

	WaitForSingleObject(hRemoteThread, INFINITE);
	CloseHandle(hRemoteThread);
	CloseHandle(hProcess);

	return true;
}