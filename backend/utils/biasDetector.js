/**
 * biasDetector.js
 * ─────────────────────────────────────────────────────────────────
 * Pure JavaScript bias detection engine for FairSight.
 * No external ML libraries — all standard math.
 *
 * Metrics computed:
 *  1. Demographic Parity        — are positive outcome rates equal across groups?
 *  2. Disparate Impact Ratio    — ratio of minority to majority positive rate
 *  3. Statistical Parity Diff   — raw difference in positive rates
 *  4. Class Imbalance           — is any group severely underrepresented?
 *  5. Missing Data Bias         — do missing values cluster in specific groups?
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Main analysis function.
 * @param {Array<Object>} rows             - Parsed CSV rows
 * @param {string}        protectedAttr    - Column name for protected attribute (e.g. "gender")
 * @param {string}        outcomeCol       - Column name for outcome (e.g. "hired")
 * @param {string}        positiveOutcome  - Value that counts as a positive outcome (e.g. "yes")
 * @returns {Object} Full analysis result
 */
function analyzeDataset(rows, protectedAttr, outcomeCol, positiveOutcome) {
  const totalRows = rows.length;

  // ── Step 1: Group rows by protected attribute value ──────────────────────
  const groups = {};
  for (const row of rows) {
    const groupVal = String(row[protectedAttr] ?? 'Unknown').trim();
    if (!groups[groupVal]) {
      groups[groupVal] = { all: [], positives: [], missing: 0 };
    }
    groups[groupVal].all.push(row);

    const outcome = String(row[outcomeCol] ?? '').trim().toLowerCase();
    const positive = String(positiveOutcome).trim().toLowerCase();

    if (outcome === positive) {
      groups[groupVal].positives.push(row);
    }
    if (!row[outcomeCol] || String(row[outcomeCol]).trim() === '') {
      groups[groupVal].missing++;
    }
  }

  const groupNames = Object.keys(groups);

  // ── Step 2: Compute per-group stats ──────────────────────────────────────
  const groupStats = groupNames.map((name) => {
    const g = groups[name];
    const count = g.all.length;
    const positiveCount = g.positives.length;
    const positiveRate = count > 0 ? positiveCount / count : 0;
    return { group: name, count, positiveCount, positiveRate };
  });

  // Sort so majority group is first (largest count)
  groupStats.sort((a, b) => b.count - a.count);

  const majorityRate = groupStats[0]?.positiveRate ?? 0;
  const minorityRate = groupStats[groupStats.length - 1]?.positiveRate ?? 0;

  // ── Step 3: Compute metrics ───────────────────────────────────────────────

  // 3a. Statistical Parity Difference (majority − minority positive rate)
  const statisticalParityDiff = Math.abs(majorityRate - minorityRate);

  // 3b. Disparate Impact Ratio (minority / majority)
  const disparateImpact =
    majorityRate > 0 ? +(minorityRate / majorityRate).toFixed(4) : 0;

  // 3c. Demographic Parity Score (how close all groups are to the overall rate)
  const overallPositiveRate =
    rows.filter(
      (r) =>
        String(r[outcomeCol] ?? '').trim().toLowerCase() ===
        String(positiveOutcome).trim().toLowerCase()
    ).length / totalRows;

  const deviations = groupStats.map((g) =>
    Math.abs(g.positiveRate - overallPositiveRate)
  );
  const avgDeviation =
    deviations.reduce((a, b) => a + b, 0) / deviations.length;
  // Scale: 0 = perfect parity, 1 = maximum inequality
  const demographicParity = +avgDeviation.toFixed(4);

  // 3d. Class Imbalance — std deviation of group proportions
  const avgProportion = 1 / groupNames.length;
  const proportionVariances = groupStats.map((g) => {
    const p = g.count / totalRows;
    return Math.pow(p - avgProportion, 2);
  });
  const classImbalance = +Math.sqrt(
    proportionVariances.reduce((a, b) => a + b, 0) / groupNames.length
  ).toFixed(4);

  // 3e. Missing Data Bias — max missing rate across groups
  const groupMissingRates = groupStats.map((g) => {
    const rawGroup = groups[g.group];
    const missingCount = rawGroup.all.filter(
      (r) => !r[outcomeCol] || String(r[outcomeCol]).trim() === ''
    ).length;
    return missingCount / rawGroup.all.length;
  });
  const missingDataBias = +Math.max(...groupMissingRates).toFixed(4);

  // ── Step 4: Column-level missing rates ───────────────────────────────────
  const columns = Object.keys(rows[0] ?? {});
  const columnMissingRates = {};
  for (const col of columns) {
    const missingCount = rows.filter(
      (r) => r[col] === undefined || String(r[col]).trim() === ''
    ).length;
    columnMissingRates[col] = +((missingCount / totalRows) * 100).toFixed(2);
  }

  // ── Step 5: Generate flags ────────────────────────────────────────────────
  const flags = [];

  // Disparate Impact (80% rule — industry standard)
  if (disparateImpact < 0.8) {
    flags.push({
      metric: 'Disparate Impact',
      severity: disparateImpact < 0.5 ? 'critical' : 'warning',
      value: disparateImpact,
      threshold: 0.8,
      message: `Minority group has only ${(disparateImpact * 100).toFixed(1)}% of the positive outcome rate of the majority group. The 80% rule threshold is not met.`,
      suggestion:
        'Consider reweighting training samples, applying fairness constraints, or auditing the selection criteria for embedded bias.',
    });
  } else {
    flags.push({
      metric: 'Disparate Impact',
      severity: 'ok',
      value: disparateImpact,
      threshold: 0.8,
      message: `Disparate Impact ratio is ${(disparateImpact * 100).toFixed(1)}%, which meets the 80% (four-fifths) rule.`,
      suggestion: 'Continue monitoring as new data arrives.',
    });
  }

  // Statistical Parity Difference
  if (statisticalParityDiff > 0.1) {
    flags.push({
      metric: 'Statistical Parity Difference',
      severity: statisticalParityDiff > 0.2 ? 'critical' : 'warning',
      value: +statisticalParityDiff.toFixed(4),
      threshold: 0.1,
      message: `The difference in positive outcome rates between groups is ${(statisticalParityDiff * 100).toFixed(1)}%, exceeding the 10% fairness threshold.`,
      suggestion:
        'Apply equalized odds post-processing or use an in-processing fairness algorithm during model training.',
    });
  } else {
    flags.push({
      metric: 'Statistical Parity Difference',
      severity: 'ok',
      value: +statisticalParityDiff.toFixed(4),
      threshold: 0.1,
      message: `Outcome rate difference of ${(statisticalParityDiff * 100).toFixed(1)}% is within the acceptable 10% range.`,
      suggestion: 'Keep tracking across time to detect drift.',
    });
  }

  // Class Imbalance
  if (classImbalance > 0.15) {
    flags.push({
      metric: 'Class Imbalance',
      severity: classImbalance > 0.3 ? 'critical' : 'warning',
      value: classImbalance,
      threshold: 0.15,
      message: `Protected attribute groups are significantly imbalanced (σ = ${classImbalance}). Underrepresented groups will have less influence on model learning.`,
      suggestion:
        'Use oversampling (SMOTE), undersampling, or class-weight adjustments during model training to correct representation.',
    });
  } else {
    flags.push({
      metric: 'Class Imbalance',
      severity: 'ok',
      value: classImbalance,
      threshold: 0.15,
      message: `Group representation is roughly balanced (σ = ${classImbalance}).`,
      suggestion: 'No immediate action required.',
    });
  }

  // Demographic Parity
  if (demographicParity > 0.05) {
    flags.push({
      metric: 'Demographic Parity',
      severity: demographicParity > 0.15 ? 'critical' : 'warning',
      value: demographicParity,
      threshold: 0.05,
      message: `Average deviation from overall positive rate is ${(demographicParity * 100).toFixed(1)}%, indicating groups are not treated equally.`,
      suggestion:
        'Investigate upstream data collection practices and evaluate whether the outcome label itself contains historical bias.',
    });
  } else {
    flags.push({
      metric: 'Demographic Parity',
      severity: 'ok',
      value: demographicParity,
      threshold: 0.05,
      message: `Groups receive similar positive outcome rates (avg deviation ${(demographicParity * 100).toFixed(1)}%).`,
      suggestion: 'Maintain current data collection practices.',
    });
  }

  // Missing Data Bias
  if (missingDataBias > 0.05) {
    flags.push({
      metric: 'Missing Data Bias',
      severity: missingDataBias > 0.2 ? 'critical' : 'warning',
      value: missingDataBias,
      threshold: 0.05,
      message: `Up to ${(missingDataBias * 100).toFixed(1)}% of outcome values are missing for at least one group, which can silently skew results.`,
      suggestion:
        'Audit data collection pipelines. Use group-aware imputation strategies rather than global mean/mode imputation.',
    });
  } else {
    flags.push({
      metric: 'Missing Data Bias',
      severity: 'ok',
      value: missingDataBias,
      threshold: 0.05,
      message: `Missing data is minimal and evenly distributed (max ${(missingDataBias * 100).toFixed(1)}%).`,
      suggestion: 'Standard data validation is sufficient.',
    });
  }

  // ── Step 6: Compute overall Fairness Score (0–100) ────────────────────────
  // Start at 100, deduct points per failing metric
  let score = 100;

  if (disparateImpact < 0.8) score -= disparateImpact < 0.5 ? 30 : 15;
  if (statisticalParityDiff > 0.1)
    score -= statisticalParityDiff > 0.2 ? 25 : 12;
  if (classImbalance > 0.15) score -= classImbalance > 0.3 ? 15 : 8;
  if (demographicParity > 0.05) score -= demographicParity > 0.15 ? 20 : 10;
  if (missingDataBias > 0.05) score -= missingDataBias > 0.2 ? 10 : 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    fairnessScore: score,
    metrics: {
      demographicParity,
      disparateImpact,
      statisticalParityDiff: +statisticalParityDiff.toFixed(4),
      classImbalance,
      missingDataBias,
    },
    groupStats,
    flags,
    columnMissingRates,
  };
}

module.exports = { analyzeDataset };
