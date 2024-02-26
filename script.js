document.addEventListener('DOMContentLoaded', async () => {

    if (window.ethereum) {

        window.web3 = new Web3(window.ethereum);

        await window.ethereum.enable();

        const contractAddress = '0xbCE1A4fd396A160A3D47e56C7767dB11A19043bD'; // Dirección del contrato desplegado

        const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ClaimDividends","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[],"name":"ceoAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNextDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserAvailableDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserDailyDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasuryPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDividendsClaimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userWithdrawals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

        const contract = new web3.eth.Contract(contractABI, contractAddress);

        const accounts = await web3.eth.getAccounts();

        const userAccount = accounts[0];

        updateStats(); // Actualizar estadísticas iniciales

        updateTopDepositors(); // Actualizar el ranking de los depositantes principales

        // Event listeners para los botones de depositar, retirar y reclamar dividendos
        document.getElementById('deposit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = document.getElementById('deposit-amount').value;
            await contract.methods.deposit().send({ from: userAccount, value: web3.utils.toWei(amount, 'ether') });
            updateStats();
            updateTopDepositors(); // Actualizar el ranking después del depósito
            document.getElementById('deposit-amount').value = ''; // Limpiar el campo después del depósito
        });

        document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = document.getElementById('withdraw-amount').value;
            await contract.methods.withdraw(web3.utils.toWei(amount, 'ether')).send({ from: userAccount });
            updateStats();
            updateTopDepositors(); // Actualizar el ranking después del retiro
            document.getElementById('withdraw-amount').value = ''; // Limpiar el campo después del retiro
        });

        document.getElementById('claim-dividends').addEventListener('click', async () => {
            await contract.methods.claimDividends().send({ from: userAccount });
            updateStats();
            updateTopDepositors(); // Actualizar el ranking después de reclamar dividendos
        });

        async function updateStats() {
    // Obtenemos las estadísticas del contrato
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

    // Calcular la cantidad exacta de BNB que le corresponde al usuario como dividendos hoy
    const userSharePercentage = parseFloat(userDeposits) / parseFloat(totalTreasuryPool);
    const dividendsAvailableToday = parseFloat(totalDividendsPool);
    const userDividendsTodayExact = dividendsAvailableToday * userSharePercentage;

    // Actualizamos los elementos HTML con las estadísticas obtenidas
    document.getElementById('user-address').innerText = userAccount; // Mostrar la dirección del usuario
    document.getElementById('total-deposits').innerText = web3.utils.fromWei(totalDeposits, 'ether');
    document.getElementById('total-treasury-pool').innerText = web3.utils.fromWei(totalTreasuryPool, 'ether');
    document.getElementById('total-dividends-pool').innerText = web3.utils.fromWei(totalDividendsPool, 'ether');
    document.getElementById('last-dividends-payment-time').innerText = new Date(lastDividendsPaymentTime * 1000).toLocaleString();
    document.getElementById('user-deposits').innerText = web3.utils.fromWei(userDeposits, 'ether');
    document.getElementById('user-withdrawals').innerText = web3.utils.fromWei(userWithdrawals, 'ether');
    document.getElementById('contract-balance').innerText = web3.utils.fromWei(contractBalance, 'ether');
    document.getElementById('user-dividends-today').innerText = web3.utils.fromWei(userDividendsTodayExact.toString(), 'ether');
    document.getElementById('user-current-deposit').innerText = web3.utils.fromWei(userCurrentDeposit.toString(), 'ether'); // Convertir a cadena antes de mostrar
    document.getElementById('user-total-withdrawals').innerText = web3.utils.fromWei(userTotalWithdrawals, 'ether');
    document.getElementById('user-total-dividends').innerText = web3.utils.fromWei(userTotalDividends, 'ether');
}

        // Temporizador para el pago de dividendos cada 6 horas, comenzando a las 15:30 UTC del 27 de febrero de 2024
        function calcularTiempoRestanteParaPago() {
            const now = new Date();
            const utcTime = now.getTime() + now.getTimezoneOffset() * 60000; // Convertir a tiempo UTC
            const startDateTime = new Date('2024-02-27T15:30:00Z').getTime(); // Tiempo de inicio del temporizador en UTC
            const diff = startDateTime - utcTime;
            return diff > 0 ? diff : diff + (6 * 60 * 60 * 1000); // Si el tiempo es negativo, agregar 6 horas para el próximo pago
        }

        // Función para actualizar el contador de cuenta atrás
        function actualizarContador() {
            const contador = document.getElementById('countdown-timer');
            const tiempoRestante = calcularTiempoRestanteParaPago();
            const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
            const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);
            contador.textContent = `${horas}h ${minutos}m ${segundos}s`;
        }

        // Función para inicializar el contador de cuenta atrás
        function inicializarContador() {
            actualizarContador(); // Actualizar el contador inmediatamente
            setInterval(actualizarContador, 1000); // Actualizar el contador cada segundo
        }

        inicializarContador(); // Inicializar el contador al cargar la página

    } else {
        alert('Por favor, instala MetaMask para utilizar esta aplicación.');
    }

});

