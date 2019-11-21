param($Proxy)
$scriptLocation = $PSScriptRoot

Write-Host "will invoke cmd: $scriptLocation\SetSystemProxy.ps1 -Proxy $Proxy"

$proxyReg = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings";

if ($Proxy -eq $null) {
    Set-ItemProperty -Path $proxyReg -Name ProxyEnable -Value 0;
}else{
	Set-ItemProperty -Path $proxyReg -Name ProxyServer -Value $Proxy;
	Set-ItemProperty -Path $proxyReg -Name ProxyEnable -Value 1;
}

Write-Host "invoke cmd completed"
