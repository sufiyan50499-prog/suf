// =====================================================
// A1 CAR DETAILING FACTORY
// ACTIVE VEHICLES
// GOOGLE SHEETS CONNECTED VERSION
// NO AUTO PAGE REFRESH
// WHATSAPP EXIT MESSAGE REMOVED
// =====================================================


// =====================================================
// GOOGLE APPS SCRIPT URL
// =====================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwoKohiflL0GrN8fqjZyzo-z16EA3m4Q8hqWavbc8oH1iL7W3rOQ6K1M-WLH6UiUFU8/exec";


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkLogin()) {
            return;
        }

        loadActiveVehicles();

        const searchInput =
            document.getElementById("searchInput");

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                loadActiveVehicles
            );

        }

    }
);


// =====================================================
// LOGIN CHECK
// =====================================================

function checkLogin() {

    const loggedIn =
        sessionStorage.getItem("a1LoggedIn");

    if (loggedIn !== "true") {

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}


// =====================================================
// GET VEHICLES FROM GOOGLE SHEETS
// =====================================================

async function getVehicles() {

    try {

        if (
            !API_URL ||
            API_URL ===
            "PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE"
        ) {

            console.error(
                "Google Apps Script API URL is not configured."
            );

            return [];
        }

        const url =
            API_URL +
            "?action=getVehicles&t=" +
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
                "HTTP error: " +
                response.status
            );
        }

        const data =
            await response.json();

        console.log(
            "GOOGLE SHEET VEHICLES:",
            data
        );

        if (
            !data ||
            data.success !== true
        ) {

            console.error(
                "Google Sheet returned an error:",
                data
            );

            showConnectionError(
                data?.message ||
                "Google Sheet returned an error."
            );

            return [];
        }

        if (
            Array.isArray(data.vehicles)
        ) {

            return data.vehicles;
        }

        if (
            Array.isArray(data.records)
        ) {

            return data.records;
        }

        if (
            Array.isArray(data.data)
        ) {

            return data.data;
        }

        return [];

    }
    catch (error) {

        console.error(
            "Google Sheet connection error:",
            error
        );

        showConnectionError(
            error.message
        );

        return [];
    }
}


// =====================================================
// LOAD ACTIVE VEHICLES
// =====================================================

async function loadActiveVehicles() {

    const table =
        document.getElementById(
            "activeVehicleTable"
        );

    if (table) {

        table.innerHTML = `
            <tr>
                <td colspan="13" class="empty-row">
                    Loading active vehicles...
                </td>
            </tr>
        `;
    }

    const vehicles =
        await getVehicles();

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const search =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    // =================================================
    // ONLY INSIDE VEHICLES
    // =================================================

    let activeVehicles =
        vehicles.filter(
            function (vehicle) {

                return (
                    normalizeStatus(
                        vehicle.status
                    ) === "Inside"
                );

            }
        );


    // =================================================
    // SEARCH
    // =================================================

    if (search) {

        activeVehicles =
            activeVehicles.filter(
                function (vehicle) {

                    const vehicleNumber =
                        getVehicleNumber(
                            vehicle
                        ).toLowerCase();

                    const owner =
                        getOwnerName(
                            vehicle
                        ).toLowerCase();

                    const phone =
                        getPhone(
                            vehicle
                        ).toLowerCase();

                    const vehicleName =
                        getVehicleName(
                            vehicle
                        ).toLowerCase();

                    return (
                        vehicleNumber.includes(search) ||
                        owner.includes(search) ||
                        phone.includes(search) ||
                        vehicleName.includes(search)
                    );

                }
            );
    }


    // =================================================
    // SORT OLDEST FIRST
    // =================================================

    activeVehicles.sort(
        function (a, b) {

            const timeA =
                getDateValue(
                    getEntryTime(a)
                );

            const timeB =
                getDateValue(
                    getEntryTime(b)
                );

            return timeA - timeB;

        }
    );


    displayActiveVehicles(
        activeVehicles
    );
}


// =====================================================
// DISPLAY ACTIVE VEHICLES
// =====================================================

