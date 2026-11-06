'use client';

import React, { useRef } from 'react';
import { Palette } from 'lucide-react';
import { UX_VARIANTS, type UXVariantId } from '../../lib/ux-variants';

type Props = {
  variant: UXVariantId;
  onChange: (next: UXVariantId) => void;
};

export default function UxLabSwitcher({ variant, onChange }: Props) {
  const panel = useRef<HTMLElement>(null);
  const activeMeta =
    UX_VARIANTS.find((item) => item.id === variant) ?? UX_VARIANTS[0];

  return (
    <>
      <button
        type="button"
        className="iconbutton"
        aria-label="Change theme"
        title="Change theme"
        popoverTarget="ux-lab-panel"
        data-testid="ux-lab-trigger"
      >
        <Palette size={19} />
      </button>
      <section
        ref={panel}
        id="ux-lab-panel"
        popover="auto"
        className="ux-lab-bar"
        role="region"
        aria-label="UX Experiment Switcher"
        data-testid="ux-lab-switcher"
      >
        <div className="ux-lab-brand">
          <span className="ux-lab-pill">UX Lab · {activeMeta.badge}</span>
          <strong>{activeMeta.name}</strong>
          <span className="ux-lab-tagline">{activeMeta.tagline}</span>
        </div>
        <div
          className="ux-lab-options"
          role="group"
          aria-label="Choose UX variant"
        >
          {UX_VARIANTS.map((item) => {
            const isActive = item.id === variant;
            return (
              <button
                key={item.id}
                type="button"
                className="ux-lab-btn"
                aria-pressed={isActive}
                data-testid={`ux-switch-${item.id}`}
                onClick={() => {
                  panel.current?.hidePopover();
                  onChange(item.id);
                }}
              >
                {item.shortLabel}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
