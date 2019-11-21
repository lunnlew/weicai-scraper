param($CaPath, $Act, $Proxy)
$scriptLocation = $PSScriptRoot

If ($Act -eq "trustRootCA") {

	Write-Host "will invoke cmd: $scriptLocation\ImportCaCerts.ps1 -CaPath $CaPath"
	If (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
		$powershellArguments = "-file $scriptLocation\ImportCaCerts.ps1","-CaPath $CaPath"
		Start-Process powershell -Verb runAs -ArgumentList $powershellArguments -WindowStyle Hidden
	} else {
		invoke-expression -Command "$scriptLocation\ImportCaCerts.ps1 -CaPath $CaPath"
	}

} elseif ($Act -eq "removeRootCA") {
	
	Write-Host "will invoke cmd: $scriptLocation\removeCaCerts.ps1"
	If (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
		$powershellArguments = "-file $scriptLocation\removeCaCerts.ps1"
		Start-Process powershell -Verb runAs -ArgumentList $powershellArguments -WindowStyle Hidden
	} else {
		invoke-expression -Command "$scriptLocation\removeCaCerts.ps1"
	}

} elseif ($Act -eq "setSystemProxy") {

	Write-Host "will invoke cmd: $scriptLocation\SetSystemProxy.ps1 -Proxy $Proxy"
	# If (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
	#	if ($Proxy -eq $null) {
	#		$powershellArguments = "-file $scriptLocation\SetSystemProxy.ps1"
	#	}else{
	#		$powershellArguments = "-file $scriptLocation\SetSystemProxy.ps1","-Proxy $Proxy"
	#	}
	#	Start-Process powershell -Verb runAs -ArgumentList $powershellArguments -WindowStyle Hidden
	#} else {
		if ($Proxy -eq $null) {
			invoke-expression -Command "$scriptLocation\SetSystemProxy.ps1"
		}else{
			invoke-expression -Command "$scriptLocation\SetSystemProxy.ps1 -Proxy $Proxy"
		}
	#}

} else {
	Write-Host "Not Supported Action"
}