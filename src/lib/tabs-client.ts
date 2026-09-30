/**
 * Accessible tabs as progressive enhancement.
 * Markup: [data-tabs] > (.js-only) [data-tablist] > button[data-tab="x"]  +  [data-tab-panel="x"]
 * Without JS every panel is visible (each keeps its own heading) and the tab buttons are hidden.
 * With JS: roles/ARIA are added, only the selected panel is shown and panel headings become
 * visually hidden (the tab already names the panel).
 */
import type { DayCode } from '../config/site';
import { todayTab } from './schedule';
import { nextTabIndex } from './tabs';

export function initTabs(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-tabs]').forEach((container, index) => {
    const list = container.querySelector<HTMLElement>('[data-tablist]');
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[data-tab]')];
    const panels = [...container.querySelectorAll<HTMLElement>('[data-tab-panel]')];
    if (!list || tabs.length === 0) return;

    list.setAttribute('role', 'tablist');
    tabs.forEach((tab) => {
      const value = tab.dataset.tab!;
      const panel = panels.find((p) => p.dataset.tabPanel === value);
      tab.id ||= `tab-${index}-${value}`;
      tab.setAttribute('role', 'tab');
      if (panel) {
        panel.id ||= `panel-${index}-${value}`;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        panel.tabIndex = 0;
        tab.setAttribute('aria-controls', panel.id);
        panel.querySelector('[data-tab-title]')?.classList.add('visually-hidden');
      }
    });

    const select = (value: string, focus = false) => {
      tabs.forEach((tab) => {
        const selected = tab.dataset.tab === value;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focus) tab.focus();
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.tabPanel !== value;
      });
    };

    const values = tabs.map((tab) => tab.dataset.tab!);
    const initial =
      container.dataset.tabsInitial === 'today'
        ? todayTab(new Date(), values as DayCode[])
        : values[0]!;
    select(initial);

    list.addEventListener('click', (event) => {
      const tab = (event.target as Element).closest<HTMLButtonElement>('[data-tab]');
      if (tab) select(tab.dataset.tab!);
    });
    list.addEventListener('keydown', (event) => {
      const current = tabs.findIndex((tab) => tab === document.activeElement);
      if (current < 0) return;
      const next = nextTabIndex(event.key, current, tabs.length);
      if (next === null) return;
      event.preventDefault();
      select(values[next]!, true);
    });
  });
}
