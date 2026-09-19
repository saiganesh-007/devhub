# Supplied Flip Card Behavior Reference

The user supplied this interaction pattern:

```css
.flip-card {
  background-color: transparent;
  width: 190px;
  height: 254px;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 1rem;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

Use the structural idea:
- outer perspective container
- inner preserve-3d wrapper
- front/back absolute faces
- hidden backfaces
- 180deg Y rotation

Do not copy the original coral/bisque styling.
Adapt it to DevHub's shared design tokens and responsive component system.
