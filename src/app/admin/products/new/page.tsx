"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ProductApiService } from "@/lib/services/ProductApiService";
import { TaxonomyApiService } from "@/lib/services/TaxonomyApiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, ArrowLeft, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { adminProductBaseSchema, type AdminProductBaseValues } from "@/lib/schemas";
import { DEVELOPERS, SPEC_PRESETS } from "@/lib/constants";
import { SpecReferenceTable } from "@/components/admin/spec-reference-table";
import { useImageUpload } from "@/hooks/use-image-upload";

export default function NewProductPage() {
  const router = useRouter();
  useAuth();
  const { toast } = useToast();
  const [isCustomDev, setIsCustomDev] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([TaxonomyApiService.getPlatforms(), TaxonomyApiService.getGenres()])
      .then(([pData, gData]) => {
        setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
        setGenres(Array.isArray(gData) ? gData : (gData?.data || []));
      })
      .catch(err => {
        console.error("[NewProduct] Error loading taxonomy:", err);
        toast({ variant: "destructive", title: "Error de conexión", description: "No se pudieron cargar las opciones del formulario." });
      });
  }, [toast]);

  const form = useForm<AdminProductBaseValues>({
    resolver: zodResolver(adminProductBaseSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      platformId: "",
      genreId: "",
      type: "Digital",
      developer: "Nintendo",
      specPreset: "Mid",
      imageId: "",
    },
  });

  const { isUploading, handleImageUpload } = useImageUpload({
    onSuccess: (url) => form.setValue("imageId", url),
    successMessage: "Imagen de portada actualizada."
  });

  const onSubmit = async (data: AdminProductBaseValues) => {
    try {
      await ProductApiService.create({ ...data, developer: data.developer || '' });
      toast({ title: "Publicación creada", description: "El producto fue agregado al catálogo correctamente." });
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al crear", description: error.message || "No se pudo crear el producto." });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary font-bold text-xs uppercase tracking-widest">
          <Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Cancelar</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none bg-card/40 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-white/5 bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-2xl"><PlusCircle className="h-6 w-6 text-primary" /></div>
                <div>
                  <CardTitle className="text-2xl font-headline font-black italic tracking-tight">Nueva Publicación</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Nombre del Juego</FormLabel>
                      <FormControl><Input placeholder="Elden Ring" className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Descripción</FormLabel>
                      <FormControl><Textarea placeholder="Contá de qué se trata el juego..." className="min-h-[140px] bg-white/5 border-white/10 rounded-2xl leading-relaxed" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="trailerUrl" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">URL del Trailer (YouTube)</FormLabel>
                      <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." className="h-14 bg-white/5 border-white/10 rounded-2xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Precio (ARS)</FormLabel>
                        <FormControl><Input type="number" step="0.01" className="h-14 bg-white/5 border-white/10 rounded-2xl font-black text-primary" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="stock" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Stock</FormLabel>
                        <FormControl><Input type="number" className="h-14 bg-white/5 border-white/10 rounded-2xl font-black" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="platformId" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Plataforma</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold"><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-3xl border-white/10 rounded-2xl">{platforms.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="genreId" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Género</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold"><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-3xl border-white/10 rounded-2xl">{genres.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="developer" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Desarrollador</FormLabel>
                      {isCustomDev ? (
                        <div className="flex gap-3">
                          <FormControl><Input className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold" placeholder="Ej: FromSoftware" value={field.value} onChange={field.onChange} autoFocus /></FormControl>
                          <Button type="button" variant="outline" className="border-white/10 h-14 rounded-2xl px-6 font-bold" onClick={() => { setIsCustomDev(false); field.onChange(DEVELOPERS[0]); }}>CANCELAR</Button>
                        </div>
                      ) : (
                        <Select onValueChange={(val) => { if (val === '__custom__') { setIsCustomDev(true); field.onChange(''); } else { field.onChange(val); } }} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold"><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-3xl border-white/10 rounded-2xl">
                            {DEVELOPERS.map((dev) => (<SelectItem key={dev} value={dev}>{dev}</SelectItem>))}
                            <SelectItem value="__custom__" className="text-primary font-bold">+ Agregar otro</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="specPreset" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Requisitos del Sistema</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold"><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-card/95 backdrop-blur-3xl border-white/10 rounded-2xl">{SPEC_PRESETS.map((preset) => (<SelectItem key={preset} value={preset}>{preset}</SelectItem>))}</SelectContent>
                      </Select>
                      <SpecReferenceTable />
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full h-16 bg-primary text-white font-bold text-lg tracking-widest rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all" disabled={form.formState.isSubmitting || isUploading}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><PlusCircle className="mr-3 h-6 w-6" /> CREAR PUBLICACIÓN</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none bg-card/40 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="p-8 pb-4 border-b border-white/5 bg-primary/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" /> Imagen de Portada
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-black/40 mb-6">
                {form.watch("imageId") ? (
                  <>
                    <Image src={form.watch("imageId") || ""} alt="Preview" fill className="object-cover" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-2xl shadow-xl backdrop-blur-md bg-destructive/80 hover:bg-destructive transition-all" onClick={() => form.setValue("imageId", "")}><X className="h-5 w-5" /></Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full opacity-20"><ImageIcon className="h-12 w-12" /></div>
                )}
              </div>
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="bg-white/5 border-white/10 rounded-xl" />
              {isUploading && (
                <div className="flex items-center justify-center gap-3 text-primary animate-pulse mt-4">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Subiendo...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
