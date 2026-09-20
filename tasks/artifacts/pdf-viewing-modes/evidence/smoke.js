const PDF_FIXTURE="JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUiA1IDAgUiA3IDAgUiA5IDAgUiAxMSAwIFIgMTMgMCBSIDE1IDAgUiAxNyAwIFIgMTkgMCBSIDIxIDAgUiAyMyAwIFIgMjUgMCBSXSAvQ291bnQgMTIgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDQgMCBSID4+CmVuZG9iago0IDAgb2JqCjw8IC9MZW5ndGggNDEgPj4Kc3RyZWFtCkJUIC9GMSAyNCBUZiA3MiA3MjAgVGQgKFBERiBwYWdlIDEpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDc5MiA2MTJdIC9SZXNvdXJjZXMgPDwgL0ZvbnQgPDwgL0YxIDI3IDAgUiA+PiA+PiAvQ29udGVudHMgNiAwIFIgPj4KZW5kb2JqCjYgMCBvYmoKPDwgL0xlbmd0aCA0MSA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDU0MCBUZCAoUERGIHBhZ2UgMikgVGogRVQKZW5kc3RyZWFtCmVuZG9iago3IDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgMjcgMCBSID4+ID4+IC9Db250ZW50cyA4IDAgUiA+PgplbmRvYmoKOCAwIG9iago8PCAvTGVuZ3RoIDQxID4+CnN0cmVhbQpCVCAvRjEgMjQgVGYgNzIgNzIwIFRkIChQREYgcGFnZSAzKSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCjkgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDEwIDAgUiA+PgplbmRvYmoKMTAgMCBvYmoKPDwgL0xlbmd0aCA0MSA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDcyMCBUZCAoUERGIHBhZ2UgNCkgVGogRVQKZW5kc3RyZWFtCmVuZG9iagoxMSAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDc5MiA2MTJdIC9SZXNvdXJjZXMgPDwgL0ZvbnQgPDwgL0YxIDI3IDAgUiA+PiA+PiAvQ29udGVudHMgMTIgMCBSID4+CmVuZG9iagoxMiAwIG9iago8PCAvTGVuZ3RoIDQxID4+CnN0cmVhbQpCVCAvRjEgMjQgVGYgNzIgNTQwIFRkIChQREYgcGFnZSA1KSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCjEzIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgMjcgMCBSID4+ID4+IC9Db250ZW50cyAxNCAwIFIgPj4KZW5kb2JqCjE0IDAgb2JqCjw8IC9MZW5ndGggNDEgPj4Kc3RyZWFtCkJUIC9GMSAyNCBUZiA3MiA3MjAgVGQgKFBERiBwYWdlIDYpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKMTUgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDE2IDAgUiA+PgplbmRvYmoKMTYgMCBvYmoKPDwgL0xlbmd0aCA0MSA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDcyMCBUZCAoUERGIHBhZ2UgNykgVGogRVQKZW5kc3RyZWFtCmVuZG9iagoxNyAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDc5MiA2MTJdIC9SZXNvdXJjZXMgPDwgL0ZvbnQgPDwgL0YxIDI3IDAgUiA+PiA+PiAvQ29udGVudHMgMTggMCBSID4+CmVuZG9iagoxOCAwIG9iago8PCAvTGVuZ3RoIDQxID4+CnN0cmVhbQpCVCAvRjEgMjQgVGYgNzIgNTQwIFRkIChQREYgcGFnZSA4KSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCjE5IDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgMjcgMCBSID4+ID4+IC9Db250ZW50cyAyMCAwIFIgPj4KZW5kb2JqCjIwIDAgb2JqCjw8IC9MZW5ndGggNDEgPj4Kc3RyZWFtCkJUIC9GMSAyNCBUZiA3MiA3MjAgVGQgKFBERiBwYWdlIDkpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKMjEgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDIyIDAgUiA+PgplbmRvYmoKMjIgMCBvYmoKPDwgL0xlbmd0aCA0MiA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDcyMCBUZCAoUERGIHBhZ2UgMTApIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKMjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA3OTIgNjEyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDI0IDAgUiA+PgplbmRvYmoKMjQgMCBvYmoKPDwgL0xlbmd0aCA0MiA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDU0MCBUZCAoUERGIHBhZ2UgMTEpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKMjUgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDI2IDAgUiA+PgplbmRvYmoKMjYgMCBvYmoKPDwgL0xlbmd0aCA0MiA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDcyMCBUZCAoUERGIHBhZ2UgMTIpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKMjcgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iagp4cmVmCjAgMjgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDE5MCAwMDAwMCBuIAowMDAwMDAwMzE3IDAwMDAwIG4gCjAwMDAwMDA0MDggMDAwMDAgbiAKMDAwMDAwMDUzNSAwMDAwMCBuIAowMDAwMDAwNjI2IDAwMDAwIG4gCjAwMDAwMDA3NTMgMDAwMDAgbiAKMDAwMDAwMDg0NCAwMDAwMCBuIAowMDAwMDAwOTcyIDAwMDAwIG4gCjAwMDAwMDEwNjQgMDAwMDAgbiAKMDAwMDAwMTE5MyAwMDAwMCBuIAowMDAwMDAxMjg1IDAwMDAwIG4gCjAwMDAwMDE0MTQgMDAwMDAgbiAKMDAwMDAwMTUwNiAwMDAwMCBuIAowMDAwMDAxNjM1IDAwMDAwIG4gCjAwMDAwMDE3MjcgMDAwMDAgbiAKMDAwMDAwMTg1NiAwMDAwMCBuIAowMDAwMDAxOTQ4IDAwMDAwIG4gCjAwMDAwMDIwNzcgMDAwMDAgbiAKMDAwMDAwMjE2OSAwMDAwMCBuIAowMDAwMDAyMjk4IDAwMDAwIG4gCjAwMDAwMDIzOTEgMDAwMDAgbiAKMDAwMDAwMjUyMCAwMDAwMCBuIAowMDAwMDAyNjEzIDAwMDAwIG4gCjAwMDAwMDI3NDIgMDAwMDAgbiAKMDAwMDAwMjgzNSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDI4IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgoyOTA2CiUlRU9G";
const report = value => window.webkit.messageHandlers.smoke.postMessage(typeof value === 'string' ? value : JSON.stringify(value));
window.addEventListener('error', e => report({error: e.message}));
window.addEventListener('unhandledrejection', e => report({rejection: String(e.reason)}));
window.addEventListener('securitypolicyviolation', e => report({csp: e.violatedDirective, blocked: e.blockedURI}));
const warn = console.warn; console.warn = (...args) => { report({warning: args.map(String).join(' ')}); warn(...args); };
let selection = '/sample.HTML';
window.__TAURI_INTERNALS__ = {invoke: async (cmd, args) => {
  if (cmd === 'pick_entry') return {kind: 'file', path: selection};
  if (cmd === 'read_file') {
    if (selection.endsWith('HTML')) return {kind: 'html', path: selection, text: '<!doctype html><html><head><title>Fixture</title><style>h1 { color: rgb(20, 40, 60); }</style></head><body><h1>HTML rendered heading</h1><p>Hello <strong>HTML</strong></p><script>window.BAD = true</script><img src="https://example.com/leak" onerror="window.BAD=true"><iframe src="https://example.com"></iframe><a href="javascript:alert(1)">bad</a><h2>Section</h2></body></html>'};
    if (selection.endsWith('bad.pdf')) return {kind:'pdf',path:selection,base64:btoa('broken')};
    return {kind:'pdf',path:selection,base64:PDF_FIXTURE};
  }
  throw new Error(cmd);
}};
localStorage.clear();
const delay = ms => new Promise(r => setTimeout(r,ms));
const wait = async fn => { for(let i=0;i<120;i++){if(fn())return;await delay(150);}throw new Error('等待超时: '+document.querySelector('#write')?.textContent); };

