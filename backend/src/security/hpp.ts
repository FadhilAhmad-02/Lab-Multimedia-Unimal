import hpp from "hpp";

export const hppConfig = hpp({
  checkBody: true,

  checkQuery: true,

  checkBodyOnlyForContentType: "urlencoded",
});
