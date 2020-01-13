#pragma once

// 导出定义
#define DLLAPI _declspec(dllexport)


extern DWORD isRegisterWnd;
extern LPCWSTR WeChatHelper;
extern HWND hWnd;
extern HMODULE dlModule;
extern HANDLE hThread;
extern DWORD checkFailNum;
extern DWORD pProcessId;


void InitWindow(HMODULE hModule);
void UnloadProc(HMODULE hModule);
void RegisterWindow(HMODULE hModule);
LRESULT CALLBACK WndProc(HWND hWnd, UINT Message, WPARAM wParam, LPARAM lParam);
void  CALLBACK Do_RegisterWeChatHelper(HWND   hwnd, UINT   uMsg, UINT   idEvent, DWORD   dwTime);
void  CALLBACK Do_CheckWeChatCtrl(HWND   hwnd, UINT   uMsg, UINT   idEvent, DWORD   dwTime);
void UnRegisterWeChatHelper();
void RegisterWeChatHelper();