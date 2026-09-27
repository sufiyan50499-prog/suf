/* ============================================================
   A1 CAR DETAILING FACTORY
   OWNER DASHBOARD
   GOOGLE SHEETS CONNECTED VERSION
   ============================================================ */


/* ============================================================
   GOOGLE APPS SCRIPT URL
   ============================================================ */

const API_URL =
    "https://script.google.com/macros/s/AKfycbwoKohiflL0GrN8fqjZyzo-z16EA3m4Q8hqWavbc8oH1iL7W3rOQ6K1M-WLH6UiUFU8/exec";


/* ============================================================
   GLOBAL DATA
   ============================================================ */

let vehicles = [];


/* ============================================================
   ELEMENTS
   ============================================================ */

const activeVehicleTable =
    document.getElementById(
        "activeVehicleTable"
    );

const completedVehicleTable =
    document.getElementById(
        "completedVehicleTable"
    );

const totalVehiclesElement =
    document.getElementById(
        "totalVehicles"
    );

const activeVehiclesElement =
    document.getElementById(
        "activeVehicles"
    );

const completedVehiclesElement =
    document.getElementById(
        "completedVehicles"
    );

const todayRevenueElement =
    document.getElementById(
        "todayRevenue"
    );

const dashboardMessage =
    document.getElementById(
        "dashboardMessage"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const ownerBadge =
    document.getElementById(
        "ownerBadge"
    );

const activeVehiclesCard =
    document.getElementById(
        "activeVehiclesCard"
    );

const completedVehiclesCard =
    document.getElementById(
        "completedVehiclesCard"
    );


/* ============================================================
   PAGE ACCESS CHECK
   ============================================================ */

(function checkOwnerSession() {

    const loggedIn =
        sessionStorage.getItem(
            "a1LoggedIn"
        );

    const role =
        sessionStorage.getItem(
            "a1Role"
        );


    if (
        loggedIn !== "true" ||
        role !== "owner"
    ) {

        window.location.replace(
            "owner-login.html"
        );

        return;
    }


    const username =
        sessionStorage.getItem(
            "a1User"
        );


    if (
        ownerBadge &&
        username
    ) {

        ownerBadge.textContent =
            "Owner: " + username;
    }

})();


/* ============================================================
   LOGOUT
   ============================================================ */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }


            /* Clear owner session */

            sessionStorage.removeItem(
                "a1LoggedIn"
            );

            sessionStorage.removeItem(
                "a1Role"
            );

            sessionStorage.removeItem(
                "a1UserRole"
            );

            sessionStorage.removeItem(
                "a1User"
            );


            /* Clear old session keys too */

            sessionStorage.removeItem(
                "ownerLoggedIn"
            );

            sessionStorage.removeItem(
                "a1StaffName"
            );

            sessionStorage.removeItem(
                "a1StaffId"
            );


            window.location.replace(
                "owner-login.html"
            );

        }
    );

}


/* ============================================================
   DASHBOARD CARD NAVIGATION
   ============================================================ */

if (activeVehiclesCard) {

    activeVehiclesCard.addEventListener(
        "click",
        function () {

            window.location.href =
                "active-vehicles.html";

        }
    );


    activeVehiclesCard.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                window.location.href =
                    "active-vehicles.html";
            }

        }
    );

}


if (completedVehiclesCard) {

    completedVehiclesCard.addEventListener(
        "click",
        function () {

            window.location.href =
                "completed-vehicles.html";

        }
    );


    completedVehiclesCard.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                window.location.href =
                    "completed-vehicles.html";
            }

        }
    );

}


/* ============================================================
   MESSAGE
   ============================================================ */

function showDashboardMessage(
    message,
    type = "info"
) {

    if (!dashboardMessage) {
        return;
    }


    dashboardMessage.textContent =
        message;


    dashboardMessage.style.display =
        "block";


    if (type === "error") {

        dashboardMessage.style.background =
            "#450a0a";

        dashboardMessage.style.borderColor =
            "#7f1d1d";

        dashboardMessage.style.color =
            "#fecaca";

    } else {

        dashboardMessage.style.background =
            "#172554";

        dashboardMessage.style.borderColor =
            "#1d4ed8";

        dashboardMessage.style.color =
            "#bfdbfe";
    }

}


/* ============================================================
   HIDE MESSAGE
   ============================================================ */

