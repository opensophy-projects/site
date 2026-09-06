<script module lang="ts">
	const VERT = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

	const FRAG = `
		precision highp float;
		uniform vec2 uResolution;
		uniform vec2 uMouse;
		uniform float uTime;
		uniform float uWispDensity;
		uniform float uTiltScale;
		uniform float uBeamX;
		uniform float uBeamY;
		uniform float uFlowSpeed;
		uniform float uVerticalSizing;
		uniform float uHorizontalSizing;
		uniform float uFogIntensity;
		uniform float uFogScale;
		uniform float uWispSpeed;
		uniform float uWispIntensity;
		uniform float uFlowStrength;
		uniform float uDecay;
		uniform float uFalloffStart;
		uniform float uFogFallSpeed;
		uniform vec3 uColor;

		float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
		float noise(vec2 p) {
			vec2 i = floor(p), f = fract(p);
			f = f * f * (3.0 - 2.0 * f);
			return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1.)), f.x), f.y);
		}
		float fbm(vec2 p) {
			float value = 0., amplitude = .5;
			for (int i = 0; i < 4; i++) { value += amplitude * noise(p); p = p * 2.03 + 13.7; amplitude *= .5; }
			return value;
		}
		void main() {
			vec2 uv = (gl_FragCoord.xy - .5 * uResolution.xy) / min(uResolution.x, uResolution.y);
			uv -= vec2(uBeamX, uBeamY);
			uv.x += uMouse.x * uTiltScale;
			float t = uTime * uFlowSpeed;
			float vertical = exp(-abs(uv.x) * 28.0 / max(uHorizontalSizing, .01));
			vertical *= smoothstep(-.5 * uVerticalSizing, .02, uv.y) * (1. - smoothstep(.02, .62 * uVerticalSizing, uv.y));
			vertical *= mix(1. - uFlowStrength, 1., .5 + .5 * sin(uv.y * 20. - t * 8.));
			float horizontal = exp(-abs(uv.y) * 32.) * exp(-max(0., abs(uv.x) - .38) * 9.);
			float wisps = 0.;
			for (int i = 0; i < 8; i++) {
				float lane = (float(i) - 3.5) * .05;
				float x = lane + .028 * sin(uv.y * 12. + t * uWispSpeed + float(i));
				wisps += exp(-abs(uv.x - x) * 95.) * (.4 + .6 * noise(vec2(float(i), floor(uv.y * 13. + t * 4.))));
			}
			wisps *= clamp(uWispDensity, 0., 2.) * uWispIntensity * .08 * vertical;
			float beam = (vertical + horizontal) * uFalloffStart / max(uDecay, .01);
			float fog = fbm(uv * (6. * uFogScale) + vec2(0., uTime * uFogFallSpeed * .15));
			fog *= uFogIntensity * smoothstep(.01, .5, beam) * .8;
			float light = beam + wisps + fog;
			float edge = 1. - smoothstep(.72, 1.15, length(uv));
			gl_FragColor = vec4(uColor * light * edge, 1.0);
		}`;

	function hexToRgb(hex: string) {
		const normalized = hex.replace('#', '');
		const value = Number.parseInt(
			normalized.length === 3
				? normalized
						.split('')
						.map((part) => part + part)
						.join('')
				: normalized,
			16
		);
		return Number.isNaN(value)
			? [1, 0.47, 0.78]
			: [(value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
	}
</script>

<script lang="ts">
	type Props = {
		class?: string;
		style?: string;
		wispDensity?: number;
		dpr?: number;
		mouseSmoothTime?: number;
		mouseTiltStrength?: number;
		horizontalBeamOffset?: number;
		verticalBeamOffset?: number;
		flowSpeed?: number;
		verticalSizing?: number;
		horizontalSizing?: number;
		fogIntensity?: number;
		fogScale?: number;
		wispSpeed?: number;
		wispIntensity?: number;
		flowStrength?: number;
		decay?: number;
		falloffStart?: number;
		fogFallSpeed?: number;
		color?: string;
	};

	let {
		class: className = '', style = '', wispDensity = 1, dpr, mouseSmoothTime = 0,
		mouseTiltStrength = 0.01, horizontalBeamOffset = 0.1, verticalBeamOffset = 0,
		flowSpeed = 0.35, verticalSizing = 2, horizontalSizing = 0.5, fogIntensity = 0.45,
		fogScale = 0.3, wispSpeed = 15, wispIntensity = 5, flowStrength = 0.25, decay = 1.1,
		falloffStart = 1.2, fogFallSpeed = 0.6, color = '#FF79C6'
	}: Props = $props();

	let mount: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	$effect(() => {
		if (!mount || !canvas) return;
		const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
		if (!gl) return;
		const compile = (type: number, source: string) => {
			const shader = gl.createShader(type);
			if (!shader) throw new Error('Unable to create WebGL shader.');
			gl.shaderSource(shader, source); gl.compileShader(shader);
			return shader;
		};
		const program = gl.createProgram();
		if (!program) return;
		gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
		gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
		gl.linkProgram(program); gl.useProgram(program);
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const position = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
		const uniform = (name: string) => gl.getUniformLocation(program, name);
		const pixelRatio = Math.min(dpr ?? window.devicePixelRatio ?? 1, 2);
		let mouseX = 0, targetMouseX = 0, frame = 0;
		const resize = () => {
			const width = Math.max(1, Math.floor(mount.clientWidth * pixelRatio));
			const height = Math.max(1, Math.floor(mount.clientHeight * pixelRatio));
			canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height);
		};
		const observer = new ResizeObserver(resize); observer.observe(mount); resize();
		const pointerMove = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			targetMouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
		};
		canvas.addEventListener('pointermove', pointerMove);
		canvas.addEventListener('pointerleave', () => { targetMouseX = 0; });
		const render = (time: number) => {
			const smoothing = mouseSmoothTime > 0 ? 1 - Math.exp(-0.016 / mouseSmoothTime) : 1;
			mouseX += (targetMouseX - mouseX) * smoothing;
			const [red, green, blue] = hexToRgb(color);
			gl.uniform2f(uniform('uResolution'), canvas.width, canvas.height);
			gl.uniform2f(uniform('uMouse'), mouseX, 0); gl.uniform1f(uniform('uTime'), time * 0.001);
			gl.uniform1f(uniform('uWispDensity'), wispDensity); gl.uniform1f(uniform('uTiltScale'), mouseTiltStrength);
			gl.uniform1f(uniform('uBeamX'), horizontalBeamOffset); gl.uniform1f(uniform('uBeamY'), verticalBeamOffset);
			gl.uniform1f(uniform('uFlowSpeed'), flowSpeed); gl.uniform1f(uniform('uVerticalSizing'), verticalSizing);
			gl.uniform1f(uniform('uHorizontalSizing'), horizontalSizing); gl.uniform1f(uniform('uFogIntensity'), fogIntensity);
			gl.uniform1f(uniform('uFogScale'), fogScale); gl.uniform1f(uniform('uWispSpeed'), wispSpeed);
			gl.uniform1f(uniform('uWispIntensity'), wispIntensity); gl.uniform1f(uniform('uFlowStrength'), flowStrength);
			gl.uniform1f(uniform('uDecay'), decay); gl.uniform1f(uniform('uFalloffStart'), falloffStart);
			gl.uniform1f(uniform('uFogFallSpeed'), fogFallSpeed); gl.uniform3f(uniform('uColor'), red, green, blue);
			gl.drawArrays(gl.TRIANGLES, 0, 3); frame = requestAnimationFrame(render);
		};
		frame = requestAnimationFrame(render);
		return () => { cancelAnimationFrame(frame); observer.disconnect(); gl.deleteProgram(program); gl.deleteBuffer(buffer); };
	});
</script>

<div bind:this={mount} class="laser-flow {className}" {style} aria-hidden="true"><canvas bind:this={canvas}></canvas></div>

<style>
	.laser-flow { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
	.laser-flow :global(canvas) { display: block; width: 100%; height: 100%; }
</style>
