/**
 * SeraphAi Crypto Mortgage Calculator
 * Calculates mortgage affordability using crypto asset depletion methodology
 */

// MSA-specific cost factors
const MSA_FACTORS = {
  high: {
    propertyTaxRate: 0.0175, // 1.75% annual
    insurance: 200, // $200/month
    hoa: 300, // $300/month estimated
    name: 'High Cost Area'
  },
  medium: {
    propertyTaxRate: 0.0125, // 1.25% annual
    insurance: 125, // $125/month
    hoa: 150, // $150/month estimated
    name: 'Medium Cost Area'
  },
  low: {
    propertyTaxRate: 0.0075, // 0.75% annual
    insurance: 87.5, // $87.50/month
    hoa: 50, // $50/month estimated
    name: 'Low Cost Area'
  }
};

/**
 * Calculate monthly crypto income using depletion method
 * Formula: (Crypto Value × 0.5) ÷ 84
 */
function calculateCryptoMonthlyIncome(cryptoValue) {
  return (cryptoValue * 0.5) / 84;
}

/**
 * Calculate monthly mortgage payment (principal + interest)
 * Formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
 */
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

/**
 * Calculate total monthly housing costs including PITI + HOA
 */
function calculateTotalHousingCost(homePrice, msaFactor, annualRate, years) {
  // Principal & Interest
  const principalAndInterest = calculateMonthlyPayment(homePrice, annualRate, years);

  // Property Tax (monthly)
  const propertyTax = (homePrice * msaFactor.propertyTaxRate) / 12;

  // Insurance (monthly)
  const insurance = msaFactor.insurance;

  // HOA (monthly)
  const hoa = msaFactor.hoa;

  return {
    principalAndInterest,
    propertyTax,
    insurance,
    hoa,
    total: principalAndInterest + propertyTax + insurance + hoa
  };
}

/**
 * Binary search to find maximum affordable home price
 */
