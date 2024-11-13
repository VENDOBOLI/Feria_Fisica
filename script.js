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

    document.getElementById('tipo_vehiculo').addEventListener('change', function() {
        document.getElementById('movimiento_options').style.display = 'block';
        document.getElementById('mru_data').style.display = 'none';
        document.getElementById('mrua_data').style.display = 'none';
    });

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

    document.getElementById('num_intervals').addEventListener('input', function() {
        const intervalsContainer = document.getElementById('intervals_container');
        intervalsContainer.innerHTML = '';
        const numIntervals = parseInt(this.value);

        for (let i = 1; i <= numIntervals; i++) {
            const intervalDiv = document.createElement('div');
            intervalDiv.innerHTML = `
                <h4>Intervalo ${i}</h4>
                <label>Velocidad (m/s):</label>
                <input type="number" class="velocidad_intervalo" placeholder="Velocidad para intervalo ${i}">
                <label>Tiempo (s):</label>
                <input type="number" class="tiempo_intervalo" placeholder="Tiempo para intervalo ${i}">
            `;
            intervalsContainer.appendChild(intervalDiv);
        }
    });

    document.getElementById('simular').addEventListener('click', function() {
        const tipoVehiculo = document.getElementById('tipo_vehiculo').value;
        const tipoMovimiento = document.getElementById('tipo_movimiento').value;
        const resultados = document.getElementById('resultados');
        resultados.innerHTML = '';

        let velocidades = [];
        let tiempos = [];

        if (tipoMovimiento === 'mru') {
            const velocidad = parseFloat(document.getElementById('velocidad_auto').value);
            const tiempo = parseFloat(document.getElementById('tiempo_auto').value);

            if (isNaN(velocidad) || isNaN(tiempo) || velocidad <= 0 || tiempo <= 0) {
                alert('Ingrese valores válidos para velocidad y tiempo.');
                return;
            }

            velocidades.push(velocidad / 3.6); // Convertir de km/h a m/s
            tiempos.push(tiempo * 3600); // Convertir de horas a segundos
        } else if (tipoMovimiento === 'mrua') {
            const numIntervals = parseInt(document.getElementById('num_intervals').value);
            const velocidadInputs = document.getElementsByClassName('velocidad_intervalo');
            const tiempoInputs = document.getElementsByClassName('tiempo_intervalo');

            for (let i = 0; i < numIntervals; i++) {
                const velocidad = parseFloat(velocidadInputs[i].value);
                const tiempo = parseFloat(tiempoInputs[i].value);

                if (isNaN(velocidad) || isNaN(tiempo) || velocidad <= 0 || tiempo <= 0) {
                    alert(`Ingrese valores válidos para el intervalo ${i + 1}.`);
                    return;
                }

                velocidades.push(velocidad / 3.6); // Convertir de km/h a m/s
                tiempos.push(tiempo * 3600); // Convertir de horas a segundos
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

        emisionesChart.data.labels.push(`Simulación ${emisionesChart.data.labels.length + 1}`);
        emisionesChart.data.datasets[0].data.push(emisionesTotal);
        emisionesChart.update();
    });
});