addEventListener('DOMContentLoaded', async () => {
 try {
  await wait(()=>document.querySelector('button[title^="导入"]'));
  const open=()=>document.querySelector('button[title^="导入"]').click();
  open();await wait(()=>document.querySelector('#write h1'));
  report({html:document.querySelector('#write h1').textContent,unsafe:!!document.querySelector('#write script,#write iframe,[onerror]')});
  selection='/sample.pdf';open();
  const q=s=>document.querySelector(s);
  const page=()=>q('input[aria-label="PDF 页码"]');
  const mode=()=>q('select[aria-label="PDF 阅读模式"]');
  const zoom=()=>q('select[aria-label="PDF 缩放"]');
  const vp=()=>q('.linguamark-pdf-viewport');
  const toolbar=()=>q('.linguamark-pdf-toolbar');
  const set=(el,v)=>{el.value=String(v);el.dispatchEvent(new Event('change'));};
  const ready=n=>wait(()=>q(`.linguamark-pdf-page[data-page="${n}"] canvas`) && q('.linguamark-pdf-text pre')?.textContent.trim()===`PDF page ${n}`);
  await ready(1);
  const top=toolbar().getBoundingClientRect().top;
  report({initialMode:mode().value,slots:document.querySelectorAll('.linguamark-pdf-page').length,canvases:document.querySelectorAll('canvas').length,top,viewportHeight:vp().clientHeight,scrollHeight:vp().scrollHeight});
  vp().scrollTop=q('.linguamark-pdf-page[data-page="5"]').offsetTop-12;
  await wait(()=>page().value==='5');await ready(5);await delay(200);
  report({verticalPage:page().value,toolbarTop:toolbar().getBoundingClientRect().top,fixed:toolbar().getBoundingClientRect().top===top,canvases:document.querySelectorAll('canvas').length});
  set(page(),12);await ready(12);await delay(200);
  report({jump:page().value,lastDisabled:q('button[aria-label="下一页"]').disabled});
  q('button[aria-label="上一页"]').click();await ready(11);
  set(mode(),'horizontal');await ready(11);await delay(200);
  const bounds=()=>{const c=q('canvas');return {width:c?.getBoundingClientRect().width,height:c?.getBoundingClientRect().height,viewportWidth:vp().clientWidth,viewportHeight:vp().clientHeight,slots:document.querySelectorAll('.linguamark-pdf-page').length};};
  report({horizontalPage:page().value,fit:bounds(),mode:mode().value});
  report('CAPTURE');await delay(400);
  q('button[aria-label="下一页"]').click();await ready(12);
  report({arrowNext:page().value,lastDisabled:q('button[aria-label="下一页"]').disabled,slots:document.querySelectorAll('.linguamark-pdf-page').length});
  set(zoom(),2);await ready(12);await delay(200);vp().scrollTop=300;await delay(100);
  report({zoom:bounds(),scrolled:vp().scrollTop,fixed:toolbar().getBoundingClientRect().top===top});
  set(mode(),'vertical');await ready(12);await delay(200);
  report({returnVertical:page().value,slots:document.querySelectorAll('.linguamark-pdf-page').length});
  set(page(),1);await ready(1);
  set(zoom(),0);set(mode(),'horizontal');set(zoom(),1.5);set(mode(),'vertical');set(mode(),'horizontal');set(zoom(),0);
  await ready(1);await delay(400);
  report({rapidSwitch:mode().value,page:page().value,slots:document.querySelectorAll('.linguamark-pdf-page').length});
  q('#write').style.width='640px';await delay(700);await ready(1);
  report({resizeFit:bounds()});
  q('.linguamark-pdf-text').open=true;await delay(600);await ready(1);
  report({textOpenFit:bounds(),text:q('.linguamark-pdf-text pre').textContent});
  selection='/bad.pdf';open();await wait(()=>q('[role=status]')?.textContent.includes('无法打开'));report({invalid:q('[role=status]').textContent});
  selection='/sample.pdf';open();await delay(10);selection='/sample.HTML';open();await wait(()=>q('#write h1'));await delay(400);
  report({switchBack:q('#write h1').textContent,pdfLeft:!!q('canvas')});
  report('DONE:success');
 }catch(e){report('DONE:failure '+e.message);}
});
