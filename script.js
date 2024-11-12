document.addEventListener('DOMContentLoaded', function() {
    let emisionesDataset = [];  // Para almacenar emisiones acumuladas
    let velocidadTiempoDataset = [];  // Para almacenar los datos de velocidad vs tiempo

    // Función para acumular los datos en cada simulación
    function agregarSimulacion(velocidadVsTiempo, emisiones, tipoVehiculo) {
        // Agregar los datos de velocidad vs tiempo
        velocidadVsTiempo.forEach((dato, index) => {
            if (velocidadTiempoDataset[index]) {
                velocidadTiempoDataset[index].data.push(dato.velocidad);
            } else {
                velocidadTiempoDataset[index] = { tiempo: dato.tiempo, data: [dato.velocidad] };
            }
        });

        // Agregar las emisiones totales al conjunto de datos de emisiones
        emisionesDataset.push({ tipo: tipoVehiculo, emisiones });
    }

    // Modificar el gráfico de velocidad vs tiempo
    function mostrarGraficoVelocidadTiempo() {
        const ctx = document.getElementById('graficoVelocidadTiempo').getContext('2d');
        const tiempos = velocidadTiempoDataset.map(d => d.tiempo);
        const datasets = velocidadTiempoDataset.map((d, index) => ({
            label: `Simulación ${index + 1}`,
            data: d.data,
            borderColor: 'blue',
            fill: false,
            backgroundColor: 'white',
        }));

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: tiempos,
                datasets: datasets,
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Tiempo (h)' } },
                    y: { title: { display: true, text: 'Velocidad (km/h)' } },
                },
                plugins: {
                    legend: { display: true },
                    tooltip: { backgroundColor: 'white', titleColor: 'black' }
                },
            },
        });
    }

    // Modificar el gráfico de emisiones acumuladas
    function mostrarGraficoEmisiones() {
        const ctx = document.getElementById('graficoEmisiones').getContext('2d');
        const labels = emisionesDataset.map(d => d.tipo);
        const data = emisionesDataset.map(d => d.emisiones);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Emisiones de CO2 (kg)',
                    data: data,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                }],
            },
            options: {
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Emisiones (kg)' } },
                },
                plugins: {
                    legend: { display: true },
                    tooltip: { backgroundColor: 'white', titleColor: 'black' }
                },
                backgroundColor: 'white',
            },
        });
    }

    // Resto del código que procesa la simulación
    document.getElementById('simular').addEventListener('click', function() {
        const tipoVehiculo = document.getElementById('tipo_vehiculo').value;
        const tipoMovimiento = document.getElementById('tipo_movimiento').value;
        
        let velocidades = [];
        let tiempos = [];

        // Recolecta datos de MRU o MRUA
        if (tipoMovimiento === 'mru') {
            const velocidad = parseFloat(document.getElementById('velocidad_auto').value);
            const tiempo = parseFloat(document.getElementById('tiempo_auto').value);
            velocidades.push(velocidad);
            tiempos.push(tiempo);
        } else if (tipoMovimiento === 'mrua') {
            const numIntervals = parseInt(document.getElementById('num_intervals').value);
            const velocidadInputs = document.getElementsByClassName('velocidad_intervalo');
            const tiempoInputs = document.getElementsByClassName('tiempo_intervalo');

            for (let i = 0; i < numIntervals; i++) {
                velocidades.push(parseFloat(velocidadInputs[i].value));
                tiempos.push(parseFloat(tiempoInputs[i].value));
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

        agregarSimulacion(velocidadVsTiempo, emisionesTotal, tipoVehiculo);
        mostrarGraficoVelocidadTiempo();
        mostrarGraficoEmisiones();
    });
});
