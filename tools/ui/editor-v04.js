Object.assign(templates,{
 cornell:{title:'',html:'<h2>Konu</h2><p><br></p><h2>Anahtar kavramlar</h2><ul><li><br></li></ul><h2>Notlarım</h2><p><br></p><h2>Kendi cümlelerimle özet</h2><p><br></p>',category:'Ders'},
 revision:{title:'',html:'<h2>Hatırladıklarım</h2><p><br></p><h2>Emin olmadıklarım</h2><p><br></p><h2>Kendime sorular</h2><ol><li><br></li></ol><h2>Sonraki tekrar</h2><p><br></p>',category:'Ders'},
 meeting:{title:'',html:'<h2>Konu ve tarih</h2><p><br></p><h2>Konuşulanlar</h2><ul><li><br></li></ul><h2>Kararlar</h2><p><br></p><h2>Sonraki adımlar</h2><div class="check-item"><input type="checkbox"><span>Bir adım ekle</span></div>',category:'İş'},
 braindump:{title:'',html:'<h2>Aklımdakiler</h2><p><br></p><h2>Bugün tek bir şey</h2><p><br></p>',category:'Kişisel'}
});
let editHistory={id:null,stack:[],index:-1},editHistoryDebounce,editorScrollFrame;
function editorSnapshot(){const title=$('#editor-title'),ed=$('#rich-editor');if(!title||!ed)return null;$$('input[type=checkbox]',ed).forEach(c=>c.checked?c.setAttribute('checked',''):c.removeAttribute('checked'));return {title:title.value,html:sanitizeHTML(ed.innerHTML)}}
function initEditorHistory(id){clearTimeout(editHistoryDebounce);editHistory={id,stack:[],index:-1};pushEditorHistory();setTimeout(keepCaretVisible,100);}
function pushEditorHistory(){clearTimeout(editHistoryDebounce);if(editHistory.id!==UI.editorId)return;const snapshot=editorSnapshot();if(!snapshot)return;const current=editHistory.stack[editHistory.index];if(current&&current.title===snapshot.title&&current.html===snapshot.html)return;editHistory.stack=editHistory.stack.slice(0,editHistory.index+1);editHistory.stack.push(snapshot);let size=editHistory.stack.reduce((n,s)=>n+s.html.length+s.title.length,0);while(editHistory.stack.length>2&&(editHistory.stack.length>60||size>6_000_000)){const first=editHistory.stack.shift();size-=first.html.length+first.title.length;}editHistory.index=editHistory.stack.length-1;updateUndoButtons();}
function updateUndoButtons(){$$('[data-format="undo"]').forEach(b=>{b.disabled=editHistory.index<=0});$$('[data-format="redo"]').forEach(b=>{b.disabled=editHistory.index>=editHistory.stack.length-1});}
function applyEditorHistory(direction){pushEditorHistory();const next=editHistory.index+direction;if(next<0||next>=editHistory.stack.length)return;editHistory.index=next;const snapshot=editHistory.stack[next],ed=$('#rich-editor');$('#editor-title').value=snapshot.title;ed.innerHTML=snapshot.html;originalRange=null;flushEditor();updateUndoButtons();ed.focus({preventScroll:true});const r=document.createRange();r.selectNodeContents(ed);r.collapse(false);window.getSelection().removeAllRanges();window.getSelection().addRange(r);captureRange();keepCaretVisible();}
function keepCaretVisible(){
 cancelAnimationFrame(editorScrollFrame);editorScrollFrame=requestAnimationFrame(()=>{
  if(!UI.editorId)return;const scroller=$('.editor-scroll'),ed=$('#rich-editor'),selection=window.getSelection();if(!scroller||!ed||!selection?.rangeCount||!ed.contains(selection.anchorNode))return;
  const range=selection.getRangeAt(0),rect=range.getBoundingClientRect();if(!rect.width&&!rect.height)return;
  const viewport=window.visualViewport,top=scroller.getBoundingClientRect().top+14;
  const tools=$('.editor-tools')?.getBoundingClientRect(),bottom=Math.min(scroller.getBoundingClientRect().bottom,viewport?viewport.offsetTop+viewport.height:window.innerHeight,tools?.top||Infinity)-26;
  if(rect.bottom>bottom)scroller.scrollTop+=rect.bottom-bottom;else if(rect.top<top)scroller.scrollTop-=top-rect.top;
 });
}
document.addEventListener('input',e=>{if(e.target.id==='editor-title'||e.target.closest?.('#rich-editor')){clearTimeout(editHistoryDebounce);editHistoryDebounce=setTimeout(pushEditorHistory,450);keepCaretVisible();}});
document.addEventListener('change',e=>{if(e.target.matches?.('#rich-editor input[type=checkbox]'))pushEditorHistory();});
document.addEventListener('keydown',e=>{if(!UI.editorId||UI.overlay||!(e.target.id==='editor-title'||e.target.closest?.('#rich-editor')))return;if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();e.stopImmediatePropagation();applyEditorHistory(e.key.toLowerCase()==='y'||e.shiftKey?1:-1);}else if(['Enter','ArrowDown','ArrowUp'].includes(e.key))setTimeout(keepCaretVisible,30);},true);
window.visualViewport?.addEventListener('resize',keepCaretVisible);window.visualViewport?.addEventListener('scroll',keepCaretVisible);
