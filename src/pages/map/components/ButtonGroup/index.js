import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Box, RadioButtonGroup, Text } from 'grommet';
import styled from 'styled-components';

const Option = styled(Box)`
  background: ${props =>
    props.checked
      ? props.theme.global.colors[props.checkedBackground]
      : props.hover
      ? props.theme.global.colors[props.hoverBackground]
      : props.theme.global.colors[props.uncheckedBackground]};
  color: #fff;
`;

const StyledButtonGroup = styled(RadioButtonGroup)`
  & label {
    align-items: stretch;
  }
  & label:first-child input + div {
    border-radius: 4px 0 0 4px;
  }
  & label:last-child input + div {
    border-radius: 0 4px 4px 0;
  }
`;

const ButtonGroup = ({ options, value: initialValue, onChange: userOnChange, direction, ...rest }) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = value => {
    setValue(value);
    userOnChange(value);
  };

  return (
    <StyledButtonGroup
      name="radio"
      direction={direction}
      options={options}
      value={value}
      onChange={event => handleChange(event.target.value)}
      gap="none"
    >
      {(option, { checked, hover }) => {
        return (
          <Option
            flex
            direction="row"
            gap="xsmall"
            checked={checked}
            hover={hover}
            pad={{ horizontal: 'medium', vertical: 'small' }}
            align="center"
            {...rest}
          >
            {option.icon}
            {option.label && <Text>{option.label}</Text>}
          </Option>
        );
      }}
    </StyledButtonGroup>
  );
};

ButtonGroup.defaultProps = {
  options: [],
  onChange: () => {},
  value: undefined,
  direction: 'row',
  checkedBackground: 'brand',
  hoverBackground: 'light-4',
  uncheckedBackground: 'border',
};

ButtonGroup.propTypes = {
  options: PropTypes.array,
  onChange: PropTypes.func,
  checkedBackground: PropTypes.string,
  hoverBackground: PropTypes.string,
  uncheckedBackground: PropTypes.string,
};

export default ButtonGroup;
