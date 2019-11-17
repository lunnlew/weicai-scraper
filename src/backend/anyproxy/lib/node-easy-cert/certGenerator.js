'use strict'

const forge = require('node-forge');
const Util = require('./util');

let defaultAttrs = [
  { name: 'countryName', value: 'CN' },
  { name: 'organizationName', value: 'EasyCert' },
  { shortName: 'ST', value: 'SH' },
  { shortName: 'OU', value: 'EasyCert SSL' }
];

/**
* different domain format needs different SAN
*
*/
function getExtensionSAN(domain = '') {
  const isIpDomain = Util.isIpDomain(domain);
  if (isIpDomain) {
    return {
      name: 'subjectAltName',
      altNames: [{ type: 7, ip: domain }]
    };
  } else {
    return {
      name: 'subjectAltName',
      altNames: [{ type: 2, value: domain }]
    };
  }
}

function getKeysAndCert(serialNumber) {
  const keys = forge.pki.rsa.generateKeyPair(1024);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = serialNumber || (Math.floor(Math.random() * 100000) + '');
  cert.validity.notBefore = new Date();
  cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 10); // 10 years
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 10); // 10 years
  return {
    keys,
    cert
  };
}

function generateRootCA(commonName) {
  const keysAndCert = getKeysAndCert();
  const keys = keysAndCert.keys;
  const cert = keysAndCert.cert;

  commonName = commonName || 'CertManager';

  const attrs = defaultAttrs.concat([
    {
      name: 'commonName',
      value: commonName
    }
  ]);
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    { name: 'basicConstraints', cA: true },
  // { name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
  // { name: 'extKeyUsage', serverAuth: true, clientAuth: true, codeSigning: true, emailProtection: true, timeStamping: true },
  // { name: 'nsCertType', client: true, server: true, email: true, objsign: true, sslCA: true, emailCA: true, objCA: true },
  // { name: 'subjectKeyIdentifier' }
  ]);

  cert.sign(keys.privateKey, forge.md.sha256.create());

  return {
    privateKey: forge.pki.privateKeyToPem(keys.privateKey),
    publicKey: forge.pki.publicKeyToPem(keys.publicKey),
    certificate: forge.pki.certificateToPem(cert)
  };
}

function generateCertsForHostname(domain, rootCAConfig) {
  // generate a serialNumber for domain
  const md = forge.md.md5.create();
  md.update(domain);

  const keysAndCert = getKeysAndCert(md.digest().toHex());
  const keys = keysAndCert.keys;
  const cert = keysAndCert.cert;

  const caCert = forge.pki.certificateFromPem(rootCAConfig.cert);
  const caKey = forge.pki.privateKeyFromPem(rootCAConfig.key);

  // issuer from CA
  cert.setIssuer(caCert.subject.attributes);

  const attrs = defaultAttrs.concat([
    {
      name: 'commonName',
      value: domain
    }
  ]);

  const extensions = [
    { name: 'basicConstraints', cA: false },
    getExtensionSAN(domain)
  ];

  cert.setSubject(attrs);
  cert.setExtensions(extensions);

  cert.sign(caKey, forge.md.sha256.create());

  return {
    privateKey: forge.pki.privateKeyToPem(keys.privateKey),
    publicKey: forge.pki.publicKeyToPem(keys.publicKey),
    certificate: forge.pki.certificateToPem(cert)
  };
}

// change the default attrs
function setDefaultAttrs(attrs) {
  defaultAttrs = attrs;
}

module.exports.generateRootCA = generateRootCA;
module.exports.generateCertsForHostname = generateCertsForHostname;
module.exports.setDefaultAttrs = setDefaultAttrs;
