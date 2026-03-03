precision mediump float;

uniform vec3 uLineColor;
uniform vec3 uBeanColor;

varying float vProgress;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  float alpha = smoothstep(0.5, 0.1, dist);

  vec3 color = mix(uLineColor, uBeanColor, vProgress);
  gl_FragColor = vec4(color, alpha);
}
