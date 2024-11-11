document.getElementById('tipo_movimiento').addEventListener('change', function() {
    const movimiento = document.getElementById('tipo_movimiento').value;
    const mruaContainer = document.getElementById('mrua_intervals');
    if (movimiento === 'mrua') {
        mruaContainer.style.display = 'block';
    } else {
        mruaContainer.style.display = 'none';
        document.getElementById('intervals_container').innerHTML = '';
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
            <label>Velocidad (km/h):</label>
            <input type="number" class="velocidad_intervalo" placeholder="Velocidad para intervalo ${i}">
            <label>Tiempo (horas):</label>
            <input type="number" class="tiempo_intervalo" placeholder="Tiempo para intervalo ${i}">
        `;
        intervalsContainer.appendChild(intervalDiv);
    }
});

document.getElementById('simular').addEventListener('click', function() {
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
    const CONSUMO_PROMEDIO = 0.09;
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
        <p>Total de emisiones de CO2: ${emisionesTotal.toFixed(2)} kg</p>
    `;

    mostrarGraficoVelocidadTiempo(velocidadVsTiempo);
    mostrarGraficoEmisiones(emisionesTotal);
});

function mostrarGraficoVelocidadTiempo(datos) {
    const ctx = document.getElementById('graficoVelocidadTiempo').getContext('2d');
    const tiempos = datos.map(d => d.tiempo);
    const velocidades = datos.map(d => d.velocidad);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: tiempos,
            datasets: [{
                label: 'Velocidad vs Tiempo',
                data: velocidades,
                borderColor: 'blue',
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

function mostrarGraficoEmisiones(emisiones) {
    const ctx = document.getElementById('graficoEmisiones').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Vehículo'],
            datasets: [{
                label: 'Emisiones de CO2 (kg)',
                data: [emisiones],
                backgroundColor: 'red'
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Emisiones (kg)' } }
            }
        }
    });
}

document.getElementById('reiniciar').addEventListener('click', function() {
    document.getElementById('resultados').innerHTML = '';
    document.getElementById('graficoVelocidadTiempo').getContext('2d').clearRect(0, 0, 400, 400);
    document.getElementById('graficoEmisiones').getContext('2d').clearRect(0, 0, 400, 400);
    document.getElementById('velocidad_auto').value = '';
    document.getElementById('tiempo_auto').value = '';
    document.getElementById('num_intervals').value = '';
    document.getElementById('intervals_container').innerHTML = '';
});
