export default function () {
  const winWidth = window.innerWidth

  if (winWidth < 576) return "xs"
  else if (winWidth <= 768) return "sm"
  else if (winWidth <= 992) return "md"
  else if (winWidth <= 1200) return "lg"
  else return "xl"
}
