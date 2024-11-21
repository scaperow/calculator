<template>
  <div>
    <button @click="changeColor">Change color</button>
    <button @click="showMesh">show mesh</button>
    <div style="background:#fff;font-family: 'Lato', sans-serif;">
      <div style="width:100vw;height:100vh" id="abc"></div>
    </div>
  </div>
</template>
<script>
import go from "gojs";
import "../map/extentions/Shape";
const $ = go.GraphObject.make;

export default {
  methods: {
    changeColor() {
      this.diagram.model.commit($ => {
        $.set($.modelData, "shape", {
          fill: "red"
        });
      });

      //console.log(diagram.model.modelData);
    },
    showMesh() {
      this.diagram.model.commit($ => {
        $.set($.modelData, "mesh", {
          visible: true
        });
      });
    }
  },
  mounted() {
    var strokeBinding = new go.Binding("stroke", "fill");
    this.diagram = $(go.Diagram, "abc");

    this.diagram.undoManager.isEnabled = true;

    // diagram.add(
    //   $(go.Part, go.Panel.Viewbox,  // or "Viewbox"
    //     {
    //       position: new go.Point(0, 0), background: "lightgray",
    //       width: 80, height: 80, resizable: true,
    //     },
    //     $(go.Panel, "Auto",
    //       $(go.Shape, "Ellipse", { fill: "lightgreen" }),
    //       $(go.Panel, "Vertical",
    //         $(go.Picture, { source: "images/120x160.png" }),
    //         $(go.TextBlock, "a 120x160 kitten")
    //       )
    //     )
    //   ));

    // diagram.add(
    //   $(go.Part, go.Panel.Viewbox, {
    //     resizable: true, position: new go.Point(200, 0), background: "lightgray",
    //     width: 80, height: 80      },
    //     $(go.Panel, 'Auto',
    //       $(go.Shape, "Ellipse", { fill: "lightgreen" }),
    //       $(go.Panel, "Vertical",
    //         $(go.Picture, { source: "images/120x160.png" }),
    //         $(go.TextBlock, "a 120x160 kitten")
    //       ))
    //   ));

    // diagram.add(
    //   $(go.Part, "Auto",
    //     { position: new go.Point(0, 0), background: "lightgray" },
    //     $(go.Shape, "Rectangle", { fill: "lightgreen" }),
    //     $(go.Shape, "LineH", { fill: "lightgreen" }),
    //     $(go.TextBlock, "some text", { margin: 0, background: "yellow" })
    //   ));

    // diagram.add(
    //   $(go.Part, 'Auto',
    //     $(go.Shape, "RoundedRectangle",
    //       {
    //         fill: 'yellow',
    //       },
    //     ),
    //     $(go.Shape, "LineH",
    //       {            position: new go.Point(0, 0),
    //         // name: 'LINE',
    //         stroke: 'black',
    //         fill: 'red',
    //         // strokeWidth: 2,
    //         // portId: "",
    //         // fromSpot: go.Spot.LeftRightSides,
    //         // toSpot: go.Spot.LeftRightSides
    //       })),
    //   $(go.TextBlock, "some text", { margin: 0, background: "yellow" })
    // )

    // diagram.add(
    //   $(go.Part, "Auto",
    //     { minSize: new go.Size(100, 200) },  // set the size of the whole panel
    //     { position: new go.Point(0, 0), background: "lightgray" },
    //     $(go.Shape, "Rectangle", { fill: "lightgreen" }),
    //     $(go.Shape, "Rectangle", { fill: "red" }),
    //     $(go.TextBlock, "Some Wrapping Text", { editable: true, background: "yellow" })
    //   ));

    this.diagram.nodeTemplateMap = new go.Map();
    this.diagram.nodeTemplateMap.add(
      "grid",
      $(
        go.Panel,
        "Grid",
        {
          name: "GRID",
          visible: false,
          gridCellSize: new go.Size(10, 10),
          gridOrigin: new go.Point(0, 0)
        },
        new go.Binding("visible", "mesh", mesh => mesh.visible).ofModel(),
        $(go.Shape, "LineH", { strokeWidth: 0.5, interval: 1 }, strokeBinding),
        $(go.Shape, "LineH", { strokeWidth: 0.5, interval: 10 }, strokeBinding),
        $(go.Shape, "LineV", { strokeWidth: 0.5, interval: 1 }, strokeBinding),
        $(go.Shape, "LineV", { strokeWidth: 0.5, interval: 10 }, strokeBinding)
      )
    );

    this.diagram.grid = this.diagram.nodeTemplateMap.get("grid");

    this.diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      $(
        go.Shape,
        "RoundedRectangle",
        { fill: "white" }, // the default value if there is no modelData.color property
        new go.Binding("fill", "shape", button => button.fill).ofModel()
      ), // meaning a property of Model.modelData
      $(go.TextBlock, { margin: 5 }, new go.Binding("text"))
    );

    this.diagram.model.commit(m => {
      m.addNodeData({
        text: "sdfdsf"
      });
    });
    //this.diagram = diagram;
    // diagram.add(
    //   $(go.Node,
    //     $(go.TextBlock,
    //       {
    //         text: "this one allows embedded newlines",
    //         background: "lightblue",
    //         editable: true            })
    //   ));
  }
};
</script>

