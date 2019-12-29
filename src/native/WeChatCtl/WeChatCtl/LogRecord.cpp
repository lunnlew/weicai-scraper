
#include "stdafx.h"
#include "LogRecord.h"

std::ofstream ofs;

DLLAPI BOOL LogRecord(const TCHAR* fmt, std::ofstream& oFile, ...)
{

	static const int nBufflen = 500;

	TCHAR strDebugOut[2 * nBufflen] = { 0 };

	TCHAR strWFmt[nBufflen] = { 0 };

	TCHAR strWsysinfor[nBufflen] = { 0 };

	char strSysinfor[nBufflen] = { 0 };

	sprintf_s(strSysinfor, nBufflen, "%s-%s INFO:", __DATE__, __TIME__);

	//char字符转换为wchar,strWsysinfor

	MultiByteToWideChar(CP_ACP, 0, strSysinfor, nBufflen, strWsysinfor, sizeof(strWsysinfor));

	wcscat_s(strDebugOut, 2 * nBufflen, strWsysinfor);

	wcscat_s(strDebugOut, 2 * nBufflen, fmt);
	wcscat_s(strDebugOut, 2 * nBufflen, L"\n");

	OutputDebugString(strDebugOut);

	LogFileCreate(oFile);

	char strOut[2 * nBufflen] = { 0 };

	WideCharToMultiByte(CP_ACP, 0, strDebugOut, sizeof(strDebugOut), strOut, sizeof(strOut), 0, 0);

	if (oFile.is_open())

	{

		oFile << strOut;

	}

	oFile.close();

	return TRUE;

}

BOOL LogFileCreate(std::ofstream& oFile)

{

	//创建文件名

	SYSTEMTIME sys;

	char strFileName[34] = { 0 };

	GetLocalTime(&sys);

	sprintf_s(strFileName, sizeof(strFileName), "\\%d-%d-%d", sys.wYear, sys.wMonth, sys.wDay);

	strcat_s(strFileName, sizeof(strFileName), ".txt");

	//判断当前LogFile文件夹是否存在。

	TCHAR exeFullPath[MAX_PATH] = { 0 };

	GetCurrentDirectory(MAX_PATH, exeFullPath);

	char strFilePath[MAX_PATH] = { 0 };

	WideCharToMultiByte(CP_ACP, 0, exeFullPath, MAX_PATH, strFilePath, MAX_PATH, 0, 0);

	strcat_s(strFilePath, sizeof(strFilePath), "\\LogFile");

	MultiByteToWideChar(CP_ACP, 0, strFilePath, sizeof(strFilePath), exeFullPath, MAX_PATH);

	CreateDirectory(exeFullPath, NULL);

	strcat_s(strFilePath, sizeof(strFilePath), strFileName);

	oFile.open(strFilePath, std::ofstream::out | std::ofstream::app);

	if (oFile.bad())

	{

		return FALSE;

	}

	return TRUE;

}

char* TCHAR2char(const TCHAR* STR)

{

	//返回字符串的长度

	int size = WideCharToMultiByte(CP_ACP, 0, STR, -1, NULL, 0, NULL, FALSE);

	//申请一个多字节的字符串变量

	char* str = new char[sizeof(char) * size];

	//将STR转成str

	WideCharToMultiByte(CP_ACP, 0, STR, -1, str, size, NULL, FALSE);

	return str;

}

TCHAR* char2TCAHR(const char* str)

{

	int size = MultiByteToWideChar(CP_ACP, 0, str, -1, NULL, 0);

	TCHAR* retStr = new TCHAR[size * sizeof(TCHAR)];

	MultiByteToWideChar(CP_ACP, 0, str, -1, retStr, size);

	return retStr;

}