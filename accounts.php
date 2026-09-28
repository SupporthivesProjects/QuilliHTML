<?php include 'includes/header.php'; ?>

<section class="dashboard-page">
<div class="container dashboard-inner">
<aside class="sidebar">
    <div class="acc-side-info">
        <h1>
            John Smith
        </h1>
        <p class="d-none d-md-block">
            john@example.com
        </p>
    </div>
    <div class="acc-tabs w-100">
      <div class="tab-buttons">
        <button class="tab-btn active" data-tab="Overview">Overview</button>
        <button class="tab-btn" data-tab="Downloads">Downloads</button>
        <button class="tab-btn" data-tab="Invoices">Invoices</button>
        <button class="tab-btn" data-tab="details">Account details</button>
      </div>
    </div>
    <button class="logout-tab">SIGN OUT</button>
</aside>


  <!-- MOBILE TAB SELECTOR -->

  
   <!-- MOBILE TAB SELECTOR -->

<div class="accounts-content">

  <!-- Overview -->
  <section class="acc-panel active" id="panel-Overview">
    <span class="accred-text">
      YOUR QUILLLI ACCOUNT
    </span>
    <h1 class="ac-tabh1">Your account.</h1>
    <p class="ac-tabp">Keep an eye on the work, then download the finished files here.</p>
    <div class="overview-line">
      <div class="overview-card">
        <span>
          ORDERS IN PROGRESS
        </span>
        <h1>
          1
        </h1>
        <span>
          The autumn launch
        </span>
      </div>
      <div class="overview-card">
        <span>
          WORDS COMMISSIONED
        </span>
        <h1>
          1,700
        </h1>
        <span>
          Across 2 pieces
        </span>
      </div>
      <div class="overview-card">
        <span>
          FILES READY
        </span>
        <h1>
          4
        </h1>
        <span>
          In your downloads
        </span>
      </div>
      <div class="overview-card">
        <span>
          SPENT THIS YEAR
        </span>
        <h1>
          $812.45
        </h1>
        <span>
          Across 4 orders
        </span>
      </div>
    </div>
    <div class="down-inv-line">
      <div class="down-inv-box">
        <h1>
          Your documents
        </h1>
        <p>
          Finished writing and licensed images, organised by order.
        </p>
      </div>
      <div class="down-inv-box">
        <h1>
          Your invoices
        </h1>
        <p>
          A downloadable invoice for every completed payment.
        </p>
      </div>
    </div>
    <div class="overview-table">
      <div class="over-table-head">
        <h1>
          Recent orders
        </h1>
        <span>
          VIEW DOWNLOADS
        </span>
      </div>
      <div class="over-table-data">
        <span>
          QL-2026-0042
        </span>
        <h1>
          White papers · 2,400 words
        </h1>
        <span>
          11 Sep 2026
        </span>
        <span style="color:#1F1B18;">
          $184.95
        </span>
        <a href="" class="view-invoice">View order</a>
      </div>
      <div class="over-table-data">
        <span>
          QL-2026-0042
        </span>
        <h1>
          Blog writing and Press releases
        </h1>
        <span>
          11 Sep 2026
        </span>
        <span style="color:#1F1B18;">
          $184.95
        </span>
        <a href="" class="view-invoice">View order</a>
      </div>
    </div>
    <a href="#" class="acc-black-btn">
      Start a new order
    </a>

    <!-- empty invoice start -->
    
    <!-- <div class="empty-invoice">
        <h1>
          Your first project starts here.
        </h1>
        <p>
          Choose a service and set the scope. Your order progress, documents and invoices will appear in this account.
        </p>
        <a href="#" class="acc-black-btn">
          Explore services
        </a>
     </div> -->
     
    <!-- empty invoice end -->


  </section>

  <!-- Downloads -->
  <section class="acc-panel" id="panel-Downloads">
    <span class="accred-text">
      YOUR QUILLLI ACCOUNT
    </span>
    <h1 class="ac-tabh1">Your downloads.</h1>
    <p class="ac-tabp">Download the finished documents you purchased. Files appear here when the project is complete.</p>
    <div class="download-table">
      <div class="download-table-head">
        <span style="width:12%">
          ORDER
        </span>
        <span style="flex: 1 0 0;">
          FILE
        </span>
        <span style="width:10%">
          ADDED
        </span>
        <span style="width:190px;">
          DOWNLOAD
        </span>
      </div>
      <div class="over-table-data">
        <span>
          QL-2026-0042
        </span>
        <h1>
          White papers · 2,400 words
        </h1>
        <span>
          11 Sep 2026
        </span>
        <div class="download-btn-box">
          <a href="" class="view-invoice">Download</a>
        </div>
      </div>
      <div class="over-table-data">
        <span>
          QL-2026-0042
        </span>
        <h1>
          Blog writing and Press releases
        </h1>
        <span>
          11 Sep 2026
        </span>
         <div class="download-btn-box">
          <a href="" class="view-invoice">Download</a>
        </div>
      </div>
    </div>

  </section>

  <!-- Invoices -->
  <section class="acc-panel" id="panel-Invoices">
    <span class="accred-text">
      YOUR QUILLLI ACCOUNT
    </span>
    <h1 class="ac-tabh1">Your invoices.</h1>
    <p class="ac-tabp">Your paid invoices, with a download for each order.</p>
    <div class="download-table">
      <div class="download-table-head">
        <span style="flex: 1 0 0;">
          ORDER
        </span>
        <span style="width:10%">
          ISSUED
        </span>
        <span style="width:10%">
          TOTAL
        </span>
        <span style="width:190px;">
          DOWNLOAD
        </span>
      </div>
      <div class="over-table-data">
        <h1>
          QL-2026-0042
        </h1>
        <span style="width:10%">
          11 Sep 2026
        </span>
        <span style="color:#1F1B18;width:10%">
          $184.95
        </span>
          <a href="" class="view-invoice">Download invoice</a>
      </div>
      <div class="over-table-data">
        <h1>
          QL-2026-0042
        </h1>
        <span style="width:10%">
          11 Sep 2026
        </span>
        <span style="color:#1F1B18;width:10%">
          $184.95
        </span>
          <a href="" class="view-invoice">Download invoice</a>
      </div>
    </div>
  </section>


  <!-- details -->
  <section class="acc-panel" id="panel-details">
    <span class="accred-text">
      YOUR QUILLLI ACCOUNT
    </span>
    <h1 class="ac-tabh1">Your account details.</h1>
    <p class="ac-tabp">Keep your name, contact details, date of birth and billing address up to date.</p>
    <form class="account-form">
      <div class="acc-form-line">
        <div class="acc-inp-box">
          <label for="" class="acc-label">FIRST NAME</label>
          <input type="text" name="" id="" placeholder="John" class="acc-inp">
        </div>
        <div class="acc-inp-box">
          <label for="" class="acc-label">LAST NAME</label>
          <input type="text" name="" id="" placeholder="Smith" class="acc-inp">
        </div>
      </div>
      <div class="acc-form-line">
        <div class="acc-inp-box">
          <label for="" class="acc-label">EMAIL</label>
          <input type="text" name="" id="" placeholder="john@example.com" class="acc-inp">
        </div>
        <div class="acc-inp-box">
          <label for="" class="acc-label">PHONE NUMBER</label>
          <input type="text" name="" id="" placeholder="+44 7700 900123" class="acc-inp">
        </div>
      </div>
      <div class="acc-form-line">
        <div class="acc-inp-box">
          <label for="" class="acc-label">DATE OF BIRTH</label>
          <input type="text" name="" id="" placeholder="14/03/1991" class="acc-inp">
        </div>
        <div class="acc-inp-box d-md-block d-none">
          
        </div>
      </div>
      <!-- <img src="img/account-rule.png" alt=""> -->
       <p class="rule-line"></p>
      <h1 class="acc-det-h1">
        Billing address
      </h1>
      <div class="acc-form-line">
        <div class="acc-inp-box">
          <label for="" class="acc-label">STREET ADDRESS</label>
          <input type="text" name="" id="" placeholder="24 Willow Lane" class="acc-inp">
        </div>
        <div class="acc-inp-box">
          <label for="" class="acc-label">ADDRESS LINE 2</label>
          <input type="text" name="" id="" placeholder="Flat 2" class="acc-inp">
        </div>
      </div>
      <div class="acc-form-line">
        <div class="acc-inp-box">
          <label for="" class="acc-label">CITY</label>
          <input type="text" name="" id="" placeholder="Bristol" class="acc-inp">
        </div>
        <div class="acc-inp-box">
          <label for="" class="acc-label">POSTCODE</label>
          <input type="text" name="" id="" placeholder="BS1 4AA" class="acc-inp">
        </div>
      </div>
      <div class="acc-form-line">
        <div class="acc-inp-box">
          <label for="" class="acc-label">COUNTRY</label>
          <select name="" id="" class="acc-inp form-select">
            <option value="">United Kingdom</option>
            <option value="">India</option>
            <option value="">china</option>
          </select>
        </div>
        <div class="acc-inp-box d-md-block d-none">
          
        </div>
      </div>
      <!-- <img src="img/account-rule.png" alt=""> -->
       <p class="rule-line"></p>
      <h1 class="acc-det-h1">
        Change your password
      </h1>
      <div class="acc-form-line">
        <div class="acc-inp-box">
          <label for="" class="acc-label">CURRENT PASSWORD</label>
          <input type="text" name="" id="" placeholder="••••••••••••" class="acc-inp">
        </div>
        <div class="acc-inp-box">
          <label for="" class="acc-label">NEW PASSWORD</label>
          <input type="text" name="" id="" placeholder="••••••••••••" class="acc-inp">
        </div>
      </div>
      <p class="acc-tp">Use at least 12 characters, including a mix of letters, numbers and symbols.</p>
    </form>
    <a href="#" class="acc-black-btn">
      Save changes
    </a>
  </section>