function hideDashboardMessage() {

    if (!dashboardMessage) {
        return;
    }

    dashboardMessage.style.display =
        "none";
}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   NUMBER
   ============================================================ */

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }


    if (
        typeof value === "number"
    ) {
        return isNaN(value)
            ? 0
            : value;
    }


    const cleaned =
        String(value)
            .replace(/[₹,\s]/g, "")
            .replace(/[^\d.-]/g, "");


    const number =
        parseFloat(cleaned);


    return isNaN(number)
        ? 0
        : number;
}


/* ============================================================
   CURRENCY
   ============================================================ */

function formatCurrency(value) {

    const amount =
        toNumber(value);


    return (
        "₹" +
        amount.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        )
    );
}


/* ============================================================
   GET OBJECT VALUE
   ============================================================ */

function getValue(
    object,
    keys,
    defaultValue = ""
) {

    if (!object) {
        return defaultValue;
    }


    for (
        const key of keys
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                object,
                key
            )
        ) {

            const value =
                object[key];


            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {

                return value;
            }
        }
    }


    return defaultValue;
}


/* ============================================================
   NORMALIZE VEHICLE
   ============================================================ */

function normalizeVehicle(
    vehicle,
    index
) {

    if (
        Array.isArray(vehicle)
    ) {

        return {

            id:
                vehicle[0] ||
                "ROW-" + index,

            vehicleNumber:
                vehicle[1] || "",

            owner:
                vehicle[2] || "",

            phone:
                vehicle[3] || "",

            vehicle:
                vehicle[4] || "",

            service:
                vehicle[5] || "",

            entryTime:
                vehicle[6] || "",

            amount:
                vehicle[7] || 0,

            payment:
                vehicle[8] || "",

            exitTime:
                vehicle[9] || "",

            status:
                vehicle[10] || "",

            remark:
                vehicle[11] || "",

            balance:
                vehicle[12] || 0

        };

    }


    return {

        id:
            getValue(
                vehicle,
                [
                    "id",
                    "ID",
                    "Id",
                    "recordId",
                    "record_id"
                ],
                "ROW-" + index
            ),

        vehicleNumber:
            getValue(
                vehicle,
                [
                    "vehicleNumber",
                    "vehicle_number",
                    "Vehicle Number",
                    "VehicleNumber",
                    "number"
                ]
            ),

        owner:
            getValue(
                vehicle,
                [
                    "owner",
                    "ownerName",
                    "owner_name",
                    "Owner",
                    "Owner Name"
                ]
            ),

        phone:
            getValue(
                vehicle,
                [
                    "phone",
                    "Phone",
                    "mobile",
                    "Mobile",
                    "phoneNumber"
                ]
            ),

        vehicle:
            getValue(
                vehicle,
                [
                    "vehicle",
                    "vehicleName",
                    "vehicle_name",
                    "Vehicle",
                    "Vehicle Name"
                ]
            ),

        service:
            getValue(
                vehicle,
                [
                    "service",
                    "serviceType",
                    "service_type",
                    "Service",
                    "Service Type"
                ]
            ),

        entryTime:
            getValue(
                vehicle,
                [
                    "entryTime",
                    "entry_time",
                    "Entry Time",
                    "entry",
                    "Entry"
                ]
            ),

        amount:
            getValue(
                vehicle,
                [
                    "amount",
                    "Amount",
                    "totalAmount",
                    "total_amount",
                    "charges",
                    "Charges"
                ],
                0
            ),

        payment:
            getValue(
                vehicle,
                [
                    "payment",
                    "Payment",
                    "paymentMethod",
                    "payment_method",
                    "Payment Method"
                ]
            ),

        exitTime:
            getValue(
                vehicle,
                [
                    "exitTime",
                    "exit_time",
                    "Exit Time",
                    "exit",
                    "Exit"
                ]
            ),

        status:
            getValue(
                vehicle,
                [
                    "status",
                    "Status"
                ]
            ),

        remark:
            getValue(
                vehicle,
                [
                    "remark",
                    "Remark",
                    "remarks",
                    "Remarks"
                ]
            ),

        balance:
            getValue(
                vehicle,
                [
                    "balance",
                    "Balance",
                    "due",
                    "Due"
                ],
                0
            )

    };
}


/* ============================================================
   EXTRACT VEHICLES FROM API RESPONSE
   ============================================================ */

function extractVehicles(data) {

    if (
        Array.isArray(data)
    ) {

        return data;
    }


    if (!data) {
        return [];
    }


    const possibleKeys = [
        "vehicles",
        "vehicle",
        "records",
        "data",
        "rows",
        "values"
    ];


    for (
        const key of possibleKeys
    ) {

        if (
            Array.isArray(data[key])
        ) {

            return data[key];
        }
    }


    return [];
}


