#include <nan.h>

#include <node.h> 
#include <v8.h> 
#include <iostream> 

#include <TlHelp32.h>

using namespace v8;
using namespace std;


DWORD ProcessNameFindPID(LPCSTR ProcessName)
{
	//PROCESSENTRY32结构体，保存进程具体信息
	PROCESSENTRY32 pe32 = { 0 };
	pe32.dwSize = sizeof(pe32);

	//获得系统进程快照的句柄
	HANDLE hProcessSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
	if (hProcessSnap == INVALID_HANDLE_VALUE)
	{
		printf("CreateToolhelp32Snapshot error.\n");
		return 0;
	}
	//首先获得第一个进程
	BOOL bProcess = Process32First(hProcessSnap, &pe32);
	//循环获得所有进程
	while (bProcess)
	{
		//打印进程名和进程ID
		//printf("%d --- %s\n", pe32.th32ProcessID, pe32.szExeFile);
		if (strcmp(ProcessName, pe32.szExeFile) == 0)
		{
			return pe32.th32ProcessID;
		}
		bProcess = Process32Next(hProcessSnap, &pe32);
	}
	CloseHandle(hProcessSnap);
	return 0;
}

void IsExistProgress(const Nan::FunctionCallbackInfo<v8::Value>& info) {
	if(info.Length()!=1) {
    	Nan::ThrowTypeError("必须且仅支持一个参数\n");
    	return;
  	}
	if (!info[0]->IsString()) {
		Nan::ThrowTypeError("参数必须是字符串类型");
		return;
	}
	Local<String> str = Local<String>::Cast(info[0]);
	String::Utf8Value utfValue(str);
	DWORD dwPid = ProcessNameFindPID((LPCSTR)string(*utfValue).c_str());
	info.GetReturnValue().Set(Nan::New((bool)dwPid));
}

void Init(v8::Local<v8::Object> exports) {
	v8::Local<v8::Context> context = exports->CreationContext();

	exports->Set(context,
		Nan::New("IsExistProgress").ToLocalChecked(),
		Nan::New<v8::FunctionTemplate>(IsExistProgress)
		->GetFunction(context)
		.ToLocalChecked());
}

NODE_MODULE(weicaiNative, Init)