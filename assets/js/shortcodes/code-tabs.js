(function () {
  const animations = new WeakMap();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function getParts(container) {
    return {
      indicator: container.querySelector(":scope > .code-tabs__tablist .code-tabs__indicator"),
      buttons: Array.from(container.querySelectorAll(":scope > .code-tabs__tablist .code-tabs__tab")),
      panels: Array.from(container.querySelectorAll(":scope > .code-tabs__panels > .code-tabs__panel")),
    };
  }

  function getIndicatorMetric(indicator, name, fallback) {
    const value = Number.parseFloat(indicator.style.getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  }

  function setIndicator(indicator, x, width) {
    indicator.style.setProperty("--code-tabs-indicator-x", `${x}px`);
    indicator.style.setProperty("--code-tabs-indicator-width", `${width}px`);
  }

  function trapezoidPosition(t) {
    const accel = 0.28;

    if (t < accel) {
      return (t * t) / (2 * accel * (1 - accel));
    }

    if (t > 1 - accel) {
      return 1 - ((1 - t) * (1 - t)) / (2 * accel * (1 - accel));
    }

    return (t - accel / 2) / (1 - accel);
  }

  function moveIndicator(container, indicator, button) {
    const targetX = button.offsetLeft;
    const targetWidth = button.offsetWidth;
    const oldAnimation = animations.get(container);

    if (oldAnimation) {
      cancelAnimationFrame(oldAnimation);
      animations.delete(container);
    }

    if (!container.classList.contains("code-tabs--ready") || prefersReducedMotion.matches) {
      container.classList.remove("code-tabs--animating");
      setIndicator(indicator, targetX, targetWidth);
      return;
    }

    const startX = getIndicatorMetric(indicator, "--code-tabs-indicator-x", targetX);
    const startWidth = getIndicatorMetric(indicator, "--code-tabs-indicator-width", targetWidth);
    const start = performance.now();
    const duration = 200;

    container.classList.add("code-tabs--animating");

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const progress = trapezoidPosition(t);
      const x = startX + (targetX - startX) * progress;
      const width = startWidth + (targetWidth - startWidth) * progress;

      setIndicator(indicator, x, width);

      if (t < 1) {
        animations.set(container, requestAnimationFrame(tick));
      } else {
        setIndicator(indicator, targetX, targetWidth);
        animations.delete(container);
        container.classList.remove("code-tabs--animating");
      }
    }

    animations.set(container, requestAnimationFrame(tick));
  }

  function activate(container, index) {
    const { indicator, buttons, panels } = getParts(container);
    const activeButton = buttons[index];

    if (indicator && activeButton) {
      moveIndicator(container, indicator, activeButton);
    }

    buttons.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.setAttribute("aria-selected", active ? "true" : "false");
    });

    panels.forEach((panel, panelIndex) => {
      panel.classList.toggle("is-active", panelIndex === index);
    });
  }

  function activateMatchingGroup(group, key) {
    document.querySelectorAll(".code-tabs[data-code-tabs-group]").forEach((container) => {
      if (container.dataset.codeTabsGroup !== group) return;

      const { buttons } = getParts(container);
      const matchingButton = buttons.find((button) => button.dataset.codeTabKey === key);

      if (matchingButton) {
        activate(container, Number(matchingButton.dataset.codeTabIndex));
      }
    });
  }

  function initCodeTabs() {
    document.querySelectorAll(".code-tabs[data-code-tabs]").forEach((container) => {
      if (container.dataset.codeTabsReady === "true") return;
      container.dataset.codeTabsReady = "true";

      const { buttons } = getParts(container);
      const selectedIndex = buttons.findIndex((button) => button.getAttribute("aria-selected") === "true");
      activate(container, selectedIndex >= 0 ? selectedIndex : 0);
      container.classList.add("code-tabs--ready");
    });
  }

  window.addEventListener("resize", () => {
    document.querySelectorAll(".code-tabs[data-code-tabs]").forEach((container) => {
      container.classList.remove("code-tabs--ready");
      const { buttons } = getParts(container);
      const selectedIndex = buttons.findIndex((button) => button.getAttribute("aria-selected") === "true");
      if (selectedIndex >= 0) activate(container, selectedIndex);
      container.classList.add("code-tabs--ready");
    });
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".code-tabs__tab");
    if (!button) return;

    const container = button.closest(".code-tabs[data-code-tabs]");
    if (!container) return;

    const group = container.dataset.codeTabsGroup;
    const key = button.dataset.codeTabKey;

    if (group && key) {
      activateMatchingGroup(group, key);
    } else {
      activate(container, Number(button.dataset.codeTabIndex));
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCodeTabs);
  } else {
    initCodeTabs();
  }
})();
