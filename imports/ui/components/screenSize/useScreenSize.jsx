import { useState } from "react"
import bsSize from "../../../api/utils/bsSize"

export default () => {
  const [screenSize, setScreenSize] = useState(bsSize())

  window.addEventListener("resize", () => {
    const size = bsSize()

    if (screenSize !== size) setScreenSize(size)
  })

  return screenSize
}
