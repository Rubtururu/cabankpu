document.addEventListener('DOMContentLoaded', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const contractAddress = '0xbCE1A4fd396A160A3D47e56C7767dB11A19043bD'; // Dirección del contrato desplegado
        const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ClaimDividends","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[],"name":"ceoAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNextDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserAvailableDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserDailyDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasuryPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDividendsClaimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userWithdrawals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Event listeners para los botones de depositar, retirar y reclamar dividendos
        document.getElementById('deposit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = document.getElementById('deposit-amount').value;
            await contract.methods.deposit().send({ from: web3.eth.defaultAccount, value: web3.utils.toWei(amount, 'ether') });
            updateStats();
            document.getElementById('deposit-amount').value = ''; // Limpiar el campo después del depósito
        });

        document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = document.getElementById('withdraw-amount').value;
            await contract.methods.withdraw(web3.utils.toWei(amount, 'ether')).send({ from: web3.eth.defaultAccount });
            updateStats();
            document.getElementById('withdraw-amount').value = ''; // Limpiar el campo después del retiro
        });

        document.getElementById('claim-dividends').addEventListener('click', async () => {
            await contract.methods.claimDividends().send({ from: web3.eth.defaultAccount });
            updateStats();
        });

        setInterval(updateStats, 60000); // Actualizar estadísticas cada minuto
        updateStats(); // Actualizar estadísticas iniciales

        // Iniciar temporizador de distribución de dividendos cada 6 horas a las 20:30 UTC
        setInterval(distribuirDividendos, 6 * 60 * 60 * 1000); // 6 horas
    } else {
        alert('Por favor, instala MetaMask para utilizar esta aplicación.');
    }
});

async function updateStats() {
    // Obtener la cuenta del usuario
    const accounts = await web3.eth.getAccounts();
    const userAccount = accounts[0];

    // Obtener las estadísticas del contrato
    const totalDeposits = await contract.methods.totalDeposits().call();
    const totalTreasuryPool = await contract.methods.totalTreasuryPool().call();
    const totalDividendsPool = await contract.methods.totalDividendsPool().call();
    const lastDividendsPaymentTime = await contract.methods.lastDividendsPaymentTime().call();
    const contractBalance = await contract.methods.getContractBalance().call();

    // Obtener las estadísticas del usuario
    const userDeposits = await contract.methods.userDeposits(userAccount).call();
    const userWithdrawals = await contract.methods.userWithdrawals(userAccount).call();
    const userDividendsToday = await contract.methods.getUserDailyDividends(userAccount).call();
    const userCurrentDeposit = parseInt(userDeposits) - parseInt(userWithdrawals); // Convertir a números antes de la resta
    const userTotalWithdrawals = userWithdrawals;
    const userTotalDividends = await contract.methods.userDividendsClaimed(userAccount).call();

    // Convertir los dividendos de hoy a BNB y formatear el resultado
    const userDividendsTodayBNB = web3.utils.fromWei(userDividendsToday, 'ether');
    const formattedUserDividendsToday = parseFloat(userDividendsTodayBNB).toFixed(8) + " BNB";

    // Actualizar los elementos HTML con las estadísticas obtenidas
    document.getElementById('user-address').innerText = userAccount; // Mostrar la dirección del usuario
    document.getElementById('total-deposits').innerText = web3.utils.fromWei(totalDeposits, 'ether');
    document.getElementById('total-treasury-pool').innerText = web3.utils.fromWei(totalTreasuryPool, 'ether');
    document.getElementById('total-dividends-pool').innerText = web3.utils.fromWei(totalDividendsPool, 'ether');
    document.getElementById('last-dividends-payment-time').innerText = new Date(lastDividendsPaymentTime * 1000).toLocaleString();
    document.getElementById('user-deposits').innerText = web3.utils.fromWei(userDeposits, 'ether');
    document.getElementById('user-withdrawals').innerText = web3.utils.fromWei(userWithdrawals, 'ether');
    document.getElementById('contract-balance').innerText = web3.utils.fromWei(contractBalance, 'ether');
    document.getElementById('user-dividends-today').innerText = formattedUserDividendsToday;
    document.getElementById('user-current-deposit').innerText = web3.utils.fromWei(userCurrentDeposit.toString(), 'ether'); // Convertir a cadena antes de mostrar
    document.getElementById('user-total-withdrawals').innerText = web3.utils.fromWei(userTotalWithdrawals, 'ether');
    document.getElementById('user-total-dividends').innerText = web3.utils.fromWei(userTotalDividends, 'ether');
}

async function distribuirDividendos() {
    try {
        await contract.methods.claimDividends().send({ from: web3.eth.defaultAccount });
        console.log("Dividendos distribuidos correctamente.");
    } catch (error) {
        console.error("Error al distribuir dividendos:", error);
    }
}
