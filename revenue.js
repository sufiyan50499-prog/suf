
// =====================================================
// A1 CAR DETAILING FACTORY
// REVENUE MANAGEMENT
// GOOGLE SHEETS CONNECTED VERSION
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

    setToday();

});


// =====================================================
// LOGIN CHECK
// =====================================================

function checkLogin() {

    const loggedIn =
        sessionStorage.getItem("a1LoggedIn");

    if (loggedIn !== "true") {

        window.location.href = "login.html";

        return false;

    }

    return true;

}


// =====================================================
// GET VEHICLES FROM GOOGLE SHEETS
// =====================================================

async function getVehicles() {

    try {

        const url =
            API_URL +
            "?action=getVehicles&t=" +
            Date.now();


        console.log(
            "Loading vehicles from Google Sheets..."
        );


        const response =
            await fetch(url, {
                method: "GET",
                cache: "no-store"
            });


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


        if (
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Google Sheets returned an error."
            );

        }


        // ---------------------------------------------
        // SUPPORT DIFFERENT RESPONSE FORMATS
        // ---------------------------------------------

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


        // If Apps Script directly returns array

        if (
            Array.isArray(data)
        ) {

            return data;

        }


        return [];

    }

    catch (error) {

        console.error(
            "GOOGLE SHEETS ERROR:",
            error
        );


        showConnectionError(
            error.message
        );


        return [];

    }

}


// =====================================================
// SET TODAY
// =====================================================

function setToday() {

    const today =
        getLocalDateString();


    const fromDate =
        document.getElementById(
            "fromDate"
        );


    const toDate =
        document.getElementById(
            "toDate"
        );


    if (fromDate) {

        fromDate.value =
            today;

    }


    if (toDate) {

        toDate.value =
            today;

    }


    loadRevenue();

}


// =====================================================
// LOAD REVENUE
// =====================================================

async function loadRevenue() {

    showLoading();


    const allVehicles =
        await getVehicles();


    const fromDate =
        document.getElementById(
            "fromDate"
        )?.value || "";


    const toDate =
        document.getElementById(
            "toDate"
        )?.value || "";


    const paymentFilter =
        document.getElementById(
            "paymentFilter"
        )?.value || "all";


    // =================================================
    // ONLY COMPLETED VEHICLES
    // =================================================

    let records =
        allVehicles.filter(function (vehicle) {

            return (
                normalizeStatus(
                    vehicle.status
                ) === "Completed"
            );

        });


    // =================================================
    // DATE FILTER
    // =================================================

    if (fromDate) {

        records =
            records.filter(function (vehicle) {

                const date =
                    normalizeDate(
                        getDate(vehicle)
                    );


                return (
                    date &&
                    date >= fromDate
                );

            });

    }


    if (toDate) {

        records =
            records.filter(function (vehicle) {

                const date =
                    normalizeDate(
                        getDate(vehicle)
                    );


                return (
                    date &&
                    date <= toDate
                );

            });

    }


    // =================================================
    // PAYMENT FILTER
    // =================================================

    if (
        paymentFilter !== "all"
    ) {

        records =
            records.filter(function (vehicle) {

                return (
                    getPayment(vehicle)
                        .toUpperCase()
                    ===
                    paymentFilter.toUpperCase()
                );

            });

    }


    // =================================================
    // NEWEST FIRST
    // =================================================

    records.sort(function (a, b) {

        const dateA =
            normalizeDate(
                getDate(a)
            );


        const dateB =
            normalizeDate(
                getDate(b)
            );


        if (dateA === dateB) {

            return (
                getExitTime(b)
                    .localeCompare(
                        getExitTime(a)
                    )
            );

        }


        return dateB.localeCompare(
            dateA
        );

    });


    displayRevenue(records);

}


// =====================================================
// DISPLAY REVENUE
// =====================================================

