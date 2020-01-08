#include "stdafx.h"
#include "WechatOffset27278.h"


WechatOffset27278::WechatOffset27278()
{
	offsetReciveMessage = 0x34E238 - 5;
	offsetReciveMessageParam = 0x16268B0;
	offsetReciveMessageParam_MsgType = 0x30;
	offsetReciveMessageParam_MsgSourceType = 0x34;
	offsetReciveMessageParam_MsgReciver = 0x40;
	offsetReciveMessageParam_MsgContent = 0x68;
	offsetReciveMessageParam_MsgSender = 0x118;

	offsetLoginInfoBlock = 0x160F2C8;
	offsetLoginInfoBlock_WxId = 0x3CC;
	offsetLoginInfoBlock_NickName = 0x444;
	offsetLoginInfoBlock_Email = 0x460;
	offsetLoginInfoBlock_Mobile = 0x478;
	offsetLoginInfoBlock_IsLogin = 0x51C;
	offsetLoginInfoBlock_Sex = 0x52C;
	offsetLoginInfoBlock_Province = 0x530;
	offsetLoginInfoBlock_City = 0x548;
	offsetLoginInfoBlock_Signer = 0x560;
	offsetLoginInfoBlock_WechatName = 0x5A8;
	offsetLoginInfoBlock_Country = 0x620;
	offsetLoginInfoBlock_Avatar = 0x70C;
	offsetLoginInfoBlock_Device = 0x880;
}


WechatOffset27278::~WechatOffset27278()
{
}
