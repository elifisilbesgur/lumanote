import React,{useEffect,useRef,useState,useMemo} from 'react';
import {AppState,BackHandler,Platform,StyleSheet,View,Text,Pressable,KeyboardAvoidingView} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import {useAudioPlayer} from 'expo-audio';
import {SafeAreaProvider,useSafeAreaInsets} from 'react-native-safe-area-context';
import {WebView,WebViewMessageEvent} from 'react-native-webview';
import {UI_HTML} from './nocturne/UI_HTML';
import {createNativeServices} from './nocturne/NativeServices';
import {AudioEngine} from './nocturne/AudioEngine';
import type {AudioSettings,BridgeMessage,NativeEvent} from './nocturne/types';

const BUILD = 'LUMA-0.5.7-HOME-GREENHOUSE';
const INITIAL_AUDIO:AudioSettings={playing:false,volumes:{rain:40,ocean:0,brown:15,fire:0,cafe:0},customAudio:null};
function Application(){
  const web=useRef<WebView>(null);
  const insets=useSafeAreaInsets();
  const [display,setDisplay]=useState({full:false});
  const bell=useAudioPlayer(require('./assets/nocturne/bell.wav'));
  const [audio,setAudio]=useState<AudioSettings>(INITIAL_AUDIO);
  const [appearance,setAppearance]=useState({light:false,background:'#090a12'});
  const [fatal,setFatal]=useState<string|null>(null);
  const [generation,setGeneration]=useState(0);
  const currentState=useRef(AppState.currentState);
  const send=(message:unknown)=>web.current?.injectJavaScript(`window.__lumaReceive&&window.__lumaReceive(${JSON.stringify(message).replace(/</g,'\\u003c')});true;`);
  const sendRef=useRef(send);sendRef.current=send;
  const services=useMemo(()=>createNativeServices({emit:(e:NativeEvent)=>sendRef.current(e),setAudio,setAppearance}),[]);
  const source=useMemo(()=>({html:__DEV__ ? UI_HTML.replace('<head>','<head><script>window.LUMA_TEST_COINS_ALLOWED=true;</script>') : UI_HTML}),[]); // LUMA_TEST_COINS_DEV_GATE_V1

  useEffect(()=>{
    services.init().catch(e=>sendRef.current({type:'notice',payload:'Bildirim kurulumu tamamlanamadı: '+String(e?.message||e)}));
    const subscription=AppState.addEventListener('change',state=>{
      currentState.current=state;
      if(state!=='active'){
        setAudio(v=>({...v,playing:false}));
        sendRef.current({type:'background'});
        sendRef.current({type:'audioPaused'});
      }else{
        sendRef.current({type:'resume'});
        services.refreshReminders().catch(()=>{});
      }
    });
    const back=BackHandler.addEventListener('hardwareBackPress',()=>{sendRef.current({type:'back'});return true});
    return()=>{subscription.remove();back.remove();services.dispose();};
  },[services]);
  useEffect(()=>{
    web.current?.injectJavaScript(`document.documentElement.style.setProperty('--safe-top','${Math.max(0,insets.top)}px');document.documentElement.style.setProperty('--safe-bottom','${Math.max(0,insets.bottom)}px');true;`);
  },[insets.top,insets.bottom]);
  async function onMessage(event:WebViewMessageEvent){
    let message:BridgeMessage;
    try{
      if(event.nativeEvent.data.length>40*1024*1024)throw new Error('Mesaj çok büyük.');
      message=JSON.parse(event.nativeEvent.data);
      if(!message||typeof message.id!=='string'||typeof message.type!=='string')throw new Error('Geçersiz köprü mesajı.');
    }catch{return;}
    try{
      if(message.type==='diagnostic'){const p=message.payload||{};console.warn('[LumaNote UI] '+String(p.event||'error').slice(0,40)+' · '+String(p.message||'').slice(0,320)+' · ekran='+String(p.route||'').slice(0,30));send({replyTo:message.id,result:true});return;}
      if(message.type==='ready') console.info('[LumaNote] '+BUILD+' · Nocturne arayüzü yüklendi.');
      if(message.type==='displayMode'){
        const payload=message.payload||{};setDisplay({full:!!payload.full});
        const lock=payload.orientation==='landscape'?ScreenOrientation.OrientationLock.LANDSCAPE:payload.orientation==='portrait'?ScreenOrientation.OrientationLock.PORTRAIT_UP:ScreenOrientation.OrientationLock.DEFAULT;
        await ScreenOrientation.lockAsync(lock);send({replyTo:message.id,result:true});return;
      }
      if(message.type==='studyBell'){bell.volume=.35;await bell.seekTo(0);bell.play();send({replyTo:message.id,result:true});return;}
      const result=await services.handle(message);send({replyTo:message.id,result});
    }
    catch(e){send({replyTo:message.id,error:e instanceof Error?e.message:'İşlem tamamlanamadı.'});}
  }
  if(Platform.OS==='web')return <View style={styles.error}><Text style={styles.title}>LumaNote · Nocturne</Text><Text style={styles.message}>Tarayıcıda ONIZLEME.html dosyasını aç. Expo uygulaması iPhone ve Android için hazırlanmıştır.</Text></View>;
  return <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={[styles.root,{backgroundColor:appearance.background}]}>
    <StatusBar hidden={display.full} style={appearance.light?'dark':'light'} />
    <AudioEngine settings={audio} onError={message=>{setAudio(v=>({...v,playing:false}));send({type:'audioError',payload:message})}} />
    {fatal?<View style={styles.error}><Text style={styles.title}>Görünüm yüklenemedi.</Text><Text style={styles.message}>{fatal}</Text><Pressable accessibilityRole="button" style={styles.retry} onPress={()=>{setFatal(null);setGeneration(v=>v+1)}}><Text>Yeniden dene</Text></Pressable></View>:<WebView
      key={generation}
      ref={web}
      source={source}
      style={{flex:1,backgroundColor:appearance.background}}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      cacheEnabled={false}
      bounces={false}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      keyboardDisplayRequiresUserAction={false}
      hideKeyboardAccessoryView={false}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction
      allowsLinkPreview={false}
      setSupportMultipleWindows={false}
      allowFileAccess={false}
      mixedContentMode="never"
      injectedJavaScriptBeforeContentLoaded={`document.documentElement.style.setProperty('--safe-top','${insets.top}px');document.documentElement.style.setProperty('--safe-bottom','${insets.bottom}px');true;`}
      onLoadEnd={()=>web.current?.injectJavaScript(`document.documentElement.style.setProperty('--safe-top','${insets.top}px');document.documentElement.style.setProperty('--safe-bottom','${insets.bottom}px');true;`)}
      onMessage={onMessage}
      onShouldStartLoadWithRequest={request=>request.url==='about:blank'||request.url.startsWith('about:blank#')}
      onContentProcessDidTerminate={()=>{setAudio(v=>({...v,playing:false}));setGeneration(v=>v+1)}}
      onRenderProcessGone={()=>setFatal('Telefon görüntüleme sürecini kapattı. Kaydedilen verilerin korunuyor.')}
      onError={event=>setFatal(event.nativeEvent.description||'WebView yüklenemedi.')}
    />}
  </KeyboardAvoidingView>;
}
export default function App(){return <SafeAreaProvider><Application/></SafeAreaProvider>}
const styles=StyleSheet.create({root:{flex:1},error:{flex:1,backgroundColor:'#090a12',alignItems:'center',justifyContent:'center',padding:30},title:{color:'#eee3f8',fontSize:24,marginBottom:18,textAlign:'center'},message:{color:'#b8a9c9',fontSize:15,lineHeight:24,textAlign:'center'},retry:{marginTop:25,backgroundColor:'#c4a4f5',padding:16,borderRadius:14}});
