#pragma once
#include <atlbase.h>  
#include <string>

#pragma comment(lib, "version.lib")

/*
* 检查指定进程名称是否存在
*/
BOOL CheckProcessExists(LPCSTR ProcessName);

/*
* 根据进程名称获得进程ID
*/
DWORD FindProcessPidByName(LPCSTR ProcessName);
/*
* 根据进程名称获得进程ID列表
*/
std::vector<DWORD> FindProcessPidListByName(LPCSTR ProcessName);

/*
* 根据进程ID及模块名称获得模块地址
*/
LPVOID FindDllAddressByProcssIdAndDllName(DWORD dwProcessid, LPCSTR DllName);

/*
* 检查进程是否存在指定的dll模块
*/
BOOL CheckProcessDllExists(DWORD dwProcessid, LPCSTR DllName);

/*
* 进程Dll注入
*/
BOOL ProcessDllInject(DWORD dwProcessid, LPCSTR DllPath, LPCSTR DllName);

/*
* 进程Dll卸载
*/
BOOL ProcessDllUninstall(DWORD dwProcessid, LPCSTR DllName);

/*
* 获取文件版本
*/
std::string GetFileVersion(LPCSTR filename);

/*
* 微信进程ID列表
*/
extern std::vector<DWORD> wehcatPids;