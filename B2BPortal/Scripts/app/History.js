$(function () {
    $("table tr:gt(0)")
        .on("click", function () {
            location.href = "/Admin/PreApproval/Edit/" + $(this).data("id");
        });
    $("#btnFilter").on("click", ProcessFilter);
    $("#btnResetFilter").on("click", resetFilter);

    function ProcessFilter() {
        data = SiteUtil.GetDataObject("#filterItems");
        $("table.table tr.bg-rowEdit").remove();
        SiteUtil.AjaxCall("/api/Admin/GetHistory", data, FillTable, "GET");
    }

    function FillTable(res) {
        if (res.length == 0) {
            var tr = $("<tr>")
                .addClass("bg-rowEdit")
                .appendTo("table.table");
            $("<td>")
                .attr("colspan", "8")
                .html("No records found matching that criteria. Please modify and try again.")
                .appendTo(tr);
            return;
        }

        for (var x = 0; x < res.length; x++) {

            var desc = (res[x].status != null && res[x].status.length > 80) ? res[x].status.substring(0, 80) + "..." : res[x].status;

            var tr = $("<tr>")
                .data("data", res[x])
                .attr("title", "Click for detail")
                .addClass("bg-rowEdit")
                .css({ "cursor": "pointer" })
                .on("click", ShowDetail)
                .appendTo("table.table");
            $("<td>").html(res[x].emailAddress).appendTo(tr);
            $("<td>").html(res[x].firstName).appendTo(tr);
            $("<td>").html(res[x].lastName).appendTo(tr);
            $("<td>").html(desc).appendTo(tr);
            $("<td>").html(SiteUtil.UtcToLocal(res[x].requestDate)).appendTo(tr);
            $("<td>").html(SiteUtil.UtcToLocal(res[x].lastModDate)).appendTo(tr);
            $("<td>").html(res[x].authUser).appendTo(tr);
            $("<td>").html(res[x].preAuthed).appendTo(tr);
        }
    }
    function ShowDetail(evt) {
        var data = $(evt.currentTarget).data("data");
        var requestH = $("<div/>");
        var response = "";
        var bg = "";
        for (col in data) {
            var ds = "";
            if (data[col] != null) {
                switch (col) {
                    case "docType":
                        continue;
                    case "invitationResult":
                        response = GetInvitationResult(data[col]);
                        continue;
                    case "requestDate":
                    case "lastModDate":
                        ds = (new Date(data[col])).toLocaleString();
                        break;
                    case "disposition":
                        ds = getDis(data[col]);
                        break;
                    default:
                        ds = data[col].toString().replace(/\r\n/g, "<br/>");
                }
                if (ds.length > 0) {
                    $("<div />")
                        .html("<span class='label'>" + SiteUtil.DeTC(col) + "</span><span class='data'>" + ds + "</span>")
                        .appendTo(requestH);
                }
            }
        }

        $("#inviteDetails h4.modal-title").html("Detail - " + data.emailAddress);
        $("#request").append(requestH.children());
        $("#response").append(response.children());
        $("#inviteDetails").modal();
        $('#inviteDetails a:first').tab('show');
    }
    function GetInvitationResult(data) {
        var res = $("<div/>");
        for (col in data) {
            var ds = "";
            if (data[col] != null) {
                switch (col) {
                    case "@odata.context":
                    case "invitedUserMessageInfo":
                    case "invitedUser":
                        break;
                    case "status":
                        status = data[col].toString();
                        ds = data[col].toString().replace(/\r\n/g, "<br/>");
                        break;
                    case "errorInfo":
                        if (status == "Error") {
                            ds = data[col].toString().replace(/\r\n/g, "<br/>");
                        }
                        break;
                    default:
                        ds = data[col].toString().replace(/\r\n/g, "<br/>");
                }
                if (ds.length > 0) {
                    $("<div />")
                        .html("<span class='label'>" + SiteUtil.DeTC(col) + "</span><span class='data'>" + ds + "</span>")
                        .appendTo(res);
                }
            }
        }
        return res.html();
    }

    function getDis(dis) {
        switch (dis) {
            case 0:
                return "Approved";
            case 1:
                return "AutoApproved";
            case 2:
                return "Denied";
            case 3:
                return "Pending";
            case 4:
                return "QueuePending";
            default:
                return "Unknown (" + dis + ")";
        }
    }
    $('#datepickerfrom').datetimepicker({
        format: 'MM/DD/YYYY'
    });
    $('#datepickerto').datetimepicker({
        format: 'MM/DD/YYYY',
        useCurrent: false
    });
    $("#datepickerfrom").on("dp.change", function (e) {
        $("#datepickerto").data("DateTimePicker").minDate(e.date);
    });
    $("#datepickerto").on("dp.change", function (e) {
        $("#datepickerfrom").data("DateTimePicker").maxDate(e.date);
    });

    function resetFilter() {
        $("#datepickerfrom").data("DateTimePicker").date(moment().utc().startOf('year').format('MM/DD/YYYY'));
        $("#datepickerto").data("DateTimePicker").date(moment().utc().add(1, 'd').format('MM/DD/YYYY'));
        $("#AuthUser").val("");
        ProcessFilter();
    }
    resetFilter();
});
