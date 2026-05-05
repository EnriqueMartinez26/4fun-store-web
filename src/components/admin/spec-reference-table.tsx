"use client";

interface SpecReferenceTableProps {
  selectedLevel?: string | null;
}

export function SpecReferenceTable({ selectedLevel }: SpecReferenceTableProps) {
  const specsMap: Record<string, { cpu: string; ram: string; gpu: string }> = {
    High: { cpu: 'Ryzen 7 7700X / i7-13700K', ram: '32 GB DDR5', gpu: 'RTX 4080 / RX 7900 XT' },
    Mid: { cpu: 'Ryzen 5 7600X / i5-13600K', ram: '16 GB DDR5', gpu: 'RTX 4070 / RX 7800 XT' },
    Low: { cpu: 'Ryzen 5 5600X / i5-12400', ram: '16 GB DDR4', gpu: 'RTX 4060 / RX 6700' },
  };

  const currentSpecs = selectedLevel && specsMap[selectedLevel] 
    ? specsMap[selectedLevel] 
    : { cpu: '-', ram: '-', gpu: '-' };

  return (
    <div className="mt-4 p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">
          Referencia Técnica: <span className="text-primary">{selectedLevel || "Ninguno"}</span>
        </h4>
        <div className="h-px flex-1 mx-4 bg-primary/10" />
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">CPU</p>
          <p className="text-xs font-bold text-white/80 leading-tight">{currentSpecs.cpu}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">RAM</p>
          <p className="text-xs font-bold text-white/80">{currentSpecs.ram}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">GPU</p>
          <p className="text-xs font-bold text-white/80 leading-tight">{currentSpecs.gpu}</p>
        </div>
      </div>

      {!selectedLevel && (
        <p className="text-[9px] font-bold uppercase tracking-widest text-primary/40 italic">
          Seleccioná un nivel para ver los requerimientos sugeridos.
        </p>
      )}
    </div>
  );
}
