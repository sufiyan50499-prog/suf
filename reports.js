
/* =====================================================
   A1 CAR DETAILING FACTORY
   DAILY / MONTHLY REPORTS
   GOOGLE SHEETS CONNECTED VERSION
   ===================================================== */


/* =====================================================
   GOOGLE APPS SCRIPT URL
   ===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbwoKohiflL0GrN8fqjZyzo-z16EA3m4Q8hqWavbc8oH1iL7W3rOQ6K1M-WLH6UiUFU8/exec";


/* =====================================================
   LOGIN CHECK
   ===================================================== */

function checkOwnerLogin() {

    const loggedIn =
        sessionStorage.getItem("a1LoggedIn");

    const role =
        sessionStorage.getItem("a1Role") ||
        sessionStorage.getItem("a1UserRole") ||
        localStorage.getItem("a1Role") ||
        localStorage.getItem("a1UserRole");

    if (loggedIn !== "true") {

        window.location.href = "login.html";

        return false;
    }

    if (role && role !== "owner") {

        alert(
            "Only the owner can access reports."
        );

        window.location.href =
            "add-vehicle.html";

        return false;
    }

    return true;
}


/* =====================================================
   GET VEHICLES FROM GOOGLE SHEETS
   ===================================================== */

async function getVehicles() {

    try {

        if (!API_URL) {

            throw new Error(
                "Google Apps Script URL is missing."
            );
        }

        const url =
            API_URL +
            "?action=getVehicles&t=" +
            Date.now();

        console.log(
            "Loading vehicles from Google Sheets..."
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
                "Google Sheets HTTP error: " +
                response.status
            );
        }

        const data =
            await response.json();

        console.log(
            "GOOGLE SHEETS RESPONSE:",
            data
        );

        if (!data) {

            throw new Error(
                "Empty response from Google Sheets."
            );
        }

        if (data.success === false) {

            throw new Error(
                data.message ||
                "Google Sheets returned an error."
            );
        }

        if (
            Array.isArray(
                data.vehicles
            )
        ) {

            return data.vehicles;
        }

        if (
            Array.isArray(
                data.records
            )
        ) {

            return data.records;
        }

        if (
            Array.isArray(
                data.data
            )
        ) {

            return data.data;
        }

        if (
            Array.isArray(
                data.rows
            )
        ) {

            return data.rows;
        }

        if (
            Array.isArray(
                data.values
            )
        ) {

            return data.values;
        }

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


/* =====================================================
   CONNECTION ERROR
   ===================================================== */

function showConnectionError(message) {

    const table =
        document.getElementById(
            "vehicleTable"
        );

    if (!table) {
        return;
    }

    table.innerHTML = `

        <tr>

            <td
                colspan="14"
                class="empty"
            >

                <strong>
                    Cannot connect to Google Sheets.
                </strong>

                <br><br>

                ${escapeHTML(
                    message ||
                    "Please check your Google Apps Script."
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

    resetReportStats();
}


/* =====================================================
   RESET REPORT STATS
   ===================================================== */

function resetReportStats() {

    const ids = [

        "totalVehicles",
        "completedVehicles",
        "activeVehicles"

    ];

    ids.forEach(
        function (id) {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    "0";
            }

        }
    );


    const moneyIds = [

        "serviceAmount",
        "receivedAmount",
        "pendingAmount",
        "cashAmount",
        "phonePeAmount",
        "totalReceived"

    ];

    moneyIds.forEach(
        function (id) {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    money(0);
            }

        }
    );


    const serviceTable =
        document.getElementById(
            "serviceTable"
        );

    if (serviceTable) {

        serviceTable.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty"
                >

                    No service data available

                </td>

            </tr>

        `;
    }
}


/* =====================================================
   NORMALIZE STATUS
   ===================================================== */

function normalizeStatus(record) {

    const status =
        String(
            record.status || ""
        )
        .trim()
        .toLowerCase();


    if (
        status === "completed" ||
        status === "complete" ||
        status === "exited"
    ) {

        return "Completed";
    }


    if (
        status === "inside" ||
        status === "inside showroom" ||
        status === "active" ||
        status === "washing"
    ) {

        return "Inside";
    }


    return "Inside";
}


/* =====================================================
   NORMALIZE SERVICE
   ===================================================== */

