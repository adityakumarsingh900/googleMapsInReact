// Lib Imports
import React, { useState } from "react";
import { Box, CheckBox } from "grommet";

// Core Imports
import GMap from "./components/GMap";

import { geoData, markers } from "./data";
// Application Imports

const MapsPage = () => {
  const [mapInstance, setMapInstance] = useState();
  const [mapConfig, setMapConfig] = useState({
    cCluster: true,
    gCluster: true,
    gMarkers: true,
  });

  return (
    <Box flex pad="medium" height="80vh">
      <Box align="center" pad="xsmall" direction="row">
        <CheckBox
          toggle
          label={`Customer Clusters`}
          checked={mapConfig.cCluster}
          onChange={() =>
            setMapConfig({ ...mapConfig, cCluster: !mapConfig.cCluster })
          }
        />
        <CheckBox
          toggle
          label={`Geofence Clusters`}
          checked={mapConfig.gCluster}
          disabled={!mapConfig.gMarkers}
          onChange={() =>
            setMapConfig({ ...mapConfig, gCluster: !mapConfig.gCluster })
          }
        />
        <CheckBox
          toggle
          label={`Geofence Markers`}
          checked={mapConfig.gMarkers}
          onChange={() => {
            setMapConfig({
              ...mapConfig,
              gCluster: false,
              gMarkers: !mapConfig.gMarkers,
            });
          }}
        />
      </Box>
      <GMap
        markers={markers}
        clustering={mapConfig.cCluster}
        markerInfoWindow={(marker) => <Box>Name - {marker.name}</Box>}
        clusterInfoWindow={(markers) => (
          <Box>Have {markers.length} markers</Box>
        )}
        geofences={geoData}
        geoClustering={mapConfig.gCluster}
        showOnlyShapes={!mapConfig.gMarkers}
        onLoad={setMapInstance}
        searchable={false}
      />
    </Box>
  );
};

MapsPage.propTypes = {};

export default MapsPage;
