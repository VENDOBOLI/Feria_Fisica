document.addEventListener('DOMContentLoaded', function() {
    // Mostrar opciones de movimiento tras seleccionar el tipo de vehículo
    document.getElementById('tipo_vehiculo').addEventListener('change', function() {
        document.getElementById('movimiento_options').style.display = 'block';
        document.getElementById('mru_data').style.display = 'none';
        document.getElementById('mrua_data').style.display = 'none';
        document.getElementById('variable_faltante').style.display = 'none';
    });

    // Mostrar el formulario de datos específico según el tipo de movimiento
    document.getElementById('tipo_movimiento').addEventListener('change', function() {
        const movimiento = document.getElementById('tipo_movimiento').value;
        
        document.getElementById('variable_faltante').style.display = 'block';
        
        if (movimiento === 'mru') {
            document.getElementById('mru_data').style.display = 'block';
            document.getElementById('mrua_data').style.display = 'none';
        } else if (movimiento === 'mrua') {
            document.getElementById('mru_data').style.display = 'none';
            document.getElementById('mrua_data').style.display = 'block';
        }
    });

    // Realizar el cálculo basado en la variable faltante y mostrar resultados
    document.getElementById('simular').addEventListener('click', function() {
        const tipoVehiculo = document.getElementById('tipo_vehiculo').value;
        const tipoMovimiento = document.getElementById('tipo_movimiento').value;
        const variableFaltante = document.getElementById('variable_faltante').value;
        const resultados = document.getElementById('resultados');
        resultados.innerHTML = '';  // Limpiar resultados previos
        
        let velocidad, tiempo, distancia;
        let velocidades = [], tiempos = [];
        
        if (tipoMovimiento === 'mru') {
            velocidad = parseFloat(document.getElementById('velocidad_auto').value);
            tiempo = parseFloat(document.getElementById('tiempo_auto').value);

            // Calcular la variable faltante
            if (variableFaltante === 'velocidad') {
                distancia = parseFloat(document.getElementById('distancia_auto').value);
                velocidad = distancia / tiempo;
            } else if (variableFaltante === 'tiempo') {
                distancia = parseFloat(document.getElementById('distancia_auto').value);
                tiempo = distancia / velocidad;
            } else if (variableFaltante === 'distancia') {
                distancia = velocidad * tiempo;
            }

            velocidades.push(velocidad);
            tiempos.push(tiempo);
        } else if (tipoMovimiento === 'mrua') {
            const numIntervals = parseInt(document.getElementById('num_intervals').value);
            const velocidadInputs = document.getElementsByClassName('velocidad_intervalo');
            const tiempoInputs = document.getElementsByClassName('tiempo_intervalo');

            for (let i = 0; i < numIntervals; i++) {
                let velocidad = parseFloat(velocidadInputs[i].value);
                let tiempo = parseFloat(tiempoInputs[i].value);
                
                if (variableFaltante === 'velocidad') {
                    distancia = parseFloat(document.getElementsByClassName('distancia_intervalo')[i].value);
                    velocidad = distancia / tiempo;
                } else if (variableFaltante === 'tiempo') {
                    distancia = parseFloat(document.getElementsByClassName('distancia_intervalo')[i].value);
                    tiempo = distancia / velocidad;
                } else if (variableFaltante === 'distancia') {
                    distancia = velocidad * tiempo;
                }

                velocidades.push(velocidad);
                tiempos.push(tiempo);
            }
        }

        // Cálculo de emisiones
        const CO2_POR_LITRO = 2.3;
        const CONSUMO_PROMEDIO = tipoVehiculo === 'automovil' ? 0.09 : tipoVehiculo === 'suv' ? 0.12 : 0.15;
        let emisionesTotal = 0;
        let tiempoAcumulado = 0;
        let velocidadVsTiempo = [];
        let tipoVehiculoSimulacion = `${tipoVehiculo.charAt(0).toUpperCase() + tipoVehiculo.slice(1)} ${document.querySelectorAll('#resultados > div').length + 1}`;

        for (let i = 0; i < velocidades.length; i++) {
            const distancia = velocidades[i] * tiempos[i];
            const consumo = distancia * CONSUMO_PROMEDIO;
            const emisiones = consumo * CO2_POR_LITRO;
            emisionesTotal += emisiones;
            tiempoAcumulado += tiempos[i];
            velocidadVsTiempo.push({ tiempo: tiempoAcumulado, velocidad: velocidades[i] });
        }

        // Mostrar tabla de velocidad vs tiempo
        let tablaHTML = `
            <table border="1">
                <tr>
                    <th>Tiempo (h)</th>
                    <th>Velocidad (km/h)</th>
                </tr>`;
        velocidadVsTiempo.forEach(dato => {
            tablaHTML += `<tr><td>${dato.tiempo.toFixed(2)}</td><td>${dato.velocidad.toFixed(2)}</td></tr>`;
        });
        tablaHTML += `</table>`;
        
        resultados.innerHTML += `
            <div>
                <h3>Simulación: ${tipoVehiculoSimulacion}</h3>
                <p>Total de emisiones de CO2 para ${tipoVehiculo}: ${emisionesTotal.toFixed(2)} kg</p>
                ${tablaHTML}
            </div>
        `;

        // Graficar velocidad vs tiempo y emisiones
        mostrarGraficoVelocidadTiempo(velocidadVsTiempo, tipoVehiculoSimulacion);
        mostrarGraficoEmisiones(emisionesTotal, tipoVehiculoSimulacion);
    });

    // Mostrar gráfico de velocidad vs tiempo
    function mostrarGraficoVelocidadTiempo(datos, titulo) {
        const canvasId = `graficoVelocidadTiempo_${titulo}`;
        const canvas = document.createElement('canvas');
        canvas.id = canvasId;
        document.getElementById('resultados').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const tiempos = datos.map(d => d.tiempo);
        const velocidades = datos.map(d => d.velocidad);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: tiempos,
                datasets: [{
                    label: `Velocidad vs Tiempo (${titulo})`,
                    data: velocidades,
                    borderColor: 'blue',
                    backgroundColor: 'white',
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Tiempo (h)' } },
                    y: { title: { display: true, text: 'Velocidad (km/h)' } }
                }
            }
        });
    }

    // Mostrar gráfico de emisiones de CO2
    function mostrarGraficoEmisiones(emisiones, titulo) {
        const canvasId = `graficoEmisiones_${titulo}`;
        const canvas = document.createElement('canvas');
        canvas.id = canvasId;
        document.getElementById('resultados').appendChild(canvas);

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [titulo],
                datasets: [{
                    label: 'Emisiones de CO2 (kg)',
                    data: [emisiones],
                    backgroundColor: 'white',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Emisiones (kg)' } }
                }
            }
        });
    }
});
