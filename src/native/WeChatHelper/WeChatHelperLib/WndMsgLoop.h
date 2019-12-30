#pragma once

// 导出定义
#define DLLAPI _declspec(dllexport)


extern DWORD isRegisterWnd;
extern LPCWSTR WeChatHelper;
extern HWND hWnd;


void InitWindow(HMODULE hModule);
void RegisterWindow(HMODULE hModule);
void CheckIsLogin();
LRESULT CALLBACK WndProc(HWND hWnd, UINT Message, WPARAM wParam, LPARAM lParam);
void  CALLBACK Do_RegisterWeChatHelper(HWND   hwnd, UINT   uMsg, UINT   idEvent, DWORD   dwTime);
void UnRegisterWeChatHelper();
void RegisterWeChatHelper();