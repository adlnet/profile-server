  
  export const pick = (...props) => (o) =>
  props.reduce((a, e) => ({ ...a, [e]: o[e] }), {});