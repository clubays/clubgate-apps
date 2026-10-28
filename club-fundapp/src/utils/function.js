export function processFundRecords(fundRecords) {
  // 1️⃣ Sort by date ascending for calculation
  const sortedByDate = [...fundRecords].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // 2️⃣ Compute running total fund for each record
  let runningTotal = 0;
  const processedRecords = sortedByDate.map((record) => {
    const totalThisDate = record.entries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
    runningTotal += totalThisDate;
    return {
      ...record,
      totalFundUpto: runningTotal,
    };
  });

  // 3️⃣ Sort back to newest first (for display)
  const displayRecords = [...processedRecords].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // 4️⃣ Compute the final total fund
  const totalFund =
    processedRecords.length > 0
      ? processedRecords[processedRecords.length - 1].totalFundUpto
      : 0;

  return {
    processedRecords,
    displayRecords,
    totalFund,
  };
}
