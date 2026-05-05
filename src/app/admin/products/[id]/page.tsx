"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ProductApiService } from "@/lib/services/ProductApiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, Package, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPEC_PRESETS } from "@/lib/constants";
import { SpecReferenceTable } from "@/components/admin/spec-reference-table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { KeyManager } from "@/components/admin/key-manager";
import { adminProductBaseSchema } from "@/lib/schemas";
import { useImageUpload } from "@/hooks/use-image-upload";

const productSchema = adminProductBaseSchema.extend({
  trailerUrl: z.string().optional(),
  isDiscounted: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, stock: 0, platformId: "", genreId: "", type: "Digital",
      developer: "", specPreset: "Mid", imageId: "", trailerUrl: "",
      isDiscounted: false, discountPercentage: 0, active: false,
    },
  });

  const { isUploading, handleImageUpload } = useImageUpload({
    onSuccess: (url) => form.setValue("imageId", url),
    successMessage: "Imagen de portada actualizada."
  });

  const isDigitalProduct = form.watch('type') === 'Digital';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id !== 'new') {
          const entity = await ProductApiService.getForManagement(id);
          const p = entity?.getRawData();
          if (p) {
            form.reset({
              name: p.name,
              description: p.description,
              stock: p.stock,
              platformId: p.platform?.id || "",
              genreId: p.genre?.id || "",
              type: p.type as "Digital" | "Physical",
              developer: p.developer || "",
              specPreset: (p.specPreset || "Mid") as any,
              imageId: p.imageId || "",
              trailerUrl: p.trailerUrl || "",
              isDiscounted: (p.discountPercentage ?? 0) > 0,
              discountPercentage: p.discountPercentage || 0,
              price: p.price,
              active: p.active ?? false,
            });
          }
        }
      } catch (error) {
        console.error("[EditProduct] Error hydration:", error);
        toast({ variant: "destructive", title: "Error al cargar", description: "No se pudo cargar la información del producto." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form, toast]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const payload: any = { ...data };
      if (!data.isDiscounted) payload.discountPercentage = 0;
      await ProductApiService.update(id, payload);
      toast({ title: 'Producto actualizado', description: 'Los cambios se guardaron correctamente.' });
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al guardar", description: error.message || "No se pudieron guardar los cambios." });
    }
  };

  if (id === 'new') return null;
  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin h-10 w-10 text-primary opacity-20" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary font-bold text-xs uppercase tracking-widest">
          <Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Cancelar Edición</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none bg-card/40 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-white/5 bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-2xl"><Package className="h-6 w-6 text-primary" /></div>
                <div>
                  <CardTitle className="text-2xl font-headline font-black italic tracking-tight">Editar Publicación</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Nombre del Juego</FormLabel>
                      <FormControl><Input className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Descripción</FormLabel>
                      <FormControl><Textarea className="min-h-[140px] bg-white/5 border-white/10 rounded-2xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="trailerUrl" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">URL del Trailer (YouTube)</FormLabel>
                      <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." className="h-14 bg-white/5 border-white/10 rounded-2xl" {...field} value={field.value || ""} /></FormControl>
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
                        <FormControl><Input type="number" disabled={isDigitalProduct} className="h-14 bg-white/5 border-white/10 rounded-2xl font-black" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="specPreset" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Requisitos del Sistema</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl><SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold"><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-card/95 backdrop-blur-3xl border-white/10 rounded-2xl">
                          {SPEC_PRESETS.map((preset) => (<SelectItem key={preset} value={preset}>{preset}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <SpecReferenceTable selectedLevel={form.watch("specPreset")} />
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="isDiscounted" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-[2rem] border border-white/5 p-6 bg-white/5">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-xs font-black uppercase tracking-widest">Activar Oferta</FormLabel>
                        <FormDescription className="text-[9px] uppercase font-bold tracking-widest opacity-40">Aplica un descuento porcentual inmediato.</FormDescription>
                      </div>
                    </FormItem>
                  )} />

                  {form.watch('isDiscounted') && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                      <FormField control={form.control} name="discountPercentage" render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-60">Porcentaje de Descuento (%)</FormLabel>
                          <FormControl><Input type="number" min="0" max="100" className="h-14 bg-white/5 border-white/10 rounded-2xl font-black text-green-400" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="p-6 rounded-[2rem] bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-green-500/60">Precio Resultante</p>
                          <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-black text-green-400">
                              ${(Number(form.watch("price") || 0) * (1 - (Number(form.watch("discountPercentage") || 0) / 100))).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-sm font-bold line-through opacity-30">
                              ${Number(form.watch("price") || 0).toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-green-500/60">Ahorro</p>
                          <p className="text-sm font-black text-green-400">
                            -${(Number(form.watch("price") || 0) * (Number(form.watch("discountPercentage") || 0) / 100)).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <FormField control={form.control} name="active" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-[2rem] border border-primary/20 p-6 bg-primary/5">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary data-[state=checked]:text-black" /></FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-primary">Visible en la Tienda</FormLabel>
                        <FormDescription className="text-[9px] uppercase font-bold tracking-widest opacity-60">Si está marcado, el producto será visible para todos los compradores.</FormDescription>
                      </div>
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full h-16 bg-primary text-white font-bold text-lg tracking-widest rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all" disabled={form.formState.isSubmitting || isUploading}>
                    {form.formState.isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="mr-3 h-6 w-6" /> GUARDAR CAMBIOS</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {id !== 'new' && isDigitalProduct && (
            <KeyManager
              productId={id}
              productName={form.getValues('name')}
              onStockSync={(nextStock) => form.setValue('stock', nextStock)}
            />
          )}
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
                  <Image src={form.watch("imageId") || ""} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full opacity-20"><ImageIcon className="h-12 w-12" /></div>
                )}
              </div>
              <Input type="file" onChange={handleImageUpload} disabled={isUploading} className="bg-white/5 border-white/10 rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
