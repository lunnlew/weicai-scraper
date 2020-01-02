#pragma once

void InitWindow(HMODULE hModule);
void RegisterWindow(HMODULE hModule);
LRESULT CALLBACK WndProc(HWND hWnd, UINT Message, WPARAM wParam, LPARAM lParam);
int WXOpenWechat();