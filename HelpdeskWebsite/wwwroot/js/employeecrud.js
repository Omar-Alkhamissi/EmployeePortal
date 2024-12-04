$(() => { // main jQuery routine - executes every time the page loads, $ is shorthand for jQuery

    // Keyup listener for real-time validation feedback
    document.addEventListener("keyup", () => {
        $("#modalstatus").removeClass(); // Remove any existing CSS classes
        if ($("#EmployeeModalForm").valid()) {
            $("#modalstatus").attr("class", "badge bg-success"); // Green badge for valid data
            $("#modalstatus").text("Data entered is valid");
        } else {
            $("#modalstatus").attr("class", "badge bg-danger"); // Red badge for invalid data
            $("#modalstatus").text("Fix errors");
        }
    });

    // Initialize jQuery Validation
    $("#EmployeeModalForm").validate({
        rules: {
            TextBoxTitle: { maxlength: 4, required: true, validTitle: true }, // Custom rule for title validation
            TextBoxFirst: { maxlength: 25, required: true }, // First name rules
            TextBoxLast: { maxlength: 25, required: true }, // Last name rules
            TextBoxEmail: { maxlength: 40, required: true, email: true }, // Email rules
            TextBoxPhone: { maxlength: 15, required: true } // Phone number rules
        },
        errorElement: "div", // Display error messages in <div>
        errorPlacement: (error, element) => {
            error.addClass("text-warning"); // Add Bootstrap styling for error messages
            error.insertAfter(element); // Place the error message after the input field
        },
        messages: {
            TextBoxTitle: {
                required: "Required 1-4 chars.",
                maxlength: "Maximum 4 chars.",
                validTitle: "Valid titles: Mr., Ms., Mrs., Dr."
            },
            TextBoxFirst: {
                required: "Required 1-25 chars.",
                maxlength: "Maximum 25 chars."
            },
            TextBoxLast: {
                required: "Required 1-25 chars.",
                maxlength: "Maximum 25 chars."
            },
            TextBoxPhone: {
                required: "Required 1-15 chars.",
                maxlength: "Maximum 15 chars."
            },
            TextBoxEmail: {
                required: "Required 1-40 chars.",
                maxlength: "Maximum 40 chars.",
                email: "Enter a valid email address."
            }
        }
    });

    // Custom Validation Rule for Title
    $.validator.addMethod("validTitle", (value) => {
        return ["Mr.", "Ms.", "Mrs.", "Dr."].includes(value); // Allow specific titles
    }, "Invalid title");

    // Load department dropdown list with data from sessionStorage
    const loadDepartmentDDL = (empdiv) => {
        let html = ''; // Initialize dropdown HTML
        $('#ddlDepartment').empty(); // Clear existing dropdown options
        let alldepartments = JSON.parse(sessionStorage.getItem('alldepartments')); // Fetch departments from sessionStorage
        alldepartments.forEach((div) => {
            html += `<option value="${div.id}">${div.name}</option>`; // Create options dynamically
        });
        $('#ddlDepartment').append(html); // Append options to the dropdown
        $('#ddlDepartment').val(empdiv); // Set selected value
    }; // loadDepartmentDDL

    // Fetch and load employee and department data from the server
    const getAll = async (msg) => {
        try {
            $("#employeeList").text("Finding employee Information...");
            let response = await fetch(`api/employee`); // Fetch employee data
            if (response.ok) {
                let payload = await response.json(); // Parse JSON response
                buildEmployeeList(payload); // Build the employee list on the page
                msg === "" ?
                    $("#status").text("Employees Loaded") : $("#status").text(`${msg} - Employees Loaded`);
            } else if (response.status !== 404) {
                let problemJson = await response.json();
                errorRtn(problemJson, response.status); // Handle errors
            } else {
                $("#status").text("No such path on server"); // Handle 404 error
            }

            response = await fetch(`api/department`); // Fetch department data
            if (response.ok) {
                let divs = await response.json(); // Parse JSON response
                sessionStorage.setItem("alldepartments", JSON.stringify(divs)); // Store in sessionStorage
            } else if (response.status !== 404) {
                let problemJson = await response.json();
                errorRtn(problemJson, response.status); // Handle errors
            } else {
                $("#status").text("No such path on server"); // Handle 404 error
            }
        } catch (error) {
            $("#status").text(error.message); // Display error messages
        }
    }; // getAll

    // Build and display the employee list
    const buildEmployeeList = (data, usealldata = true) => {
        $("#employeeList").empty(); // Clear the current list
        let div = $(`<div class="list-group-item text-white bg-secondary row d-flex" id="status">Employee Info</div>
                     <div class="list-group-item row d-flex text-center" id="heading">
                     <div class="col-4 h4">Title</div>
                     <div class="col-4 h4">First</div>
                     <div class="col-4 h4">Last</div>
                     </div>`);
        div.appendTo($("#employeeList")); // Add header to the list
        usealldata ? sessionStorage.setItem("allemployees", JSON.stringify(data)) : null; // Store data if required
        let btn = $(`<button class="list-group-item row d-flex" id="0">...click to add employee</button>`);
        btn.appendTo($("#employeeList")); // Add "Add Employee" button
        data.forEach(emp => {
            btn = $(`<button class="list-group-item row d-flex" id="${emp.id}">`);
            btn.html(`<div class="col-4" id="employeetitle${emp.id}">${emp.title}</div>
                      <div class="col-4" id="employeefname${emp.id}">${emp.firstname}</div>
                      <div class="col-4" id="employeelastname${emp.id}">${emp.lastname}</div>`);
            btn.appendTo($("#employeeList")); // Append each employee's details as a button
        }); // forEach
    }; // buildEmployeeList

    // Load initial data from the server on page load
    getAll("");

    // Update Employee
    const update = async (e) => {
        // action button click event handler
        try {
            // set up a new client side instance of Employee
            let emp = JSON.parse(sessionStorage.getItem("employee"));
            // pouplate the properties
            emp.title = $("#TextBoxTitle").val();
            emp.phoneno = $("#TextBoxPhone").val();
            emp.firstname = $("#TextBoxFirst").val();
            emp.lastname = $("#TextBoxLast").val();
            emp.email = $("#TextBoxEmail").val();
            emp.departmentId = parseInt($("#ddlDepartment").val());

            // send the updated back to the server asynchronously using Http PUT
            let response = await fetch("api/employee", {
                method: "PUT",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(emp),
            });
            if (response.ok) {
                // or check for response.status
                let payload = await response.json();
                getAll(payload.msg);

                $("#status").text(payload.msg)
                $("#theModal").modal("toggle");

            } else if (response.status !== 404) {
                // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else {
                // else 404 not found
                $("#status").text("no such path on server");
            } // else
        } catch (error) {
            $("#status").text(error.message);
            console.table(error);
        } // try/catch
        getAll(payload.msg);

    }; // update

    $("#employeeList").on('click', (e) => {
        if (!e) e = window.event;
        let id = e.target.parentNode.id;
        if (id === "employeeList" || id === "") {
            id = e.target.id;
        } // clicked on row somewhere else
        if (id !== "status" && id !== "heading") {
            let data = JSON.parse(sessionStorage.getItem("allemployees"));
            id === "0" ? setupForAdd() : setupForUpdate(id, data);

        } else {
            return false; // ignore if they clicked on heading or status
        }
    }); // employeeListClick

    const clearModalFields = () => {
        loadDepartmentDDL(-1);
        $("#TextBoxTitle").val("");
        $("#TextBoxPhone").val("");
        $("#TextBoxFirst").val("");
        $("#TextBoxLast").val("");
        $("#TextBoxEmail").val("");
        // clean out the other four text boxes go here as well
        sessionStorage.removeItem("employee");
        sessionStorage.removeItem("staffPicture64");
        $("#uploadstatus").text("");
        $("#imageHolder").html("");
        $("#uploader").val("")
        $("#theModal").modal("toggle");
        let validator = $("#EmployeeModalForm").validate();
        validator.resetForm();

    }; // clearModalFields

    const setupForAdd = () => {
        $("#actionbutton").val("add");
        $("#modaltitle").html("<h4>add employee</h4>");
        $("#theModal").modal("toggle");
        $("#modalstatus").text("add new employee");
        $("#theModalLabel").text("Add");
        clearModalFields();
    }; // setupForAdd

    const setupForUpdate = (id, data) => {
        $("#actionbutton").val("update");
        $("#modaltitle").html("<h4>update employee</h4>");
        clearModalFields();
        data.forEach(employee => {
            if (employee.id === parseInt(id)) {
                $("#TextBoxTitle").val(employee.title);
                $("#TextBoxPhone").val(employee.phoneno);
                $("#TextBoxFirst").val(employee.firstname);
                $("#TextBoxLast").val(employee.lastname);
                $("#TextBoxEmail").val(employee.email);
                $("#imageHolder").html(`<img height="120" width="110" src="data:img/png;base64,${employee.staffPicture64}" />`);

                sessionStorage.setItem("employee", JSON.stringify(employee));
                $("#modalstatus").text("update data");
                $("#theModal").modal("toggle");
                $("#theModalLabel").text("Update");

                loadDepartmentDDL(employee.departmentId);


            } // if
        }); // data.forEach
    }; // setupForUpdate

    const add = async () => {
        try {
            emp = new Object();
            emp.isTech = null;
            emp.title = $("#TextBoxTitle").val();
            emp.phoneno = $("#TextBoxPhone").val();
            emp.firstname = $("#TextBoxFirst").val();
            emp.lastname = $("#TextBoxLast").val();
            emp.email = $("#TextBoxEmail").val();
            emp.departmentId = parseInt($("#ddlDepartment").val());
            // populate the other four properties here from the text box contents
            emp.id = -1;
            emp.timer = null;
            emp.staffpicture64 = null;
            // send the employee info to the server asynchronously using POST
            let response = await fetch("api/employee", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(emp)
            });
            if (response.ok) // or check for response.status
            {
                let data = await response.json();
                getAll(data.msg);
            } else if (response.status !== 404) { // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            } // else
        } catch (error) {
            $("#status").text(error.message);
        } // try/catch
        $("#theModal").modal("toggle");
    }; // add

    $("#actionbutton").on("click", () => {
        $("#actionbutton").val() === "update" ? update() : add();
    }); // actionbutton click


    const _delete = async () => {
        let employee = JSON.parse(sessionStorage.getItem("employee"));
        try {
            let response = await fetch(`api/employee/${employee.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
            if (response.ok) // or check for response.status
            {
                let data = await response.json();
                getAll(data.msg);
            } else {
                $('#status').text(`Status - ${response.status}, Problem on delete server side, see server console`);
            } // else
            $('#theModal').modal('toggle');
        } catch (error) {
            $('#status').text(error.message);
        }
    }; // _delete

    $("input:file").on("change", () => {
        try {
            const reader = new FileReader();
            const file = $("#uploader")[0].files[0];
            $("#uploadstatus").text("");
            file ? reader.readAsBinaryString(file) : null;
            reader.onload = (readerEvt) => {
                // get binary data then convert to encoded string
                const binaryString = reader.result;
                const encodedString = btoa(binaryString);
                // replace the picture in session storage
                let employee = JSON.parse(sessionStorage.getItem("employee"));
                employee.staffPicture64 = encodedString;
                sessionStorage.setItem("employee", JSON.stringify(employee));
                $("#uploadstatus").text("retrieved local pic")
            };
        } catch (error) {
            $("#uploadstatus").text("pic upload failed")
        }
    }); // input file change


    $("#yesbutton").on("click", () => {
        _delete();
    }); // deletebutton click

    $("#srch").on("keyup", () => {
        let alldata = JSON.parse(sessionStorage.getItem("allemployees"));
        let filtereddata = alldata.filter((emp) => emp.lastname.match(new RegExp($("#srch").val(), 'i')));
        buildEmployeeList(filtereddata, false);
    }); // srch keyup


    $("#dialog").hide();
    $("#dialogbutton").on("click", (e) => {
        $("#dialog").show();
        $("#status").text("");
        $("#dialogbutton").hide();
    });
    $("#nobutton").on("click", (e) => {
        $("#dialog").hide();
        $("#status").text("second thoughts eh?");
        $("#dialogbutton").show();
    });
    $("#yesbutton").on("click", () => {
        $("#dialog").hide();
        $("#status").text("way to go for it!");
        $("#dialogbutton").show();
    });

}); // jQuery ready method