</div>
</div>
</section>




<script>
  // ---- Tab switching ----
  const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
  const panels = document.querySelectorAll('.acc-panel');
  tabButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      panels.forEach(p=>p.classList.remove('active'));
      document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
  });
   
</script>
<script>
  const mobileTabBox =
            document.getElementById(
                "mobileTabBox"
            );
        const mobileTabToggle =
            document.getElementById(
                "mobileTabToggle"
            );
        const mobileTabTitle =
            document.getElementById(
                "mobileTabTitle"
            );
        const mobileOptions =
            document.querySelectorAll(
                ".mobile-tab-option"
            );
        /* Open / close dropdown */
        mobileTabToggle.addEventListener(
            "click",
            function() {
                mobileTabBox.classList.toggle(
                    "open"
                );
            }
        );
        /* Mobile option click */
        mobileOptions.forEach(function(option) {
            option.addEventListener(
                "click",
                function() {
                    const selectedTab =
                        this.dataset.mobileTab;
                    // Update mobile title
                    updateMobileTab(
                        selectedTab
                    );
                    // Update active option
                    mobileOptions.forEach(
                        function(item) {
                            item.classList.remove(
                                "active"
                            );
                        }
                    );
                    this.classList.add("active");
                    // Update desktop tabs
                    desktopTabs.forEach(
                        function(tab) {
                            tab.classList.remove(
                                "active"
                            );
                            if (
                                tab.dataset.tab ===
                                selectedTab
                            ) {
                                tab.classList.add(
                                    "active"
                                );
                            }
                        }
                    );
                    // Update tab panel
                    tabPanels.forEach(
                        function(panel) {
                            panel.classList.remove(
                                "active"
                            );
                        }
                    );
                    document
                        .getElementById(
                            "panel-" + selectedTab
                        )
                        .classList.add("active");
                    // Close dropdown
                    mobileTabBox.classList.remove(
                        "open"
                    );
                }
            );
        });
        /* =========================
           UPDATE MOBILE TITLE
        ========================== */
        function updateMobileTab(tabName) {
            const tabNames = {
                account:
                    "Account details",
                translations:
                    "Your translations",
                orders:
                    "Order history"
            };
            mobileTabTitle.textContent =
                tabNames[tabName];
        }
</script>

<?php include 'includes/footer.php'; ?>