function normalizeService(record) {

    const service =
        record.serviceType ||
        record.service_type ||
        record.service ||
        "";

    const value =
        String(service).trim();

    const lower =
        value.toLowerCase();


    if (
        lower === "full wash" ||
        lower === "full body wash"
    ) {

        return "Full Body Wash";
    }


    if (
        lower === "body wash" ||
        lower === "exterior wash"
    ) {

        return "Exterior Wash";
    }


    if (
        lower === "ceramic coating" ||
        lower === "detailing"
    ) {

        return "Detailing";
    }


    return value || "Other";
}


/* =====================================================
   VEHICLE NUMBER
   ===================================================== */

function getVehicleNumber(record) {

    return (
        record.vehicleNumber ||
        record.vehicle_number ||
        record.number ||
        record.registrationNumber ||
        "-"
    );
}


/* =====================================================
   OWNER
   ===================================================== */

function getOwnerName(record) {

    return (
        record.ownerName ||
        record.owner_name ||
        record.owner ||
        "-"
    );
}


/* =====================================================
   PHONE
   ===================================================== */

function getPhone(record) {

    return (
        record.phone ||
        record.phoneNumber ||
        record.mobile ||
        "-"
    );
}


/* =====================================================
   VEHICLE NAME
   ===================================================== */

function getVehicleName(record) {

    return (
        record.vehicleName ||
        record.vehicle_name ||
        record.vehicleType ||
        record.vehicle_type ||
        "-"
    );
}


/* =====================================================
   DATE
   ===================================================== */

function getRecordDate(record) {

    const possibleValues = [

        record.exitDate,
        record.exit_date,
        record.date,
        record.entryDate,
        record.entry_date

    ];


    for (
        let i = 0;
        i < possibleValues.length;
        i++
    ) {

        const value =
            possibleValues[i];

        if (!value) {
            continue;
        }

        const normalized =
            normalizeDate(value);

        if (normalized) {

            return normalized;
        }
    }


    const timeValues = [

        record.exitTime,
        record.exit_time,
        record.entryTime,
        record.entry_time

    ];


    for (
        let i = 0;
        i < timeValues.length;
        i++
    ) {

        const value =
            timeValues[i];

        if (!value) {
            continue;
        }

        const normalized =
            normalizeDate(value);

        if (normalized) {

            return normalized;
        }
    }


    return "";
}


/* =====================================================
   ENTRY TIME
   ===================================================== */

function getEntryTime(record) {

    return (
        record.entryTime ||
        record.entry_time ||
        "-"
    );
}


/* =====================================================
   EXIT TIME
   ===================================================== */

function getExitTime(record) {

    return (
        record.exitTime ||
        record.exit_time ||
        "-"
    );
}


/* =====================================================
   AMOUNT
   ===================================================== */

function getAmount(record) {

    return Number(
        record.amount ??
        record.serviceAmount ??
        record.service_amount ??
        record.totalAmount ??
        record.total_amount ??
        0
    ) || 0;
}


/* =====================================================
   RECEIVED
   ===================================================== */

function getReceived(record) {

    return Number(
        record.paidAmount ??
        record.paid_amount ??
        record.receivedAmount ??
        record.received_amount ??
        record.amountReceived ??
        record.amount_received ??
        record.paid ??
        0
    ) || 0;
}


/* =====================================================
   BALANCE
   ===================================================== */

function getBalance(record) {

    const explicitBalance =
        record.balance;


    if (
        explicitBalance !== undefined &&
        explicitBalance !== null &&
        explicitBalance !== ""
    ) {

        return Number(
            explicitBalance
        ) || 0;
    }


    return Math.max(
        0,
        getAmount(record) -
        getReceived(record)
    );
}


/* =====================================================
   PAYMENT METHOD
   ===================================================== */

function getPaymentMethod(record) {

    return (
        record.paymentMethod ||
        record.payment_method ||
        record.payment ||
        "-"
    )
    .toString()
    .trim()
    .toUpperCase();
}


/* =====================================================
   REMARK
   ===================================================== */

function getRemark(record) {

    return (
        record.remark ||
        record.remarks ||
        "-"
    );
}


/* =====================================================
   MONEY
   ===================================================== */

function money(value) {

    return (
        "₹" +
        Number(
            value || 0
        )
        .toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        )
    );
}


/* =====================================================
   NORMALIZE DATE
   ===================================================== */