function displayRevenue(records) {

    const table =
        document.getElementById(
            "revenueTable"
        );


    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );


    const recordCount =
        document.getElementById(
            "recordCount"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    let totalService = 0;

    let totalReceived = 0;

    let totalBalance = 0;

    let cash = 0;

    let phonePe = 0;


    // =================================================
    // EMPTY
    // =================================================

    if (
        records.length === 0
    ) {

        if (emptyMessage) {

            emptyMessage.style.display =
                "block";

        }


        if (recordCount) {

            recordCount.textContent =
                "0 records";

        }


        updateStats(
            0,
            0,
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
    // CREATE TABLE ROWS
    // =================================================

    records.forEach(
        function (vehicle, index) {

            const amount =
                getAmount(vehicle);


            const paid =
                getPaid(vehicle);


            const balance =
                getBalance(vehicle);


            const payment =
                getPayment(vehicle);


            const paymentUpper =
                String(payment)
                    .toUpperCase();


            totalService +=
                amount;


            totalReceived +=
                paid;


            totalBalance +=
                balance;


            // -----------------------------------------
            // CASH
            // -----------------------------------------

            if (
                paymentUpper === "CASH"
            ) {

                cash += paid;

            }


            // -----------------------------------------
            // PHONEPE
            // -----------------------------------------

            if (
                paymentUpper === "PHONEPE"
            ) {

                phonePe += paid;

            }


            let paymentClass = "";


            if (
                paymentUpper === "CASH"
            ) {

                paymentClass =
                    "cash";

            }


            else if (
                paymentUpper === "PHONEPE"
            ) {

                paymentClass =
                    "phonepe";

            }


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
                        getService(vehicle)
                        || "-"
                    )}
                </td>


                <td>
                    ${formatRupee(amount)}
                </td>


                <td class="received">
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
    // RECORD COUNT
    // =================================================

    if (recordCount) {

        recordCount.textContent =
            `${records.length} record${
                records.length === 1
                    ? ""
                    : "s"
            }`;

    }


    // =================================================
    // UPDATE STATISTICS
    // =================================================

    updateStats(
        records.length,
        totalService,
        totalReceived,
        totalBalance,
        cash,
        phonePe
    );

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStats(
    completedVehicles,
    totalService,
    totalReceived,
    totalBalance,
    cash,
    phonePe
) {

    const completedElement =
        document.getElementById(
            "completedVehicles"
        );


    if (completedElement) {

        completedElement.textContent =
            completedVehicles;

    }


    const totalServiceElement =
        document.getElementById(
            "totalServiceAmount"
        );


    if (totalServiceElement) {

        totalServiceElement.textContent =
            formatRupee(
                totalService
            );

    }


    const totalReceivedElement =
        document.getElementById(
            "totalReceived"
        );


    if (totalReceivedElement) {

        totalReceivedElement.textContent =
            formatRupee(
                totalReceived
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


    const cashElement =
        document.getElementById(
            "cashAmount"
        );


    if (cashElement) {

        cashElement.textContent =
            formatRupee(
                cash
            );

    }


    const phonePeElement =
        document.getElementById(
            "phonePeAmount"
        );


    if (phonePeElement) {

        phonePeElement.textContent =
            formatRupee(
                phonePe
            );

    }


    const paymentTotalElement =
        document.getElementById(
            "paymentTotal"
        );


    if (paymentTotalElement) {

        paymentTotalElement.textContent =
            formatRupee(
                cash + phonePe
            );

    }

}


// =====================================================
// SHOW LOADING
// =====================================================

function showLoading() {

    const table =
        document.getElementById(
            "revenueTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td
                colspan="11"
                class="empty-row"
            >
                Loading revenue from Google Sheets...
            </td>
        </tr>
    `;

}


// =====================================================
// CLEAR FILTERS
// =====================================================

function clearFilters() {

    const fromDate =
        document.getElementById(
            "fromDate"
        );


    const toDate =
        document.getElementById(
            "toDate"
        );


    const paymentFilter =
        document.getElementById(
            "paymentFilter"
        );


    if (fromDate) {

        fromDate.value = "";

    }


    if (toDate) {

        toDate.value = "";

    }


    if (paymentFilter) {

        paymentFilter.value =
            "all";

    }


    loadRevenue();

}


// =====================================================
// DASHBOARD
// =====================================================

function goDashboard() {

    window.location.href =
        "owner-dashboard.html";

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


    return String(
        status || ""
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
// SERVICE
// =====================================================

function getService(vehicle) {

    const service =
        String(
            vehicle.serviceType ||
            vehicle.service_type ||
            vehicle.service ||
            ""
        ).trim();


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

    return (
        vehicle.date ||
        vehicle.entryDate ||
        vehicle.entry_date ||
        vehicle.exitDate ||
        vehicle.exit_date ||
        vehicle.entryTime ||
        vehicle.entry_time ||
        vehicle.exitTime ||
        vehicle.exit_time ||
        ""
    );

}


// =====================================================
// EXIT TIME
// =====================================================

function getExitTime(vehicle) {

    return String(
        vehicle.exitTime ||
        vehicle.exit_time ||
        ""
    );

}


// =====================================================
// AMOUNT
// =====================================================

function getAmount(vehicle) {

    return Number(
        vehicle.amount ??
        vehicle.totalAmount ??
        vehicle.total_amount ??
        vehicle.serviceAmount ??
        vehicle.service_amount ??
        0
    ) || 0;

}


// =====================================================
// PAID
// =====================================================

function getPaid(vehicle) {

    return Number(
        vehicle.paidAmount ??
        vehicle.paid_amount ??
        vehicle.amountReceived ??
        vehicle.amount_received ??
        vehicle.paid ??
        vehicle.receivedAmount ??
        vehicle.received_amount ??
        0
    ) || 0;

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


    return Math.max(
        0,
        getAmount(vehicle) -
        getPaid(vehicle)
    );

}


// =====================================================
// PAYMENT
// =====================================================

function getPayment(vehicle) {

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
// RUPEE FORMAT
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
// LOCAL DATE
// =====================================================

function getLocalDateString(
    date = new Date()
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


// =====================================================
// NORMALIZE DATE
// =====================================================

function normalizeDate(value) {

    if (!value) {

        return "";

    }


    const text =
        String(value)
            .trim();


    // ---------------------------------------------
    // YYYY-MM-DD
    // ---------------------------------------------

    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(text)
    ) {

        return text;

    }


    // ---------------------------------------------
    // DD/MM/YYYY
    // ---------------------------------------------

    const slashMatch =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
        );


    if (slashMatch) {

        const day =
            slashMatch[1]
                .padStart(
                    2,
                    "0"
                );


        const month =
            slashMatch[2]
                .padStart(
                    2,
                    "0"
                );


        const year =
            slashMatch[3];


        return (
            year +
            "-" +
            month +
            "-" +
            day
        );

    }


    // ---------------------------------------------
    // DD-MM-YYYY
    // ---------------------------------------------

    const dashMatch =
        text.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})/
        );


    if (dashMatch) {

        const day =
            dashMatch[1]
                .padStart(
                    2,
                    "0"
                );


        const month =
            dashMatch[2]
                .padStart(
                    2,
                    "0"
                );


        const year =
            dashMatch[3];


        return (
            year +
            "-" +
            month +
            "-" +
            day
        );

    }


    // ---------------------------------------------
    // GOOGLE DATE / JAVASCRIPT DATE
    // ---------------------------------------------

    const parsed =
        new Date(text);


    if (
        !isNaN(
            parsed.getTime()
        )
    ) {

        return getLocalDateString(
            parsed
        );

    }


    return text;

}


// =====================================================
// CLEAR SEARCH / FILTER
// =====================================================

function resetFilters() {

    clearFilters();

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

function showConnectionError(
    message
) {

    const table =
        document.getElementById(
            "revenueTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `

        <tr>

            <td
                colspan="11"
                class="empty-row"
            >

                <strong>
                    Cannot connect to Google Sheets.
                </strong>

                <br>
                <br>

                ${escapeHtml(
                    message ||
                    "Please check your Apps Script URL and backend."
                )}

            </td>

        </tr>

    `;


    const recordCount =
        document.getElementById(
            "recordCount"
        );


    if (recordCount) {

        recordCount.textContent =
            "Connection error";

    }


    updateStats(
        0,
        0,
        0,
        0,
        0,
        0
    );

}

