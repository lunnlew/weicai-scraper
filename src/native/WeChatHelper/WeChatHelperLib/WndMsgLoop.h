#pragma once

// 导出定义
#define DLLAPI _declspec(dllexport)


extern DWORD isRegisterWnd;
extern LPCWSTR WeChatHelper;


void InitWindow(HMODULE hModule);
void RegisterWindow(HMODULE hModule);
void CheckIsLogin();
LRESULT CALLBACK WndProc(HWND hWnd, UINT Message, WPARAM wParam, LPARAM lParam);
void  CALLBACK RegisterWnd(HWND   hwnd, UINT   uMsg, UINT   idEvent, DWORD   dwTime);