#pragma once

class WechatOffset
{
public:
	WechatOffset();
	~WechatOffset();
	DWORD offsetReciveMessage; //接收消息
	DWORD offsetReciveMessageParam; //接收消息的参数
	DWORD offsetReciveMessageParam_MsgType; //消息类型
	DWORD offsetReciveMessageParam_MsgSourceType; //消息来源类型
	DWORD offsetReciveMessageParam_MsgReciver;  //消息的接收者
	DWORD offsetReciveMessageParam_MsgContent; //消息主体
	DWORD offsetReciveMessageParam_MsgSender; //消息的发送者

	DWORD offsetLoginInfoBlock; //登录用户信息块起始
	DWORD offsetLoginInfoBlock_WxId; // 微信ID
	DWORD offsetLoginInfoBlock_NickName; //昵称
	DWORD offsetLoginInfoBlock_Email; //邮箱
	DWORD offsetLoginInfoBlock_Mobile; //手机号码
	DWORD offsetLoginInfoBlock_Sex; //性别
	DWORD offsetLoginInfoBlock_IsLogin; //登录标志位
	DWORD offsetLoginInfoBlock_Province; //省份
	DWORD offsetLoginInfoBlock_City; //城市
	DWORD offsetLoginInfoBlock_Signer; //个性签名
	DWORD offsetLoginInfoBlock_WechatName; //微信名
	DWORD offsetLoginInfoBlock_Country; // 国家
	DWORD offsetLoginInfoBlock_Avatar; // 头像
	DWORD offsetLoginInfoBlock_Device; // 登陆设备

	DWORD offsetAntiRevoke; //消息撤回hook

	DWORD offsetGetFriendListCall; //好友列表
	DWORD offsetGetFriendList; //好友列表
};
