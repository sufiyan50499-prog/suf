
// =====================================================
// A1 CAR DETAILING FACTORY
// VEHICLE RECORDS
// GOOGLE SHEETS CONNECTED VERSION
// =====================================================


// =====================================================
// GOOGLE APPS SCRIPT API URL
// =====================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwoKohiflL0GrN8fqjZyzo-z16EA3m4Q8hqWavbc8oH1iL7W3rOQ6K1M-WLH6UiUFU8/exec";


// =====================================================
// LOCAL STORAGE KEY
// =====================================================

const VEHICLE_STORAGE_KEY = "a1Vehicles";


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadRecords();

        const searchInput =
            document.getElementById(
                "searchInput"
            );

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                loadRecords
            );

        }

        const statusFilter =
            document.getElementById(
                "statusFilter"
            );

        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                loadRecords
            );

        }

        const serviceFilter =
            document.getElementById(
                "serviceFilter"
            );

        if (serviceFilter) {

            serviceFilter.addEventListener(
                "change",
                loadRecords
            );

        }

    }
);


// =====================================================
// GET VEHICLES
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
            "GOOGLE SHEET VEHICLE RESPONSE:",
            data
        );

        if (
            !data ||
            data.success !== true
        ) {

            console.error(
                "Google Sheet error:",
                data
            );

            return [];

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

        return [];

    }
    catch (error) {

        console.error(
            "Cannot load vehicles from Google Sheet:",
            error
        );

        showConnectionError();

        return [];

    }

}


// =====================================================
// LOAD RECORDS
// =====================================================

async function loadRecords() {

    const tbody =
        document.getElementById(
            "recordsTable"
        );

    if (tbody) {

        tbody.innerHTML = `
            <tr>
                <td colspan="16" class="empty-row">
                    Loading vehicle records...
                </td>
            </tr>
        `;

    }

    const vehicles =
        await getVehicles();

    updateStatistics(
        vehicles
    );

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const serviceFilter =
        document.getElementById(
            "serviceFilter"
        );

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const status =
        statusFilter
            ? statusFilter.value
            : "all";

    const service =
        serviceFilter
            ? serviceFilter.value
            : "all";

    const filtered =
        vehicles.filter(
            function (vehicle) {

                const vehicleNumber =
                    String(
                        vehicle.vehicleNumber ||
                        vehicle.vehicle_number ||
                        ""
                    )
                    .toLowerCase();

                const owner =
                    String(
                        vehicle.ownerName ||
                        vehicle.owner_name ||
                        ""
                    )
                    .toLowerCase();

                const phone =
                    String(
                        vehicle.phone ||
                        ""
                    )
                    .toLowerCase();

                const vehicleName =
                    String(
                        vehicle.vehicleName ||
                        vehicle.vehicle_name ||
                        vehicle.vehicleType ||
                        vehicle.vehicle_type ||
                        ""
                    )
                    .toLowerCase();

                const vehicleService =
                    normalizeService(
                        vehicle.serviceType ||
                        vehicle.service_type ||
                        vehicle.service ||
                        ""
                    );

                const vehicleStatus =
                    normalizeStatus(
                        vehicle.status
                    );

                const searchMatch =
                    !search ||
                    vehicleNumber.includes(
                        search
                    ) ||
                    owner.includes(
                        search
                    ) ||
                    phone.includes(
                        search
                    ) ||
                    vehicleName.includes(
                        search
                    );

                const statusMatch =
                    status === "all" ||
                    vehicleStatus === status;

                const serviceMatch =
                    service === "all" ||
                    normalizeService(
                        service
                    ) === vehicleService;

                return (
                    searchMatch &&
                    statusMatch &&
                    serviceMatch
                );

            }
        );

    displayRecords(
        filtered
    );

}


// =====================================================
// DISPLAY RECORDS
// =====================================================

