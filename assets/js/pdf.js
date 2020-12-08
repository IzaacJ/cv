$(document).ready(function ($) {
    var headerHeight = $('header').outerHeight(true) + 10;
    $('main').css('padding-top', headerHeight);

    var templates = {
        "html": null,
        "list": null,
        "gallery": null,
        "contact": null,
        "profile": null
    };

    var pdfTemplates = {
        "html": null,
        "list": null,
        "gallery": null,
        "contact": null,
        "profile": null
    };

    var exampleData = false;

    var name = null;
    var born = null;
    var age = null;

    var cvData = null;
    var dataDate = null;

    var pdfDoc = null;
    var pdfHtml = null;
    var pdfDate = null;

    $('body').addClass('loading');
    loadEverything().then((message) => {
        $('body').removeClass('loading');
        $(".print-pdf").click(printPDF);
    });

    function loadEverything() {
        return new Promise(resolve => {
            console.log("Loading templates...")
            loadTemplates().then((message) => {
                loadPDFTemplates().then((message) => {
                    console.log("All templates loaded");
                    console.log("Loading data...")
                    loadData().then(message => {
                        console.log("All data loaded");
                        console.log("Render data...");
                        renderPDF(true).then(message => {
                            console.log("Everything done!");
                            updateDate().then(message => {
                                resolve("Success!");
                            });
                        });
                    });
                });
            });
        });
    }

    function loadTemplates() {
        return new Promise(resolve => {
            var promises = [];
            $.each(templates, (key, value) => {
                promises.push(getTemplate(key));
            });
            Promise.all(promises).then((values) => {
                resolve("Success!");
            });
        });
    }

    function getTemplate(name) {
        return new Promise(resolve => {
            $.ajax({
                type: "GET",
                url: "assets/templates/" + name + ".html",
                success: function (data) {
                    templates[name] = $.templates(data);
                    console.log("Template \"" + name + "\" loaded!");
                    resolve("Success!");
                }
            });
        });
    }

    function loadData() {
        return new Promise(resolve => {
            $.ajax({
                type: "GET",
                url: "assets/data/main.json",
                success: function (data) {
                    cvData = data;
                    resolve("Success!");
                },
                error: function (xhr, s, err) {
                    $.ajax({
                        type: "GET",
                        url: "assets/example/main.example.json",
                        success: function (data) {
                            exampleData = true;
                            cvData = data;
                            resolve("Success!");
                        },
                        error: function (xhr, s, err) {
                            reject("No config found!");
                        }
                    });
                }
            });
        });
    }

    function getSectionData(type) {
        var data = null;
        $.each(cvData.sections, (idx, section) => {
            if (section.type == type) {
                data = section.data;
            }
        });
        return data;
    }

    function getSection(title) {
        var data = null;
        $.each(cvData.sections, (idx, section) => {
            if (section.title == title) {
                data = section;
            }
        });
        return data;
    }

    function renderData() {
        return new Promise(resolve => {
            $.each(cvData.sections, (idx, section) => {
                if (section.disabled == true) return;

                if (section.type == "profile") {
                    name = section.data.name;
                    born = section.data.born;
                    section.data.contact = getSectionData("contact");
                }
                var classes = "";
                var css = "";
                if (undefined !== section.classes)
                    classes = section.classes.join(" ");
                if (undefined !== section.colors) {
                    css = "--articleBackground: " + section.colors.background + "; color: " + section.colors.text + ";";
                }
                if (undefined !== section.css) {
                    $.each(section.css, (idx, obj) => {
                        $.each(obj, (key, value) => {
                            css += key + ": " + value + "; ";
                        });
                    });
                }
                if (section.sort) {
                    section.data.sort((a, b) => {
                        return a.toLowerCase().localeCompare(b.toLowerCase());
                    });
                }
                $('#sections').append(
                    templates[section.type].render({
                        "title": section.title,
                        "classes": classes,
                        "css": css,
                        "data": section.data
                    })
                );
            });
            $("*[data-name]").each((index, elem) => {
                $(elem).html(name);
            });
            $("*[data-born]").each((index, elem) => {
                $(elem).html(born);
            });
            calculateAge(born);
            resolve("Success!");
        });
    }

    function printPDF() {
        $('body').addClass('loading');

        return new Promise(resolve => {
            console.log("Loading PDF templates...")
            loadPDF().then((message) => {
                console.log("Base template loaded");
                console.log("Loading section templates...")
                loadPDFTemplates().then(message => {
                    console.log("All templates loaded");
                    console.log("Render PDF...");
                    renderPDF().then(message => {
                        console.log("Everything done!");
                        printJS({
                            printable: 'pdf',
                            type: 'html',
                            css: ["assets/css/pdf.css", "assets/css/fontawesome.min.css"]
                        });
                        $("#pdf").remove();
                        setTimeout(() => {
                            $("#printJS").remove();
                            $('body').removeClass('loading');
                        }, 1000);
                    });
                });
            });
        });
    }

    function loadPDF() {
        return new Promise(resolve => {
            $.ajax({
                type: "GET",
                url: "pdf.html",
                dataType: "html",
                success: function (data) {
                    pdfHtml = (new DOMParser()).parseFromString(data, "text/html");
                    console.log(pdfHtml);
                    console.log(data);
                    resolve("Success!");
                },
                error: function (xhr, s, err) {
                    pdfHtml = null;
                    reject("No PDF template found!");
                }
            });
        });
    }

    function loadPDFTemplates() {
        return new Promise(resolve => {
            var promises = [];
            $.each(pdfTemplates, (key, value) => {
                promises.push(getPDFTemplate(key));
            });
            Promise.all(promises).then((values) => {
                resolve("Success!");
            });
        });
    }

    function getPDFTemplate(name) {
        return new Promise(resolve => {
            $.ajax({
                type: "GET",
                url: "assets/templates/pdf/" + name + ".html",
                success: function (data) {
                    pdfTemplates[name] = $.templates(data);
                    console.log("PDF Template \"" + name + "\" loaded!");
                    resolve("Success!");
                }
            });
        });
    }

    function renderPDF(preview) {
        return new Promise(resolve => {
            if (pdfHtml == null && (undefined == preview || preview == null || preview == false)) {
                reject("PDF template not loaded!");
            }

            $.each(cvData.pdf.sections, (idx, s) => {
                section = getSection(s);

                if (section.type == "profile") {
                    name = section.data.name;
                    born = section.data.born;
                }

                if (section.disabled == true) return;

                var classes = "";
                if (undefined !== section.classes)
                    classes = section.classes.join(" ");

                if (section.sort) {
                    section.data.sort((a, b) => {
                        return a.toLowerCase().localeCompare(b.toLowerCase());
                    });
                }
                if (undefined != preview && preview != false) {
                    $('#sections').append(
                        pdfTemplates[section.type].render({
                            "title": section.title,
                            "data": section.data,
                            "classes": classes
                        })
                    );
                } else {
                    $(pdfHtml).find('#sections').append(
                        pdfTemplates[section.type].render({
                            "title": section.title,
                            "data": section.data,
                            "classes": classes
                        })
                    );
                }
            });

            if (undefined != preview && preview != false) {
                $("*[data-name]").each((index, elem) => {
                    $(elem).html(name);
                });
                $("*[data-born]").each((index, elem) => {
                    $(elem).html(born);
                });
                $("*[data-age]").each((index, elem) => {
                    $(elem).html(age);
                });
                $("*[data-infodate]").each((index, elem) => {
                    $(elem).html(formatDate(dataDate));
                });
                $("*[data-printdate]").each((index, elem) => {
                    $(elem).html(formatDate(new Date(), null, true));
                });
            } else {
                $(pdfHtml).find("*[data-name]").each((index, elem) => {
                    $(elem).html(name);
                });
                $(pdfHtml).find("*[data-born]").each((index, elem) => {
                    $(elem).html(born);
                });
                $(pdfHtml).find("*[data-age]").each((index, elem) => {
                    $(elem).html(age);
                });
                $(pdfHtml).find("*[data-infodate]").each((index, elem) => {
                    $(elem).html(formatDate(dataDate));
                });
                $(pdfHtml).find("*[data-printdate]").each((index, elem) => {
                    $(elem).html(formatDate(new Date(), null, true));
                });
                $("body").append("<div id=\"pdf\">" + $(pdfHtml.body).html() + "</div>");
            }
            resolve("Success!");
        });
    }

    function updateDate() {
        return new Promise(resolve => {
            formatDate(new Date(document.lastModified), "html_date", true, true);
            $.ajax("assets/js/main.js", { dataType: "text" }).done((d, s, xhr) => {
                dataDate = Date.parse(xhr.getResponseHeader("Last-Modified"));
                formatDate(dataDate, "system_date", true, true);
                $.ajax("assets/css/main.css", { dataType: "text" }).done((d, s, xhr) => {
                    formatDate(Date.parse(xhr.getResponseHeader("Last-Modified")), "css_date", true, true);
                    if (!exampleData) {
                        $.ajax("assets/data/main.json", { dataType: "text" }).done((d, s, xhr) => {
                            formatDate(Date.parse(xhr.getResponseHeader("Last-Modified")), "info_date", true, true);
                            resolve("Success!");
                        }).fail((xhr, s, err) => {
                            console.log("ERROR - info_date - " + err);
                            reject("info_date failed!");
                        });
                    } else {
                        $.ajax("assets/example/main.example.json", { dataType: "text" }).done((d, s, xhr) => {
                            formatDate(Date.parse(xhr.getResponseHeader("Last-Modified")), "info_date", true, true);
                            resolve("Success!");
                        }).fail((xhr, s, err) => {
                            console.log("ERROR - info_date - " + err);
                            reject("info_date failed!");
                        });
                    }
                }).fail((xhr, s, err) => {
                    console.log("ERROR - css_date - " + err);
                    reject("css_date failed!");
                });
            }).fail((xhr, s, err) => {
                console.log("ERROR - system_date - " + err);
                reject("system_date failed!");
            });
        });
    }

    function formatDate(date, elemid, time, timezone) {
        var fd = new Date(date);
        var out = '';
        y = fd.getFullYear();
        m = fd.getMonth() + 1; // Add one to get correct month. Months start at 0 in JS.
        d = fd.getDate();
        h = fd.getHours();
        mm = fd.getMinutes();
        tz = fd.getTimezoneOffset();

        // Leading zeros?
        if (m < 10) {
            m = '0' + m;
        }
        if (d < 10) {
            d = '0' + d;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }

        tt = -(tz / 60);

        if (undefined != time && time != false && undefined != timezone && timezone != false) {
            out = y + '-' + m + '-' + d + ' ' + h + ':' + mm + ' GMT' + (tz < 0 ? '+' + tt : (tz > 0 ? tt : ''));
        } else if (undefined != time && time != false && (undefined == timezone || timezone == false)) {
            out = y + '-' + m + '-' + d + ' ' + h + ':' + mm;
        } else if ((undefined == time || time == false) && (undefined == timezone || timezone == false)) {
            out = y + "-" + m + "-" + d;
        }
        if (undefined != elemid && elemid != null) {
            $("#" + elemid).html(out);
        } else {
            return out;
        }
    }

    function calculateAge(date) {
        var born = new Date(date);
        var by = born.getFullYear();
        var bm = born.getMonth() + 1; // Add one to get correct month. Months start at 0 in JS.
        var bd = born.getDate();

        var current = new Date();
        var cy = current.getFullYear();
        var cm = current.getMonth() + 1; // Add one to get correct month. Months start at 0 in JS.
        var cd = current.getDate();

        var a = (cy - by);
        // Check if birthday is today or in the past, otherwise subtract one year.
        if (
            (cm < bm) || // Birthmonth has NOT passed and is NOT now
            (cm == bm && cd < bd) // Birthday has NOT passed and is NOT now
        ) {
            a = a - 1; // Subtract one year since birthday this year hasn't been yet.
        }
        age = a;
        $("[data-age]").each((idx, elem) => {
            $(elem).html(a);
        });
    }
});