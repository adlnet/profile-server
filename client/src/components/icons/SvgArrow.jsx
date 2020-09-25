
import React from 'react';

const SvgArrow = props => {
  return (
    <svg width={12} height={18} >
      <path
        d="M11.304 8.05c.537.525.537 1.375.006 1.9l-7.68 7.603a1.36 1.36 0 01-1.913 0L.44 16.289a1.327 1.327 0 010-1.895l5.444-5.388L.44 3.616a1.327 1.327 0 010-1.894L1.71.447a1.36 1.36 0 011.915 0l7.68 7.603z"
        fill={props.hover ? "#562b97" : "#005ea2"}
      />
    </svg>
  );
}
export default SvgArrow;