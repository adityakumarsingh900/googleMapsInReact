import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
import MarkerClusterer from '@googlemaps/markerclustererplus';
import { Box, CheckBox, Button } from 'grommet';
import styled from 'styled-components';
import { RadialSelected } from 'grommet-icons';

import GMapAutocomplete from '../GMapAutocomplete';
import Tooltip from '../Tooltip';

import { getShapeObj } from './utils';

import clusterImg1 from './images/l1-s.png';
import clusterImg2 from './images/l2-s.png';
import clusterImg3 from './images/l3-s.png';
import clusterImg4 from './images/l4-s.png';
import clusterImg5 from './images/l5-s.png';
import markerImg from './images/marker.png';

import geoClusterImg1 from './images/lm1-s.png';
import geoClusterImg2 from './images/lm2-s.png';
import geoClusterImg3 from './images/lm3-s.png';
import geoClusterImg4 from './images/lm4-s.png';
import geoClusterImg5 from './images/lm5-s.png';
import geoMarkerImg from './images/landmark.png';

import userImg from './images/user.png';

const WhiteButton = styled(Button)`
  background-color: white;
  border-color: white;
`;

const KEY = process.env.REACT_APP_MAP_KEY || '';

const CLUSTER_OPTIONS = {
  icon: [
    { height: 42, url: clusterImg1, width: 42, textColor: '#FF9C3C', textSize: '10', anchorText: [16, 0] },
    { height: 45, url: clusterImg2, width: 45, textColor: '#FF9C3C', textSize: '10', anchorText: [16, 0] },
    { height: 53, url: clusterImg3, width: 53, textColor: '#FF9C3C', textSize: '10', anchorText: [16, 0] },
    { height: 62, url: clusterImg4, width: 62, textColor: '#FF9C3C', textSize: '10', anchorText: [16, 0] },
    { height: 72, url: clusterImg5, width: 72, textColor: '#FF9C3C', textSize: '10', anchorText: [16, 0] },
  ],
  zoomOnClick: false,
  maxZoom: 12,
  gridSize: 40,
};

const GEOFENCELUSTER_OPTIONS = {
  icon: [
    { height: 42, url: geoClusterImg1, width: 42, textColor: '#7986CB', textSize: '10', anchorText: [16, 0] },
    { height: 45, url: geoClusterImg2, width: 45, textColor: '#7986CB', textSize: '10', anchorText: [16, 0] },
    { height: 53, url: geoClusterImg3, width: 53, textColor: '#7986CB', textSize: '10', anchorText: [16, 0] },
    { height: 62, url: geoClusterImg4, width: 62, textColor: '#7986CB', textSize: '10', anchorText: [16, 0] },
    { height: 72, url: geoClusterImg5, width: 72, textColor: '#7986CB', textSize: '10', anchorText: [16, 0] },
  ],
  zoomOnClick: true,
  maxZoom: -1,
  gridSize: 40,
};

