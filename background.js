chrome.commands.onCommand.addListener(function (command) {
  if (command === 'copyMarkdown') {
    copyLink('markdown');
  }
  if (command === 'copyHTML') {
    copyLink('html');
  }
});

async function copyLink(linkFormat) {
  console.log(`copyLink()`, arguments);
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  chrome.scripting.executeScript(
    {
      args: [linkFormat],
      func: doCopy,
      target: { tabId: tab.id },
    },
    (result) => {}
  );
}

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