function normalizeDate(value) {

    if (!value) {
        return "";
    }

    const text =
        String(value).trim();


    /* YYYY-MM-DD */

    const isoMatch =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );


    if (isoMatch) {

        return (
            isoMatch[1] +
            "-" +
            String(
                isoMatch[2]
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                isoMatch[3]
            ).padStart(
                2,
                "0"
            )
        );
    }


    /* DD/MM/YYYY */

    const slashMatch =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
        );


    if (slashMatch) {

        const day =
            String(
                slashMatch[1]
            ).padStart(
                2,
                "0"
            );

        const month =
            String(
                slashMatch[2]
            ).padStart(
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


    /* DD-MM-YYYY */

    const dashMatch =
        text.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})/
        );


    if (dashMatch) {

        const day =
            String(
                dashMatch[1]
            ).padStart(
                2,
                "0"
            );

        const month =
            String(
                dashMatch[2]
            ).padStart(
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


    /* JavaScript / Google Date */

    const parsed =
        new Date(text);


    if (
        !isNaN(
            parsed.getTime()
        )
    ) {

        return (
            parsed.getFullYear() +
            "-" +
            String(
                parsed.getMonth() + 1
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                parsed.getDate()
            ).padStart(
                2,
                "0"
            )
        );
    }


    return "";
}


/* =====================================================
   FORMAT DATE
   ===================================================== */

function formatDate(date) {

    if (!date) {
        return "-";
    }


    const parts =
        String(date).split("-");


    if (parts.length === 3) {

        return (
            parts[2] +
            "-" +
            parts[1] +
            "-" +
            parts[0]
        );
    }


    return date;
}


/* =====================================================
   TODAY
   ===================================================== */

function getToday() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
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


/* =====================================================
   CURRENT MONTH
   ===================================================== */

function getCurrentMonth() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month
    );
}


/* =====================================================
   CHANGE REPORT TYPE
   ===================================================== */

function changeReportType() {

    const type =
        document.getElementById(
            "reportType"
        ).value;


    const dailyGroup =
        document.getElementById(
            "dailyGroup"
        );


    const monthlyGroup =
        document.getElementById(
            "monthlyGroup"
        );


    const customFromGroup =
        document.getElementById(
            "customFromGroup"
        );


    const customToGroup =
        document.getElementById(
            "customToGroup"
        );


    if (dailyGroup) {

        dailyGroup.classList.add(
            "hidden"
        );
    }


    if (monthlyGroup) {

        monthlyGroup.classList.add(
            "hidden"
        );
    }


    if (customFromGroup) {

        customFromGroup.classList.add(
            "hidden"
        );
    }


    if (customToGroup) {

        customToGroup.classList.add(
            "hidden"
        );
    }


    if (type === "daily") {

        if (dailyGroup) {

            dailyGroup.classList.remove(
                "hidden"
            );
        }
    }


    if (type === "monthly") {

        if (monthlyGroup) {

            monthlyGroup.classList.remove(
                "hidden"
            );
        }
    }


    if (type === "custom") {

        if (customFromGroup) {

            customFromGroup.classList.remove(
                "hidden"
            );
        }


        if (customToGroup) {

            customToGroup.classList.remove(
                "hidden"
            );
        }
    }


    generateReport();
}


/* =====================================================
   GET SELECTED RECORDS
   ===================================================== */

async function getFilteredRecords() {

    const vehicles =
        await getVehicles();


    const type =
        document.getElementById(
            "reportType"
        ).value;


    let filtered = [];


    if (type === "daily") {

        const selectedDate =
            document.getElementById(
                "reportDate"
            ).value;


        filtered =
            vehicles.filter(
                function (record) {

                    return (
                        getRecordDate(record) ===
                        selectedDate
                    );
                }
            );
    }


    else if (type === "monthly") {

        const selectedMonth =
            document.getElementById(
                "reportMonth"
            ).value;


        filtered =
            vehicles.filter(
                function (record) {

                    return (
                        getRecordDate(record)
                            .startsWith(
                                selectedMonth
                            )
                    );
                }
            );
    }


    else if (type === "custom") {

        const from =
            document.getElementById(
                "fromDate"
            ).value;


        const to =
            document.getElementById(
                "toDate"
            ).value;


        filtered =
            vehicles.filter(
                function (record) {

                    const date =
                        getRecordDate(record);


                    if (!date) {
                        return false;
                    }


                    if (
                        from &&
                        date < from
                    ) {

                        return false;
                    }


                    if (
                        to &&
                        date > to
                    ) {

                        return false;
                    }


                    return true;
                }
            );
    }


    return filtered;
}


