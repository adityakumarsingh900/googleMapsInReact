// Lib Imports
import React, { useState, useMemo, useEffect, useContext } from 'react';
import { Box, Select, Text, ThemeContext, FormField } from "grommet";
import { Location, Radial, Checkbox } from 'grommet-icons';
import { DrawPolygon } from '@styled-icons/fa-solid/DrawPolygon';
import { FlowLine } from '@styled-icons/entypo/FlowLine';
import PropTypes from 'prop-types';
import _ from 'lodash';

// Core Imports
import ButtonGroup from '../ButtonGroup';
import ColorPicker from '../ColorPicker';
import { getShapeObj } from '../GMap/utils';

// Same marker as used in GMap
import markerImg from '../GMap/images/marker.png';

// default available drawing modes
const drawingModeOptions = theme => [
  {
    icon: <Location size="small" />,
    value: 'marker',
  },
  {
    icon: <Radial size="small" />,
    value: 'circle',
  },
  {
    icon: <Checkbox size="small" />,
    value: 'rectangle',
  },
  {
    icon: <FlowLine size={theme.icon.size['small']} color={theme.global.colors['icon']} />,
    value: 'polyline',
  },
  {
    icon: <DrawPolygon size={theme.icon.size['small']} color={theme.global.colors['icon']} />,
    value: 'polygon',
  },
];

// handling the onChange data according to drawing mode
const handleOnChange = (type, overlay, onChange) => {
  let obj = {
    type,
    strokeWeight: overlay.strokeWeight,
    fillColor: overlay.fillColor,
    fillOpacity: overlay.fillOpacity,
  };
  if (type === 'marker') {
    obj.position = { lat: overlay.position.lat(), lng: overlay.position.lng() };
  } else if (type === 'circle') {
    obj.center = { lat: overlay.center.lat(), lng: overlay.center.lng() };
    obj.radius = overlay.radius;
  } else if (type === 'rectangle') {
    const ne = overlay.getBounds().getNorthEast();
    const sw = overlay.getBounds().getSouthWest();
    obj.bounds = {
      north: ne.lat(),
      east: ne.lng(),
      south: sw.lat(),
      west: sw.lng(),
    };
  } else if (type === 'polygon') {
    let path = overlay.getPath(),
      coordinates = [];
    Array(path.getLength())
      .fill()
      .forEach((_, i) => coordinates.push(path.getAt(i).toJSON()));

    obj.paths = coordinates;
  } else if (type === 'polyline') {
    let path = overlay.getPath(),
      coordinates = [];
    Array(path.getLength())
      .fill()
      .forEach((_, i) => coordinates.push(path.getAt(i).toJSON()));
    obj.path = coordinates;
    obj.strokeColor = overlay.strokeColor;
    obj.strokeOpacity = overlay.strokeOpacity;
  }
  if (onChange && typeof onChange === 'function') onChange(obj);
};

const debounceChange = _.debounce(handleOnChange, 200);

// add listeners for edit and drag events
const handleListeners = (google, type, overlay, onChange) => {
  if (type === 'polygon' || type === 'polyline') {
    google.maps.event.addListener(overlay.getPath(), 'insert_at', e => debounceChange(type, overlay, onChange));
    google.maps.event.addListener(overlay.getPath(), 'remove_at', e => debounceChange(type, overlay, onChange));
    google.maps.event.addListener(overlay.getPath(), 'set_at', e => debounceChange(type, overlay, onChange));
  }

  let boundsEvent = overlay.addListener('bounds_changed', e => debounceChange(type, overlay, onChange));
  overlay.addListener('dragstart', e => {
    google.maps.event.removeListener(boundsEvent);
  });
  overlay.addListener('dragend', event => {
    boundsEvent = overlay.addListener('bounds_changed', e => debounceChange(type, overlay, onChange));
    debounceChange(type, overlay, onChange);
  });
};

