const getCheckmark = () =>
  document.querySelector(`[aria-label*="verified accounts"]`);

async function isBlue() {
  const checkmark = getCheckmark();

  if (!checkmark) return false;

  checkmark.click();

  const hoverCard = await waitForHoverCard();
  const blueText = Array.from(hoverCard.querySelectorAll('span')).find((span) =>
    span.innerText.includes('subscribed to Twitter Blue')
  );

  checkmark.click();

  return !!blueText;
}

function markAsBlue() {
  const profileCheck = getCheckmark().querySelector('svg');
  const headerCheck = document.querySelector(
    `svg[aria-label="Verified account"]`
  );

  const checks = [profileCheck, headerCheck];

  if (!checks.length) return;

  checks
    .filter((check) => check.style)
    .forEach((check) => {
      check.style.rotate = `0.5turn`;
      check.style.fill = `#ee8383`;
    });
}

async function go() {
  try {
    await waitForTimeline();
    await waitForCheckmark();

    const isBlueCheck = await isBlue();

    if (isBlueCheck) {
      console.log('🔵 IS BLUE');
      markAsBlue();
    } else {
      console.log('NOT BLUE and NOT VERIFIED');
    }
  } catch (err) {
    console.log('❌ Checkmark not found');
  }
}

async function waitForTimeline() {
  let count = 0;
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (++count > 1000) {
        clearInterval(interval);
        reject();
      }

      const timeline = document.querySelector(`[aria-label="Home timeline"]`);

      if (timeline) {
        clearInterval(interval);
        resolve();
      }
    }, 10);
  });
}

async function waitForCheckmark() {
  let count = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (++count > 500) {
        clearInterval(interval);
        reject();
      }

      const timeline = getCheckmark();

      if (timeline) {
        clearInterval(interval);
        resolve();
      }
    }, 10);
  });
}

async function waitForHoverCard() {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const hoverCard = document.querySelector(`[data-testId="HoverCard"]`);
      if (hoverCard) {
        clearInterval(interval);
        resolve(hoverCard);
      }
    }, 10);
  });
}

go();

(() => {
  let oldPushState = history.pushState;
  history.pushState = function pushState() {
    let ret = oldPushState.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };

  let oldReplaceState = history.replaceState;
  history.replaceState = function replaceState() {
    let ret = oldReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });
})();

['pushstate', 'replacestate', 'locationchange'].forEach((eventName) =>
  window.addEventListener(eventName, () => {
    console.log('🔵 EVENT', eventName);
    go();
  })
);