function findMaxHomePrice(maxMonthlyPayment, msaFactor, annualRate, years) {
  let low = 0;
  let high = maxMonthlyPayment * 12 * years * 2; // Initial high estimate
  let bestPrice = 0;

  // Binary search with 100 iterations for precision
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

/**
 * Format currency
 */
function formatCurrency(amount) {
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Format percentage
 */
function formatPercent(decimal) {
  return (decimal * 100).toFixed(2) + '%';
}

/**
 * Main calculation function
 */
function calculateAffordability() {
  // Get input values
  const cryptoValue = parseFloat(document.getElementById('cryptoValue').value) || 0;
  const additionalIncome = parseFloat(document.getElementById('additionalIncome').value) || 0;
  const msaKey = document.getElementById('msaSelect').value;
  const interestRate = parseFloat(document.getElementById('interestRate').value) || 7.5;
  const loanTerm = parseInt(document.getElementById('loanTerm').value) || 30;
  const dtiRatio = parseFloat(document.getElementById('dtiRatio').value) || 43;
  const monthlyDebts = parseFloat(document.getElementById('monthlyDebts').value) || 0;

  // Validate inputs
  if (cryptoValue <= 0) {
    alert('Please enter a valid crypto asset value.');
    return;
  }

  if (!msaKey) {
    alert('Please select your Metropolitan Statistical Area (MSA).');
    return;
  }

  const msaFactor = MSA_FACTORS[msaKey];

  // Step 1: Calculate crypto monthly income (depletion method)
  const cryptoMonthlyIncome = calculateCryptoMonthlyIncome(cryptoValue);

  // Step 2: Calculate total qualifying income
  const totalMonthlyIncome = cryptoMonthlyIncome + additionalIncome;

  // Step 3: Calculate maximum monthly housing payment based on DTI
  const maxTotalMonthlyPayment = (totalMonthlyIncome * dtiRatio) / 100;
  const maxHousingPayment = maxTotalMonthlyPayment - monthlyDebts;

  // Check if affordable
  if (maxHousingPayment <= 0) {
    alert('Your debt obligations exceed your income capacity. Please reduce debts or increase income.');
    return;
  }

  // Step 4: Find maximum affordable home price
  const maxHomePrice = findMaxHomePrice(maxHousingPayment, msaFactor, interestRate, loanTerm);

  // Step 5: Calculate detailed breakdown
  const housingCosts = calculateTotalHousingCost(maxHomePrice, msaFactor, interestRate, loanTerm);

  // Step 6: Calculate total interest over life of loan
  const totalPaid = housingCosts.principalAndInterest * loanTerm * 12;
  const totalInterest = totalPaid - maxHomePrice;

  // Display results
  displayResults({
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
  });
}

/**
 * Display calculation results
 */
function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  const resultsContent = document.getElementById('resultsContent');

  const html = `
    <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #36b37e;">
      <h3 style="color: #36b37e; margin-top: 0;">💰 Maximum Affordable Home Price</h3>
      <p style="font-size: 32px; font-weight: bold; color: #121f3d; margin: 10px 0;">
        ${formatCurrency(data.maxHomePrice)}
      </p>
      <p style="color: #666; font-size: 14px;">in ${data.msaFactor.name}</p>
    </div>

    <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
      <h4 style="color: #121f3d; margin-top: 0;">📊 Income Breakdown</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Crypto Value (Original):</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(data.cryptoValue)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">After 50% Haircut:</td>
          <td style="text-align: right;">${formatCurrency(data.cryptoValue * 0.5)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Crypto Monthly Income (÷84):</td>
          <td style="text-align: right; font-weight: bold; color: #36b37e;">${formatCurrency(data.cryptoMonthlyIncome)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Additional Monthly Income:</td>
          <td style="text-align: right;">${formatCurrency(data.additionalIncome)}</td>
        </tr>
        <tr style="border-bottom: 2px solid #121f3d;">
          <td style="padding: 8px 0; font-weight: bold;">Total Qualifying Income:</td>
          <td style="text-align: right; font-weight: bold; color: #121f3d;">${formatCurrency(data.totalMonthlyIncome)}</td>
        </tr>
      </table>
    </div>

    <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
      <h4 style="color: #121f3d; margin-top: 0;">🏠 Monthly Housing Costs (PITI + HOA)</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Principal & Interest:</td>
          <td style="text-align: right;">${formatCurrency(data.housingCosts.principalAndInterest)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Property Tax:</td>
          <td style="text-align: right;">${formatCurrency(data.housingCosts.propertyTax)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Homeowners Insurance:</td>
          <td style="text-align: right;">${formatCurrency(data.housingCosts.insurance)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">HOA Fees (est.):</td>
          <td style="text-align: right;">${formatCurrency(data.housingCosts.hoa)}</td>
        </tr>
        <tr style="border-bottom: 2px solid #121f3d;">
          <td style="padding: 8px 0; font-weight: bold;">Total Monthly Payment:</td>
          <td style="text-align: right; font-weight: bold; color: #121f3d;">${formatCurrency(data.housingCosts.total)}</td>
        </tr>
      </table>
    </div>

    <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
      <h4 style="color: #121f3d; margin-top: 0;">📈 Debt-to-Income Analysis</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Total Monthly Income:</td>
          <td style="text-align: right;">${formatCurrency(data.totalMonthlyIncome)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Maximum DTI Allowed:</td>
          <td style="text-align: right;">${data.dtiRatio}%</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Max Total Debt Payment:</td>
          <td style="text-align: right;">${formatCurrency(data.maxTotalMonthlyPayment)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Other Monthly Debts:</td>
          <td style="text-align: right;">${formatCurrency(data.monthlyDebts)}</td>
        </tr>
        <tr style="border-bottom: 2px solid #121f3d;">
          <td style="padding: 8px 0; font-weight: bold;">Available for Housing:</td>
          <td style="text-align: right; font-weight: bold; color: #36b37e;">${formatCurrency(data.maxHousingPayment)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">Actual Housing Payment:</td>
          <td style="text-align: right;">${formatCurrency(data.housingCosts.total)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Actual DTI Ratio:</td>
          <td style="text-align: right; font-weight: bold;">${((data.housingCosts.total + data.monthlyDebts) / data.totalMonthlyIncome * 100).toFixed(2)}%</td>
        </tr>
      </table>
    </div>

    <div style="background: white; padding: 15px; border-radius: 6px;">
      <h4 style="color: #121f3d; margin-top: 0;">💡 Loan Summary</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Loan Amount:</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(data.maxHomePrice)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Interest Rate:</td>
          <td style="text-align: right;">${data.interestRate}%</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Loan Term:</td>
          <td style="text-align: right;">${data.loanTerm} years</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">Total Interest Paid:</td>
          <td style="text-align: right; color: #d32f2f;">${formatCurrency(data.totalInterest)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Total Amount Paid:</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(data.maxHomePrice + data.totalInterest)}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #ffc107;">
      <p style="margin: 0; font-size: 13px; color: #856404;">
        <strong>⚠️ Important:</strong> This is an estimate only. Actual mortgage approval depends on credit score,
        documentation of crypto assets, lender requirements, and other factors. Always consult with a licensed
        mortgage professional before making financial decisions.
      </p>
    </div>
  `;

  resultsContent.innerHTML = html;
  resultsDiv.style.display = 'block';

  // Smooth scroll to results
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
