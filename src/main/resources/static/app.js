const API = "/api";
const $ = id => document.getElementById(id);
let cart = [];

// ---------- helpers ----------
function msg(text, ok = true) {
  const m = $("msg");
  m.textContent = text;
  m.className = ok ? "ok" : "err";
  m.style.display = "block";
  setTimeout(() => (m.style.display = "none"), 5000);
}

async function api(url, method = "GET", body = null) {
  const res = await fetch(API + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function run(fn, okText) {
  try { await fn(); if (okText) msg(okText); }
  catch (e) { msg(e.message, false); }
}

const val = id => $(id).value.trim();
const rows = (list, f) => list.map(x => "<tr>" + f(x) + "</tr>").join("");
const td = (...c) => c.map(x => `<td>${x ?? ""}</td>`).join("");
function showMasterTab(tabId) {
    document.querySelectorAll(".master-tab").forEach(tab => {
        tab.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");
}
function tab(name) {
  ["masters", "orders", "pos", "invoices"].forEach(t =>
    ($(t).style.display = t === name ? "block" : "none"));
}

async function refreshAll() {
  await loadMasters();
  await loadOrders();
  await loadPOs();
  await loadInvoices();
}

// ---------- master data ----------
async function loadMasters() {
  const [c, p, m, b] = await Promise.all([
    api("/customers"), api("/products"), api("/materials"), api("/bom")]);
  $("custBody").innerHTML = rows(c, x => td(x.id, x.name, x.email, x.phone, x.address, `<button onclick="delCustomer(${x.id})">Delete</button>`));
  $("prodBody").innerHTML = rows(p, x => td(x.code, x.name, x.price));
  $("matBody").innerHTML = rows(m, x => td(x.code, x.name, x.unitCost, x.stock, x.supplier));
  $("bomBody").innerHTML = rows(b, x => td(x.product.name, x.material.name, x.qtyPerUnit));

  const opt = (list, textFn) =>
      `<option value="">Select</option>` +
      list.map(x => `<option value="${x.id}">${textFn(x)}</option>`).join("");

  $("bomProduct").innerHTML = opt(p, x => `${x.code} - ${x.name}`);
  $("bomMaterial").innerHTML = opt(m, x => `${x.code} - ${x.name}`);
  $("oProduct").innerHTML = opt(p, x => `${x.code} - ${x.name} (₹${x.price})`);
  $("oCustomer").innerHTML = opt(c, x => x.name);
}

function addCustomer() {
  run(async () => {
    await api("/customers", "POST", {
      name: val("cName"), email: val("cEmail"), phone: val("cPhone"), address: val("cAddr") });
    await loadMasters();
  }, "Customer added");
}

function delCustomer(id) {
  if (!confirm("Are you sure you want to delete this customer?")) return;
  run(async () => {
    await api(`/customers/${id}`, "DELETE");
    await loadMasters();
  }, "Customer deleted");
}

function addProduct() {
  run(async () => {
    await api("/products", "POST", {
      code: val("pCode"), name: val("pName"), price: Number(val("pPrice")) });
    await loadMasters();
  }, "Product added");
}

function addMaterial() {
  run(async () => {
    await api("/materials", "POST", {
      code: val("mCode"), name: val("mName"), unitCost: Number(val("mCost")),
      stock: Number(val("mStock") || 0), supplier: val("mSupp") });
    await loadMasters();
  }, "Material added");
}

function addBom() {
  run(async () => {
    await api("/bom", "POST", {
      productId: Number($("bomProduct").value),
      materialId: Number($("bomMaterial").value),
      qtyPerUnit: Number(val("bomQty")) });
    await loadMasters();
  }, "BOM line added");
}

// ---------- orders ----------
function addItem() {
  const pid = $("oProduct").value;
  const q = Number(val("oQty"));
  if (!pid || q <= 0) return msg("Select a product and enter quantity", false);
  cart.push({ productId: Number(pid), quantity: q, name: $("oProduct").selectedOptions[0].text });
  renderCart();
}

function renderCart() {
  $("cart").innerHTML = cart.map(i => `<li>${i.name} × ${i.quantity}</li>`).join("");
}

function placeOrder() {
  run(async () => {
    await api("/orders", "POST", {
      customerId: Number($("oCustomer").value),
      items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })) });
    cart = [];
    renderCart();
    await loadOrders();
  }, "Order placed");
}

function orderActions(o) {
  let b = `<button onclick="showBom(${o.id})">BOM</button>
           <button onclick="showItems(${o.id})">Items</button>`;
  if (o.status === "NEW")
    b += `<button onclick="act(${o.id},'purchase-orders')">Create POs</button>
          <button onclick="act(${o.id},'confirm')">Confirm</button>
          <button onclick="act(${o.id},'cancel')">Cancel</button>`;
  if (["CONFIRMED", "SHIPPED"].includes(o.status))
    b += `<button onclick="act(${o.id},'advance')">Next Stage</button>`;
  if (["CONFIRMED", "SHIPPED", "COMPLETED"].includes(o.status))
    b += `<button onclick="act(${o.id},'invoice')">Invoice</button>`;
  return b;
}

async function loadOrders() {
  const l = await api("/orders");
  $("ordBody").innerHTML = rows(l, o =>
    td(o.orderNo, o.customer.name, o.orderDate, `<b>${o.status}</b>`, o.total, orderActions(o)));
}

function act(id, what) {
  run(async () => {
    await api(`/orders/${id}/${what}`, "POST");
    await refreshAll();
  }, "Done: " + what);
}

function showBom(id) {
  run(async () => {
    const l = await api(`/orders/${id}/bom`);
    $("detail").innerHTML = "<h3>Bill of Materials</h3>" + (l.length
      ? `<table><tr><th>Material</th><th>Required</th><th>In stock</th><th>Shortage</th></tr>` +
        rows(l, r => td(r.code + " - " + r.name, r.required, r.inStock,
          r.shortage > 0 ? `<b style="color:red">${r.shortage}</b>` : "0")) + "</table>"
      : "<p>No BOM defined for the products in this order. Add BOM lines in Master Data.</p>");
  });
}

function showItems(id) {
  run(async () => {
    const l = await api(`/orders/${id}/items`);
    $("detail").innerHTML = "<h3>Order Items</h3><table><tr><th>Product</th><th>Qty</th><th>Unit Price</th></tr>" +
      rows(l, i => td(i.product.name, i.quantity, i.unitPrice)) + "</table>";
  });
}

// ---------- purchase orders ----------
async function loadPOs() {
  const l = await api("/purchase-orders");
  $("poBody").innerHTML = rows(l, p =>
    td(p.poNo, p.material.name, p.quantity, p.total, p.salesOrderId, `<b>${p.status}</b>`, p.createdDate,
      p.status === "ORDERED" ? `<button onclick="receivePo(${p.id})">Receive</button>` : ""));
}

function receivePo(id) {
  run(async () => {
    await api(`/purchase-orders/${id}/receive`, "POST");
    await refreshAll();
  }, "PO received, stock updated");
}

// ---------- invoices & payments ----------
async function loadInvoices() {
  const l = await api("/invoices");
  $("invBody").innerHTML = rows(l, i =>
    td(i.invoiceNo, i.salesOrder.orderNo, i.subtotal, i.tax, i.total, i.paid, `<b>${i.status}</b>`,
      (i.status !== "PAID" ? `<button onclick="pay(${i.id})">Pay</button>` : "") +
      `<button onclick="showPayments(${i.id})">Payments</button>`));
}

function pay(id) {
  const amount = prompt("Enter payment amount");
  if (!amount) return;
  const method = prompt("Method (CASH / UPI / CARD / BANK)", "UPI");
  run(async () => {
    await api(`/invoices/${id}/payments`, "POST", { amount: Number(amount), method });
    await loadInvoices();
  }, "Payment recorded");
}

function showPayments(id) {
  run(async () => {
    const l = await api(`/invoices/${id}/payments`);
    $("payBox").innerHTML = "<h3>Payments</h3>" + (l.length
      ? "<table><tr><th>Amount</th><th>Method</th><th>Date</th></tr>" +
        rows(l, p => td(p.amount, p.method, p.paidOn.replace("T", " ").substring(0, 19))) + "</table>"
      : "<p>No payments yet.</p>");
  });
}

// ---------- start ----------
run(refreshAll);