$(function () {
    // Show delete confirmation dialog when Delete button is clicked
    $('#deletebutton').on('click', () => {
        $('#dialog').slideDown(); // Slide down for a smooth appearance
    });

    $('#srch').on('input', function () {
        const searchValue = $(this).val().toLowerCase();
        $('#employeeList tr').each(function () {
            const rowText = $(this).text().toLowerCase();
            if (rowText.includes(searchValue)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    $('#yesbutton').on('click', async () => {
        const employeeId = $('#employeeId').val();
        const employeeLastName = $('#TextBoxSurname').val();

        if (employeeId) {
            await deleteEmployee(employeeId);
            $('#dialog').hide();
            showTopStatusMessage(`Employee ${employeeLastName} deleted successfully!`, 'success');
            $('#employeeModal').modal('hide');
            getAllEmployees();
        }
    });

    $('#nobutton').on('click', () => {
        $('#dialog').slideUp();
        showModalStatusMessage("Delete cancelled", 'info');
    });

    $('#actionbutton').on('click', async () => {
        if ($('#employeeId').val() && !validateEmployeeForm()) {
            return; // Do not proceed if validation fails for update
        }

        const employeeId = $('#employeeId').val();
        if (employeeId) {
            console.log("Updating employee with ID:", employeeId);
            await updateEmployee(employeeId);
        } else {
            console.log("Adding new employee");
            await addEmployee();
        }
        getAllEmployees();
    });

    $('#addEmployeeButton').on('click', () => {
        clearAddModalFields();
        $('#addEmployeeModal').modal('show');
        $('#employeeModal').modal('hide');
    });


    // Shared event listener for input fields in both modals
    $('input').on('input', function () {
        const inputId = $(this).attr('id');

        // Check the input field and call the appropriate validation function
        if (inputId === 'TextBoxTitle' || inputId === 'AddTextBoxTitle') {
            validateTitle($(this));
        } else if (inputId === 'TextBoxFirstName' || inputId === 'AddTextBoxFirstName') {
            validateFirstName($(this));
        } else if (inputId === 'TextBoxEmail' || inputId === 'AddTextBoxEmail') {
            validateEmail($(this));
        }

        // Toggle buttons for respective modals
        toggleUpdateButton();
        toggleAddButton();
    });

    // Function to validate Title
    function validateTitle(inputField) {
        const value = inputField.val();
        if (!['Mr.', 'Ms.', 'Mrs.', 'Dr.'].includes(value)) {
            showValidationMessage(inputField, "Title must be Mr., Ms., Mrs., or Dr.");
            return false;
        } else {
            clearValidationMessage(inputField);
            return true;
        }
    }

    // Function to validate First Name
    function validateFirstName(inputField) {
        const value = inputField.val();
        if (!value || value.length < 1 || value.length > 25) {
            showValidationMessage(inputField, "First Name must be 1-25 characters long.");
            return false;
        } else {
            clearValidationMessage(inputField);
            return true;
        }
    }

    // Function to validate Email
    function validateEmail(inputField) {
        const value = inputField.val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showValidationMessage(inputField, "Email must be in a valid format (e.g., name@example.com).");
            return false;
        } else {
            clearValidationMessage(inputField);
            return true;
        }
    }

    // Function to show validation message under the input field
    function showValidationMessage(inputField, message) {
        if (inputField.next('.validation-message').length === 0) {
            inputField.after(`<div class="validation-message text-danger">${message}</div>`);
        }
    }

    // Function to clear validation message
    function clearValidationMessage(inputField) {
        inputField.next('.validation-message').remove();
    }

    // Validation function for Update Modal
    function validateEmployeeForm() {
        const isTitleValid = validateTitle($('#TextBoxTitle'));
        const isFirstNameValid = validateFirstName($('#TextBoxFirstName'));
        const isEmailValid = validateEmail($('#TextBoxEmail'));
        return isTitleValid && isFirstNameValid && isEmailValid;
    }

    // Validation function for Add Modal
    function validateAddEmployeeForm() {
        const isTitleValid = validateTitle($('#AddTextBoxTitle'));
        const isFirstNameValid = validateFirstName($('#AddTextBoxFirstName'));
        const isEmailValid = validateEmail($('#AddTextBoxEmail'));
        return isTitleValid && isFirstNameValid && isEmailValid;
    }

    // Toggle the Update button visibility based on validation
    function toggleUpdateButton() {
        const isFormValid = validateEmployeeForm();
        if (isFormValid) {
            $('#actionbutton').show(); // Show the button if valid
        } else {
            $('#actionbutton').hide(); // Hide the button if invalid
        }
    }

    // Toggle the Add button visibility based on validation
    function toggleAddButton() {
        const isFormValid = validateAddEmployeeForm();
        if (isFormValid) {
            $('#addNewEmployeeButton').prop('disabled', false);
        } else {
            $('#addNewEmployeeButton').prop('disabled', true);
        }
    }

    // Function to fetch and display all employees
    async function getAllEmployees() {
        try {
            const response = await fetch('/api/Employee');
            if (response.ok) {
                let departments = await response.json();
                sessionStorage.setItem("alldepartments", JSON.stringify(departments));
            } else if (response.status !== 404) {
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else {
                $("#status").text("No such path on server");
            }
        } catch (error) {
            $("#status").text(error.message);
        }
    };

    const buildEmployeeList = (data, usealldata = true) => {
        $("#employeeList").empty();
        const div = $(`<div class="list-group-item text-white bg-secondary row d-flex" id="status">Employee Info</div>
                        <div class="list-group-item row d-flex text-center" id="heading">
                        <div class="col-4 h4">Title</div>
                        <div class="col-4 h4">First</div>
                        <div class="col-4 h4">Last</div>
                        </div>`);
        div.appendTo($("#employeeList"));

        usealldata ? sessionStorage.setItem("allemployees", JSON.stringify(data)) : null;

        const btn = $(`<button class="list-group-item row d-flex" id="0">...click to add employee</button>`);
        btn.appendTo($("#employeeList"));

        data.forEach(emp => {
            const empBtn = $(`<button class="list-group-item row d-flex" id="${emp.id}">`);
            empBtn.html(`<div class="col-4" id="employeetitle${emp.id}">${emp.title}</div>
                          <div class="col-4" id="employeefname${emp.id}">${emp.firstname}</div>
                          <div class="col-4" id="employeelname${emp.id}">${emp.lastname}</div>`);
            empBtn.appendTo($("#employeeList"));
        });
    };

    const loadDepartmentDDL = (depId) => {
        let html = '';
        $('#ddlDepartments').empty();
        const alldepartments = JSON.parse(sessionStorage.getItem('alldepartments'));
        alldepartments.forEach(dep => {
            html += `<option value="${dep.id}">${dep.name}</option>`;
        });
        $('#ddlDepartments').append(html);
        $('#ddlDepartments').val(depId); // Set the selected value
    };

    const setupForAdd = () => {
        $("#actionbutton").val("add");
        $("#modaltitle").html("<h4>Add Employee</h4>");
        $("#employeeModal").modal("toggle");
        $("#modalstatus").text("Add new employee");
        clearModalFields();
        $("#deletebutton").hide(); // Hide delete button
    };

    const setupForUpdate = (id, data) => {
        $("#actionbutton").val("update");
        $("#modaltitle").html("<h4>Update Employee</h4>");
        clearModalFields();
        data.forEach(emp => {
            if (emp.id === parseInt(id)) {
                $("#TextBoxTitle").val(emp.title);
                $("#TextBoxFirst").val(emp.firstname);
                $("#TextBoxLast").val(emp.lastname);
                $("#TextBoxEmail").val(emp.email);
                $("#TextBoxPhone").val(emp.phoneno);
                sessionStorage.setItem("employee", JSON.stringify(emp));
                loadDepartmentDDL(emp.departmentId); // Load department dropdown
                $("#employeeModal").modal("toggle");
                $("#deletebutton").show();
            }
        });
    };

    $("#employeeList").on('click', (e) => {
        const id = e.target.parentNode.id || e.target.id;
        const data = JSON.parse(sessionStorage.getItem("allemployees"));
        id === "0" ? setupForAdd() : setupForUpdate(id, data);
    });

    const update = async () => {
        try {
            const emp = JSON.parse(sessionStorage.getItem("employee"));
            emp.title = $("#TextBoxTitle").val();
            emp.firstname = $("#TextBoxFirst").val();
            emp.lastname = $("#TextBoxLast").val();
            emp.email = $("#TextBoxEmail").val();
            emp.phoneno = $("#TextBoxPhone").val();
            emp.departmentId = parseInt($("#ddlDepartments").val());

            const response = await fetch("api/employee", {
                method: "PUT",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(emp),
            });

            if (response.ok) {
                const payload = await response.json();
                $("#status").text(payload.msg);
                getAll(payload.msg);
            } else {
                const problemJson = await response.json();
                errorRtn(problemJson, response.status);
            }
        } catch (error) {
            $("#status").text(error.message);
        }
        $("#employeeModal").modal("toggle");
    };

    const clearModalFields = () => {
        $("#TextBoxTitle").val("");
        $("#TextBoxFirst").val("");
        $("#TextBoxLast").val("");
        $("#TextBoxEmail").val("");
        $("#TextBoxPhone").val("");
        loadDepartmentDDL(-1);
        sessionStorage.removeItem("employee");
    };

    const add = async () => {
        try {
            const emp = {
                title: $("#TextBoxTitle").val(),
                firstname: $("#TextBoxFirst").val(),
                lastname: $("#TextBoxLast").val(),
                email: $("#TextBoxEmail").val(),
                phoneno: $("#TextBoxPhone").val(),
                departmentId: parseInt($("#ddlDepartments").val()),
                id: -1,
                timer: null,
                picture64: null
            };

            const response = await fetch("api/employee", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(emp),
            });

            if (response.ok) {
                const data = await response.json();
                getAll(data.msg);
            } else {
                const problemJson = await response.json();
                errorRtn(problemJson, response.status);
            }
        } catch (error) {
            $("#status").text(error.message);
        }
        $("#employeeModal").modal("toggle");
    };

    const _delete = async () => {
        const emp = JSON.parse(sessionStorage.getItem("employee"));
        try {
            const response = await fetch(`api/employee/${emp.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });

            if (response.ok) {
                const data = await response.json();
                getAll(data.msg);
            } else {
                $("#status").text(`Error: ${response.status}`);
            }
        } catch (error) {
            $("#status").text(error.message);
        }
        $("#employeeModal").modal("toggle");
    };

    $("#deletebutton").on("click", () => _delete());
    $("#actionbutton").on("click", () => $("#actionbutton").val() === "update" ? update() : add());
    $("#srch").on("keyup", () => {
        const alldata = JSON.parse(sessionStorage.getItem("allemployees"));
        const filtereddata = alldata.filter(emp => emp.lastname.match(new RegExp($("#srch").val(), 'i')));
        buildEmployeeList(filtereddata, false);
    });

    getAll("");
});
