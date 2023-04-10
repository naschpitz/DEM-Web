function getForcesOptions() {
  return [
    { value: "adiabatic_compression", text: "Adiabatic Compression" },
    { value: "hooks_law", text: "Hook's Law" },
    { value: "inverse_linear", text: "Inverse Linear" },
    { value: "inverse_quadratic", text: "Inverse Quadratic" },
    { value: "inverse_cubic", text: "Inverse Cubic" },
    { value: "morse", text: "Morse" },
    { value: "lennard_jones", text: "Lennard-Jones" },
    { value: "realistic_material", text: "Realistic Material" },
  ]
}

function getForcesCoefficientsOptions(forceType) {
  switch (forceType) {
    case "adiabatic_compression": {
      return [
        { value: "coefficients[0]", text: "P0" },
        { value: "coefficients[1]", text: "Gamma" },
      ]
    }
    case "hooks_law": {
      return [{ value: "coefficients[0]", text: "K" }]
    }
    case "inverse_linear": {
      return [{ value: "coefficients[0]", text: "K" }]
    }
    case "inverse_quadratic": {
      return [{ value: "coefficients[0]", text: "K" }]
    }
    case "inverse_cubic": {
      return [{ value: "coefficients[0]", text: "K" }]
    }
    case "morse": {
      return [
        { value: "coefficients[0]", text: "De" },
        { value: "coefficients[0]", text: "Ke" },
      ]
    }
    case "lennard_jones": {
      return [
        { value: "coefficients[0]", text: "Epsilon" },
        { value: "coefficients[1]", text: "N" },
      ]
    }
    case "realistic_material": {
      return [
        { value: "coefficients[0]", text: "Young's module" },
        { value: "coefficients[1]", text: "Elastic limit (%)" },
        { value: "coefficients[2]", text: "Plastic maximum" },
        { value: "coefficients[3]", text: "Rupture (%)" },
      ]
    }
    default:
      return []
  }
}

function getDragForcesOptions() {
  return [
    { value: "linear", text: "Linear" },
    { value: "quadratic", text: "Quadratic" },
    { value: "cubic", text: "Cubic" },
  ]
}

function getDragForcesCoefficientsOptions(dragForceType) {
  switch (dragForceType) {
    case "linear": {
      return [{ value: "dragCoefficients[0]", text: "C0" }]
    }
    case "quadratic": {
      return [{ value: "dragCoefficients[0]", text: "C0" }]
    }
    case "cubic": {
      return [{ value: "dragCoefficients[0]", text: "C0" }]
    }
    default:
      return []
  }
}

export { getForcesOptions, getForcesCoefficientsOptions, getDragForcesOptions, getDragForcesCoefficientsOptions }
