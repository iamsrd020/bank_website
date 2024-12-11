'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-04-09T17:01:17.194Z',
    '2022-04-10T23:36:17.929Z',
    '2022-04-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatmovementsDate = function (date, locale) {
  const calcDatesPassed = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDatesPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const year = date.getFullYear();
  // const month = `${date.getMonth()}`.padStart(2, 0);
  // const day = `${date.getDate()}`.padStart(2, 0);
  // return `${year}/${month}/${day}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displaymovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const moves = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  moves.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.movementsDates[i]); //looping through movementsDates using the index

    const displayDate = formatmovementsDate(date, account.locale);

    const formattedMov = formatCurrency(
      Math.abs(mov),
      account.locale,
      account.currency
    );

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMov}</div>
  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, cur) => acc + cur); //creating a new filed and storing the balance in it

  labelBalance.textContent = formatCurrency(
    account.balance,
    account.locale,
    account.currency
  );
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(
    incomes,
    account.locale,
    account.currency
  );

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    account.locale,
    account.currency
  );

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposits => (deposits * account.interestRate) / 100)
    .filter((interest, i, arr) => {
      // console.log(arr);
      return interest >= 1;
    })
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    account.locale,
    account.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.userName = acc.owner //Creating a new filed in the account object
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

//Displaying everything on the UI
const updateUI = function (account) {
  //Display movements
  displaymovements(account);

  //Display balance
  calcDisplayBalance(account);

  //Display summary
  calcDisplaySummary(account);
};

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //print the remoaining time to the UI
    labelTimer.textContent = `${min}:${sec}`;
    //Decrease 1 sec
    //When 0 sec, Log the user out
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  };

  //Set the timer to 5min
  let time = 300;
  //call the timer every sec
  tick();

  const timer = setInterval(tick, 1000);
  return timer;
};
///////////////////Event Handlers////////////////////////////////
let currentAccount, timer;

// //!Fake Login
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//Experimenting API

// const now = new Date();
// const options = {
//   hour: 'numeric',
//   min: 'numeric',
//   day: 'numeric',
//   month: 'long',
//   year: 'numeric',
//   weekday: 'long',
// };

// const locale = navigator.language;
// console.log(locale);
// labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );
  // console.log(currentAccount);
  inputTransferAmount.value = inputTransferTo.value = '';
  if (currentAccount?.pin === +inputLoginPin.value) {
    // console.log('Login');
    //Display UI And message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;

    //Create current Date
    const now = new Date();
    const options = {
      hour: 'numeric',
      min: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    // const locale = navigator.language;
    // console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    containerApp.style.opacity = 100;
    if (timer) clearInterval(timer);

    timer = startLogoutTimer();

    //update the UI
    updateUI(currentAccount);

    //Clear login input fields
    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  if (
    amount > 0 &&
    receiverAcc && //if the recepient exists
    currentAccount.balance >= amount &&
    receiverAcc?.userName !== currentAccount.userName //checking if i am transfering the amout to myself
  ) {
    // console.log('Transfer');
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Adding date to current Account
    currentAccount.movementsDates.push(new Date().toISOString());

    //Adding date to receiver Account
    receiverAcc.movementsDates.push(new Date().toISOString());

    //Reset the timer
    clearInterval(timer);
    timer = startLogoutTimer();

    updateUI(currentAccount);
    // console.log(amount, receiverAcc);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);

      //Adding date to current Account
      currentAccount.movementsDates.push(new Date().toISOString());

      //Reset the timer
      clearInterval(timer);
      timer = startLogoutTimer();

      //Update UI
      updateUI(currentAccount);
    }, 5000);
  }

  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.userName &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    // console.log(index);

    //Delete account
    accounts.splice(index, 1);
    // console.log(accounts);

    //Hide UI
    containerApp.style.opacity = 0;

    //Setting the value to null again
    inputCloseUsername.value = inputClosePin.value = '';
  }
});

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  let sorted = false;
  displaymovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//Base 10: 0-9
//Binary base 2: 0,1

// //!Conversion
// console.log(Number('23'));
// console.log(+'23');

// //Parsing
// console.log(Number.parseInt('30px', 10));
// console.log(Number.parseInt('px30', 10));

// console.log(Number.parseInt('2.5rem'));
// console.log(Number.parseFloat('2.5rem'));

// console.log(parseFloat('2.5rem'));

