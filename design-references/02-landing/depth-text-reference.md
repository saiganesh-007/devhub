# React Bits — DepthText Reference

Use this component as the reference for DevHub's primary hero dimensional typography.

## Usage Example

```jsx
import DepthText from './DepthText';

<DepthText
  text="DEVHUB"
  layers={34}
  depth={2.4}
  faceColor="#f8fafc"
  depthColor="#7c3aed"
  tilt={7.5}
  pointerTracking
  smoothing={0.14}
  perspective={900}
  autoOrbit
  orbitSpeed={0.35}
  fontSize="clamp(3rem, 12vw, 7rem)"
  fontWeight={900}
  shadow
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | "Elevate" | The word or short phrase rendered as extruded type. |
| layers | number | 34 | Number of stacked copies that form the extrusion. Clamped to protect the DOM. |
| depth | number | 2.4 | Spacing in pixels between each layer of the extrusion. |
| faceColor | string | "#f8fafc" | Color of the crisp front face of the text. |
| depthColor | string | "#7c3aed" | Tint used for the back of the extrusion and its shadow. |
| tilt | number | 7.5 | Maximum pointer-driven rotation in degrees. |
| pointerTracking | boolean | true | Enables smoothed pointer parallax on fine pointer devices. |
| smoothing | number | 0.14 | Damping amount used to ease rotation toward the pointer target. |
| perspective | number | 900 | Perspective distance in pixels for the 3D stack. |
| autoOrbit | boolean | true | Adds a subtle orbit when pointer tracking is unavailable or idle. |
| orbitSpeed | number | 0.35 | Speed of the fallback orbit in cycles per second. |
| fontSize | string | "clamp(3rem, 12vw, 7rem)" | CSS font-size value for the display word. |
| fontWeight | number | string | 900 | Font weight used for every layer. |
| shadow | boolean | true | Adds a soft colored drop shadow to the front face. |
| className | string | "" | Optional class name for the outer wrapper. |
| style | CSSProperties | {} | Optional inline styles for the outer wrapper. |

## DevHub-specific constraints

- Use primarily for the hero word `DEVHUB`.
- Keep pointer motion subtle.
- Preserve `prefers-reduced-motion`.
- Do not repeat this treatment on every section heading.
- Adjust the purple example depth color to the final DevHub palette if needed.
- The component must remain responsive and must not overflow mobile screens.
