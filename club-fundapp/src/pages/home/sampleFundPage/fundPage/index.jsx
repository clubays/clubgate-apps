import { processFundRecords } from "@/utils/function";
import { Printer, QrCode, X } from "lucide-react";
import { useState } from "react";

const UPI_ID = "9002488997@upi";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const num = "font-mono tabular-nums text-right whitespace-nowrap";

export default function FundPage({ session, version, fundRecords }) {
  const { displayRecords, totalFund } = processFundRecords(fundRecords);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);

  const currentDate = formatDate(new Date());
  const tone = (n) => (n > 0 ? "text-emerald-700" : "text-rose-700");

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-stone-100 px-3 py-8 text-stone-800 antialiased sm:px-6 print:min-h-0 print:bg-white print:p-0">
      <main className="mx-auto w-full max-w-2xl border border-stone-300 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] [-webkit-print-color-adjust:exact] [print-color-adjust:exact] print:max-w-none print:border-0 print:shadow-none">
        {/* Statement header */}
        <header className="flex items-start justify-between gap-4 border-b border-stone-300 px-5 py-4">
          <div>
            <h1 className="text-sm font-semibold text-stone-900">
              LAC Fund | {session}
            </h1>
            <p className="mt-0.5 text-[11px] text-stone-500">
              Statement of account · v {version}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <button
              onClick={handlePrint}
              aria-label="Print statement"
              className="flex h-7 w-7 shrink-0 items-center justify-center border border-stone-300 text-stone-500 transition hover:bg-stone-50 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 print:hidden"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
            <div className="text-right">
              <p className="text-[11px] text-stone-500">Statement date</p>
              <p className="font-mono text-[11px] text-stone-800">
                {currentDate}
              </p>
            </div>
          </div>
        </header>

        {/* Account summary */}
        <section className="grid grid-cols-2 border-b border-stone-300 text-[11px]">
          <div className="border-r border-stone-200 px-5 py-3">
            <p className="text-stone-500">Closing balance</p>
            <p
              className={`mt-0.5 font-mono text-xl font-semibold tabular-nums ${tone(
                totalFund,
              )}`}
            >
              ₹{totalFund}/-
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 px-5 py-3">
            <div className="min-w-0">
              <p className="text-stone-500">Pay to</p>
              <p className="mt-0.5 truncate font-mono text-xs text-stone-800">
                {UPI_ID}
              </p>
              <p className="text-stone-400">Gobinda Chandra</p>
            </div>
            <button
              onClick={() => setIsQRCodeOpen(true)}
              aria-label="Show UPI QR code"
              className="flex h-7 w-7 shrink-0 items-center justify-center border border-stone-300 text-stone-500 transition hover:bg-stone-50 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 print:hidden"
            >
              <QrCode className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* Ledger */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-136 border-collapse text-[11px] print:min-w-0">
            <thead className="print:table-header-group">
              <tr className="border-b-2 border-stone-800 bg-stone-50 text-stone-600">
                <th className="w-21 px-3 py-2 pl-5 text-left font-medium">
                  Date
                </th>
                <th className="px-3 py-2 text-left font-medium">Particulars</th>
                <th className="w-19 px-3 py-2 text-right font-medium">
                  Credit
                </th>
                <th className="w-19 px-3 py-2 text-right font-medium">Debit</th>
                <th className="w-23 px-3 py-2 pr-5 text-right font-medium">
                  Balance
                </th>
              </tr>
            </thead>

            {displayRecords.map((record) => (
              <tbody
                key={record.date}
                className="border-b border-stone-300 align-top print:break-inside-avoid"
              >
                {record.entries.map((entry, i) => {
                  const isLast = i === record.entries.length - 1;
                  const isCredit = entry.amount >= 0;
                  return (
                    <tr
                      key={i}
                      className="border-t border-dotted border-stone-200 first:border-t-0 hover:bg-stone-50/70"
                    >
                      <td className="whitespace-nowrap px-3 py-1.5 pl-5 font-mono text-stone-500">
                        {i === 0 ? formatDate(record.date) : ""}
                      </td>
                      <td className="px-3 py-1.5 text-stone-800">
                        {entry.title}
                      </td>
                      <td className={`px-3 py-1.5 text-emerald-700 ${num}`}>
                        {isCredit ? `₹${entry.amount}` : ""}
                      </td>
                      <td className={`px-3 py-1.5 text-rose-700 ${num}`}>
                        {!isCredit ? `₹${Math.abs(entry.amount)}` : ""}
                      </td>
                      <td
                        className={`px-3 py-1.5 pr-5 font-medium ${num} ${
                          isLast ? tone(record.totalFundUpto) : ""
                        }`}
                      >
                        {isLast ? `₹${record.totalFundUpto}` : ""}
                      </td>
                    </tr>
                  );
                })}

                {/* Notes */}
                {record.notes && (
                  <tr className="bg-stone-50/60">
                    <td />
                    <td
                      colSpan={4}
                      className="px-3 pb-2 pr-5 pt-1 text-stone-500"
                    >
                      <p className="font-medium text-stone-600">
                        {record.notes.title}
                      </p>
                      {typeof record.notes.description === "string" ? (
                        <p className="mt-0.5 leading-relaxed">
                          {record.notes.description}
                        </p>
                      ) : Array.isArray(record.notes.description) ? (
                        <ul className="mt-0.5 max-w-xs space-y-0.5">
                          {record.notes.description.map((d, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between gap-4"
                            >
                              <span>{d.name}</span>
                              <span className="font-mono tabular-nums">
                                ₹{d.amount}/-
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : typeof record.notes.description === "object" ? (
                        <pre className="mt-1 overflow-x-auto border border-stone-200 bg-white p-2 font-mono text-[10px]">
                          {JSON.stringify(record.notes.description, null, 2)}
                        </pre>
                      ) : null}
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </table>
        </div>

        <footer className="px-5 py-3 text-center text-[10px] text-stone-400">
          End of statement
        </footer>
      </main>

      {/* QR dialog */}
      {isQRCodeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm print:hidden"
          onClick={() => setIsQRCodeOpen(false)}
        >
          <div
            role="dialog"
            aria-label="UPI QR code"
            className="relative flex w-72 flex-col items-center border border-stone-300 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsQRCodeOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 text-stone-400 transition hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-xs font-medium text-stone-700">Pay via UPI</p>
            <img
              src="https://asset-ark.clubays.com/blank/qr.png"
              alt="UPI QR Code"
              className="mt-3 h-52 w-52 border border-stone-200"
            />
            <p className="mt-3 font-mono text-[11px] text-stone-500">
              {UPI_ID}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
