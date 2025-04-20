import React from "react";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";

import "./App.css";
import { createNeedleMeter } from "./gojsUtils/needleMeterTemplate";
import { createVertical } from "./gojsUtils/verticalTemplate";
import { createHorizontal } from "./gojsUtils/horizontalTemplate";
import { createCircularMeter } from "./gojsUtils/circularMeterTemplate";
import { createBarMeter } from "./gojsUtils/barMeterTemplate";

function App() {
  function initDiagram() {
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
    const diagram = new go.Diagram({
      "undoManager.isEnabled": true, // must be set to allow for model change listening
      // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
      "clickCreatingTool.archetypeNodeData": {
        text: "new node",
        color: "lightblue",
      },
      model: new go.GraphLinksModel({
        linkKeyProperty: "key", // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
      }),
    });

    // 定義基本節點模板
    diagram.nodeTemplate = new go.Node("Auto")
      .bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify)
      .add(
        new go.Shape("RoundedRectangle", {
          name: "SHAPE",
          fill: "white",
          strokeWidth: 0,
        }).bind("fill", "color"),
        new go.TextBlock({ margin: 8, editable: true }).bindTwoWay("text")
      );

    //繪製連接線
    diagram.linkTemplate = new go.Link({
      routing: go.Routing.AvoidsNodes,
      corner: 12,
    }).add(
      new go.Shape({ isPanelMain: true, stroke: "gray", strokeWidth: 9 }),
      new go.Shape({ isPanelMain: true, stroke: "lightgray", strokeWidth: 5 }),
      new go.Shape({ isPanelMain: true, stroke: "whitesmoke" })
    );

    // 新增元件
    diagram.nodeTemplateMap.add("NeedleMeter", createNeedleMeter());
    diagram.nodeTemplateMap.add("Vertical", createVertical());
    diagram.nodeTemplateMap.add("Horizontal", createHorizontal());
    diagram.nodeTemplateMap.add("CircularMeter", createCircularMeter());
    diagram.nodeTemplateMap.add("BarMeter", createBarMeter());

    return diagram;
  }

  // 擴展 go.Panel 類以添加 apply 方法，方便連續方法調用
  go.Panel.prototype.apply = function (func) {
    func(this);
    return this;
  };

  return (
    <div>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName="diagram-component"
        nodeDataArray={[
          {
            key: 1,
            value: 45,
            text: "Vertical",
            category: "Vertical",
            loc: "30 0",
            editable: true,
            color: "yellow",
          },
          {
            key: 2,
            value: 23,
            text: "Circular Meter",
            category: "CircularMeter",
            loc: "250 -120",
            editable: true,
            color: "skyblue",
          },
          {
            key: 3,
            value: 56,
            text: "Needle Meter",
            category: "NeedleMeter",
            loc: "250 110",
            editable: true,
            color: "lightsalmon",
          },
          {
            key: 4,
            value: 16,
            max: 120,
            text: "Horizontal",
            category: "Horizontal",
            loc: "550 0",
            editable: true,
            color: "green",
          },
          {
            key: 5,
            value: 23,
            max: 200,
            unit: 5,
            text: "Bar Meter",
            category: "BarMeter",
            loc: "550 200",
            editable: true,
            color: "orange",
          },
        ]}
        linkDataArray={[
          { from: 1, to: 2 },
          { from: 1, to: 3 },
          { from: 2, to: 4 },
          { from: 3, to: 4 },
          { from: 4, to: 5 },
        ]}
        onModelChange={(e) => {
          console.log("Model changed: ", e);
        }}
      />
    </div>
  );
}

export default App;
