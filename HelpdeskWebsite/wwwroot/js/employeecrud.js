$(() => { // main jQuery routine - executes every on page load, $ is short for jquery
    const getAll = async (msg) => {
        try {
            $("#employeeList").text("Finding Employee Information...");
            let response = await fetch(`api/employee`);
            if (response.ok) {
                let payload = await response.json();
                buildEmployeeList(payload);
                msg === "" ? $("#status").text("Employees Loaded") : $("#status").text(`${msg} - Employees Loaded`);
            } else if (response.status !== 404) {
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else {
                $("#status").text("no such path on server");
            }

            response = await fetch(`api/department`);
            if (response.ok) {
                let deps = await response.json();
                sessionStorage.setItem("alldepartments", JSON.stringify(deps));
            } else if (response.status !== 404) {
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else {
                $("#status").text("no such path on server");
            }
        } catch (error) {
            $("#status").text(error.message);
        }
    };

    const buildEmployeeList = (data) => {
        $("#employeeList").empty();
        div = $(`<div class="list-group-item text-white bg-secondary row d-flex" id="status">Employee Info</div>
                 <div class= "list-group-item row d-flex text-center" id="heading">
                 <div class="col-4 h4">Title</div>
                 <div class="col-4 h4">First</div>
                 <div class="col-4 h4">Last</div>
                 </div>`);
        div.appendTo($("#employeeList"));
        sessionStorage.setItem("allemployees", JSON.stringify(data));
        btn = $(`<button class="list-group-item row d-flex" id="0">...click to add employee</button>`);
        btn.appendTo($("#employeeList"));
            data.forEach(emp => {
                btn = $(`<button class="list-group-item row d-flex" id="${emp.id}">`);
                btn.html(`<div class="col-4" id="employeetitle${emp.id}">${emp.title}</div>
                     <div class="col-4" id="employeefname${emp.id}">${emp.firstname}</div>
                     <div class="col-4" id="employeelastnam${emp.id}">${emp.lastname}</div>`);
                btn.appendTo($("#employeeList"));
            }); // forEach
    }; // buildEmployeeList

    const loadDepartmentDDL = (empdep) => {
        let html = '';
        $('#ddlDepartments').empty();
        let alldepartments = JSON.parse(sessionStorage.getItem('alldepartments')) || [];
        alldepartments.forEach((dep) => {
            if (dep && dep.id && dep.name) { // Ensure dep has the necessary properties
                html += `<option value="${dep.id}">${dep.name}</option>`;
            }
        });
        $('#ddlDepartments').append(html);
        $('#ddlDepartments').val(empdep); // Set the selected value
    };

    getAll(""); // first grab the data from the server

    // New setup functions
    const setupForAdd = () => {
        $("#actionbutton").val("add");
        $("#modaltitle").html("<h4>add employee</h4>");
        $("#theModal").modal("toggle");
        $("#modalstatus").text("add new employee");
        $("#theModalLabel").text("Add");
        clearModalFields();
        $("#deletebutton").hide();
    }; // setupForAdd

    const setupForUpdate = (id, data) => {
        $("#actionbutton").val("update");
        $("#modaltitle").html("<h4>update employee</h4>");
        clearModalFields();
        data.forEach(employee => {
            if (employee.id === parseInt(id)) {
                $("#TextBoxTitle").val(employee.title);
                $("#TextBoxFirst").val(employee.firstname);
                $("#TextBoxLast").val(employee.lastname);
                $("#TextBoxEmail").val(employee.email);
                $("#TextBoxPhone").val(employee.phoneno);
                sessionStorage.setItem("employee", JSON.stringify(employee));
                loadDepartmentDDL(employee.departmentId);
                $("#modalstatus").text("update data");
                $("#theModal").modal("toggle");
                $("#theModalLabel").text("Update");
                $("#deletebutton").show();
            } // if
        }); // data.forEach
    }; // setupForUpdate

    // Update click handler
    $("#employeeList").on('click', (e) => {
        if (!e) e = window.event;
        let id = e.target.parentNode.id;
        if (id === "employeeList" || id === "") {
            id = e.target.id;
        }

        let data = JSON.parse(sessionStorage.getItem("allemployees"));

        // Single line of code to determine add or update
        id === "0" ? setupForAdd() : setupForUpdate(id, data);

        return false; // ignore if they clicked on heading or status
    }); // employeeListClick

    // New update function
    const update = async (e) => {
        try {
            let emp = JSON.parse(sessionStorage.getItem("employee"));
            emp.title = $("#TextBoxTitle").val();
            emp.firstname = $("#TextBoxFirst").val();
            emp.lastname = $("#TextBoxLast").val();
            emp.email = $("#TextBoxEmail").val();
            emp.phoneno = $("#TextBoxPhone").val();
            emp.departmentId = parseInt($("#ddlDepartments").val());

            let response = await fetch("api/employee", {
                method: "PUT",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(emp),
            });

            if (response.ok) {
                let payload = await response.json();
                $("#status").text(payload.msg);
            } else if (response.status !== 404) {
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else {
                $("#status").text("no such path on server");
            }
        } catch (error) {
            $("#status").text(error.message);
            console.table(error);
        }
        $("#theModal").modal("toggle");
    }; // update

    const clearModalFields = () => {
        $("#TextBoxTitle").val("");

        $("#TextBoxFirst").val("");
        $("#TextBoxLast").val("");
        $("#TextBoxEmail").val("");
        $("#TextBoxPhone").val("");
        sessionStorage.removeItem("employee");
        loadDepartmentDDL(-1);
        $("#theModal").modal("toggle");
    }; // clearModalFields

    const add = async () => {
        try {
            let stu = {
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
            let response = await fetch("api/employee", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(stu)
            });
            if (response.ok) {
                let data = await response.json();
                getAll(data.msg);
            } else if (response.status !== 404) {
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else {
                $("#status").text("no such path on server");
            }
        } catch (error) {
            $("#status").text(error.message);
        }
        $("#theModal").modal("toggle");
    };

    const _delete = async () => {
        let employee = JSON.parse(sessionStorage.getItem("employee"));
        try {
            let response = await fetch(`api/employee/${employee.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
            if (response.ok) {
                let data = await response.json();
                getAll(data.msg);
            } else {
                $('#status').text(`Status - ${response.status}, Problem on delete server side, see server console`);
            }
            $('#theModal').modal('toggle');
        } catch (error) {
            $('#status').text(error.message);
        }
    };

    $("#deletebutton").on("click", () => {
        _delete();
    });

    // Assign the update function to the action button click event
    $("#actionbutton").on("click", () => {
        $("#actionbutton").val() === "update" ? update() : add();
    }); // actionbutton click

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