/* =====================================================
   REPORT PERIOD TEXT
   ===================================================== */

function getPeriodText() {

    const type =
        document.getElementById(
            "reportType"
        ).value;


    if (type === "daily") {

        const date =
            document.getElementById(
                "reportDate"
            ).value;


        return date
            ? formatDate(date)
            : "-";
    }


    if (type === "monthly") {

        const month =
            document.getElementById(
                "reportMonth"
            ).value;


        if (!month) {
            return "-";
        }


        const parts =
            month.split("-");


        const date =
            new Date(
                Number(parts[0]),
                Number(parts[1]) - 1,
                1
            );


        return date.toLocaleString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );
    }


    if (type === "custom") {

        const from =
            document.getElementById(
                "fromDate"
            ).value;


        const to =
            document.getElementById(
                "toDate"
            ).value;


        return (
            formatDate(from) +
            " to " +
            formatDate(to)
        );
    }


    return "-";
}


/* =====================================================
   GENERATE REPORT
   ===================================================== */

async function generateReport() {

    const records =
        await getFilteredRecords();


    updateReportHeading();

    updateStats(records);

    updatePaymentSummary(records);

    updateServiceSummary(records);

    updateVehicleTable(records);


    const generatedTime =
        document.getElementById(
            "generatedTime"
        );


    if (generatedTime) {

        generatedTime.textContent =
            new Date().toLocaleString(
                "en-IN"
            );
    }
}


/* =====================================================
   UPDATE HEADING
   ===================================================== */

function updateReportHeading() {

    const type =
        document.getElementById(
            "reportType"
        ).value;


    let title =
        "Daily Report";


    if (type === "monthly") {

        title =
            "Monthly Report";
    }


    if (type === "custom") {

        title =
            "Custom Report";
    }


    const reportTitle =
        document.getElementById(
            "reportTitle"
        );


    if (reportTitle) {

        reportTitle.textContent =
            title;
    }


    const reportPeriod =
        document.getElementById(
            "reportPeriod"
        );


    if (reportPeriod) {

        reportPeriod.textContent =
            getPeriodText();
    }
}


/* =====================================================
   UPDATE STATS
   ===================================================== */

function updateStats(records) {

    let completed = 0;

    let active = 0;

    let serviceAmount = 0;

    let received = 0;

    let balance = 0;


    records.forEach(
        function (record) {

            const status =
                normalizeStatus(record);


            if (
                status === "Completed"
            ) {

                completed++;

            } else {

                active++;
            }


            serviceAmount +=
                getAmount(record);


            received +=
                getReceived(record);


            balance +=
                getBalance(record);
        }
    );


    const totalVehicles =
        document.getElementById(
            "totalVehicles"
        );


    if (totalVehicles) {

        totalVehicles.textContent =
            records.length;
    }


    const completedVehicles =
        document.getElementById(
            "completedVehicles"
        );


    if (completedVehicles) {

        completedVehicles.textContent =
            completed;
    }


    const activeVehicles =
        document.getElementById(
            "activeVehicles"
        );


    if (activeVehicles) {

        activeVehicles.textContent =
            active;
    }


    const serviceAmountElement =
        document.getElementById(
            "serviceAmount"
        );


    if (serviceAmountElement) {

        serviceAmountElement.textContent =
            money(serviceAmount);
    }


    const receivedAmount =
        document.getElementById(
            "receivedAmount"
        );


    if (receivedAmount) {

        receivedAmount.textContent =
            money(received);
    }


    const pendingAmount =
        document.getElementById(
            "pendingAmount"
        );


    if (pendingAmount) {

        pendingAmount.textContent =
            money(balance);
    }
}


/* =====================================================
   PAYMENT SUMMARY
   ===================================================== */

