import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Drop, Text, TextInput, Image } from 'grommet';
import { FormSearch, FormClose } from 'grommet-icons';
import styled from 'styled-components';
import _ from 'lodash';
import poweredByGoogle from './powered_by_google.png';

const StyledTextInput = styled(TextInput)`
  border: none;
  padding-right: 1.5rem;
  &:focus {
    outline: none;
    box-shadow: none;
  }
`;
const StyledBox = styled(Box)`
  position: relative;
  & svg {
    position: absolute;
    right: 0;
  }
`;
const Close = styled(FormClose)`
  cursor: pointer;
`;

const SuggestionBox = styled(Box)`
  :hover {
    background: rgba(221, 221, 221, 0.4);
  }
`;

const PoweredByGoogleBox = () => (
  <Box pad="xsmall" align="end">
    <Image fit="contain" src={poweredByGoogle} />
  </Box>
);

const GMapAutocomplete = ({
  id,
  value: defaultValue,
  onChange,
  map,
  onPlaceSelect,
  showMarker,
  config,
  noResultBox,
  defaultPlace,
  onFocus,
  ...rest
}) => {
  const google = useMemo(() => window.google || false, []);
  const [suggestions, setSuggestions] = useState([]);
  const [value, setValue] = useState(defaultValue || '');
  const [place, setPlace] = useState(defaultPlace || '');
  const ref = useRef();
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (JSON.stringify(defaultPlace) !== JSON.stringify(place)) setPlace(defaultPlace);
  }, [defaultPlace, place]);
  useEffect(() => setValue(defaultValue), [defaultValue]);

  const { marker, searchSevice, detailSevice, OK } = useMemo(() => {
    if (!google) return {};

    const marker = new google.maps.Marker({
      anchorPoint: new google.maps.Point(0, -29),
    });

    // TODO: ADD CONFIGS OPTION IN AUTOCOMPLETE
    const searchSevice = new google.maps.places.AutocompleteService();

    const detailSevice = new google.maps.places.PlacesService(map || document.createElement('div'));

    const OK = google.maps.places.PlacesServiceStatus.OK;

    return { marker, searchSevice, detailSevice, OK };
  }, [google, map]);

  const setMarkerToMap = useCallback(
    geometry => {
      if (!geometry) {
        alert('No details available for input');
        return;
      }
      if (geometry.viewport) {
        map.fitBounds(geometry.viewport);
      } else {
        map.setCenter(geometry.location);
        map.setZoom(17);
      }
      marker.setPosition(geometry.location);
      if (showMarker) marker.setMap(map);
      marker.setVisible(true);
    },
    [marker, map, showMarker],
  );

  useEffect(() => {
    if (map && place) {
      let { bounds, location } = place;
      setMarkerToMap({
        location,
        viewport: bounds
          ? new google.maps.LatLngBounds(
              new google.maps.LatLng(bounds?.south, bounds?.west),
              new google.maps.LatLng(bounds?.north, bounds?.east),
            )
          : null,
      });
    }
  }, [place, map, google, setMarkerToMap]);

  const debouncedHandleSearch = useCallback(
    _.throttle(input => {
      searchSevice.getPlacePredictions({ ...config, input }, (predictions, status) => {
        setShowSuggestions(true);
        if (status !== OK) {
          setSuggestions([
            { label: noResultBox, value: null },
            { label: <PoweredByGoogleBox />, value: null },
          ]);
          return;
        }
        setSuggestions(() => {
          return [
            ...predictions.map(p => ({ label: p.description, value: p.place_id })),
            { label: <PoweredByGoogleBox />, value: null },
          ];
        });
      });
    }, 777),
    [searchSevice],
  );

  const setPlaceDetails = useCallback(
    (place, status) => {
      if (status !== OK) return false;
      onPlaceSelect(place);
      if (onChange)
        onChange(place, {
          location: place?.geometry?.location.toJSON(),
          bounds: place?.geometry?.viewport?.toJSON(),
        });
      if (map) {
        setMarkerToMap(place?.geometry);
      }
    },
    [OK, map, onChange, onPlaceSelect, setMarkerToMap],
  );

  const getPlaceDetails = useCallback(
    placeId => {
      detailSevice.getDetails({ placeId }, setPlaceDetails);
    },
    [detailSevice, setPlaceDetails],
  );

  const handleClear = useCallback(() => {
    setValue('');
    onChange('');
    setShowSuggestions(false);
    setSuggestions([]);
    marker.setMap(null);
  }, [marker, onChange]);

  const handleClickOutside = e => {
    if (ref?.current?.contains(e.target)) return;
    setShowSuggestions(false);
  };

  return (
    <StyledBox ref={ref} direction="row" align="center">
      <StyledTextInput
        {...rest}
        plain
        id={id}
        placeholder=""
        value={value}
        onChange={evt => {
          setValue(evt.target.value);
          debouncedHandleSearch(evt.target.value);
        }}
        onFocus={e => {
          if (suggestions.length && !showSuggestions) setShowSuggestions(true);
          if (onFocus) onFocus(e);
        }}
        // suggestions={suggestions}
        // onSelect={e => {
        //   setValue(e.suggestion.label);
        //   getPlaceDetails(e.suggestion.value);
        // }}
      />
      {value ? <Close onClick={handleClear} /> : <FormSearch />}
      {!!suggestions.length && showSuggestions && (
        <Drop target={ref.current} align={{ top: 'bottom' }} onClickOutside={handleClickOutside}>
          {suggestions.map((item, index, list) => (
            <SuggestionBox
              key={index}
              pad="small"
              flex={{ shrink: 0 }}
              onClick={
                value !== null // disable onclick for "powered by google" and "no results found"
                  ? e => {
                      setShowSuggestions(false);
                      setValue(item.label);
                      getPlaceDetails(item.value);
                    }
                  : null
              }
            >
              <Text style={{ lineHeight: '24px' }}>{item.label}</Text>
            </SuggestionBox>
          ))}
        </Drop>
      )}
    </StyledBox>
  );
};

GMapAutocomplete.defaultProps = {
  options: {},
  id: 'autocomplete',
  showMarker: true,
  onPlaceSelect: () => {},
  value: '',
  config: {},
  noResultBox: 'No Result Found',
  defaultPlace: null,
};

GMapAutocomplete.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  map: PropTypes.any,
  onPlaceSelect: PropTypes.func,
  showMarker: PropTypes.bool,
  config: PropTypes.object,
  noResultBox: PropTypes.any,
  defaultPlace: PropTypes.any,
  onFocus: PropTypes.func,
};

export default GMapAutocomplete;
