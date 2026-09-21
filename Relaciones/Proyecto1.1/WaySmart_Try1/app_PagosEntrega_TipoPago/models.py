from django.db import models

class TipoDePago(models.Model):
    id_tipo_de_pago = models.AutoField(primary_key=True, db_column='idTipo de Pago')
    efectivo = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, db_column='Efectivo')
    transferencia = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, db_column='Transferencia')

    class Meta:
        db_table = 'Tipo de Pago'

    def __str__(self):
        return f"Tipo Pago #{self.id_tipo_de_pago}"


class Entrega(models.Model):
    id_entrega = models.BigAutoField(primary_key=True, db_column='idEntrega')
    codigo_guia = models.CharField(max_length=100, db_column='Codigo Guia', unique=True)
    direccion_destino = models.CharField(max_length=255, db_column='Direccion Destino')

    class Meta:
        db_table = 'Entrega'

    def __str__(self):
        return f"Guía #{self.codigo_guia} - {self.direccion_destino}"


class PagosEntrega(models.Model):
    METODO_CHOICES = [
        ('EFECTIVO', 'Efectivo'),
        ('TRANSFERENCIA', 'Transferencia'),
        ('OTRO', 'Otro'),
    ]

    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('COMPLETADO', 'Completado'),
        ('CANCELADO', 'Cancelado'),
    ]

    id_pago_entrega = models.BigAutoField(primary_key=True, db_column='idPago Entrega')
    
    # RELACIÓN 1 A MUCHOS (1:N)
    tipo_de_pago = models.ForeignKey(
        TipoDePago, 
        on_delete=models.CASCADE, 
        db_column='Tipo de Pago_idTipo de Pago',
        related_name='pagos'
    )
    
    # RELACIÓN MUCHOS A MUCHOS (N:M)
    entregas = models.ManyToManyField(
        Entrega,
        related_name='pagos',
        db_table='Pagos_x_Entrega'
    )

    valor_total = models.DecimalField(max_digits=12, decimal_places=2, db_column='Valor Total')
    metodo_pago = models.CharField(max_length=50, choices=METODO_CHOICES, db_column='Metodo Pago')
    fecha_de_pago = models.DateTimeField(db_column='Fecha De Pago')
    estado = models.CharField(max_length=50, choices=ESTADO_CHOICES, db_column='Estado')

    class Meta:
        db_table = 'Pagos Entrega'

    def __str__(self):
        return f"Pago #{self.id_pago_entrega} - {self.estado}"


class ComprobantePago(models.Model):
    id_comprobante = models.BigAutoField(primary_key=True, db_column='idComprobante')
    
    # RELACIÓN 1 A 1 (1:1)
    pago_entrega = models.OneToOneField(
        PagosEntrega,
        on_delete=models.CASCADE,
        db_column='Pagos Entrega_idPago Entrega',
        related_name='comprobante'
    )
    numero_transaccion = models.CharField(max_length=100, db_column='Numero Transaccion', unique=True)
    evidencia_url = models.CharField(max_length=255, null=True, blank=True, db_column='Evidencia Url')

    class Meta:
        db_table = 'Comprobante Pago'

    def __str__(self):
        return f"Comprobante TRX-{self.numero_transaccion} (Pago #{self.pago_entrega_id})"