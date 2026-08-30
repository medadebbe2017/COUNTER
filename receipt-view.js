function fmt(n) {
  return n.toFixed(2);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildReceiptLine(item) {
  const line = document.createElement('div');
  line.className = 'receipt-line';
  line.innerHTML = `
    <div class="name-col">
      <span>${escapeHtml(item.n)}</span>
      ${item.i ? `<div class="instructions">${escapeHtml(item.i)}</div>` : ''}
      ${item.tx ? '<small>Taxable</small>' : ''}
    </div>
    <span class="qty-col">${item.q}</span>
    <span class="price-col">$${fmt(item.p)}</span>
  `;
  return line;
}

function buildColumnHeader() {
  const head = document.createElement('div');
  head.className = 'receipt-columns-head';
  head.innerHTML = `
    <span>Description</span>
    <span class="qty-col">Qty</span>
    <span class="price-col">Price</span>
  `;
  return head;
}

function buildTotalsBlock(subtotal, taxTotal, surchargeTotal, total, cashTotal, cardTotal, anyPending) {
  const block = document.createElement('div');
  block.className = 'receipt-totals';

  const rows = [
    ['Subtotal', `$${fmt(subtotal)}`],
    ['Tax', `$${fmt(taxTotal)}`],
  ];
  if (surchargeTotal > 0) rows.push(['Card Surcharge', `$${fmt(surchargeTotal)}`]);

  let html = rows.map(([label, val]) => `<div class="row"><span>${label}</span><span>${val}</span></div>`).join('');
  html += `<div class="row grand"><span>Total</span><span>$${fmt(total)}</span></div>`;

  const paidLabel = anyPending ? 'To be paid via' : 'Paid via';

  if (cashTotal > 0 && cardTotal > 0) {
    html += `<div class="row row--spaced"><span>Cash</span><span>$${fmt(cashTotal)}</span></div>`;
    html += `<div class="row"><span>Card</span><span>$${fmt(cardTotal)}</span></div>`;
  } else {
    html += `<div class="row row--spaced"><span>${paidLabel}</span><span>${cardTotal > 0 ? 'Card' : 'Cash'}</span></div>`;
  }

  block.innerHTML = html;
  return block;
}

function renderReceipt() {
  const receiptBusinessName = document.getElementById('receiptBusinessName');
  const receiptBusinessAddress = document.getElementById('receiptBusinessAddress');
  const receiptBusinessPhone = document.getElementById('receiptBusinessPhone');
  const receiptDate = document.getElementById('receiptDate');
  const receiptCustomer = document.getElementById('receiptCustomer');
  const receiptAddress = document.getElementById('receiptAddress');
  const receiptCustomerBlock = document.getElementById('receiptCustomerBlock');
  const receiptCopyright = document.getElementById('receiptCopyright');
  const receiptBody = document.getElementById('receiptBody');

  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const dataParam = params.get('d');

  if (!dataParam) {
    receiptBody.innerHTML = '<div class="receipt-empty">No receipt data found in this link.</div>';
    return;
  }

  let payload;
  try {
    payload = JSON.parse(decodeURIComponent(dataParam));
  } catch (e) {
    receiptBody.innerHTML = '<div class="receipt-empty">This receipt link looks invalid.</div>';
    return;
  }

  if (!payload.items || payload.items.length === 0) {
    receiptBody.innerHTML = '<div class="receipt-empty">This receipt has no items.</div>';
    return;
  }

  const business = payload.business || {};
  receiptBusinessName.textContent = business.name || 'Receipt';
  receiptBusinessAddress.textContent = business.address || '';
  receiptBusinessPhone.textContent = business.phone ? `Phone: ${business.phone}` : '';
  receiptDate.textContent = payload.date || '';
  receiptCustomer.textContent = payload.customer || '';
  const businessNameSafe = (business.name || 'This Business').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  receiptCopyright.innerHTML = `© ${new Date().getFullYear()} <span class="footer-brand">${businessNameSafe}</span>. All rights reserved.`;
  receiptAddress.textContent = payload.address || '';
  receiptCustomerBlock.classList.toggle('visible', Boolean(payload.customer || payload.address));
  receiptBody.innerHTML = '';

  receiptBody.appendChild(buildColumnHeader());

  let subtotal = 0, taxTotal = 0, surchargeTotal = 0, cashTotal = 0, cardTotal = 0, anyPending = false;

  payload.items.forEach((item) => {
    subtotal += item.p;
    taxTotal += item.t;
    surchargeTotal += item.s;
    if (item.pend) anyPending = true;
    const lineTotal = item.p + item.t + item.s;
    if (item.pay === 'Cash') cashTotal += lineTotal; else cardTotal += lineTotal;
    receiptBody.appendChild(buildReceiptLine(item));
  });

  const total = subtotal + taxTotal + surchargeTotal;
  receiptBody.appendChild(buildTotalsBlock(subtotal, taxTotal, surchargeTotal, total, cashTotal, cardTotal, anyPending));

  const thanks = document.createElement('div');
  thanks.className = 'receipt-thanks';
  thanks.textContent = 'Thank you for your order!';
  receiptBody.appendChild(thanks);
}

renderReceipt();
