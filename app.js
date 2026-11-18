const $=id=>document.getElementById(id);
const video=$('sourceVideo'), preview=$('preview'), media=$('mediaLayer'), caption=$('caption');
let objectUrl=null, mode='auto', format='portrait', duration=0, sourceMode='live';

// Modalidad de trabajo: en vivo o VOD. La ingestión real se habilita con backend.
document.querySelectorAll('[data-source-mode]').forEach(b=>b.onclick=()=>{
 sourceMode=b.dataset.sourceMode;
 document.querySelectorAll('[data-source-mode]').forEach(x=>x.classList.toggle('active',x===b));
 $('liveInfo').classList.toggle('hidden',sourceMode!=='live');
 $('vodInfo').classList.toggle('hidden',sourceMode!=='vod');
});

$('videoFile').addEventListener('change',e=>{
 const f=e.target.files[0];if(!f)return;
 $('remotePlayer').removeAttribute('src');$('remotePlayerWrap').classList.add('hidden');
 if(objectUrl)URL.revokeObjectURL(objectUrl);
 objectUrl=URL.createObjectURL(f);video.src=objectUrl;video.style.display='block';
 media.innerHTML='';const pv=document.createElement('video');pv.src=objectUrl;pv.muted=true;pv.loop=true;pv.playsInline=true;pv.setAttribute('playsinline','');media.appendChild(pv);pv.play().catch(()=>{});
 $('sourceHint').textContent=`Archivo cargado: ${f.name}. Puedes editarlo y exportar un fragmento local.`;
});
// Enlaces públicos: mostramos el reproductor oficial cuando la plataforma lo permite.
// Un iframe no entrega el archivo de vídeo a la página; el recorte/exportación remotos
// requieren un backend autorizado y no se simulan aquí.
function parseRemoteUrl(raw){
 let u;try{u=new URL(raw.trim())}catch(e){throw new Error('Pega un enlace completo que empiece por https://')}
 if(!['https:'].includes(u.protocol))throw new Error('Por seguridad, solo aceptamos enlaces HTTPS.');
 const host=u.hostname.toLowerCase().replace(/^www\./,'');
 if(host==='kick.com'||host==='m.kick.com'){
  const parts=u.pathname.split('/').filter(Boolean);
  if(!parts.length||['videos','video','categories','clips'].includes(parts[0].toLowerCase()))throw new Error('Este enlace de Kick parece ser un VOD o una página especial. Por ahora el reproductor integrado admite enlaces de canales en vivo (kick.com/usuario).');
  const channel=parts[0];
  return {platform:'Kick',kind:'live',embed:`https://player.kick.com/${encodeURIComponent(channel)}?autoplay=false`,label:`Canal de Kick: ${channel}`};
 }
 if(host==='twitch.tv'||host==='m.twitch.tv'){
  const parts=u.pathname.split('/').filter(Boolean);if(!parts.length)throw new Error('No pude identificar el canal o VOD de Twitch.');
  const parent=location.hostname;
  if(parts[0].toLowerCase()==='videos'&&parts[1]&&/^\d+$/.test(parts[1]))return {platform:'Twitch',kind:'vod',embed:`https://player.twitch.tv/?video=${encodeURIComponent(parts[1])}&parent=${encodeURIComponent(parent)}&autoplay=false`,label:`VOD de Twitch #${parts[1]}`};
  if(parts[0].toLowerCase()==='clip'||host==='clips.twitch.tv')throw new Error('Los enlaces de clips ya publicados no se pueden importar como stream. Pega el canal o un VOD.');
  const channel=parts[0];if(!/^[a-zA-Z0-9_]{1,25}$/.test(channel))throw new Error('El nombre del canal de Twitch no parece válido.');
  return {platform:'Twitch',kind:'live',embed:`https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parent)}&autoplay=false`,label:`Canal de Twitch: ${channel}`};
 }
 if(['youtube.com','m.youtube.com','youtu.be','youtube-nocookie.com'].includes(host)){
  let id='';
  if(host==='youtu.be')id=u.pathname.split('/').filter(Boolean)[0]||'';
  else id=u.searchParams.get('v')||((u.pathname.match(/^\/(?:live|shorts|embed)\/([^/?]+)/)||[])[1]||'');
  if(!/^[a-zA-Z0-9_-]{11}$/.test(id))throw new Error('No pude encontrar un ID de vídeo de YouTube válido en ese enlace.');
  return {platform:'YouTube',kind:'vod/live',embed:`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?playsinline=1`,label:`Vídeo o directo de YouTube: ${id}`};
 }
 throw new Error('Por ahora aceptamos enlaces de canales Kick, canales/VOD de Twitch y vídeos/directos de YouTube.');
}
function showRemoteSource(info){
 if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}
 video.pause();video.removeAttribute('src');video.load();video.style.display='none';
 $('remotePlayer').src=info.embed;$('remotePlayerWrap').classList.remove('hidden');
 media.innerHTML='<div class="placeholder">Fuente externa cargada. Usa el reproductor de arriba para verla.</div>';
 $('sourceHint').textContent=`${info.platform}: ${info.label}. Reproductor integrado cargado. Puedes verlo aquí, pero el editor/exportador todavía trabaja solo con archivos locales; para recortar esta fuente necesitamos conectar el backend de captura autorizado.`;
}
$('urlInfo').onclick=()=>{
 const raw=$('videoUrl').value;
 if(!raw.trim()){$('sourceHint').textContent='Pega primero un enlace de Kick, Twitch o YouTube.';return}
 try{const info=parseRemoteUrl(raw);showRemoteSource(info)}catch(err){$('sourceHint').textContent=err.message;$('remotePlayer').removeAttribute('src');$('remotePlayerWrap').classList.add('hidden')}
};
$('videoUrl').addEventListener('keydown',e=>{if(e.key==='Enter')$('urlInfo').click()});