// //Check if value is NaN

// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20X'));
// console.log(Number.isNaN(23 / 0));

// //Check if value is Number
// console.log(Number.isFinite(20));
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(+'20X'));
// console.log(Number.isFinite(23 / 0));

// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.0));
// console.log(Number.isInteger(23 / 0));

// //!Math and Rounding
// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(8 ** (1 / 3));

// console.log(Math.max(5, 6, 8, 10, 23, 4, 9));
// console.log(Math.max(5, 6, 8, 10, '23', 4, 9));
// console.log(Math.max(5, 6, 8, 10, '23rem', 4, 9));

// console.log(Math.min(5, 6, 8, 10, 23, 4, 9));

// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

// const randonInt = (min, max) =>
//   Math.trunc(Math.random() * (min - max) + 1 + min);
// console.log(randonInt(10, 20));

// //Rounding Integers
// console.log(Math.round(23.3));
// console.log(Math.round(23.9));

// console.log(Math.ceil(23.3));
// console.log(Math.ceil(23.9));

// console.log(Math.floor(23.3));
// console.log(Math.floor('23.9'));

// console.log(Math.trunc(-23.3));
// console.log(Math.floor(-23.3));

// //Rounding decimals

// console.log((2.7).toFixed(2));
// console.log((2.7).toFixed(0));
// console.log(+(2.799).toFixed(2));

// //!Remainder operator

// console.log(5 % 2);
// console.log(5 / 2); // 5 = 2 * 2 + 1

// console.log(8 % 3);
// console.log(8 / 3); // 8 = 2 * 3 + 2

// console.log(6 % 2);
// console.log(6 / 2);

// console.log(7 % 2);
// console.log(7 / 2);

// const isEven = n => n % 2 === 0;
// console.log(isEven(8));
// console.log(isEven(23));
// console.log(isEven(514));

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     // 0, 2, 4, 6
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';
//     // 0, 3, 6, 9
//     if (i % 3 === 0) row.style.backgroundColor = 'blue';
//   });
// });

// //!Numeric Separator
// const diameter = 287_460_000_000;
// console.log(diameter);

// const price = 345_99;
// console.log(price);

// const transferFee1 = 15_00;
// const transferFee2 = 1_500;

// const PI = 3.1415;
// console.log(PI);

// console.log(Number('230_000'));
// console.log(parseInt('230_000'));

//!Working with BigInt
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(2 ** 53 + 1);
// console.log(2 ** 53 + 2);
// console.log(2 ** 53 + 3);
// console.log(2 ** 53 + 4);

// console.log(4838430248342043823408394839483204n);
// console.log(BigInt(48384302));

// // Operations
// console.log(10000n + 10000n);
// console.log(36286372637263726376237263726372632n * 10000000n);
// // console.log(Math.sqrt(16n));

// const huge = 20289830237283728378237n;
// const num = 23;
// console.log(huge * BigInt(num));

// // Exceptions
// console.log(20n > 15);
// console.log(20n === 20);
// console.log(typeof 20n);
// console.log(20n == '20');

// console.log(huge + ' is REALLY big!!!');

// // Divisions
// console.log(11n / 3n);
// console.log(10 / 3);

//!Creating Dates
// const now = new Date();
// console.log(now);

// console.log(new Date('Apr 12 2022 11:48:33'));
// console.log(new Date('December 24, 2015'));
// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 19, 15, 20, 10));
// console.log(new Date(2037, 10, 35));

// console.log(new Date(0));
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// //Working with dates
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());

// console.log(new Date(2142237180000));

// console.log(Date.now());

// future.setFullYear(2040);
// console.log(future);

//Formating numbers Intl
// const num = 38897654.23;

// const options = {
//   style: 'currency',
//   unit: 'celcius',
//   currency: 'inr',
//   // useGrouping: false,
// };

// console.log('US', new Intl.NumberFormat('en-US').format(num));
// console.log('IN', new Intl.NumberFormat('hi-IN').format(num));
// console.log('SY', new Intl.NumberFormat('ar-SY').format(num));
// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.language).format(num)
// );

// //!SetTimeOuts and SetIntervals

// const ingredients = ['olives', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log('Here is your pizza'),
//   3000,
//   ...ingredients
// );

// console.log('Waiting...');

// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// //!setInterval
// setInterval(() => {
//   const now = new Date();
//   console.log(now);
// }, 1000);
