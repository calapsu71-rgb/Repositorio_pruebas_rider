from django.shortcuts import render, redirect
from django.contrib import messages
from .models import TipoDePago, PagosEntrega, Entrega, ComprobantePago 

def pagos_index(request):
    if request.method == 'POST':
        
        # Guardar 0: Registrar Entrega Individual
        if 'guardar_entrega' in request.POST:
            codigo = request.POST.get('codigo_guia')
            direccion = request.POST.get('direccion_destino')
            
            if codigo and direccion:
                Entrega.objects.create(
                    codigo_guia=codigo,
                    direccion_destino=direccion
                )
                messages.success(request, "Entrega registrada correctamente.")
            return redirect('pagos_index')

        # Guardar 1: Registrar Tipo de Pago (Catálogo 1:N)
        elif 'btn_tipo_pago' in request.POST:
            efectivo = request.POST.get('efectivo') or None
            transferencia = request.POST.get('transferencia') or None

            TipoDePago.objects.create(
                efectivo=efectivo,
                transferencia=transferencia
            )
            messages.success(request, "Tipo de pago guardado correctamente.")
            return redirect('pagos_index')

        # Guardar 2: Registrar Pago de Entrega con Relaciones (1:1, 1:N, N:M)
        elif 'btn_pago_entrega' in request.POST:
            id_tipo = request.POST.get('tipo_de_pago')
            valor_total = request.POST.get('valor_total')
            metodo_pago = request.POST.get('metodo_pago')
            fecha_de_pago = request.POST.get('fecha_de_pago')
            estado = request.POST.get('estado')
            
            # Obtener datos de las relaciones N:M y 1:1
            entregas_ids = request.POST.getlist('entregas') # Lista de IDs (N:M)
            numero_transaccion = request.POST.get('numero_transaccion') # Datos 1:1
            evidencia_url = request.POST.get('evidencia_url') # Datos 1:1

            tipo_instancia = TipoDePago.objects.get(pk=id_tipo)

            # 1. Creación del pago principal (Relación 1:N)
            nuevo_pago = PagosEntrega.objects.create(
                tipo_de_pago=tipo_instancia,
                valor_total=valor_total,
                metodo_pago=metodo_pago,
                fecha_de_pago=fecha_de_pago,
                estado=estado
            )

            # 2. Asignación Muchos a Muchos (N:M)
            if entregas_ids:
                nuevo_pago.entregas.set(entregas_ids)

            # 3. Creación del Comprobante (Relación 1:1)
            ComprobantePago.objects.create(
                pago_entrega=nuevo_pago,
                numero_transaccion=numero_transaccion,
                evidencia_url=evidencia_url
            )

            messages.success(request, "Pago de entrega y relaciones registrados con éxito.")
            return redirect('pagos_index')

    # GET Request: Consultar datos optimizados para el renderizado
    tipos_pago = TipoDePago.objects.all()
    pagos = PagosEntrega.objects.select_related('tipo_de_pago', 'comprobante').prefetch_related('entregas').all()
    entregas = Entrega.objects.all()

    context = {
        'tipos_pago': tipos_pago,
        'pagos': pagos,
        'entregas': entregas,
    }
    return render(request, 'app_PagosEntrega_TipoPago/pagos_index.html', context)