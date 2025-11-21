import React from 'react';

type PanelProps = React.PropsWithChildren<{
  header: string;
}>;

export function Panel({ header, children }: PanelProps) {
  return (
    <div className="border-b border-neutral-200 pb-8">
      <h3 className="text-xs font-medium tracking-widest mb-6 uppercase text-neutral-900">
        {header}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
