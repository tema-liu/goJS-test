import {
  applyCommonNodeStyleBindings,
  applyCommonScaleBindings,
  commonNodeStyle,
  sliderActions,
} from "./component";

export function createNeedleMeter() {
  return new go.Node("Auto", {
    ...commonNodeStyle(),
    movable: false,
  })
    .apply(applyCommonNodeStyleBindings)
    .add(
      new go.Shape({ fill: "darkslategray" }),
      new go.Panel("Spot").add(
        new go.Panel("Position").add(
          new go.Panel("Graduated", { name: "SCALE", margin: 10 })
            .apply(applyCommonScaleBindings)
            .add(
              new go.Shape({
                name: "PATH",
                geometryString: "M0 0 A120 120 0 0 1 200 0",
                stroke: "white",
              }),
              new go.Shape({ geometryString: "M0 0 V10", stroke: "white" }),
              new go.TextBlock({
                segmentOffset: new go.Point(0, 12),
                segmentOrientation: go.Orientation.Along,
                stroke: "white",
              })
            ),
          new go.Shape({
            stroke: "red",
            strokeWidth: 4,
            isGeometryPositioned: true,
            ...sliderActions(true),
          }).bind("geometry", "value", (v, shp) => {
            var scale = shp.part.findObject("SCALE");
            var pt = scale.graduatedPointForValue(v);
            var geo = new go.Geometry(go.GeometryType.Line);
            geo.startX = 100 + scale.margin.left;
            geo.startY = 90 + scale.margin.top;
            geo.endX = pt.x + scale.margin.left;
            geo.endY = pt.y + scale.margin.top;
            return geo;
          })
        ),
        new go.TextBlock({
          alignment: new go.Spot(0.5, 0.5, 0, 20),
          stroke: "white",
          font: "bold 10pt sans-serif",
        })
          .bind("text")
          .bind("stroke", "color"),
        new go.TextBlock({
          alignment: go.Spot.Top,
          margin: new go.Margin(4, 0, 0, 0),
          stroke: "white",
          font: "bold italic 13pt sans-serif",
          isMultiline: false,
          editable: true,
        })
          .bindTwoWay(
            "text",
            "value",
            (v) => v.toString(),
            (s) => parseFloat(s)
          )
          .bind("stroke", "color")
      )
    );
}
