#include "stdafx.h"
#include "WechatOffset28088.h"


WechatOffset28088::WechatOffset28088()
{
	offsetReciveMessage = 0x350878 - 5;
	offsetReciveMessageParam = 0x16288F8;
	offsetReciveMessageParam_MsgType = 0x30;
	offsetReciveMessageParam_MsgSourceType = 0x34;
	offsetReciveMessageParam_MsgReciver = 0x40;
	offsetReciveMessageParam_MsgContent = 0x68;
	offsetReciveMessageParam_MsgSender = 0x118;

	offsetLoginInfoBlock = 0x1611300;
	offsetLoginInfoBlock_WxId = 0x3D4;
	offsetLoginInfoBlock_NickName = 0x44C;
	offsetLoginInfoBlock_Email = 0x468;
	offsetLoginInfoBlock_Mobile = 0x480;
	offsetLoginInfoBlock_Sex = 0x534;
	offsetLoginInfoBlock_IsLogin = 0x53C;
	offsetLoginInfoBlock_Province = 0x538;
	offsetLoginInfoBlock_City = 0x550;
	offsetLoginInfoBlock_Signer = 0x568;
	offsetLoginInfoBlock_WechatName = 0x5B0;
	offsetLoginInfoBlock_Country = 0x628;
	offsetLoginInfoBlock_Avatar = 0x714;
	offsetLoginInfoBlock_Device = 0x888;
}


WechatOffset28088::~WechatOffset28088()
{
}
