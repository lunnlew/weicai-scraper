#pragma once

void InitWindow(HMODULE hModule);
void RegisterWindow(HMODULE hModule);
void CheckIsLogin();
void GotoQrCode();
LRESULT CALLBACK WndProc(HWND hWnd, UINT Message, WPARAM wParam, LPARAM lParam);
void HookChatRecord();		//HOOK聊天记录
void RecieveWxMesage();		//接收微信消息
void SendWxMessage();		//发送微信消息到客户端