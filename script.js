document.getElementById('simular').addEventListener('click', function() {
    // Obtener valores de entrada
    const velocidadBici = parseFloat(document.getElementById('velocidad_bici').value);
    const tiempoBici = parseFloat(document.getElementById('tiempo_bici').value);
    const velocidadAuto = parseFloat(document.getElementById('velocidad_auto').value);
    const tiempoAuto = parseFloat(document.getElementById('tiempo_auto').value);

    // Validar entradas
    if (isNaN(velocidadBici) || isNaN(tiempoBici) || velocidadBici <= 0 || tiempoBici <= 0 ||
        isNaN(velocidadAuto) || isNaN(tiempoAuto) || velocidadAuto <= 0 || tiempoAuto <= 0) {
        document.getElementById('resultados').innerHTML = `
            <h2>Error</h2>
            <p>Por favor ingrese valores válidos para todas las entradas.</p>
        `;
        return;
    }

    // Factores importantes
    const EMISIONES_CO2_POR_LITRO = 2.3; // kg CO2 por litro de gasolina
    const CONSUMO_PROMEDIO_AUTOMOVIL = 0.09; // litros por km

    // Calcular distancias
    const distanciaBici = velocidadBici * tiempoBici;
    const distanciaAuto = velocidadAuto * tiempoAuto;

    // Calcular consumo de combustible del automóvil
    const consumoAuto = CONSUMO_PROMEDIO_AUTOMOVIL * distanciaAuto;

    // Calcular emisiones de CO2 del automóvil
    const emisionesAuto = consumoAuto * EMISIONES_CO2_POR_LITRO;

    // Mostrar resultados
    document.getElementById('resultados').innerHTML = `
        <h2>Resultados</h2>
        <p>Distancia recorrida en bicicleta: ${distanciaBici.toFixed(2)} km</p>
        <p>Consumo de combustible del automóvil: ${consumoAuto.toFixed(2)} L</p>
        <p>Emisiones de CO2 generadas por el automóvil: ${emisionesAuto.toFixed(2)} kg</p>
        <p>Emisiones de CO2 evitadas por usar la bicicleta: ${emisionesAuto.toFixed(2)} kg</p>
    `;

    // Iniciar animación sincronizada
    moverVehiculos(distanciaBici, velocidadBici);
});

function moverVehiculos(distancia, velocidad) {
    const bicicleta = document.getElementById('bicicleta');
    const carro = document.getElementById('carro');
    
    // Reiniciar posiciones iniciales
    bicicleta.style.transform = 'translateX(0)';
    carro.style.transform = 'translateX(0)';
    
    // Obtener el ancho de la carretera
    const carretera = document.querySelector('.carretera');
    const anchoCarretera = carretera.clientWidth; // Ancho real del contenedor

    // Asegurarse de que la distancia no exceda el ancho de la carretera
    const distanciaMaxima = Math.min(distancia * 10, anchoCarretera); // Multiplicamos por 10 para la visualización

    // Calcular la duración en milisegundos para mover la bicicleta y el carro
    const duracion = (distancia / velocidad) * 1000; // convertir a milisegundos

    bicicleta.style.transition = `transform ${duracion}ms linear`;
    carro.style.transition = `transform ${duracion}ms linear`;

    // Mover ambos vehículos en la misma dirección
    bicicleta.style.transform = `translateX(${distanciaMaxima}px)`; 
    carro.style.transform = `translateX(${distanciaMaxima}px)`;
}


// Evento para reiniciar la animación
document.getElementById('reiniciar').addEventListener('click', function() {
    const bicicleta = document.getElementById('bicicleta');
    const carro = document.getElementById('carro');

    // Quitar transición y volver a la posición inicial
    bicicleta.style.transition = 'none';
    carro.style.transition = 'none';
    bicicleta.style.transform = 'translateX(0)';
    carro.style.transform = 'translateX(0)';

    // Limpiar resultados
    document.getElementById('resultados').innerHTML = '';
});
