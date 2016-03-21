// Provides control my.uilib.Example
jQuery.sap.declare("my.uilib.Example");

/*
 * the require statement allows to import other JavaScript modules, either containing controls or 
 * framework classes / code.
 * Notation:
 * <code> jQuery.sap.require("fully.qualified.name");</code> 
 */
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Example control.
 * 
 * @class
 * An example control that can be used as starting point for custom development. 
 *
 * @public
 */
my.uilib.Example = function (sId, oProperties, oSomething) {
	sap.ui.core.Control.apply(this, arguments);
};
my.uilib.Example.prototype = jQuery.sap.newObject(sap.ui.core.Control.prototype);

/*
 * GSS: Provide information about the control API.
 * 
 * Describe the my.uilib.Example. 
 * Resulting metadata can be obtained via my.uilib.Example.getMetadata();
 */ 
sap.ui.core.Element.defineClass("my.uilib.Example", {

  // ---- object ----
  baseType : "sap.ui.core.Control",
  publicMethods : [
    // properties 
    "getText", "setText", 
    // aggregations
    
    // associations
    
    // events
    "attachClick", "detachClick"
    // methods
    
  ],

  // ---- control specific ----
  library : "my.uilib",
  properties : {
    text : {name : "text", type : "string", group : "Misc", defaultValue : null}
  },
  aggregations : {},
  associations : {},
  events : {
    click : "click"
  }

});	

/**
 * Getter for property Text
 * Text of the Example control
 *
 * @return the value of property Text
 * @type string
 * @public
 */
my.uilib.Example.prototype.getText = function() {
    return this.getProperty("text");
};

/**
 * Setter for property Text<br/>
 * 
 * Default value is: <code>''</code><br/><br/> 
 * @param sText {string}
 * @public
 */
my.uilib.Example.prototype.setText = function(sText) {
    this.setProperty("text", sText);
};

/**
 * Detach event-handler <code>fFunction</code> from this instance of <code>Example</code>.<br/>
 * 
 * Event fires when the user clicks the Example control.
 *  
 * 
 * @param fFunction
 * @public
 */
my.uilib.Example.prototype.attachClick = function(fFunction) {
	this.attachEvent("click", fFunction);
};

/**
 * Detach event-handler <code>fFunction</code> from this instance of <code>Example</code><br/>
 * @param fFunction
 * @public
 */
my.uilib.Example.prototype.detachClick = function(fFunction) {
	this.detachEvent("click", fFunction);
};

/**
 * Fire event Click to attached listeners.<br/>
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'Id' of type <code>string</code></li>
 * </ul>
 *
 * @param {Map} 
 *         mArguments the arguments to pass along with the event.
 * @private
 */
my.uilib.Example.prototype.fireClick = function(mArguments) {
	this.fireEvent("click", mArguments);
};

// *****************************************************************************
// GSS: End of parts that will be generated in full environment
// *****************************************************************************
 
// *****************************************************************************
// GSS: Start of custom control implementation
// *****************************************************************************


// /**
//  * Initialization... if needed
//  */
// my.uilib.Example.prototype.init = function(){
//   //do something for initialization...
// };

/*
 * GSS: In this control implementation, nothing explicit to connect to Browser 
 * events is done.
 * The SAPUI5 framework ensures that browser events triggered on a DOM element 
 * will be handled and forwarded to the instance of the control.
 */
/**
  * Fire Click Event
  * 
  * @param oBrowserEvent
  *            the originating event for further information provisioning.
  */
my.uilib.Example.prototype.onclick = function(oBrowserEvent) {
    this.fireClick({id: this.getId()});
};

// *****************************************************************************
// GSS: End of custom control implementation
// *****************************************************************************
