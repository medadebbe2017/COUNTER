const TAX_RATE = 0.08875;
const CARD_SURCHARGE_RATE = 0.04;

const CATEGORIES = [
  { name: "Deli Food", taxable: false },
  { name: "Detergent", taxable: true },
  { name: "Grocery Food", taxable: false },
  { name: "Beverages", taxable: false },
  { name: "Other (Taxable)", taxable: true },
  { name: "Other (Non-Taxable)", taxable: false },
];

const PAY_METHODS = ["Cash", "Card"];
const ORDER_TYPES = ["Pickup", "Delivery"];

let selectedCat = null;
let selectedPay = null;
let selectedOrderType = "Pickup";
let items = [];

const catGrid = document.getElementById('catGrid');
const payGrid = document.getElementById('payGrid');
const orderTypeGrid = document.getElementById('orderTypeGrid');
const deliveryFields = document.getElementById('deliveryFields');
const nameInput = document.getElementById('nameInput');
const instructionsInput = document.getElementById('instructionsInput');
const priceInput = document.getElementById('priceInput');
const qtyInput = document.getElementById('qtyInput');
const customerNameInput = document.getElementById('customerNameInput');
const customerPhoneInput = document.getElementById('customerPhoneInput');
const podToggle = document.getElementById('podToggle');
const addressStreetInput = document.getElementById('addressStreetInput');
const addressAptInput = document.getElementById('addressAptInput');
const addressCityInput = document.getElementById('addressCityInput');
const addressStateInput = document.getElementById('addressStateInput');
const addressZipInput = document.getElementById('addressZipInput');
const receiptCustomer = document.getElementById('receiptCustomer');
const receiptAddress = document.getElementById('receiptAddress');
const receiptCustomerBlock = document.getElementById('receiptCustomerBlock');
const businessToggle = document.getElementById('businessToggle');
const businessToggleArrow = document.getElementById('businessToggleArrow');
const businessFields = document.getElementById('businessFields');
const businessNameInput = document.getElementById('businessNameInput');
const businessStreetInput = document.getElementById('businessStreetInput');
const businessCityInput = document.getElementById('businessCityInput');
const businessStateInput = document.getElementById('businessStateInput');
const businessZipInput = document.getElementById('businessZipInput');
const businessPhoneInput = document.getElementById('businessPhoneInput');
const receiptBusinessName = document.getElementById('receiptBusinessName');
const receiptBusinessAddress = document.getElementById('receiptBusinessAddress');
const receiptBusinessPhone = document.getElementById('receiptBusinessPhone');
const addBtn = document.getElementById('addBtn');
const receiptBody = document.getElementById('receiptBody');
const clearBtn = document.getElementById('clearBtn');
const emailBtn = document.getElementById('emailBtn');
const textBtn = document.getElementById('textBtn');
const receiptDate = document.getElementById('receiptDate');

function fmt(n) {
  return n.toFixed(2);
}

function updateAddBtn() {
  const price = parseFloat(priceInput.value);
  addBtn.disabled = !(price > 0 && selectedCat !== null && selectedPay !== null);
}

function buildCategoryButtons() {
  CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement('button');
    const isCatchall = cat.name.startsWith('Other');
    btn.className = `cat-btn ${cat.taxable ? 'taxable' : 'exempt'} ${isCatchall ? 'catchall' : ''}`;
    btn.innerHTML = `${cat.name}<span class="tag">${cat.taxable ? 'Taxable' : 'Exempt'}</span>`;
    btn.addEventListener('click', () => {
      selectedCat = i;
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      updateAddBtn();
    });
    catGrid.appendChild(btn);
  });
}

function buildPaymentButtons() {
  PAY_METHODS.forEach((method) => {
    const btn = document.createElement('button');
    btn.className = 'pay-btn';
    btn.textContent = method;
    btn.addEventListener('click', () => {
      selectedPay = method;
      payGrid.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      updateAddBtn();
    });
    payGrid.appendChild(btn);
  });
}

