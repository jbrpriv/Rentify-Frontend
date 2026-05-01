export const STATIC_AGREEMENT_TEMPLATES = [
  {
    id: 'residential-standard',
    name: 'Residential Standard Lease',
    description: 'Balanced layout for annual residential tenancy with payment schedule table.',
    bodyHtml: `
      <h1 style="text-align: center;">Residential Rental Agreement</h1>
      <p>This Rental Agreement is made between <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> and <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span>.</p>
      <p>The property located at <span data-type="variable" data-name="property_address" data-label="Full Address" data-category="property">Full Address</span> is leased for <span data-type="variable" data-name="duration_months" data-label="Duration (months)" data-category="dates">Duration (months)</span> months, starting <span data-type="variable" data-name="start_date" data-label="Lease Start Date" data-category="dates">Lease Start Date</span>.</p>
      <table class="agreement-table">
        <tbody>
          <tr>
            <th><p style="text-align: center;">Payment Item</p></th>
            <th><p style="text-align: center;">Amount</p></th>
            <th><p style="text-align: center;">Notes</p></th>
          </tr>
          <tr>
            <td><p>Monthly Rent</p></td>
            <td><p><span data-type="variable" data-name="rent_amount" data-label="Monthly Rent" data-category="financials">Monthly Rent</span></p></td>
            <td><p>Due on day 1 of each month</p></td>
          </tr>
          <tr>
            <td><p>Security Deposit</p></td>
            <td><p><span data-type="variable" data-name="security_deposit" data-label="Security Deposit" data-category="financials">Security Deposit</span></p></td>
            <td><p>Refundable as per terms</p></td>
          </tr>
        </tbody>
      </table>
      <div data-type="clauses-placeholder"></div>
      <p>Signed on <span data-type="variable" data-name="current_date" data-label="Current Date" data-category="dates">Current Date</span>.</p>
    `,
  },
  {
    id: 'furnished-lease',
    name: 'Furnished Apartment Lease',
    description: 'Includes inventory and utilities structure for furnished unit handover.',
    bodyHtml: `
      <h1>Furnished Apartment Agreement</h1>
      <p>This agreement is entered into by <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> for unit <span data-type="variable" data-name="property_title" data-label="Property Title" data-category="property">Property Title</span>.</p>
      <div data-type="dual-column" class="dual-column-wrapper group relative">
        <div data-type="dual-column-side" class="dual-column-side p-4 min-h-[100px] outline-none relative">
          <h2>Tenant Details</h2>
          <p>Name: <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span></p>
          <p>Lease Start: <span data-type="variable" data-name="start_date" data-label="Lease Start Date" data-category="dates">Lease Start Date</span></p>
        </div>
        <div data-type="dual-column-side" class="dual-column-side p-4 min-h-[100px] outline-none relative">
          <h2>Financials</h2>
          <p>Rent: <span data-type="variable" data-name="rent_amount" data-label="Monthly Rent" data-category="financials">Monthly Rent</span></p>
          <p>Deposit: <span data-type="variable" data-name="security_deposit" data-label="Security Deposit" data-category="financials">Security Deposit</span></p>
        </div>
      </div>
      <table class="agreement-table">
        <tbody>
          <tr>
            <th><p style="text-align: center;">Inventory Item</p></th>
            <th><p style="text-align: center;">Condition</p></th>
          </tr>
          <tr>
            <td><p>Bedroom Furniture</p></td>
            <td><p>Good</p></td>
          </tr>
          <tr>
            <td><p>Kitchen Appliances</p></td>
            <td><p>Functional</p></td>
          </tr>
        </tbody>
      </table>
      <p>Utilities Included: <span data-type="variable" data-name="utilities_details" data-label="Utilities Details" data-category="policies">Utilities Details</span>.</p>
    `,
  },
  {
    id: 'commercial-office',
    name: 'Commercial Office Lease',
    description: 'Professional contract layout with fee matrix and policy markers.',
    bodyHtml: `
      <h1 style="text-align: center;">Commercial Office Lease Agreement</h1>
      <p>Between <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> and <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span> for commercial use at <span data-type="variable" data-name="property_address" data-label="Full Address" data-category="property">Full Address</span>.</p>
      <h2>Charges Matrix</h2>
      <table class="agreement-table">
        <tbody>
          <tr>
            <th><p style="text-align: center;">Charge Type</p></th>
            <th><p style="text-align: center;">Value</p></th>
            <th><p style="text-align: center;">Billing Frequency</p></th>
          </tr>
          <tr>
            <td><p>Base Rent</p></td>
            <td><p><span data-type="variable" data-name="rent_amount" data-label="Monthly Rent" data-category="financials">Monthly Rent</span></p></td>
            <td><p>Monthly</p></td>
          </tr>
          <tr>
            <td><p>Maintenance Fee</p></td>
            <td><p><span data-type="variable" data-name="maintenance_fee" data-label="Maintenance Fee" data-category="financials">Maintenance Fee</span></p></td>
            <td><p>Monthly</p></td>
          </tr>
          <tr>
            <td><p>Late Fee</p></td>
            <td><p><span data-type="variable" data-name="late_fee" data-label="Late Payment Fee" data-category="financials">Late Payment Fee</span></p></td>
            <td><p>As applicable</p></td>
          </tr>
        </tbody>
      </table>
      <div data-type="clauses-placeholder"></div>
      <p>Notice period: <span data-type="variable" data-name="termination_policy" data-label="Termination Notice" data-category="policies">Termination Notice</span>.</p>
    `,
  },
  {
    id: 'renewal-addendum',
    name: 'Lease Renewal Addendum',
    description: 'Compact addendum structure for extending existing lease terms.',
    bodyHtml: `
      <h1>Lease Renewal Addendum</h1>
      <p>This addendum extends the lease between <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> and <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span>.</p>
      <p>Renewed term starts on <span data-type="variable" data-name="start_date" data-label="Lease Start Date" data-category="dates">Lease Start Date</span> and ends on <span data-type="variable" data-name="end_date" data-label="Lease End Date" data-category="dates">Lease End Date</span>.</p>
      <table class="agreement-table">
        <tbody>
          <tr>
            <th><p style="text-align: center;">Term</p></th>
            <th><p style="text-align: center;">Previous</p></th>
            <th><p style="text-align: center;">Renewed</p></th>
          </tr>
          <tr>
            <td><p>Monthly Rent</p></td>
            <td><p>-</p></td>
            <td><p><span data-type="variable" data-name="rent_amount" data-label="Monthly Rent" data-category="financials">Monthly Rent</span></p></td>
          </tr>
          <tr>
            <td><p>Escalation</p></td>
            <td><p>-</p></td>
            <td><p><span data-type="variable" data-name="rent_escalation_percentage" data-label="Rent Escalation %" data-category="policies">Rent Escalation %</span></p></td>
          </tr>
        </tbody>
      </table>
      <p>All other terms remain in full force unless modified herein.</p>
    `,
  },
  {
    id: 'short-term-stay',
    name: 'Short-Term Stay Agreement',
    description: 'Short-format agreement for temporary occupancy with policy highlights.',
    bodyHtml: `
      <h1 style="text-align: center;">Short-Term Stay Agreement</h1>
      <p>The host <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> grants temporary occupancy to <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span> at <span data-type="variable" data-name="property_title" data-label="Property Title" data-category="property">Property Title</span>.</p>
      <div data-type="dual-column" class="dual-column-wrapper group relative">
        <div data-type="dual-column-side" class="dual-column-side p-4 min-h-[100px] outline-none relative">
          <h2>Stay Window</h2>
          <p>Check-in: <span data-type="variable" data-name="start_date" data-label="Lease Start Date" data-category="dates">Lease Start Date</span></p>
          <p>Check-out: <span data-type="variable" data-name="end_date" data-label="Lease End Date" data-category="dates">Lease End Date</span></p>
        </div>
        <div data-type="dual-column-side" class="dual-column-side p-4 min-h-[100px] outline-none relative">
          <h2>Payment Terms</h2>
          <p>Total Due: <span data-type="variable" data-name="total_move_in" data-label="Total Move-in Cost" data-category="financials">Total Move-in Cost</span></p>
          <p>Deposit: <span data-type="variable" data-name="security_deposit" data-label="Security Deposit" data-category="financials">Security Deposit</span></p>
        </div>
      </div>
      <table class="agreement-table">
        <tbody>
          <tr>
            <th><p style="text-align: center;">Policy</p></th>
            <th><p style="text-align: center;">Value</p></th>
          </tr>
          <tr>
            <td><p>Pets</p></td>
            <td><p><span data-type="variable" data-name="pet_allowed" data-label="Pets Allowed?" data-category="policies">Pets Allowed?</span></p></td>
          </tr>
          <tr>
            <td><p>Late Fee Grace Period</p></td>
            <td><p><span data-type="variable" data-name="late_fee_grace_days" data-label="Grace Period (Days)" data-category="financials">Grace Period (Days)</span></p></td>
          </tr>
        </tbody>
      </table>
      <div data-type="clauses-placeholder"></div>
    `,
  },
];
