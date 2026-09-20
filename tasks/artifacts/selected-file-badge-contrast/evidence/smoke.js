const report = value => window.webkit.messageHandlers.smoke.postMessage(typeof value === 'string' ? value : JSON.stringify(value));
window.__TAURI_INTERNALS__ = { transformCallback: () => 1, invoke: async command => command === 'plugin:event|listen' ? 1 : null };
localStorage.clear();
addEventListener('DOMContentLoaded', async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  document.body.innerHTML = '<main style="padding:40px;width:500px"><h2>文件类型标签配色验证</h2><input id="primer" aria-label="键盘焦点起点"><div id="rows"></div><article id="write"><p>正文颜色保持原样</p></article></main>';
  const style = element => { const css = getComputedStyle(element); return { color: css.color, background: css.backgroundColor }; };
  const paragraph = document.querySelector('#write p');
  const bodyBefore = style(paragraph);
  document.querySelector('#primer').focus();
  const observations = [];
  for (const [kind,label] of [['markdown','MD'],['json','JSON'],['html','HTML'],['pdf','PDF'],['image','IMG'],['other','FILE']]) {
    const button = document.createElement('button');
    button.className = `linguamark-directory-file is-${kind}`;
    button.style.marginBottom='12px';
    const badge = document.createElement('span');badge.className='linguamark-directory-file-badge';badge.textContent=label;
    const name=document.createElement('span');name.textContent=`示例文件 · ${label}`;
    button.append(badge,name);document.querySelector('#rows').append(button);
    const normal = style(badge);
    button.classList.add('is-active');
    const selected = {row:style(button),badge:style(badge)};
    button.focus();
    const focused = {row:style(button),badge:style(badge),focusVisible:button.matches(':focus-visible')};
    observations.push({kind,normal,selected,focused});
  }
  report({observations,bodyUnchanged:JSON.stringify(bodyBefore)===JSON.stringify(style(paragraph))});
  report('CAPTURE');
  await new Promise(resolve=>setTimeout(resolve,400));
  report('DONE:success');
});
