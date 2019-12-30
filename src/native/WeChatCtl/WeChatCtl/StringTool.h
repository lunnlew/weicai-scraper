#pragma once

#include "stdafx.h"
#include <string>

void TcharToChar(const TCHAR * tchar, char * _char);
void CharToTchar(const char * _char, TCHAR * tchar);
char* TcharToChar(const TCHAR* STR);
TCHAR* CharToTchar(const char* str);
std::string LPCWSTRtoString(LPCWSTR wString);
LPCWSTR StringToLPCWSTR(std::string String);
void replace_str(std::string& str, const std::string& before, const std::string& after);
std::string Wchar_tToString(wchar_t *wchar);
std::string stringToUTF8(const std::string & str);