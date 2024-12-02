$(() => { // main jQuery routine - executes every on page load, $ is short for jquery



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
            TextBoxTitle: { maxlength: 4, required: true, validTitle: true },
            TextBoxFirst: { maxlength: 25, required: true },
            TextBoxLast: { maxlength: 25, required: true },
            TextBoxEmail: { maxlength: 40, required: true, email: true },
            TextBoxPhone: { maxlength: 15, required: true }
        },
        errorElement: "div", // Display error messages in <div>
        errorPlacement: (error, element) => {
            error.addClass("text-warning"); // Add a Bootstrap class for styling
            error.insertAfter(element); // Place the error message after the input
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
        return ["Mr.", "Ms.", "Mrs.", "Dr."].includes(value);
    }, "Invalid title");


    const loadDepartmentDDL = (empdiv) => {
        html = '';
        $('#ddlDepartment').empty();
        let alldepartnments = JSON.parse(sessionStorage.getItem('alldepartments'));
        alldepartnments.forEach((div) => { html += `<option value="${div.id}">${div.name}</option>` });
        $('#ddlDepartment').append(html);
        $('#ddlDepartment').val(empdiv);
    }; // loadDivisionDDL


    const getAll = async (msg) => {
        try {
            $("#employeeList").text("Finding employee Information...");
            let response = await fetch(`api/employee`);
            if (response.ok) {
                let payload = await response.json(); // this returns a promise, so we await it
                buildEmployeeList(payload);
                msg === "" ? // are we appending to an existing message
                    $("#status").text("Employees Loaded") : $("#status").text(`${msg} - Employees Loaded`);
            } else if (response.status !== 404) { // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            } // else

            response = await fetch(`api/department`);
            if (response.ok) {
                let divs = await response.json(); // this returns a promise, so we await it
                sessionStorage.setItem("alldepartments", JSON.stringify(divs));
            } else if (response.status !== 404) { // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            } // else
        } catch (error) {
            $("#status").text(error.message);
        }
    }; // getAll


    const buildEmployeeList = (data, usealldata = true) => {
        $("#employeeList").empty();
        div = $(`<div class="list-group-item text-white bg-secondary row d-flex" id="status">Employee Info</div>
                 <div class= "list-group-item row d-flex text-center" id="heading">
                 <div class="col-4 h4">Title</div>
                 <div class="col-4 h4">First</div>
                 <div class="col-4 h4">Last</div>
                 </div>`);
        div.appendTo($("#employeeList"));
        usealldata ? sessionStorage.setItem("allemployees", JSON.stringify(data)) : null;
        btn = $(`<button class="list-group-item row d-flex" id="0">...click to add employee</button>`);
        btn.appendTo($("#employeeList"));
        data.forEach(emp => {
            btn = $(`<button class="list-group-item row d-flex" id="${emp.id}">`);
            btn.html(`<div class="col-4" id="employeetitle${emp.id}">${emp.title}</div>
                     <div class="col-4" id="employeefname${emp.id}">${emp.firstname}</div>
                     <div class="col-4" id="employeelastnam${emp.id}">${emp.lastname}</div>`
                                );
            btn.appendTo($("#employeeList"));
        }); // forEach
    }; // buildEmployeeList
    getAll(""); // first grab the data from the server

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