function Map({
  id,
  defaultLocation: { lat, lng, zoom },
  markers,
  searchable,
  cluster,
  markerConfig,
  onLoad,
  clustering,
  markerInfoWindow,
  clusterInfoWindow,
  geofences,
  geoFenceCluster,
  geoMarkerConfig,
  geoClustering,
  showOnlyShapes,
  onMarkersLoad,
  onGeoMarkersLoad,
}) {
  const [google, setGoogle] = useState(false);
  const [autoFit, setAutoFit] = useState(true);

  useEffect(() => {
    if (!window.google) {
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = `https://maps.google.com/maps/api/js?key=${KEY}&libraries=places,drawing,geometry,visualization`;
      var x = document.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
      // Below is important.
      //We cannot access google.maps until it's finished loading
      s.addEventListener('load', e => {
        setGoogle(window.google);
      });
    } else {
      setGoogle(window.google);
    }
  }, []);

  // INITIALIZE MAP INTO THE DOM
  // WILL RUN 1ST TIME OR IF DEFAULT LOCATION GOT CHANGED
  const map = useMemo(() => {
    if (google) {
      const mapLayer = new google.maps.Map(document.getElementById(id), {
        zoom: zoom,
        center: new google.maps.LatLng(lat, lng),
        tilt: 0,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        panControl: false,
        mapTypeControl: true,
        scaleControl: true, //for zoom level on each map
        controlSize: 30,
        fullscreenControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DEFAULT,
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE],
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      });

      mapLayer.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById(`${id}_autoFit`));
      mapLayer.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
        document.getElementById(`${id}_currentLocation`),
      );
      if (searchable) {
        mapLayer.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById(`${id}_searchBox`));
        // const searchBox = new google.maps.places.Autocomplete(document.getElementById(`${id}_pac-input-search`));
        // // setup event
        // searchBox.addListener('place_changed', console.log);
      }

      onLoad(mapLayer);

      mapLayer.addListener('center_changed', () => autoFit && setAutoFit(false));

      return mapLayer;
    }

    return null;
  }, [google, lat, lng, zoom]);

  const infoWindow = useMemo(() => {
    if (google) return new google.maps.InfoWindow({ content: '<div id="infoWindow" />' });
    return null;
  }, [google]);

  const userMarker = useMemo(() => {
    if (!google) return null;
    return new google.maps.Marker({
      icon: {
        url: userImg,
      },
    });
  }, [google]);

  // INITIALIZE CLUSTER
  // WILL RUN WHENEVER MAP GOT LOADED
  const markerCluster = useMemo(() => {
    if (map) {
      const clusterOptions = { ...CLUSTER_OPTIONS, ...cluster };
      const { icon, zoomOnClick, maxZoom, gridSize } = clusterOptions;

      const acOptions = {
        styles: icon,
        zoomOnClick,
        maxZoom,
        gridSize,
        zIndex: 51,
      };
      const mc = new MarkerClusterer(map, [], acOptions);

      // set mouse events
      if (clusterInfoWindow) {
        mc.addListener('click', cluster => {
          const content = clusterInfoWindow(cluster.getMarkers());

          infoWindow.addListener('domready', e => {
            render(content, document.getElementById('infoWindow'));
          });

          infoWindow.setPosition(cluster.getCenter());
          infoWindow.open(map);
        });
      }

      return mc;
    } else return null;
  }, [map]);

  // LOAD MARKERS ONTO THE MAP
  // WILL RUN IF MARKERS GOT CHANGED OR CLUSTER GOT ON/OFF
  useEffect(() => {
    if (markerCluster && markers.length) {
      const { icon, size } = markerConfig;
      if (!clustering) markerCluster.setMaxZoom(-1);
      else markerCluster.setMaxZoom(12);

      const markerObjs = markers.map(marker => {
        const m = new google.maps.Marker({
          ...marker,
          icon: {
            url: icon,
            scaledSize: new google.maps.Size(size, size),
          },
          position: { lat: marker.latitude, lng: marker.longitude },
        });

        if (markerInfoWindow) {
          m.addListener('click', () => {
            const content = markerInfoWindow(marker);

            infoWindow.addListener('domready', e => {
              render(content, document.getElementById('infoWindow'));
            });

            infoWindow.open(map, m);
          });
        }

        return m;
      });

      onMarkersLoad(markerObjs);

      markerCluster.addMarkers(markerObjs);
      fitMapToMarkers();
      setTimeout(() => setAutoFit(true), 100);
    }

    return () => {
      if (markerCluster) markerCluster.clearMarkers();
    };
  }, [markerCluster, markers, clustering]);

  const handleAutoFitClick = () => {
    fitMapToMarkers();
    setAutoFit(true);
  };

  const handleGPSClick = () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          userMarker.setPosition(pos);
          userMarker.setMap(map);
          map.setCenter(pos);
          map.setZoom(8);
        },
        () => {
          alert('Error: The Geolocation service failed.');
        },
      );
    } else {
      // Browser doesn't support Geolocation
      alert("Error: Your browser doesn't support geolocation.");
    }
  };
  //**************************************//
  //     BELOW IS GEOFENCE'S PROPERTY     //
  //**************************************//

  const [activeShape, setActiveShape] = useState();

  // INITIALIZE CLUSTER
  // WILL RUN WHENEVER MAP GOT LOADED
  const geofenceCluster = useMemo(() => {
    if (map) {
      const geoClusterOptions = { ...GEOFENCELUSTER_OPTIONS, ...geoFenceCluster };
      const { icon, zoomOnClick, maxZoom, gridSize } = geoClusterOptions;

      const acOptions = {
        styles: icon,
        zoomOnClick,
        maxZoom,
        gridSize,
        zIndex: 50,
      };
      const gc = new MarkerClusterer(map, [], acOptions);
      return gc;
    } else return null;
  }, [map]);

  useEffect(() => {
    if (geofenceCluster && geofences.length) {
      const { icon, size } = geoMarkerConfig;
      if (!geoClustering || showOnlyShapes) geofenceCluster.setMaxZoom(-1);
      else geofenceCluster.setMaxZoom(12);

      const geoMarkers = geofences.map(geo => {
        const m = new google.maps.Marker({
          ...geo,
          icon: {
            url: icon,
            scaledSize: new google.maps.Size(size, size),
          },
          shape: getShapeObj(google, { ...geo, map: showOnlyShapes ? map : null }),
          position: { lat: geo.lat, lng: geo.lng },
          visible: showOnlyShapes ? false : true,
        });

        if (!showOnlyShapes) {
          m.addListener('mouseover', () => m.shape.setMap(map));

          m.addListener('mouseout', () => m.shape.setMap(null));

          m.addListener('click', () => {
            const shapeBounds = m.shape.getBounds();
            map.fitBounds(shapeBounds);

            setActiveShape(getShapeObj(google, geo));
            infoWindow.addListener('closeclick', e => setActiveShape(null));

            if (markerInfoWindow) {
              const content = markerInfoWindow(geo);

              infoWindow.addListener('domready', e => {
                render(content, document.getElementById('infoWindow'));
              });

              infoWindow.open(map, m);
            }
          });
        } else {
          m.shape.addListener('click', () => {
            if (markerInfoWindow) {
              const content = markerInfoWindow(geo);

              infoWindow.addListener('domready', e => {
                render(content, document.getElementById('infoWindow'));
              });

              infoWindow.open(map, m);
            }
          });
        }

        return m;
      });

      onGeoMarkersLoad(geoMarkers);
      geofenceCluster.addMarkers(geoMarkers);
      fitMapToMarkers();
      setTimeout(() => setAutoFit(true), 100);
    }

    return () => {
      if (geofenceCluster) {
        geofenceCluster.getMarkers().forEach(g => g.shape.setMap(null));
        geofenceCluster.clearMarkers();
      }
    };
  }, [google, geofences, geofenceCluster, geoClustering, showOnlyShapes]);

  const fitMapToMarkers = useCallback(() => {
    const bounds = new google.maps.LatLngBounds();
    markerCluster.getMarkers().forEach(g => {
      bounds.extend(g.position);
    });

    geofenceCluster.getMarkers().forEach(g => {
      bounds.extend(g.shape.getBounds().getNorthEast());
      bounds.extend(g.shape.getBounds().getSouthWest());
    });

    map.fitBounds(bounds);
  }, [geofenceCluster, markerCluster]);

  useEffect(() => {
    if (activeShape) {
      activeShape.setMap(map);
    }
    return () => activeShape && activeShape.setMap(null);
  }, [activeShape]);

  return (
    <Box height="full" width="full" margin="small" border={{ side: 'all', size: '1px', color: '#c6c6c6' }}>
      {searchable && (
        <Box width="medium" gap="medium" id={`${id}_searchBox`} margin={{ vertical: '7px', horizontal: '7px' }}>
          <GMapAutocomplete id={`${id}_autocomplete`} map={map} />
        </Box>
      )}
      <Box align="center" pad="xsmall" id={`${id}_autoFit`}>
        <Tooltip align="top" content={!autoFit ? `Autofit Map` : `I'm watching`}>
          <CheckBox toggle checked={autoFit} onChange={handleAutoFitClick} />
        </Tooltip>
      </Box>
      <Box align="center" pad="xsmall" id={`${id}_currentLocation`}>
        <Tooltip align="top" content="My Location">
          <WhiteButton
            plain={false}
            icon={<RadialSelected color="blue" size="small" />}
            onClick={handleGPSClick}
            primary
          />
        </Tooltip>
      </Box>
      <Box id={id} style={{ height: '100%' }}></Box>
    </Box>
  );
}

