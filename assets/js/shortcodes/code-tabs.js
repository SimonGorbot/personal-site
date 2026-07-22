(function () {
  function getParts(container) {
    return {
      buttons: Array.from(container.querySelectorAll(":scope > .code-tabs__tablist .code-tabs__tab")),
      panels: Array.from(container.querySelectorAll(":scope > .code-tabs__panels > .code-tabs__panel")),
    };
  }

  function activate(container, index) {
    const { buttons, panels } = getParts(container);

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
    });
  }

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
