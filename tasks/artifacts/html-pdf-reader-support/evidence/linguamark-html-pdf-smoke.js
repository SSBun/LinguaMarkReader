const PDF_FIXTURE="JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUiA1IDAgUl0gL0NvdW50IDIgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA3IDAgUiA+PiA+PiAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCA0NSA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDcyMCBUZCAoUERGIGZpcnN0IHBhZ2UpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9SZXNvdXJjZXMgPDwgL0ZvbnQgPDwgL0YxIDcgMCBSID4+ID4+IC9Db250ZW50cyA2IDAgUiA+PgplbmRvYmoKNiAwIG9iago8PCAvTGVuZ3RoIDQ2ID4+CnN0cmVhbQpCVCAvRjEgMjQgVGYgNzIgNzIwIFRkIChQREYgc2Vjb25kIHBhZ2UpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKNyAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgPj4KZW5kb2JqCnhyZWYKMCA4CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDI0NyAwMDAwMCBuIAowMDAwMDAwMzQyIDAwMDAwIG4gCjAwMDAwMDA0NjggMDAwMDAgbiAKMDAwMDAwMDU2NCAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDggL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjYzNAolJUVPRg==";
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
    const open = () => document.querySelector('button[title^="导入"]').click();
    open();
    await wait(()=>document.querySelector('#write h1'));
    report({html: document.querySelector('#write h1').textContent, unsafe:!!document.querySelector('#write script,#write iframe,[onerror]'), scriptRan:!!window.BAD, outline:!!document.querySelector('.linguamark-markdown-toc-list a'), imageSource:document.querySelector('#write img').getAttribute('src')});
    selection='/sample.pdf';open();
    await wait(()=>document.querySelector('.linguamark-pdf [role=status]')?.textContent==='第 1 / 2 页');
    await wait(()=>document.querySelector('.linguamark-pdf-toolbar button:last-of-type')?.disabled===false);
    const canvas=document.querySelector('canvas');
    const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
    let ink=0; for(let i=0;i<pixels.length;i+=4)if(pixels[i]<180&&pixels[i+3]>0)ink++;
    report({pdf:document.querySelector('[role=status]').textContent,canvas:[canvas.width,canvas.height],ink,text:document.querySelector('.linguamark-pdf-text pre').textContent});
    document.querySelector('.linguamark-pdf-toolbar button:last-of-type').click();
    await wait(()=>document.querySelector('.linguamark-pdf-text pre')?.textContent.includes('second'));
    report({page2:document.querySelector('.linguamark-pdf-text pre').textContent});
    const zoom=document.querySelector('.linguamark-pdf-toolbar select');zoom.value='2';zoom.dispatchEvent(new Event('change'));
    await wait(()=>!zoom.disabled);
    report({zoom:document.querySelector('canvas').style.width});
    selection='/bad.pdf';open();await wait(()=>document.querySelector('[role=status]')?.textContent.includes('无法打开'));
    report({invalid:document.querySelector('[role=status]').textContent});
    selection='/sample.pdf';open();await delay(10);selection='/sample.HTML';open();
    await wait(()=>document.querySelector('#write h1'));
    await delay(400);report({switchBack:document.querySelector('#write h1').textContent,pdfLeft:!!document.querySelector('canvas')});
    report('DONE:success');
  } catch(e){report('DONE:failure '+e.message);}
});
