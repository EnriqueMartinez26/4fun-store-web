import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/use-auth';
import { OrderApiService } from '@/lib/services/OrderApiService';
import { useToast } from '@/hooks/use-toast';

export function useCheckoutViewModel() {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Argentina',
    paymentMethod: 'MERCADOPAGO',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep === 1) {
      if (!isFormValid) {
        toast({
          variant: 'destructive',
          title: '¿A dónde enviamos tu pedido?',
          description:
            'Por favor, completa todos los campos de dirección para que podamos entregarte tus juegos.',
        });
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Necesitamos saber quién eres',
        description: 'Por favor, inicia sesión para que podamos vincular esta compra a tu cuenta.',
      });
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Tu carrito está vacío',
        description: 'Agrega algunos juegos antes de intentar finalizar la compra.',
      });
      router.push('/productos');
      return;
    }

    setIsSubmitting(true);

    // Payload seguro: solo parámetros logísticos, sin precios
    // Precios se recalculan en backend desde base de datos
    const secureOrderData = {
      userId: user.id,
      paymentMethod: formData.paymentMethod,
      shippingAddress: {
        fullName: user.name, // O recolectar de un input en el form
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        country: formData.country,
      },
      orderItems: cart.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await OrderApiService.create(secureOrderData as any);

      // Usar link de pago del servidor, con fallback a URL oficial
      const finalPaymentLink = response.paymentLink || 'https://link.mercadopago.com.ar/4funstore';

      const resolvedOrderId =
        response.orderId || (response.order && (response.order.id || response.order._id));

      const query = new URLSearchParams();
      query.set('payment_link', String(finalPaymentLink));
      if (resolvedOrderId) query.set('order_id', String(resolvedOrderId));

      toast({ title: '¡Orden Creada!', description: 'Redirigiendo a la plataforma de pago...' });
      router.push(`/checkout/success?${query.toString()}`);
    } catch (error: any) {
      console.error('[useCheckoutViewModel] Excepción de Liquidación:', error);
      toast({
        variant: 'destructive',
        title: 'No pudimos procesar el pago',
        description:
          error.response?.data?.message ||
          error.message ||
          'Hubo un problema al conectar con la pasarela de pagos. Por favor, verifica tu conexión o el stock de los productos.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(
    formData.street && formData.city && formData.state && formData.zipCode && formData.country
  );

  return {
    cart,
    cartTotal,
    user,
    isSubmitting,
    currentStep,
    formData,
    isFormValid,
    setFormData,
    handleChange,
    nextStep,
    prevStep,
    handleSubmit,
  };
}
