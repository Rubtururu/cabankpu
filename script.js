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

        async function updateTopUsers() {
            // Obtener el ranking de los top 10 usuarios que más dividendos ganan cada día
            const topUsers = await getTopUsers();
            // Limpiar el contenido actual del ranking
            document.getElementById('top-users').innerHTML = '';
            // Agregar cada usuario al ranking
            topUsers.forEach((user, index) => {
                const listItem = document.createElement('li');
                listItem.innerText = `${index + 1}. ${user.address} - ${web3.utils.fromWei(user.dividends, 'ether')} ETH`;
                document.getElementById('top-users').appendChild(listItem);
            });
        }

        async function getTopUsers() {
            // Obtener la lista de usuarios
            const accounts = await web3.eth.getAccounts();
            const users = [];
            // Calcular los dividendos ganados por cada usuario y almacenarlos en un array
            for (const account of accounts) {
                const dividends = await contract.methods.userDividends(account).call();
                users.push({ address: account, dividends: parseInt(dividends) });
            }
            // Ordenar el array por los dividendos en orden descendente
            users.sort((a, b) => b.dividends - a.dividends);
            // Devolver los top 10 usuarios
            return users.slice(0, 10);
        }

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

        // Llamar a la función para actualizar el ranking de los mejores usuarios al cargar la página
        updateTopUsers();

    } else {

        alert('Por favor, instala MetaMask para utilizar esta aplicación.');

    }
// Función para obtener la lista de los top 10 usuarios que más dividendos ganan
async function getTopUsers() {
    const topUsers = [];
    // Obtener la lista de usuarios del contrato
    const userList = await contract.methods.getUserList().call();
    // Iterar sobre la lista de usuarios
    for (let i = 0; i < Math.min(userList.length, 10); i++) {
        const userAddress = userList[i];
        // Obtener los dividendos del usuario
        const userDividends = await contract.methods.getUserDividends(userAddress).call();
        // Agregar el usuario y sus dividendos a la lista de top users
        topUsers.push({ address: userAddress, dividends: userDividends });
    }
    return topUsers;
}

// Función para mostrar el ranking de los top 10 usuarios en la página HTML
function displayTopUsers(topUsers) {
    const rankingContainer = document.getElementById('top-users');
    rankingContainer.innerHTML = ''; // Limpiar el contenedor antes de mostrar la lista actualizada
    topUsers.forEach((user, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${user.address}: ${user.dividends}`;
        rankingContainer.appendChild(listItem);
    });
}
});
