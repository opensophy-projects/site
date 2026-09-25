<script module lang="ts">
	export type FlowDirection = 'inward' | 'outward';

	const VERT = `
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

	const FRAG = `
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uFlowDir;
uniform float uPulseSpeed;
uniform float uPulseLength;
uniform float uPulseBlend;
uniform float uPulseWidth;
uniform float uCableCount;
uniform float uThickness;
uniform float uRimWidth;
uniform float uWaviness;
uniform float uSway;
uniform float uSize;
uniform vec2 uCenter;
uniform vec2 uMouseOffset;
uniform float uGlow;
uniform float uFadeNear;
uniform float uFadeFar;
uniform float uBrightness;
uniform float uColorVariance;
uniform float uOpacity;
uniform vec3 uCableColor;
uniform vec3 uPulseColor;
uniform vec3 uTunnelColor;
uniform float uTunnelOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uLightMode;
out vec4 fragColor;

void mainImage(out vec4 o, in vec2 fragCoord) {
  float size = uSize * 2.0;
  float flowDir = uFlowDir;
  float speedBase = uSpeed * 4.0 * flowDir;
  float waviness = uWaviness * 0.15;
  float rotationOsc = uSway * 0.5;
  float baseThick = uThickness * 0.35 + 0.05;
  float borderWeight = uRimWidth * 0.15 + 0.01;
  float cablesCount = floor(uCableCount);

  vec2 res = iResolution.xy;
  vec2 uv = (fragCoord - 0.5 * res) / min(res.y, res.x);
  uv -= (uCenter + uMouseOffset);
  uv /= (size + 0.0001);

  float r = length(uv);
  float angle = atan(uv.y, uv.x);
  float depth = -log(r + 0.0001);

  float swing = sin(iTime * (uSpeed * 0.5 + 0.1)) * rotationOsc;
  float waveOffset = sin(depth * 1.2 + iTime * speedBase * 0.25) * waviness;

  float angleNormalized = (angle / 6.2831853) + 0.5;
  float finalAngle = fract(angleNormalized + waveOffset + swing);

  float cableID = floor(finalAngle * cablesCount);
  float gvX = (fract(finalAngle * cablesCount) - 0.5);

  float rand = fract(sin(cableID * 12.9898) * 43758.5453);
  float randSpeed = (0.4 + rand * 0.6) * speedBase * uPulseSpeed;
  float cableThick = baseThick * (0.6 + rand * 0.4);

  vec3 cableCol = uCableColor;
  cableCol *= 1.0 + (rand - 0.5) * 0.4 * uColorVariance;
  cableCol = mix(cableCol, uPulseColor, rand * 0.25 * uColorVariance);

  float scroll = depth + (iTime * randSpeed);
  float pulseFact = fract(scroll);

  float distToCore = abs(gvX);
  float wireMask = smoothstep(cableThick, cableThick - 0.05, distToCore);
  float rimGlow = smoothstep(borderWeight, 0.0, abs(distToCore - cableThick));

  float pulseThick = cableThick * uPulseWidth;
  float pulseMask = smoothstep(pulseThick, pulseThick - 0.05 * uPulseWidth, distToCore);

  float pulseDist = abs(pulseFact - 0.5);
  float pulseTotal = uPulseLength;
  float pulseCore = pulseTotal * (1.0 - uPulseBlend);
  float pulseLo = min(pulseCore, pulseTotal - max(fwidth(scroll), 1e-4));
  float dataPulse = 1.0 - smoothstep(pulseLo, pulseTotal, pulseDist);

  float aBody = wireMask * uTunnelOpacity;
  float aRim = rimGlow;
  float aPulse = clamp(dataPulse * pulseMask, 0.0, 1.0);

  vec3 fiberCol = uTunnelColor * aBody
    + cableCol * aRim * 1.3 * uGlow
    + uPulseColor * dataPulse * 3.0 * pulseMask;

  float distFade = smoothstep(0.0, uFadeNear, r) * smoothstep(uFadeFar, uFadeFar - 0.9, r);
  float inten = clamp(aBody + aRim + aPulse, 0.0, 1.0) * distFade;

  vec3 finalCol = fiberCol * uBrightness;
  float alpha = clamp(inten, 0.0, 1.0) * uOpacity;
  vec3 outRgb = finalCol * alpha;

  if (uGrain > 0.5) {
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + gv, 0.0, 1.0);
    alpha = clamp(alpha + gv, 0.0, 1.0);
  }

  o = vec4(outRgb, alpha);
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  if (uLightMode > 0.5) {
    float peak = max(o.r, max(o.g, o.b));
    vec3 chroma = pow(clamp(o.rgb / max(peak, 0.0001), 0.0, 1.0), vec3(1.16));
    fragColor = vec4(mix(vec3(1.0), chroma, o.a * 0.95), 1.0);
  } else {
    fragColor = o;
  }
}
`;

	function hexToRGB(hex: string): { r: number; g: number; b: number } {
		let c = hex.trim();
		if (c.startsWith('#')) c = c.slice(1);
		if (c.length === 3)
			c = c
				.split('')
				.map((x) => x + x)
				.join('');
		const n = parseInt(c, 16) || 0xffffff;
		return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
	}
</script>

<script lang="ts">
	import * as THREE from 'three';

	type Props = {
		class?: string;
		style?: string;
		cableColor?: string;
		pulseColor?: string;
		tunnelColor?: string;
		tunnelOpacity?: number;
		speed?: number;
		flowDirection?: FlowDirection;
		pulseSpeed?: number;
		pulseLength?: number;
		pulseBlend?: number;
		pulseWidth?: number;
		cableCount?: number;
		thickness?: number;
		rimWidth?: number;
		waviness?: number;
		sway?: number;
		size?: number;
		centerX?: number;
		centerY?: number;
		glow?: number;
		fadeNear?: number;
		fadeFar?: number;
		brightness?: number;
		colorVariance?: boolean;
		grain?: boolean;
		grainIntensity?: number;
		opacity?: number;
		mouseInteraction?: boolean;
		mouseStrength?: number;
		lightMode?: boolean;
		dpr?: number;
	};

	let {
		class: className = '',
		style = '',
		cableColor = '#f43f5e',
		pulseColor = '#f43f5e',
		tunnelColor = '#f43f5e',
		tunnelOpacity = 0,
		speed = 0.05,
		flowDirection = 'inward',
		pulseSpeed = 3,
		pulseLength = 0.5,
		pulseBlend = 1,
		pulseWidth = 1,
		cableCount = 80,
		thickness = 0.35,
		rimWidth = 0,
		waviness = 1,
		sway = 0.5,
		size = 3,
		centerX = 0,
		centerY = 0,
		glow = 1.3,
		fadeNear = 0.5,
		fadeFar = 2,
		brightness = 0.75,
		colorVariance = true,
		grain = true,
		grainIntensity = 0,
		opacity = 1,
		mouseInteraction = true,
		mouseStrength = 0,
		lightMode = false,
		dpr
	}: Props = $props();

	let mount: HTMLDivElement;
	let canvasEl: HTMLCanvasElement | undefined = $state(undefined);
	let materialRef: THREE.RawShaderMaterial | null = null;

	$effect(() => {
		if (!mount || !canvasEl) return;
		let active = true;
		const canvas: HTMLCanvasElement = canvasEl;

		let renderer: THREE.WebGLRenderer;
		let scene: THREE.Scene;
		let camera: THREE.OrthographicCamera;
		let geometry: THREE.BufferGeometry;
		let material: THREE.RawShaderMaterial;
		let mesh: THREE.Mesh;
		let uniforms: Record<string, { value: any }>;
		let curDpr: number;

		try {
			renderer = new THREE.WebGLRenderer({
				canvas,
				antialias: false,
				alpha: true,
				depth: false,
				stencil: false,
				powerPreference: 'high-performance',
				premultipliedAlpha: true
			});
			curDpr = Math.min(dpr ?? (window.devicePixelRatio || 1), 2);
			renderer.setPixelRatio(curDpr);
			renderer.setClearColor(0x000000, 0);
			canvas.style.width = '100%';
			canvas.style.height = '100%';
			canvas.style.display = 'block';

			scene = new THREE.Scene();
			camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
			geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				'position',
				new THREE.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2)
			);

			const cable0 = hexToRGB(cableColor);
			const pulse0 = hexToRGB(pulseColor);
			const tunnel0 = hexToRGB(tunnelColor);

			uniforms = {
				iTime: { value: 0 },
				iResolution: { value: new THREE.Vector2(1, 1) },
				uSpeed: { value: speed },
				uFlowDir: { value: flowDirection === 'outward' ? -1.0 : 1.0 },
				uPulseSpeed: { value: pulseSpeed },
				uPulseLength: { value: pulseLength },
				uPulseBlend: { value: pulseBlend },
				uPulseWidth: { value: pulseWidth },
				uCableCount: { value: cableCount },
				uThickness: { value: thickness },
				uRimWidth: { value: rimWidth },
				uWaviness: { value: waviness },
				uSway: { value: sway },
				uSize: { value: size },
				uCenter: { value: new THREE.Vector2(centerX, centerY) },
				uMouseOffset: { value: new THREE.Vector2(0, 0) },
				uGlow: { value: glow },
				uFadeNear: { value: fadeNear },
				uFadeFar: { value: fadeFar },
				uBrightness: { value: brightness },
				uColorVariance: { value: colorVariance ? 1.0 : 0.0 },
				uOpacity: { value: opacity },
				uCableColor: { value: new THREE.Vector3(cable0.r, cable0.g, cable0.b) },
				uPulseColor: { value: new THREE.Vector3(pulse0.r, pulse0.g, pulse0.b) },
				uTunnelColor: { value: new THREE.Vector3(tunnel0.r, tunnel0.g, tunnel0.b) },
				uTunnelOpacity: { value: tunnelOpacity },
				uGrain: { value: grain ? 1.0 : 0.0 },
				uGrainIntensity: { value: grainIntensity },
				uLightMode: { value: lightMode ? 1.0 : 0.0 }
			};

			material = new THREE.RawShaderMaterial({
				glslVersion: THREE.GLSL3,
				vertexShader: VERT,
				fragmentShader: FRAG,
				uniforms,
				transparent: true,
				depthTest: false,
				depthWrite: false,
				blending: THREE.NormalBlending
			});
			materialRef = material;

			mesh = new THREE.Mesh(geometry, material);
			mesh.frustumCulled = false;
			scene.add(mesh);
		} catch (err) {
			console.error('[LightTunnel] не удалось инициализировать WebGL-рендерер:', err);
			return;
		}

		const setSize = (): void => {
			const w = mount.clientWidth || 1;
			const h = mount.clientHeight || 1;
			renderer.setPixelRatio(curDpr);
			renderer.setSize(w, h, false);
			uniforms.iResolution.value.set(w * curDpr, h * curDpr);
		};
		setSize();
		const ro = new ResizeObserver(setSize);
		ro.observe(mount);

		let rect: DOMRect | null = canvas.getBoundingClientRect();
		let currentMouse = new THREE.Vector2(0.5, 0.5);
		let targetMouse = new THREE.Vector2(0.5, 0.5);

		const onMove = (e: PointerEvent): void => {
			if (!rect) rect = canvas.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = 1.0 - (e.clientY - rect.top) / rect.height;
			targetMouse.set(x, y);
		};
		const onLeave = (): void => targetMouse.set(0.5, 0.5);
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerleave', onLeave);

		const t0 = performance.now();
		let isVisible = true;
		let isPageVisible = !document.hidden;
		let raf = 0;

		const loop = (now: number): void => {
			if (!active) return;
			uniforms.iTime.value = (now - t0) * 0.001;

			const target = mouseInteraction ? targetMouse : new THREE.Vector2(0.5, 0.5);
			currentMouse.lerp(target, 0.05);
			uniforms.uMouseOffset.value.set(
				(currentMouse.x - 0.5) * mouseStrength,
				(currentMouse.y - 0.5) * mouseStrength
			);

			renderer.render(scene, camera);
			if (active) raf = requestAnimationFrame(loop);
		};

		const tryStart = (): void => {
			if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
		};
		const tryStop = (): void => {
			if (raf !== 0) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
		};

		const io = new IntersectionObserver(
			([entry]) => {
				isVisible = entry.isIntersecting;
				isVisible ? tryStart() : tryStop();
			},
			{ threshold: 0 }
		);
		io.observe(mount);

		const onVisibility = (): void => {
			isPageVisible = !document.hidden;
			isPageVisible ? tryStart() : tryStop();
		};
		document.addEventListener('visibilitychange', onVisibility);

		tryStart();

		return () => {
			active = false;
			materialRef = null;
			tryStop();
			ro.disconnect();
			io.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			canvas.removeEventListener('pointermove', onMove);
			canvas.removeEventListener('pointerleave', onLeave);
			scene.clear();
			geometry.dispose();
			material.dispose();
			renderer.dispose();
		};
	});

	// Реактивно обновляем униформы при изменении пропсов (без пересоздания рендерера)
	$effect(() => {
		const material = materialRef;
		if (!material) return;
		const u = material.uniforms as Record<string, { value: any }>;

		u.uSpeed.value = speed;
		u.uFlowDir.value = flowDirection === 'outward' ? -1.0 : 1.0;
		u.uPulseSpeed.value = pulseSpeed;
		u.uPulseLength.value = pulseLength;
		u.uPulseBlend.value = pulseBlend;
		u.uPulseWidth.value = pulseWidth;
		u.uCableCount.value = cableCount;
		u.uThickness.value = thickness;
		u.uRimWidth.value = rimWidth;
		u.uWaviness.value = waviness;
		u.uSway.value = sway;
		u.uSize.value = size;
		(u.uCenter.value as THREE.Vector2).set(centerX, centerY);
		u.uGlow.value = glow;
		u.uFadeNear.value = fadeNear;
		u.uFadeFar.value = fadeFar;
		u.uBrightness.value = brightness;
		u.uColorVariance.value = colorVariance ? 1.0 : 0.0;
		u.uGrain.value = grain ? 1.0 : 0.0;
		u.uGrainIntensity.value = grainIntensity;
		u.uOpacity.value = opacity;
		u.uLightMode.value = lightMode ? 1.0 : 0.0;

		const cable = hexToRGB(cableColor);
		(u.uCableColor.value as THREE.Vector3).set(cable.r, cable.g, cable.b);
		const pulse = hexToRGB(pulseColor);
		(u.uPulseColor.value as THREE.Vector3).set(pulse.r, pulse.g, pulse.b);
		const tunnel = hexToRGB(tunnelColor);
		(u.uTunnelColor.value as THREE.Vector3).set(tunnel.r, tunnel.g, tunnel.b);
		u.uTunnelOpacity.value = tunnelOpacity;
	});
</script>

<div bind:this={mount} class="w-full h-full relative {className}" {style}>
	<canvas bind:this={canvasEl}></canvas>
</div>