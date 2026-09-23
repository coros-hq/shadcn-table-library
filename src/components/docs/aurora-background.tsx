import { useEffect, useRef } from 'react'
import { cn } from '#/lib/utils.ts'

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

// Soft aurora bands. Outputs premultiplied alpha so the page background
// shows through wherever there is no glow, in both themes.
const fragmentShaderSource = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_main;
  uniform vec3 u_sec;
  uniform vec3 u_accent;
  uniform float u_intensity;

  void main() {
    vec2 p = gl_FragCoord.xy / u_resolution.xy;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.15;

    float wave1 = sin(p.x * 2.0 + t) * 0.5 + 0.5;
    float wave2 = sin(p.y * 3.0 - t * 1.5 + wave1) * 0.5 + 0.5;
    float wave3 = sin((p.x + p.y) * 2.0 + t + wave2 * 2.0) * 0.5 + 0.5;

    vec3 color = mix(u_main, u_sec, wave1);
    color = mix(color, u_accent, wave2);

    float mask = smoothstep(0.4, 0.6, wave3);
    // Fade out toward the bottom only, so the glow runs up behind the header
    mask *= smoothstep(0.0, 0.35, gl_FragCoord.y / u_resolution.y);
    mask = clamp(mask, 0.0, 1.0);

    float ambient = smoothstep(0.7, 1.0, wave2) * 0.2;
    float alpha = clamp(mask * u_intensity + ambient * u_intensity, 0.0, 1.0);

    gl_FragColor = vec4(color * alpha, alpha);
  }
`

const palettes = {
  // Lilac 400 / 500 / 700
  dark: {
    main: [0.894, 0.867, 0.941],
    sec: [0.831, 0.796, 0.898],
    accent: [0.612, 0.557, 0.722],
    intensity: 0.4,
  },
  // Deeper lilacs so the bands stay visible on a white background
  light: {
    main: [0.612, 0.557, 0.722],
    sec: [0.486, 0.42, 0.651],
    accent: [0.357, 0.294, 0.541],
    intensity: 0.28,
  },
} as const

export function AuroraBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined
    // Compiling shaders is synchronous — keep it off the hydration path
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => (cleanup = init()), { timeout: 1500 })
      : window.setTimeout(() => (cleanup = init()), 200)
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      cleanup?.()
    }
  }, [])

  function init() {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    const gl = canvas?.getContext('webgl', {
      premultipliedAlpha: true,
      antialias: false,
    })
    if (!canvas || !parent || !gl) return

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    const vs = compile(gl.VERTEX_SHADER, vertexShaderSource)
    const fs = compile(gl.FRAGMENT_SHADER, fragmentShaderSource)
    const program = gl.createProgram()
    if (!vs || !fs) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uResolution = gl.getUniformLocation(program, 'u_resolution')
    const uMain = gl.getUniformLocation(program, 'u_main')
    const uSec = gl.getUniformLocation(program, 'u_sec')
    const uAccent = gl.getUniformLocation(program, 'u_accent')
    const uIntensity = gl.getUniformLocation(program, 'u_intensity')

    // Touch devices get a single static frame: the loop costs battery and
    // GPU time that low-end phones can't spare
    const staticOnly = window.matchMedia(
      '(prefers-reduced-motion: reduce), (pointer: coarse), (max-width: 767px)',
    ).matches
    const start = performance.now()
    let frame = 0
    let lastDraw = 0
    let visible = true

    const draw = () => {
      gl.uniform1f(uTime, (performance.now() - start) / 1000)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    // Slow-moving bands look the same at 30fps
    const loop = (now: number) => {
      if (now - lastDraw >= 33) {
        lastDraw = now
        draw()
      }
      frame = requestAnimationFrame(loop)
    }

    const play = () => {
      cancelAnimationFrame(frame)
      if (staticOnly || !visible || document.hidden) {
        draw()
        return
      }
      frame = requestAnimationFrame(loop)
    }

    const applyTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const p = isDark ? palettes.dark : palettes.light
      gl.uniform3fv(uMain, p.main)
      gl.uniform3fv(uSec, p.sec)
      gl.uniform3fv(uAccent, p.accent)
      gl.uniform1f(uIntensity, p.intensity)
      draw()
    }

    const resize = () => {
      // Soft gradients upscale invisibly, so render at half resolution
      const dpr = 0.5
      canvas.width = Math.max(1, Math.floor(parent.clientWidth * dpr))
      canvas.height = Math.max(1, Math.floor(parent.clientHeight * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      draw()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(parent)

    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      play()
    })
    intersectionObserver.observe(canvas)

    document.addEventListener('visibilitychange', play)

    resize()
    applyTheme()
    play()
    canvas.dataset.ready = ''

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', play)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-700 data-ready:opacity-100',
        className,
      )}
    />
  )
}