function buildOrderTypeButtons() {
  ORDER_TYPES.forEach((type) => {
    const btn = document.createElement('button');
    btn.className = 'pay-btn';
    btn.textContent = type;
    if (type === selectedOrderType) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      selectedOrderType = type;
      orderTypeGrid.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      deliveryFields.classList.toggle('visible', type === 'Delivery');
      updateReceiptAddress();
    });
    orderTypeGrid.appendChild(btn);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildReceiptLine(item, idx) {
  const line = document.createElement('div');
  line.className = 'receipt-line';
  line.style.setProperty('--delay', `${idx * 0.03}s`);

  line.innerHTML = `
    <div class="name-col">
      <span>${escapeHtml(item.name)}</span>
      ${item.instructions ? `<div class="instructions">${escapeHtml(item.instructions)}</div>` : ''}
      ${item.taxable ? '<small>Taxable</small>' : ''}
    </div>
    <span class="qty-col">${item.qty}</span>
    <span class="price-col">$${fmt(item.price)}</span>
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

function render() {
  receiptBody.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'receipt-empty';
    empty.textContent = 'No items yet — add one to start the order.';
    receiptBody.appendChild(empty);
    return;
  }

  receiptBody.appendChild(buildColumnHeader());

  let subtotal = 0, taxTotal = 0, surchargeTotal = 0, cashTotal = 0, cardTotal = 0, anyPending = false;

  items.forEach((item, idx) => {
    subtotal += item.price;
    taxTotal += item.tax;
    surchargeTotal += item.surcharge;
    if (item.pending) anyPending = true;
    const lineTotal = item.price + item.tax + item.surcharge;
    if (item.pay === 'Cash') cashTotal += lineTotal; else cardTotal += lineTotal;
    receiptBody.appendChild(buildReceiptLine(item, idx));
  });

  const total = subtotal + taxTotal + surchargeTotal;
  receiptBody.appendChild(buildTotalsBlock(subtotal, taxTotal, surchargeTotal, total, cashTotal, cardTotal, anyPending));

  const thanks = document.createElement('div');
  thanks.className = 'receipt-thanks';
  thanks.textContent = 'Thank you for your order!';
  receiptBody.appendChild(thanks);
}

function updateReceiptCustomer() {
  const name = customerNameInput.value.trim();
  const phone = customerPhoneInput.value.trim();
  receiptCustomer.textContent = [name, phone].filter(Boolean).join(' — ');
  refreshReceiptCustomerBlock();
}

function buildAddressText() {
  if (selectedOrderType !== 'Delivery') return '';
  const street = addressStreetInput.value.trim();
  const apt = addressAptInput.value.trim();
  const city = addressCityInput.value.trim();
  const state = addressStateInput.value.trim();
  const zip = addressZipInput.value.trim();

  if (!street) return '';

  const line1 = apt ? `${street}, Apt ${apt}` : street;
  const line2 = [city, state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '');
  return `${line1} — ${line2}`;
}

function updateReceiptAddress() {
  receiptAddress.textContent = buildAddressText();
  refreshReceiptCustomerBlock();
}

function refreshReceiptCustomerBlock() {
  const hasContent = receiptCustomer.textContent.trim() || receiptAddress.textContent.trim();
  receiptCustomerBlock.classList.toggle('visible', Boolean(hasContent));
}

const BUSINESS_STORAGE_KEY = 'counter-business-info';

function updateReceiptBusinessInfo() {
  const name = businessNameInput.value.trim() || 'Your Business Name';
  const street = businessStreetInput.value.trim();
  const city = businessCityInput.value.trim();
  const state = businessStateInput.value.trim();
  const zip = businessZipInput.value.trim();
  const phone = businessPhoneInput.value.trim();

  receiptBusinessName.textContent = name;

  const addressLine = [street, [city, state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '')]
    .filter(Boolean)
    .join(', ');
  receiptBusinessAddress.textContent = addressLine;

  receiptBusinessPhone.textContent = phone ? `Phone: ${phone}` : '';
}

function saveBusinessInfo() {
  const data = {
    name: businessNameInput.value,
    street: businessStreetInput.value,
    city: businessCityInput.value,
    state: businessStateInput.value,
    zip: businessZipInput.value,
    phone: businessPhoneInput.value,
  };
  try {
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage unavailable — fail silently, form still works this session
  }
  updateReceiptBusinessInfo();
}

function loadBusinessInfo() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(BUSINESS_STORAGE_KEY));
  } catch (e) {
    saved = null;
  }
  if (saved) {
    businessNameInput.value = saved.name || '';
    businessStreetInput.value = saved.street || '';
    businessCityInput.value = saved.city || '';
    businessStateInput.value = saved.state || '';
    businessZipInput.value = saved.zip || '';
    businessPhoneInput.value = saved.phone || '';
  }
  updateReceiptBusinessInfo();
}

function addItem() {
  const unitPrice = parseFloat(priceInput.value);
  const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
  const price = unitPrice * qty;
  const cat = CATEGORIES[selectedCat];
  const tax = cat.taxable ? price * TAX_RATE : 0;
  const surcharge = selectedPay === 'Card' ? (price + tax) * CARD_SURCHARGE_RATE : 0;
  const customName = nameInput.value.trim();
  const itemName = customName ? customName : cat.name;
  const instructions = instructionsInput.value.trim();
  const pending = podToggle.checked;

  items.push({ name: itemName, price, tax, taxable: cat.taxable, pay: selectedPay, surcharge, pending, qty, instructions });
  updateReceiptCustomer();
  updateReceiptAddress();
  render();

  nameInput.value = '';
  instructionsInput.value = '';
  priceInput.value = '';
  qtyInput.value = '';
  selectedCat = null;
  selectedPay = null;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('selected'));
  updateAddBtn();
  priceInput.focus();
}

function clearOrder() {
  if (items.length > 0) {
    const confirmed = window.confirm('Clear this order? This can\'t be undone.');
    if (!confirmed) return;
  }

  items = [];
  customerNameInput.value = '';
  customerPhoneInput.value = '';
  podToggle.checked = false;
  selectedOrderType = 'Pickup';
  orderTypeGrid.querySelectorAll('.pay-btn').forEach((b, i) => b.classList.toggle('selected', ORDER_TYPES[i] === 'Pickup'));
  deliveryFields.classList.remove('visible');
  addressStreetInput.value = '';
  addressAptInput.value = '';
  addressCityInput.value = '';
  addressStateInput.value = '';
  addressZipInput.value = '';
  receiptCustomer.textContent = '';
  receiptAddress.textContent = '';
  receiptCustomerBlock.classList.remove('visible');
  render();
}

function buildReceiptLink() {
  const payload = {
    business: {
      name: businessNameInput.value.trim() || 'Your Business Name',
      address: [businessStreetInput.value.trim(), [businessCityInput.value.trim(), businessStateInput.value.trim()].filter(Boolean).join(', ') + (businessZipInput.value.trim() ? ` ${businessZipInput.value.trim()}` : '')].filter(Boolean).join(', '),
      phone: businessPhoneInput.value.trim(),
    },
    date: receiptDate.textContent,
    customer: [customerNameInput.value.trim(), customerPhoneInput.value.trim()].filter(Boolean).join(' — '),
    address: buildAddressText(),
    items: items.map(item => ({
      n: item.name,
      p: item.price,
      t: item.tax,
      s: item.surcharge,
      pay: item.pay,
      pend: item.pending,
      q: item.qty,
      tx: item.taxable,
      i: item.instructions,
    })),
  };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const base = window.location.href.replace(/index\.html.*$/, '').replace(/\/$/, '');
  return `${base}/receipt.html#d=${encoded}`;
}

function emailReceipt() {
  if (items.length === 0) return;
  const subject = encodeURIComponent('Your receipt from Rivington Deli');
  const link = buildReceiptLink();
  const body = encodeURIComponent(`Your receipt is ready! ${link}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function textReceipt() {
  if (items.length === 0) return;
  const link = buildReceiptLink();
  const body = encodeURIComponent(`Your receipt is ready! ${link}`);
  window.location.href = `sms:?&body=${body}`;
}

function init() {
  receiptDate.textContent = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  buildCategoryButtons();
  buildPaymentButtons();
  buildOrderTypeButtons();

  loadBusinessInfo();

  businessToggle.addEventListener('click', () => {
    const isOpen = businessFields.classList.toggle('visible');
    businessToggleArrow.classList.toggle('open', isOpen);
  });

  [businessNameInput, businessStreetInput, businessCityInput, businessStateInput, businessZipInput, businessPhoneInput]
    .forEach(input => input.addEventListener('input', saveBusinessInfo));

  priceInput.addEventListener('input', updateAddBtn);
  priceInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !addBtn.disabled) addItem();
  });

  addBtn.addEventListener('click', addItem);
  clearBtn.addEventListener('click', clearOrder);
  emailBtn.addEventListener('click', emailReceipt);
  textBtn.addEventListener('click', textReceipt);
}

init();
