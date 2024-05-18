document.addEventListener("DOMContentLoaded", async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const contractAddress = '0xfBA4051e9E284Ba09e98bA43450a057C78A596ed';
        const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ceo","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getStats","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasuryPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"userAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"deposits","type":"uint256"},{"internalType":"uint256","name":"withdrawals","type":"uint256"},{"internalType":"uint256","name":"totalDividends","type":"uint256"},{"internalType":"uint256","name":"lastDividends","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

        const contract = new web3.eth.Contract(contractABI, contractAddress);

        const userAddress = (await web3.eth.getAccounts())[0];
        document.getElementById("user-address").innerText = userAddress;

        async function updateStats() {
            const [totalDeposits, totalTreasuryPool, totalDividendsPool, lastDividendsPaymentTime] = await contract.methods.getStats().call();
            document.getElementById("total-deposits").innerText = web3.utils.fromWei(totalDeposits, 'ether');
            document.getElementById("total-treasury-pool").innerText = web3.utils.fromWei(totalTreasuryPool, 'ether');
            document.getElementById("total-dividends-pool").innerText = web3.utils.fromWei(totalDividendsPool, 'ether');
            document.getElementById("last-dividends-payment-time").innerText = new Date(lastDividendsPaymentTime * 1000).toLocaleString();

            const [userDeposits, userWithdrawals, userTotalDividends, userLastDividends] = await contract.methods.getUserStats(userAddress).call();
            document.getElementById("user-deposits").innerText = web3.utils.fromWei(userDeposits, 'ether');
            document.getElementById("user-withdrawals").innerText = web3.utils.fromWei(userWithdrawals, 'ether');
            document.getElementById("user-total-dividends").innerText = web3.utils.fromWei(userTotalDividends, 'ether');
            document.getElementById("user-dividends-today").innerText = web3.utils.fromWei(userLastDividends, 'ether');
        }

        document.getElementById("deposit-form").addEventListener("submit", async (event) => {
            event.preventDefault();
            const depositAmount = document.getElementById("deposit-amount").value;
            await contract.methods.deposit().send({ from: userAddress, value: web3.utils.toWei(depositAmount, 'ether') });
            await updateStats();
        });

        document.getElementById("withdraw-form").addEventListener("submit", async (event) => {
            event.preventDefault();
            const withdrawAmount = document.getElementById("withdraw-amount").value;
            await contract.methods.withdraw(web3.utils.toWei(withdrawAmount, 'ether')).send({ from: userAddress });
            await updateStats();
        });

        document.getElementById("claim-dividends").addEventListener("click", async () => {
            await contract.methods.claimDividends().send({ from: userAddress });
            await updateStats();
        });

        await updateStats();
    } else {
        alert('Please install MetaMask to use this application.');
    }
});