Map.defaultProps = {
  id: 'map',
  defaultLocation: {
    lat: -34.397,
    lng: 150.644,
    zoom: 8,
  },
  searchable: true,
  cluster: {
    icon: [
      { height: 42, url: clusterImg1, width: 42, textColor: '#FF9C3C', textSize: '10', anchorText: [16, 0] },
      { height: 45, url: clusterImg2, width: 45, textColor: '#FF9C3C', textSize: '10', anchorText: [16, 0] },
      { height: 53, url: clusterImg3, width: 53, textColor: '#FF9C3C', textSize: '10', anchorText: [16, 0] },
      { height: 62, url: clusterImg4, width: 62, textColor: '#FF9C3C', textSize: '10', anchorText: [16, 0] },
      { height: 72, url: clusterImg5, width: 72, textColor: '#FF9C3C', textSize: '10', anchorText: [16, 0] },
    ],
    zoomOnClick: false,
    maxZoom: 12,
    gridSize: 40,
  },
  markerConfig: {
    icon: markerImg,
    size: 40,
  },
  onLoad: () => {},
  clustering: true,
  markers: [],
  geoFenceCluster: {
    icon: [
      { height: 42, url: geoClusterImg1, width: 42, textColor: '#7986CB', textSize: '10', anchorText: [16, 0] },
      { height: 45, url: geoClusterImg2, width: 45, textColor: '#7986CB', textSize: '10', anchorText: [16, 0] },
      { height: 53, url: geoClusterImg3, width: 53, textColor: '#7986CB', textSize: '10', anchorText: [16, 0] },
      { height: 62, url: geoClusterImg4, width: 62, textColor: '#7986CB', textSize: '10', anchorText: [16, 0] },
      { height: 72, url: geoClusterImg5, width: 72, textColor: '#7986CB', textSize: '10', anchorText: [16, 0] },
    ],
    zoomOnClick: true,
    maxZoom: -1,
    gridSize: 40,
  },
  geoMarkerConfig: {
    icon: geoMarkerImg,
    size: 32,
  },
  geoClustering: false,
  geofences: [],
  showOnlyShapes: false,
  onMarkersLoad: () => {},
  onGeoMarkersLoad: () => {},
};

Map.propTypes = {
  id: PropTypes.string,
  defaultLocation: PropTypes.object,
  searchable: PropTypes.bool,
  cluster: PropTypes.object,
  markerConfig: PropTypes.object,
  onLoad: PropTypes.func,
  clustering: PropTypes.bool,
  markerInfoWindow: PropTypes.func,
  clusterInfoWindow: PropTypes.func,
  markers: PropTypes.array,
  geoFenceCluster: PropTypes.object,
  geoMarkerConfig: PropTypes.object,
  geoClustering: PropTypes.bool,
  geofences: PropTypes.array,
  showOnlyShapes: PropTypes.bool,
  onMarkersLoad: PropTypes.func,
  onGeoMarkersLoad: PropTypes.func,
};

export default Map;
