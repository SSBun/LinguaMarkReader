const report = value => window.webkit.messageHandlers.verify.postMessage(typeof value === 'string' ? value : JSON.stringify(value));
const wait = async predicate => {
  for (let attempt = 0; attempt < 160; attempt++) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('页面内容等待超时');
};
addEventListener('DOMContentLoaded', async () => {
  try {
    if (location.pathname === '/') {
      await wait(() => [...document.querySelectorAll('.project-name')].some(link => link.textContent === 'LinguaMarkReader'));
      const name = [...document.querySelectorAll('.project-name')].find(link => link.textContent === 'LinguaMarkReader');
      const card = name.closest('.collection-card');
      await wait(() => card.querySelector('.release-version').textContent === 'v0.2.0');
      const cards = [...document.querySelectorAll('.collection-card')];
      const observation = {
        page: 'home',
        count: cards.length,
        selected: document.querySelector('#project-list').dataset.projectWhitelist.split(','),
        name: name.textContent,
        details: name.href,
        github: card.querySelector('.project-external').href,
        description: card.querySelector('.project-description').textContent,
        release: card.querySelector('.release-version').textContent,
        allDescriptionsPresent: cards.every(item => item.querySelector('.project-description').textContent.trim()),
        privateProjectAbsent: !cards.some(item => item.querySelector('.project-name').textContent === 'GHFS'),
        renderedWidth: card.getBoundingClientRect().width,
        glassBlur: getComputedStyle(document.documentElement).getPropertyValue('--glass-blur').trim()
      };
      if (observation.count !== 23 || !observation.allDescriptionsPresent || !observation.privateProjectAbsent
        || observation.github !== 'https://github.com/SSBun/LinguaMarkReader' || observation.renderedWidth <= 0) throw new Error('项目卡片不符合预期');
      report(observation);
      location.href = name.href;
    } else {
      await wait(() => document.querySelector('.release-tag')?.textContent === 'v0.2.0');
      const card = document.querySelector('.release-card');
      const observation = {
        page: 'details', url: location.href, title: document.title,
        tag: card.querySelector('.release-tag').textContent,
        releaseURL: card.querySelector('.release-link').href,
        notesPresent: card.querySelector('.release-notes').textContent.includes('PDF'),
        renderedWidth: card.getBoundingClientRect().width
      };
      if (observation.url !== 'https://ssbun.com/project/LinguaMarkReader/' || observation.releaseURL !== 'https://github.com/SSBun/LinguaMarkReader/releases/tag/v0.2.0' || !observation.notesPresent || observation.renderedWidth <= 0) throw new Error('发布日志不符合预期');
      report(observation);
      report('DONE:success');
    }
  } catch (error) { report('DONE:failure ' + error.message); }
});
