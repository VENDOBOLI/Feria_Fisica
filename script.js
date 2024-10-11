document.getElementById('simular').addEventListener('click', function() {
    // Obtener valores de entrada
    const velocidadBici = parseFloat(document.getElementById('velocidad_bici').value);
    const tiempoBici = parseFloat(document.getElementById('tiempo_bici').value);
    const velocidadAuto = parseFloat(document.getElementById('velocidad_auto').value);
    const tiempoAuto = parseFloat(document.getElementById('tiempo_auto').value);

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

    // Iniciar animación
    moverVehiculos(distanciaBici, velocidadBici);
});

function moverVehiculos(distancia, velocidad) {
    const bicicleta = document.getElementById('bicicleta');
    const carrito = document.getElementById('carrito');
    const velocidadPixelesPorSegundo = (velocidad * 1000 / 3600); // km/h a m/s

    // Calcular la duración en segundos para mover la bicicleta
    const duracion = (distancia / velocidad) * 1000; // convertir a milisegundos

    bicicleta.style.transition = `transform ${duracion}ms linear`;
    carrito.style.transition = `transform ${duracion}ms linear`;

    bicicleta.style.transform = `translateX(${distancia * 10}px)`; // Multiplicamos por 10 para mayor visualización
    carrito.style.transform = `translateX(${distancia * 10}px)`;
}

