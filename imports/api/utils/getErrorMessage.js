export default function (error) {
  let errorMessage = ""

  if (error) {
    if (error.reason) errorMessage += "[Reason: " + error.reason + "]"
    if (error.details) errorMessage += "[Details: " + error.details + "]"
  }

  return errorMessage
}
