import type { Booking } from '../types/booking';
import { calculateGrandTotal } from './salesCalculations';

export function generateSalesDocument(booking: Booking, vehicleName: string, variantName: string): string {
  const sale = booking.sale;
  if (!sale) return '';

  const grandTotal = calculateGrandTotal(booking);
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Sales Document - ${booking.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #dc2626;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #dc2626;
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      background: #dc2626;
      color: white;
      padding: 10px 15px;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }
    .info-item {
      padding: 10px;
      background: #f9f9f9;
      border-left: 3px solid #dc2626;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 3px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    .price-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .price-table td {
      padding: 10px;
      border-bottom: 1px solid #e5e5e5;
    }
    .price-table td:first-child {
      color: #666;
    }
    .price-table td:last-child {
      text-align: right;
      font-weight: 600;
    }
    .price-table .discount {
      color: #16a34a;
    }
    .price-table .total-row {
      background: #fef2f2;
      border-top: 2px solid #dc2626;
      border-bottom: 2px solid #dc2626;
    }
    .price-table .total-row td {
      font-size: 18px;
      font-weight: bold;
      color: #dc2626;
      padding: 15px 10px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 10px;
    }
    .status-finalized {
      background: #dcfce7;
      color: #166534;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .status-complete {
      background: #dbeafe;
      color: #1e40af;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e5e5;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .accessories-list {
      list-style: none;
      padding: 0;
    }
    .accessories-list li {
      padding: 8px;
      background: #f9f9f9;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 0; background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>SALES DOCUMENT</h1>
      <p>Booking ID: ${booking.id}</p>
      <p>Generated on: ${currentDate}</p>
      <span class="status-badge ${
        booking.paymentConfirmed ? 'status-complete' : 
        booking.status === 'Sales Finalized' ? 'status-finalized' : 
        'status-pending'
      }">
        ${booking.paymentConfirmed ? 'PAYMENT COMPLETE' : booking.status.toUpperCase()}
      </span>
    </div>

    <!-- Customer Information -->
    <div class="section">
      <div class="section-title">Customer Information</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Full Name</div>
          <div class="info-value">${booking.customer.fullName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Mobile Number</div>
          <div class="info-value">${booking.customer.mobile}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email Address</div>
          <div class="info-value">${booking.customer.email}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Emergency Contact</div>
          <div class="info-value">${booking.customer.emergencyContact}</div>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Address</div>
        <div class="info-value">${booking.customer.address}</div>
      </div>
    </div>

    <!-- Vehicle Information -->
    <div class="section">
      <div class="section-title">Vehicle Details</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Model</div>
          <div class="info-value">${vehicleName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Variant</div>
          <div class="info-value">${variantName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Color</div>
          <div class="info-value">${booking.vehicleConfig.colorName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Ex-Showroom Price</div>
          <div class="info-value">₹${booking.pricing.exShowroom.toLocaleString('en-IN')}</div>
        </div>
      </div>
    </div>

    <!-- Sales Information -->
    <div class="section">
      <div class="section-title">Sales Details</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Payment Method</div>
          <div class="info-value">${sale.soldThrough}</div>
        </div>
        ${sale.soldThrough === 'FINANCE' ? `
        <div class="info-item">
          <div class="info-label">Financer</div>
          <div class="info-value">${sale.financer || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Finance Executive</div>
          <div class="info-value">${sale.financeBy || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Hypothecation</div>
          <div class="info-value">${sale.hypothecationSelected} ${sale.hypothecationCharge > 0 ? `(₹${sale.hypothecationCharge})` : ''}</div>
        </div>
        ` : ''}
        <div class="info-item">
          <div class="info-label">Registration</div>
          <div class="info-value">${sale.registration}</div>
        </div>
        ${sale.otherState.selected ? `
        <div class="info-item">
          <div class="info-label">Registration State</div>
          <div class="info-value">${sale.otherState.selected} ${sale.otherState.amount > 0 ? `(+₹${sale.otherState.amount})` : ''}</div>
        </div>
        ` : ''}
        <div class="info-item">
          <div class="info-label">Insurance</div>
          <div class="info-value">${sale.insurance}</div>
        </div>
        ${sale.insurance === 'YES' ? `
        <div class="info-item">
          <div class="info-label">Insurance Type</div>
          <div class="info-value">${sale.insuranceType || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Nominee</div>
          <div class="info-value">${sale.insuranceNominee.name} (${sale.insuranceNominee.age} yrs, ${sale.insuranceNominee.relation})</div>
        </div>
        ` : ''}
        <div class="info-item">
          <div class="info-label">Sale Type</div>
          <div class="info-value">${sale.typeOfSale}</div>
        </div>
        ${sale.typeOfSale === 'EXCHANGE' && sale.exchange ? `
        <div class="info-item">
          <div class="info-label">Exchange Vehicle</div>
          <div class="info-value">${sale.exchange.model} (${sale.exchange.year})</div>
        </div>
        <div class="info-item">
          <div class="info-label">Exchange Value</div>
          <div class="info-value">₹${sale.exchange.value.toLocaleString('en-IN')}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Exchanger Name</div>
          <div class="info-value">${sale.exchange.exchangerName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Registration Number</div>
          <div class="info-value">${sale.exchange.registrationNumber}</div>
        </div>
        ` : ''}
        ${sale.isGstNumber === 'YES' ? `
        <div class="info-item">
          <div class="info-label">GST Number</div>
          <div class="info-value">${sale.gstNumber || 'N/A'}</div>
        </div>
        ` : ''}
      </div>
    </div>

    ${Object.keys(sale.selectedAccessoriesFinal).length > 0 ? `
    <!-- Accessories -->
    <div class="section">
      <div class="section-title">Selected Accessories</div>
      <ul class="accessories-list">
        ${Object.entries(sale.selectedAccessoriesFinal).map(([_, amount]) => `
          <li>
            <span>Accessory</span>
            <span>₹${amount.toLocaleString('en-IN')}</span>
          </li>
        `).join('')}
        <li style="background: #dc2626; color: white; font-weight: bold;">
          <span>Total Accessories</span>
          <span>₹${sale.accessoriesTotal.toLocaleString('en-IN')}</span>
        </li>
      </ul>
    </div>
    ` : ''}

    <!-- Price Breakdown -->
    <div class="section">
      <div class="section-title">Price Breakdown</div>
      <table class="price-table">
        <tr>
          <td>Ex-Showroom Price</td>
          <td>₹${booking.pricing.exShowroom.toLocaleString('en-IN')}</td>
        </tr>
        ${sale.registration === 'Yes' ? `
        <tr>
          <td>RTO Charges</td>
          <td>₹${booking.pricing.rtoTotal.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        ${sale.insurance === 'YES' ? `
        <tr>
          <td>Insurance</td>
          <td>₹${booking.pricing.insuranceTotal.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        ${sale.accessoriesTotal > 0 ? `
        <tr>
          <td>Accessories</td>
          <td>₹${sale.accessoriesTotal.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        ${sale.hypothecationCharge > 0 ? `
        <tr>
          <td>Hypothecation Charge</td>
          <td>₹${sale.hypothecationCharge.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        ${sale.otherState.amount > 0 ? `
        <tr>
          <td>Other State Charge</td>
          <td>₹${sale.otherState.amount.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        ${sale.jobClub === 'YES' ? `
        <tr>
          <td>Job Club Membership</td>
          <td>₹1,500</td>
        </tr>
        ` : ''}
        ${sale.otherCharges > 0 ? `
        <tr>
          <td>Other Charges</td>
          <td>₹${sale.otherCharges.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        ${sale.discount > 0 ? `
        <tr class="discount">
          <td>Regular Discount</td>
          <td>-₹${sale.discount.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        ${sale.specialDiscount > 0 ? `
        <tr class="discount">
          <td>Special Discount ${sale.specialDiscountApprovalStatus === 'PENDING' ? '(Pending Approval)' : sale.specialDiscountApprovalStatus === 'APPROVED' ? '(Approved)' : ''}</td>
          <td>-₹${sale.specialDiscount.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        ${sale.typeOfSale === 'EXCHANGE' && sale.exchange && sale.exchange.value > 0 ? `
        <tr class="discount">
          <td>Exchange Value</td>
          <td>-₹${sale.exchange.value.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td>GRAND TOTAL</td>
          <td>₹${grandTotal.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>

    <!-- Payment Status -->
    <div class="section">
      <div class="section-title">Payment Status</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Total Amount</div>
          <div class="info-value">₹${booking.pricing.onRoadPrice.toLocaleString('en-IN')}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Amount Paid</div>
          <div class="info-value" style="color: #16a34a;">₹${booking.bookingAmountPaid.toLocaleString('en-IN')}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Balance Due</div>
          <div class="info-value" style="color: #dc2626;">₹${booking.balanceDue.toLocaleString('en-IN')}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Payment Status</div>
          <div class="info-value">${booking.paymentConfirmed ? 'CONFIRMED ✓' : 'PENDING'}</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>This is a computer-generated document.</strong></p>
      <p>For any queries, please contact your sales representative.</p>
      <p style="margin-top: 10px;">Document generated on ${currentDate}</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

export function downloadSalesDocument(booking: Booking, vehicleName: string, variantName: string): void {
  const html = generateSalesDocument(booking, vehicleName, variantName);
  
  // Create a Blob from the HTML
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `Sales_Document_${booking.id}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
