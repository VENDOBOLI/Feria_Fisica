document.getElementById('simular').addEventListener('click', function() {
    // Obtener valores de entrada
    const tipoVehiculo = document.getElementById('tipo_vehiculo').value;
    const velocidadInicial = parseFloat(document.getElementById('velocidad_inicial').value);
    const tiempo = parseFloat(document.getElementById('tiempo').value);
    const tipoMovimiento = document.getElementById('tipo_movimiento').value;

    // Validar entradas
    if (isNaN(velocidadInicial) || isNaN(tiempo) || velocidadInicial <= 0 || tiempo <= 0) {
        document.getElementById('resultados').innerHTML = `
            <h2>Error</h2>
            <p>Por favor ingrese valores válidos para todas las entradas.</p>
        `;
        return;
    }

    // Factores importantes
    const EMISIONES_CO2_POR_LITRO = 2.3; // kg CO2 por litro de gasolina
    const CONSUMO_PROMEDIO = tipoVehiculo === 'automovil' ? 0.09 : tipoVehiculo === 'camioneta' ? 0.12 : 0.18; // consumo diferente por vehículo

    // Calcular distancia y consumo
    const distancia = velocidadInicial * tiempo;
    const consumo = CONSUMO_PROMEDIO * distancia;
    const emisiones = consumo * EMISIONES_CO2_POR_LITRO;

    // Mostrar resultados
    document.getElementById('resultados').innerHTML = `
        <h2>Resultados</h2>
        <p>Distancia recorrida: ${distancia.toFixed(2)} km</p>
        <p>Consumo de combustible: ${consumo.toFixed(2)} L</p>
        <p>Emisiones de CO2 generadas: ${emisiones.toFixed(2)} kg</p>
    `;

    // Guardar datos para el gráfico de emisiones
    addEmissionData(tipoVehiculo, emisiones);

    // Generar gráfico de velocidad vs tiempo para MRUA
    if (tipoMovimiento === 'MRUA') {
        let intervalos = parseInt(prompt("¿Cuántos intervalos de velocidad desea?"));
        if (isNaN(intervalos) || intervalos <= 0) {
            alert("Por favor ingrese un número válido de intervalos.");
            return;
        }
        const speeds = generateSpeedsForMRUA(velocidadInicial, intervalos);
        createSpeedTimeChart(speeds, tiempo);
    } else {
        // Gráfico de velocidad constante (MRU)
        createSpeedTimeChart([velocidadInicial], tiempo);
    }
});

function addEmissionData(tipoVehiculo, emisiones) {
    if (!window.emissionChart) {
        const ctx = document.getElementById('diagramaEmisiones').getContext('2d');
        window.emissionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Emisiones de CO2 (kg)',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    data: []
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    window.emissionChart.data.labels.push(tipoVehiculo);
    window.emissionChart.data.datasets[0].data.push(emisiones);
    window.emissionChart.update();
}

function generateSpeedsForMRUA(velocidadInicial, intervalos) {
    const speeds = [];
    let speed = velocidadInicial;
    for (let i = 0; i < intervalos; i++) {
        speed += (Math.random() * 20 - 10); // Variación aleatoria de velocidad para MRUA
        speeds.push(speed);
    }
    return speeds;
}

function createSpeedTimeChart(speeds, tiempo) {
    const timeLabels = Array.from({ length: speeds.length }, (_, i) => (i * (tiempo / speeds.length)).toFixed(2));
    const ctx = document.getElementById('tabla_velocidad').getContext('2d');
    
    if (window.speedTimeChart) {
        window.speedTimeChart.destroy();
    }

    window.speedTimeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Velocidad (km/h)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                data: speeds,
                fill: false,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Evento para reiniciar la simulación y las gráficas
document.getElementById('reiniciar').addEventListener('click', function() {
    const ctxEmision = document.getElementById('diagramaEmisiones').getContext('2d');
    const ctxVelocidad = document.getElementById('tabla_velocidad').getContext('2d');

    // Reiniciar gráficos si existen
    if (window.emissionChart) {
        window.emissionChart.destroy();
        window.emissionChart = new Chart(ctxEmision, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Emisiones de CO2 (kg)',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    data: []
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    if (window.speedTimeChart) {
        window.speedTimeChart.destroy();
        window.speedTimeChart = new Chart(ctxVelocidad, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Velocidad (km/h)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    data: [],
                    fill: false,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Limpiar resultados
    document.getElementById('resultados').innerHTML = '';
});
