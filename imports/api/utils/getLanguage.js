export default function () {
  if (window.navigator.languages) return window.navigator.languages[0]
  else return window.navigator.language
}