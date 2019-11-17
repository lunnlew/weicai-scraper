$scriptLocation = $PSScriptRoot

$null = [Reflection.Assembly]::Load("System.Security, Version=2.0.0.0, Culture=Neutral, PublicKeyToken=b03f5f7f11d50a3a")
$flags = [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::MachineKeySet -bor [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::PersistKeySet

$store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine)

if (!$store) {
    Write-Warning "Unable to open '\\Root\LocalComputer\$StoreName\' certificate store.";
}

$store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite);

#$store.Certificates | FORMAT-LIST ¨CPROPERTY *

$certificates =  $store.Certificates | Where-Object { $_.Issuer -eq "CN=AnyProxy, OU=AnyProxy SSL Proxy, S=SH, O=AnyProxy, C=CN" }

foreach ($cert in $certificates) {
    $store.Remove($cert);
}