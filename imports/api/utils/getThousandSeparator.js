import getDecimalSeparator from "./getDecimalSeparator"

export default function () {
  switch (getDecimalSeparator()) {
    case ".":
      return ","

    case ",":
      return "."
  }
}
