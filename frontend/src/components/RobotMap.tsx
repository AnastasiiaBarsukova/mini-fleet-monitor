import { useEffect, useRef } from "react";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

import "ol/ol.css";

import type { Robot } from "../api/robots";

type RobotMapProps = {
  robots: Robot[];
};

const RobotMap = ({ robots }: RobotMapProps) => {
  const mapElement = useRef<HTMLDivElement | null>(null);

  const vectorSourceRef = useRef(
    new VectorSource()
  );

  const robotStyle = new Style({
  image: new CircleStyle({
    radius: 8,
    fill: new Fill({
      color: "#ef4444",
    }),
    stroke: new Stroke({
      color: "#ffffff",
      width: 2,
    }),
  }),
});

  useEffect(() => {
    if (!mapElement.current) {
      return;
    }

    const map = new Map({
      target: mapElement.current,

      layers: [
        new TileLayer({
          source: new OSM(),
        }),

        new VectorLayer({
          source: vectorSourceRef.current,
          style: robotStyle
        }),
      ],

      view: new View({
        center: fromLonLat([13.405, 52.52]),
        zoom: 12,
      }),
    });

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    const source = vectorSourceRef.current;

    source.clear();

    const features = robots.map(
      (robot) =>
        new Feature({
          geometry: new Point(
            fromLonLat([
              robot.lon,
              robot.lat,
            ])
          ),
          robotId: robot.id,
        })
    );

    source.addFeatures(features);
  }, [robots]);

  return (
    <div
      ref={mapElement}
      style={{
        width: "100%",
        height: "500px",
      }}
    />
  );
};

export default RobotMap;