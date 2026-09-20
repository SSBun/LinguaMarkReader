const PDF_FIXTURE="JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUiA1IDAgUiA3IDAgUiA5IDAgUiAxMSAwIFIgMTMgMCBSIDE1IDAgUiAxNyAwIFIgMTkgMCBSIDIxIDAgUiAyMyAwIFIgMjUgMCBSXSAvQ291bnQgMTIgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA3OTIgNjEyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDQgMCBSID4+CmVuZG9iago0IDAgb2JqCjw8IC9MZW5ndGggNDEgPj4Kc3RyZWFtCkJUIC9GMSAyNCBUZiA3MiA1NDAgVGQgKFBERiBwYWdlIDEpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDc5MiA2MTJdIC9SZXNvdXJjZXMgPDwgL0ZvbnQgPDwgL0YxIDI3IDAgUiA+PiA+PiAvQ29udGVudHMgNiAwIFIgPj4KZW5kb2JqCjYgMCBvYmoKPDwgL0xlbmd0aCA0MSA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDU0MCBUZCAoUERGIHBhZ2UgMikgVGogRVQKZW5kc3RyZWFtCmVuZG9iago3IDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNzkyIDYxMl0gL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgMjcgMCBSID4+ID4+IC9Db250ZW50cyA4IDAgUiA+PgplbmRvYmoKOCAwIG9iago8PCAvTGVuZ3RoIDQxID4+CnN0cmVhbQpCVCAvRjEgMjQgVGYgNzIgNTQwIFRkIChQREYgcGFnZSAzKSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCjkgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA3OTIgNjEyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDEwIDAgUiA+PgplbmRvYmoKMTAgMCBvYmoKPDwgL0xlbmd0aCA0MSA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDU0MCBUZCAoUERGIHBhZ2UgNCkgVGogRVQKZW5kc3RyZWFtCmVuZG9iagoxMSAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDc5MiA2MTJdIC9SZXNvdXJjZXMgPDwgL0ZvbnQgPDwgL0YxIDI3IDAgUiA+PiA+PiAvQ29udGVudHMgMTIgMCBSID4+CmVuZG9iagoxMiAwIG9iago8PCAvTGVuZ3RoIDQxID4+CnN0cmVhbQpCVCAvRjEgMjQgVGYgNzIgNTQwIFRkIChQREYgcGFnZSA1KSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCjEzIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNzkyIDYxMl0gL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgMjcgMCBSID4+ID4+IC9Db250ZW50cyAxNCAwIFIgPj4KZW5kb2JqCjE0IDAgb2JqCjw8IC9MZW5ndGggNDEgPj4Kc3RyZWFtCkJUIC9GMSAyNCBUZiA3MiA1NDAgVGQgKFBERiBwYWdlIDYpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKMTUgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA3OTIgNjEyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDE2IDAgUiA+PgplbmRvYmoKMTYgMCBvYmoKPDwgL0xlbmd0aCA0MSA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDU0MCBUZCAoUERGIHBhZ2UgNykgVGogRVQKZW5kc3RyZWFtCmVuZG9iagoxNyAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDc5MiA2MTJdIC9SZXNvdXJjZXMgPDwgL0ZvbnQgPDwgL0YxIDI3IDAgUiA+PiA+PiAvQ29udGVudHMgMTggMCBSID4+CmVuZG9iagoxOCAwIG9iago8PCAvTGVuZ3RoIDQxID4+CnN0cmVhbQpCVCAvRjEgMjQgVGYgNzIgNTQwIFRkIChQREYgcGFnZSA4KSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCjE5IDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNzkyIDYxMl0gL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgMjcgMCBSID4+ID4+IC9Db250ZW50cyAyMCAwIFIgPj4KZW5kb2JqCjIwIDAgb2JqCjw8IC9MZW5ndGggNDEgPj4Kc3RyZWFtCkJUIC9GMSAyNCBUZiA3MiA1NDAgVGQgKFBERiBwYWdlIDkpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKMjEgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA3OTIgNjEyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDIyIDAgUiA+PgplbmRvYmoKMjIgMCBvYmoKPDwgL0xlbmd0aCA0MiA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDU0MCBUZCAoUERGIHBhZ2UgMTApIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKMjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA3OTIgNjEyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDI0IDAgUiA+PgplbmRvYmoKMjQgMCBvYmoKPDwgL0xlbmd0aCA0MiA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDU0MCBUZCAoUERGIHBhZ2UgMTEpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKMjUgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA3OTIgNjEyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAyNyAwIFIgPj4gPj4gL0NvbnRlbnRzIDI2IDAgUiA+PgplbmRvYmoKMjYgMCBvYmoKPDwgL0xlbmd0aCA0MiA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDU0MCBUZCAoUERGIHBhZ2UgMTIpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKMjcgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iagp4cmVmCjAgMjgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDE5MCAwMDAwMCBuIAowMDAwMDAwMzE3IDAwMDAwIG4gCjAwMDAwMDA0MDggMDAwMDAgbiAKMDAwMDAwMDUzNSAwMDAwMCBuIAowMDAwMDAwNjI2IDAwMDAwIG4gCjAwMDAwMDA3NTMgMDAwMDAgbiAKMDAwMDAwMDg0NCAwMDAwMCBuIAowMDAwMDAwOTcyIDAwMDAwIG4gCjAwMDAwMDEwNjQgMDAwMDAgbiAKMDAwMDAwMTE5MyAwMDAwMCBuIAowMDAwMDAxMjg1IDAwMDAwIG4gCjAwMDAwMDE0MTQgMDAwMDAgbiAKMDAwMDAwMTUwNiAwMDAwMCBuIAowMDAwMDAxNjM1IDAwMDAwIG4gCjAwMDAwMDE3MjcgMDAwMDAgbiAKMDAwMDAwMTg1NiAwMDAwMCBuIAowMDAwMDAxOTQ4IDAwMDAwIG4gCjAwMDAwMDIwNzcgMDAwMDAgbiAKMDAwMDAwMjE2OSAwMDAwMCBuIAowMDAwMDAyMjk4IDAwMDAwIG4gCjAwMDAwMDIzOTEgMDAwMDAgbiAKMDAwMDAwMjUyMCAwMDAwMCBuIAowMDAwMDAyNjEzIDAwMDAwIG4gCjAwMDAwMDI3NDIgMDAwMDAgbiAKMDAwMDAwMjgzNSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDI4IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgoyOTA2CiUlRU9G";
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


