param($CaPath)
$scriptLocation = $PSScriptRoot

Write-Host "will invoke cmd: $scriptLocation\ImportCaCerts.ps1 -CaPath $CaPath"

$null = [Reflection.Assembly]::Load("System.Security, Version=2.0.0.0, Culture=Neutral, PublicKeyToken=b03f5f7f11d50a3a")
$flags = [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::MachineKeySet -bor [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::PersistKeySet

$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2("$CaPath", "", $flags)
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine)
if (!$store) {
    Write-Warning "Unable to open '\\Root\LocalComputer\$StoreName\' certificate store.";
}
$store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite);
$store.Add($cert);
$store.Close();

Write-Host "invoke cmd completed"