function updatePaymentSummary(records) {

    let cash = 0;

    let phonePe = 0;


    records.forEach(
        function (record) {

            if (
                normalizeStatus(record) !==
                "Completed"
            ) {

                return;
            }


            const received =
                getReceived(record);


            const payment =
                getPaymentMethod(record);


            if (
                payment === "CASH"
            ) {

                cash += received;
            }


            else if (
                payment === "PHONEPE" ||
                payment === "PHONE PE" ||
                payment === "PHONEPAY"
            ) {

                phonePe += received;
            }

        }
    );


    const total =
        cash + phonePe;


    const cashAmount =
        document.getElementById(
            "cashAmount"
        );


    if (cashAmount) {

        cashAmount.textContent =
            money(cash);
    }


    const phonePeAmount =
        document.getElementById(
            "phonePeAmount"
        );


    if (phonePeAmount) {

        phonePeAmount.textContent =
            money(phonePe);
    }


    const totalReceived =
        document.getElementById(
            "totalReceived"
        );


    if (totalReceived) {

        totalReceived.textContent =
            money(total);
    }
}


/* =====================================================
   SERVICE SUMMARY
   ===================================================== */

function updateServiceSummary(records) {

    const completedRecords =
        records.filter(
            function (record) {

                return (
                    normalizeStatus(record) ===
                    "Completed"
                );
            }
        );


    const services = {};


    completedRecords.forEach(
        function (record) {

            const service =
                normalizeService(record);


            if (!services[service]) {

                services[service] = {

                    vehicles: 0,
                    amount: 0,
                    received: 0,
                    balance: 0

                };
            }


            services[service].vehicles++;


            services[service].amount +=
                getAmount(record);


            services[service].received +=
                getReceived(record);


            services[service].balance +=
                getBalance(record);

        }
    );


    const tbody =
        document.getElementById(
            "serviceTable"
        );


    if (!tbody) {
        return;
    }


    const names =
        Object.keys(services);


    if (names.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty"
                >

                    No completed service data available

                </td>

            </tr>

        `;

        return;
    }


    names.sort();


    tbody.innerHTML =
        names.map(
            function (service, index) {

                const item =
                    services[service];


                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>

                            <strong>
                                ${escapeHTML(service)}
                            </strong>

                        </td>

                        <td>
                            ${item.vehicles}
                        </td>

                        <td class="money">
                            ${money(item.amount)}
                        </td>

                        <td class="received">
                            ${money(item.received)}
                        </td>

                        <td class="balance">
                            ${money(item.balance)}
                        </td>

                    </tr>

                `;
            }
        )
        .join("");
}


/* =====================================================
   VEHICLE TABLE
   ===================================================== */

function updateVehicleTable(records) {

    const tbody =
        document.getElementById(
            "vehicleTable"
        );


    const recordCount =
        document.getElementById(
            "recordCount"
        );


    if (!tbody) {
        return;
    }


    if (recordCount) {

        recordCount.textContent =
            `${records.length} Records`;
    }


    if (records.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="14"
                    class="empty"
                >

                    No vehicle records available

                </td>

            </tr>

        `;

        return;
    }


    const sorted =
        [...records].sort(
            function (a, b) {

                const dateA =
                    getRecordDate(a);


                const dateB =
                    getRecordDate(b);


                return (
                    dateB.localeCompare(
                        dateA
                    )
                );
            }
        );


    tbody.innerHTML =
        sorted.map(
            function (record, index) {

                const status =
                    normalizeStatus(record);


                const service =
                    normalizeService(record);


                const amount =
                    getAmount(record);


                const received =
                    getReceived(record);


                const balance =
                    getBalance(record);


                const payment =
                    getPaymentMethod(record);


                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${formatDate(
                                getRecordDate(record)
                            )}
                        </td>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    getVehicleNumber(record)
                                )}
                            </strong>

                        </td>

                        <td>
                            ${escapeHTML(
                                getOwnerName(record)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                getPhone(record)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                getVehicleName(record)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                service
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                getEntryTime(record)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                getExitTime(record)
                            )}
                        </td>

                        <td class="money">
                            ${money(amount)}
                        </td>

                        <td class="received">
                            ${money(received)}
                        </td>

                        <td class="balance">
                            ${money(balance)}
                        </td>

                        <td>
                            ${escapeHTML(payment)}
                        </td>

                        <td>

                            <span class="status ${
                                status === "Completed"
                                    ? "completed"
                                    : "inside"
                            }">

                                ${
                                    status === "Completed"
                                        ? "✅ Completed"
                                        : "🚗 Inside"
                                }

                            </span>

                        </td>

                    </tr>

                `;
            }
        )
        .join("");
}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

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


