document.addEventListener('DOMContentLoaded', function() {
    let velocidadChart = null;
    let emisionesChart = null;

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

    function calcularMRU(velocidad, distancia, tiempo) {
        if (!velocidad) velocidad = distancia / tiempo;
        if (!distancia) distancia = velocidad * tiempo;
        if (!tiempo) tiempo = distancia / velocidad;
        return { velocidad, distancia, tiempo };
    }

    function calcularMRUA(velocidadInicial, velocidadFinal, distancia, tiempo) {
        if (!velocidadFinal) velocidadFinal = velocidadInicial + (distancia / tiempo);
        if (!distancia) distancia = ((velocidadInicial + velocidadFinal) / 2) * tiempo;
        if (!tiempo) tiempo = (2 * distancia) / (velocidadInicial + velocidadFinal);
        const aceleracion = (velocidadFinal - velocidadInicial) / tiempo;
        return { velocidadFinal, distancia, tiempo, aceleracion };
    }

    document.getElementById('simular').addEventListener('click', function() {
        const tipoVehiculo = document.getElementById('tipo_vehiculo').value;
        const tipoMovimiento = document.getElementById('tipo_movimiento').value;
        const resultados = document.getElementById('resultados');
        resultados.innerHTML = '';

        let velocidades = [];
        let tiempos = [];
        let distanciaTotal = 0;
        let tiempoTotal = 0;
        let velocidadFinal, aceleracion;

        if (tipoMovimiento === 'mru') {
            let velocidad = parseFloat(document.getElementById('velocidad_auto').value) || null;
            let distancia = parseFloat(document.getElementById('distancia_auto').value) || null;
            let tiempo = parseFloat(document.getElementById('tiempo_auto').value) || null;

            if ((velocidad && tiempo) || (velocidad && distancia) || (distancia && tiempo)) {
                const calculos = calcularMRU(velocidad, distancia, tiempo);
                velocidadFinal = calculos.velocidad;
                distanciaTotal = calculos.distancia;
                tiempoTotal = calculos.tiempo;
            } else {
                alert('Para MRU, proporcione al menos dos valores entre velocidad, distancia y tiempo.');
                return;
            }
        } else if (tipoMovimiento === 'mrua') {
            const numIntervals = parseInt(document.getElementById('num_intervals').value);
            const velocidadInicialInputs = document.getElementsByClassName('velocidad_inicial_intervalo');
            const velocidadFinalInputs = document.getElementsByClassName('velocidad_final_intervalo');
            const distanciaInputs = document.getElementsByClassName('distancia_intervalo');
            const tiempoInputs = document.getElementsByClassName('tiempo_intervalo');

            for (let i = 0; i < numIntervals; i++) {
                let velocidadInicial = parseFloat(velocidadInicialInputs[i].value) || null;
                let velocidadFinalInput = parseFloat(velocidadFinalInputs[i].value) || null;
                let distancia = parseFloat(distanciaInputs[i].value) || null;
                let tiempo = parseFloat(tiempoInputs[i].value) || null;

                const valoresDefinidos = [velocidadInicial, velocidadFinalInput, distancia, tiempo].filter(val => val !== null).length;

                if (valoresDefinidos < 2) {
                    alert(`Para el intervalo ${i + 1} de MRUA, proporcione al menos dos valores entre velocidad inicial, velocidad final, distancia y tiempo.`);
                    return;
                }

                const calculos = calcularMRUA(velocidadInicial, velocidadFinalInput, distancia, tiempo);
                velocidadFinal = calculos.velocidadFinal;
                distanciaTotal += calculos.distancia;
                tiempoTotal += calculos.tiempo;
                aceleracion = calculos.aceleracion;
            }
        }

        const CO2_POR_LITRO = 2.3;
        const CONSUMO_PROMEDIO = tipoVehiculo === 'automovil' ? 0.09 : tipoVehiculo === 'suv' ? 0.12 : 0.15;
        const consumo = distanciaTotal * CONSUMO_PROMEDIO;
        const emisionesTotal = consumo * CO2_POR_LITRO;

        resultados.innerHTML = `
            <h2>Resultados</h2>
            <p>Total de emisiones de CO2 para ${tipoVehiculo}: ${emisionesTotal.toFixed(2)} kg</p>
            <p>Distancia total: ${distanciaTotal.toFixed(2)} m</p>
            <p>Tiempo total: ${tiempoTotal.toFixed(2)} s</p>
            <p>Velocidad Final: ${velocidadFinal.toFixed(2)} m/s</p>
            <p>Aceleración: ${aceleracion ? aceleracion.toFixed(2) + ' m/s²' : 'N/A'}</p>
        `;

        velocidadChart.data.labels.push(tiempoTotal);
        velocidadChart.data.datasets[0].data.push(velocidadFinal);
        velocidadChart.update();

        emisionesChart.data.labels.push(`Simulación ${emisionesChart.data.labels.length + 1}`);
        emisionesChart.data.datasets[0].data.push(emisionesTotal);
        emisionesChart.update();
    });
});
