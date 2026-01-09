#!/usr/bin/env node

/**
 * Command-line test harness for the Crypto Mortgage Calculator
 * Run with: node test-calculator.js
 */

// MSA-specific cost factors
const MSA_FACTORS = {
  high: {
    propertyTaxRate: 0.0175,
    insurance: 200,
    hoa: 300,
    name: 'High Cost Area'
  },
  medium: {
    propertyTaxRate: 0.0125,
    insurance: 125,
    hoa: 150,
    name: 'Medium Cost Area'
  },
  low: {
    propertyTaxRate: 0.0075,
    insurance: 87.5,
    hoa: 50,
    name: 'Low Cost Area'
  }
};

// Calculate monthly crypto income using depletion method
function calculateCryptoMonthlyIncome(cryptoValue) {
  return (cryptoValue * 0.5) / 84;
}

// Calculate monthly mortgage payment
function calculateMonthlyPayment(principal, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;

  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  const payment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return payment;
}

// Calculate total housing costs
function calculateTotalHousingCost(homePrice, msaFactor, annualRate, years) {
  const principalAndInterest = calculateMonthlyPayment(homePrice, annualRate, years);
  const propertyTax = (homePrice * msaFactor.propertyTaxRate) / 12;
  const insurance = msaFactor.insurance;
  const hoa = msaFactor.hoa;

  return {
    principalAndInterest,
    propertyTax,
    insurance,
    hoa,
    total: principalAndInterest + propertyTax + insurance + hoa
  };
}

