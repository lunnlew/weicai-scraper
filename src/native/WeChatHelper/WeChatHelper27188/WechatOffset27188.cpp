#include "stdafx.h"
#include "WechatOffset27188.h"


WechatOffset27188::WechatOffset27188()
{
	offsetReciveMessage = 0x325373;
	offsetReciveMessageParam = 0x13971B8;
	offsetReciveMessageParam_MsgType = 0x30;
	offsetReciveMessageParam_MsgSourceType = 0x34;
	offsetReciveMessageParam_MsgReciver = 0x40;
	offsetReciveMessageParam_MsgContent = 0x68;
	offsetReciveMessageParam_MsgSender = 0x114;

	offsetLoginInfoBlock = 0x1396E38;
	offsetLoginInfoBlock_WxId = 0x42C;
	offsetLoginInfoBlock_NickName = 0x4A4;
	offsetLoginInfoBlock_Email = 0x4C0;
	offsetLoginInfoBlock_Mobile = 0x4D8;
	offsetLoginInfoBlock_Sex = 0x574;
	offsetLoginInfoBlock_IsLogin = 0x57C;
	offsetLoginInfoBlock_Province = 0x590;
	offsetLoginInfoBlock_City = 0x5A8;
	offsetLoginInfoBlock_Signer = 0x5c0;
	offsetLoginInfoBlock_WechatName = 0x608;
	offsetLoginInfoBlock_Country = 0x680;
	offsetLoginInfoBlock_Avatar = 0x76C;
	offsetLoginInfoBlock_Device = 0x8E0;
}


WechatOffset27188::~WechatOffset27188()
{
}
