// Receiving messages with long polling
function SubscribePane(elem, url) {
  function showMessage(message) {
    const lm = elem;
    lm.innerHTML = message;
  }

  async function subscribe() {
    const response = await fetch(url);

    // Got message
    const message = await response.text();
    showMessage(message);
    await subscribe();
  }
  subscribe();
}

SubscribePane(document.getElementById('subscribe'), 'data');
