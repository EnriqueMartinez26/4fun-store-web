'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportReportDialogProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
  title?: string;
  description?: string;
  triggerLabel?: string;
  disabled?: boolean;
}

export function ExportReportDialog({
  onExportExcel,
  onExportPDF,
  title = 'Exportar Reporte',
  description = 'Consolidado de Negocio',
  triggerLabel = 'Exportar',
  disabled = false,
}: ExportReportDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className="h-10 px-4 py-2 border-white/10 hover:bg-white/5 font-bold bg-background text-sm rounded-md uppercase tracking-wide flex items-center gap-2 shadow-sm"
        >
          <Download className="h-4 w-4" />
          DESCARGAR REPORTE
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-10 max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-3xl font-bold tracking-tight text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-primary uppercase tracking-[0.2em] opacity-80">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-10">
          <Button
            variant="outline"
            className="h-24 justify-start px-8 gap-6 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group rounded-3xl"
            onClick={onExportExcel}
          >
            <FileSpreadsheet className="h-10 w-10 text-emerald-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="text-left space-y-1">
              <p className="font-black text-white uppercase text-sm tracking-wide">Libro Excel</p>
              <p className="text-xs font-bold text-muted-foreground opacity-60">
                Formato de Auditoría (.xlsx)
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-24 justify-start px-8 gap-6 border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all group rounded-3xl"
            onClick={onExportPDF}
          >
            <FileText className="h-10 w-10 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="text-left space-y-1">
              <p className="font-black text-white uppercase text-sm tracking-wide">Documento PDF</p>
              <p className="text-xs font-bold text-muted-foreground opacity-60">
                Resumen Ejecutivo (.pdf)
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