document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));$('autoPanel').classList.toggle('hidden',mode!=='auto');$('manualPanel').classList.toggle('hidden',mode!=='manual')});
document.querySelectorAll('[data-format]').forEach(b=>b.onclick=()=>{format=b.dataset.format;document.querySelectorAll('[data-format]').forEach(x=>x.classList.toggle('active',x===b));preview.className='preview '+(format==='portrait'?'portrait':format);$('splitBottom').classList.toggle('hidden',!['split','photo'].includes(format));$('splitBottom').textContent=format==='photo'?'ESPACIO PARA FOTO':'SEGUNDA FUENTE / GAMEPLAY'});
$('captionText').oninput=e=>caption.textContent=e.target.value||' ';
$('font').onchange=e=>caption.style.fontFamily=e.target.value;
$('fontSize').oninput=e=>{caption.style.fontSize=e.target.value+'px';$('sizeOut').textContent=e.target.value};
$('zoom').oninput=e=>{const v=+e.target.value;const pv=media.querySelector('video');if(pv)pv.style.transform=`scale(${v})`;$('zoomOut').textContent=v.toFixed(1)+'×'};
$('position').oninput=e=>{caption.style.top=e.target.value+'%';$('posOut').textContent=e.target.value+'%'};
$('fontColor').oninput=e=>caption.style.color=e.target.value;
$('captionBg').onchange=e=>caption.style.background=e.target.value==='none'?'transparent':e.target.value==='solid'?'#000':'#0009';
$('fit').onchange=e=>{const pv=media.querySelector('video');if(pv)pv.style.objectFit=e.target.value};
video.onloadedmetadata=()=>{duration=video.duration;$('endTime').value=Math.floor(duration);$('trimEnd').value=Math.floor(duration);$('scrub').max=duration;$('durationLabel').textContent='00:00 / '+fmt(duration)};
function fmt(s){s=Math.floor(s||0);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
$('previewRange').onclick=()=>{const s=Math.max(0,+$('startTime').value||0),e=Math.max(s+1,+$('endTime').value||1);if(!video.src){$('sourceHint').textContent='Primero carga un vídeo desde tu dispositivo.';return}video.currentTime=Math.min(s,duration);video.play();setTimeout(()=>video.pause(),Math.min(4000,(e-s)*1000));$('trimStart').value=s;$('trimEnd').value=e};
$('scrub').oninput=e=>{if(video.src){video.currentTime=+e.target.value;const pv=media.querySelector('video');if(pv)pv.currentTime=video.currentTime}};
video.ontimeupdate=()=>{if(duration){$('scrub').value=video.currentTime;$('durationLabel').textContent=fmt(video.currentTime)+' / '+fmt(duration);const pv=media.querySelector('video');if(pv&&Math.abs(pv.currentTime-video.currentTime)>.35)pv.currentTime=video.currentTime}};
$('trimStart').onchange=()=>{$('startTime').value=$('trimStart').value};
$('trimEnd').onchange=()=>{$('endTime').value=$('trimEnd').value};

// Exportación local: compone el vídeo en canvas y graba el rango elegido.
// La compatibilidad depende del navegador y de los formatos MediaRecorder disponibles.
function canvasSize(){
 const choice=$('resolution').value;
 if(choice.includes('720'))return [720,1280];
 if(choice.includes('1080 × 1080'))return [1080,1080];
 return format==='landscape'?[1920,1080]:[1080,1920];
}
function drawCover(ctx,source,w,h,fit,zoom){
 const sw=source.videoWidth||source.width,sh=source.videoHeight||source.height;if(!sw||!sh)return;
 let scale=fit==='contain'?Math.min(w/sw,h/sh):Math.max(w/sw,h/sh);scale*=zoom;
 const dw=sw*scale,dh=sh*scale;ctx.drawImage(source,(w-dw)/2,(h-dh)/2,dw,dh);
}
async function exportClip(){
 if(!video.src||!video.videoWidth){$('exportHint').textContent='Primero carga un vídeo y espera a que esté listo.';return}
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){$('exportHint').textContent='Tu navegador no permite exportar desde esta función. Prueba con la versión más reciente de Safari o Chrome.';return}
 const start=Math.max(0,Number($('trimStart').value)||0),end=Math.min(duration,Number($('trimEnd').value)||duration);
 if(end<=start||end-start<1){$('exportHint').textContent='Revisa el inicio y el final: el clip debe durar al menos un segundo.';return}
 const [w,h]=canvasSize(),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');
 const fps=$('fps').value.startsWith('60')?60:30;const stream=canvas.captureStream(fps);
 let sourceStream=null;try{sourceStream=video.captureStream?video.captureStream():video.mozCaptureStream?video.mozCaptureStream():null;if(sourceStream)sourceStream.getAudioTracks().forEach(t=>stream.addTrack(t))}catch(e){}
 const types=['video/mp4;codecs="avc1.42E01E,mp4a.40.2"','video/mp4','video/webm;codecs=vp9,opus','video/webm'];
 const mime=types.find(t=>MediaRecorder.isTypeSupported(t));
 if(!mime){$('exportHint').textContent='Este navegador no ofrece un formato compatible para grabar. Prueba desde otro navegador compatible.';stream.getTracks().forEach(t=>t.stop());return}
 let recorder;try{recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:w>=1080?6000000:3500000})}catch(err){$('exportHint').textContent='No se pudo iniciar el renderizado en este navegador.';stream.getTracks().forEach(t=>t.stop());return}
 const chunks=[];recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
 $('exportBtn').disabled=true;$('exportBtn').textContent='Renderizando…';$('exportProgress').classList.remove('hidden');$('progressBar').style.width='0%';$('exportHint').textContent='Mantén esta página abierta mientras se genera el clip.';
 const fit=$('fit').value,zoom=Number($('zoom').value)||1,captionText=$('captionText').value;
 const draw=()=>{
  ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
  if(video.readyState>=2){
   if(format==='landscape')drawCover(ctx,video,w,h,fit,zoom);
   else if(format==='split') {ctx.save();ctx.beginPath();ctx.rect(0,0,w,h/2);ctx.clip();drawCover(ctx,video,w,h/2,fit,zoom);ctx.restore();ctx.fillStyle='#171522';ctx.fillRect(0,h/2,w,h/2);ctx.fillStyle='#c8b7ff';ctx.font=`bold ${Math.round(w*.025)}px sans-serif`;ctx.textAlign='center';ctx.fillText('SEGUNDA FUENTE / GAMEPLAY',w/2,h*.76)}
   else drawCover(ctx,video,w,h,fit,zoom);
  }
  if(captionText.trim()){
   const fontSize=Math.round(Number($('fontSize').value)*w/390*1.4);ctx.font=`800 ${fontSize}px ${$('font').value}, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
   const maxWidth=w*.9,words=captionText.split(/\s+/),lines=[];let line='';
   for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);
   const lineH=fontSize*1.2,blockH=lines.length*lineH,cy=h*(Number($('position').value)/100),top=cy-blockH/2;
   if($('captionBg').value!=='none'){ctx.fillStyle=$('captionBg').value==='solid'?'#000':'rgba(0,0,0,.6)';const widest=Math.min(maxWidth,Math.max(...lines.map(l=>ctx.measureText(l).width))+fontSize);ctx.fillRect((w-widest)/2,top-fontSize*.25,widest,blockH+fontSize*.5)}
   ctx.fillStyle=$('fontColor').value;ctx.shadowColor='#000';ctx.shadowBlur=4;lines.forEach((l,i)=>ctx.fillText(l,w/2,top+i*lineH+lineH/2,maxWidth));ctx.shadowBlur=0;
  }
 };
 let raf=0,stopped=false;const frame=()=>{if(stopped)return;draw();const elapsed=Math.max(0,video.currentTime-start);$('progressBar').style.width=Math.min(100,elapsed/(end-start)*100)+'%';if(video.currentTime>=end){stopped=true;video.pause();recorder.stop();cancelAnimationFrame(raf);return}raf=requestAnimationFrame(frame)};
 recorder.onstop=()=>{
  stopped=true;cancelAnimationFrame(raf);stream.getTracks().forEach(t=>t.stop());
  const blob=new Blob(chunks,{type:mime.split(';')[0]});const ext=mime.includes('mp4')?'mp4':'webm';const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`clip-machine-${Date.now()}.${ext}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  $('exportHint').textContent=`Clip generado (${ext.toUpperCase()}). Si tu dispositivo no descarga automáticamente, revisa Archivos/Descargas.`;$('exportBtn').disabled=false;$('exportBtn').textContent='Exportar clip de este vídeo';$('exportProgress').classList.add('hidden');
 };
 recorder.onerror=()=>{$('exportHint').textContent='Ocurrió un error durante la exportación. Prueba con un fragmento más corto.';$('exportBtn').disabled=false;$('exportBtn').textContent='Intentar exportar de nuevo';$('exportProgress').classList.add('hidden');};
 try{video.currentTime=start;await new Promise(resolve=>{const done=()=>{video.removeEventListener('seeked',done);resolve()};video.addEventListener('seeked',done);setTimeout(resolve,1200)});await video.play();draw();recorder.start(250);raf=requestAnimationFrame(frame)}catch(err){$('exportHint').textContent='No se pudo reproducir el vídeo para exportarlo. Toca reproducir y vuelve a intentarlo.';$('exportBtn').disabled=false;$('exportBtn').textContent='Intentar exportar de nuevo';$('exportProgress').classList.add('hidden');stream.getTracks().forEach(t=>t.stop())}
}
$('exportBtn').onclick=exportClip;
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
