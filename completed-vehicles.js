
// =====================================================
// A1 CAR DETAILING FACTORY
// COMPLETED VEHICLES
// GOOGLE SHEETS CONNECTED VERSION
// NO AUTO PAGE REFRESH
// =====================================================


// =====================================================
// GOOGLE APPS SCRIPT URL
// =====================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwoKohiflL0GrN8fqjZyzo-z16EA3m4Q8hqWavbc8oH1iL7W3rOQ6K1M-WLH6UiUFU8/exec";


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    if (!checkLogin()) {
        return;
    }

    loadCompletedVehicles();


    // SEARCH
    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            loadCompletedVehicles
        );

    }


    // SERVICE FILTER
    const serviceFilter =
        document.getElementById("serviceFilter");

    if (serviceFilter) {

        serviceFilter.addEventListener(
            "change",
            loadCompletedVehicles
        );

    }

});


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

        if (!API_URL) {

            throw new Error(
                "Google Apps Script URL is not configured."
            );

        }


        const url =
            API_URL +
            "?action=getVehicles&t=" +
            Date.now();


        console.log(
            "GET VEHICLES:",
            url
        );


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
                "HTTP Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "GOOGLE SHEET RESPONSE:",
            data
        );


        if (!data) {

            throw new Error(
                "Empty response from Google Sheets."
            );

        }


        // -------------------------------------------------
        // SUCCESS RESPONSE
        // -------------------------------------------------

        if (
            data.success === true
        ) {

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


            if (
                Array.isArray(data.rows)
            ) {

                return data.rows;

            }


            return [];

        }


        // -------------------------------------------------
        // DIRECT ARRAY RESPONSE
        // -------------------------------------------------

        if (
            Array.isArray(data)
        ) {

            return data;

        }


        throw new Error(
            data.message ||
            "Google Sheet returned an invalid response."
        );

    }

    catch (error) {

        console.error(
            "GOOGLE SHEET ERROR:",
            error
        );


        showConnectionError(
            error.message
        );


        return [];

    }

}


// =====================================================
// LOAD COMPLETED VEHICLES
// =====================================================

