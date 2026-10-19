// Activate touch controls directly on release. Some embedded Chromium players
// suppress compatibility clicks after a captured canvas drag. Keep real mouse,
// keyboard and assistive-technology clicks on their normal path, and suppress
// only the duplicate native touch click after our explicit activation.
const activated = new WeakMap();
document.addEventListener('pointerup', (event) => {
  if (event.pointerType !== 'touch' || !event.isPrimary) return;
  const button = event.target.closest?.('button');
  if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
  activated.set(button, performance.now());
  button.click();
});
document.addEventListener('click', (event) => {
  const button = event.target.closest?.('button');
  // Older pointer-capable browsers still expose the follow-up click as a
  // MouseEvent. Its nonzero detail distinguishes it from keyboard/AT clicks.
  const fromTouch = event.pointerType === 'touch'
    || event.sourceCapabilities?.firesTouchEvents
    || (!('pointerType' in event) && event.detail > 0);
  if (button && event.isTrusted && fromTouch
      && performance.now() - (activated.get(button) ?? -Infinity) < 750) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);