function displayRecords(records) {

    const tbody =
        document.getElementById(
            "recordsTable"
        );

    if (!tbody) {
        return;
    }

    const recordCount =
        document.getElementById(
            "recordCount"
        );

    if (recordCount) {

        recordCount.textContent =
            `${records.length} record${
                records.length === 1
                    ? ""
                    : "s"
            }`;

    }

    if (
        records.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="16" class="empty-row">
                    No vehicle records found.
                </td>
            </tr>
        `;

        return;

    }


    // =================================================
    // NEWEST FIRST
    // =================================================

    records =
        [...records].sort(
            function (a, b) {

                const dateA =
                    getDateValue(
                        a.entryTime ||
                        a.entry_time ||
                        a.createdAt ||
                        a.created_at
                    );

                const dateB =
                    getDateValue(
                        b.entryTime ||
                        b.entry_time ||
                        b.createdAt ||
                        b.created_at
                    );

                return dateB - dateA;

            }
        );


    tbody.innerHTML =
        records.map(
            function (
                vehicle,
                index
            ) {

                const vehicleNumber =
                    vehicle.vehicleNumber ||
                    vehicle.vehicle_number ||
                    "-";

                const owner =
                    vehicle.ownerName ||
                    vehicle.owner_name ||
                    "-";

                const phone =
                    vehicle.phone ||
                    "-";

                const vehicleName =
                    vehicle.vehicleName ||
                    vehicle.vehicle_name ||
                    vehicle.vehicleType ||
                    vehicle.vehicle_type ||
                    "-";

                const service =
                    normalizeService(
                        vehicle.serviceType ||
                        vehicle.service_type ||
                        vehicle.service ||
                        "-"
                    );

                const entryTime =
                    formatDateTime(
                        vehicle.entryTime ||
                        vehicle.entry_time
                    );

                const exitTime =
                    formatDateTime(
                        vehicle.exitTime ||
                        vehicle.exit_time
                    );

                const date =
                    formatDate(
                        vehicle.date ||
                        vehicle.entryDate ||
                        vehicle.entry_date ||
                        vehicle.entryTime ||
                        vehicle.entry_time
                    );

                const amount =
                    getNumber(
                        vehicle.amount
                    );

                const paid =
                    getNumber(
                        vehicle.paidAmount ??
                        vehicle.paid_amount ??
                        vehicle.paid
                    );

                let balance;

                if (
                    vehicle.balance !==
                        undefined &&
                    vehicle.balance !==
                        null &&
                    vehicle.balance !== ""
                ) {

                    balance =
                        getNumber(
                            vehicle.balance
                        );

                }
                else {

                    balance =
                        Math.max(
                            0,
                            amount - paid
                        );

                }

                const payment =
                    vehicle.paymentMethod ||
                    vehicle.payment_method ||
                    vehicle.payment ||
                    "-";

                const status =
                    normalizeStatus(
                        vehicle.status
                    );

                const remark =
                    vehicle.remark ||
                    "-";

                const freeWash =
                    vehicle.freeWash === true ||
                    vehicle.free_wash === true ||
                    String(
                        vehicle.freeWash ||
                        vehicle.free_wash ||
                        ""
                    ).toUpperCase() ===
                        "TRUE";

                const vehicleId =
                    vehicle.id ||
                    vehicle.vehicleId ||
                    "";

                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${date}
                        </td>

                        <td>
                            <span class="vehicle-number">
                                ${escapeHTML(
                                    vehicleNumber
                                )}
                            </span>
                        </td>

                        <td>
                            ${escapeHTML(
                                owner
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                phone
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                vehicleName
                            )}
                        </td>

                        <td>

                            ${escapeHTML(
                                service
                            )}

                            ${
                                freeWash
                                    ? `
                                        <br>
                                        <span class="free-service">
                                            FREE
                                        </span>
                                      `
                                    : ""
                            }

                        </td>

                        <td>
                            ${entryTime}
                        </td>

                        <td>
                            ₹${formatMoney(
                                amount
                            )}
                        </td>

                        <td>
                            ₹${formatMoney(
                                paid
                            )}
                        </td>

                        <td>

                            ${
                                balance > 0
                                    ? `
                                        <span class="balance-due">
                                            ₹${formatMoney(
                                                balance
                                            )}
                                        </span>
                                      `
                                    : `
                                        <span class="balance-clear">
                                            ₹0
                                        </span>
                                      `
                            }

                        </td>

                        <td>
                            ${paymentHTML(
                                payment
                            )}
                        </td>

                        <td>
                            ${exitTime}
                        </td>

                        <td>
                            ${statusHTML(
                                status
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                remark
                            )}
                        </td>

                        <td>

                            <button
                                class="edit-btn"
                                onclick="editVehicle('${escapeHTML(String(vehicleId))}')"
                            >
                                ✏️ Edit
                            </button>

                        </td>

                    </tr>
                `;

            }
        )
        .join("");

}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics(
    vehicles
) {

    const total =
        vehicles.length;

    const active =
        vehicles.filter(
            function (vehicle) {

                return (
                    normalizeStatus(
                        vehicle.status
                    ) === "Inside"
                );

            }
        ).length;

    const completed =
        vehicles.filter(
            function (vehicle) {

                return (
                    normalizeStatus(
                        vehicle.status
                    ) === "Completed"
                );

            }
        ).length;

    const totalRevenue =
        vehicles.reduce(
            function (
                sum,
                vehicle
            ) {

                return (
                    sum +
                    getNumber(
                        vehicle.paidAmount ??
                        vehicle.paid_amount ??
                        vehicle.paid
                    )
                );

            },
            0
        );


    const totalVehicles =
        document.getElementById(
            "totalVehicles"
        );

    if (totalVehicles) {

        totalVehicles.textContent =
            total;

    }


    const activeVehicles =
        document.getElementById(
            "activeVehicles"
        );

    if (activeVehicles) {

        activeVehicles.textContent =
            active;

    }


    const completedVehicles =
        document.getElementById(
            "completedVehicles"
        );

    if (completedVehicles) {

        completedVehicles.textContent =
            completed;

    }


    const totalRevenueElement =
        document.getElementById(
            "totalRevenue"
        );

    if (totalRevenueElement) {

        totalRevenueElement.textContent =
            "₹" +
            formatMoney(
                totalRevenue
            );

    }

}


