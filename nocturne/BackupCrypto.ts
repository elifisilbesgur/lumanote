/** Password-protected backup files only. This does not encrypt the live local
 * database. Passwords are never saved. No custom cryptographic primitives. */
import * as Crypto from 'expo-crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { Buffer } from 'buffer';
// Explicit UTF-8 implementation; do not depend on Hermes TextEncoder/TextDecoder globals.
const utf8ToBytes = (value:string):Uint8Array => new Uint8Array(Buffer.from(value,'utf8'));

export const BACKUP_ITERATIONS = 600000;
const FORMAT = 'lumanote-nocturne-encrypted';
const AAD = utf8ToBytes('lumanote:nocturne:backup:2|PBKDF2-SHA256|600000');
export type EncryptedBackup = {format:string;version:2;algorithm:'AES-256-GCM';kdf:'PBKDF2-SHA256';iterations:number;salt:string;data:string};
export function isEncryptedBackup(value: any): value is EncryptedBackup {return value?.format === FORMAT;}
function checkPassword(password:string){if(typeof password!=='string'||password.length<10||password.length>256)throw new Error('Şifre 10–256 karakter olmalı. Uzun bir parola cümlesi kullan.');}
function checkEnvelope(value:EncryptedBackup){
 if(value.version!==2||value.algorithm!=='AES-256-GCM'||value.kdf!=='PBKDF2-SHA256'||value.iterations!==BACKUP_ITERATIONS||!/^[a-f0-9]{32}$/i.test(value.salt)||typeof value.data!=='string'||value.data.length<40||value.data.length>160*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(value.data)||value.data.length%4!==0)throw new Error('Şifreli yedek biçimi geçersiz veya desteklenmiyor.');
}
export async function encryptBackup(raw:unknown,password:string):Promise<EncryptedBackup>{
 checkPassword(password);
 const salt=await Crypto.getRandomBytesAsync(16);
 const keyBytes=await pbkdf2Async(sha256,utf8ToBytes(password),salt,{c:BACKUP_ITERATIONS,dkLen:32,asyncTick:15});
 try{
  const key=await Crypto.AESEncryptionKey.import(keyBytes);
  const data=await Crypto.aesEncryptAsync(utf8ToBytes(JSON.stringify(raw)),key,{nonce:{length:12},additionalData:AAD});
  return {format:FORMAT,version:2,algorithm:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:BACKUP_ITERATIONS,salt:bytesToHex(salt),data:await data.combined('base64') as string};
 }finally{keyBytes.fill(0);}
}
export async function decryptBackup(envelope:EncryptedBackup,password:string):Promise<any>{
 checkEnvelope(envelope);checkPassword(password);
 const keyBytes=await pbkdf2Async(sha256,utf8ToBytes(password),hexToBytes(envelope.salt),{c:BACKUP_ITERATIONS,dkLen:32,asyncTick:15});
 try{
  const key=await Crypto.AESEncryptionKey.import(keyBytes);
  const sealed=Crypto.AESSealedData.fromCombined(envelope.data,{ivLength:12,tagLength:16});
  const bytes=await Crypto.aesDecryptAsync(sealed,key,{additionalData:AAD,output:'bytes'}) as Uint8Array;
  const text=Buffer.from(bytes).toString('utf8');
  return JSON.parse(text);
 }catch{throw new Error('Şifre yanlış veya yedek dosyası bozulmuş. Mevcut verilerin değiştirilmedi.');}
 finally{keyBytes.fill(0);}
}