function displayActiveVehicles(
    vehicles
) {

    const table =
        document.getElementById(
            "activeVehicleTable"
        );

    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );

    const vehicleCount =
        document.getElementById(
            "vehicleCount"
        );

    if (!table) {
        return;
    }

    table.innerHTML = "";

    let serviceAmount = 0;
    let paidAmount = 0;
    let balanceAmount = 0;


    // =================================================
    // EMPTY
    // =================================================

    if (
        vehicles.length === 0
    ) {

        if (emptyMessage) {

            emptyMessage.style.display =
                "block";
        }

        if (vehicleCount) {

            vehicleCount.textContent =
                "0 vehicles";
        }

        updateStats(
            0,
            0,
            0,
            0
        );

        return;
    }


    if (emptyMessage) {

        emptyMessage.style.display =
            "none";
    }


    // =================================================
    // TABLE ROWS
    // =================================================

    vehicles.forEach(
        function (vehicle, index) {

            const amount =
                getAmount(vehicle);

            const paid =
                getPaidAmount(vehicle);

            const balance =
                getBalance(vehicle);

            serviceAmount +=
                amount;

            paidAmount +=
                paid;

            balanceAmount +=
                balance;


            const row =
                document.createElement("tr");


            const vehicleId =
                getVehicleId(vehicle);


            row.innerHTML = `
                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(
                        getDate(vehicle) || "-"
                    )}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(
                            getVehicleNumber(vehicle) || "-"
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(
                        getOwnerName(vehicle) || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        getPhone(vehicle) || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        getVehicleName(vehicle) || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        getService(vehicle) || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        getEntryTime(vehicle) || "-"
                    )}
                </td>

                <td>
                    ${formatRupee(amount)}
                </td>

                <td>
                    ${formatRupee(paid)}
                </td>

                <td class="${
                    balance > 0
                        ? "balance-positive"
                        : "balance-zero"
                }">
                    ${formatRupee(balance)}
                </td>

                <td>
                    <span class="status-badge status-inside">
                        🟢 Inside Showroom
                    </span>
                </td>

                <td>
                    <button
                        class="exit-btn"
                        onclick="openExitModal('${escapeAttribute(vehicleId)}')"
                    >
                        Exit
                    </button>
                </td>
            `;

            table.appendChild(row);

        }
    );


    if (vehicleCount) {

        vehicleCount.textContent =
            `${vehicles.length} vehicle${
                vehicles.length === 1
                    ? ""
                    : "s"
            }`;
    }


    updateStats(
        vehicles.length,
        serviceAmount,
        paidAmount,
        balanceAmount
    );
}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStats(
    activeCount,
    serviceAmount,
    paidAmount,
    balanceAmount
) {

    const activeCountElement =
        document.getElementById(
            "activeCount"
        );

    if (activeCountElement) {

        activeCountElement.textContent =
            activeCount;
    }


    const serviceAmountElement =
        document.getElementById(
            "serviceAmount"
        );

    if (serviceAmountElement) {

        serviceAmountElement.textContent =
            formatRupee(serviceAmount);
    }


    const paidAmountElement =
        document.getElementById(
            "paidAmount"
        );

    if (paidAmountElement) {

        paidAmountElement.textContent =
            formatRupee(paidAmount);
    }


    const balanceAmountElement =
        document.getElementById(
            "balanceAmount"
        );

    if (balanceAmountElement) {

        balanceAmountElement.textContent =
            formatRupee(balanceAmount);
    }
}


// =====================================================
// VEHICLE ID
// =====================================================

function getVehicleId(vehicle) {

    return String(
        vehicle.id ||
        vehicle.vehicleId ||
        vehicle.vehicle_id ||
        ""
    );
}


// =====================================================
// VEHICLE NUMBER
// =====================================================

function getVehicleNumber(vehicle) {

    return String(
        vehicle.vehicleNumber ||
        vehicle.vehicle_number ||
        vehicle.number ||
        vehicle.registrationNumber ||
        ""
    );
}


// =====================================================
// OWNER
// =====================================================

function getOwnerName(vehicle) {

    return String(
        vehicle.ownerName ||
        vehicle.owner_name ||
        vehicle.owner ||
        ""
    );
}


// =====================================================
// PHONE
// =====================================================