// =====================================================
// NORMALIZE STATUS
// =====================================================

function normalizeStatus(
    status
) {

    const value =
        String(
            status || ""
        )
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

    return status || "Inside";

}


// =====================================================
// NORMALIZE SERVICE
// =====================================================

function normalizeService(
    service
) {

    const value =
        String(
            service || ""
        )
        .trim();

    const lower =
        value.toLowerCase();

    if (
        lower === "full wash" ||
        lower === "full body wash"
    ) {

        return "Full Wash";

    }

    if (
        lower === "body wash" ||
        lower === "exterior wash"
    ) {

        return "Body Wash";

    }

    if (
        lower === "ceramic coating" ||
        lower === "detailing"
    ) {

        return "Ceramic Coating";

    }

    return value;

}


// =====================================================
// PAYMENT HTML
// =====================================================

function paymentHTML(
    payment
) {

    const value =
        String(
            payment || ""
        )
        .toUpperCase();

    if (
        value === "CASH"
    ) {

        return `
            <span class="payment-cash">
                CASH
            </span>
        `;

    }

    if (
        value === "PHONEPE"
    ) {

        return `
            <span class="payment-phonepe">
                PHONEPE
            </span>
        `;

    }

    if (
        value === "PENDING" ||
        value === "UNPAID"
    ) {

        return `
            <span class="payment-pending">
                ${escapeHTML(value)}
            </span>
        `;

    }

    return escapeHTML(
        payment || "-"
    );

}


// =====================================================
// STATUS HTML
// =====================================================

function statusHTML(
    status
) {

    if (
        status === "Completed"
    ) {

        return `
            <span class="status-badge status-completed">
                ✓ Completed
            </span>
        `;

    }

    return `
        <span class="status-badge status-inside">
            Inside Showroom
        </span>
    `;

}


// =====================================================
// DATE
// =====================================================

function formatDate(
    value
) {

    if (!value) {
        return "-";
    }

    const date =
        parseGoogleDate(
            value
        );

    if (
        !date ||
        isNaN(
            date.getTime()
        )
    ) {

        return escapeHTML(
            String(value)
        );

    }

    return date.toLocaleDateString(
        "en-IN"
    );

}


