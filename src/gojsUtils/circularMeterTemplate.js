import {
  applyCommonNodeStyleBindings,
  applyCommonScaleBindings,
  commonNodeStyle,
  sliderActions,
} from "./component";

export function createCircularMeter() {
  return new go.Node("Table", commonNodeStyle())
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
          applyCommonScaleBindings(
            new go.Panel("Graduated", {
              name: "SCALE",
              margin: 14,
              graduatedTickUnit: 2.5, // tick marks at each multiple of 2.5
              stretch: go.Stretch.None, // needed to avoid unnecessary re-measuring!!!
            })
          ).add(
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
            alignment: new go.Spot(0.5, 0.9),
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
            geometryString: "F1 M-6 0 L0 -6 100 0 0 6z x M-100 0",
            ...sliderActions(true),
          }).bind("angle", "value", (v, shp) => {
            // this determines the angle of the needle, based on the data.value argument
            var scale = shp.part.findObject("SCALE");
            var p = scale.graduatedPointForValue(v);
            var path = shp.part.findObject("PATH");
            var c = path.actualBounds.center;
            return c.directionPoint(p);
          }),
          new go.Shape("Circle", { width: 2, height: 2, fill: "#444" })
        )
      ),
      new go.TextBlock({
        row: 1,
        font: "bold 11pt sans-serif",
      }).bind("text")
    );
}
