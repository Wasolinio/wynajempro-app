import React, { useMemo, useState } from 'react';
import { Copy, CheckCircle, Landmark, Percent, TrendingUp, AlertTriangle, ChevronDown, Receipt, Download } from 'lucide-react';
import { calculateMonthlyTaxes } from '../../../utils/taxCalculator';
import { generateAccountingReportCSV } from '../../../utils/accountingExport';
import { monthNames } from '../../../utils/constants';
import toast from 'react-hot-toast';

export default function TaxSummaryPanelV4({ year, rentals, taxSettings, hostProfile }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [copiedField, setCopiedField] = useState(null);

  const tax = useMemo(() => {
    return calculateMonthlyTaxes(rentals, taxSettings, hostProfile, selectedMonth, Number(year));
  }, [rentals, taxSettings, hostProfile, selectedMonth, year]);

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success('Skopiowano do schowka');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Nie udało się skopiować');
    }
  };

  const isRyczalt = taxSettings?.taxForm === 'lump_sum';
  const formLabel = isRyczalt ? 'Ryczałt' : taxSettings?.taxForm === 'general' ? 'Skala podatkowa' : 'Dział. nierejestrowana';

  const handleDownloadCSV = () => {
    generateAccountingReportCSV(rentals, taxSettings, hostProfile, selectedMonth, year);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '12px', background: '#F6F1E3', borderRadius: '4px', border: '1px solid #EFE9DA' }}>
            <Landmark className="w-6 h-6" style={{ color: '#3D382E' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#17150F', margin: 0 }}>Podsumowanie Podatkowe</h3>
            <p className="mono" style={{ fontSize: '10px', color: '#9A917D', textTransform: 'uppercase', letterSpacing: '.05em', margin: '4px 0 0 0' }}>{formLabel} · {year}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="mono"
              style={{
                appearance: 'none',
                padding: '10px 36px 10px 16px',
                background: '#FBFAF6',
                border: '1px solid #DDD5C3',
                borderRadius: '4px',
                color: '#17150F',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {monthNames.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9A917D', pointerEvents: 'none' }} />
          </div>
          
          <button 
            onClick={handleDownloadCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', background: '#FBFAF6', color: '#3D382E',
              border: '1px solid #DDD5C3', borderRadius: '4px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500
            }}
          >
            <Download className="w-4 h-4" />
            <span>Raport Księgowy</span>
          </button>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <MiniStat label="Przychód brutto" value={tax.monthlyGrossIncome} />
        <MiniStat label="Przychód netto" value={tax.monthlyNetIncome} />
        <MiniStat label="Prowizje portali" value={tax.monthlyCommissions} />
        <MiniStat label="Koszty ekspl." value={tax.monthlyExpenses} />
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* PIT */}
        <div style={{ background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #EFE9DA', background: '#F6F1E3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: '#E0D8C6', borderRadius: '4px', color: '#3D382E' }}>
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#17150F', margin: 0 }}>Podatek Dochodowy</h4>
                  <p className="mono" style={{ fontSize: '10px', color: '#9A917D', textTransform: 'uppercase', letterSpacing: '.05em', margin: '4px 0 0 0' }}>{formLabel}</p>
                </div>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 600, color: '#17150F', margin: 0 }}>
                {tax.incomeTax.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} <span style={{ fontSize: '14px' }}>zł</span>
              </p>
            </div>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CopyableField
              label="Tytuł przelewu"
              value={tax.incomeTaxTitle}
              fieldName="incomeTaxTitle"
              copiedField={copiedField}
              onCopy={copyToClipboard}
            />
            {tax.microAccount ? (
              tax.microAccount.startsWith('BŁĄD') ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#F6F1E3', border: '1px solid #EFE9DA', borderRadius: '4px', color: '#D9492B', fontSize: '12px', fontWeight: 500 }}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{tax.microAccount}</span>
                </div>
              ) : (
                <CopyableField
                  label="Nr Mikrorachunku Podatkowego"
                  value={formatAccountNumber(tax.microAccount)}
                  rawValue={tax.microAccount}
                  fieldName="microAccount"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              )
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#F6F1E3', border: '1px solid #EFE9DA', borderRadius: '4px', color: '#9A917D', fontSize: '12px', fontWeight: 500 }}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Uzupełnij NIP lub PESEL w ustawieniach.</span>
              </div>
            )}
          </div>
        </div>

        {/* VAT-UE */}
        <div style={{ background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #EFE9DA', background: '#F6F1E3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: '#E0D8C6', borderRadius: '4px', color: '#3D382E' }}>
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#17150F', margin: 0 }}>VAT-UE (Import Usług)</h4>
                  <p className="mono" style={{ fontSize: '10px', color: '#9A917D', textTransform: 'uppercase', letterSpacing: '.05em', margin: '4px 0 0 0' }}>23% od prowizji portali</p>
                </div>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 600, color: '#17150F', margin: 0 }}>
                {tax.vatUE.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} <span style={{ fontSize: '14px' }}>zł</span>
              </p>
            </div>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CopyableField
              label="Tytuł przelewu"
              value={tax.vatUETitle}
              fieldName="vatUETitle"
              copiedField={copiedField}
              onCopy={copyToClipboard}
            />
            {tax.microAccount ? (
              tax.microAccount.startsWith('BŁĄD') ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#F6F1E3', border: '1px solid #EFE9DA', borderRadius: '4px', color: '#D9492B', fontSize: '12px', fontWeight: 500 }}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{tax.microAccount}</span>
                </div>
              ) : (
                <CopyableField
                  label="Nr Mikrorachunku Podatkowego"
                  value={formatAccountNumber(tax.microAccount)}
                  rawValue={tax.microAccount}
                  fieldName="microAccountVat"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              )
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#F6F1E3', border: '1px solid #EFE9DA', borderRadius: '4px', color: '#9A917D', fontSize: '12px', fontWeight: 500 }}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Uzupełnij NIP lub PESEL w ustawieniach.</span>
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#524C3F', background: '#FBFAF6', padding: '12px', borderRadius: '4px', border: '1px solid #EFE9DA' }}>
              Suma prowizji: <span style={{ fontWeight: 600, color: '#17150F' }}>{tax.monthlyCommissions.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span> × 23% = <span style={{ fontWeight: 600, color: '#17150F' }}>{tax.vatUE.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span>
            </div>
          </div>
        </div>
      </div>

      {/* 100k Threshold */}
      {isRyczalt && taxSettings.autoThreshold && (
        <div style={{ background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: '#F6F1E3', borderRadius: '4px', color: '#3D382E' }}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#17150F', margin: 0 }}>Próg Ryczałtu 100 000 zł</h4>
                <p className="mono" style={{ fontSize: '10px', color: '#9A917D', textTransform: 'uppercase', letterSpacing: '.05em', margin: '4px 0 0 0' }}>Przychód narastająco w {year}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#17150F', margin: 0 }}>
                {tax.ytdGrossIncome.toLocaleString('pl-PL')} <span style={{ fontSize: '12px', color: '#9A917D' }}>zł</span>
              </p>
              <p className="mono" style={{ fontSize: '10px', color: '#9A917D', margin: '4px 0 0 0' }}>
                {tax.thresholdProgress < 100
                  ? `Brakuje ${tax.thresholdRemaining.toLocaleString('pl-PL')} zł`
                  : 'Próg przekroczony!'}
              </p>
            </div>
          </div>
          <div style={{ position: 'relative', height: '8px', background: '#E0D8C6', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: '4px',
                background: tax.thresholdProgress >= 100 ? '#D9492B' : '#17150F',
                width: `${Math.min(100, tax.thresholdProgress)}%`,
                transition: 'width 0.7s ease-out'
              }}
            />
          </div>
          {tax.thresholdProgress >= 100 && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9492B', background: '#FBFAF6', padding: '12px', borderRadius: '4px', border: '1px solid #EFE9DA', fontWeight: 500 }}>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Przychód w {year} roku przekroczył próg 100 000 zł. Nadwyżka opodatkowana jest stawką 12.5%.
            </div>
          )}
        </div>
      )}

      {/* Total summary */}
      <div style={{ background: '#3D382E', borderRadius: '4px', padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <p className="mono" style={{ fontSize: '10px', fontWeight: 600, color: '#E0D8C6', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 4px 0' }}>
            Łączne zobowiązanie w {monthNames[selectedMonth]}
          </p>
          <p style={{ fontSize: '32px', fontWeight: 600, color: '#FBFAF6', margin: 0 }}>
            {(tax.incomeTax + tax.vatUE).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} <span style={{ fontSize: '16px', color: '#A0987F' }}>zł</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <p className="mono" style={{ fontSize: '10px', fontWeight: 600, color: '#A0987F', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 4px 0' }}>PIT</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FBFAF6', margin: 0 }}>{tax.incomeTax.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
          </div>
          <div>
            <p className="mono" style={{ fontSize: '10px', fontWeight: 600, color: '#A0987F', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 4px 0' }}>VAT-UE</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FBFAF6', margin: 0 }}>{tax.vatUE.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ padding: '16px', background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px' }}>
      <p className="mono" style={{ fontSize: '9px', fontWeight: 600, color: '#9A917D', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 8px 0' }}>{label}</p>
      <p style={{ fontSize: '18px', fontWeight: 600, color: '#17150F', margin: 0 }}>
        {value.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} <span style={{ fontSize: '11px', color: '#9A917D' }}>zł</span>
      </p>
    </div>
  );
}

function CopyableField({ label, value, rawValue, fieldName, copiedField, onCopy }) {
  const isCopied = copiedField === fieldName;

  return (
    <div>
      <p className="mono" style={{ fontSize: '10px', fontWeight: 600, color: '#9A917D', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 6px 0' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="mono" style={{ flex: 1, background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#17150F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </div>
        <button
          onClick={() => onCopy(rawValue || value, fieldName)}
          style={{
            padding: '10px',
            background: isCopied ? '#F6F1E3' : '#FBFAF6',
            border: `1px solid ${isCopied ? '#E0D8C6' : '#DDD5C3'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            color: isCopied ? '#17150F' : '#524C3F'
          }}
        >
          {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function formatAccountNumber(raw) {
  if (!raw || raw.length < 26) return raw || '';
  return raw.replace(/(.{2})(.{4})(.{4})(.{4})(.{4})(.{4})(.{4})/, '$1 $2 $3 $4 $5 $6 $7');
}