function getPhone(vehicle) {

    return String(
        vehicle.phone ||
        vehicle.phoneNumber ||
        vehicle.mobile ||
        ""
    );
}


// =====================================================
// VEHICLE NAME
// =====================================================

function getVehicleName(vehicle) {

    return String(
        vehicle.vehicleName ||
        vehicle.vehicle_name ||
        vehicle.vehicleType ||
        vehicle.vehicle_type ||
        ""
    );
}


// =====================================================
// SERVICE
// =====================================================

function getService(vehicle) {

    let service =
        String(
            vehicle.serviceType ||
            vehicle.service_type ||
            vehicle.service ||
            ""
        )
        .trim();

    const lower =
        service.toLowerCase();


    if (lower === "full wash") {

        return "Full Car Wash";
    }


    if (lower === "body wash") {

        return "Exterior Wash";
    }


    if (lower === "ceramic coating") {

        return "Detailing";
    }


    return service;
}


// =====================================================
// DATE
// =====================================================

function getDate(vehicle) {

    const value =
        vehicle.date ||
        vehicle.entryDate ||
        vehicle.entry_date ||
        vehicle.entryTime ||
        vehicle.entry_time ||
        "";

    const parsed =
        parseGoogleDate(value);

    if (!parsed) {

        return String(
            value || ""
        );
    }


    return parsed.toLocaleDateString(
        "en-IN"
    );
}


// =====================================================
// ENTRY TIME
// =====================================================

function getEntryTime(vehicle) {

    const value =
        vehicle.entryTime ||
        vehicle.entry_time ||
        "";

    const parsed =
        parseGoogleDate(value);

    if (!parsed) {

        return String(
            value || ""
        );
    }


    return parsed.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );
}


// =====================================================
// AMOUNT
// =====================================================

function getAmount(vehicle) {

    const amount =
        vehicle.amount ??
        vehicle.totalAmount ??
        vehicle.total_amount ??
        vehicle.serviceAmount ??
        vehicle.service_amount ??
        0;

    return Number(amount) || 0;
}


// =====================================================
// PAID AMOUNT
// =====================================================

function getPaidAmount(vehicle) {

    const paid =
        vehicle.paidAmount ??
        vehicle.paid_amount ??
        vehicle.amountReceived ??
        vehicle.amount_received ??
        vehicle.paid ??
        vehicle.receivedAmount ??
        vehicle.received_amount ??
        0;

    return Number(paid) || 0;
}


// =====================================================
// BALANCE
// =====================================================

function getBalance(vehicle) {

    if (
        vehicle.balance !== undefined &&
        vehicle.balance !== null
    ) {

        return Number(
            vehicle.balance
        ) || 0;
    }


    const amount =
        getAmount(vehicle);

    const paid =
        getPaidAmount(vehicle);


    return Math.max(
        0,
        amount - paid
    );
}


// =====================================================
// NORMALIZE STATUS
// =====================================================

function normalizeStatus(status) {

    const value =
        String(status || "")
        .trim()
        .toLowerCase();


    if (
        value === "inside" ||
        value === "inside showroom" ||
        value === "active" ||
        value === "washing"
    ) {

        return "Inside";
    }


    if (
        value === "completed" ||
        value === "complete" ||
        value === "exited"
    ) {

        return "Completed";
    }


    return String(
        status || ""
    );
}


// =====================================================
// FORMAT RUPEE
// =====================================================

function formatRupee(amount) {

    return (
        "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        )
    );
}


// =====================================================
// SELECTED VEHICLE
// =====================================================

let selectedVehicleId = null;
let selectedVehicle = null;


// =====================================================
// OPEN EXIT MODAL
// =====================================================

