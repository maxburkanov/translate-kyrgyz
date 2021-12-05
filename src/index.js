import { default as customTranslate } from "./translate.js";

const translate = (text) =>
  customTranslate(text)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.error(err);
    });

export default translate;
