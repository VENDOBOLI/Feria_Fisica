// Variables globales para almacenar resultados
let simulaciones = [];
let simulacionId = 1;

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

// Generar campos para cada intervalo en MRUA
document.getElementById('num_intervals').addEventListener('input', function() {
    const intervalsContainer = document.getElementById('intervals_container');
    intervalsContainer.innerHTML = '';
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

// Función de simulación y cálculo de emisiones
document.getElementById('simular').addEventListener('click', function() {
    const tipoVehiculo = document.getElementById('tipo_vehiculo').value;
    const tipoMovimiento = document.getElementById('tipo_movimiento').value;
    const variableFaltante = document.getElementById('variable_faltante').value;

    let velocidades = [];
    let tiempos = [];
    let distanciaTotal = 0;

    if (tipoMovimiento === 'mru') {
        let velocidad = parseFloat(document.getElementById('velocidad_auto').value);
        let tiempo = parseFloat(document.getElementById('tiempo_auto').value);

        if (variableFaltante === 'velocidad') {
            distanciaTotal = parseFloat(document.getElementById('distancia_auto').value);
            velocidad = distanciaTotal / tiempo;
        } else if (variableFaltante === 'tiempo') {
            distanciaTotal = parseFloat(document.getElementById('distancia_auto').value);
            tiempo = distanciaTotal / velocidad;
        } else {
            distanciaTotal = velocidad * tiempo;
        }

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
            let velocidad = parseFloat(velocidadInputs[i].value);
            let tiempo = parseFloat(tiempoInputs[i].value);

            if (variableFaltante === 'velocidad') {
                distanciaTotal += parseFloat(document.getElementById(`distancia_intervalo_${i + 1}`).value);
                velocidad = distanciaTotal / tiempo;
            } else if (variableFaltante === 'tiempo') {
                distanciaTotal += parseFloat(document.getElementById(`distancia_intervalo_${i + 1}`).value);
                tiempo = distanciaTotal / velocidad;
            } else {
                distanciaTotal += velocidad * tiempo;
            }

            if (isNaN(velocidad) || isNaN(tiempo) || velocidad <= 0 || tiempo <= 0) {
                alert(`Ingrese valores válidos para el intervalo ${i + 1}.`);
                return;
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

    for (let i = 0; i < velocidades.length; i++) {
        const distancia = velocidades[i] * tiempos[i];
        const consumo = distancia * CONSUMO_PROMEDIO;
        const emisiones = consumo * CO2_POR_LITRO;
        emisionesTotal += emisiones;
        tiempoAcumulado += tiempos[i];
        velocidadVsTiempo.push({ tiempo: tiempoAcumulado, velocidad: velocidades[i] });
    }

    // Almacenar resultados
    simulaciones.push({
        id: simulacionId++,
        tipoVehiculo,
        tipoMovimiento,
        emisionesTotal: emisionesTotal.toFixed(2),
        velocidadVsTiempo
    });

    // Mostrar en la tabla
    actualizarTablaResultados();
    mostrarGraficoVelocidadTiempo();
    mostrarGraficoEmisiones();
});

// Actualizar la tabla de resultados
function actualizarTablaResultados() {
    const tablaResultados = document.getElementById('tabla_resultados');
    tablaResultados.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Tipo de Vehículo</th>
            <th>Tipo de Movimiento</th>
            <th>Emisiones de CO2 (kg)</th>
        </tr>
    `;

    simulaciones.forEach(simulacion => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${simulacion.id}</td>
            <td>${simulacion.tipoVehiculo}</td>
            <td>${simulacion.tipoMovimiento}</td>
            <td>${simulacion.emisionesTotal}</td>
        `;
        tablaResultados.appendChild(row);
    });
}

// Mostrar gráfico de velocidad vs tiempo
function mostrarGraficoVelocidadTiempo() {
    const ctx = document.getElementById('graficoVelocidadTiempo').getContext('2d');
    const datosGrafico = simulaciones.map(s => ({
        label: `Simulación ${s.id}`,
        data: s.velocidadVsTiempo.map(p => p.velocidad),
        borderColor: getRandomColor(),
        fill: false
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: simulaciones[0].velocidadVsTiempo.map(p => p.tiempo),
            datasets: datosGrafico
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
function mostrarGraficoEmisiones() {
    const ctx = document.getElementById('graficoEmisiones').getContext('2d');
    const emisionesData = simulaciones.map(s => s.emisionesTotal);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: simulaciones.map(s => `Simulación ${s.id}`),
            datasets: [{
                label: 'Emisiones de CO2 (kg)',
                data: emisionesData,
                backgroundColor: emisionesData.map(() => getRandomColor())
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Simulaciones' } },
                y: { title: { display: true, text: 'Emisiones de CO2 (kg)' } }
            }
        }
    });
}

// Generador de colores aleatorios para gráficos
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
