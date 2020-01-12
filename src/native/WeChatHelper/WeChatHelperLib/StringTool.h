#pragma once

#include "stdafx.h"
#include <string>
#include <vector>

void TcharToChar(const TCHAR * tchar, char * _char);
void CharToTchar(const char * _char, TCHAR * tchar);
char* TcharToChar(const TCHAR* STR);
TCHAR* CharToTchar(const char* str);
std::string LPCWSTRtoString(LPCWSTR wString);
LPCWSTR StringToLPCWSTR(std::string String);
void replace_str(std::string& str, const std::string& before, const std::string& after);
std::string Wchar_tToString(wchar_t *wchar);
wchar_t * StringToWchar_t(const std::string & str);
std::string stringToUTF8(const std::string & str);
wchar_t * UTF8ToUnicode(const char* str);
std::string ListToString(std::vector<std::string> list);
bool endWith(const std::string &str, const std::string &tail);
bool startWith(const std::string &str, const std::string &head);
wchar_t* pToTchar(DWORD addr, DWORD &len);
std::wstring GetMsgByAddress(DWORD addr, DWORD &len);