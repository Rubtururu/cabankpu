document.addEventListener('DOMContentLoaded', async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();

    const contractAddress = '0x06A0764948FcBaAC400F4681C2707c680444F29d';
    const contractABI = [
      {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
      {
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
},
        ],
        name: 'Deposit',
        type: 'event',
      },
      {
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        name: 'Withdraw',
        type: 'event',
      },
      {
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        name: 'ClaimDividends',
        type: 'event',
      },
      {
        inputs: [],
        name: 'deposit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'claimDividends',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'getContractBalance',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'getUserDailyDividends',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'lastDividendsPaymentTime',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'totalDeposits',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'totalTreasuryPool',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'totalDividendsPool',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '',
            type: 'address',
          },
        ],
        name: 'userDeposits',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '',
            type: 'address',
          },
        ],
        name: 'userWithdrawals',
       outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '',
            type: 'address',
          },
        ],
        name: 'userDividendsClaimed',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    const accounts = await web3.eth.getAccounts();
    const userAccount = accounts[0];

    updateStats(); // Update initial stats

    // Event listeners for deposit, withdraw, and claim dividends buttons
    document.getElementById('deposit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = document.getElementById('deposit-amount').value;
      await contract.methods.deposit().send({ from: userAccount, value: web3.utils.toWei(amount, 'ether') });
      updateStats();
      document.getElementById('deposit-amount').value = ''; // Clear field after deposit
    });

    document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = document.getElementById('withdraw-amount').value;
      await contract.methods.withdraw(web3.utils.toWei(amount, 'ether')).send({ from: userAccount });
      updateStats();
      document.getElementById('withdraw-amount').value = ''; // Clear field after withdraw
    });

    document.getElementById('claim-dividends').addEventListener('click', async () => {
      await contract.methods.claimDividends().send({ from: userAccount });
      updateStats();
    });

    async function updateStats() {
      // Get contract stats
      const totalDeposits = await contract.methods.totalDeposits().call();
      const totalTreasuryPool = await contract.methods.totalTreasuryPool().call();
      const totalDividendsPool = await contract.methods.totalDividendsPool().call();
      const lastDividendsPaymentTime = await contract.methods.lastDividendsPaymentTime().call();
      const contractBalance = await contract.methods.getContractBalance().call();

      // Get user stats
      const userDeposits = await contract.methods.userDeposits(userAccount).call();
      const userWithdrawals = await contract.methods.userWithdrawals(userAccount).call();
      const userDividendsToday = await contract.methods.getUserDailyDividends(userAccount).call();
      const userCurrentDeposit = parseInt(userDeposits) - parseInt(userWithdrawals);
      const userTotalWithdrawals = userWithdrawals;
      const userTotalDividends = await contract.methods.userDividendsClaimed(userAccount).call();

      // Update HTML elements with stats
      document.getElementById('user-address').innerText = userAccount;
      document.getElementById('total-deposits').innerText = web3.utils.fromWei(totalDeposits, 'ether');
      document.getElementById('total-treasury-pool').innerText = web3.utils.fromWei(totalTreasuryPool, 'ether');
      document.getElementById('total-dividends-pool').innerText = web3.utils.fromWei(totalDividendsPool, 'ether');
      document.getElementById('last-dividends-payment-time').innerText = new Date(lastDividendsPaymentTime * 1000).toLocaleString();
      document.getElementById('user-deposits').innerText = web3.utils.fromWei(userDeposits, 'ether');
      document.getElementById('user-withdrawals').innerText = web3.utils.fromWei(userWithdrawals, 'ether');
      document.getElementById('contract-balance').innerText = web3.utils.fromWei(contractBalance, 'ether');
      document.getElementById('user-dividends-today').innerText = web3.utils.fromWei(userDividendsToday, 'ether');
      document.getElementById('user-current-deposit').innerText = web3.utils.fromWei(userCurrentDeposit.toString(), 'ether');
      document.getElementById('user-total-withdrawals').innerText = web3.utils.fromWei(userTotalWithdrawals, 'ether');
      document.getElementById('user-total-dividends').innerText = web3.utils.fromWei(userTotalDividends, 'ether');
    }
  } else {
    alert('Please install MetaMask to use this application.');
  }
});
