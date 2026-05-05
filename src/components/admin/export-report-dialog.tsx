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
          className="h-11 px-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-bold text-[10px] uppercase tracking-wide rounded-xl transition-all shadow-xl hover:shadow-primary/10"
        >
          <Download className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-[10px] font-bold text-primary mt-2 uppercase tracking-widest">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-8">
          <Button
            variant="outline"
            className="h-20 justify-start px-6 gap-5 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
            onClick={onExportExcel}
          >
            <FileSpreadsheet className="h-8 w-8 text-emerald-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-bold text-white uppercase text-xs tracking-tight">Libro Excel</p>
              <p className="text-[9px] font-bold text-muted-foreground">
                Formato de Auditoría (.xlsx)
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-20 justify-start px-6 gap-5 border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
            onClick={onExportPDF}
          >
            <FileText className="h-8 w-8 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-bold text-white uppercase text-xs tracking-tight">Documento PDF</p>
              <p className="text-[9px] font-bold text-muted-foreground">Resumen Ejecutivo (.pdf)</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
