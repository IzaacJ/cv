import './3rdparty/jquery-3.5.1.min.js';
import './3rdparty/print.min.js';
import './3rdparty/jsrender.min.js';
import './3rdparty/print.min.js';

$ = jQuery;
window.$ = $;
window.jQuery = jQuery;

const CV_VERSION = "0.0.1";
/**
 * Creates a new CV instance.
 * @class
 * @property {jQuery|HTMLElement} sectionContainer - The element that will contain the sections.
 * @property {string[]} templateTypes - The different template types.
 * @property {string[]} templateNames - The different templates that should exist for each template type.
 * @property {{string,{string,string|jQuery|HTMLElement}}} templates - The loaded templates.
 */
class CV {
    activeConfig = {};

    templateTypes = [
        "html", "print"
    ];
    templateNames = [
        "html", "contact", "profile", "list", "gallery"
    ];
    templates = {};

    exampleData = false;
    data = null;
    dataDate = null;
    name = null;
    born = null;
    age = null;

    pdfHtml = null;

    start({
        sectionContainer: c = '#sections',
        dataJsonFile: dF = 'assets/data/main.json',
        exampleJsonFile: eF = 'assets/example/main.example.json',
        printButton: pB = '.print-cv'
    } = {}) {
        console.log("CV Framework v." + CV_VERSION)
        console.log("Applying config...");
        this.activeConfig.sectionContainer = c;
        this.activeConfig.dataJsonFile = dF;
        this.activeConfig.exampleJsonFile = eF;
        this.activeConfig.printButton = pB;
        console.log(this.activeConfig);
        console.log("Loading:");
        this.loadTemplates().then((message) => {
            this.loadData().then((message) => {
                this.renderData("html").then((message) => {
                    this.updateDate().then(message => {
                        this.registerHandlers().then((message) => {
                            console.log("Everything done!");
                        });
                    });
                });
            });
        });
    }

    /**
     * Loads all defined templates
     * @function
     * @private
     * @return {Promise}
     * 
     * @example
     * 
     *      loadTemplates();
     */
    loadTemplates() {
        console.log(" - Templates...");
        return new Promise(resolve => {
            var promises = [];
            $.each(this.templateTypes, (idx, type) => {
                $.each(this.templateNames, (idx, name) => {
                    if (undefined == this.templates[type]) this.templates[type] = {};
                    promises.push(this.getTemplate(name, type));
                });
            });
            Promise.all(promises).then((values) => {
                resolve("Success!");
            });
        });
    }

    getTemplate(name, type) {
        return new Promise(resolve => {
            $.ajax({
                type: "GET",
                url: "assets/templates/" + type + "/" + name + ".html",
                success: (data) => {
                    this.templates[type][name] = $.templates(data);
                    resolve("Success!");
                },
                error: () => {
                    this.templates[type][name] = $.templates("<article><h3>Template Not Found: " + type + "/" + name + ".html</h3></article>");
                    resolve("Not found!");
                }
            });
        });
    }

    loadData() {
        console.log(" - Data...");
        var cvClass = this;
        return new Promise(resolve => {
            $.ajax({
                type: "GET",
                url: cvClass.activeConfig.dataJsonFile,
                success: function (d) {
                    cvClass.data = d;
                    resolve("Success!");
                },
                error: function (xhr, s, err) {
                    console.log(" - No user data found! Loading example data instead.");
                    $.ajax({
                        type: "GET",
                        url: cvClass.activeConfig.exampleJsonFile,
                        success: function (d) {
                            cvClass.exampleData = true;
                            cvClass.data = d;
                            resolve("Success!");
                        },
                        error: function (xhr, s, err) {
                            resolve("No config found!");
                        }
                    });
                }
            });
        });
    }

    getSection(typeOrTitle) {
        var d = null;
        $.each(this.data.sections, (idx, section) => {
            if (section.title.toLowerCase() === typeOrTitle.toLowerCase() || section.type.toLowerCase() === typeOrTitle.toLowerCase()) {
                d = section;
                return false;
            }
        });
        return d;
    }

