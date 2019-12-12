#pragma once
// call hook 偏移地址定义

#define offset_ReciveMessage 0x315E98			//接收消息
#define offset_ReciveMessageParam 0x126D7F8		//接收消息的参数

#define offset_LoginSign 0x126D860		//登陆标志位

#define offset_QrCode 0x1F110B			//二维码
#define offset_QrCodeContect 0x127F618	//二维码内容

#define offset_GoToQrCode1 0x1EEE30			//跳转到二维码
#define offset_GoToQrCode2 0x2E3070			//跳转到二维码

#define offset_WxAntiRevoke 0x312565			//防撤回