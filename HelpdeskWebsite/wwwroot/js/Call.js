$(() => {
    const formatDate = (date) => {
        const d = date ? new Date(date) : new Date();
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return d.toLocaleString("en-US", options);
    };

    const loadDropdowns = async () => {
        try {
            const problemsResponse = await fetch("api/problem");
            if (problemsResponse.ok) {
                const problems = await problemsResponse.json();
                const problemDropdown = $("#ddlProblem");
                problemDropdown.empty();
                problemDropdown.append('<option value="" disabled selected>Select Problem</option>');
                problems.forEach((problem) => {
                    problemDropdown.append(
                        `<option value="${problem.id}">${problem.description}</option>`
                    );
                });
            }

            const employeesResponse = await fetch("api/employee");
            if (employeesResponse.ok) {
                const employees = await employeesResponse.json();
                const employeeDropdown = $("#ddlEmployee");
                employeeDropdown.empty();
                employeeDropdown.append('<option value="" disabled selected>Select Employee</option>');
                employees.forEach((employee) => {
                    employeeDropdown.append(
                        `<option value="${employee.id}">${employee.lastname || "Unknown"}</option>`
                    );
                });

                const technicianDropdown = $("#ddlTechnician");
                technicianDropdown.empty();
                technicianDropdown.append('<option value="" disabled selected>Select Technician</option>');
                employees
                    .filter((employee) => employee.isTech)
                    .forEach((technician) => {
                        technicianDropdown.append(
                            `<option value="${technician.id}">${technician.lastname || "Unknown"}</option>`
                        );
                    });
            }
        } catch (error) {
            console.error("Error loading dropdowns:", error.message);
        }
    };

    const resetModalForAdd = () => {
        $("#ddlProblem").val("").removeClass("is-invalid").attr("disabled", false);
        $("#ddlEmployee").val("").removeClass("is-invalid").attr("disabled", false);
        $("#ddlTechnician").val("").removeClass("is-invalid").attr("disabled", false);
        $("#TextBoxNotes").val("").removeClass("is-invalid").attr("disabled", false);
        $("#dateOpened").val(formatDate()).attr("disabled", true);
        $("#dateClosed").val("").attr("disabled", true);
        $("#closeCall").prop("checked", false).attr("disabled", false);
        $("#updateButton").hide(); // Hide the Update button
        $("#addButton").show(); // Show the Add button
        $("#deleteButton").hide(); // Hide the Delete button in Add mode
        $("#modalStatus").text(""); // Clear any previous status messages
    };

    const validateCallForm = () => {
        let isValid = true;

        // Clear existing error messages
        $(".validation-error").remove();

        // Validate Problem
        if (!$("#ddlProblem").val()) {
            isValid = false;
            $("#ddlProblem").after('<div class="validation-error text-danger fw-bold">Please select a Problem.</div>');
        }

        // Validate Employee
        if (!$("#ddlEmployee").val()) {
            isValid = false;
            $("#ddlEmployee").after('<div class="validation-error text-danger fw-bold">Please select an Employee.</div>');
        }

        // Validate Technician
        if (!$("#ddlTechnician").val()) {
            isValid = false;
            $("#ddlTechnician").after('<div class="validation-error text-danger fw-bold">Please select a Technician.</div>');
        }

        // Validate Notes
        const notes = $("#TextBoxNotes").val().trim();
        if (!notes) {
            isValid = false;
            $("#TextBoxNotes").after('<div class="validation-error text-danger fw-bold">Please enter Notes (required).</div>');
        } else if (notes.length > 250) {
            isValid = false;
            $("#TextBoxNotes").after('<div class="validation-error text-danger fw-bold">Notes must not exceed 250 characters.</div>');
        }

        return isValid;
    };


    const getAllCalls = async () => {
        try {
            $("#callList").text("Loading calls...");
            const response = await fetch("api/call");
            if (response.ok) {
                const calls = await response.json();
                sessionStorage.setItem("allCalls", JSON.stringify(calls));
                buildCallList(calls);
                const msg = ""; // Replace this with an actual message if needed
                msg === "" ?
                    $("#status").text("Calls Loaded") :
                    $("#status").text(`${msg} - Calls Loaded`);
            } else {
                $("#callList").text("Failed to load calls.");
            }
        } catch (error) {
            $("#callList").text(error.message);
        }
    };

    const buildCallList = (data) => {
        $("#callList").empty();
        const header = `
            <div class="list-group-item text-white bg-secondary row d-flex" id="status">Call Info</div>
            <div class="list-group-item row d-flex text-center" id="heading">
                <div class="col-4 h4">Date Opened</div>
                <div class="col-4 h4">Employee</div>
                <div class="col-4 h4">Problem</div>
            </div>`;
        $("#callList").append(header);
        data.forEach((call) => {
            const button = `
                <button class="list-group-item row d-flex" id="${call.id}">
                    <div class="col-4">${new Date(call.dateOpened).toLocaleDateString()}</div>
                    <div class="col-4">${call.employeeName}</div>
                    <div class="col-4">${call.problemDescription}</div>
                </button>`;
            $("#callList").append(button);
        });
    };

    const setupModal = (id) => {
        const calls = JSON.parse(sessionStorage.getItem("allCalls"));
        if (!calls) {
            console.error("No calls found in sessionStorage.");
            $("#modalStatus").text("Error: Call data is missing.");
            return;
        }

        const call = calls.find((c) => c.id === parseInt(id));
        if (call) {
            sessionStorage.setItem("currentCall", JSON.stringify(call));
            $("#ddlProblem").val(call.problemId);
            $("#ddlEmployee").val(call.employeeId);
            $("#ddlTechnician").val(call.techId);
            $("#TextBoxNotes").val(call.notes || "");
            $("#dateOpened").val(formatDate(call.dateOpened));
            $("#dateClosed").val(call.dateClosed ? formatDate(call.dateClosed) : "");
            $("#closeCall").prop("checked", !call.openStatus);

            if (!call.openStatus) {
                $("#ddlProblem, #ddlEmployee, #ddlTechnician, #TextBoxNotes, #closeCall").attr("disabled", true);
                $("#updateButton").hide();
            } else {
                $("#ddlProblem, #ddlEmployee, #ddlTechnician, #TextBoxNotes, #closeCall").attr("disabled", false);
                $("#updateButton").show();
            }

            $("#addButton").hide();
            $("#deleteButton").show(); // Ensure the Delete button is visible
            $("#callModal").modal("toggle");
        }
    };

    const addCall = async () => {
        if (!validateCallForm()) return;

        const newCall = {
            problemId: $("#ddlProblem").val(),
            employeeId: $("#ddlEmployee").val(),
            techId: $("#ddlTechnician").val(),
            dateOpened: new Date().toISOString(),
            notes: $("#TextBoxNotes").val(),
            openStatus: !$("#closeCall").is(":checked"),
        };

        try {
            // Fetch employee details using the selected employeeId
            const employeeResponse = await fetch(`api/employee/${newCall.employeeId}`);
            if (!employeeResponse.ok) {
                $("#modalStatus").text("Failed to retrieve employee details.");
                return;
            }
            const employee = await employeeResponse.json(); // Assuming this contains the employee object

            // Add the call
            const response = await fetch("api/call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCall),
            });

            if (response.ok) {
                $("#modalStatus").text(`Call added successfully for ${employee.lastname}.`);
                await getAllCalls(); // Ensure calls are loaded first
                const msg = `Call Added Successfully for ${employee.lastname}`;
                $("#status").text(msg);
                $("#callModal").modal("hide");
            } else {
                $("#modalStatus").text("Failed to add call.");
                $("#status").text("Failed to add call.");
            }
        } catch (error) {
            $("#modalStatus").text("Error: " + error.message);
            $("#status").text(`Error: ${error.message}`);
        }
    };

    const updateCall = async () => {
        if (!validateCallForm()) return;

        const call = JSON.parse(sessionStorage.getItem("currentCall"));
        call.problemId = $("#ddlProblem").val();
        call.employeeId = $("#ddlEmployee").val();
        call.techId = $("#ddlTechnician").val();
        call.notes = $("#TextBoxNotes").val();
        call.openStatus = !$("#closeCall").is(":checked");
        call.dateClosed = call.openStatus ? null : new Date().toISOString();

        try {
            const response = await fetch("api/call", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(call),
            });

            if (response.ok) {
                $("#modalStatus").text("Call updated successfully.");
                await getAllCalls(); // Ensure calls are loaded first
                const msg = ""; // Replace with a relevant message if necessary
                msg === "" ?
                    $("#status").text("Call Updated Successfully") :
                    $("#status").text(`${msg} - Call Updated Successfully`);
                $("#callModal").modal("hide");
            } else {
                $("#modalStatus").text("Failed to update call.");
                $("#status").text("Failed to update call.");
            }
        } catch (error) {
            $("#modalStatus").text("Error: " + error.message);
            $("#status").text(`Error: ${error.message}`);
        }
    };

    const deleteCall = async () => {
        const call = JSON.parse(sessionStorage.getItem("currentCall"));
        if (!call || !call.id) {
            $("#modalStatus").text("Error: No call selected for deletion.");
            $("#status").text("Error: No call selected for deletion.");
            return;
        }

        try {
            const response = await fetch(`api/call/${call.id}`, { method: "DELETE" });
            if (response.ok) {
                const result = await response.json();
                $("#modalStatus").text(result.result || "Call deleted successfully.");
                await getAllCalls(); // Ensure calls are loaded first
                const msg = ""; // Replace with a relevant message if needed
                msg === "" ?
                    $("#status").text("Call Deleted Successfully") :
                    $("#status").text(`${msg} - Call Deleted Successfully`);
                $("#callModal").modal("hide");
            } else {
                $("#modalStatus").text("Failed to delete call.");
                $("#status").text("Failed to delete call.");
            }
        } catch (error) {
            $("#modalStatus").text("Error: " + error.message);
            $("#status").text(`Error: ${error.message}`);
        }
    };

    $("#searchBar").on("keyup", () => {
        const allCalls = JSON.parse(sessionStorage.getItem("allCalls"));
        const query = $("#searchBar").val().toLowerCase();

        // Filter calls based on the search input
        const filteredCalls = allCalls.filter((call) =>
            call.employeeName.toLowerCase().includes(query)
        );

        buildCallList(filteredCalls);
    });


    $("#callList").on("click", (e) => {
        const id = e.target.closest("button").id;
        if (id) setupModal(id);
    });

    $("#updateButton").on("click", updateCall);
    $("#addButton").on("click", addCall);
    $("#deleteButton").on("click", deleteCall);
    $("#addCallButton").on("click", () => {
        resetModalForAdd();
        $("#deleteButton").hide(); // Ensure it's hidden for adding new calls
        $("#callModal").modal("show");
    });

    $("#closeCall").on("change", () => {
        if ($("#closeCall").is(":checked")) {
            $("#dateClosed").val(formatDate());
        } else {
            $("#dateClosed").val("");
        }
    });

    $("#callModal").on("hidden.bs.modal", () => {
        resetModalForAdd(); // Reset fields and buttons when modal is closed
        $("#deleteButton").hide(); // Hide delete button on close to prepare for Add mode
    });

    loadDropdowns();
    getAllCalls();
});