    renderData(renderTemplate, { sectionContainer: sc = null } = {}) {
        console.log("Rendering template: " + renderTemplate + " (" + this.templateNames.join(', ') + ")");
        return new Promise(resolve => {
            if (sc === null) {
                sc = this.activeConfig.sectionContainer;
            }
            if (undefined === renderTemplate || renderTemplate === null) {
                renderTemplate = this.templateTypes[0];
            }
            if (renderTemplate === "print" && this.pdfHtml == null) {
                resolve("PDF template not loaded!");
            }

            var sections = this.data[renderTemplate].sections;
            $.each(sections, (idx, section) => {
                section = this.getSection(section);

                if (section.disabled == true) return;

                if (section.type == "profile") {
                    section.data.contact = this.getSection("contact").data;
                    this.name = section.data.name;
                    this.born = section.data.born;
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
                $(sc).append(
                    this.templates[renderTemplate][section.type].render({
                        "title": section.title,
                        "classes": classes,
                        "css": css,
                        "data": section.data
                    })
                );
            });
            resolve("Success!");
        });
    }

    registerHandlers() {
        console.log("Registering handlers...");
        return new Promise(resolve => {
            $(this.activeConfig.printButton).click(this.printCV);
            resolve("Success!");
        });
    }

    printCV() {
        console.log("Prepairing print...")
        return new Promise(resolve => {
            cv.loadPrintTemplate().then((message) => {
                console.log("Print template loaded!");
                var tmpPrint = $(cv.pdfHtml).find(cv.activeConfig.sectionContainer);
                cv.renderData("print", { sectionContainer: tmpPrint }).then(message => {
                    $(cv.pdfHtml).find("*[data-name]").each((index, elem) => {
                        $(elem).html(cv.name);
                    });
                    $(cv.pdfHtml).find("*[data-born]").each((index, elem) => {
                        $(elem).html(cv.born);
                    });
                    $(cv.pdfHtml).find("*[data-age]").each((index, elem) => {
                        $(elem).html(cv.age);
                    });
                    $(cv.pdfHtml).find("*[data-infodate]").each((index, elem) => {
                        $(elem).html(cv.formatDate(cv.dataDate));
                    });
                    $(cv.pdfHtml).find("*[data-printdate]").each((index, elem) => {
                        $(elem).html(cv.formatDate(new Date(), null, true));
                    });
                    $("body").append("<div id=\"print\">" + $(cv.pdfHtml.body).html() + "</div>");
                    printJS({
                        printable: 'print',
                        type: 'html',
                        css: ["assets/css/pdf.css", "assets/css/fontawesome.min.css"]
                    });
                    resolve("Success!");
                });
            });
        });
    }

    loadPrintTemplate() {
        return new Promise(resolve => {
            $.ajax({
                type: "GET",
                url: "print.html",
                dataType: "html",
                success: function (data) {
                    cv.pdfHtml = (new DOMParser()).parseFromString(data, "text/html");
                    resolve("Success!");
                },
                error: function (xhr, s, err) {
                    cv.pdfHtml = null;
                    resolve("No PDF template found!");
                }
            });
        });
    }

    updateDate() {
        return new Promise(resolve => {
            cv.formatDate(new Date(document.lastModified), "html_date", true, true);
            $.ajax("assets/js/lib/cv.js", { dataType: "text" }).done((d, s, xhr) => {
                cv.dataDate = Date.parse(xhr.getResponseHeader("Last-Modified"));
                cv.formatDate(cv.dataDate, "system_date", true, true);
                $.ajax("assets/css/main.css", { dataType: "text" }).done((d, s, xhr) => {
                    cv.formatDate(Date.parse(xhr.getResponseHeader("Last-Modified")), "css_date", true, true);
                    if (!cv.exampleData) {
                        $.ajax(cv.activeConfig.dataJsonFile, { dataType: "text" }).done((d, s, xhr) => {
                            cv.formatDate(Date.parse(xhr.getResponseHeader("Last-Modified")), "info_date", true, true);
                            resolve("Success!");
                        }).fail((xhr, s, err) => {
                            console.log("ERROR - info_date - " + err);
                            resolve("info_date failed!");
                        });
                    } else {
                        $.ajax(cv.activeConfig.exampleJsonFile, { dataType: "text" }).done((d, s, xhr) => {
                            cv.formatDate(Date.parse(xhr.getResponseHeader("Last-Modified")), "info_date", true, true);
                            resolve("Success!");
                        }).fail((xhr, s, err) => {
                            console.log("ERROR - info_date - " + err);
                            resolve("info_date failed!");
                        });
                    }
                }).fail((xhr, s, err) => {
                    console.log("ERROR - css_date - " + err);
                    resolve("css_date failed!");
                });
            }).fail((xhr, s, err) => {
                console.log("ERROR - system_date - " + err);
                resolve("system_date failed!");
            });
        });
    }

    formatDate(date, elemid, time, timezone) {
        var fd = new Date(date);
        var out = '';
        var y, m, d, h, mm, tz, tt;
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

    calculateAge(date) {
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
}

export const cv = new CV();