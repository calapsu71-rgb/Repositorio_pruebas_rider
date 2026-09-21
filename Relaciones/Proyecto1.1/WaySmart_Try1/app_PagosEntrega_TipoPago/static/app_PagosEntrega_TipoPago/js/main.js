document.addEventListener('DOMContentLoaded', () => {
    // 1. Autocompletar la fecha y hora local actual
    const fechaInput = document.getElementById('fecha_de_pago');
    if (fechaInput && !fechaInput.value) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        fechaInput.value = now.toISOString().slice(0, 16);
    }

    // 2. Validación de valor positivo en montos
    const valorTotalInput = document.getElementById('valor_total');
    if (valorTotalInput) {
        valorTotalInput.addEventListener('input', (e) => {
            if (parseFloat(e.target.value) < 0) {
                e.target.value = 0;
            }
        });
    }

    // 3. Confirmación visual de selección en el campo Muchos a Muchos
    const entregasSelect = document.getElementById('entregas');
    if (entregasSelect) {
        entregasSelect.addEventListener('change', () => {
            const selectedOptions = Array.from(entregasSelect.selectedOptions);
            if (selectedOptions.length > 0) {
                entregasSelect.style.borderColor = 'var(--waysmart-primary)';
            }
        });
    }
});