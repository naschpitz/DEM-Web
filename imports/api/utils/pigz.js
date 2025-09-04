import { spawn } from "child_process"

const deflateWithPigz = async inputBuffer => {
  return runPigz(inputBuffer, ["-c", "-k", "-9"])
}

const inflateWithPigz = async inputBuffer => {
  return runPigz(inputBuffer, ["-d", "-c"])
}

const runPigz = async (inputBuffer, options) => {
  return new Promise((resolve, reject) => {
    const pigz = spawn("pigz", options)

    const output = []

    pigz.stdout.on("data", chunk => output.push(chunk))
    pigz.stderr.on("data", chunk => console.error("pigz stderr:", chunk.toString()))

    pigz.on("close", code => {
      if (code === 0) {
        resolve(Buffer.concat(output))
      } else {
        reject(new Error(`pigz failed with exit code: ${code}`))
      }
    })

    pigz.stdin.write(inputBuffer)
    pigz.stdin.end()
  })
}

export { deflateWithPigz, inflateWithPigz }
