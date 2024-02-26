document.addEventListener('DOMContentLoaded', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const contractAddress = '0xbCE1A4fd396A160A3D47e56C7767dB11A19043bD'; // Dirección del contrato desplegado
        const contractABI = [ // Aquí debes incluir el ABI completo de tu contrato
            // Definición de las funciones del contrato
        ];
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const accounts = await web3.eth.getAccounts();
        const userAccount = accounts[0];

        // Event listener para el botón de depositar
        document.getElementById('deposit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = document.getElementById('deposit-amount').value;
            await contract.methods.deposit().send({ from: userAccount, value: web3.utils.toWei(amount, 'ether') });
            updateStats();
            updateTopDepositors(); // Actualizar el ranking después del depósito
            document.getElementById('deposit-amount').value = ''; // Limpiar el campo después del depósito
        });

        // Event listener para el botón de retirar
        document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = document.getElementById('withdraw-amount').value;
            await contract.methods.withdraw(web3.utils.toWei(amount, 'ether')).send({ from: userAccount });
            updateStats();
            updateTopDepositors(); // Actualizar el ranking después del retiro
            document.getElementById('withdraw-amount').value = ''; // Limpiar el campo después del retiro
        });

        // Event listener para el botón de reclamar dividendos
        document.getElementById('claim-dividends').addEventListener('click', async () => {
            await contract.methods.claimDividends().send({ from: userAccount });
            updateStats();
            updateTopDepositors(); // Actualizar el ranking después de reclamar dividendos
        });

        updateStats(); // Actualizar estadísticas iniciales
        updateTopDepositors(); // Actualizar el ranking de los depositantes principales

        // Función para actualizar todas las estadísticas
        async function updateStats() {
            // Obtener estadísticas del contrato
            const totalDeposits = await contract.methods.totalDeposits().call();
            const totalTreasuryPool = await contract.methods.totalTreasuryPool().call();
            const totalDividendsPool = await contract.methods.totalDividendsPool().call();
            const lastDividendsPaymentTime = await contract.methods.lastDividendsPaymentTime().call();
            const contractBalance = await contract.methods.getContractBalance().call();
            // Obtener estadísticas del usuario
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

            // Actualizar los elementos HTML con las estadísticas obtenidas
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

        // Función para actualizar el ranking de los depositantes principales
        async function updateTopDepositors() {
            const topDepositorsElement = document.getElementById('top-depositors');
            topDepositorsElement.innerHTML = ''; // Limpiar la lista antes de actualizar
            const depositors = await getTopDepositors(); // Obtener los 10 principales depositantes
            depositors.forEach((depositor, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${index + 1}. ${depositor.address} - ${web3.utils.fromWei(depositor.amount, 'ether')} BNB`;
                topDepositorsElement.appendChild(listItem);
            });
        }

        // Función para obtener los 10 principales depositantes
        async function getTopDepositors() {
            const allAccounts = await web3.eth.getAccounts();
            const depositors = [];
            for (const account of allAccounts) {
                const deposits = await contract.methods.userDeposits(account).call();
                depositors.push({ address: account, amount: deposits });
            }
            depositors.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)); // Ordenar por cantidad depositada
            return depositors.slice(0, 10); // Obtener los primeros 10
        }

        // Temporizador para actualizar las estadísticas cada 30 segundos
        setInterval(() => {
            updateStats();
            updateTopDepositors();
        }, 30000); // 30 segundos

    } else {
        alert('Por favor, instala MetaMask para utilizar esta aplicación.');
    }
});