/* =====================================================
   EXPORT CSV
   ===================================================== */

async function exportCSV() {

    const records =
        await getFilteredRecords();


    if (records.length === 0) {

        alert(
            "There are no records to export."
        );

        return;
    }


    const rows = [];


    rows.push([

        "No.",
        "Date",
        "Vehicle Number",
        "Owner Name",
        "Phone",
        "Vehicle",
        "Service",
        "Entry Time",
        "Exit Time",
        "Amount",
        "Received",
        "Balance",
        "Payment",
        "Status",
        "Remark"

    ]);


    records.forEach(
        function (record, index) {

            rows.push([

                index + 1,

                getRecordDate(record),

                getVehicleNumber(record),

                getOwnerName(record),

                getPhone(record),

                getVehicleName(record),

                normalizeService(record),

                getEntryTime(record),

                getExitTime(record),

                getAmount(record),

                getReceived(record),

                getBalance(record),

                getPaymentMethod(record),

                normalizeStatus(record),

                getRemark(record)

            ]);
        }
    );


    const csv =
        rows.map(
            function (row) {

                return row
                    .map(
                        function (value) {

                            const text =
                                String(
                                    value ?? ""
                                );

                            return (
                                '"' +
                                text.replace(
                                    /"/g,
                                    '""'
                                ) +
                                '"'
                            );

                        }
                    )
                    .join(",");

            }
        )
        .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;


    const type =
        document.getElementById(
            "reportType"
        ).value;


    link.download =
        `A1-Car-Report-${type}-${getToday()}.csv`;


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);
}


/* =====================================================
   PRINT REPORT
   SUMMARY + COMPLETED VEHICLES + BALANCE VEHICLES
   ===================================================== */