async function loadCompletedVehicles() {

    const table =
        document.getElementById(
            "completedVehicleTable"
        );


    if (table) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="15"
                    class="empty-row"
                >
                    Loading completed vehicles...
                </td>
            </tr>
        `;

    }


    const vehicles =
        await getVehicles();


    // =================================================
    // SEARCH
    // =================================================

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
    // SERVICE FILTER
    // =================================================

    const serviceFilter =
        document.getElementById(
            "serviceFilter"
        );


    const selectedService =
        serviceFilter?.value ||
        "all";


    // =================================================
    // ONLY COMPLETED VEHICLES
    // =================================================

    let completedVehicles =
        vehicles.filter(
            function (vehicle) {

                return (
                    normalizeStatus(
                        vehicle.status
                    ) === "Completed"
                );

            }
        );


    // =================================================
    // SEARCH FILTER
    // =================================================

    if (search) {

        completedVehicles =
            completedVehicles.filter(
                function (vehicle) {

                    const vehicleNumber =
                        getVehicleNumber(
                            vehicle
                        )
                        .toLowerCase();


                    const owner =
                        getOwnerName(
                            vehicle
                        )
                        .toLowerCase();


                    const phone =
                        getPhone(
                            vehicle
                        )
                        .toLowerCase();


                    const vehicleName =
                        getVehicleName(
                            vehicle
                        )
                        .toLowerCase();


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
    // SERVICE FILTER
    // =================================================

    if (
        selectedService !== "all"
    ) {

        completedVehicles =
            completedVehicles.filter(
                function (vehicle) {

                    return (
                        getService(vehicle)
                        === selectedService
                    );

                }
            );

    }


    // =================================================
    // NEWEST EXIT FIRST
    // =================================================

    completedVehicles.sort(
        function (a, b) {

            const dateA =
                getDateValue(
                    getExitDateTime(a)
                );


            const dateB =
                getDateValue(
                    getExitDateTime(b)
                );


            return dateB - dateA;

        }
    );


    displayCompletedVehicles(
        completedVehicles
    );

}


// =====================================================
// DISPLAY COMPLETED VEHICLES
// =====================================================

function displayCompletedVehicles(
    vehicles
) {

    const table =
        document.getElementById(
            "completedVehicleTable"
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


    let totalAmount = 0;

    let totalPaid = 0;

    let totalBalance = 0;


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
    // CREATE ROWS
    // =================================================

    vehicles.forEach(
        function (vehicle, index) {

            const amount =
                getAmount(vehicle);


            const paid =
                getPaidAmount(vehicle);


            const balance =
                getBalance(vehicle);


            const payment =
                getPaymentMethod(vehicle);


            totalAmount +=
                amount;


            totalPaid +=
                paid;


            totalBalance +=
                balance;


            // -------------------------------------------------
            // PAYMENT CLASS
            // -------------------------------------------------

            let paymentClass = "";


            const paymentUpper =
                String(payment || "")
                    .toUpperCase();


            if (
                paymentUpper === "CASH"
            ) {

                paymentClass =
                    "payment-cash";

            }


            if (
                paymentUpper === "PHONEPE"
            ) {

                paymentClass =
                    "payment-phonepe";

            }


            // -------------------------------------------------
            // CREATE ROW
            // -------------------------------------------------

            const row =
                document.createElement(
                    "tr"
                );


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
                            getVehicleNumber(vehicle)
                            || "-"
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(
                        getOwnerName(vehicle)
                        || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        getPhone(vehicle)
                        || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        getVehicleName(vehicle)
                        || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        getService(vehicle)
                        || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        getEntryTime(vehicle)
                        || "-"
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

                <td class="${paymentClass}">

                    ${escapeHtml(
                        payment || "-"
                    )}

                </td>

                <td>
                    ${escapeHtml(
                        getExitTime(vehicle)
                        || "-"
                    )}
                </td>

                <td>

                    <span
                        class="status-badge status-completed"
                    >
                        ✅ Completed
                    </span>

                </td>

                <td>
                    ${escapeHtml(
                        getRemark(vehicle)
                        || "-"
                    )}
                </td>

            `;


            table.appendChild(row);

        }
    );


    // =================================================
    // COUNT
    // =================================================

    if (vehicleCount) {

        vehicleCount.textContent =
            `${vehicles.length} vehicle${
                vehicles.length === 1
                    ? ""
                    : "s"
            }`;

    }


    // =================================================
    // STATS
    // =================================================

    updateStats(
        vehicles.length,
        totalAmount,
        totalPaid,
        totalBalance
    );

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStats(
    completedCount,
    totalAmount,
    totalPaid,
    totalBalance
) {

    const completedCountElement =
        document.getElementById(
            "completedCount"
        );


    if (completedCountElement) {

        completedCountElement.textContent =
            completedCount;

    }


    const totalAmountElement =
        document.getElementById(
            "totalAmount"
        );


    if (totalAmountElement) {

        totalAmountElement.textContent =
            formatRupee(
                totalAmount
            );

    }


    const totalPaidElement =
        document.getElementById(
            "totalPaid"
        );


    if (totalPaidElement) {

        totalPaidElement.textContent =
            formatRupee(
                totalPaid
            );

    }


    const totalBalanceElement =
        document.getElementById(
            "totalBalance"
        );


    if (totalBalanceElement) {

        totalBalanceElement.textContent =
            formatRupee(
                totalBalance
            );

    }

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
        value === "completed" ||
        value === "complete" ||
        value === "exited"
    ) {

        return "Completed";

    }


    if (
        value === "inside" ||
        value === "inside showroom" ||
        value === "active" ||
        value === "washing"
    ) {

        return "Inside";

    }


    return String(status || "");

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
// OWNER NAME
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


    if (
        lower === "full wash"
    ) {

        return "Full Body Wash";

    }


    if (
        lower === "body wash"
    ) {

        return "Exterior Wash";

    }


    if (
        lower === "ceramic coating"
    ) {

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
// EXIT TIME
// =====================================================

function getExitTime(vehicle) {

    const value =
        vehicle.exitTime ||
        vehicle.exit_time ||
        vehicle.exitDate ||
        vehicle.exit_date ||
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
// EXIT DATE/TIME FOR SORTING
// =====================================================

function getExitDateTime(vehicle) {

    return (
        vehicle.exitTime ||
        vehicle.exit_time ||
        vehicle.exitDate ||
        vehicle.exit_date ||
        vehicle.updatedAt ||
        vehicle.entryTime ||
        ""
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
// PAYMENT METHOD
// =====================================================

function getPaymentMethod(vehicle) {

    return String(
        vehicle.paymentMethod ||
        vehicle.payment_method ||
        vehicle.payment ||
        ""
    );

}


// =====================================================
// REMARK
// =====================================================

function getRemark(vehicle) {

    return String(
        vehicle.remark ||
        vehicle.remarks ||
        ""
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
// PARSE GOOGLE DATE
// =====================================================

function parseGoogleDate(value) {

    if (!value) {
        return null;
    }


    if (
        value instanceof Date
    ) {

        return value;

    }


    if (
        typeof value === "number"
    ) {

        const date =
            new Date(value);

        return isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    const text =
        String(value).trim();


    if (!text) {
        return null;
    }


    // -------------------------------------------------
    // DD/MM/YYYY HH:MM:SS
    // -------------------------------------------------

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


        const date =
            new Date(
                year,
                month,
                day,
                hour,
                minute,
                second
            );


        return isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    // -------------------------------------------------
    // GOOGLE / ISO DATE
    // -------------------------------------------------

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
// CLEAR FILTERS
// =====================================================

function clearFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.value = "";

    }


    const serviceFilter =
        document.getElementById(
            "serviceFilter"
        );


    if (serviceFilter) {

        serviceFilter.value =
            "all";

    }


    loadCompletedVehicles();

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
// GOOGLE SHEET CONNECTION ERROR
// =====================================================

function showConnectionError(message) {

    const table =
        document.getElementById(
            "completedVehicleTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `

        <tr>

            <td
                colspan="15"
                class="empty-row"
            >

                <strong>
                    Cannot connect to Google Sheets.
                </strong>

                <br><br>

                ${escapeHtml(
                    message ||
                    "Please check your Apps Script URL and backend."
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

