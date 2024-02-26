document.addEventListener('DOMContentLoaded', async () => {

    if (window.ethereum) {

        window.web3 = new Web3(window.ethereum);

        await window.ethereum.enable();



        const contractAddress = '0x23E2396572609Be696134fafAbF711d089a09e2D'; // Dirección del contrato desplegado

        const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ClaimDividends","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[],"name":"ceoAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserAvailableDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserDailyDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasuryPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDividendsClaimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userWithdrawals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];



        const contract = new web3.eth.Contract(contractABI, contractAddress);

        const accounts = await web3.eth.getAccounts();

        const userAccount = accounts[0];



        updateStats(); // Actualizar estadísticas iniciales

        // Obtener datos iniciales para los gráficos
        const initialData = await fetchInitialData();
        // Crear gráficos
        createCharts(initialData);

        // Actualizar gráficos con nuevos datos cada cierto intervalo
        setInterval(async () => {
            const newData = await fetchInitialData();
            updateCharts(newData);
        }, 5000); // Actualizar cada 5 segundos


        // Event listeners para los botones de depositar, retirar y reclamar dividendos

        document.getElementById('deposit-form').addEventListener('submit', async (e) => {

            e.preventDefault();

            const amount = document.getElementById('deposit-amount').value;

            await contract.methods.deposit().send({ from: userAccount, value: web3.utils.toWei(amount, 'ether') });

            updateStats();

            document.getElementById('deposit-amount').value = ''; // Limpiar el campo después del depósito

        });



        document.getElementById('withdraw-form').addEventListener('submit', async (e) => {

            e.preventDefault();

            const amount = document.getElementById('withdraw-amount').value;

            await contract.methods.withdraw(web3.utils.toWei(amount, 'ether')).send({ from: userAccount });

            updateStats();

            document.getElementById('withdraw-amount').value = ''; // Limpiar el campo después del retiro

        });



        document.getElementById('claim-dividends').addEventListener('click', async () => {

            await contract.methods.claimDividends().send({ from: userAccount });

            updateStats();

        });



async function updateStats() {

    // Obtenemos las estadísticas del contrato

    const accounts = await web3.eth.getAccounts(); // Obtener la lista de cuentas del usuario

    const userAccount = accounts[0]; // Obtener la primera cuenta de la lista proporcionada por MetaMask

    const totalDeposits = await contract.methods.totalDeposits().call();

    const totalTreasuryPool = await contract.methods.totalTreasuryPool().call();

    const totalDividendsPool = await contract.methods.totalDividendsPool().call();

    const lastDividendsPaymentTime = await contract.methods.lastDividendsPaymentTime().call();

    const contractBalance = await contract.methods.getContractBalance().call();



    // Obtenemos las estadísticas del usuario

    const userDeposits = await contract.methods.userDeposits(userAccount).call();

    const userWithdrawals = await contract.methods.userWithdrawals(userAccount).call();

    const userDividendsToday = await contract.methods.getUserDailyDividends(userAccount).call();

    const userCurrentDeposit = parseInt(userDeposits) - parseInt(userWithdrawals); // Convertir a números antes de la resta

    const userTotalWithdrawals = userWithdrawals;

    const userTotalDividends = await contract.methods.userDividendsClaimed(userAccount).call();



    // Actualizamos los elementos HTML con las estadísticas obtenidas

    document.getElementById('user-address').innerText = userAccount; // Mostrar la dirección del usuario

    document.getElementById('total-deposits').innerText = web3.utils.fromWei(totalDeposits, 'ether');

    document.getElementById('total-treasury-pool').innerText = web3.utils.fromWei(totalTreasuryPool, 'ether');

    document.getElementById('total-dividends-pool').innerText = web3.utils.fromWei(totalDividendsPool, 'ether');

    document.getElementById('last-dividends-payment-time').innerText = new Date(lastDividendsPaymentTime * 1000).toLocaleString();

    document.getElementById('user-deposits').innerText = web3.utils.fromWei(userDeposits, 'ether');

    document.getElementById('user-withdrawals').innerText = web3.utils.fromWei(userWithdrawals, 'ether');

    document.getElementById('contract-balance').innerText = web3.utils.fromWei(contractBalance, 'ether');

    document.getElementById('user-dividends-today').innerText = web3.utils.fromWei(userDividendsToday, 'ether');

    document.getElementById('user-current-deposit').innerText = web3.utils.fromWei(userCurrentDeposit.toString(), 'ether'); // Convertir a cadena antes de mostrar

    document.getElementById('user-total-withdrawals').innerText = web3.utils.fromWei(userTotalWithdrawals, 'ether');

    document.getElementById('user-total-dividends').innerText = web3.utils.fromWei(userTotalDividends, 'ether');

}

// Obtener datos iniciales para los gráficos
        const initialData = await fetchInitialData();

        // Crear gráficos
        createCharts(initialData);


    } else {

        alert('Por favor, instala MetaMask para utilizar esta aplicación.');

    }

});



