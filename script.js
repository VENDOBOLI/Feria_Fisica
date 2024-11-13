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

    function calcularMRU(velocidad, distancia, tiempo) {
        if (!velocidad) velocidad = distancia / tiempo;
        if (!distancia) distancia = velocidad * tiempo;
        if (!tiempo) tiempo = distancia / velocidad;
        return { velocidad, distancia, tiempo };
    }

    function calcularMRUA(velocidadInicial, velocidadFinal, distancia, tiempo) {
        if (!velocidadFinal) velocidadFinal = velocidadInicial + (distancia / tiempo) * tiempo;
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

        let velocidad = parseFloat(document.getElementById('velocidad_auto').value) / 3.6 || null;
        let distancia = parseFloat(document.getElementById('distancia_auto').value) || null;
        let tiempo = parseFloat(document.getElementById('tiempo_auto').value) * 3600 || null;

        let calculos, aceleracion, velocidadFinal;

        if (tipoMovimiento === 'mru') {
            if ((velocidad && tiempo) || (velocidad && distancia) || (distancia && tiempo)) {
                calculos = calcularMRU(velocidad, distancia, tiempo);
                velocidadFinal = calculos.velocidad;
            } else {
                alert('Para MRU, proporcione al menos dos valores entre velocidad, distancia y tiempo.');
                return;
            }
        } else if (tipoMovimiento === 'mrua') {
            const velocidadInicial = velocidad || 0;
            const velocidadFinalInput = parseFloat(document.getElementById('velocidad_final').value) / 3.6 || null;
            distancia = distancia || null;
            tiempo = tiempo || null;

            if ((velocidadInicial && distancia && tiempo) || (velocidadFinalInput && distancia && tiempo) || (velocidadInicial && tiempo && distancia)) {
                calculos = calcularMRUA(velocidadInicial, velocidadFinalInput, distancia, tiempo);
                aceleracion = calculos.aceleracion;
                velocidadFinal = calculos.velocidadFinal;
            } else {
                alert('Para MRUA, proporcione al menos dos valores entre velocidad, distancia y tiempo.');
                return;
            }
        }

        const CO2_POR_LITRO = 2.3;
        const CONSUMO_PROMEDIO = tipoVehiculo === 'automovil' ? 0.09 : tipoVehiculo === 'suv' ? 0.12 : 0.15;
        const consumo = calculos.distancia * CONSUMO_PROMEDIO;
        const emisionesTotal = consumo * CO2_POR_LITRO;

        resultados.innerHTML = `
            <h2>Resultados</h2>
            <p>Total de emisiones de CO2 para ${tipoVehiculo}: ${emisionesTotal.toFixed(2)} kg</p>
            <p>Distancia: ${calculos.distancia.toFixed(2)} m</p>
            <p>Tiempo: ${calculos.tiempo.toFixed(2)} s</p>
            <p>Velocidad Final: ${velocidadFinal.toFixed(2)} m/s</p>
            <p>Aceleración: ${aceleracion ? aceleracion.toFixed(2) + ' m/s²' : 'N/A'}</p>
        `;

        velocidadChart.data.labels.push(calculos.tiempo);
        velocidadChart.data.datasets[0].data.push(velocidadFinal);
        velocidadChart.update();

        emisionesChart.data.labels.push(`Simulación ${emisionesChart.data.labels.length + 1}`);
        emisionesChart.data.datasets[0].data.push(emisionesTotal);
        emisionesChart.update();
    });
});


