#include "stdafx.h"
#include "WechatOffset26852.h"


WechatOffset26852::WechatOffset26852()
{
	offsetReciveMessage = 0x315E98 - 5;
	offsetReciveMessageParam = 0x126D7F8;
	offsetReciveMessageParam_MsgType = 0x30;
	offsetReciveMessageParam_MsgSourceType = 0x34;
	offsetReciveMessageParam_MsgReciver = 0x40;
	offsetReciveMessageParam_MsgContent = 0x68;
	offsetReciveMessageParam_MsgSender = 0x114;

	offsetLoginInfoBlock = 0x0;
	offsetLoginInfoBlock_WxId = 0x0;
	offsetLoginInfoBlock_NickName = 0x0;
	offsetLoginInfoBlock_Email = 0x0;
	offsetLoginInfoBlock_Mobile = 0x0;
	offsetLoginInfoBlock_Sex = 0x0;
	offsetLoginInfoBlock_IsLogin = 0x0;
	offsetLoginInfoBlock_Province = 0x0;
	offsetLoginInfoBlock_City = 0x0;
	offsetLoginInfoBlock_Signer = 0x0;
	offsetLoginInfoBlock_WechatName = 0x0;
	offsetLoginInfoBlock_Country = 0x0;
	offsetLoginInfoBlock_Avatar = 0x0;
	offsetLoginInfoBlock_Device = 0x0;
}


WechatOffset26852::~WechatOffset26852()
{
}
