import React from "react"
import ReactPlayer from "react-player"

import "./home.css"

export default () => {
  return (
    <div id="home" className="container">
      <h1 className="text-center">Welcome to DEM</h1>

      <h4>What is this project?</h4>
      <p>
        This project is a <a href="https://en.wikipedia.org/wiki/Discrete_element_method">DEM</a> simulator, comprised
        of a web interface (which you are currently visiting) and a multi-GPU math engine. Both codes are opensource,
        free to use and share.
      </p>
      <p>
        The interface repo can be found <a href="https://github.com/naschpitz/DEM-Web">here</a> and the math engine
        repo, <a href="https://github.com/naschpitz/DEM-OpenCL">here</a>. The setup process if <i>far from friendly</i>,
        I'm sorry about that, but if you're interested in trying to use it feel free to{" "}
        <a href="mailto:contact@naschpitz.com">contact me</a>. If it's any consolation, as this website is up and
        running, less than half of the meta-work is left for you, you only need to compile and run the math engine and
        use this very website as interface.
      </p>

      <h4>What is this for?</h4>
      <p>
        It is intended to simulate particles (liquid, air, granular, powder, etc...) interacting with solid objects, and
        then analyse the forces that act on them. As a practical example, it can simulate a wind tunnel: a mass of air
        is thrown at a constant speed at an airfoil, data such as drag and lift can then be extracted.
      </p>
      <p>
        As a characteristics of the DEM method, an extensive work of coefficients calibration has to be made in order to
        make the output values coherent with the reality. Even if the simulation result <i>seems right</i> it doesn't
        mean necessarily that the values are right - that is a good indicative, but won't suffice.
      </p>

      <h4>What kind of interactions can it calculate?</h4>
      <p>
        It is able to calculate non-solid to non-solid interactions, as well as non-solid to solid interactions. In the
        future, if the necessity arrives, it will also be able to calculate solid to solid interactions.
      </p>
      <p>
        The idea behind using two different categories of objects (solid and non-solid) is to reduce the number of
        bodies interacting to each other, as this is a O(n^2) software. DEM softwares often use <i>a bunch</i> of
        particles to represent a bulky solid object, but here solid objects are merely represented by their faces, thus
        dramatically reducing the number of calculations at each step.
      </p>

      <h4>What programming languages were used?</h4>
      <p>
        This web interface is built in Node.js using MeteorJS framework. The math engine uses C++ 17 and OpenCL under
        Qt's framework.
      </p>

      <ReactPlayer
        style={{ marginLeft: "auto", marginRight: "auto", marginTop: "20px", maxWidth: "70vw" }}
        playing
        loop={true}
        url="https://www.youtube.com/watch?v=XwFRhSVuVIo"
      />
    </div>
  )
}