// =====================================================
// DATE + TIME
// =====================================================

function formatDateTime(
    value
) {

    if (!value) {
        return "-";
    }

    const date =
        parseGoogleDate(
            value
        );

    if (
        !date ||
        isNaN(
            date.getTime()
        )
    ) {

        return escapeHTML(
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


// =====================================================
// GOOGLE DATE PARSER
// =====================================================

function parseGoogleDate(
    value
) {

    if (
        value instanceof Date
    ) {

        return value;

    }

    if (
        typeof value === "number"
    ) {

        return new Date(
            value
        );

    }

    const stringValue =
        String(
            value || ""
        )
        .trim();

    if (!stringValue) {
        return null;
    }


    // DD/MM/YYYY HH:MM:SS

    const match =
        stringValue.match(
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


    const parsed =
        new Date(
            stringValue
        );

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
// GET DATE VALUE
// =====================================================

function getDateValue(
    value
) {

    const date =
        parseGoogleDate(
            value
        );

    if (!date) {
        return 0;
    }

    return date.getTime();

}


// =====================================================
// NUMBER
// =====================================================

function getNumber(
    value
) {

    const number =
        Number(
            value
        );

    if (
        !Number.isFinite(
            number
        )
    ) {

        return 0;

    }

    return number;

}


// =====================================================
// MONEY
// =====================================================

function formatMoney(
    value
) {

    return getNumber(
        value
    )
    .toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


// =====================================================
// RESET FILTERS
// =====================================================

function resetFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if (searchInput) {

        searchInput.value = "";

    }

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    if (statusFilter) {

        statusFilter.value =
            "all";

    }

    const serviceFilter =
        document.getElementById(
            "serviceFilter"
        );

    if (serviceFilter) {

        serviceFilter.value =
            "all";

    }

    loadRecords();

}


// =====================================================
// DASHBOARD
// =====================================================

function goDashboard() {

    window.location.href =
        "owner-dashboard.html";

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value
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


// =====================================================
// DETAILS MODAL
// =====================================================

async function showDetails(
    id
) {

    const vehicles =
        await getVehicles();

    const vehicle =
        vehicles.find(
            function (item) {

                return String(
                    item.id ||
                    item.vehicleId ||
                    ""
                ) ===
                String(id);

            }
        );

    if (!vehicle) {

        alert(
            "Vehicle record not found."
        );

        return;

    }

    const detailsContent =
        document.getElementById(
            "detailsContent"
        );

    if (!detailsContent) {
        return;
    }

    const amount =
        getNumber(
            vehicle.amount
        );

    const paid =
        getNumber(
            vehicle.paidAmount ??
            vehicle.paid_amount ??
            vehicle.paid
        );

    const balance =
        vehicle.balance !== undefined &&
        vehicle.balance !== null &&
        vehicle.balance !== ""
            ? getNumber(
                vehicle.balance
            )
            : Math.max(
                0,
                amount - paid
            );

    detailsContent.innerHTML = `

        <div class="detail-grid">

            <div class="detail-item">
                <label>Vehicle Number</label>
                <strong>
                    ${escapeHTML(
                        vehicle.vehicleNumber ||
                        vehicle.vehicle_number ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <label>Owner Name</label>
                <strong>
                    ${escapeHTML(
                        vehicle.ownerName ||
                        vehicle.owner_name ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <label>Phone</label>
                <strong>
                    ${escapeHTML(
                        vehicle.phone ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <label>Vehicle</label>
                <strong>
                    ${escapeHTML(
                        vehicle.vehicleName ||
                        vehicle.vehicle_name ||
                        vehicle.vehicleType ||
                        vehicle.vehicle_type ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <label>Service</label>
                <strong>
                    ${escapeHTML(
                        normalizeService(
                            vehicle.serviceType ||
                            vehicle.service_type ||
                            vehicle.service ||
                            "-"
                        )
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <label>Status</label>
                <strong>
                    ${escapeHTML(
                        normalizeStatus(
                            vehicle.status
                        )
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <label>Service Amount</label>
                <strong>
                    ₹${formatMoney(amount)}
                </strong>
            </div>

            <div class="detail-item">
                <label>Amount Received</label>
                <strong>
                    ₹${formatMoney(paid)}
                </strong>
            </div>

            <div class="detail-item">
                <label>Balance</label>
                <strong>
                    ₹${formatMoney(balance)}
                </strong>
            </div>

            <div class="detail-item">
                <label>Payment Method</label>
                <strong>
                    ${escapeHTML(
                        vehicle.paymentMethod ||
                        vehicle.payment_method ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <label>Entry Time</label>
                <strong>
                    ${formatDateTime(
                        vehicle.entryTime ||
                        vehicle.entry_time
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <label>Exit Time</label>
                <strong>
                    ${formatDateTime(
                        vehicle.exitTime ||
                        vehicle.exit_time
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <label>Added By</label>
                <strong>
                    ${escapeHTML(
                        vehicle.addedBy ||
                        vehicle.added_by ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <label>Remark</label>
                <strong>
                    ${escapeHTML(
                        vehicle.remark ||
                        "-"
                    )}
                </strong>
            </div>

        </div>

    `;

    const modal =
        document.getElementById(
            "detailsModal"
        );

    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


// =====================================================
// CLOSE DETAILS
// =====================================================

function closeDetails() {

    const modal =
        document.getElementById(
            "detailsModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// =====================================================
// EDIT VEHICLE
// =====================================================

async function editVehicle(
    id
) {

    if (!id) {

        alert(
            "Vehicle ID not found."
        );

        return;

    }

    try {

        const vehicles =
            await getVehicles();

        const vehicle =
            vehicles.find(
                function (item) {

                    return String(
                        item.id ||
                        item.vehicleId ||
                        ""
                    ) ===
                    String(id);

                }
            );

        if (!vehicle) {

            alert(
                "Vehicle record not found."
            );

            return;

        }


        const vehicleNumber =
            vehicle.vehicleNumber ||
            vehicle.vehicle_number ||
            "";

        const ownerName =
            vehicle.ownerName ||
            vehicle.owner_name ||
            "";

        const phone =
            vehicle.phone ||
            "";

        const vehicleName =
            vehicle.vehicleName ||
            vehicle.vehicle_name ||
            vehicle.vehicleType ||
            vehicle.vehicle_type ||
            "";

        const serviceType =
            vehicle.serviceType ||
            vehicle.service_type ||
            vehicle.service ||
            "";

        const amount =
            vehicle.amount || 0;

        const paidAmount =
            vehicle.paidAmount ??
            vehicle.paid_amount ??
            vehicle.paid ??
            0;

        const paymentMethod =
            vehicle.paymentMethod ||
            vehicle.payment_method ||
            "";

        const remark =
            vehicle.remark ||
            "";


        let modal =
            document.getElementById(
                "editVehicleModal"
            );

        if (!modal) {

            modal =
                document.createElement(
                    "div"
                );

            modal.id =
                "editVehicleModal";

            modal.className =
                "edit-modal";

            document.body.appendChild(
                modal
            );

        }


        modal.innerHTML = `

            <div class="edit-modal-box">

                <div class="edit-modal-header">

                    <div>

                        <h2>
                            ✏️ Edit Vehicle
                        </h2>

                        <p>
                            Update vehicle record
                        </p>

                    </div>

                    <button
                        type="button"
                        class="edit-close-btn"
                        onclick="closeEditVehicle()"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="editVehicleForm"
                >

                    <div class="edit-form-grid">


                        <div class="edit-field">

                            <label>
                                Vehicle Number
                            </label>

                            <input
                                type="text"
                                id="editVehicleNumber"
                                value="${escapeHTML(vehicleNumber)}"
                                required
                            >

                        </div>


                        <div class="edit-field">

                            <label>
                                Owner Name
                            </label>

                            <input
                                type="text"
                                id="editOwnerName"
                                value="${escapeHTML(ownerName)}"
                                required
                            >

                        </div>


                        <div class="edit-field">

                            <label>
                                Phone
                            </label>

                            <input
                                type="text"
                                id="editPhone"
                                value="${escapeHTML(phone)}"
                            >

                        </div>


                        <div class="edit-field">

                            <label>
                                Vehicle Name
                            </label>

                            <input
                                type="text"
                                id="editVehicleName"
                                value="${escapeHTML(vehicleName)}"
                                required
                            >

                        </div>


                        <div class="edit-field">

                            <label>
                                Service
                            </label>

                            <select
                                id="editServiceType"
                            >

                                <option value="Full Wash">
                                    Full Wash
                                </option>

                                <option value="Interior Cleaning">
                                    Interior Cleaning
                                </option>

                                <option value="Body Wash">
                                    Body Wash
                                </option>

                                <option value="PPF">
                                    PPF
                                </option>

                                <option value="Maintenance">
                                    Maintenance
                                </option>

                                <option value="Rubbing Polish">
                                    Rubbing Polish
                                </option>

                                <option value="Ceramic Coating">
                                    Ceramic Coating
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        <div class="edit-field">

                            <label>
                                Service Amount
                            </label>

                            <input
                                type="number"
                                id="editAmount"
                                min="0"
                                step="0.01"
                                value="${escapeHTML(String(amount))}"
                            >

                        </div>


                        <div class="edit-field">

                            <label>
                                Amount Received
                            </label>

                            <input
                                type="number"
                                id="editPaidAmount"
                                min="0"
                                step="0.01"
                                value="${escapeHTML(String(paidAmount))}"
                            >

                        </div>


                        <div class="edit-field">

                            <label>
                                Payment Method
                            </label>

                            <select
                                id="editPaymentMethod"
                            >

                                <option value="">
                                    Select Payment
                                </option>

                                <option value="CASH">
                                    CASH
                                </option>

                                <option value="PHONEPE">
                                    PHONEPE
                                </option>

                                <option value="PENDING">
                                    PENDING
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="edit-field edit-full">

                        <label>
                            Remark
                        </label>

                        <textarea
                            id="editRemark"
                            rows="3"
                        >${escapeHTML(remark)}</textarea>

                    </div>


                    <div
                        class="edit-balance-preview"
                        id="editBalancePreview"
                    >
                        Balance: ₹0
                    </div>


                    <div class="edit-modal-actions">

                        <button
                            type="button"
                            class="edit-cancel-btn"
                            onclick="closeEditVehicle()"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="edit-save-btn"
                            id="editSaveBtn"
                        >
                            💾 Save Changes
                        </button>

                    </div>

                </form>

            </div>

        `;


        const serviceSelect =
            document.getElementById(
                "editServiceType"
            );

        if (serviceSelect) {

            const normalized =
                normalizeService(
                    serviceType
                );

            if (
                normalized ===
                "Full Wash"
            ) {

                serviceSelect.value =
                    "Full Wash";

            }
            else if (
                normalized ===
                "Body Wash"
            ) {

                serviceSelect.value =
                    "Body Wash";

            }
            else if (
                normalized ===
                "Ceramic Coating"
            ) {

                serviceSelect.value =
                    "Ceramic Coating";

            }
            else {

                serviceSelect.value =
                    serviceType;

            }

        }


        const paymentSelect =
            document.getElementById(
                "editPaymentMethod"
            );

        if (paymentSelect) {

            paymentSelect.value =
                String(
                    paymentMethod
                )
                .toUpperCase();

        }


        const amountInput =
            document.getElementById(
                "editAmount"
            );

        const paidInput =
            document.getElementById(
                "editPaidAmount"
            );


        function updateEditBalance() {

            const total =
                Number(
                    amountInput.value
                ) || 0;

            const paid =
                Number(
                    paidInput.value
                ) || 0;

            const balance =
                Math.max(
                    0,
                    total - paid
                );

            const balanceElement =
                document.getElementById(
                    "editBalancePreview"
                );

            if (balanceElement) {

                balanceElement.textContent =
                    "Balance: ₹" +
                    formatMoney(
                        balance
                    );

            }

        }


        amountInput.addEventListener(
            "input",
            updateEditBalance
        );

        paidInput.addEventListener(
            "input",
            updateEditBalance
        );

        updateEditBalance();


        const form =
            document.getElementById(
                "editVehicleForm"
            );

        form.addEventListener(
            "submit",
            function (event) {

                saveEditedVehicle(
                    event,
                    id
                );

            }
        );


        modal.classList.add(
            "show"
        );

    }
    catch (error) {

        console.error(
            "EDIT ERROR:",
            error
        );

        alert(
            "Unable to open vehicle edit form."
        );

    }

}


// =====================================================
// SAVE EDITED VEHICLE
// =====================================================

async function saveEditedVehicle(
    event,
    id
) {

    event.preventDefault();

    const saveButton =
        document.getElementById(
            "editSaveBtn"
        );

    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Saving...";

    }


    const vehicleNumber =
        document.getElementById(
            "editVehicleNumber"
        ).value
        .trim()
        .toUpperCase();

    const ownerName =
        document.getElementById(
            "editOwnerName"
        ).value
        .trim();

    const phone =
        document.getElementById(
            "editPhone"
        ).value
        .trim();

    const vehicleName =
        document.getElementById(
            "editVehicleName"
        ).value
        .trim();

    const serviceType =
        document.getElementById(
            "editServiceType"
        ).value;

    const amount =
        Number(
            document.getElementById(
                "editAmount"
            ).value
        ) || 0;

    const paidAmount =
        Number(
            document.getElementById(
                "editPaidAmount"
            ).value
        ) || 0;

    const paymentMethod =
        document.getElementById(
            "editPaymentMethod"
        ).value;

    const remark =
        document.getElementById(
            "editRemark"
        ).value
        .trim();


    if (!vehicleNumber) {

        alert(
            "Please enter vehicle number."
        );

        resetEditButton();

        return;

    }

    if (!ownerName) {

        alert(
            "Please enter owner name."
        );

        resetEditButton();

        return;

    }

    if (!vehicleName) {

        alert(
            "Please enter vehicle name."
        );

        resetEditButton();

        return;

    }

    if (paidAmount > amount) {

        alert(
            "Amount received cannot be greater than service amount."
        );

        resetEditButton();

        return;

    }


    const balance =
        Math.max(
            0,
            amount - paidAmount
        );


    const updateData = {

        action:
            "updateVehicle",

        id:
            id,

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

        amount:
            amount,

        paidAmount:
            paidAmount,

        balance:
            balance,

        paymentMethod:
            paymentMethod,

        remark:
            remark

    };


    console.log(
        "UPDATING VEHICLE:",
        updateData
    );


    try {

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
                            updateData
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP error: " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "UPDATE VEHICLE RESPONSE:",
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
                    : "Google Sheets update failed."
            );

        }


        alert(
            "✅ Vehicle record updated successfully."
        );


        closeEditVehicle();


        await loadRecords();

    }
    catch (error) {

        console.error(
            "UPDATE VEHICLE ERROR:",
            error
        );

        alert(
            "❌ Unable to update vehicle.\n\n" +
            error.message
        );

    }
    finally {

        resetEditButton();

    }

}


// =====================================================
// RESET EDIT BUTTON
// =====================================================

function resetEditButton() {

    const button =
        document.getElementById(
            "editSaveBtn"
        );

    if (button) {

        button.disabled =
            false;

        button.textContent =
            "💾 Save Changes";

    }

}


// =====================================================
// CLOSE EDIT MODAL
// =====================================================

function closeEditVehicle() {

    const modal =
        document.getElementById(
            "editVehicleModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// =====================================================
// CLOSE MODALS OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        const detailsModal =
            document.getElementById(
                "detailsModal"
            );

        if (
            detailsModal &&
            event.target ===
                detailsModal
        ) {

            closeDetails();

        }


        const editModal =
            document.getElementById(
                "editVehicleModal"
            );

        if (
            editModal &&
            event.target ===
                editModal
        ) {

            closeEditVehicle();

        }

    }
);


// =====================================================
// CONNECTION ERROR
// =====================================================

function showConnectionError() {

    const tbody =
        document.getElementById(
            "recordsTable"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>

            <td
                colspan="16"
                class="empty-row"
            >

                <strong>
                    Cannot connect to Google Sheets.
                </strong>

                <br>

                Please check the Google Apps Script
                URL and deployment.

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

}

