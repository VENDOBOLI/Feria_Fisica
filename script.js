document.addEventListener('DOMContentLoaded', function() {
    let emisionesHistoricas = []; // Para almacenar emisiones de todas las simulaciones
    let velocidadVsTiempoHistorico = []; // Para almacenar velocidad vs. tiempo de todas las simulaciones

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
                <label>Velocidad (km/h):</label>
                <input type="number" class="velocidad_intervalo" placeholder="Velocidad para intervalo ${i}">
                <label>Tiempo (horas):</label>
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
            const velocidad = parseFloat(document.getElementById('velocidad_auto').value);
            const tiempo = parseFloat(document.getElementById('tiempo_auto').value);

            if (isNaN(velocidad) || isNaN(tiempo) || velocidad <= 0 || tiempo <= 0) {
                alert('Ingrese valores válidos para velocidad y tiempo.');
                return;
            }

            velocidades.push(velocidad);
            tiempos.push(tiempo);
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

                velocidades.push(velocidad);
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

        mostrarGraficoVelocidadTiempo(velocidadVsTiempo);
        mostrarGraficoEmisiones(emisionesTotal);
    });

    // Mostrar gráfico de velocidad vs tiempo
    function mostrarGraficoVelocidadTiempo(datos) {
        velocidadVsTiempoHistorico.push(datos); // Agregar la nueva simulación al histórico

        const ctx = document.getElementById('graficoVelocidadTiempo').getContext('2d');
        const tiempos = datos.map(d => d.tiempo);
        const velocidades = datos.map(d => d.velocidad);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: tiempos,
                datasets: velocidadVsTiempoHistorico.map((data, index) => ({
                    label: `Simulación ${index + 1}`,
                    data: data.map(d => d.velocidad),
                    borderColor: `hsl(${(index * 70) % 360}, 70%, 50%)`, // Color único para cada simulación
                    fill: false,
                    backgroundColor: 'white' // Fondo blanco
                }))
            },
            options: {
                plugins: {
                    legend: { display: true },
                },
                scales: {
                    x: { title: { display: true, text: 'Tiempo (h)' } },
                    y: { title: { display: true, text: 'Velocidad (km/h)' } }
                }
            }
        });
    }

    // Mostrar gráfico de emisiones de CO2
    function mostrarGraficoEmisiones(emisiones) {
        emisionesHistoricas.push(emisiones); // Agregar emisiones al histórico

        const ctx = document.getElementById('graficoEmisiones').getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: emisionesHistoricas.map((_, i) => `Simulación ${i + 1}`),
                datasets: [{
                    label: 'Emisiones de CO2 (kg)',
                    data: emisionesHistoricas,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    backgroundColor: 'white' // Fondo blanco
                }]
            },
            options: {
                plugins: {
                    legend: { display: true },
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Emisiones (kg)' } }
                }
            }
        });
    }
});


