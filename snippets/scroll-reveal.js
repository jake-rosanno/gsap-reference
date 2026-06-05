// ============================================================
// SCROLL REVEAL — REUSABLE STAGGER
// ============================================================
// Reveals elements with a staggered animation as they enter
// the viewport on scroll. Supports directional slides (up,
// down, left, right), custom distances, durations, and eases
// via data attributes on the element.
//
// Context: Built for the Driskill project. Used as a reusable
// scroll-triggered reveal system across sections and components.
//
// Requirements:
// - GSAP loaded before this script
// - Add [data-reveal] attribute to any element you want to animate
//
// Attributes:
//   data-reveal              Direction: "up" | "down" | "left" | "right" (default: "up")
//   data-reveal-distance     Slide distance in px (default: 30)
//   data-reveal-duration     Animation duration in seconds (default: 0.9)
//   data-reveal-delay        Delay before animation in seconds (default: 0.08)
//   data-reveal-stagger      Stagger between child elements in seconds (default: 0.20)
//   data-reveal-ease         GSAP ease string (default: "power3.out")
//   data-reveal-start        Viewport trigger point 0-1 (default: 0.78, or 0.96 for .inner-wrapper)
//   data-reveal-targets      CSS selector to target specific children instead of direct children
// ============================================================

(function () {
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (!revealEls.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function startRevealsWhenReady() {
    if (!window.gsap) {
      setTimeout(startRevealsWhenReady, 50);
      return;
    }
    // Let Webflow IX finish applying any inline motion, then take over
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        setTimeout(initReveals, 80);
      });
    });
  }

  function initReveals() {
    function revealNumber(el, attr, fallback) {
      var value = parseFloat(el.getAttribute(attr));
      return isNaN(value) ? fallback : value;
    }

    function revealStart(el) {
      var custom = parseFloat(el.getAttribute('data-reveal-start'));
      if (!isNaN(custom)) return custom;
      if (el.classList.contains('inner-wrapper')) return 0.96;
      return 0.78;
    }

    function revealFromVars(direction, distance) {
      var vars = { autoAlpha: 0 };
      if (direction === 'up')    vars.y =  distance;
      if (direction === 'down')  vars.y = -distance;
      if (direction === 'left')  vars.x =  distance;
      if (direction === 'right') vars.x = -distance;
      return vars;
    }

    function revealTargets(el) {
      var selector = el.getAttribute('data-reveal-targets');
      if (selector) return Array.prototype.slice.call(el.querySelectorAll(selector));
      if (el.children.length > 1) return Array.prototype.slice.call(el.children);
      return [el];
    }

    function clearOldMotion(el) {
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: 'transform,opacity,visibility' });
    }

    function prepareReveal(el) {
      var direction = el.getAttribute('data-reveal') || 'up';
      var distance  = revealNumber(el, 'data-reveal-distance', 30);
      var targets   = revealTargets(el);

      clearOldMotion(el);

      if (reduceMotion) {
        gsap.set(targets, { autoAlpha: 1, x: 0, y: 0, clearProps: 'transform,opacity,visibility' });
        return;
      }

      gsap.killTweensOf(targets);
      gsap.set(targets, revealFromVars(direction, distance));
    }

    function playReveal(el) {
      if (el.dataset.revealed === 'true') return;
      el.dataset.revealed = 'true';

      var direction = el.getAttribute('data-reveal') || 'up';
      var distance  = revealNumber(el, 'data-reveal-distance', 30);
      var duration  = revealNumber(el, 'data-reveal-duration', 0.9);
      var delay     = revealNumber(el, 'data-reveal-delay', 0.08);
      var stagger   = revealNumber(el, 'data-reveal-stagger', 0.20);
      var targets   = revealTargets(el);

      clearOldMotion(el);

      if (reduceMotion) {
        gsap.set(targets, { autoAlpha: 1, x: 0, y: 0, clearProps: 'transform,opacity,visibility' });
        return;
      }

      gsap.fromTo(targets, revealFromVars(direction, distance), {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: duration,
        delay: delay,
        stagger: stagger,
        ease: el.getAttribute('data-reveal-ease') || 'power3.out',
        clearProps: 'transform,opacity,visibility',
      });
    }

    function checkReveals() {
      revealEls.forEach(function (el) {
        if (el.dataset.revealed === 'true') return;
        clearOldMotion(el);
        var rect = el.getBoundingClientRect();
        var triggerLine = window.innerHeight * revealStart(el);
        if (rect.top <= triggerLine && rect.bottom >= 0) {
          playReveal(el);
        }
      });
    }

    var ticking = false;

    function requestCheck() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        checkReveals();
      });
    }

    revealEls.forEach(prepareReveal);
    checkReveals();

    window.addEventListener('scroll', requestCheck, { passive: true });
    window.addEventListener('resize', requestCheck);
  }

  startRevealsWhenReady();
})();
