import React, { useState, useRef } from 'react';
import { SketchPicker } from 'react-color';
import styled from 'styled-components';
import { Box, Drop } from 'grommet';

const Swatch = styled(Box)`
  padding: 4px;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
`;

const Color = styled(Box)`
  width: ${props => (props.width ? props.width : '40px')};
  height: ${props => (props.height ? props.height : '24px')};
  border-radius: 2px;
  background: ${props =>
    props.color[0] === '#'
      ? props.color
      : `rgba(${props.color.r}, ${props.color.g}, ${props.color.b}, ${props.color.a})`};
`;

const Sketch = styled(SketchPicker)`
  z-index: 4;
`;

const ColorPicker = ({ value, opacity, presetColors, disableAlpha, onChange, width, height, className }) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(value[0] === '#' ? `${value}${Math.round(255 * opacity).toString(16)}` : value);
  const ref = useRef();

  const handleClick = () => {
    setDisplayColorPicker(prev => !prev);
  };

  const handleClose = e => {
    if (ref?.current?.contains(e.target)) return;
    setDisplayColorPicker(false);
  };

  const handleChange = color => {
    setColor(color.rgb);
    if (onChange) onChange({ hex: color.hex, rgb: color.rgb, opacity: color.rgb.a });
  };

  return (
    <div className={className} ref={ref}>
      <Swatch onClick={handleClick}>
        <Color color={color} />
      </Swatch>
      {ref.current && displayColorPicker && (
        <Drop
          stretch={false}
          align={{ top: 'bottom', left: 'left' }}
          target={ref.current}
          onClickOutside={handleClose}
          plain
        >
          <Sketch
            color={color}
            onChangeComplete={handleChange}
            presetColors={presetColors}
            disableAlpha={disableAlpha}
          />
        </Drop>
      )}
    </div>
  );
};

ColorPicker.defaultProps = {
  className: '',
  onChange: () => {},
  value: '#ff0000',
  opacity: 1,
  presetColors: [],
  disableAlpha: false,
};

export default ColorPicker;
