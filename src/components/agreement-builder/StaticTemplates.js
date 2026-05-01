export const STATIC_AGREEMENT_TEMPLATES = [
  {
    id: 'residential-standard',
    name: 'Residential Standard Lease',
    description: 'Executive-grade residential lease with premium structure, payment matrix, and legal clarity.',
    bodyHtml: `
      <h1 style="text-align: center;">RESIDENTIAL LEASE AGREEMENT</h1>
      <p style="text-align: center; font-size: 14px;">Prepared on <span data-type="variable" data-name="current_date" data-label="Current Date" data-category="dates">Current Date</span></p>
      <p>This Residential Lease Agreement ("Agreement") is entered into between <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> ("Landlord") and <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span> ("Tenant"), for the premises known as <span data-type="variable" data-name="property_title" data-label="Property Title" data-category="property">Property Title</span>, situated at <span data-type="variable" data-name="property_address" data-label="Full Address" data-category="property">Full Address</span>.</p>
      <h2>1. Lease Term</h2>
      <p>The lease shall commence on <span data-type="variable" data-name="start_date" data-label="Lease Start Date" data-category="dates">Lease Start Date</span> and expire on <span data-type="variable" data-name="end_date" data-label="Lease End Date" data-category="dates">Lease End Date</span>, totaling <span data-type="variable" data-name="duration_months" data-label="Duration (months)" data-category="dates">Duration (months)</span> months unless terminated earlier in accordance with this Agreement.</p>
      <h2>2. Commercial Terms</h2>
      <table class="agreement-table">
        <tbody>
          <tr>
            <th><p style="text-align: center;">Term</p></th>
            <th><p style="text-align: center;">Value</p></th>
            <th><p style="text-align: center;">Remarks</p></th>
          </tr>
          <tr>
            <td><p>Monthly Rent</p></td>
            <td><p><span data-type="variable" data-name="rent_amount" data-label="Monthly Rent" data-category="financials">Monthly Rent</span></p></td>
            <td><p>Payable in advance by day 1 of each month</p></td>
          </tr>
          <tr>
            <td><p>Security Deposit</p></td>
            <td><p><span data-type="variable" data-name="security_deposit" data-label="Security Deposit" data-category="financials">Security Deposit</span></p></td>
            <td><p>Refundable subject to move-out inspection</p></td>
          </tr>
          <tr>
            <td><p>Maintenance Fee</p></td>
            <td><p><span data-type="variable" data-name="maintenance_fee" data-label="Maintenance Fee" data-category="financials">Maintenance Fee</span></p></td>
            <td><p>As applicable under building policy</p></td>
          </tr>
        </tbody>
      </table>
      <h2>3. Use and Occupancy</h2>
      <p>The premises shall be used solely for lawful residential purposes. Tenant agrees to maintain the property in clean and tenantable condition and to comply with all community and municipal regulations.</p>
      <h2>4. Utilities and Policies</h2>
      <p>Utilities Included: <span data-type="variable" data-name="utilities_included" data-label="Utilities Included?" data-category="policies">Utilities Included?</span></p>
      <p>Utility Details: <span data-type="variable" data-name="utilities_details" data-label="Utilities Details" data-category="policies">Utilities Details</span></p>
      <div data-type="clauses-placeholder"></div>
      <h2>5. Execution</h2>
      <p>By signing, both parties confirm they have read, understood, and agreed to all terms contained in this Agreement.</p>
      <p style="text-align: center;"><strong>Landlord:</strong> <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; <strong>Tenant:</strong> <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span></p>
    `,
  },
  {
    id: 'furnished-lease',
    name: 'Furnished Apartment Lease',
    description: 'Premium furnished-asset lease with detailed handover matrix and liability boundaries.',
    bodyHtml: `
      <h1 style="text-align: center;">FURNISHED APARTMENT LEASE</h1>
      <p>This Agreement is made by and between <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> and <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span> for furnished occupancy of <span data-type="variable" data-name="property_title" data-label="Property Title" data-category="property">Property Title</span>.</p>
      <div data-type="dual-column" class="dual-column-wrapper group relative">
        <div data-type="dual-column-side" class="dual-column-side p-4 min-h-[100px] outline-none relative">
          <h2>Tenant Profile</h2>
          <p>Name: <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span></p>
          <p>Address: <span data-type="variable" data-name="property_address" data-label="Full Address" data-category="property">Full Address</span></p>
          <p>Lease Start: <span data-type="variable" data-name="start_date" data-label="Lease Start Date" data-category="dates">Lease Start Date</span></p>
        </div>
        <div data-type="dual-column-side" class="dual-column-side p-4 min-h-[100px] outline-none relative">
          <h2>Key Financial Terms</h2>
          <p>Rent: <span data-type="variable" data-name="rent_amount" data-label="Monthly Rent" data-category="financials">Monthly Rent</span></p>
          <p>Deposit: <span data-type="variable" data-name="security_deposit" data-label="Security Deposit" data-category="financials">Security Deposit</span></p>
          <p>Total Move-in: <span data-type="variable" data-name="total_move_in" data-label="Total Move-in Cost" data-category="financials">Total Move-in Cost</span></p>
        </div>
      </div>
      <h2>Inventory and Condition Report</h2>
      <table class="agreement-table">
        <tbody>
          <tr>
            <th><p style="text-align: center;">Inventory Item</p></th>
            <th><p style="text-align: center;">Condition on Handover</p></th>
            <th><p style="text-align: center;">Replacement Responsibility</p></th>
          </tr>
          <tr>
            <td><p>Bedroom Furniture</p></td>
            <td><p>Good</p></td>
            <td><p>Tenant if damaged beyond fair wear</p></td>
          </tr>
          <tr>
            <td><p>Kitchen Appliances</p></td>
            <td><p>Functional</p></td>
            <td><p>As per maintenance terms</p></td>
          </tr>
          <tr>
            <td><p>Air Conditioning / Heating</p></td>
            <td><p>Operational</p></td>
            <td><p>Landlord unless misuse is proven</p></td>
          </tr>
        </tbody>
      </table>
      <h2>Utilities and Living Policies</h2>
      <p>Included Utilities: <span data-type="variable" data-name="utilities_details" data-label="Utilities Details" data-category="policies">Utilities Details</span></p>
      <p>Pet Policy: <span data-type="variable" data-name="pet_allowed" data-label="Pets Allowed?" data-category="policies">Pets Allowed?</span> (Deposit: <span data-type="variable" data-name="pet_deposit" data-label="Pet Deposit" data-category="policies">Pet Deposit</span>)</p>
      <div data-type="clauses-placeholder"></div>
    `,
  },
  {
    id: 'commercial-office',
    name: 'Commercial Office Lease',
    description: 'Boardroom-style commercial lease with obligations matrix and escalation terms.',
    bodyHtml: `
      <h1 style="text-align: center;">COMMERCIAL OFFICE LEASE AGREEMENT</h1>
      <p>This Commercial Lease is executed by <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> and <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span> for office use at <span data-type="variable" data-name="property_address" data-label="Full Address" data-category="property">Full Address</span>.</p>
      <h2>1. Financial Schedule</h2>
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
          <tr>
            <td><p>Rent Escalation</p></td>
            <td><p><span data-type="variable" data-name="rent_escalation_percentage" data-label="Rent Escalation %" data-category="policies">Rent Escalation %</span></p></td>
            <td><p>Annually or as agreed</p></td>
          </tr>
        </tbody>
      </table>
      <h2>2. Operational Obligations</h2>
      <ul>
        <li>Tenant shall use the premises exclusively for lawful office operations.</li>
        <li>Structural changes require prior written landlord approval.</li>
        <li>Compliance with fire, safety, and municipal commercial codes is mandatory.</li>
      </ul>
      <div data-type="clauses-placeholder"></div>
      <h2>3. Exit and Termination</h2>
      <p>Notice period shall be <span data-type="variable" data-name="termination_policy" data-label="Termination Notice" data-category="policies">Termination Notice</span>. Any outstanding dues survive termination until full settlement.</p>
    `,
  },
  {
    id: 'renewal-addendum',
    name: 'Lease Renewal Addendum',
    description: 'Refined renewal instrument for extending terms with transparent delta comparison.',
    bodyHtml: `
      <h1 style="text-align: center;">LEASE RENEWAL ADDENDUM</h1>
      <p>This Addendum renews the lease between <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> and <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span> in relation to <span data-type="variable" data-name="property_title" data-label="Property Title" data-category="property">Property Title</span>.</p>
      <h2>Renewal Timeline</h2>
      <p>New term starts on <span data-type="variable" data-name="start_date" data-label="Lease Start Date" data-category="dates">Lease Start Date</span> and concludes on <span data-type="variable" data-name="end_date" data-label="Lease End Date" data-category="dates">Lease End Date</span>.</p>
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
          <tr>
            <td><p>Late Fee</p></td>
            <td><p>-</p></td>
            <td><p><span data-type="variable" data-name="late_fee" data-label="Late Payment Fee" data-category="financials">Late Payment Fee</span></p></td>
          </tr>
        </tbody>
      </table>
      <h2>Continuing Terms</h2>
      <p>Except as expressly amended herein, all original lease provisions continue in full force and effect. This Addendum forms an inseparable part of the principal lease.</p>
      <div data-type="clauses-placeholder"></div>
    `,
  },
  {
    id: 'short-term-stay',
    name: 'Short-Term Stay Agreement',
    description: 'Luxury short-stay contract with concise terms, occupancy controls, and payment safeguards.',
    bodyHtml: `
      <h1 style="text-align: center;">SHORT-TERM STAY AGREEMENT</h1>
      <p>This short-term occupancy contract is made between Host <span data-type="variable" data-name="landlord_name" data-label="Landlord Name" data-category="parties">Landlord Name</span> and Guest <span data-type="variable" data-name="tenant_name" data-label="Tenant Name" data-category="parties">Tenant Name</span> for <span data-type="variable" data-name="property_title" data-label="Property Title" data-category="property">Property Title</span>.</p>
      <div data-type="dual-column" class="dual-column-wrapper group relative">
        <div data-type="dual-column-side" class="dual-column-side p-4 min-h-[100px] outline-none relative">
          <h2>Stay Window</h2>
          <p>Check-in: <span data-type="variable" data-name="start_date" data-label="Lease Start Date" data-category="dates">Lease Start Date</span></p>
          <p>Check-out: <span data-type="variable" data-name="end_date" data-label="Lease End Date" data-category="dates">Lease End Date</span></p>
          <p>Duration: <span data-type="variable" data-name="duration_months" data-label="Duration (months)" data-category="dates">Duration (months)</span> months</p>
        </div>
        <div data-type="dual-column-side" class="dual-column-side p-4 min-h-[100px] outline-none relative">
          <h2>Payment Terms</h2>
          <p>Total Due: <span data-type="variable" data-name="total_move_in" data-label="Total Move-in Cost" data-category="financials">Total Move-in Cost</span></p>
          <p>Deposit: <span data-type="variable" data-name="security_deposit" data-label="Security Deposit" data-category="financials">Security Deposit</span></p>
          <p>Late Fee: <span data-type="variable" data-name="late_fee" data-label="Late Payment Fee" data-category="financials">Late Payment Fee</span></p>
        </div>
      </div>
      <h2>Guest Conduct and Property Rules</h2>
      <table class="agreement-table">
        <tbody>
          <tr>
            <th><p style="text-align: center;">Policy</p></th>
            <th><p style="text-align: center;">Value</p></th>
            <th><p style="text-align: center;">Notes</p></th>
          </tr>
          <tr>
            <td><p>Pets</p></td>
            <td><p><span data-type="variable" data-name="pet_allowed" data-label="Pets Allowed?" data-category="policies">Pets Allowed?</span></p></td>
            <td><p>Additional deposit may apply</p></td>
          </tr>
          <tr>
            <td><p>Late Fee Grace Period</p></td>
            <td><p><span data-type="variable" data-name="late_fee_grace_days" data-label="Grace Period (Days)" data-category="financials">Grace Period (Days)</span></p></td>
            <td><p>After grace period, late fee is enforceable</p></td>
          </tr>
        </tbody>
      </table>
      <p>All occupants shall maintain decorum, avoid unlawful activity, and return the premises in substantially similar condition (normal wear excepted).</p>
      <div data-type="clauses-placeholder"></div>
    `,
  },
];