async function openExitModal(id) {

    const vehicles =
        await getVehicles();


    const vehicle =
        vehicles.find(
            function (item) {

                return (
                    String(
                        item.id ||
                        item.vehicleId ||
                        item.vehicle_id ||
                        ""
                    ) ===
                    String(id)
                );

            }
        );


    if (!vehicle) {

        alert(
            "Vehicle record not found."
        );

        return;
    }


    selectedVehicleId =
        String(id);

    selectedVehicle =
        vehicle;


    const vehicleNumberElement =
        document.getElementById(
            "exitVehicleNumber"
        );

    if (vehicleNumberElement) {

        vehicleNumberElement.textContent =
            getVehicleNumber(vehicle) || "-";
    }


    const ownerNameElement =
        document.getElementById(
            "exitOwnerName"
        );

    if (ownerNameElement) {

        ownerNameElement.textContent =
            getOwnerName(vehicle) || "-";
    }


    const exitAmount =
        document.getElementById(
            "exitAmount"
        );

    if (exitAmount) {

        exitAmount.value =
            getAmount(vehicle) || "";
    }


    const exitPaidAmount =
        document.getElementById(
            "exitPaidAmount"
        );

    if (exitPaidAmount) {

        exitPaidAmount.value =
            getPaidAmount(vehicle) || "";
    }


    const paymentMethod =
        document.getElementById(
            "exitPaymentMethod"
        );

    if (paymentMethod) {

        paymentMethod.value =
            vehicle.paymentMethod ||
            vehicle.payment_method ||
            "";
    }


    const remark =
        document.getElementById(
            "exitRemark"
        );

    if (remark) {

        remark.value =
            vehicle.remark || "";
    }


    calculateBalance();


    const modal =
        document.getElementById(
            "exitModal"
        );

    if (modal) {

        modal.classList.add(
            "show"
        );
    }
}


// =====================================================
// CLOSE EXIT MODAL
// =====================================================

function closeExitModal() {

    selectedVehicleId = null;
    selectedVehicle = null;


    const modal =
        document.getElementById(
            "exitModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


// =====================================================
// CALCULATE BALANCE
// =====================================================

function calculateBalance() {

    const amountElement =
        document.getElementById(
            "exitAmount"
        );

    const paidElement =
        document.getElementById(
            "exitPaidAmount"
        );

    const balanceElement =
        document.getElementById(
            "exitBalance"
        );


    const amount =
        Number(
            amountElement?.value || 0
        );

    const paid =
        Number(
            paidElement?.value || 0
        );


    const balance =
        Math.max(
            0,
            amount - paid
        );


    if (balanceElement) {

        balanceElement.textContent =
            formatRupee(balance);
    }
}


// =====================================================
// COMPLETE EXIT
// =====================================================

async function completeExit() {

    if (!selectedVehicleId) {

        alert(
            "Vehicle not selected."
        );

        return;
    }


    const amountElement =
        document.getElementById(
            "exitAmount"
        );

    const paidElement =
        document.getElementById(
            "exitPaidAmount"
        );

    const paymentElement =
        document.getElementById(
            "exitPaymentMethod"
        );

    const remarkElement =
        document.getElementById(
            "exitRemark"
        );


    const amount =
        Number(
            amountElement?.value || 0
        );

    const paid =
        Number(
            paidElement?.value || 0
        );

    const paymentMethod =
        paymentElement?.value || "";

    const remark =
        remarkElement?.value.trim() || "";


    // =================================================
    // VALIDATION
    // =================================================

    if (amount < 0) {

        alert(
            "Service amount cannot be negative."
        );

        return;
    }


    if (paid < 0) {

        alert(
            "Amount received cannot be negative."
        );

        return;
    }


    if (paid > amount) {

        alert(
            "Amount received cannot be greater than the service amount."
        );

        return;
    }


    if (
        paid > 0 &&
        !paymentMethod
    ) {

        alert(
            "Please select CASH or PHONEPE."
        );

        return;
    }


    const balance =
        Math.max(
            0,
            amount - paid
        );


    // =================================================
    // EXIT TIME
    // =================================================

    const now =
        new Date();

    const exitTime =
        formatGoogleDateTime(now);


    // =================================================
    // SEND TO GOOGLE SHEETS
    // =================================================

    try {

        if (
            !API_URL ||
            API_URL ===
            "PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE"
        ) {

            alert(
                "Google Apps Script URL is not configured."
            );

            return;
        }


        const payload = {

            action:
                "exit",

            id:
                selectedVehicleId,

            amount:
                amount,

            paidAmount:
                paid,

            balance:
                balance,

            paymentMethod:
                paymentMethod,

            exitTime:
                exitTime,

            remark:
                remark,

            status:
                "Completed"
        };


        console.log(
            "EXIT REQUEST:",
            payload
        );


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
                        JSON.stringify(
                            payload
                        )
                }
            );


        const data =
            await response.json();


        console.log(
            "EXIT RESPONSE:",
            data
        );


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.message ||
                "Vehicle exit failed."
            );
        }


        // =================================================
        // CLOSE EXIT MODAL
        // =================================================

        closeExitModal();


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            "Vehicle exit completed successfully."
        );


        // =================================================
        // REFRESH ACTIVE VEHICLES
        // =================================================

        await loadActiveVehicles();

    }
    catch (error) {

        console.error(
            "EXIT ERROR:",
            error
        );

        alert(
            "Vehicle exit failed:\n\n" +
            error.message
        );
    }
}


