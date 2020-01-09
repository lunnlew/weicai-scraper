#include "stdafx.h"
#include "WechatOffset208111.h"


WechatOffset208111::WechatOffset208111()
{
	offsetReciveMessage = 0x3528C8 - 5;
	offsetReciveMessageParam = 0x162DA10;
	offsetReciveMessageParam_MsgType = 0x30;
	offsetReciveMessageParam_MsgSourceType = 0x34;
	offsetReciveMessageParam_MsgReciver = 0x40;
	offsetReciveMessageParam_MsgContent = 0x68;
	offsetReciveMessageParam_MsgSender = 0x118;

	offsetLoginInfoBlock = 0x1618388;
	offsetLoginInfoBlock_WxId = 0x3CC;
	offsetLoginInfoBlock_NickName = 0x444;
	offsetLoginInfoBlock_Email = 0x460;
	offsetLoginInfoBlock_Mobile = 0x478;
	offsetLoginInfoBlock_Sex = 0x524;
	offsetLoginInfoBlock_IsLogin = 0x51C;
	offsetLoginInfoBlock_Province = 0x530;
	offsetLoginInfoBlock_City = 0x548;
	offsetLoginInfoBlock_Signer = 0x560;
	offsetLoginInfoBlock_WechatName = 0x5A8;
	offsetLoginInfoBlock_Country = 0x620;
	offsetLoginInfoBlock_Avatar = 0x70C;
	offsetLoginInfoBlock_Device = 0x880;

	offsetAntiRevoke = 0x34EEC2;
}


WechatOffset208111::~WechatOffset208111()
{
}
