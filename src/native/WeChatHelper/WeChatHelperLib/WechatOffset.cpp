#include "stdafx.h"
#include "WechatOffset.h"

WechatOffset::WechatOffset()
{
	offsetReciveMessage = 0;
	offsetReciveMessage = 0;
	offsetReciveMessageParam = 0;
	offsetReciveMessageParam_MsgType = 0;
	offsetReciveMessageParam_MsgSourceType = 0;
	offsetReciveMessageParam_MsgReciver = 0;
	offsetReciveMessageParam_MsgContent = 0;
	offsetReciveMessageParam_MsgSender = 0;

	offsetLoginInfoBlock = 0;
	offsetLoginInfoBlock_WxId = 0;
	offsetLoginInfoBlock_NickName = 0;
	offsetLoginInfoBlock_Email = 0;
	offsetLoginInfoBlock_Mobile = 0;
	offsetLoginInfoBlock_Sex = 0;
	offsetLoginInfoBlock_IsLogin = 0;
	offsetLoginInfoBlock_Province = 0;
	offsetLoginInfoBlock_City = 0;
	offsetLoginInfoBlock_Signer = 0;
	offsetLoginInfoBlock_WechatName = 0;
	offsetLoginInfoBlock_Country = 0;
	offsetLoginInfoBlock_Avatar = 0;
	offsetLoginInfoBlock_Device = 0;

	offsetAntiRevoke = 0;

	offsetGetFriendList = 0;
	offsetGetFriendListCall = 0;
}


WechatOffset::~WechatOffset()
{
}
