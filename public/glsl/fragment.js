export const FRAGMENT_SOURCE = `#version 300 es
  precision highp float;

  in vec3 v_position;
  out vec4 color;

  void main () {
    if (v_position[2] == 1.0) {
      float r = 0.0, delta = 0.0, alpha = 1.0;
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      r = dot(cxy, cxy);

      if (r > 1.0) {
        discard;
      }

      color = vec4(0.16, 0.945, 0.765, 1.0);
    } else {
      discard;
    }
  }
`
