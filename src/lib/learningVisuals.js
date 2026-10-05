const visualRenderers = [];

export function getLearningVisual(concept) {
  return visualRenderers.find((visual) =>
    visual.subject === concept.subject &&
    visual.chapter === concept.chapter &&
    visual.concept === concept.concept
  ) || null;
}
