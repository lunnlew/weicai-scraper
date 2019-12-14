#pragma once
#include <atlbase.h>  

/*
* 根据进程名称获得进程ID
*/
DWORD FindProcessPidByName(const wchar_t *ProcessName);

/*
* 检查进程是否存在指定的dll模块
*/
BOOL CheckProcessDllExists(DWORD dwProcessid, LPCSTR DllName);