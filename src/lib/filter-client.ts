/**
 * Discipline filter (progressive enhancement): without JS the chips are hidden (.js-only)
 * and every card stays visible.
 */
export function initDisciplineFilter(root: ParentNode = document): void {
  const group = root.querySelector<HTMLElement>('[data-filter]');
  if (!group) return;
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('button[data-value]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-filter-item]')];
  const status = root.querySelector<HTMLElement>('[data-filter-status]');
  const template = status?.dataset.template ?? '{count}';

  const apply = (value: string) => {
    let visible = 0;
    for (const item of items) {
      const match = value === 'all' || item.dataset.category === value;
      item.hidden = !match;
      if (match) visible += 1;
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.value === value));
    }
    if (status) status.textContent = template.replace('{count}', String(visible));
  };

  group.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-value]');
    if (button?.dataset.value) apply(button.dataset.value);
  });
}
