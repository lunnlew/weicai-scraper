#include "stdafx.h"
#include <sstream>
#include "MsgProtocol.h"
#include "StringTool.h"
#include "HttpRequest.h"
#include "json.hpp"

using json = nlohmann::json;


std::string ListToString(std::vector<std::string> list) {
	std::stringstream ss;

	std::copy(list.begin(), list.end(), std::ostream_iterator<std::string>(ss, ";"));

	return ss.str();
}

std::string HelperListToString(std::vector<struct WeChatHookReg> list) {
	std::string res;
	for (std::vector<struct WeChatHookReg>::iterator it = list.begin(); it != list.end();)
	{
		res += std::to_string(it->pProcessId);
		res += ":";
		res += Wchar_tToString(it->WeChatHelperName);
		res += ";";
		++it;
	}
	res += '\0';
	return res;
}

void sendWeChatMessage(WeChatMessage *msg)
{
	json o;
	o["content"] = stringToUTF8(Wchar_tToString(msg->content));
	o["msgSender"] = stringToUTF8(Wchar_tToString(msg->msgSender));
	o["msgReciver"] = stringToUTF8(Wchar_tToString(msg->msgReciver));
	o["type"] = msg->type;
	o["typeStr"] = stringToUTF8(Wchar_tToString(msg->typeStr));
	o["sourceType"] = msg->sourceType;
	o["sourceTypeStr"] = stringToUTF8(Wchar_tToString(msg->sourceTypeStr));
	HttpRequest httpReq("127.0.0.1", 6877);
	std::string res = httpReq.HttpPost("/wechatRobot", o.dump());
}