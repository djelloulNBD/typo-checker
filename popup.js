// Autofill textarea with page text
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.scripting.executeScript({
    target: {tabId: tabs[0].id},
    func: () => {
      const el = document.querySelector('#viewerWEB');
      return el ? el.innerText : '';
    }
  }, function(results) {
    if (results && results[0] && results[0].result) {
      let text = results[0].result;
      // Filter out unwanted phrases
      const unwanted = [
        'Listen',
        'English',
        'You have successfully validated this challenge',
        'Next',
        'Did you enjoy the content?',
        'Like',
        'Dislike'
      ];
      text = text.split('\n').filter(line =>
        !unwanted.some(phrase => line.trim() === phrase)
      ).join('\n');
      document.getElementById('text').value = text;
    }
  });
});

document.getElementById('copy').onclick = function() {
  const text = document.getElementById('text').value;
  navigator.clipboard.writeText(text);
};