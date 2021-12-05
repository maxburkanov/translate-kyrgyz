import got from "got";
import safeEval from "safe-eval";
import token from "google-translate-token";

function translate(text) {
  var opts = opts || {};
  opts.from = "ru";
  opts.to = "ky";

  return token
    .get(text)
    .then(function (token) {
      var url = "https://translate.google.com/translate_a/single";
      var data = {
        client: "t",
        sl: opts.from,
        tl: opts.to,
        hl: opts.to,
        dt: ["at", "bd", "ex", "ld", "md", "qca", "rw", "rm", "ss", "t"],
        ie: "UTF-8",
        oe: "UTF-8",
        otf: 1,
        ssel: 0,
        tsel: 0,
        kc: 7,
        q: text,
      };
      data[token.name] = token.value;
      var queryString = Object.keys(data)
        .map((key) => {
          if (Array.isArray(data[key])) {
            const arr = data[key].map((item) => {
              return key + "=" + item;
            });
            return arr.join("&");
          }
          return key + "=" + data[key];
        })
        .join("&");

      const queryParams = `${url}?${queryString}`;
      return encodeURI(queryParams);
    })
    .then(function (url) {
      return got(url)
        .then(function (res) {
          console.log("res", res);
          var result = {
            text: "",
            from: {
              language: {
                didYouMean: false,
                iso: "",
              },
              text: {
                autoCorrected: false,
                value: "",
                didYouMean: false,
              },
            },
            raw: "",
          };

          if (opts.raw) {
            result.raw = res.body;
          }

          var body = safeEval(res.body);
          body[0].forEach(function (obj) {
            if (obj[0]) {
              result.text += obj[0];
            }
          });

          if (body[2] === body[8][0][0]) {
            result.from.language.iso = body[2];
          } else {
            result.from.language.didYouMean = true;
            result.from.language.iso = body[8][0][0];
          }

          if (body[7] && body[7][0]) {
            var str = body[7][0];

            str = str.replace(/<b><i>/g, "[");
            str = str.replace(/<\/i><\/b>/g, "]");

            result.from.text.value = str;

            if (body[7][5] === true) {
              result.from.text.autoCorrected = true;
            } else {
              result.from.text.didYouMean = true;
            }
          }

          return result;
        })
        .catch(function (err) {
          console.log("err", err);
        });
    });
}

export default translate;
