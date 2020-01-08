#include "stdafx.h"
#include "WechatOffset27276.h"


WechatOffset27276::WechatOffset27276()
{
	offsetReciveMessage = 0x34DF18 - 5;
	offsetReciveMessageParam = 0x1624908;
	offsetReciveMessageParam_MsgType = 0x30;
	offsetReciveMessageParam_MsgSourceType = 0x34;
	offsetReciveMessageParam_MsgReciver = 0x40;
	offsetReciveMessageParam_MsgContent = 0x68;
	offsetReciveMessageParam_MsgSender = 0x118;
}


WechatOffset27276::~WechatOffset27276()
{
}
