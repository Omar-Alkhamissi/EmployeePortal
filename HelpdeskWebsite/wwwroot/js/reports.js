$(() => {
    // Employee Report Button functionality
    $("#employeeReportButton").on("click", async () => {
        try {
            $("#lblstatus").text("Generating Employee Report on server - please wait...");
            let response = await fetch(`/api/Report/employeereport`);
            if (!response.ok)
                throw new Error(
                    `Status - ${response.status}, Text - ${response.statusText}`
                );
            let data = await response.json();
            $("#lblstatus").text("Employee report generated");
            data.msg === "Report Generated"
                ? window.open("/pdfs/EmployeeReport.pdf")
                : $("#lblstatus").text("Problem generating Employee report");
        } catch (error) {
            $("#lblstatus").text(error.message);
        }
    });

    // Call Report Button functionality
    $("#callReportButton").on("click", async () => {
        try {
            $("#lblstatus").text("Generating Call Report on server - please wait...");
            let response = await fetch(`/api/Report/callreport`);
            if (!response.ok)
                throw new Error(
                    `Status - ${response.status}, Text - ${response.statusText}`
                );
            let data = await response.json();
            $("#lblstatus").text("Call report generated");
            data.msg === "Call Report Generated Successfully"
                ? window.open("/pdfs/CallReport.pdf")
                : $("#lblstatus").text("Problem generating Call report");
        } catch (error) {
            $("#lblstatus").text(error.message);
        }
    });
});