/* ============================================================
   STATUS CHECK
   ============================================================ */

function isCompleted(vehicle) {

    const status =
        String(
            vehicle.status || ""
        )
        .trim()
        .toLowerCase();


    const exitTime =
        String(
            vehicle.exitTime || ""
        )
        .trim();


    if (
        status === "completed" ||
        status === "complete" ||
        status === "closed" ||
        status === "exit" ||
        status === "exited"
    ) {

        return true;
    }


    if (
        exitTime &&
        (
            status === "" ||
            status === "completed"
        )
    ) {

        return true;
    }


    return false;
}


/* ============================================================
   ACTIVE CHECK
   ============================================================ */

function isActive(vehicle) {

    return !isCompleted(vehicle);
}


/* ============================================================
   DATE PARSING
   ============================================================ */

function parseDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;
    }


    if (
        value instanceof Date
    ) {

        return isNaN(value.getTime())
            ? null
            : value;
    }


    const date =
        new Date(value);


    if (
        !isNaN(date.getTime())
    ) {

        return date;
    }


    return null;
}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDateTime(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";
    }


    const date =
        parseDate(value);


    if (!date) {

        return escapeHtml(
            String(value)
        );
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* ============================================================
   CHECK TODAY
   ============================================================ */

function isToday(value) {

    const date =
        parseDate(value);


    if (!date) {
        return false;
    }


    const now =
        new Date();


    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}


/* ============================================================
   GET PAID AMOUNT
   ============================================================ */

function getPaidAmount(vehicle) {

    const balance =
        toNumber(
            vehicle.balance
        );

    const amount =
        toNumber(
            vehicle.amount
        );


    /*
     * If balance is available:
     *
     * paid = total - balance
     */

    if (
        vehicle.balance !== "" &&
        vehicle.balance !== null &&
        vehicle.balance !== undefined
    ) {

        return Math.max(
            0,
            amount - balance
        );
    }


    /*
     * For completed records,
     * assume the amount is paid.
     */

    if (
        isCompleted(vehicle)
    ) {

        return amount;
    }


    return 0;
}


/* ============================================================
   GET BALANCE
   ============================================================ */

function getBalance(vehicle) {

    if (
        vehicle.balance !== "" &&
        vehicle.balance !== null &&
        vehicle.balance !== undefined
    ) {

        return Math.max(
            0,
            toNumber(
                vehicle.balance
            )
        );
    }


    return 0;
}


/* ============================================================
   LOAD VEHICLES
   ============================================================ */

async function loadVehicles() {

    showDashboardMessage(
        "Loading vehicle records..."
    );


    try {

        const url =
            API_URL +
            "?action=getVehicles" +
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
                "Server error: HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "OWNER DASHBOARD RESPONSE:",
            data
        );


        /*
         * Some Apps Script versions
         * return:
         *
         * { success: false, message: "..." }
         */

        if (
            data &&
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Google Sheets returned an error."
            );
        }


        const rawVehicles =
            extractVehicles(data);


        vehicles =
            rawVehicles.map(
                normalizeVehicle
            );


        hideDashboardMessage();


        updateStatistics();

        displayActiveVehicles();

        displayCompletedVehicles();


    }
    catch (error) {

        console.error(
            "LOAD VEHICLES ERROR:",
            error
        );


        showDashboardMessage(
            "Unable to load vehicle records. " +
            error.message,
            "error"
        );


        vehicles = [];


        updateStatistics();


        if (activeVehicleTable) {

            activeVehicleTable.innerHTML =
                `
                <tr>
                    <td
                        colspan="10"
                        class="loading"
                    >
                        Unable to load vehicle records.
                    </td>
                </tr>
                `;
        }


        if (completedVehicleTable) {

            completedVehicleTable.innerHTML =
                `
                <tr>
                    <td
                        colspan="12"
                        class="loading"
                    >
                        Unable to load completed records.
                    </td>
                </tr>
                `;
        }

    }

}


/* ============================================================
   UPDATE STATISTICS
   ============================================================ */

