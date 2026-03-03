uniform float uTime;
uniform float uProgress;
uniform float uPointSize;

attribute vec3 targetPosition;

varying float vProgress;

void main() {
  vec3 mixedPosition = mix(position, targetPosition, uProgress);
  float ripple = sin(uTime * 1.2 + mixedPosition.y * 2.0) * 0.04;
  mixedPosition.x += ripple;
  mixedPosition.z += cos(uTime + mixedPosition.x) * 0.03;

  vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
  gl_PointSize = uPointSize * (1.0 / -viewPosition.z);
  vProgress = uProgress;
}
