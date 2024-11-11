document.getElementById('simular').addEventListener('click', function() {
    // Obtener valores de entrada
    const velocidadInicial = parseFloat(document.getElementById('velocidad_inicial').value);
    const tiempo = parseFloat(document.getElementById('tiempo').value);
    const tipoVehiculo = document.getElementById('tipo_vehiculo').value;
    const tipoMovimiento = document.getElementById('tipo_movimiento').value;

    // Validar entradas
    if (isNaN(velocidadInicial) || velocidadInicial <= 0 || isNaN(tiempo) || tiempo <= 0) {
        document.getElementById('resultados').innerHTML = `
            <h2>Error</h2>
            <p>Por favor ingrese valores válidos para todas las entradas.</p>
        `;
        return;
    }

    // Factores de emisión y consumo para cada tipo de vehículo
    const EMISIONES_CO2_POR_LITRO = 2.3; // kg CO2 por litro de gasolina
    const CONSUMO_PROMEDIO = {
        "automovil": 0.09,    // litros por km
        "camioneta": 0.12,    // litros por km
        "camion": 0.3         // litros por km
    };
    const consumoPromedio = CONSUMO_PROMEDIO[tipoVehiculo];

    let distancia, emisiones;

    if (tipoMovimiento === "MRU") {
        // Movimiento Rectilíneo Uniforme (MRU)
        distancia = velocidadInicial * tiempo;
    } else {
        // Movimiento Rectilíneo Uniformemente Acelerado (MRUA)
        const numIntervalos = parseInt(prompt("¿Cuántos intervalos de velocidad desea?"));
        if (isNaN(numIntervalos) || numIntervalos <= 0) {
            alert("Número de intervalos inválido.");
            return;
        }

        distancia = 0;
        let velocidad = velocidadInicial;
        const intervalos = [];

        for (let i = 1; i <= numIntervalos; i++) {
            const nuevoTiempo = tiempo / numIntervalos;
            velocidad = parseFloat(prompt(`Ingrese la velocidad para el intervalo ${i}:`));

            if (isNaN(velocidad) || velocidad < 0) {
                alert("Velocidad inválida.");
                return;
            }

            distancia += velocidad * nuevoTiempo;
            intervalos.push({ tiempo: nuevoTiempo * i, velocidad });
        }

        // Generar tabla de velocidad vs tiempo
        generarTabla(intervalos);
    }

    // Calcular consumo y emisiones de CO2
    const consumo = consumoPromedio * distancia;
    emisiones = consumo * EMISIONES_CO2_POR_LITRO;

    // Mostrar resultados
    document.getElementById('resultados').innerHTML = `
        <h2>Resultados</h2>
        <p>Distancia recorrida: ${distancia.toFixed(2)} km</p>
        <p>Consumo de combustible: ${consumo.toFixed(2)} L</p>
        <p>Emisiones de CO2: ${emisiones.toFixed(2)} kg</p>
    `;

    // Almacenar datos para el diagrama de barras
    almacenarDatosEmisiones(tipoVehiculo, emisiones);
    actualizarDiagramaEmisiones();
});

function generarTabla(intervalos) {
    let tablaHTML = `<table><tr><th>Tiempo (s)</th><th>Velocidad (km/h)</th></tr>`;
    intervalos.forEach(intervalo => {
        tablaHTML += `<tr><td>${intervalo.tiempo.toFixed(2)}</td><td>${intervalo.velocidad.toFixed(2)}</td></tr>`;
    });
    tablaHTML += `</table>`;
    document.getElementById('tabla_velocidad').innerHTML = tablaHTML;
}

const datosEmisiones = { "automovil": 0, "camioneta": 0, "camion": 0 };

function almacenarDatosEmisiones(tipoVehiculo, emisiones) {
    datosEmisiones[tipoVehiculo] += emisiones;
}

function actualizarDiagramaEmisiones() {
    // Ejemplo de código para actualizar un diagrama de barras (se puede hacer con Chart.js o cualquier otra librería de gráficos)
    const ctx = document.getElementById('diagramaEmisiones').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Automóvil', 'Camioneta', 'Camión'],
            datasets: [{
                label: 'Emisiones de CO2 (kg)',
                data: [datosEmisiones.automovil, datosEmisiones.camioneta, datosEmisiones.camion],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
