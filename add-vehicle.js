
// ============================================================
// A1 CAR DETAILING FACTORY
// ADD VEHICLE
// OWNER + STAFF
// GOOGLE SHEETS VERSION
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbwoKohiflL0GrN8fqjZyzo-z16EA3m4Q8hqWavbc8oH1iL7W3rOQ6K1M-WLH6UiUFU8/exec";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    updateDateTime();

    setInterval(
      updateDateTime,
      1000
    );


    const vehicleNumber =
      document.getElementById(
        "vehicleNumber"
      );


    if (vehicleNumber) {

      vehicleNumber.addEventListener(
        "input",
        function () {

          this.value =
            this.value
              .toUpperCase()
              .replace(/\s/g, "");

        }
      );

    }


    const form =
      document.getElementById(
        "vehicleForm"
      );


    if (form) {

      form.addEventListener(
        "submit",
        addVehicle
      );

    }


    // --------------------------------------------------------
    // BACK BUTTON
    // --------------------------------------------------------

    const backBtn =
      document.getElementById(
        "backBtn"
      );


    if (backBtn) {

      backBtn.addEventListener(
        "click",
        function () {

          window.location.href =
            "owner-dashboard.html";

        }
      );

    }

  }
);


// ============================================================
// GET API
// ============================================================

async function apiGet(
  action
) {

  const url =
    API_URL +
    "?action=" +
    encodeURIComponent(action) +
    "&t=" +
    Date.now();


  const response =
    await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      "Google Apps Script connection failed."
    );

  }


  const data =
    await response.json();


  return data;

}


// ============================================================
// POST API
// ============================================================

async function apiPost(
  payload
) {

  const response =
    await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify(payload)
      }
    );


  if (!response.ok) {

    throw new Error(
      "Google Apps Script connection failed."
    );

  }


  const data =
    await response.json();


  return data;

}


// ============================================================
// GET VEHICLES
// ============================================================

async function getVehicles() {

  const result =
    await apiGet(
      "getVehicles"
    );


  if (
    !result ||
    result.success !== true
  ) {

    throw new Error(
      result &&
      result.message
        ? result.message
        : "Unable to load vehicles."
    );

  }


  return Array.isArray(
    result.vehicles
  )
    ? result.vehicles
    : [];

}


// ============================================================
// CHECK PREVIOUS BALANCE
// ============================================================

async function checkPreviousBalance(
  vehicleNumber
) {

  const box =
    document.getElementById(
      "balanceBox"
    );


  if (!box) {
    return;
  }


  if (
    !vehicleNumber ||
    vehicleNumber.length < 4
  ) {

    box.classList.add(
      "hidden"
    );

    return;

  }


  try {

    const vehicles =
      await getVehicles();


    const records =
      vehicles.filter(
        function (vehicle) {

          return (
            String(
              vehicle.vehicle_number ||
              ""
            )
              .toUpperCase() ===
            vehicleNumber.toUpperCase()
          );

        }
      );


    const pendingRecords =
      records.filter(
        function (vehicle) {

          return (
            Number(
              vehicle.balance || 0
            ) > 0
          );

        }
      );


    if (
      pendingRecords.length === 0
    ) {

      box.classList.add(
        "hidden"
      );

      return;

    }


    const record =
      pendingRecords[
        pendingRecords.length - 1
      ];


    showPreviousBalance(
      record
    );

  }

  catch (error) {

    console.error(
      "Balance check error:",
      error
    );

  }

}


// ============================================================
// SHOW PREVIOUS BALANCE
// ============================================================

function showPreviousBalance(
  record
) {

  const box =
    document.getElementById(
      "balanceBox"
    );


  if (!box) {
    return;
  }


  box.classList.remove(
    "hidden"
  );


  const balanceVehicle =
    document.getElementById(
      "balanceVehicle"
    );


  const balanceOwner =
    document.getElementById(
      "balanceOwner"
    );


  const previousTotal =
    document.getElementById(
      "previousTotal"
    );


  const previousPaid =
    document.getElementById(
      "previousPaid"
    );


  const previousBalance =
    document.getElementById(
      "previousBalance"
    );


  const oldBalancePayment =
    document.getElementById(
      "oldBalancePayment"
    );


  if (balanceVehicle) {

    balanceVehicle.textContent =
      record.vehicle_number || "-";

  }


  if (balanceOwner) {

    balanceOwner.textContent =
      record.owner_name || "-";

  }


  if (previousTotal) {

    previousTotal.textContent =
      formatMoney(
        record.amount
      );

  }


  if (previousPaid) {

    previousPaid.textContent =
      formatMoney(
        record.paidAmount
      );

  }


  if (previousBalance) {

    previousBalance.textContent =
      formatMoney(
        record.balance
      );

  }


  if (oldBalancePayment) {

    oldBalancePayment.value =
      record.balance || 0;

  }


}


