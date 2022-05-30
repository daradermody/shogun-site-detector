const tabToProduct = {}

chrome.webNavigation.onCommitted.addListener(handleNavigation);

chrome.action.onClicked.addListener(handleClick)

function handleClick(tab) {
  const product = tabToProduct[tab.id]
  if (product) {
    chrome.tabs.create({ url: `https://getshogun.com/${product === 'FE' ? 'frontend' : 'page-builder'}` })
  }
}

function handleNavigation({ frameId, tabId, url }) {
  if (frameId !== 0 || url.startsWith('chrome://')) {
    return;
  }

  const injection = {
    target: { tabId },
    function: getShogunProductUsed
  }
  chrome.scripting.executeScript(injection, results => handleResult(results, tabId))
}

function getShogunProductUsed() {
  if (document.querySelector('.shogun-root')) {
    return 'PB';
  } else if (document.querySelector('#frontend-root')) {
    return 'FE';
  }
}

function handleResult(results, tabId) {
  const product = results[0].result
  tabToProduct[tabId] = product
  if (product) {
    chrome.action.setIcon({ tabId, path: `icons/${product}16.png` });
    chrome.action.setBadgeText({ tabId, text: product });
    chrome.action.setTitle({ tabId, title: `You are on a site built with Shogun ${product === 'FE' ? 'Frontend' : 'Page Builder'}` });
  }
}
