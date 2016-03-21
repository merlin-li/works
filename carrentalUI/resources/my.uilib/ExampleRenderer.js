jQuery.sap.declare("my.uilib.ExampleRenderer");my.uilib.ExampleRenderer={};
my.uilib.ExampleRenderer.render=function(r,c){var a=r;a.write("<SPAN");a.writeControlData(c);if(c.getTooltip_asString()){a.writeAttribute("title",c.getTooltip_AsString());}a.writeAttribute("class","sap-myUilib-Example");a.write(">");a.write(c.getProperty("text"));a.write("</SPAN>");};
