import React, { Children, useRef, useState } from 'react';
import { Box, Drop, Text } from 'grommet';
import { withTheme } from 'styled-components';
import PropTypes from 'prop-types';
import _ from 'lodash';

const debounceOptions = {
  leading: true,
  trailing: false,
};

const Tooltip = ({ align, children, content, debounced, disabled, ...rest }) => {
  const defaultIsVisible = false;
  const [isVisible, setIsVisible] = useState(defaultIsVisible);

  const childRef = useRef();

  const handleMouseEnter = () => !disabled && setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  const debouncedHandleMouseEnter = _.debounce(handleMouseEnter, 200, debounceOptions);
  const debouncedHandleMouseLeave = _.debounce(handleMouseLeave, 200);

  const getAlignmentObj = () => {
    const alignmentObj = {};
    switch (align) {
      case 'left':
        alignmentObj.right = 'left';
        break;
      case 'right':
        alignmentObj.left = 'right';
        break;
      case 'top':
        alignmentObj.bottom = 'top';
        break;
      case 'bottom':
        alignmentObj.top = 'bottom';
        break;
      default:
        break;
    }
    return alignmentObj;
  };

  return (
    <>
      <span
        // style={width?width:{width: '100%'}}
        // style={{display: 'inline-block'}}
        onMouseEnter={debounced ? debouncedHandleMouseEnter : handleMouseEnter}
        onMouseLeave={debounced ? debouncedHandleMouseLeave : handleMouseLeave}
        ref={childRef}
      >
        {Children.only(children)}
      </span>
      {childRef.current && isVisible && (
        <Drop align={getAlignmentObj()} elevation="small" target={childRef.current} plain>
          <Box align="center" margin="xsmall" pad="small" background="dark-3" round="xsmall" {...rest}>
            <Text color="text" size="small">
              {content}
            </Text>
          </Box>
        </Drop>
      )}
    </>
  );
};

Tooltip.defaultProps = {
  align: 'right',
  debounced: true,
  disabled: false,
};

Tooltip.propTypes = {
  align: PropTypes.oneOf(['bottom', 'left', 'right', 'top']),
  content: PropTypes.string,
  bottom: PropTypes.bool,
  debounced: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default withTheme(Tooltip);
