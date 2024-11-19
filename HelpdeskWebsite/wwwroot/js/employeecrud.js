$(() => {
    // Fetch and display all employees
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
                $("#status").text("No such path on server");
            }

            // Fetch and store departments in sessionStorage
            response = await fetch(`api/department`);
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