function updateStatistics() {

    const active =
        vehicles.filter(
            isActive
        );


    const completed =
        vehicles.filter(
            isCompleted
        );


    /*
     * Total vehicles
     */

    if (totalVehiclesElement) {

        totalVehiclesElement.textContent =
            vehicles.length;
    }


    /*
     * Active vehicles
     */

    if (activeVehiclesElement) {

        activeVehiclesElement.textContent =
            active.length;
    }


    /*
     * Completed vehicles
     */

    if (completedVehiclesElement) {

        completedVehiclesElement.textContent =
            completed.length;
    }


    /*
     * Today's revenue
     */

    let todayRevenue = 0;


    completed.forEach(
        function (vehicle) {

            /*
             * Revenue should normally
             * use exit date.
             */

            const dateToCheck =
                vehicle.exitTime ||
                vehicle.entryTime;


            if (
                isToday(dateToCheck)
            ) {

                todayRevenue +=
                    getPaidAmount(vehicle);
            }

        }
    );


    if (todayRevenueElement) {

        todayRevenueElement.textContent =
            formatCurrency(
                todayRevenue
            );
    }

}


/* ============================================================
   DISPLAY ACTIVE VEHICLES
   ============================================================ */

function displayActiveVehicles() {

    if (!activeVehicleTable) {
        return;
    }


    const activeVehicles =
        vehicles.filter(
            isActive
        );


    if (
        activeVehicles.length === 0
    ) {

        activeVehicleTable.innerHTML =
            `
            <tr>
                <td
                    colspan="10"
                    class="empty-state"
                >
                    No vehicles are currently inside.
                </td>
            </tr>
            `;

        return;
    }


    activeVehicleTable.innerHTML =
        activeVehicles
            .map(
                function (
                    vehicle,
                    index
                ) {

                    const amount =
                        toNumber(
                            vehicle.amount
                        );


                    const balance =
                        getBalance(
                            vehicle
                        );


                    return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    vehicle.vehicleNumber ||
                                    "-"
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                                vehicle.owner ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                vehicle.phone ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                vehicle.vehicle ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                vehicle.service ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatDateTime(
                                vehicle.entryTime
                            )}
                        </td>

                        <td class="amount">
                            ${formatCurrency(
                                amount
                            )}
                        </td>

                        <td class="balance">
                            ${formatCurrency(
                                balance
                            )}
                        </td>

                        <td>

                            <span
                                class="status-badge status-inside"
                            >
                                Inside
                            </span>

                        </td>

                    </tr>
                    `;

                }
            )
            .join("");

}


/* ============================================================
   DISPLAY COMPLETED VEHICLES
   ============================================================ */

function displayCompletedVehicles() {

    if (!completedVehicleTable) {
        return;
    }


    const completed =
        vehicles
            .filter(
                isCompleted
            )
            .sort(
                function (a, b) {

                    const dateA =
                        parseDate(
                            a.exitTime
                        );

                    const dateB =
                        parseDate(
                            b.exitTime
                        );


                    if (
                        !dateA &&
                        !dateB
                    ) {
                        return 0;
                    }


                    if (!dateA) {
                        return 1;
                    }


                    if (!dateB) {
                        return -1;
                    }


                    return (
                        dateB.getTime() -
                        dateA.getTime()
                    );
                }
            )
            .slice(
                0,
                10
            );


    if (
        completed.length === 0
    ) {

        completedVehicleTable.innerHTML =
            `
            <tr>
                <td
                    colspan="12"
                    class="empty-state"
                >
                    No completed vehicles found.
                </td>
            </tr>
            `;

        return;
    }


    completedVehicleTable.innerHTML =
        completed
            .map(
                function (
                    vehicle,
                    index
                ) {

                    const amount =
                        toNumber(
                            vehicle.amount
                        );


                    const paid =
                        getPaidAmount(
                            vehicle
                        );


                    const balance =
                        getBalance(
                            vehicle
                        );


                    return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    vehicle.vehicleNumber ||
                                    "-"
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                                vehicle.owner ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                vehicle.phone ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                vehicle.vehicle ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                vehicle.service ||
                                "-"
                            )}
                        </td>

                        <td class="amount">
                            ${formatCurrency(
                                amount
                            )}
                        </td>

                        <td class="paid">
                            ${formatCurrency(
                                paid
                            )}
                        </td>

                        <td class="balance">
                            ${formatCurrency(
                                balance
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                vehicle.payment ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatDateTime(
                                vehicle.exitTime
                            )}
                        </td>

                        <td>

                            <span
                                class="status-badge status-completed"
                            >
                                ✅ Completed
                            </span>

                        </td>

                    </tr>
                    `;

                }
            )
            .join("");

}


/* ============================================================
   REFRESH DASHBOARD
   ============================================================ */

async function refreshDashboard() {

    await loadVehicles();

}


/* ============================================================
   START DASHBOARD
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Load records immediately.
         */

        loadVehicles();


        /*
         * Refresh every 30 seconds.
         */

        setInterval(
            function () {

                loadVehicles();

            },
            30000
        );

    }
);