// ============================================================
// ADD VEHICLE
// ============================================================

async function addVehicle(
  event
) {

  event.preventDefault();


  // ----------------------------------------------------------
  // GET VALUES
  // ----------------------------------------------------------

  const vehicleNumber =
    getValue(
      "vehicleNumber"
    )
      .toUpperCase()
      .replace(/\s/g, "");


  const ownerName =
    getValue(
      "ownerName"
    );


  const phone =
    getValue(
      "phone"
    );


  // IMPORTANT:
  // Supports vehicleName OR vehicleType

  const vehicleName =
    getValue(
      "vehicleName"
    ) ||
    getValue(
      "vehicleType"
    );


  const serviceType =
    getValue(
      "serviceType"
    );


  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!vehicleNumber) {

    alert(
      "Enter vehicle number."
    );

    return;

  }


  if (!ownerName) {

    alert(
      "Enter owner name."
    );

    return;

  }


  if (
    !/^[0-9]{10}$/.test(
      phone
    )
  ) {

    alert(
      "Enter a valid 10 digit phone number."
    );

    return;

  }


  if (!vehicleName) {

    alert(
      "Vehicle name/type is required."
    );

    return;

  }


  if (!serviceType) {

    alert(
      "Select service type."
    );

    return;

  }


  // ----------------------------------------------------------
  // PREVENT DOUBLE SUBMIT
  // ----------------------------------------------------------

  const submitBtn =
    document.getElementById(
      "submitBtn"
    );


  if (submitBtn) {

    submitBtn.disabled =
      true;

    submitBtn.textContent =
      "Saving...";

  }


  try {

    // --------------------------------------------------------
    // CHECK ACTIVE VEHICLES
    // --------------------------------------------------------

    const vehicles =
      await getVehicles();


    const alreadyInside =
      vehicles.some(
        function (vehicle) {

          const sameNumber =
            String(
              vehicle.vehicle_number ||
              ""
            )
              .toUpperCase()
              .replace(/\s/g, "") ===
            vehicleNumber;


          const status =
            String(
              vehicle.status ||
              ""
            ).toLowerCase();


          const active =
            status === "inside" ||
            status === "washing" ||
            status === "active";


          return (
            sameNumber &&
            active
          );

        }
      );


    if (alreadyInside) {

      alert(
        "This vehicle is already inside the showroom."
      );

      return;

    }


    // --------------------------------------------------------
    // DETERMINE WHO ADDED VEHICLE
    // --------------------------------------------------------

    let addedBy =
      "Owner";


    const role =
      sessionStorage.getItem(
        "a1Role"
      );


    const staffName =
      sessionStorage.getItem(
        "a1StaffName"
      );


    if (
      role &&
      role.toLowerCase() ===
      "staff"
    ) {

      addedBy =
        staffName ||
        "Staff";

    }


    // --------------------------------------------------------
    // SEND TO GOOGLE SHEETS
    // --------------------------------------------------------

    const result =
      await apiPost({

        action:
          "addVehicle",

        vehicleNumber:
          vehicleNumber,

        ownerName:
          ownerName,

        phone:
          phone,

        vehicleName:
          vehicleName,

        serviceType:
          serviceType,

        addedBy:
          addedBy

      });


    console.log(
      "ADD VEHICLE RESPONSE:",
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : "Vehicle could not be saved."
      );

    }


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    alert(
      "Vehicle added successfully!\n\n" +
      "Vehicle: " +
      vehicleNumber +
      "\n" +
      "Added By: " +
      addedBy +
      "\n" +
      "Status: Inside Showroom"
    );


    // Clear form

    clearForm();


    // Go dashboard

    window.location.href =
      "owner-dashboard.html";

  }

  catch (error) {

    console.error(
      "ADD VEHICLE ERROR:",
      error
    );


    alert(
      "Vehicle was not saved.\n\n" +
      error.message
    );

  }

  finally {

    if (submitBtn) {

      submitBtn.disabled =
        false;

      submitBtn.textContent =
        "Add Vehicle";

    }

  }

}


