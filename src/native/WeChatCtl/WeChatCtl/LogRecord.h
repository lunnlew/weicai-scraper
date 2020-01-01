#pragma once

#include <fstream>
#include <iostream>
#include <string>

extern std::ofstream ofs;

DLLAPI BOOL LogRecord(const TCHAR* fmt, std::ofstream& oFile, ...);
BOOL LogFileCreate(std::ofstream& oFile);