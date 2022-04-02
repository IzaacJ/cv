export const helpers = {
    getAge: (dateOfBirth) => {
        var born = new Date(dateOfBirth);
        var by = born.getFullYear();
        var bm = born.getMonth() + 1; // Add one to get correct month. Months start at 0 in JS.
        var bd = born.getDate();

        var current = new Date();
        var cy = current.getFullYear();
        var cm = current.getMonth() + 1; // Add one to get correct month. Months start at 0 in JS.
        var cd = current.getDate();

        var age = (cy - by);
        // Check if birthday is today or in the past, otherwise subtract one year.
        if (
            (cm < bm) || // Birthmonth has NOT passed and is NOT now
            (cm == bm && cd < bd) // Birthday has NOT passed and is NOT now
        ) {
            age = age - 1; // Subtract one year since birthday this year hasn't been yet.
        }
        return age;
    },
    formatDate: (date) => {
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
        out = y + '-' + m + '-' + d + ' ' + h + ':' + mm + ' GMT' + (tz < 0 ? '+' + tt : (tz > 0 ? tt : ''));

        return out;
    },
    getData(data, keypath) {
        var parts = keypath.split('.');
        var d = data;
        parts.forEach(k => {
            if (Array.isArray(d)) {
                d.forEach(e => {
                    if(typeof e === "object") {
                        if(e["id"] === k) {
                            d = e;
                            break;
                        }
                    }else{
                        if(typeof e === "string" && e == k) {
                            d = e;
                            break;
                        }
                    }
                });
            }else if (typeof d === "object" && !(k in d)) {
                
            }else{
                d = d[key];
            }
        });

        return d;
    }
}