#pragma once

void InitWindow(HMODULE hModule);
void RegisterWindow(HMODULE hModule);
void CheckIsLogin();
LRESULT CALLBACK WndProc(HWND hWnd, UINT Message, WPARAM wParam, LPARAM lParam);