// =====================================================
// FORMAT GOOGLE DATE/TIME
// =====================================================

function formatGoogleDateTime(date) {

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const year =
        date.getFullYear();

    const hours =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );

    const seconds =
        String(
            date.getSeconds()
        ).padStart(
            2,
            "0"
        );


    return (
        day +
        "/" +
        month +
        "/" +
        year +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
    );
}


// =====================================================
// PARSE GOOGLE DATE
// =====================================================

function parseGoogleDate(value) {

    if (!value) {
        return null;
    }


    if (value instanceof Date) {

        return value;
    }


    if (
        typeof value === "number"
    ) {

        return new Date(value);
    }


    const text =
        String(value).trim();


    if (!text) {
        return null;
    }


    // =================================================
    // DD/MM/YYYY HH:MM:SS
    // =================================================

    const match =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
        );


    if (match) {

        const day =
            Number(match[1]);

        const month =
            Number(match[2]) - 1;

        const year =
            Number(match[3]);

        const hour =
            Number(match[4] || 0);

        const minute =
            Number(match[5] || 0);

        const second =
            Number(match[6] || 0);


        return new Date(
            year,
            month,
            day,
            hour,
            minute,
            second
        );
    }


    // =================================================
    // YYYY-MM-DD HH:MM:SS
    // =================================================

    const isoLike =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
        );


    if (isoLike) {

        const year =
            Number(isoLike[1]);

        const month =
            Number(isoLike[2]) - 1;

        const day =
            Number(isoLike[3]);

        const hour =
            Number(isoLike[4] || 0);

        const minute =
            Number(isoLike[5] || 0);

        const second =
            Number(isoLike[6] || 0);


        return new Date(
            year,
            month,
            day,
            hour,
            minute,
            second
        );
    }


    // =================================================
    // NORMAL ISO DATE
    // =================================================

    const parsed =
        new Date(text);


    if (
        !isNaN(
            parsed.getTime()
        )
    ) {

        return parsed;
    }


    return null;
}


// =====================================================
// DATE VALUE
// =====================================================

function getDateValue(value) {

    const date =
        parseGoogleDate(value);


    if (!date) {
        return 0;
    }


    return date.getTime();
}


// =====================================================
// CLEAR SEARCH
// =====================================================

function clearSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.value = "";
    }


    loadActiveVehicles();
}


// =====================================================
// GO DASHBOARD
// =====================================================

function goDashboard() {

    window.location.href =
        "owner-dashboard.html";
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// =====================================================
// ESCAPE ATTRIBUTE
// =====================================================

function escapeAttribute(value) {

    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        );
}


// =====================================================
// CLOSE MODAL OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "exitModal"
            );


        if (
            modal &&
            event.target === modal &&
            modal.classList.contains("show")
        ) {

            closeExitModal();
        }

    }
);


// =====================================================
// CONNECTION ERROR
// =====================================================

function showConnectionError(
    message
) {

    const table =
        document.getElementById(
            "activeVehicleTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>

            <td
                colspan="13"
                class="empty-row"
            >

                <strong>
                    Cannot connect to Google Sheets.
                </strong>

                <br>
                <br>

                ${escapeHtml(
                    message ||
                    "Please check your Apps Script URL."
                )}

            </td>

        </tr>
    `;


    const vehicleCount =
        document.getElementById(
            "vehicleCount"
        );


    if (vehicleCount) {

        vehicleCount.textContent =
            "Connection error";
    }


    updateStats(
        0,
        0,
        0,
        0
    );
}