const GMapDraw = ({ map, color, stroke, opacity, shape_type, modes, onChange, shape, ...rest }) => {
  const theme = useContext(ThemeContext);

  const google = useMemo(() => window.google || false, []);
  const [drawingManager, setDrawingManager] = useState();
  const [fillColor, setFillColor] = useState(color);
  const [strokeWeight, setStrokeWeight] = useState(stroke);
  const [fillOpacity, setFillOpacity] = useState(opacity);
  const [type, setType] = useState(shape_type);
  const [overlay, setOverlay] = useState();

  // HANDLE EXISTING SHAPE
  useEffect(() => {
    if (google && shape && map && !overlay) {
      const shapeObj = getShapeObj(google, { ...shape, editable: true, draggable: true, map });
      setOverlay(shapeObj);
      handleListeners(google, type, shapeObj, onChange);
      const shapeBounds = shapeObj.getBounds();
      map.fitBounds(shapeBounds);
    }
  }, [google, map, shape, type, onChange, overlay]);

  useEffect(() => {
    if (google && map && !drawingManager) {
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl: false,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [...modes],
        },

        markerOptions: {
          icon: {
            url: markerImg,
          },
          draggable: true,
        },

        circleOptions: {
          fillColor,
          fillOpacity,
          strokeWeight,
          draggable: true,
          editable: true,
          zIndex: 1,
        },
        rectangleOptions: {
          strokeWeight,
          fillColor,
          fillOpacity,
          editable: true,
          draggable: true,
          zIndex: 1,
        },
        polylineOptions: {
          strokeWeight,
          strokeColor: fillColor,
          strokeOpacity: fillOpacity,
          editable: true,
          draggable: true,
          zIndex: 1,
        },
        polygonOptions: {
          strokeWeight,
          fillColor,
          fillOpacity,
          editable: true,
          draggable: true,
          zIndex: 1,
        },
      });

      if (map) drawingManager.setMap(map);
      setDrawingManager(drawingManager);
      drawingManager.addListener('overlaycomplete', function (event) {
        handleListeners(google, event.type, event.overlay, onChange);
        handleOnChange(event.type, event.overlay, onChange);
        setOverlay(event.overlay);
        drawingManager.setDrawingMode(null);
      });
    }
  }, [map, google, drawingManager, fillColor, fillOpacity, strokeWeight, onChange, modes]);

  const setOverlayOptions = options => {
    if (overlay) {
      overlay.setOptions({
        ...options,
      });
      if (type === 'polyline')
        overlay.setOptions({
          strokeColor: options.fillColor || fillColor,
          strokeOpacity: options.fillOpacity || fillOpacity,
        });
    }

    handleOnChange(type, overlay, onChange);

    let prevOptions = {
      // for code reuse
      fillColor,
      fillOpacity,
      strokeWeight,
      draggable: true,
      editable: true,
      zIndex: 1,
    };
    if (drawingManager) {
      drawingManager.setOptions({
        circleOptions: {
          ...prevOptions,
          ...options,
        },
        rectangleOptions: {
          ...prevOptions,
          ...options,
        },
        polygonOptions: {
          ...prevOptions,
          ...options,
        },
        polylineOptions: {
          strokeWeight: options.strokeWeight || strokeWeight,
          strokeColor: options.fillColor || fillColor,
          strokeOpacity: options.fillOpacity || fillOpacity,
          editable: true,
          draggable: true,
          zIndex: 1,
        },
      });
    }
  };

  const handleTypeChange = type => {
    setType(type);
    // user selected a different drawing mode which clears current shape data if any
    if (onChange) onChange({});
    if (drawingManager) {
      if (overlay) overlay.setMap(null);
      drawingManager.setDrawingMode(type);
    }
  };

  const handleColorChange = ({ hex, opacity }) => {
    setFillOpacity(opacity);
    setFillColor(hex);
    setOverlayOptions({ fillColor: hex, fillOpacity: opacity });
  };

  const handleStrokeChange = ({ value }) => {
    setOverlayOptions({ strokeWeight: value });
    setStrokeWeight(value);
  };

  return (
    <Box {...rest}>
      <ButtonGroup
        // filter user specified drawing modes from all the modes available
        options={drawingModeOptions(theme).filter(mode => modes.includes(mode.value))}
        value={type}
        onChange={handleTypeChange}
      />
      {overlay && type !== 'marker' && (
        <Box margin={{ top: 'small' }} gap="small" direction="row" wrap align="stretch">
          <FormField normal label="Color">
            <ColorPicker onChange={handleColorChange} value={color} opacity={opacity} />
          </FormField>
          <FormField label="Stroke">
            <Select
              value={strokeWeight}
              valueLabel={
                <Box pad={{ horizontal: 'small' }}>
                  <Text>{`${strokeWeight} px`}</Text>
                </Box>
              }
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              onChange={handleStrokeChange}
              dropHeight="small"
            >
              {(option, index, options, { active, disabled, selected }) => {
                return (
                  <Box pad="small" background={selected ? 'brand' : 'inherit'}>
                    <Text color={selected ? 'white' : 'inherit'}>{`${option} px`}</Text>
                  </Box>
                );
              }}
            </Select>
          </FormField>
        </Box>
      )}
    </Box>
  );
};

GMapDraw.defaultProps = {
  color: '#ff0000',
  stroke: 3,
  opacity: 1,
  modes: ['marker', 'circle', 'rectangle', 'polyline', 'polygon'],
};

GMapDraw.propTypes = {
  onChange: PropTypes.func,
  modes: PropTypes.array,
  color: PropTypes.string,
  stroke: PropTypes.number,
  opacity: PropTypes.number,
  shape_type: PropTypes.number,
  map: PropTypes.object,
  shape: PropTypes.object,
};

export default GMapDraw;
