#include "stdafx.h"
#include <string>
#include <vector>
#include <iostream>
#include <sstream>
#include <iterator>



std::string stringToUTF8(const std::string & str)
{
	int nwLen = ::MultiByteToWideChar(CP_ACP, 0, str.c_str(), -1, NULL, 0);

	wchar_t * pwBuf = new wchar_t[nwLen + 1];//一定要加1，不然会出现尾巴 
	ZeroMemory(pwBuf, nwLen * 2 + 2);

	::MultiByteToWideChar(CP_ACP, 0, str.c_str(), str.length(), pwBuf, nwLen);

	int nLen = ::WideCharToMultiByte(CP_UTF8, 0, pwBuf, -1, NULL, NULL, NULL, NULL);

	char * pBuf = new char[nLen + 1];
	ZeroMemory(pBuf, nLen + 1);

	::WideCharToMultiByte(CP_UTF8, 0, pwBuf, nwLen, pBuf, nLen, NULL, NULL);

	std::string retStr(pBuf);

	delete[]pwBuf;
	delete[]pBuf;

	pwBuf = NULL;
	pBuf = NULL;

	return retStr;
}

//wchar_t转string
std::string Wchar_tToString(wchar_t *wchar)
{
	std::string szDst;
	wchar_t * wText = wchar;
	DWORD dwNum = WideCharToMultiByte(CP_OEMCP, NULL, wText, -1, NULL, 0, NULL, FALSE);// WideCharToMultiByte的运用
	char *psText; // psText为char*的临时数组，作为赋值给std::string的中间变量
	psText = new char[dwNum];
	WideCharToMultiByte(CP_OEMCP, NULL, wText, -1, psText, dwNum, NULL, FALSE);// WideCharToMultiByte的再次运用
	szDst = psText;// std::string赋值
	delete[]psText;// psText的清除
	return szDst;
}


void replace_str(std::string& str, const std::string& before, const std::string& after)
{
	for (std::string::size_type pos(0); pos != std::string::npos; pos += after.length())
	{
		pos = str.find(before, pos);
		if (pos != std::string::npos)
			str.replace(pos, before.length(), after);
		else
			break;
	}
}

LPCWSTR StringToLPCWSTR(std::string orig)
{
	size_t origsize = orig.length() + 1;
	size_t convertedChars = 0;
	wchar_t *wcstring = (wchar_t *)malloc(sizeof(wchar_t)*(orig.length() - 1));
	mbstowcs_s(&convertedChars, wcstring, origsize, orig.c_str(), _TRUNCATE);

	return wcstring;
}

std::string LPCWSTRtoString(LPCWSTR lpcwszStr)
{
	std::string str;
	DWORD dwMinSize = 0;
	LPSTR lpszStr = NULL;
	dwMinSize = WideCharToMultiByte(CP_OEMCP, NULL, lpcwszStr, -1, NULL, 0, NULL, FALSE);
	if (0 == dwMinSize)
	{
		return FALSE;
	}
	lpszStr = new char[dwMinSize];
	WideCharToMultiByte(CP_OEMCP, NULL, lpcwszStr, -1, lpszStr, dwMinSize, NULL, FALSE);
	str = lpszStr;
	delete[] lpszStr;
	return str;
}
void TcharToChar(const TCHAR * tchar, char * _char)
{
	int iLength;
	//获取字节长度   
	iLength = WideCharToMultiByte(CP_ACP, 0, tchar, -1, NULL, 0, NULL, NULL);
	//将tchar值赋给_char    
	WideCharToMultiByte(CP_ACP, 0, tchar, -1, _char, iLength, NULL, NULL);
}
void CharToTchar(const char * _char, TCHAR * tchar)
{
	int iLength;
	iLength = MultiByteToWideChar(CP_ACP, 0, _char, strlen(_char) + 1, NULL, 0);
	MultiByteToWideChar(CP_ACP, 0, _char, strlen(_char) + 1, tchar, iLength);
}

char* TcharToChar(const TCHAR* STR)

{

	//返回字符串的长度

	int size = WideCharToMultiByte(CP_ACP, 0, STR, -1, NULL, 0, NULL, FALSE);

	//申请一个多字节的字符串变量

	char* str = new char[sizeof(char) * size];

	//将STR转成str

	WideCharToMultiByte(CP_ACP, 0, STR, -1, str, size, NULL, FALSE);

	return str;

}



TCHAR* CharToTchar(const char* str)

{

	int size = MultiByteToWideChar(CP_ACP, 0, str, -1, NULL, 0);

	TCHAR* retStr = new TCHAR[size * sizeof(TCHAR)];

	MultiByteToWideChar(CP_ACP, 0, str, -1, retStr, size);

	return retStr;

}

std::string ListToString(std::vector<std::string> list){
	std::stringstream ss;

	std::copy(list.begin(), list.end(), std::ostream_iterator<std::string>(ss, ";"));

	return ss.str();
}