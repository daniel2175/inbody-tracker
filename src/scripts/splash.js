// Splash screen show/hide. Original logic (1200ms / 1400ms minimums) preserved.

export function hideSplash(callback) {
  const splash = document.getElementById('splashScreen');
  const minTime = 1200;
  const start = Date.now();
  function doHide() {
    const remaining = minTime - (Date.now() - start);
    setTimeout(
      () => {
        splash.classList.add('fade-out');
        setTimeout(() => {
          splash.style.display = 'none';
          splash.classList.remove('fade-out');
          if (callback) callback();
        }, 500);
      },
      Math.max(0, remaining),
    );
  }
  doHide._start = start;
  return doHide;
}

export function hideSplashNow(callback, startTime) {
  const splash = document.getElementById('splashScreen');
  const minTime = 1400;
  const elapsed = startTime ? Date.now() - startTime : minTime;
  const remaining = Math.max(0, minTime - elapsed);
  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
      splash.classList.remove('fade-out');
      if (callback) callback();
    }, 500);
  }, remaining);
}
