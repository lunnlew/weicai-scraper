#include "stdafx.h"
#include <sstream>
#include "MsgProtocol.h"
#include "HttpRequest.h"
#include "json.hpp"

using json = nlohmann::json;

std::string string_To_UTF8(const std::string & str)
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

void sendWeChatMessage(WeChatMessage *msg)
{
	json o;
	o["content"] = string_To_UTF8(Wchar_tToString(msg->content));
	o["isMoney"] = msg->isMoney;
	o["msgSender"] = string_To_UTF8(Wchar_tToString(msg->msgSender));
	o["source"] = string_To_UTF8(Wchar_tToString(msg->source));
	o["type"] = string_To_UTF8(Wchar_tToString(msg->type));
	o["wxid"] = string_To_UTF8(Wchar_tToString(msg->wxid));
	
	/*std::ostringstream oss;
	std::string c = Wchar_tToString(msg.content);
	replace_str(c, "\"", "\\\"");

	oss << "{\"content\":\""
		<< c
		<< "\",\"type\":\""
		<< Wchar_tToString(msg.type)
		<< "\",\"msgSender\":\""
		<< Wchar_tToString(msg.msgSender)
		<< "\",\"wxid\":\""
		<< Wchar_tToString(msg.wxid)
		<< "\",\"source\":\""
		<< Wchar_tToString(msg.source)
		<< "\",\"isMoney\":\""
		<< msg.isMoney
		<< "\"}";*/
	HttpRequest httpReq("127.0.0.1", 6877);
	std::string res = httpReq.HttpPost("/wechatRobot", o.dump());
}