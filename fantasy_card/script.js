(() => {
 const c=window.CARD_CONFIG, card=document.getElementById('card');
 const $=id=>document.getElementById(id);
 document.querySelectorAll('[data-name]').forEach(e=>e.textContent=c.name);
 document.querySelectorAll('[data-role]').forEach(e=>e.textContent=c.role);
 document.querySelectorAll('[data-tagline]').forEach(e=>e.textContent=c.tagline);
 const setLink=(id,url)=>{let el=$(id);if(!url){el.removeAttribute('href');el.classList.add('disabled');el.setAttribute('aria-disabled','true')}else el.href=url};
 setLink('projectsLink',c.projects);setLink('interestsLink',c.interests);setLink('resumeLink',c.resume);
 setLink('githubIcon',c.github);setLink('linkedinIcon',c.linkedin);setLink('websiteIcon',c.website);setLink('emailIcon',`mailto:${c.email}`);
 [['businessEmail',`mailto:${c.email}`,c.email],['businessLinkedin',c.linkedin,c.linkedin.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'')],['businessGithub',c.github,c.github.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'')],['businessWebsite',c.website,c.website.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'')]].forEach(([id,url,label])=>{setLink(id,url);$(id).querySelector('span').textContent=label});
 const vcard=['BEGIN:VCARD','VERSION:3.0',`FN:${c.name}`,`TITLE:${c.role}`,`EMAIL:${c.email}`,c.phone?`TEL:${c.phone}`:'',`URL:${c.cardUrl||c.website}`,'END:VCARD'].filter(Boolean).join('\r\n');
 const blob=new Blob([vcard],{type:'text/vcard;charset=utf-8'});const blobUrl=URL.createObjectURL(blob);$('saveContact').href=blobUrl;$('saveContact').download=c.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.vcf';
 const profileFace=card.querySelector('.profile'), businessFace=card.querySelector('.business');
 businessFace.inert=true;
 const flip=()=>{card.classList.toggle('flipped');const back=card.classList.contains('flipped');$('flipButton').setAttribute('aria-pressed',String(back));profileFace.inert=back;businessFace.inert=!back};
 $('flipButton').addEventListener('click',flip);
 const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Image not found: '+src));im.src=src});
 // Export the real HTML/CSS card rather than a separate canvas approximation.
 // Everything is inlined before capture: no CDN, paid service, or extra library.
 const blobAsDataUrl=(blob)=>new Promise((resolve,reject)=>{
  const reader=new FileReader();reader.onload=()=>resolve(reader.result);
  reader.onerror=reject;reader.readAsDataURL(blob);
 });
 const selfContainedImage=async(url)=>{
  if(!url || url.startsWith('data:'))return url;
  const response=await fetch(url);
  if(!response.ok)throw new Error('Could not load artwork: '+url);
  return blobAsDataUrl(await response.blob());
 };
 const renderCardAsPNG=async()=>{
  const original=$('businessFace');
  const originalRect=original.getBoundingClientRect();
  const w=Math.round(originalRect.width),h=Math.round(originalRect.height);
  if(!w || !h)throw new Error('Card is not visible');
  await Promise.all([...original.querySelectorAll('img')].map(async img=>{
   if(img.complete)return;
   await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true})});
  }));
  const clone=original.cloneNode(true);
  clone.classList.add('exporting');
  const actual=[original,...original.querySelectorAll('*')];
  const copied=[clone,...clone.querySelectorAll('*')];
  // Use styles computed by the actual browser for a faithful representation.
  for(let i=0;i<actual.length;i++){
   const style=getComputedStyle(actual[i]);
   for(const prop of style)copied[i].style.setProperty(prop,style.getPropertyValue(prop),style.getPropertyPriority(prop));
  }
  Object.assign(clone.style,{
   position:'relative',top:'0px',left:'0px',transform:'none',
   backfaceVisibility:'visible',width:w+'px',height:h+'px',transition:'none'
  });
  // Replace image references, including the background, with embedded data.
  for(const image of [...clone.querySelectorAll('img')]){
   image.src=await selfContainedImage(image.src);
  }
  for(const element of copied){
   const background=element.style.backgroundImage;
   if(!background||background==='none')continue;
   const match=background.match(/url\(["']?([^"')]+)["']?\)/i);
   if(match && !match[1].startsWith('data:')){
    element.style.backgroundImage=background.replace(match[0],`url("${await selfContainedImage(match[1])}")`);
   }
  }
  // Don't bake the download button's hover/focus halo into the image.
  const downloadControl=clone.querySelector('#railDownload');
  if(downloadControl){
   downloadControl.style.filter='none';downloadControl.style.transform='none';downloadControl.style.outline='none';downloadControl.style.opacity='1';downloadControl.style.mixBlendMode='normal';
   const compassArt=downloadControl.querySelector('.compass-art');
   if(compassArt){
    compassArt.style.animation='none';compassArt.style.transition='none';compassArt.style.filter='none';compassArt.style.transform='none';
    compassArt.style.opacity='1';compassArt.style.mixBlendMode='normal';compassArt.style.willChange='auto';
   }
  }
  const markup=new XMLSerializer().serializeToString(clone);
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'">'+
            '<foreignObject width="100%" height="100%">'+markup+'</foreignObject></svg>';
  // A data URL is important; a blob URL may taint the export canvas in Chrome.
  const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Card capture failed'));img.src=url});
  const scale=900/w,canvas=document.createElement('canvas');
  canvas.width=900;canvas.height=Math.round(h*scale);
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/png');
 };
 const exportCard=async()=>{
  const button=$('railDownload');button.disabled=true;button.title='Preparing card PNG…';
  try{
   const png=await renderCardAsPNG();
   const link=document.createElement('a');
   link.download=c.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-business-card.png';
   link.href=png;document.body.appendChild(link);link.click();link.remove();
  }catch(err){console.error('Card export:',err);alert('PNG export failed. Open the card via your local Python server (not file://), then retry in Chrome or Edge.');}
  finally{button.disabled=false;button.title='Download business card PNG'}
 };
 $('railDownload').addEventListener('click',exportCard);

 let startX=0;card.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});card.addEventListener('touchend',e=>{if(Math.abs(e.changedTouches[0].clientX-startX)>70)flip()},{passive:true});
 const identity=$('identityImage');let showingPhoto=false,photoAvailable=false;const test=new Image();test.onload=()=>{photoAvailable=true};test.src=c.photo;
 const swap=()=>{if(!photoAvailable)return;showingPhoto=!showingPhoto;identity.src=showingPhoto?c.photo:c.logo;identity.alt=showingPhoto?'Profile photo':'Personal logo'};
 $('swapIdentity').addEventListener('click',swap);if(c.photoSwapSeconds>0)setInterval(swap,c.photoSwapSeconds*1000);
 document.querySelector('.qr-logo').src=c.logo;
 // The QR image is generated offline by generate_qr.py. A placeholder must never be mistaken for a real link.
 if(c.cardUrl){$('qrNote').textContent='SCAN TO CONNECT';$('qrImage').src='assets/qr-code.png';$('qrImage').onerror=()=>{$('qrImage').src='assets/qr-placeholder.png';$('qrNote').textContent='RUN generate_qr.py TO ENABLE QR'}};
})();
