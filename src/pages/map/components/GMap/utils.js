import markerImg from './images/marker.png';

function getShapeObj(google, shape) {
  if (shape.typeId === 'MARKER')
    return new google.maps.Marker({
      icon: {
        url: markerImg,
      },
      draggable: true,
      position: { lat: shape.latitude, lng: shape.longitude },
      getBounds: () => {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(shape.latitude, shape.longitude));
        return bounds;
      },
      ...shape,
    });
  else if (shape.typeId === 'CIRCLE')
    return new google.maps.Circle({
      strokeColor: shape.color || '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: shape.color || '#FF0000',
      fillOpacity: 0.35,
      center: { lat: shape.lat, lng: shape.lng },
      radius: shape.radius,
      ...shape,
    });
  else if (shape.typeId === 'RECTANGLE')
    return new google.maps.Rectangle({
      strokeColor: shape.color || '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: shape.color || '#FF0000',
      fillOpacity: 0.35,
      bounds: {
        north: shape.polygon[0].lat,
        south: shape.polygon[2].lat,
        east: shape.polygon[1].lng,
        west: shape.polygon[0].lng,
      },
      ...shape,
    });
  else if (shape.typeId === 'POLYLINE')
    return new google.maps.Polyline({
      path: shape.polygon,
      geodesic: true,
      strokeColor: shape.color || '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      getBounds: () => {
        const bounds = new google.maps.LatLngBounds();
        if (shape.polygon) shape.polygon.forEach(path => bounds.extend(new google.maps.LatLng(path.lat, path.lng)));
        return bounds;
      },
      ...shape,
    });
  else
    return new google.maps.Polygon({
      paths: shape.polygon,
      strokeColor: shape.color || '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: shape.color || '#FF0000',
      fillOpacity: 0.35,
      getBounds: () => {
        const bounds = new google.maps.LatLngBounds();
        if (shape.polygon) shape.polygon.forEach(path => bounds.extend(new google.maps.LatLng(path.lat, path.lng)));
        return bounds;
      },
      ...shape,
    });
}

export { getShapeObj };