addEventListener('DOMContentLoaded', async()=>{
 try {
  await wait(()=>document.querySelector('button[title^="导入"]'));
  selection='/sample.pdf';document.querySelector('button[title^="导入"]').click();
  const q=s=>document.querySelector(s);
  await wait(()=>q('canvas'));
  const page=q('input[aria-label="PDF 页码"]'), zoom=q('select[aria-label="PDF 缩放"]'), mode=q('select[aria-label="PDF 阅读模式"]'), vp=q('.linguamark-pdf-viewport');
  const set=(el,v)=>{el.value=String(v);el.dispatchEvent(new Event('change'));};
  const observations=[];
  const record=(action,expected)=>{observations.push({action,expected,actual:Number(page.value)});};
  set(zoom,.75);await delay(700);
  report({height:vp.clientHeight,pageHeight:q('.linguamark-pdf-page').offsetHeight});
  set(page,5);await delay(500);record('jump5',5);
  for(let expected=4;expected>=1;expected--){q('button[aria-label="上一页"]').click();await delay(300);record('previous',expected);}
  set(page,12);await delay(500);record('jumpLast',12);
  q('button[aria-label="上一页"]').click();await delay(300);record('previousAtClamp',11);
  set(mode,'horizontal');await delay(400);record('horizontal',11);
  set(mode,'vertical');await delay(600);record('vertical',11);
  vp.scrollTop=0;await delay(500);record('manualHome',1);
  vp.scrollTop=vp.scrollHeight;await delay(500);record('manualEnd',12);
  set(page,1);await delay(400);record('jumpFirst',1);
  report({observations,firstDisabled:q('button[aria-label="上一页"]').disabled});
  report(observations.every(o=>o.expected===o.actual)?'DONE:success':'DONE:failure page selection mismatch');
 }catch(e){report('DONE:failure '+e.message);}
});
