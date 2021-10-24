import { VERTEX_SOURCE } from '../glsl/vertex.js'
import { FRAGMENT_SOURCE } from '../glsl/fragment.js'
import { link, bufferAttr, setUniform, clear } from './utilities/webgl.js'
import { BORDER_COLOR, INNER_COLOR } from './constants/colors.js'
import {
  ZOOM, FPS, r, Δθdeg, MAX_TIME, MIN_TIME, ΔrotY, CEILING_START, CEILING_END,
  FLOOR_START, FLOOR_END
} from './constants/dimensions.js'

// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

const canvas = document.querySelector('.canvas')
let gl = canvas.getContext('webgl2')

if (!gl) {
  alert('WebGL is required for this animation, and your browser does not support WebGL.')
} else {
  gl.viewport(0, 0, canvas.width, canvas.height)

  const COUNT = (canvas.width * canvas.height)
  const STEP = 1

  let t = 0
  let Δt = 0.0005

  function * plane (width, length, step) {
    for (let i = 0; i < length; i += step) {
      yield i % width
      yield Math.floor(i / width)
      yield 0
    }
  }

  let positions = new Float32Array(plane(canvas.width, COUNT, STEP))

  const program = link(gl, VERTEX_SOURCE, FRAGMENT_SOURCE, ['v_position'])
  gl.useProgram(program)

  const vaos = [gl.createVertexArray(), gl.createVertexArray()]
  const tfs = [gl.createTransformFeedback(), gl.createTransformFeedback()]

  vaos.forEach((vao, index) => {
    gl.bindVertexArray(vao)

    const position = bufferAttr(gl, program, vao, 'a_position', positions, { size: 3 })

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tfs[index])
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, position)
    gl.bindVertexArray(null)
  })

  const u_t = setUniform(gl, program, 'u_t', [t])

  setUniform(gl, program, 'u_resolution', [canvas.width, canvas.height])

  let current = 0

  const render = () => {
    const next = (current + 1) % 2
    const vao = vaos[current]
    const tf = tfs[next]

    gl.bindVertexArray(vao)
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
    gl.uniform1f(u_t, t + Δt)

    gl.beginTransformFeedback(gl.POINTS)
    gl.drawArrays(gl.POINTS, 0, COUNT / STEP)
    gl.endTransformFeedback()

    current = next
    if (t > 1000000) Δt = Δt * -1
    t += Δt
  }

  let prevTick = 0

  const step = () => {
    window.requestAnimationFrame(step)

    const now = Math.round(FPS * Date.now() / 1000)
    if (now === prevTick) return
    prevTick = now

    render()
  }

  step()
}
