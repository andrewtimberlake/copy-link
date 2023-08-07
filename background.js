// On installation
chrome.runtime.onInstalled.addListener(function () {
  // setup context menu items
  const isMac = navigator.platform?.toUpperCase().indexOf('MAC') >= 0;
  let shortcut = isMac ? '⌃ ⌥ C' : 'Ctrl+Alt+C';
  chrome.contextMenus.create({
    title: `Copy Markdown URL (${shortcut})`,
    id: 'copyMarkdown',
    contexts: ['selection'],
  });
  shortcut = isMac ? '⌃ ⇧ C' : 'Ctrl+Shift+C';
  chrome.contextMenus.create({
    title: `Copy HTML URL (${shortcut})`,
    id: 'copyHTML',
    contexts: ['selection'],
  });
});

// On key commands (setup in manifest.json)
chrome.commands.onCommand.addListener(function (command) {
  if (command === 'copyMarkdown') {
    copyLink('markdown');
  }
  if (command === 'copyHTML') {
    copyLink('html');
  }
});

// On context menu click
chrome.contextMenus.onClicked.addListener(function (clickData, tab) {
  const { menuItemId, pageUrl, selectionText } = clickData;

  if (menuItemId === 'copyMarkdown') {
    copyLink('markdown', tab);
  }
  if (menuItemId === 'copyHTML') {
    copyLink('html', tab);
  }
});

// Get the tab if not supplied and execute script to copy the selected text and url to the clipboard. It has to be executed through a script because the clipboard API is not available in a service worker.
async function copyLink(linkFormat, tab) {
  console.log('tab', tab);
  if (!tab) {
    [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
  }
  console.log('tab', tab);
  chrome.scripting.executeScript(
    {
      args: [linkFormat],
      func: doCopy,
      target: { tabId: tab.id },
    },
    (result) => {}
  );
}

// The actual function that copies the selected text and url to the clipboard
function doCopy(linkFormat) {
  var selectedText = window.getSelection().toString();
  // console.log('selectedText', selectedText);
  var pageUrl = window.location.href;

  var clipboardText;
  if (linkFormat === 'html') {
    const type = 'text/html';
    const clipboardText = `<a href="${pageUrl}">${selectedText}</a>`;
    // console.log('clipboardText', clipboardText);
    const data = [
      new ClipboardItem({
        [type]: new Blob([clipboardText], { type }),
        ['text/plain']: new Blob([selectedText], { type: 'text/plain' }),
      }),
    ];
    navigator.clipboard.write(data).then(
      function () {
        // console.log('Done!');
      },
      function () {
        // console.log('Error!');
      }
    );
  } else if (linkFormat === 'markdown') {
    clipboardText = '[' + selectedText + '](' + pageUrl + ')';
    navigator.clipboard.writeText(clipboardText).then(
      function () {
        // console.log('Done!');
      },
      function () {
        // console.log('Error!');
      }
    );
  }
}
