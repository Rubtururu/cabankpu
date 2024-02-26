document.addEventListener('DOMContentLoaded', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const contractAddress = '0xbCE1A4fd396A160A3D47e56C7767dB11A19043bD'; // Dirección del contrato desplegado

        const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ClaimDividends","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[],"name":"ceoAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNextDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserAvailableDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserDailyDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasuryPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userDividendsClaimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userWithdrawals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

        const contract = new web3.eth.Contract(contractABI, contractAddress);

        const accounts = await web3.eth.getAccounts();
        const userAccount = accounts[0];

        // Funciones de interacción con el contrato
        async function deposit(amount) {
            try {
                const tx = await contract.methods.deposit().send({ from: userAccount, value: amount });
                console.log(tx);
                // Actualizar UI o mostrar mensaje de éxito
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
            }
        }

        async function withdraw(amount) {
            try {
                const tx = await contract.methods.withdraw(amount).send({ from: userAccount });
                console.log(tx);
                // Actualizar UI o mostrar mensaje de éxito
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
            }
        }

        async function claimDividends() {
            try {
                const tx = await contract.methods.claimDividends().send({ from: userAccount });
                console.log(tx);
                // Actualizar UI o mostrar mensaje de éxito
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
            }
        }

        async function getUserDailyDividends(user) {
            try {
                const dividends = await contract.methods.getUserDailyDividends(user).call();
                console.log('Daily dividends for user', dividends);
                // Actualizar UI con las dividendos diarios del usuario
                return dividends;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getUserAvailableDividends(user) {
            try {
                const dividends = await contract.methods.getUserAvailableDividends(user).call();
                console.log('Available dividends for user', dividends);
                // Actualizar UI con las dividendos disponibles del usuario
                return dividends;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getContractBalance() {
            try {
                const balance = await contract.methods.getContractBalance().call();
                console.log('Contract balance', balance);
                // Actualizar UI con el saldo del contrato
                return balance;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getNextDividendsPaymentTime() {
            try {
                const time = await contract.methods.getNextDividendsPaymentTime().call();
                console.log('Next dividends payment time', new Date(time * 1000));
                // Actualizar UI con el tiempo del próximo pago de dividendos
                return time;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getUserDeposits(user) {
            try {
                const deposits = await contract.methods.userDeposits(user).call();
                console.log('User deposits', deposits);
                // Actualizar UI con los depósitos del usuario
                return deposits;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getUserWithdrawals(user) {
            try {
                const withdrawals = await contract.methods.userWithdrawals(user).call();
                console.log('User withdrawals', withdrawals);
                // Actualizar UI con los retiros del usuario
                return withdrawals;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getUserDividends(user) {
            try {
                const dividends = await contract.methods.userDividends(user).call();
                console.log('User dividends', dividends);
                // Actualizar UI con los dividendos del usuario
                return dividends;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getUserDividendsClaimed(user) {
            try {
                const dividendsClaimed = await contract.methods.userDividendsClaimed(user).call();
                console.log('User dividends claimed', dividendsClaimed);
                // Actualizar UI con los dividendos reclamados por el usuario
                return dividendsClaimed;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getTotalDeposits() {
            try {
                const totalDeposits = await contract.methods.totalDeposits().call();
                console.log('Total deposits', totalDeposits);
                // Actualizar UI con los depósitos totales
                return totalDeposits;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getTotalTreasuryPool() {
            try {
                const totalTreasuryPool = await contract.methods.totalTreasuryPool().call();
                console.log('Total treasury pool', totalTreasuryPool);
                // Actualizar UI con el total del tesoro
                return totalTreasuryPool;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getTotalDividendsPool() {
            try {
                const totalDividendsPool = await contract.methods.totalDividendsPool().call();
                console.log('Total dividends pool', totalDividendsPool);
                // Actualizar UI con el total de la pool de dividendos
                return totalDividendsPool;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        async function getLastDividendsPaymentTime() {
            try {
                const time = await contract.methods.lastDividendsPaymentTime().call();
                console.log('Last dividends payment time', new Date(time * 1000));
                // Actualizar UI con el tiempo del último pago de dividendos
                return time;
            } catch (error) {
                console.error(error);
                // Mostrar mensaje de error
                return 0;
            }
        }

        // Ejemplo de uso de las funciones
        // await deposit(0.1); // Depositar 0.1 Ether
        // await withdraw(0.05); // Retirar 0.05 Ether
        // await claimDividends(); // Reclamar dividendos
        // await getUserDailyDividends(userAccount);
        // await getUserAvailableDividends(userAccount);
        // await getContractBalance();
        // await getNextDividendsPaymentTime();
        // await getUserDeposits(userAccount);
        // await getUserWithdrawals(userAccount);
        // await getUserDividends(userAccount);
        // await getUserDividendsClaimed(userAccount);
        // await getTotalDeposits();
        // await getTotalTreasuryPool();
        // await getTotalDividendsPool();
        // await getLastDividendsPaymentTime();

        // Puedes conectar estas funciones a eventos de botones en tu UI
    } else {
        console.error('MetaMask no está instalado');
        // Mostrar mensaje de error o instrucciones para instalar MetaMask
    }
});
