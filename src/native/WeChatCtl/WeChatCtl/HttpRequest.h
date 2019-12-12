#pragma once
#include <string>
#include <vector>

class HttpRequest
{
public:
	HttpRequest(const std::string& ip, int port);
	~HttpRequest(void);

	// Http GET请求
	std::string HttpGet(std::string req);

	// Http POST请求
	std::string HttpPost(std::string req, std::string data);

	// 合成JSON字符串
	static std::string genJsonString(std::string key, int value);

	// 分割字符串
	static std::vector<std::string> split(const std::string &s, const std::string &seperator);

	// 根据key从Response获取Header中的内容
	static std::string getHeader(std::string respose, std::string key);

private:
	std::string         m_ip;
	int             m_port;
};