// ============================================================
// GET ELEMENT VALUE
// ============================================================

function getValue(
  id
) {

  const element =
    document.getElementById(id);


  if (!element) {

    return "";

  }


  return String(
    element.value || ""
  ).trim();

}


// ============================================================
// CLEAR FORM
// ============================================================

function clearForm() {

  const form =
    document.getElementById(
      "vehicleForm"
    );


  if (form) {

    form.reset();

  }


  const balanceBox =
    document.getElementById(
      "balanceBox"
    );


  if (balanceBox) {

    balanceBox.classList.add(
      "hidden"
    );

  }


  updateDateTime();

}


// ============================================================
// BACK TO DASHBOARD
// ============================================================

function goDashboard() {

  window.location.href =
    "owner-dashboard.html";

}


// ============================================================
// DATE / TIME
// ============================================================

function updateDateTime() {

  const now =
    new Date();


  const entryDate =
    document.getElementById(
      "entryDate"
    );


  const entryTime =
    document.getElementById(
      "entryTime"
    );


  if (entryDate) {

    entryDate.textContent =
      now.toLocaleDateString(
        "en-IN"
      );

  }


  if (entryTime) {

    entryTime.textContent =
      now.toLocaleTimeString(
        "en-IN"
      );

  }

}


// ============================================================
// MONEY
// ============================================================

function formatMoney(
  value
) {

  return (
    "₹" +
    Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    )
  );

}


// ============================================================
// COLLECT PREVIOUS BALANCE
// ============================================================
//
// This updates the browser view only.
// Full balance collection/exit can be connected to
// updateVehicle in the same backend.
//

async function collectPreviousBalance() {

  const vehicleNumber =
    getValue(
      "vehicleNumber"
    );


  const paymentInput =
    document.getElementById(
      "oldBalancePayment"
    );


  const methodElement =
    document.getElementById(
      "oldBalanceMethod"
    );


  const amountPaid =
    Number(
      paymentInput
        ? paymentInput.value
        : 0
    );


  const paymentMethod =
    methodElement
      ? methodElement.value
      : "";


  if (!vehicleNumber) {

    alert(
      "Enter vehicle number first."
    );

    return;

  }


  if (
    !amountPaid ||
    amountPaid <= 0
  ) {

    alert(
      "Enter payment amount."
    );

    return;

  }


  try {

    const vehicles =
      await getVehicles();


    const index =
      vehicles.findIndex(
        function (vehicle) {

          return (
            String(
              vehicle.vehicle_number ||
              ""
            )
              .toUpperCase() ===
            vehicleNumber &&
            Number(
              vehicle.balance || 0
            ) > 0
          );

        }
      );


    if (index === -1) {

      alert(
        "No previous balance found."
      );

      return;

    }


    const record =
      vehicles[index];


    const oldBalance =
      Number(
        record.balance || 0
      );


    if (
      amountPaid >
      oldBalance
    ) {

      alert(
        "Payment cannot be more than ₹" +
        oldBalance
      );

      return;

    }


    const newPaid =
      Number(
        record.paidAmount || 0
      ) +
      amountPaid;


    const newBalance =
      Math.max(
        0,
        oldBalance -
        amountPaid
      );


    const result =
      await apiPost({

        action:
          "updateVehicle",

        id:
          record.id,

        amount:
          Number(
            record.amount || 0
          ),

        paidAmount:
          newPaid,

        paymentMethod:
          paymentMethod,

        status:
          record.status ||
          "Inside",

        remark:
          record.remark ||
          ""

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : "Payment update failed."
      );

    }


    alert(
      "Payment received.\n\n" +
      "Paid: ₹" +
      amountPaid +
      "\n" +
      "Remaining Balance: ₹" +
      newBalance
    );


    if (
      newBalance === 0
    ) {

      const box =
        document.getElementById(
          "balanceBox"
        );

      if (box) {

        box.classList.add(
          "hidden"
        );

      }

    }


  }

  catch (error) {

    console.error(
      error
    );

    alert(
      "Payment update failed.\n\n" +
      error.message
    );

  }

}

