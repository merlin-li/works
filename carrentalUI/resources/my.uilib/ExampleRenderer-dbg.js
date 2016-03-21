// Provides default renderer for control my.uilib.Example
jQuery.sap.declare("my.uilib.ExampleRenderer");

/**
 * @class Example renderer
 * 
 * @author SAP - Author
 * @version 0.0.1-SNAPSHOT
 * @static
 */
my.uilib.ExampleRenderer = {
};

/*
 * GSS: In this renderer implementation, nothing explicit to connect events is done.
 * The SAPUI5 framework ensures that browser events triggered on a DOM element will be
 * handled and forwarded to the instance of the control.
 */
/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
my.uilib.ExampleRenderer.render = function(oRenderManager, oControl) { 

    // convenience variable
    var rm = oRenderManager;    
    
    // write the HTML into the render manager 

    // open the outer HTML tag
    rm.write("<SPAN");
    // GSS: let control data be written so that connection to SAPUI5 eventing gets established
    rm.writeControlData(oControl);
    
    // write some special attributes to the HTML tag, e.g. tooltip
    if ( oControl.getTooltip_asString() ) {
    	rm.writeAttribute("title", oControl.getTooltip_AsString());
    }
    // or apply some CSS-class
    rm.writeAttribute("class", "sap-myUilib-Example");    
    
    // don't forget to close the HTML tag
    rm.write(">"); // SPAN element
    
    // if needed, write the content of this tag
    rm.write(oControl.getProperty("text"));    
    
    // if needed, write the closing tag
    rm.write("</SPAN>");
};