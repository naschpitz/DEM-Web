import React from "react"
import { Routes, Route } from "react-router-dom"

import { Toaster } from "react-hot-toast"
import { UniqueModal } from "@naschpitz/unique-modal"

import "./main.css"

const applyReactSuspense = component => {
  return <React.Suspense fallback={<>...</>}>{component}</React.Suspense>
}

const Agent = React.lazy(() => import("../../components/simulations/simulation/calibration/agent/agent.jsx"))
const Disclaimer = React.lazy(() => import("../../components/disclaimer/disclaimer.jsx"))
const Footer = React.lazy(() => import("../../components/footer/footer.jsx"))
const Home = React.lazy(() => import("../../components/home/home.jsx"))
const Navbar = React.lazy(() => import("../../components/navbar/navbar.jsx"))
const Privacy = React.lazy(() => import("../../components/privacy/privacy.jsx"))
const Servers = React.lazy(() => import("../../components/servers/servers.jsx"))
const Simulation = React.lazy(() => import("../../components/simulations/simulation/simulation.jsx"))
const Simulations = React.lazy(() => import("../../components/simulations/simulations.jsx"))
const Terms = React.lazy(() => import("../../components/terms/terms.jsx"))

const routes = [
  {
    path: "/",
    exact: true,
    strict: true,
    header: applyReactSuspense(<Navbar />),
    content: applyReactSuspense(<Home />),
    footer: applyReactSuspense(<Footer />),
  },
  {
    path: "/disclaimer",
    exact: true,
    strict: false,
    header: applyReactSuspense(<Navbar />),
    content: applyReactSuspense(<Disclaimer />),
    footer: applyReactSuspense(<Footer />),
  },
  {
    path: "/privacy",
    exact: true,
    strict: false,
    header: applyReactSuspense(<Navbar />),
    content: applyReactSuspense(<Privacy />),
    footer: applyReactSuspense(<Footer />),
  },
  {
    path: "/servers",
    exact: true,
    strict: false,
    header: applyReactSuspense(<Navbar />),
    content: applyReactSuspense(<Servers />),
    footer: applyReactSuspense(<Footer />),
  },
  {
    path: "/simulations/:simulationId/calibration/agents/:agentId",
    exact: true,
    strict: false,
    header: applyReactSuspense(<Navbar />),
    content: applyReactSuspense(<Agent />),
    footer: applyReactSuspense(<Footer />),
  },
  {
    path: "/simulations/:simulationId/:tab?",
    exact: true,
    strict: false,
    header: applyReactSuspense(<Navbar />),
    content: applyReactSuspense(<Simulation />),
    footer: applyReactSuspense(<Footer />),
  },
  {
    path: "/simulations",
    exact: true,
    strict: false,
    header: applyReactSuspense(<Navbar />),
    content: applyReactSuspense(<Simulations />),
    footer: applyReactSuspense(<Footer />),
  },
  {
    path: "/terms",
    exact: true,
    strict: false,
    header: applyReactSuspense(<Navbar />),
    content: applyReactSuspense(<Terms />),
    footer: applyReactSuspense(<Footer />),
  },
]

export default function App() {
  return (
    <div id="box" className="d-flex flex-column">
      <UniqueModal />

      <header id="mainLayoutHeader" className="sticky-top">
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.header} />
          ))}
        </Routes>
      </header>

      <header id="mainLayoutContent">
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.content} />
          ))}
        </Routes>
      </header>

      <footer id="mainLayoutFooter" className="mt-auto">
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.footer} />
          ))}
        </Routes>
      </footer>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 7500,
          style: {
            maxWidth: '500px',
          },
        }}
      />
    </div>
  )
}
