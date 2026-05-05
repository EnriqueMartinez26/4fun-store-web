"use client";

export function SpecReferenceTable() {
  const specs = [
    { level: 'HIGH', cpu: 'Ryzen 7 7700X / i7-13700K', ram: '32 GB DDR5', gpu: 'RTX 4080 / RX 7900 XT' },
    { level: 'MID', cpu: 'Ryzen 5 7600X / i5-13600K', ram: '16 GB DDR5', gpu: 'RTX 4070 / RX 7800 XT' },
    { level: 'LOW', cpu: 'Ryzen 5 5600X / i5-12400', ram: '16 GB DDR4', gpu: 'RTX 4060 / RX 6700' },
  ];

  return (
    <div className="mt-4 p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Guía de Referencia Técnica</h4>
        <div className="h-px flex-1 mx-4 bg-primary/10" />
      </div>
      <div className="grid grid-cols-4 gap-4 text-[9px] font-black uppercase tracking-widest text-white/40">
        <div className="col-span-1">NIVEL</div>
        <div className="col-span-1">CPU</div>
        <div className="col-span-1">RAM</div>
        <div className="col-span-1">GPU</div>
      </div>
      <div className="space-y-3">
        {specs.map((spec) => (
          <div key={spec.level} className="grid grid-cols-4 gap-4 text-[10px] font-bold border-t border-white/5 pt-3 items-center group hover:bg-white/5 transition-colors -mx-2 px-2 rounded-lg">
            <div className="col-span-1 font-black text-primary">{spec.level}</div>
            <div className="col-span-1 text-white/70 text-[9px] leading-tight">{spec.cpu}</div>
            <div className="col-span-1 text-white/70 text-[9px]">{spec.ram}</div>
            <div className="col-span-1 text-white/70 text-[9px] leading-tight">{spec.gpu}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
