import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import "./App.css";
import { useRef, useState } from "react";

function Bpp() {
  const diagramRef = useRef(null); //圖表節點數據資料
  const saveData = useRef(null); //儲存圖表資料

  let myAnimation = null;
  let myWavesAnimation = null;
  let myWavesOffsetAnimation = null;

  function initDiagram() {
    const FONT = "bold 13px InterVariable, sans-serif";
    let diagram = null;
    go.Shape.defineFigureGenerator("Wave", (shape, w, h) => {
      const geo = new go.Geometry();
      const fig = new go.PathFigure(0, 0, true);
      const param1 = shape?.parameter1 ?? 0;
      geo.add(fig);
      // w -= 1; // remove slight overlap
      fig.add(new go.PathSegment(go.SegmentType.Line, w, 0));
      fig.add(new go.PathSegment(go.SegmentType.Line, w, (h * 3) / 4));
      fig.add(
        new go.PathSegment(
          go.SegmentType.QuadraticBezier,
          0,
          (h * 3) / 4,
          w / 2,
          h / 4 + h * param1
        )
      );
      fig.add(new go.PathSegment(go.SegmentType.Line, 0, 0));
      return geo;
    });

    //畫布設置
    diagram = new go.Diagram({
      "grid.visible": true, //顯示網格背景，方便對齊和排版
      "grid.gridCellSize": new go.Size(30, 20), //網格單位的寬度
      "draggingTool.isGridSnapEnabled": true, //拖曳時節點會自動吸附到網格
      "resizingTool.isGridSnapEnabled": true, //調整節點大小（resize）時，同樣會吸附到網格
      "rotatingTool.snapAngleMultiple": 90, // 旋轉時會以 90 度為單位跳轉

      "rotatingTool.snapAngleEpsilon": 45, //當旋轉角度接近90度的倍數時，自動幫你吸附到最近的 90 度整數角。
      "undoManager.isEnabled": true,
      ModelChanged: (e) => {
        if (e.isTransactionFinished) updateAnimation();
      },
    });

    diagram.addDiagramListener("Modified", (e) => {
      var button = document.getElementById("SaveButton");
      if (button) button.disabled = !diagram.isModified;
      var idx = document.title.indexOf("*");
      if (diagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.slice(0, idx);
      }
    });

    function makeDistillationColumnPlatePanel(alignment, side) {
      return new go.Panel("Graduated", {
        alignment: new go.Spot(alignment, 0),
        alignmentFocus: new go.Spot(alignment, 0),
      })
        .bind("height", "height", (value) => value * 0.85)
        .add(
          new go.Shape({ geometryString: "M0 0 V400", strokeWidth: 0 }).bind(
            "geometryString",
            "height",
            (value) => `M0 0 V${value}`
          ),
          new go.Shape({
            interval: 1,
            geometryString: "M0 0 V40",
            graduatedSkip: (n) => Boolean(n % 20) ^ side,
            stroke: "black",
            strokeDashArray: [10, 1],
          }).bind("geometryString", "width", (value) => `M0 0 V${value * 0.8}`)
        );
    }

    function makeMetalBrush() {
      let color = "#fff";
      return new go.Brush("Linear", {
        0: go.Brush.darken(color),
        0.2: color,
        0.33: go.Brush.lighten(color),
        0.5: color,
        1: go.Brush.darken(color),
        start: go.Spot.Left,
        end: go.Spot.Right,
      });
    }

    function makeWaveBrush() {
      return new go.Brush("Linear", {
        0: "rgba(163, 183, 202, 1)",
        0.9: "rgba(209, 219, 228, 1)",
        1: "rgba(209, 219, 228, 1)",
        start: go.Spot.Top,
        end: go.Spot.Bottom,
      });
    }

    var WAVE_WIDTH = 50;
    var WAVE_HEIGHT = 10;
    var ORIGINAL_WIDTH = 100 * WAVE_WIDTH;

    diagram.nodeTemplateMap.add(
      "DistillationColumn",
      new go.Node("Spot", {
        selectionObjectName: "CAPSULE",
        resizable: true,
        resizeObjectName: "CAPSULE",
        locationSpot: go.Spot.Center,
      })
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify)
        .add(
          new go.Shape("Capsule", {
            fill: makeMetalBrush(),
            stroke: "black",
            strokeWidth: 1,
          })
            .bind("height", "height", (value) => value + 1)
            .bind("width", "width", (value) => value + 1),
          new go.Panel("Spot", { isClipping: true }).add(
            new go.Shape("Capsule", {
              name: "CAPSULE",
              strokeWidth: 0,
            })
              .bindTwoWay("height")
              .bindTwoWay("width"),
            new go.Panel("Spot")
              .bind("height")
              .bind("width")
              .add(
                new go.Shape({ fill: "white", strokeWidth: 0 }),
                new go.Panel("Vertical", {
                  alignmentFocus: go.Spot.BottomCenter,
                  alignment: go.Spot.BottomCenter,
                  stretch: go.Stretch.Horizontal,
                }).add(
                  new go.Panel("Graduated", {
                    background: "transparent",
                    graduatedMin: 0,
                    graduatedMax: 100,
                    graduatedTickBase: 0,
                    graduatedTickUnit: 1,
                    width: ORIGINAL_WIDTH,
                    margin: 0,
                    stretch: go.Stretch.Horizontal,
                    name: "WAVE_GRADUATED_PANEL",
                  }).add(
                    new go.Shape({
                      name: "line",
                      geometryString: "M0 0 H-" + ORIGINAL_WIDTH,
                      stroke: "gray",
                      strokeWidth: 0,
                    }),
                    new go.Shape("Wave", {
                      interval: 1,
                      parameter1: 0,
                      name: "WAVE1",
                      fill: makeWaveBrush(),
                      strokeWidth: 0,
                      desiredSize: new go.Size(WAVE_WIDTH + 1, WAVE_HEIGHT),
                      graduatedSkip: (n) => n % 2,
                    }),
                    new go.Shape("Wave", {
                      interval: 1,
                      parameter1: 1,
                      name: "WAVE2",
                      graduatedSkip: (n) => !(n % 2),
                      desiredSize: new go.Size(WAVE_WIDTH + 1, WAVE_HEIGHT),
                      fill: makeWaveBrush(),
                      strokeWidth: 0,
                    })
                  ),
                  new go.Shape({
                    fill: new go.Brush("Linear", {
                      0: "rgba(163, 183, 202, 1)",
                      0.25: "rgba(117, 147, 175, 1)",
                      0.5: "rgba(71, 111, 149, 1)",
                      0.75: "rgba(25, 74, 122, 1)",
                      start: go.Spot.Top,
                      end: go.Spot.Bottom,
                    }),
                    margin: new go.Margin(-1, 0, 0, 0),
                    strokeWidth: 0,
                    stretch: go.Stretch.Horizontal,
                  }).bind("height", "", (data) => {
                    let fill_height = data.fillLevel * data.height;
                    return fill_height - WAVE_HEIGHT / 2;
                  })
                )
              ),
            makeDistillationColumnPlatePanel(0, true),
            makeDistillationColumnPlatePanel(1, false)
          ),
          new go.Panel("Auto").add(
            new go.Shape({ fill: "rgba(255, 255, 255, 0.9)", stroke: "black" }),
            new go.TextBlock("test", {
              stroke: "black",
              margin: 3,
              font: FONT,
            }).bind("text")
          )
        )
    );

    diagram.nodeTemplateMap.add(
      "Tank",
      new go.Node("Spot", {
        selectionObjectName: "CAPSULE",
        resizable: true,
        resizeObjectName: "CAPSULE",
        locationSpot: go.Spot.Center,
      })
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify)
        .add(
          new go.Shape("Capsule", {
            fill: makeMetalBrush(),
            stroke: "black",
            strokeWidth: 1,
          })
            .bind("height", "height", (value) => value + 1)
            .bind("width", "width", (value) => value + 1),
          new go.Panel("Spot", { isClipping: true }).add(
            new go.Shape("Capsule", {
              name: "CAPSULE",
              strokeWidth: 0,
            })
              .bindTwoWay("height")
              .bindTwoWay("width"),
            new go.Panel("Spot")
              .bind("height")
              .bind("width")
              .add(
                new go.Shape({ fill: "white", strokeWidth: 0 }),
                new go.Panel("Vertical", {
                  alignmentFocus: go.Spot.BottomCenter,
                  alignment: go.Spot.BottomCenter,
                  stretch: go.Stretch.Horizontal,
                }).add(
                  new go.Panel("Graduated", {
                    background: "transparent",
                    graduatedMin: 0,
                    graduatedMax: 100,
                    graduatedTickBase: 0,
                    graduatedTickUnit: 1,
                    width: ORIGINAL_WIDTH,
                    margin: 0,
                    stretch: go.Stretch.Horizontal,
                    name: "WAVE_GRADUATED_PANEL",
                  }).add(
                    new go.Shape({
                      name: "line",
                      geometryString: "M0 0 H-" + ORIGINAL_WIDTH,
                      stroke: "gray",
                      strokeWidth: 0,
                    }),
                    new go.Shape("Wave", {
                      interval: 1,
                      parameter1: 0,
                      name: "WAVE1",
                      fill: makeWaveBrush(),
                      strokeWidth: 0,
                      desiredSize: new go.Size(WAVE_WIDTH + 1, WAVE_HEIGHT),
                      graduatedSkip: (n) => n % 2,
                    }),
                    new go.Shape("Wave", {
                      interval: 1,
                      parameter1: 1,
                      name: "WAVE2",
                      graduatedSkip: (n) => !(n % 2),
                      desiredSize: new go.Size(WAVE_WIDTH + 1, WAVE_HEIGHT),
                      fill: makeWaveBrush(),
                      strokeWidth: 0,
                    })
                  ),
                  new go.Shape({
                    fill: new go.Brush("Linear", {
                      0: "rgba(163, 183, 202, 1)",
                      0.25: "rgba(117, 147, 175, 1)",
                      0.5: "rgba(71, 111, 149, 1)",
                      0.75: "rgba(25, 74, 122, 1)",
                      start: go.Spot.Top,
                      end: go.Spot.Bottom,
                    }),
                    margin: new go.Margin(-1, 0, 0, 0),
                    strokeWidth: 0,
                    stretch: go.Stretch.Horizontal,
                  }).bind("height", "", (data) => {
                    let fill_height = data.fillLevel * data.height;
                    return fill_height - WAVE_HEIGHT / 2;
                  })
                )
              )
          ),
          new go.Panel("Auto").add(
            new go.Shape({ fill: "rgba(255, 255, 255, 0.9)", stroke: "black" }),
            new go.TextBlock("test", {
              stroke: "black",
              margin: 3,
              font: FONT,
            }).bind("text")
          )
        )
    );

    diagram.nodeTemplateMap.add(
      "Pump",
      new go.Node("Vertical")
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify)
        .add(
          new go.Panel("Vertical", { portId: "" }).add(
            new go.Shape("Circle", {
              desiredSize: new go.Size(25, 25),
              fill: makeMetalBrush(),
              strokeWidth: 1,
              margin: new go.Margin(0, 0, -2, 0),
            }),
            new go.Shape({
              desiredSize: new go.Size(30, 8),
              fill: makeMetalBrush(),
              strokeWidth: 1,
            })
          ),
          new go.TextBlock({
            alignment: go.Spot.Center,
            textAlign: "center",
            margin: 5,
            editable: true,
            font: FONT,
          }).bindTwoWay("text")
        )
    );

    diagram.nodeTemplateMap.add(
      "Condenser",
      new go.Node("Vertical")
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify)
        .add(
          new go.Panel("Spot").add(
            new go.Shape("Circle", {
              desiredSize: new go.Size(32, 32),
              fill: makeMetalBrush(),
              strokeWidth: 1,
              portId: "",
              fromSpot: go.Spot.Right,
              toSpot: go.Spot.Left,
            }),
            new go.Shape({
              geometryString: "F M0 36 L0 40 4 40 0 40 20 16 20 24 40 0",
              desiredSize: new go.Size(35, 35),
              strokeWidth: 1,
              fill: makeMetalBrush(),
            })
          ),
          new go.TextBlock({
            alignment: go.Spot.Center,
            textAlign: "center",
            margin: 5,
            editable: true,
            font: FONT,
          }).bindTwoWay("text")
        )
    );

    diagram.nodeTemplateMap.add(
      "Valve",
      new go.Node("Vertical", {
        locationSpot: new go.Spot(0.5, 0.3333),
        locationObjectName: "SHAPE",
        selectionObjectName: "SHAPE",
        rotatable: true,
      })
        .bindTwoWay("angle")
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify)
        .add(
          new go.TextBlock({
            alignment: go.Spot.Center,
            textAlign: "center",
            margin: 5,
            editable: true,
            font: FONT,
          })
            .bindTwoWay("text")
            // keep the text upright, even when the whole node has been rotated upside down
            .bindObject("angle", "angle", (a) => (a === 180 ? 180 : 0)),
          new go.Shape({
            name: "SHAPE",
            geometryString:
              "F1 M0 0 L40 20 40 0 0 20z M20 10 L20 30 M12 30 L28 30",
            strokeWidth: 1,
            fill: makeMetalBrush(),
            portId: "",
            fromSpot: new go.Spot(1, 0.3333),
            toSpot: new go.Spot(0, 0.3333),
          })
        )
    );

    diagram.nodeTemplateMap.add(
      "Boiler",
      new go.Node("Vertical")
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify)
        .add(
          new go.Panel("Spot").add(
            new go.Shape("Circle", {
              desiredSize: new go.Size(32, 32),
              portId: "",
              fill: makeMetalBrush(),
              strokeWidth: 1,
            }),
            new go.Shape("Circle", {
              desiredSize: new go.Size(16, 16),
              strokeWidth: 1,
              alignment: go.Spot.BottomCenter,
              alignmentFocus: go.Spot.BottomCenter,
              fill: makeMetalBrush(),
            })
          ),
          new go.TextBlock({
            alignment: go.Spot.Center,
            textAlign: "center",
            margin: 5,
            editable: true,
            font: FONT,
          }).bindTwoWay("text")
        )
    );

    diagram.nodeTemplateMap.add(
      "Label",
      new go.Node("Auto")
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify)
        .add(
          new go.Shape({ fill: "white", stroke: "black" }),
          new go.TextBlock("test", {
            stroke: "black",
            margin: 3,
            font: FONT,
          }).bind("text")
        )
    );

    diagram.linkTemplate = new go.Link({
      routing: go.Routing.AvoidsNodes,
      curve: go.Curve.JumpGap,
      corner: 10,
      reshapable: true,
      toShortLength: 7,
    })
      .bindTwoWay("points")
      .add(
        // mark each Shape to get the link geometry with isPanelMain: true
        new go.Shape({ isPanelMain: true, stroke: "black", strokeWidth: 5 }),
        new go.Shape({
          isPanelMain: true,
          stroke: "#aaa",
          strokeWidth: 3,
        }).bind("stroke"),
        new go.Shape({
          isPanelMain: true,
          stroke: "white",
          strokeWidth: 3,
          name: "PIPE",
          strokeDashArray: [10, 10],
        }),
        new go.Shape({ toArrow: "Triangle", fill: "white", stroke: "black" }),
        new go.Panel("Auto", { visible: false })
          .bind("visible", "text", (value) => value && value != "")
          .add(
            new go.Shape({
              fill: "rgba(255, 255, 255, 0.9)",
              stroke: "black",
              strokeDashArray: [5, 5],
            }),
            new go.TextBlock({ stroke: "black", margin: 3, font: FONT }).bind(
              "text"
            )
          )
      );
    diagramRef.current = diagram;

    //取得初始化數據綁定saveData
    diagram.addDiagramListener("InitialLayoutCompleted", () => {
      saveData.current = diagram.model.toJson();
      console.log("📦 初次建立 Diagram JSON:", diagram.model.toJson());
    });

    return diagram;
  }

  function updateAnimation() {
    //for the flow in the pipes
    if (myAnimation) myAnimation.stop();
    // Animate the flow in the pipes
    myAnimation = new go.Animation();
    myAnimation.easing = go.Animation.EaseLinear;
    diagramRef.current.links.each((link) =>
      myAnimation.add(link.findObject("PIPE"), "strokeDashOffset", 20, 0)
    );
    // Run indefinitely
    myAnimation.runCount = Infinity;
    myAnimation.start();
    //for the waves movement
    if (myWavesAnimation) myWavesAnimation.stop();
    myWavesAnimation = new go.Animation();
    myWavesAnimation.easing = go.Animation.EaseInOutQuad;
    myWavesAnimation.reversible = true;
    myWavesAnimation.duration = 2000;
    diagramRef.current.nodes.each((node) => {
      let wave1 = node.findObject("WAVE1");
      let wave2 = node.findObject("WAVE2");
      if (wave1) myWavesAnimation.add(wave1, "waves", 0, 1);
      if (wave2) myWavesAnimation.add(wave2, "waves", 1, 0);
    });
    myWavesAnimation.runCount = Infinity;
    myWavesAnimation.start();
    //waves offset movement
    if (myWavesOffsetAnimation) myWavesOffsetAnimation.stop();
    myWavesOffsetAnimation = new go.Animation();
    myWavesOffsetAnimation.easing = go.Animation.EaseInOutQuad;
    myWavesOffsetAnimation.reversible = true;
    myWavesOffsetAnimation.duration = 5000;
    diagramRef.current.nodes.each((node) => {
      let waveGraduatedPanel = node.findObject("WAVE_GRADUATED_PANEL");
      if (waveGraduatedPanel)
        myWavesOffsetAnimation.add(waveGraduatedPanel, "offset", -30, 0);
    });
    myWavesOffsetAnimation.runCount = Infinity;
    myWavesOffsetAnimation.start();
  }

  function save() {
    saveData.current = diagramRef.current.model.toJson();
    diagramRef.current.isModified = true;
  }

  function load() {
    diagramRef.current.model = go.Model.fromJson(saveData.current);
  }

  go.AnimationManager.defineAnimationEffect(
    "waves",
    (obj, startValue, endValue, easing, currentTime, duration, animation) => {
      let value = easing(
        currentTime,
        startValue,
        endValue - startValue,
        duration
      );
      obj.parameter1 = value;
    }
  );

  go.AnimationManager.defineAnimationEffect(
    "offset",
    (obj, startValue, endValue, easing, currentTime, duration, animation) => {
      let value = easing(
        currentTime,
        startValue,
        endValue - startValue,
        duration
      );
      obj.alignment = new go.Spot(0, 0, value, 0);
    }
  );

  return (
    <div>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName="diagram-component"
        nodeDataArray={[
          {
            key: "Tank1",
            category: "Tank",
            pos: "-300 100",
            text: "Feed Tank",
            height: 100,
            width: 200,
            fillLevel: "0.8",
          },
          {
            key: "Valve1",
            category: "Valve",
            pos: "150 200",
            text: "Valve",
            angle: 0,
            isOn: true,
          },
          {
            key: "Tank2",
            category: "DistillationColumn",
            pos: "150 280",
            text: "Distillation Column",
            height: 275,
            width: 75,
            fillLevel: "0.15",
          },
          {
            key: "Condenser1",
            category: "Condenser",
            pos: "390 0",
            text: "Condenser",
            isOn: true,
          },
          {
            key: "Tank3",
            category: "Tank",
            pos: "600 20",
            text: "Reflux Drum",
            height: 75,
            width: 150,
            fillLevel: "0.1",
          },
          {
            key: "Pump1",
            category: "Pump",
            pos: "550 100",
            text: "Pump",
            isOn: true,
          },
          {
            key: "Boiler1",
            category: "Boiler",
            pos: "390 360",
            text: "Reboiler",
            isOn: true,
          },
          {
            key: "Valve2",
            category: "Valve",
            pos: "480 260",
            text: "Valve",
            angle: 270,
            isOn: true,
          },
          {
            key: "Tank4",
            category: "Tank",
            pos: "750 180",
            text: "Holding Tank",
            height: 75,
            width: 120,
            fillLevel: "0.8",
          },
          {
            key: "Tank5",
            category: "Tank",
            pos: "750 380",
            text: "Holding Tank",
            height: 75,
            width: 120,
            fillLevel: "0.8",
          },
        ]}
        linkDataArray={[
          {
            from: "Tank1",
            to: "Valve1",
            stroke: "rgba(117, 147, 175, 0.5)",
            points: [
              -199.0, 100.0, -189.0, 100.0, -188.0, 100.0, -188.0, 200.0, 119.5,
              200.0, 129.5, 200.0,
            ],
          },
          {
            from: "Valve1",
            to: "Tank2",
            stroke: "rgba(117, 147, 175, 0.5)",
            points: [
              170.5, 200.0, 180.5, 200.0, 220.7, 200.0, 220.7, 131.5, 150.0,
              131.5, 150.0, 141.5,
            ],
          },
          {
            from: "Tank2",
            to: "Condenser1",
            points: [
              212.7, 280.0, 222.7, 280.0, 222.7, 280.0, 222.7, 18.0, 402.5,
              18.0, 412.5, 18.0,
            ],
          },
          {
            from: "Condenser1",
            to: "Tank3",
            stroke: "rgba(117, 147, 175, 0.5)",
            points: [
              446.5, 18.0, 456.5, 18.0, 458.0, 18.0, 458.0, 18.0, 514.0, 18.0,
              524.0, 20.0,
            ],
          },
          {
            from: "Tank3",
            to: "Pump1",
            stroke: "rgba(117, 147, 175, 0.5)",
            points: [
              600.0, 58.5, 600.0, 68.5, 600.0, 79.3, 570.6, 79.3, 570.6, 90.0,
              570.6, 100.0,
            ],
          },
          {
            from: "Pump1",
            to: "Tank2",
            stroke: "rgba(117, 147, 175, 0.5)",
            points: [
              560.5, 116.5, 550.5, 116.5, 548.0, 116.5, 548.0, 116.5, 436.0,
              116.5, 436.0, 280.0, 222.7, 280.0, 212.7, 280.0,
            ],
          },
          {
            from: "Pump1",
            to: "Tank4",
            stroke: "rgba(117, 147, 175, 0.5)",
            text: "Overhead product",
            points: [
              586.0, 116.5, 596.0, 116.5, 596.0, 116.5, 596.0, 180.0, 679.0,
              180.0, 689.0, 180.0,
            ],
          },
          {
            from: "Tank2",
            to: "Boiler1",
            stroke: "rgba(117, 147, 175, 0.5)",
            points: [
              212.7, 280.0, 222.7, 280.0, 222.7, 280.0, 222.7, 376.5, 394.5,
              376.5, 404.5, 376.5,
            ],
          },
          {
            from: "Boiler1",
            to: "Valve2",
            points: [
              422.0, 360.0, 422.0, 350.0, 422.0, 320.3, 480.0, 320.3, 480.0,
              290.5, 480.0, 280.5,
            ],
          },
          {
            from: "Valve2",
            to: "Tank2",
            points: [
              480.0, 239.5, 480.0, 229.5, 330.2, 229.5, 330.2, 280.0, 222.7,
              280.0, 212.7, 280.0,
            ],
          },
          {
            from: "Boiler1",
            to: "Tank5",
            stroke: "rgba(117, 147, 175, 0.5)",
            text: "Bottom product\n(condensate from reboiler)",
            points: [
              438.5, 376.5, 448.5, 376.5, 455.0, 376.5, 455.0, 376.5, 679.0,
              376.5, 689.0, 380.0,
            ],
          },
        ]}
        onModelChange={(e) => {}}
      />
      <button
        type="button"
        onClick={() => {
          save();
        }}
      >
        儲存
      </button>
      <button
        type="button"
        onClick={() => {
          load();
        }}
      >
        重新加載
      </button>
    </div>
  );
}

export default Bpp;
