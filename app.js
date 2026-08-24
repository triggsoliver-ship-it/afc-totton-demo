function tab(btn,id){document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
 document.querySelectorAll('.tabpane').forEach(p=>p.style.display='none');document.getElementById(id).style.display='block';}
function demo(e){if(e)e.preventDefault();alert('This is a demo site — checkout, downloads and form submissions are disabled.');return false;}
function shareIt(){const d={title:document.title,text:document.title,url:location.href};
 if(navigator.share){navigator.share(d).catch(()=>{});}else{navigator.clipboard&&navigator.clipboard.writeText(location.href);alert('Link copied to clipboard.');}}
let deferred=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;show();});
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;
function show(){if(standalone||localStorage.getItem('ip'))return;
 const el=document.getElementById('install');if(!el)return;
 if(isIOS){document.getElementById('instx').innerHTML="Tap <b>Share</b>, then <b>Add to Home Screen</b>.";}
 el.style.display='flex';}
if(isIOS)setTimeout(show,2600);
document.addEventListener('click',e=>{if(e.target&&e.target.id==='installbtn'){
 if(deferred){deferred.prompt();deferred=null;}else if(isIOS){alert('Tap the Share button in Safari, then choose "Add to Home Screen".');}
 else{alert('Open this site on your phone, then use your browser menu to add it to your home screen.');}}});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
