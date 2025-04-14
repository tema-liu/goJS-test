import {
  applyCommonScaleBindings,
  commonNodeStyle,
  commonSlider,
} from "./component";

export function createVertical() {
  return new go.Node("Auto", commonNodeStyle())
    .apply(applyCommonScaleBindings)
    .add(
      new go.Shape({ fill: "lightgray", stroke: "gray" }),
      new go.Panel("Table", {
        margin: 1,
        stretch: go.Stretch.Fill,
      })
        // header information
        .add(
          new go.TextBlock({
            row: 0,
            font: "bold 10pt sans-serif",
          }).bind("text"),
          new go.Panel("Spot", { row: 1 }).add(
            applyCommonScaleBindings(
              new go.Panel("Graduated", {
                name: "SCALE",
                margin: new go.Margin(6, 0),
                graduatedTickUnit: 10,
                isEnabled: false,
              })
            ).add(
              // NOTE: path goes upward!
              new go.Shape({
                geometryString: "M0 0 V-200",
                width: 0,
                name: "PATH",
              }),
              new go.Shape({
                geometryString: "M0 0 V16",
                alignmentFocus: go.Spot.Center,
                stroke: "gray",
              }),
              new go.Shape({
                geometryString: "M0 0 V20",
                alignmentFocus: go.Spot.Center,
                interval: 5,
                strokeWidth: 1.5,
              })
            ),
            new go.Panel("Spot", {
              alignment: go.Spot.Bottom,
              alignmentFocus: go.Spot.Bottom,
              alignmentFocusName: "BAR",
            })
              // the indicator (a bar)
              .add(
                new go.Shape({
                  name: "BAR",
                  fill: "red",
                  strokeWidth: 0,
                  height: 8,
                })
                  .bind("fill", "color")
                  .bind("desiredSize", "value", (v, shp) => {
                    var scale = shp.part.findObject("SCALE");
                    var path = scale.findMainElement();
                    var len =
                      ((v - scale.graduatedMin) /
                        (scale.graduatedMax - scale.graduatedMin)) *
                      path.geometry.bounds.height;
                    return new go.Size(10, len);
                  }),
                commonSlider(true)
              )
          ),
          // state information
          new go.TextBlock("0", { row: 2, alignment: go.Spot.Left }).bind(
            "text",
            "min"
          ),
          new go.TextBlock("100", { row: 2, alignment: go.Spot.Right }).bind(
            "text",
            "max"
          ),
          new go.TextBlock({
            row: 2,
            background: "white",
            font: "bold 10pt sans-serif",
            isMultiline: false,
            editable: true,
          }).bindTwoWay(
            "text",
            "value",
            (v) => v.toString(),
            (s) => parseFloat(s)
          )
        )
    );
}