// Binary search to find maximum affordable home price
function findMaxHomePrice(maxMonthlyPayment, msaFactor, annualRate, years) {
  let low = 0;
  let high = maxMonthlyPayment * 12 * years * 2;
  let bestPrice = 0;

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const housing = calculateTotalHousingCost(mid, msaFactor, annualRate, years);

    if (housing.total <= maxMonthlyPayment) {
      bestPrice = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  return bestPrice;
}

// Format currency
function formatCurrency(amount) {
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Main calculation function
function calculateAffordability(params) {
  const {
    cryptoValue,
    additionalIncome,
    msaKey,
    interestRate,
    loanTerm,
    dtiRatio,
    monthlyDebts
  } = params;

  const msaFactor = MSA_FACTORS[msaKey];

  // Step 1: Calculate crypto monthly income
  const cryptoMonthlyIncome = calculateCryptoMonthlyIncome(cryptoValue);

  // Step 2: Calculate total qualifying income
  const totalMonthlyIncome = cryptoMonthlyIncome + additionalIncome;

  // Step 3: Calculate maximum monthly housing payment
  const maxTotalMonthlyPayment = (totalMonthlyIncome * dtiRatio) / 100;
  const maxHousingPayment = maxTotalMonthlyPayment - monthlyDebts;

  // Step 4: Find maximum affordable home price
  const maxHomePrice = findMaxHomePrice(maxHousingPayment, msaFactor, interestRate, loanTerm);

  // Step 5: Calculate detailed breakdown
  const housingCosts = calculateTotalHousingCost(maxHomePrice, msaFactor, interestRate, loanTerm);

  // Step 6: Calculate total interest
  const totalPaid = housingCosts.principalAndInterest * loanTerm * 12;
  const totalInterest = totalPaid - maxHomePrice;

  return {
    cryptoValue,
    cryptoMonthlyIncome,
    additionalIncome,
    totalMonthlyIncome,
    dtiRatio,
    monthlyDebts,
    maxHousingPayment,
    maxHomePrice,
    housingCosts,
    msaFactor,
    interestRate,
    loanTerm,
    totalInterest,
    maxTotalMonthlyPayment
  };
}

// Display results
function displayResults(data) {
  const actualDTI = ((data.housingCosts.total + data.monthlyDebts) / data.totalMonthlyIncome * 100).toFixed(2);

  console.log('\n' + '='.repeat(70));
  console.log('🏦  SERAPH AI CRYPTO MORTGAGE CALCULATOR RESULTS');
  console.log('='.repeat(70));

  console.log('\n💰 MAXIMUM AFFORDABLE HOME PRICE');
  console.log('─'.repeat(70));
  console.log(`   ${formatCurrency(data.maxHomePrice)}`);
  console.log(`   in ${data.msaFactor.name}`);

  console.log('\n📊 INCOME BREAKDOWN');
  console.log('─'.repeat(70));
  console.log(`   Crypto Value (Original):        ${formatCurrency(data.cryptoValue)}`);
  console.log(`   After 50% Haircut:               ${formatCurrency(data.cryptoValue * 0.5)}`);
  console.log(`   Crypto Monthly Income (÷84):     ${formatCurrency(data.cryptoMonthlyIncome)}`);
  console.log(`   Additional Monthly Income:       ${formatCurrency(data.additionalIncome)}`);
  console.log(`   ` + '─'.repeat(68));
  console.log(`   Total Qualifying Income:         ${formatCurrency(data.totalMonthlyIncome)}`);

  console.log('\n🏠 MONTHLY HOUSING COSTS (PITI + HOA)');
  console.log('─'.repeat(70));
  console.log(`   Principal & Interest:            ${formatCurrency(data.housingCosts.principalAndInterest)}`);
  console.log(`   Property Tax:                    ${formatCurrency(data.housingCosts.propertyTax)}`);
  console.log(`   Homeowners Insurance:            ${formatCurrency(data.housingCosts.insurance)}`);
  console.log(`   HOA Fees (est.):                 ${formatCurrency(data.housingCosts.hoa)}`);
  console.log(`   ` + '─'.repeat(68));
  console.log(`   Total Monthly Payment:           ${formatCurrency(data.housingCosts.total)}`);

  console.log('\n📈 DEBT-TO-INCOME ANALYSIS');
  console.log('─'.repeat(70));
  console.log(`   Total Monthly Income:            ${formatCurrency(data.totalMonthlyIncome)}`);
  console.log(`   Maximum DTI Allowed:             ${data.dtiRatio}%`);
  console.log(`   Max Total Debt Payment:          ${formatCurrency(data.maxTotalMonthlyPayment)}`);
  console.log(`   Other Monthly Debts:             ${formatCurrency(data.monthlyDebts)}`);
  console.log(`   ` + '─'.repeat(68));
  console.log(`   Available for Housing:           ${formatCurrency(data.maxHousingPayment)}`);
  console.log(`   Actual Housing Payment:          ${formatCurrency(data.housingCosts.total)}`);
  console.log(`   Actual DTI Ratio:                ${actualDTI}%`);

  console.log('\n💡 LOAN SUMMARY');
  console.log('─'.repeat(70));
  console.log(`   Loan Amount:                     ${formatCurrency(data.maxHomePrice)}`);
  console.log(`   Interest Rate:                   ${data.interestRate}%`);
  console.log(`   Loan Term:                       ${data.loanTerm} years`);
  console.log(`   Total Interest Paid:             ${formatCurrency(data.totalInterest)}`);
  console.log(`   Total Amount Paid:               ${formatCurrency(data.maxHomePrice + data.totalInterest)}`);

  console.log('\n' + '='.repeat(70));
  console.log('⚠️  This is an estimate only. Consult a licensed mortgage professional.');
  console.log('='.repeat(70) + '\n');
}

// Test Cases
console.log('\n🧪 RUNNING TEST CASES...\n');

// Test Case 1: Basic Scenario
console.log('━'.repeat(70));
console.log('TEST CASE 1: Basic Scenario');
console.log('━'.repeat(70));
const test1 = calculateAffordability({
  cryptoValue: 168000,
  additionalIncome: 5000,
  msaKey: 'medium',
  interestRate: 7.5,
  loanTerm: 30,
  dtiRatio: 43,
  monthlyDebts: 0
});
displayResults(test1);

// Test Case 2: High Net Worth
console.log('\n━'.repeat(70));
console.log('TEST CASE 2: High Net Worth Crypto Holder');
console.log('━'.repeat(70));
const test2 = calculateAffordability({
  cryptoValue: 500000,
  additionalIncome: 10000,
  msaKey: 'high',
  interestRate: 7.5,
  loanTerm: 30,
  dtiRatio: 43,
  monthlyDebts: 500
});
displayResults(test2);

// Test Case 3: Lower Value with Debt
console.log('\n━'.repeat(70));
console.log('TEST CASE 3: Lower Value with Existing Debt');
console.log('━'.repeat(70));
const test3 = calculateAffordability({
  cryptoValue: 84000,
  additionalIncome: 3000,
  msaKey: 'low',
  interestRate: 8.0,
  loanTerm: 30,
  dtiRatio: 43,
  monthlyDebts: 800
});
displayResults(test3);

// Test Case 4: Edge Case - Crypto Only Income
console.log('\n━'.repeat(70));
console.log('TEST CASE 4: Crypto-Only Income (No Additional Income)');
console.log('━'.repeat(70));
const test4 = calculateAffordability({
  cryptoValue: 336000,
  additionalIncome: 0,
  msaKey: 'medium',
  interestRate: 7.0,
  loanTerm: 30,
  dtiRatio: 43,
  monthlyDebts: 200
});
displayResults(test4);

console.log('\n✅ All tests completed successfully!\n');
