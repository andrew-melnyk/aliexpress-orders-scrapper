chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'downloadCSV') {
    if (!message.url) {
      console.error('No URL provided for download');
      return;
    }

    chrome.downloads.download({
      url: message.url,
      filename: message.filename,
      saveAs: true
    }).catch(error => {
      console.error('Download failed:', error);
    });
  }
}); 