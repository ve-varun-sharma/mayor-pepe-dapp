"use client";
import { useEffect, useRef } from "react";

function SplashCursor({
  // Add whatever props you like for customization
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function pointerPrototype() {
      //@ts-ignore
      this.id = -1;
      //@ts-ignore
      this.texcoordX = 0;
      //@ts-ignore
      this.texcoordY = 0;
      //@ts-ignore
      this.prevTexcoordX = 0;
      //@ts-ignore
      this.prevTexcoordY = 0;
      //@ts-ignore
      this.deltaX = 0;
      //@ts-ignore
      this.deltaY = 0;
      //@ts-ignore
      this.down = false;
      //@ts-ignore
      this.moved = false;
      //@ts-ignore
      this.color = [0, 0, 0];
    }

    let config = {
      SIM_RESOLUTION,
      DYE_RESOLUTION,
      CAPTURE_RESOLUTION,
      DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION,
      PRESSURE,
      PRESSURE_ITERATIONS,
      CURL,
      SPLAT_RADIUS,
      SPLAT_FORCE,
      SHADING,
      COLOR_UPDATE_SPEED,
      PAUSED: false,
      BACK_COLOR,
      TRANSPARENT,
    };

    //@ts-ignore
    let pointers = [new pointerPrototype()];

    const { gl, ext } = getWebGLContext(canvas);
    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    //@ts-ignore
    function getWebGLContext(canvas) {
      const params = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
      };
      let gl = canvas.getContext("webgl2", params);
      const isWebGL2 = !!gl;
      if (!isWebGL2)
        gl =
          canvas.getContext("webgl", params) ||
          canvas.getContext("experimental-webgl", params);
      let halfFloat;
      let supportLinearFiltering;
      if (isWebGL2) {
        gl.getExtension("EXT_color_buffer_float");
        supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
      } else {
        halfFloat = gl.getExtension("OES_texture_half_float");
        supportLinearFiltering = gl.getExtension(
          "OES_texture_half_float_linear"
        );
      }
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      const halfFloatTexType = isWebGL2
        ? gl.HALF_FLOAT
        : halfFloat && halfFloat.HALF_FLOAT_OES;
      let formatRGBA;
      let formatRG;
      let formatR;

      if (isWebGL2) {
        formatRGBA = getSupportedFormat(
          gl,
          gl.RGBA16F,
          gl.RGBA,
          halfFloatTexType
        );
        formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
      } else {
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      }

      return {
        gl,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering,
        },
      };
    }

    //@ts-ignore
    function getSupportedFormat(gl, internalFormat, format, type) {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        switch (internalFormat) {
          case gl.R16F:
            return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
          case gl.RG16F:
            return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
          default:
            return null;
        }
      }
      return {
        internalFormat,
        format,
      };
    }
    //@ts-ignore
    function supportRenderTextureFormat(gl, internalFormat, format, type) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        4,
        4,
        0,
        format,
        type,
        null
      );
      const fbo = gl.createFramebuffer();
      //@ts-ignore
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      //@ts-ignore
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      return status === gl.FRAMEBUFFER_COMPLETE;
    }

    class Material {
      //@ts-ignore
      constructor(vertexShader, fragmentShaderSource) {
        //@ts-ignore
        this.vertexShader = vertexShader;
        //@ts-ignore
        this.fragmentShaderSource = fragmentShaderSource;
        //@ts-ignore
        this.programs = [];
        //@ts-ignore
        this.activeProgram = null;
        //@ts-ignore
        this.uniforms = [];
      }
      //@ts-ignore
      setKeywords(keywords) {
        let hash = 0;
        for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);
        //@ts-ignore
        let program = this.programs[hash];
        if (program == null) {
          let fragmentShader = compileShader(
            gl.FRAGMENT_SHADER,
            //@ts-ignore
            this.fragmentShaderSource,
            keywords
          );
          //@ts-ignore
          program = createProgram(this.vertexShader, fragmentShader);
          //@ts-ignore
          this.programs[hash] = program;
        }
        //@ts-ignore
        if (program === this.activeProgram) return;
        //@ts-ignore
        this.uniforms = getUniforms(program);
        //@ts-ignore
        this.activeProgram = program;
      }
      bind() {
        //@ts-ignore
        gl.useProgram(this.activeProgram);
      }
    }

    class Program {
      //@ts-ignore
      constructor(vertexShader, fragmentShader) {
        //@ts-ignore
        this.uniforms = {};
        //@ts-ignore
        this.program = createProgram(vertexShader, fragmentShader);
        //@ts-ignore
        this.uniforms = getUniforms(this.program);
      }
      bind() {
        //@ts-ignore
        gl.useProgram(this.program);
      }
    }
    //@ts-ignore
    function createProgram(vertexShader, fragmentShader) {
      //@ts-ignore
      let program = gl.createProgram();
      //@ts-ignore
      gl.attachShader(program, vertexShader);
      //@ts-ignore
      gl.attachShader(program, fragmentShader);
      //@ts-ignore
      gl.linkProgram(program);
      //@ts-ignore
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.trace(gl.getProgramInfoLog(program));
      return program;
    }
    //@ts-ignore
    function getUniforms(program) {
      let uniforms = [];
      let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        let uniformName = gl.getActiveUniform(program, i).name;
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
      }
      return uniforms;
    }
    //@ts-ignore
    function compileShader(type, source, keywords) {
      source = addKeywords(source, keywords);
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        console.trace(gl.getShaderInfoLog(shader));
      return shader;
    }
    //@ts-ignore
    function addKeywords(source, keywords) {
      if (!keywords) return source;
      let keywordsString = "";
      //@ts-ignore
      keywords.forEach((keyword) => {
        keywordsString += "#define " + keyword + "\n";
      });
      return keywordsString + source;
    }
    //@ts-ignore
    const baseVertexShader = compileShader(
      gl.VERTEX_SHADER,
      `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `
    );
    //@ts-ignore
    const copyShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
      `
    );
    //@ts-ignore
    const clearShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;

        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
     `
    );
    //@ts-ignore
    const displayShaderSource = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform sampler2D uDithering;
      uniform vec2 ditherScale;
      uniform vec2 texelSize;

      vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }

      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;

              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);

              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);

              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif

          float a = max(c.r, max(c.g, c.b));
          gl_FragColor = vec4(c, a);
      }
    `;

    //@ts-ignore
    const splatShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `
    );
    //@ts-ignore
    const advectionShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);

            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
            #ifdef MANUAL_FILTERING
                vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                vec4 result = bilerp(uSource, coord, dyeTexelSize);
            #else
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
            #endif
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }
      `,
      ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"]
    );
    //@ts-ignore
    const divergenceShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;

            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }

            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `
    );
    //@ts-ignore
    const curlShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `
    );
    //@ts-ignore
    const vorticityShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;

        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;

            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;

            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity += force * dt;
            velocity = min(max(velocity, -1000.0), 1000.0);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `
    );
    //@ts-ignore
    const pressureShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `
    );
    //@ts-ignore
    const gradientSubtractShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `
    );
    //@ts-ignore
    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW
      );
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([0, 1, 2, 0, 2, 3]),
        gl.STATIC_DRAW
      );
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      //@ts-ignore
      return (target, clear = false) => {
        if (target == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear) {
          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();
    //@ts-ignore
    let dye, velocity, divergence, curl, pressure;

    //@ts-ignore
    const copyProgram = new Program(baseVertexShader, copyShader);
    //@ts-ignore
    const clearProgram = new Program(baseVertexShader, clearShader);
    //@ts-ignore
    const splatProgram = new Program(baseVertexShader, splatShader);
    //@ts-ignore
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    //@ts-ignore
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    //@ts-ignore
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradienSubtractProgram = new Program(
      baseVertexShader,
      gradientSubtractShader
    );
    const displayMaterial = new Material(baseVertexShader, displayShaderSource);
    //@ts-ignore
    function initFramebuffers() {
      let simRes = getResolution(config.SIM_RESOLUTION);
      let dyeRes = getResolution(config.DYE_RESOLUTION);
      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);
      //@ts-ignore
      if (!dye)
        dye = createDoubleFBO(
          dyeRes.width,
          dyeRes.height,
          //@ts-ignore
          rgba.internalFormat,
          //@ts-ignore
          rgba.format,
          //@ts-ignore
          texType,
          //@ts-ignore
          filtering
        );
      else
        dye = resizeDoubleFBO(
          dye,
          dyeRes.width,
          dyeRes.height,
          //@ts-ignore
          rgba.internalFormat,
          //@ts-ignore
          rgba.format,
          //@ts-ignore
          texType,
          //@ts-ignore
          filtering
        );
      //@ts-ignore
      if (!velocity)
        velocity = createDoubleFBO(
          simRes.width,
          simRes.height,
          //@ts-ignore
          rg.internalFormat,
          //@ts-ignore
          rg.format,
          //@ts-ignore
          texType,
          //@ts-ignore
          filtering
        );
      else
        velocity = resizeDoubleFBO(
          velocity,
          simRes.width,
          simRes.height,
          //@ts-ignore
          rg.internalFormat,
          //@ts-ignore
          rg.format,
          //@ts-ignore
          texType,
          //@ts-ignore
          filtering
        );

      divergence = createFBO(
        simRes.width,
        simRes.height,
        //@ts-ignore
        r.internalFormat,
        //@ts-ignore
        r.format,
        //@ts-ignore
        texType,
        //@ts-ignore
        gl.NEAREST
      );
      curl = createFBO(
        simRes.width,
        simRes.height,
        //@ts-ignore
        r.internalFormat,
        //@ts-ignore
        r.format,
        //@ts-ignore
        texType,
        //@ts-ignore
        gl.NEAREST
      );
      pressure = createDoubleFBO(
        simRes.width,
        simRes.height,
        //@ts-ignore
        r.internalFormat,
        //@ts-ignore
        r.format,
        //@ts-ignore
        texType,
        //@ts-ignore
        gl.NEAREST
      );
    }
    //@ts-ignore
    function createFBO(w, h, internalFormat, format, type, param) {
      gl.activeTexture(gl.TEXTURE0);
      //@ts-ignore
      let texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        w,
        h,
        0,
        format,
        type,
        null
      );

      let fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);

      let texelSizeX = 1.0 / w;
      let texelSizeY = 1.0 / h;
      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX,
        texelSizeY,
        //@ts-ignore
        attach(id) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return id;
        },
      };
    }
    //@ts-ignore
    function createDoubleFBO(w, h, internalFormat, format, type, param) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() {
          return fbo1;
        },
        set read(value) {
          fbo1 = value;
        },
        get write() {
          return fbo2;
        },
        set write(value) {
          fbo2 = value;
        },
        swap() {
          let temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
      };
    }
    //@ts-ignore
    function resizeFBO(target, w, h, internalFormat, format, type, param) {
      let newFBO = createFBO(w, h, internalFormat, format, type, param);
      copyProgram.bind();
      //@ts-ignore
      gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
      blit(newFBO);
      return newFBO;
    }
    //@ts-ignore
    function resizeDoubleFBO(
      //@ts-ignore
      target,
      //@ts-ignore
      w,
      //@ts-ignore
      h,
      //@ts-ignore
      internalFormat,
      //@ts-ignore
      format,
      //@ts-ignore
      type,
      //@ts-ignore
      param
    ) {
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(
        target.read,
        w,
        h,
        internalFormat,
        format,
        type,
        param
      );
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1.0 / w;
      target.texelSizeY = 1.0 / h;
      return target;
    }
    //@ts-ignore
    function updateKeywords() {
      let displayKeywords = [];
      if (config.SHADING) displayKeywords.push("SHADING");
      displayMaterial.setKeywords(displayKeywords);
    } //@ts-ignore

    updateKeywords();
    initFramebuffers();
    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0.0;

    function updateFrame() {
      const dt = calcDeltaTime();
      if (resizeCanvas()) initFramebuffers();
      updateColors(dt);
      applyInputs();
      step(dt);
      render(null);
      requestAnimationFrame(updateFrame);
    }

    function calcDeltaTime() {
      let now = Date.now();
      let dt = (now - lastUpdateTime) / 1000;
      dt = Math.min(dt, 0.016666);
      lastUpdateTime = now;
      return dt;
    }

    function resizeCanvas() {
      //@ts-ignore
      let width = scaleByPixelRatio(canvas.clientWidth);
      //@ts-ignore
      let height = scaleByPixelRatio(canvas.clientHeight);
      //@ts-ignore
      if (canvas.width !== width || canvas.height !== height) {
        //@ts-ignore
        canvas.width = width;
        //@ts-ignore
        canvas.height = height;
        return true;
      }
      return false;
    }
    //@ts-ignore
    function updateColors(dt) {
      colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorUpdateTimer >= 1) {
        colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
        pointers.forEach((p) => {
          p.color = generateColor();
        });
      }
    }
    //@ts-ignore
    function applyInputs() {
      pointers.forEach((p) => {
        if (p.moved) {
          p.moved = false;
          splatPointer(p);
        }
      });
    }
    //@ts-ignore
    function step(dt) {
      gl.disable(gl.BLEND);
      // Curl
      curlProgram.bind();
      gl.uniform2f(
        //@ts-ignore
        curlProgram.uniforms.texelSize,
        //@ts-ignore
        velocity.texelSizeX,
        //@ts-ignore
        velocity.texelSizeY
      );
      //@ts-ignore
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      //@ts-ignore
      blit(curl);

      // Vorticity
      vorticityProgram.bind();
      gl.uniform2f(
        //@ts-ignore
        vorticityProgram.uniforms.texelSize,
        //@ts-ignore
        velocity.texelSizeX,
        //@ts-ignore
        velocity.texelSizeY
      );
      //@ts-ignore
      gl.uniform1i(
        //@ts-ignore
        vorticityProgram.uniforms.uVelocity,
        //@ts-ignore
        velocity.read.attach(0)
      );
      //@ts-ignore
      gl.uniform1i(
        //@ts-ignore
        vorticityProgram.uniforms.uCurl,
        //@ts-ignore
        curl.attach(1)
      );
      //@ts-ignore
      gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      //@ts-ignore
      gl.uniform1f(vorticityProgram.uniforms.dt, dt);
      //@ts-ignore
      blit(velocity.write);
      //@ts-ignore
      velocity.swap();

      // Divergence
      divergenceProgram.bind();
      gl.uniform2f(
        //@ts-ignore
        divergenceProgram.uniforms.texelSize,
        //@ts-ignore
        velocity.texelSizeX,
        //@ts-ignore
        velocity.texelSizeY
      );
      //@ts-ignore
      gl.uniform1i(
        //@ts-ignore
        divergenceProgram.uniforms.uVelocity,
        //@ts-ignore
        velocity.read.attach(0)
      );
      //@ts-ignore
      blit(divergence);

      // Clear pressure
      clearProgram.bind();
      //@ts-ignore
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      //@ts-ignore
      gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      //@ts-ignore
      blit(pressure.write);
      //@ts-ignore
      pressure.swap();

      // Pressure
      pressureProgram.bind();
      gl.uniform2f(
        //@ts-ignore
        pressureProgram.uniforms.texelSize,
        //@ts-ignore
        velocity.texelSizeX,
        //@ts-ignore
        velocity.texelSizeY
      );
      //@ts-ignore
      gl.uniform1i(
        //@ts-ignore
        pressureProgram.uniforms.uDivergence,
        //@ts-ignore
        divergence.attach(0)
      );
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        //@ts-ignore
        gl.uniform1i(
          //@ts-ignore
          pressureProgram.uniforms.uPressure,
          //@ts-ignore
          pressure.read.attach(1)
        );
        //@ts-ignore
        blit(pressure.write);
        //@ts-ignore
        pressure.swap();
      }

      // Gradient Subtract
      gradienSubtractProgram.bind();
      gl.uniform2f(
        //@ts-ignore
        gradienSubtractProgram.uniforms.texelSize,
        //@ts-ignore
        velocity.texelSizeX,
        //@ts-ignore
        velocity.texelSizeY
      );
      //@ts-ignore
      gl.uniform1i(
        //@ts-ignore
        gradienSubtractProgram.uniforms.uPressure,
        //@ts-ignore
        pressure.read.attach(0)
      );
      //@ts-ignore
      gl.uniform1i(
        //@ts-ignore
        gradienSubtractProgram.uniforms.uVelocity,
        //@ts-ignore
        velocity.read.attach(1)
      );
      //@ts-ignore
      blit(velocity.write);
      //@ts-ignore
      velocity.swap();

      // Advection
      advectionProgram.bind();
      //@ts-ignore
      gl.uniform2f(
        //@ts-ignore
        advectionProgram.uniforms.texelSize,
        //@ts-ignore
        velocity.texelSizeX,
        //@ts-ignore
        velocity.texelSizeY
      );
      //@ts-ignore
      if (!ext.supportLinearFiltering)
        //@ts-ignore
        gl.uniform2f(
          //@ts-ignore
          advectionProgram.uniforms.dyeTexelSize,
          //@ts-ignore
          velocity.texelSizeX,
          //@ts-ignore
          velocity.texelSizeY
        );
      //@ts-ignore
      let velocityId = velocity.read.attach(0);
      //@ts-ignore
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
      //@ts-ignore
      gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
      //@ts-ignore
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      //@ts-ignore
      gl.uniform1f(
        //@ts-ignore
        advectionProgram.uniforms.dissipation,
        //@ts-ignore
        config.VELOCITY_DISSIPATION
      );
      //@ts-ignore
      blit(velocity.write);
      //@ts-ignore
      velocity.swap();

      //@ts-ignore
      if (!ext.supportLinearFiltering)
        //@ts-ignore
        gl.uniform2f(
          //@ts-ignore
          advectionProgram.uniforms.dyeTexelSize,
          //@ts-ignore
          dye.texelSizeX,
          //@ts-ignore
          dye.texelSizeY
        );
      //@ts-ignore
      gl.uniform1i(
        //@ts-ignore
        advectionProgram.uniforms.uVelocity,
        //@ts-ignore
        velocity.read.attach(0)
      );
      //@ts-ignore
      gl.uniform1i(
        //@ts-ignore
        advectionProgram.uniforms.uSource,
        //@ts-ignore
        dye.read.attach(1)
      );
      //@ts-ignore
      gl.uniform1f(
        //@ts-ignore
        advectionProgram.uniforms.dissipation,
        //@ts-ignore
        config.DENSITY_DISSIPATION
      );
      //@ts-ignore
      blit(dye.write);
      //@ts-ignore
      dye.swap();
    }

    //@ts-ignore
    function render(target) {
      //@ts-ignore
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      //@ts-ignore
      gl.enable(gl.BLEND);
      //@ts-ignore
      drawDisplay(target);
    }

    //@ts-ignore
    function drawDisplay(target) {
      //@ts-ignore
      let width = target == null ? gl.drawingBufferWidth : target.width;
      //@ts-ignore
      let height = target == null ? gl.drawingBufferHeight : target.height;
      //@ts-ignore
      displayMaterial.bind();
      if (config.SHADING)
        //@ts-ignore
        gl.uniform2f(
          //@ts-ignore
          displayMaterial.uniforms.texelSize,
          //@ts-ignore
          1.0 / width,
          //@ts-ignore
          1.0 / height
        );
      //@ts-ignore
      gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
      //@ts-ignore
      blit(target);
    }

    //@ts-ignore
    function splatPointer(pointer) {
      //@ts-ignore
      let dx = pointer.deltaX * config.SPLAT_FORCE;
      //@ts-ignore
      let dy = pointer.deltaY * config.SPLAT_FORCE;
      //@ts-ignore
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
    }

    //@ts-ignore
    function clickSplat(pointer) {
      //@ts-ignore
      const color = generateColor();
      //@ts-ignore
      color.r *= 10.0;
      //@ts-ignore
      color.g *= 10.0;
      //@ts-ignore
      color.b *= 10.0;
      //@ts-ignore
      let dx = 10 * (Math.random() - 0.5);
      //@ts-ignore
      let dy = 30 * (Math.random() - 0.5);
      //@ts-ignore
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
    }

    //@ts-ignore
    function splat(x, y, dx, dy, color) {
      //@ts-ignore
      splatProgram.bind();
      //@ts-ignore
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      //@ts-ignore
      //@ts-ignore
      gl.uniform1f(
        //@ts-ignore
        splatProgram.uniforms.aspectRatio,
        //@ts-ignore
        canvas.width / canvas.height
      );
      //@ts-ignore
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      //@ts-ignore
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
      //@ts-ignore
      gl.uniform1f(
        //@ts-ignore
        splatProgram.uniforms.radius,
        //@ts-ignore
        correctRadius(config.SPLAT_RADIUS / 100.0)
      );
      //@ts-ignore
      blit(velocity.write);
      //@ts-ignore
      velocity.swap();

      //@ts-ignore
      gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      //@ts-ignore
      gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      //@ts-ignore
      blit(dye.write);
      //@ts-ignore
      dye.swap();
    }

    //@ts-ignore
    function correctRadius(radius) {
      //@ts-ignore
      let aspectRatio = canvas.width / canvas.height;
      //@ts-ignore
      if (aspectRatio > 1) radius *= aspectRatio;
      //@ts-ignore
      return radius;
    }

    //@ts-ignore
    function updatePointerDownData(pointer, id, posX, posY) {
      //@ts-ignore
      pointer.id = id;
      //@ts-ignore
      pointer.down = true;
      //@ts-ignore
      pointer.moved = false;
      //@ts-ignore
      pointer.texcoordX = posX / canvas.width;
      //@ts-ignore
      pointer.texcoordY = 1.0 - posY / canvas.height;
      //@ts-ignore
      //@ts-ignore
      pointer.prevTexcoordX = pointer.texcoordX;
      //@ts-ignore
      pointer.prevTexcoordY = pointer.texcoordY;
      //@ts-ignore
      pointer.deltaX = 0;
      //@ts-ignore
      pointer.deltaY = 0;
      //@ts-ignore
      pointer.color = generateColor();
    }

    //@ts-ignore
    function updatePointerMoveData(pointer, posX, posY, color) {
      //@ts-ignore
      pointer.prevTexcoordX = pointer.texcoordX;
      //@ts-ignore
      pointer.prevTexcoordY = pointer.texcoordY;
      //@ts-ignore
      pointer.texcoordX = posX / canvas.width;
      //@ts-ignore
      pointer.texcoordY = 1.0 - posY / canvas.height;
      //@ts-ignore
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
      pointer.moved =
        Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
      pointer.color = color;
    }
    //@ts-ignore
    function updatePointerUpData(pointer) {
      pointer.down = false;
    }
    //@ts-ignore
    function correctDeltaX(delta) {
      //@ts-ignore
      let aspectRatio = canvas.width / canvas.height;
      //@ts-ignore
      if (aspectRatio < 1) delta *= aspectRatio;
      //@ts-ignore
      return delta;
    }
    //@ts-ignore
    function correctDeltaY(delta) {
      //@ts-ignore
      let aspectRatio = canvas.width / canvas.height;
      //@ts-ignore
      if (aspectRatio > 1) delta /= aspectRatio;
      //@ts-ignore
      return delta;
    }
    //@ts-ignore
    function generateColor() {
      //@ts-ignore
      let c = HSVtoRGB(Math.random(), 1.0, 1.0);
      //@ts-ignore
      c.r *= 0.15;
      //@ts-ignore
      c.g *= 0.15;
      //@ts-ignore
      c.b *= 0.15;
      //@ts-ignore
      return c;
    }

    //@ts-ignore
    function HSVtoRGB(h, s, v) {
      //@ts-ignore
      let r, g, b, i, f, p, q, t;
      //@ts-ignore
      i = Math.floor(h * 6);
      //@ts-ignore
      f = h * 6 - i;
      //@ts-ignore
      p = v * (1 - s);
      //@ts-ignore
      q = v * (1 - f * s);
      //@ts-ignore
      t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
        default:
          break;
      }
      return { r, g, b };
    }

    //@ts-ignore
    function wrap(value, min, max) {
      const range = max - min;
      if (range === 0) return min;
      return ((value - min) % range) + min;
    }

    //@ts-ignore
    function getResolution(resolution) {
      //@ts-ignore
      let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
      //@ts-ignore
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
      //@ts-ignore
      const min = Math.round(resolution);
      //@ts-ignore
      const max = Math.round(resolution * aspectRatio);
      //@ts-ignore
      if (gl.drawingBufferWidth > gl.drawingBufferHeight)
        return { width: max, height: min };
      else return { width: min, height: max };
    }

    //@ts-ignore
    function scaleByPixelRatio(input) {
      const pixelRatio = window.devicePixelRatio || 1;
      return Math.floor(input * pixelRatio);
    }

    //@ts-ignore
    function hashCode(s) {
      if (s.length === 0) return 0;
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0;
      }
      return hash;
    }

    window.addEventListener("mousedown", (e) => {
      let pointer = pointers[0];
      let posX = scaleByPixelRatio(e.clientX);
      let posY = scaleByPixelRatio(e.clientY);
      updatePointerDownData(pointer, -1, posX, posY);
      clickSplat(pointer);
    });

    document.body.addEventListener(
      "mousemove",
      //@ts-ignore
      function handleFirstMouseMove(e) {
        let pointer = pointers[0];
        let posX = scaleByPixelRatio(e.clientX);
        let posY = scaleByPixelRatio(e.clientY);
        let color = generateColor();
        updateFrame(); // start animation loop
        updatePointerMoveData(pointer, posX, posY, color);
        document.body.removeEventListener("mousemove", handleFirstMouseMove);
      }
    );

    window.addEventListener("mousemove", (e) => {
      let pointer = pointers[0];
      let posX = scaleByPixelRatio(e.clientX);
      let posY = scaleByPixelRatio(e.clientY);
      let color = pointer.color;
      updatePointerMoveData(pointer, posX, posY, color);
    });
    //@ts-ignore
    document.body.addEventListener(
      "touchstart",
      function handleFirstTouchStart(e) {
        const touches = e.targetTouches;
        let pointer = pointers[0];
        for (let i = 0; i < touches.length; i++) {
          let posX = scaleByPixelRatio(touches[i].clientX);
          let posY = scaleByPixelRatio(touches[i].clientY);
          updateFrame(); // start animation loop
          updatePointerDownData(pointer, touches[i].identifier, posX, posY);
        }
        document.body.removeEventListener("touchstart", handleFirstTouchStart);
      }
    );
    //@ts-ignore
    window.addEventListener("touchstart", (e) => {
      //@ts-ignore
      const touches = e.targetTouches;
      //@ts-ignore
      let pointer = pointers[0];
      //@ts-ignore
      for (let i = 0; i < touches.length; i++) {
        //@ts-ignore
        let posX = scaleByPixelRatio(touches[i].clientX);
        let posY = scaleByPixelRatio(touches[i].clientY);
        updatePointerDownData(pointer, touches[i].identifier, posX, posY);
      }
    });
    //@ts-ignore
    window.addEventListener(
      "touchmove",
      (e) => {
        const touches = e.targetTouches;
        let pointer = pointers[0];
        for (let i = 0; i < touches.length; i++) {
          let posX = scaleByPixelRatio(touches[i].clientX);
          let posY = scaleByPixelRatio(touches[i].clientY);
          updatePointerMoveData(pointer, posX, posY, pointer.color);
        }
      },
      false
    );
    //@ts-ignore
    window.addEventListener("touchend", (e) => {
      //@ts-ignore
      const touches = e.changedTouches;
      //@ts-ignore
      let pointer = pointers[0];
      //@ts-ignore
      for (let i = 0; i < touches.length; i++) {
        //@ts-ignore
        updatePointerUpData(pointer);
      }
    });

    updateFrame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    CAPTURE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    BACK_COLOR,
    TRANSPARENT,
  ]);

  return (
    <div className="fixed top-0 left-0 z-50 pointer-events-none">
      <canvas ref={canvasRef} id="fluid" className="w-screen h-screen" />
    </div>
  );
}

export { SplashCursor };
