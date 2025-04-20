// 輔助函數，用於綁定刻度表屬性
export function applyCommonScaleBindings(object) {
  object
    .bind("graduatedMin", "min")
    .bind("graduatedMax", "max")
    .bind("graduatedTickUnit", "unit")
    .bind("isEnabled", "editable");
  return object;
}

//節點（Node）共用樣式
export function commonNodeStyle() {
  return {
    locationSpot: go.Spot.Center,
    fromSpot: go.Spot.BottomRightSides,
    toSpot: go.Spot.TopLeftSides,
    movable: false, //禁止拖拉
  };
}

// 新增的 sliderActions 函數，用於實現儀表拖曳控制
export function sliderActions(alwaysVisible) {
  return {
    isActionable: true,
    actionDown: (e, obj) => {
      obj._dragging = true;
      obj._original = obj.part.data.value;
    },
    actionMove: (e, obj) => {
      if (!obj._dragging) return;
      var scale = obj.part.findObject("SCALE");
      var pt = e.diagram.lastInput.documentPoint;
      var loc = scale.getLocalPoint(pt);
      var val = Math.round(scale.graduatedValueForPoint(loc));
      // just set the data.value temporarily, not recorded in UndoManager
      e.diagram.model.commit((m) => {
        m.set(obj.part.data, "value", val);
      }, null); // null means skipsUndoManager
    },
    actionUp: (e, obj) => {
      if (!obj._dragging) return;
      obj._dragging = false;
      var scale = obj.part.findObject("SCALE");
      var pt = e.diagram.lastInput.documentPoint;
      var loc = scale.getLocalPoint(pt);
      var val = Math.round(scale.graduatedValueForPoint(loc));
      e.diagram.model.commit((m) => {
        m.set(obj.part.data, "value", obj._original);
      }, null); // null means skipsUndoManager
      // now set the data.value for real
      e.diagram.model.commit((m) => {
        m.set(obj.part.data, "value", val);
      }, "dragged slider");
    },
    actionCancel: (e, obj) => {
      obj._dragging = false;
      e.diagram.model.commit((m) => {
        m.set(obj.part.data, "value", obj._original);
      }, null); // null means skipsUndoManager
    },
  };
}

/// 新增的 commonSlider 函數，用於創建通用的滑竿形狀
export function commonSlider(vert) {
  return new go.Shape("RoundedRectangle", {
    name: "SLIDER",
    fill: "white",
    desiredSize: vert ? new go.Size(20, 6) : new go.Size(6, 20), //控制滑竿垂直或水平
    alignment: vert ? go.Spot.Top : go.Spot.Right,
    ...sliderActions(false),
  });
}

export function applyCommonNodeStyleBindings(object) {
  object.bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify);
  return object;
}