// Función para calcular el tiempo restante hasta el próximo pago de dividendos

function calcularTiempoRestanteParaPago() {

    // Obtener la fecha y hora actuales en UTC

    const ahora = new Date();

    const horaActualUTC = ahora.getUTCHours();

    const minutosActualesUTC = ahora.getUTCMinutes();

    const segundosActualesUTC = ahora.getUTCSeconds();

 // Calcular la cantidad de tiempo hasta las 20:00 UTC
    let horasRestantes = 20 - horaActualUTC;
    let minutosRestantes = 0;
    let segundosRestantes = 0;

    // Si ya es después de las 20:00 UTC, calcular el tiempo hasta las 20:00 UTC del día siguiente
    if (horaActualUTC >= 20) {
        horasRestantes = 24 - (horaActualUTC - 20);
    }

    // Calcular los minutos y segundos restantes
    if (minutosActualesUTC > 0 || segundosActualesUTC > 0) {
        horasRestantes--;
        minutosRestantes = 60 - minutosActualesUTC;
        segundosRestantes = 60 - segundosActualesUTC;
    }

    // Retornar el tiempo restante como objeto
    return {
        horas: horasRestantes,
        minutos: minutosRestantes,
        segundos: segundosRestantes
    };
}

// Función para actualizar el contador de cuenta atrás
function actualizarContador() {
    // Obtener el elemento del contador
    const contador = document.getElementById('countdown-timer');

    // Calcular el tiempo restante
    const tiempoRestante = calcularTiempoRestanteParaPago();

    // Mostrar el tiempo restante en el contador
    contador.textContent = `${tiempoRestante.horas}h ${tiempoRestante.minutos}m ${tiempoRestante.segundos}s`;
}

// Función para inicializar el contador de cuenta atrás
function inicializarContador() {
    // Actualizar el contador cada segundo
    setInterval(actualizarContador, 1000);
}

// Inicializar el contador al cargar la página
inicializarContador();


// Función para obtener datos iniciales para los gráficos
async function fetchInitialData() {
    const totalDividendsPool = await contract.methods.totalDividendsPool().call();
    const totalTreasuryPool = await contract.methods.totalTreasuryPool().call();
    return {
        totalDividendsPool: web3.utils.fromWei(totalDividendsPool, 'ether'),
        totalTreasuryPool: web3.utils.fromWei(totalTreasuryPool, 'ether')
    };
}

// Función para crear los gráficos iniciales
function createCharts(initialData) {
    // Crear gráfico de la Pool de Dividendos
    createChart('dividends-chart', 'Pool de Dividendos', initialData.totalDividendsPool, '#ffc107');

    // Crear gráfico de la Pool del Tesoro
    createChart('treasury-chart', 'Pool del Tesoro', initialData.totalTreasuryPool, '#343a40');
}

// Función para crear un gráfico
function createChart(chartId, label, data, color) {
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [label, 'Restante'],
            datasets: [{
                data: [data, 100 - data],
                backgroundColor: [color, '#f5f5f5'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '80%',
            maintainAspectRatio: false,
            legend: {
                display: false
            }
        }
    });
}


// Función para actualizar los gráficos con nuevos datos
function updateCharts(newData) {
    // Actualizar gráfico de la Pool de Dividendos
    updateChart('dividends-chart', newData.totalDividendsPool);

    // Actualizar gráfico de la Pool del Tesoro
    updateChart('treasury-chart', newData.totalTreasuryPool);
}

// Función para actualizar un gráfico con nuevos datos
function updateChart(chartId, newData) {
    const chart = Chart.getChart(chartId);
    chart.data.datasets[0].data = [newData, 100 - newData];
    chart.update();
}

async function fetchInitialData() {
    try {
        const totalDividendsPool = await contract.methods.totalDividendsPool().call();
        const totalTreasuryPool = await contract.methods.totalTreasuryPool().call();
        return { totalDividendsPool, totalTreasuryPool };
    } catch (error) {
        console.error("Error al obtener datos iniciales:", error);
        return { totalDividendsPool: 0, totalTreasuryPool: 0 };
    }
}

function createCharts(data) {
    const dividendChartCanvas = document.getElementById('dividend-chart');
    const treasuryChartCanvas = document.getElementById('treasury-chart');

    const dividendChart = new Chart(dividendChartCanvas, {
        type: 'bar',
        data: {
            labels: ['Pool de Dividendos'],
            datasets: [{
                label: 'Total',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                data: [data.totalDividendsPool]
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    const treasuryChart = new Chart(treasuryChartCanvas, {
        type: 'bar',
        data: {
            labels: ['Pool del Tesoro'],
            datasets: [{
                label: 'Total',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                data: [data.totalTreasuryPool]
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
