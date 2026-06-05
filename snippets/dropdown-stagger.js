// ============================================================
// DROPDOWN STAGGER ANIMATION
// ============================================================
// Stagger reveals dropdown link items top-to-bottom when a
// Webflow dropdown opens.
//
// Context: Built for a Webflow nav panel where the dropdown
// list items needed to animate in sequentially on click.
//
// Requirements:
// - GSAP loaded before this script
// - Dropdown list background-color should match surrounding
//   panel to avoid visual artifacts during opacity animation
//
// Tune: duration, stagger, y (slide distance px), ease
// ============================================================

function startDropdownAnimWhenReady() {
  if (!window.gsap) {
    setTimeout(startDropdownAnimWhenReady, 50);
    return;
  }
  initDropdownAnim();
}

function initDropdownAnim() {
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.w-dropdown-toggle')) return;
    var dropdown = e.target.closest('.w-dropdown');
    if (!dropdown) return;

    var items = dropdown.querySelectorAll('.w-dropdown-link');

    // Set initial state immediately on click, before the list opens.
    // This ensures items are hidden when the list becomes visible.
    // Note: w--open is added to .w-dropdown-list, not .w-dropdown
    gsap.set(items, { opacity: 0, y: -8 });

    setTimeout(function() {
      var list = dropdown.querySelector('.w-dropdown-list');
      if (list && list.classList.contains('w--open')) {
        gsap.killTweensOf(items);
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform, opacity'
        });
      } else {
        // Dropdown is closing — reset any leftover styles
        gsap.set(items, { clearProps: 'all' });
      }
    }, 10);
  });
}

startDropdownAnimWhenReady();
