export default function () {
  //fallback
  let decSep = "."

  try {
    // this works in FF, Chrome, IE, Safari and Opera
    let sep = parseFloat(3 / 2)
      .toLocaleString()
      .substring(1, 2)

    if (sep === "." || sep === ",") {
      decSep = sep
    }
  } catch (e) {}

  return decSep
}