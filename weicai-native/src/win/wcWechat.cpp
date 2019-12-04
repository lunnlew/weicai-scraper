#include "wcWechat.h"
#include <TlHelp32.h>

DWORD ProcessNameFindPID(LPCSTR ProcessName)
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