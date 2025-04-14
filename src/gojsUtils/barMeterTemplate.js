import {
  applyCommonNodeStyleBindings,
  applyCommonScaleBindings,
  commonNodeStyle,
  sliderActions,
} from "./component";

export function createBarMeter() {
  return new go.Node("Table", {
    ...commonNodeStyle(),
    scale: 0.8,
  })
    .apply(applyCommonNodeStyleBindings)
    .add(
      new go.Panel("Auto", { row: 0 }).add(
        new go.Shape("Circle", {
          stroke: "orange",
          strokeWidth: 5,
          spot1: go.Spot.TopLeft,
          spot2: go.Spot.BottomRight,
        }).bind("stroke", "color"),
        new go.Panel("Spot").add(
          new go.Panel("Graduated", {
            name: "SCALE",
            margin: 14,
            graduatedTickUnit: 2.5, // tick marks at each multiple of 2.5
            stretch: go.Stretch.None, // needed to avoid unnecessary re-measuring!!!
          })
            .apply(applyCommonScaleBindings)
            .add(
              // the main path of the graduated panel, an arc starting at 135 degrees and sweeping for 270 degrees
              new go.Shape({
                name: "PATH",
                geometryString: "M-70.7107 70.7107 B135 270 0 0 100 100 M0 100",
                stroke: "white",
                strokeWidth: 4,
              }),
              // three differently sized tick marks
              new go.Shape({
                geometryString: "M0 0 V10",
                stroke: "white",
                strokeWidth: 1,
              }),
              new go.Shape({
                geometryString: "M0 0 V12",
                stroke: "white",
                strokeWidth: 2,
                interval: 2,
              }),
              new go.Shape({
                geometryString: "M0 0 V15",
                stroke: "white",
                strokeWidth: 3,
                interval: 4,
              }),
              new go.TextBlock({
                // each tick label
                interval: 4,
                alignmentFocus: go.Spot.Center,
                font: "bold italic 14pt sans-serif",
                stroke: "white",
                segmentOffset: new go.Point(0, 30),
              })
            ),
          new go.TextBlock({
            alignment: go.Spot.Center,
            stroke: "white",
            font: "bold italic 14pt sans-serif",
            editable: true,
          })
            .bindTwoWay(
              "text",
              "value",
              (v) => v.toString(),
              (s) => parseFloat(s)
            )
            .bind("stroke", "color"),
          new go.Shape({
            fill: "red",
            strokeWidth: 0,
            ...sliderActions(true),
          }).bind("geometry", "value", (v, shp) => {
            var scale = shp.part.findObject("SCALE");
            var p0 = scale.graduatedPointForValue(scale.graduatedMin);
            var pv = scale.graduatedPointForValue(v);
            var path = shp.part.findObject("PATH");
            var radius = path.actualBounds.width / 2;
            var c = path.actualBounds.center;
            var a0 = c.directionPoint(p0);
            var av = c.directionPoint(pv);
            var sweep = av - a0;
            if (sweep < 0) sweep += 360;
            var layerThickness = 8;
            return new go.Geometry()
              .add(new go.PathFigure(-radius, -radius)) // always make sure the Geometry includes the top left corner
              .add(new go.PathFigure(radius, radius)) // and the bottom right corner of the whole circular area
              .add(
                new go.PathFigure(p0.x - radius, p0.y - radius)
                  .add(
                    new go.PathSegment(
                      go.SegmentType.Arc,
                      a0,
                      sweep,
                      0,
                      0,
                      radius,
                      radius
                    )
                  )
                  .add(
                    new go.PathSegment(
                      go.SegmentType.Line,
                      pv.x - radius,
                      pv.y - radius
                    )
                  )
                  .add(
                    new go.PathSegment(
                      go.SegmentType.Arc,
                      av,
                      -sweep,
                      0,
                      0,
                      radius - layerThickness,
                      radius - layerThickness
                    ).close()
                  )
              );
          }),
          new go.Shape("Circle", { width: 2, height: 2, fill: "#444" })
        )
      ),
      new go.TextBlock({ row: 1, font: "bold 11pt sans-serif" }).bind("text")
    );
}