async function printReport() {

    const records =
        await getFilteredRecords();


    if (
        !records ||
        records.length === 0
    ) {

        alert(
            "There are no records to print."
        );

        return;
    }


    /* =================================================
       CALCULATE SUMMARY
       ================================================= */

    let totalAmount = 0;

    let cashAmount = 0;

    let phonePeAmount = 0;

    let balanceAmount = 0;


    records.forEach(
        function (record) {

            const amount =
                getAmount(record);

            const received =
                getReceived(record);

            const balance =
                getBalance(record);

            const payment =
                getPaymentMethod(record);


            totalAmount +=
                amount;


            balanceAmount +=
                balance;


            if (
                payment === "CASH"
            ) {

                cashAmount +=
                    received;
            }


            else if (
                payment === "PHONEPE" ||
                payment === "PHONE PE" ||
                payment === "PHONEPAY"
            ) {

                phonePeAmount +=
                    received;
            }

        }
    );


    /* =================================================
       COMPLETED VEHICLES
       ================================================= */

    const completedVehicles =
        records.filter(
            function (record) {

                return (
                    normalizeStatus(record) ===
                    "Completed"
                );

            }
        );


    /* =================================================
       BALANCE VEHICLES
       ================================================= */

    const balanceVehicles =
        records.filter(
            function (record) {

                return (
                    getBalance(record) > 0
                );

            }
        );


    /* =================================================
       OPEN PRINT WINDOW
       ================================================= */

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1200,height=850"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups in your browser to print the report."
        );

        return;
    }


    /* =================================================
       COMPLETED VEHICLE ROWS
       ================================================= */

    let completedRows = "";


    completedVehicles.forEach(
        function (record, index) {

            completedRows += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${formatDate(
                            getRecordDate(record)
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(
                                getVehicleNumber(record)
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            getOwnerName(record)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getPhone(record)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getVehicleName(record)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            normalizeService(record)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getEntryTime(record)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getExitTime(record)
                        )}
                    </td>

                    <td class="right">
                        ${money(
                            getAmount(record)
                        )}
                    </td>

                    <td class="right">
                        ${money(
                            getReceived(record)
                        )}
                    </td>

                    <td class="right">
                        ${money(
                            getBalance(record)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getPaymentMethod(record)
                        )}
                    </td>

                </tr>

            `;
        }
    );


    /* =================================================
       NO COMPLETED VEHICLES
       ================================================= */

    if (
        completedVehicles.length === 0
    ) {

        completedRows = `

            <tr>

                <td
                    colspan="13"
                    class="noData"
                >

                    No completed vehicles
                    found for this period.

                </td>

            </tr>

        `;
    }


    /* =================================================
       BALANCE VEHICLE ROWS
       ================================================= */

    let balanceRows = "";


    balanceVehicles.forEach(
        function (record, index) {

            balanceRows += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(
                                getVehicleNumber(record)
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            getOwnerName(record)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getPhone(record)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getVehicleName(record)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            normalizeService(record)
                        )}
                    </td>

                    <td class="right">
                        ${money(
                            getAmount(record)
                        )}
                    </td>

                    <td class="right">
                        ${money(
                            getReceived(record)
                        )}
                    </td>

                    <td class="right balance">
                        ${money(
                            getBalance(record)
                        )}
                    </td>

                </tr>

            `;
        }
    );


    /* =================================================
       NO BALANCE VEHICLES
       ================================================= */

    if (
        balanceVehicles.length === 0
    ) {

        balanceRows = `

            <tr>

                <td
                    colspan="9"
                    class="noData"
                >

                    No pending balance vehicles.

                </td>

            </tr>

        `;
    }


    /* =================================================
       REPORT TITLE
       ================================================= */

    const reportTitleElement =
        document.getElementById(
            "reportTitle"
        );


    const reportTitle =
        reportTitleElement
            ? reportTitleElement.textContent
            : "Report";


    /* =================================================
       PRINT HTML
       ================================================= */

    const printHTML = `

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <title>
        A1 Car Detailing Factory Report
    </title>


    <style>

        * {
            box-sizing: border-box;
        }


        body {

            font-family:
                Arial,
                Helvetica,
                sans-serif;

            margin: 0;

            padding: 20px;

            color: #111;

            background: white;

        }


        /* =========================================
           HEADER
        ========================================== */

        .header {

            text-align: center;

            border-bottom:
                2px solid #111;

            padding-bottom: 12px;

            margin-bottom: 20px;

        }


        .header h1 {

            margin: 0;

            font-size: 25px;

        }


        .header h2 {

            margin:
                6px 0;

            font-size: 18px;

            font-weight:
                normal;

        }


        .period {

            font-size: 13px;

            color: #444;

        }


        /* =========================================
           SUMMARY
        ========================================== */

        .summary {

            display: grid;

            grid-template-columns:
                repeat(4, 1fr);

            gap: 12px;

            margin-bottom: 25px;

        }


        .summaryBox {

            border:
                1px solid #888;

            padding: 14px;

            text-align: center;

        }


        .summaryTitle {

            font-size: 12px;

            font-weight: bold;

            text-transform:
                uppercase;

            margin-bottom: 7px;

        }


        .summaryValue {

            font-size: 21px;

            font-weight: bold;

        }


        .balanceBox {

            border:
                2px solid #111;

        }


        /* =========================================
           SECTION TITLE
        ========================================== */

        .sectionTitle {

            font-size: 18px;

            font-weight: bold;

            margin-top: 20px;

            margin-bottom: 10px;

        }


        /* =========================================
           TABLE
        ========================================== */

        table {

            width: 100%;

            border-collapse:
                collapse;

            font-size: 10px;

            margin-bottom: 25px;

        }


        th,
        td {

            border:
                1px solid #888;

            padding:
                6px 5px;

        }


        th {

            background:
                #eeeeee;

            text-align:
                left;

            font-weight:
                bold;

        }


        .right {

            text-align:
                right;

        }


        .balance {

            font-weight:
                bold;

        }


        .noData {

            text-align:
                center;

            padding:
                18px;

            font-weight:
                bold;

        }


        /* =========================================
           FOOTER
        ========================================== */

        .footer {

            margin-top:
                20px;

            padding-top:
                10px;

            border-top:
                1px solid #aaa;

            text-align:
                center;

            font-size:
                10px;

            color:
                #555;

        }


        /* =========================================
           PRINT
        ========================================== */

        @media print {

            body {

                padding:
                    5px;

            }


            .summary {

                grid-template-columns:
                    repeat(4, 1fr);

            }


            table {

                page-break-inside:
                    auto;

            }


            tr {

                page-break-inside:
                    avoid;

                page-break-after:
                    auto;

            }


            .sectionTitle {

                page-break-after:
                    avoid;

            }

        }

    </style>

</head>


<body>


    <!-- =========================================
         HEADER
    ========================================== -->

    <div class="header">

        <h1>
            A1 CAR DETAILING FACTORY
        </h1>

        <h2>
            ${escapeHTML(
                reportTitle
            )}
        </h2>

        <div class="period">

            Period:
            ${escapeHTML(
                getPeriodText()
            )}

        </div>

    </div>


    <!-- =========================================
         SUMMARY
    ========================================== -->

    <div class="summary">


        <div class="summaryBox">

            <div class="summaryTitle">

                Total Amount

            </div>

            <div class="summaryValue">

                ${money(
                    totalAmount
                )}

            </div>

        </div>


        <div class="summaryBox">

            <div class="summaryTitle">

                Cash

            </div>

            <div class="summaryValue">

                ${money(
                    cashAmount
                )}

            </div>

        </div>


        <div class="summaryBox">

            <div class="summaryTitle">

                PhonePe

            </div>

            <div class="summaryValue">

                ${money(
                    phonePeAmount
                )}

            </div>

        </div>


        <div class="summaryBox balanceBox">

            <div class="summaryTitle">

                Balance Amount

            </div>

            <div class="summaryValue">

                ${money(
                    balanceAmount
                )}

            </div>

        </div>


    </div>


    <!-- =========================================
         COMPLETED VEHICLES
    ========================================== -->

    <div class="sectionTitle">

        Completed Vehicle Details
        (${completedVehicles.length})

    </div>


    <table>

        <thead>

            <tr>

                <th>
                    No.
                </th>

                <th>
                    Date
                </th>

                <th>
                    Vehicle Number
                </th>

                <th>
                    Owner
                </th>

                <th>
                    Phone
                </th>

                <th>
                    Vehicle
                </th>

                <th>
                    Service
                </th>

                <th>
                    Entry Time
                </th>

                <th>
                    Exit Time
                </th>

                <th>
                    Total
                </th>

                <th>
                    Received
                </th>

                <th>
                    Balance
                </th>

                <th>
                    Payment
                </th>

            </tr>

        </thead>


        <tbody>

            ${completedRows}

        </tbody>

    </table>


    <!-- =========================================
         BALANCE VEHICLES
    ========================================== -->

    <div class="sectionTitle">

        Balance Vehicle Details
        (${balanceVehicles.length})

    </div>


    <table>

        <thead>

            <tr>

                <th>
                    No.
                </th>

                <th>
                    Vehicle Number
                </th>

                <th>
                    Owner
                </th>

                <th>
                    Phone
                </th>

                <th>
                    Vehicle
                </th>

                <th>
                    Service
                </th>

                <th>
                    Total Amount
                </th>

                <th>
                    Received
                </th>

                <th>
                    Balance
                </th>

            </tr>

        </thead>


        <tbody>

            ${balanceRows}

        </tbody>

    </table>


    <!-- =========================================
         FOOTER
    ========================================== -->

    <div class="footer">

        A1 Car Detailing Factory

        <br>

        Report generated:
        ${new Date().toLocaleString("en-IN")}

    </div>


    <script>

        window.onload = function () {

            setTimeout(
                function () {

                    window.print();

                },
                300
            );

        };

    <\/script>


</body>

</html>

    `;


    /* =========================================
       WRITE PRINT WINDOW
    ========================================== */

    printWindow.document.open();

    printWindow.document.write(
        printHTML
    );

    printWindow.document.close();
}


/* =====================================================
   DASHBOARD
   ===================================================== */

function goDashboard() {

    window.location.href =
        "owner-dashboard.html";
}


/* =====================================================
   LOGOUT
   ===================================================== */

function logout() {

    sessionStorage.removeItem(
        "a1LoggedIn"
    );

    sessionStorage.removeItem(
        "a1Role"
    );

    sessionStorage.removeItem(
        "a1UserRole"
    );

    window.location.href =
        "login.html";
}


/* =====================================================
   INITIALIZE
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (!checkOwnerLogin()) {

            return;
        }


        const reportDate =
            document.getElementById(
                "reportDate"
            );


        if (reportDate) {

            reportDate.value =
                getToday();
        }


        const reportMonth =
            document.getElementById(
                "reportMonth"
            );


        if (reportMonth) {

            reportMonth.value =
                getCurrentMonth();
        }


        await generateReport();


        /* =========================================
           AUTO REFRESH EVERY 10 SECONDS
        ========================================== */

        setInterval(
            function () {

                generateReport();

            },
            10000
        );

    }
);

