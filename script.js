document.addEventListener('DOMContentLoaded', function() {
    let velocidadChart = null;
    let emisionesChart = null;

    // Configuración inicial para el gráfico de velocidad vs tiempo
    function inicializarGraficoVelocidadTiempo() {
        const ctx = document.getElementById('graficoVelocidadTiempo').getContext('2d');
        velocidadChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Velocidad vs Tiempo',
                    data: [],
                    borderColor: 'blue',
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Tiempo (s)' } },
                    y: { title: { display: true, text: 'Velocidad (m/s)' } }
                },
                plugins: {
                    legend: { display: true },
                    tooltip: { enabled: true }
                }
            }
        });
    }

    // Configuración inicial para el gráfico de emisiones de CO2
    function inicializarGraficoEmisiones() {
        const ctx = document.getElementById('graficoEmisiones').getContext('2d');
        emisionesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Emisiones de CO2 (kg)',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: 'Emisiones (kg)' } 
                    }
                }
            }
        });
    }

    inicializarGraficoVelocidadTiempo();
    inicializarGraficoEmisiones();

    // Mostrar opciones de movimiento tras seleccionar el tipo de vehículo
    document.getElementById('tipo_vehiculo').addEventListener('change', function() {
        document.getElementById('movimiento_options').style.display = 'block';
        document.getElementById('mru_data').style.display = 'none';
        document.getElementById('mrua_data').style.display = 'none';
    });

    // Mostrar el formulario de datos específico según el tipo de movimiento
    document.getElementById('tipo_movimiento').addEventListener('change', function() {
        const movimiento = document.getElementById('tipo_movimiento').value;

        if (movimiento === 'mru') {
            document.getElementById('mru_data').style.display = 'block';
            document.getElementById('mrua_data').style.display = 'none';
        } else if (movimiento === 'mrua') {
            document.getElementById('mru_data').style.display = 'none';
            document.getElementById('mrua_data').style.display = 'block';
        }
    });

    // Generar campos para cada intervalo en MRUA
    document.getElementById('num_intervals').addEventListener('input', function() {
        const intervalsContainer = document.getElementById('intervals_container');
        intervalsContainer.innerHTML = ''; // Limpiar contenedor de intervalos
        const numIntervals = parseInt(this.value);

        for (let i = 1; i <= numIntervals; i++) {
            const intervalDiv = document.createElement('div');
            intervalDiv.innerHTML = `
                <h4>Intervalo ${i}</h4>
                <label>Velocidad Inicial (m/s):</label>
                <input type="number" class="velocidad_inicial_intervalo" placeholder="Velocidad inicial para intervalo ${i}">
                <label>Velocidad Final (m/s):</label>
                <input type="number" class="velocidad_final_intervalo" placeholder="Velocidad final para intervalo ${i}">
                <label>Distancia (m):</label>
                <input type="number" class="distancia_intervalo" placeholder="Distancia para intervalo ${i}">
                <label>Tiempo (s):</label>
                <input type="number" class="tiempo_intervalo" placeholder="Tiempo para intervalo ${i}">
            `;
            intervalsContainer.appendChild(intervalDiv);
        }
    });

    // Simulación y cálculo de emisiones
    document.getElementById('simular').addEventListener('click', function() {
        const tipoVehiculo = document.getElementById('tipo_vehiculo').value;
        const tipoMovimiento = document.getElementById('tipo_movimiento').value;
        const resultados = document.getElementById('resultados');
        resultados.innerHTML = '';

        let velocidades = [];
        let tiempos = [];

        if (tipoMovimiento === 'mru') {
            // Obtener datos para MRU
            const velocidad = parseFloat(document.getElementById('velocidad_auto').value);
            const tiempo = parseFloat(document.getElementById('tiempo_auto').value);

            if (isNaN(velocidad) || isNaN(tiempo) || velocidad <= 0 || tiempo <= 0) {
                alert('Ingrese valores válidos para velocidad y tiempo en MRU.');
                return;
            }

            velocidades.push(velocidad);
            tiempos.push(tiempo);
        } else if (tipoMovimiento === 'mrua') {
            // Obtener datos para MRUA
            const numIntervals = parseInt(document.getElementById('num_intervals').value);
            const velocidadInicialInputs = document.getElementsByClassName('velocidad_inicial_intervalo');
            const velocidadFinalInputs = document.getElementsByClassName('velocidad_final_intervalo');
            const distanciaInputs = document.getElementsByClassName('distancia_intervalo');
            const tiempoInputs = document.getElementsByClassName('tiempo_intervalo');

            for (let i = 0; i < numIntervals; i++) {
                const velocidadInicial = parseFloat(velocidadInicialInputs[i].value);
                const velocidadFinal = parseFloat(velocidadFinalInputs[i].value);
                const distancia = parseFloat(distanciaInputs[i].value);
                const tiempo = parseFloat(tiempoInputs[i].value);

                let datosValidos = 0;
                if (!isNaN(velocidadInicial)) datosValidos++;
                if (!isNaN(velocidadFinal)) datosValidos++;
                if (!isNaN(distancia)) datosValidos++;
                if (!isNaN(tiempo)) datosValidos++;

                if (datosValidos < 2) {
                    alert(`Ingrese al menos dos valores para el intervalo ${i + 1}.`);
                    return;
                }

                // Calcular los valores faltantes usando ecuaciones de MRUA
                let a, vFinal;
                if (!isNaN(velocidadInicial) && !isNaN(velocidadFinal) && !isNaN(tiempo)) {
                    a = (velocidadFinal - velocidadInicial) / tiempo;
                    if (isNaN(distancia)) distancia = velocidadInicial * tiempo + 0.5 * a * tiempo ** 2;
                } else if (!isNaN(velocidadInicial) && !isNaN(distancia) && !isNaN(tiempo)) {
                    a = (2 * (distancia - velocidadInicial * tiempo)) / tiempo ** 2;
                    vFinal = velocidadInicial + a * tiempo;
                } else if (!isNaN(velocidadFinal) && !isNaN(distancia) && !isNaN(tiempo)) {
                    a = (2 * (distancia - velocidadFinal * tiempo)) / tiempo ** 2;
                    vFinal = velocidadFinal;
                } else if (!isNaN(velocidadInicial) && !isNaN(velocidadFinal) && !isNaN(distancia)) {
                    a = (velocidadFinal ** 2 - velocidadInicial ** 2) / (2 * distancia);
                    if (isNaN(tiempo)) tiempo = (velocidadFinal - velocidadInicial) / a;
                }

                velocidades.push(vFinal || velocidadFinal);
                tiempos.push(tiempo);
            }
        }

        const CO2_POR_LITRO = 2.3;
        const CONSUMO_PROMEDIO = tipoVehiculo === 'automovil' ? 0.09 : tipoVehiculo === 'suv' ? 0.12 : 0.15;
        let emisionesTotal = 0;
        let tiempoAcumulado = 0;
        let velocidadVsTiempo = [];

        for (let i = 0; i < velocidades.length; i++) {
            const distancia = velocidades[i] * tiempos[i];
            const consumo = distancia * CONSUMO_PROMEDIO;
            const emisiones = consumo * CO2_POR_LITRO;
            emisionesTotal += emisiones;
            tiempoAcumulado += tiempos[i];
            velocidadVsTiempo.push({ tiempo: tiempoAcumulado, velocidad: velocidades[i] });
        }

        resultados.innerHTML = `
            <h2>Resultados</h2>
            <p>Total de emisiones de CO2 para ${tipoVehiculo}: ${emisionesTotal.toFixed(2)} kg</p>
        `;

        velocidadVsTiempo.forEach((punto) => {
            velocidadChart.data.labels.push(punto.tiempo);
            velocidadChart.data.datasets[0].data.push(punto.velocidad);
        });

        velocidadChart.update();

        emisionesChart.data.labels.push(`${tipoVehiculo}`);
        emisionesChart.data.datasets[0].data.push(emisionesTotal);
        emisionesChart.update();
    });
});
