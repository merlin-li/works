//core.js
var liner = {}; 
liner.debug = true;
liner.offline = false;

liner.languageList = [];
//liner.resources = jQuery.sap.resources({url: "language/language.properties", locale: liner.language});

//set language 
liner.language = "en";


//constants
liner.constants = {};

//data
liner.data = {};
liner.data.solutions = [];
liner.data.inputids = [];
liner.data.itineraries = {};
liner.data.demands = {};
liner.data.routes = {};
liner.data.portsLocaleName = {};

//utils
liner.util = {};

//liner.ui space
liner.ui = {};
liner.ui.maps = [];
liner.ui.tabs = [];

//constants
liner.constants.URL_BASE_PROBLEMS = liner.offline ? "json/getBaseProblems.json" : "op/baseProblemData";
liner.constants.URL_COST_MODEL = liner.offline ? "json/staticdata.json" : "op/staticData";
liner.constants.URL_SOLUTION = liner.offline ? "json/initial" : "op/solutionData";
liner.constants.URL_WHAT_IF = liner.offline ? "VS/computeWhatIf": "op/compCase";
liner.constants.URL_DEMAND_DETAIL = liner.offline ? "json/demand.json": "op/demandDetail";
liner.constants.URL_ITINERARY_DETAIL = liner.offline ? "json/itinerary.json": "op/routeDetail";
liner.constants.URL_IMPROVE = liner.offline ? "json/improve.json": "op/optimize";
liner.constants.URL_ROUTE_PATH = "path/";

/**
* use port key to get port locale name
*
*/

liner.ui.getLocaleName = function(key, source) {
  var result = key;
  if(source[key]) {
    result = source[key].name;
  }
  return result;
}

/**
* update copy ports info, use key to get locale name
*
*/
liner.ui.updatePorts = function(ports, source) {
  for(var i in ports) {
    ports[i].name = liner.ui.getLocaleName(ports[i].name, source);
  }  
}

/**
* update copy demands info, use key to get locale name
*
*/
liner.ui.updateDemands = function(demands, source) {
  for(var i in demands) {
    demands[i].origin = liner.ui.getLocaleName(demands[i].origin, source);
    demands[i].destination = liner.ui.getLocaleName(demands[i].destination, source);
  }  
}

/**
* Set and get website language from url and cookie
*
*/
liner.ui.getLanguage = function() {
  liner.language = "en";
  var urlParam = location.search.split("?")[1];
  console.log(urlParam);
  var urlParams = [];
  var pair;
  var flag = true;
  if (urlParam) {
    urlParams = urlParam.split("&");
    for(var i in urlParams) {
      pair = urlParams[i].split("=");
      if("lang" == pair[0]) {
        liner.ui.setLanguage(pair[1]);
        flag = false;
        break;
      }
    }
  }
  //get language from cookie
  if(flag) {
    liner.ui.setLanguageFromCookie();
  }
  liner.resources = jQuery.sap.resources({url: "language/language.properties", locale: liner.language});
};


/**
* Set language from cookie
*
*/
liner.ui.setLanguageFromCookie = function() {
  var cookieName = "locale";
  var start = document.cookie.indexOf(cookieName+"=");console.log(start);
  if (start != -1) {
    start = start+cookieName.length+1;
    var end = document.cookie.indexOf(";",start);
    if (end == -1) {
      end = document.cookie.length;
    }
    liner.language = document.cookie.substring(start,end);
  }
}

/**
* Set language from url, and update cookie
* @param options  Settions for the input section.
*/
liner.ui.setLanguage = function(language) { 
  for (var i in languageList) {
    if(language == languageList[i]) {
      liner.language = languageList[i];
      //document.cookie = "locate="+encodeURI("languageList[i]")+";"+;
       document.cookie = "locale="+ languageList[i] + ";";
    }
  }
  
}

//set language 
liner.ui.getLanguage();

/**
 * Create a section for left accordion.
 * @param options  Settions for the input section.
 * @param options.title  The title of the section.
 * @param options.tooltip  The tooltip of the section.
 * @param options.maxHeight  The maxHeight of the section.
 * @param options.id  The id of the section.
 * @return {controls} The input section controls object.
 */
liner.ui.createAccordionSection = function(options, index) {
  var sectionID = options.titleID + index;
  var accordionSection = new sap.ui.commons.AccordionSection(sectionID);		
  accordionSection.setTitle(options.title);		
  accordionSection.setTooltip(options.tooltip);
  accordionSection.setMaxHeight(options.maxHeight);
  
  return accordionSection;
};

/**
 * Create a accordion.
 * @param options  Settions for the input section.
 * @param options.width  The width of the section.
 * @param options.id  The id of the section.
 * @return {controls} The accordions controls object.
 */
liner.ui.createAccordion = function(options) {
  var accordion = new sap.ui.commons.Accordion();
  accordion.setWidth(options.width);
  accordion.attachSectionOpen(
    function (oControlEvent) {
        var sectionId = oControlEvent.getParameters().openSectionId;
        
        //TODO, hard code here, 
        //Route section and Shipment section will trigger map tab
        if (sectionId.match(/Route|Shipment/i)) {
          liner.ui.tabs[liner.util.getCurrentTripIndex()]["analyticsTabs"].setSelectedIndex(1);
        }
      }
  );
  
  return accordion;
};


/**
 * Create the left accordion.
 * @param options  Settions for the input section.
 * @param options.width  The width of the section.
 * @param options.id  The id of the section.
 * @return {controls} The accordions controls object.
 */
liner.ui.createNavAccordion = function(index) {
  liner.ui.tabs[index] = liner.ui.tabs[index] || {};
  var inputSection = liner.ui.createAccordionSection({
    title: liner.resources.getText("accordionInput"),
    tooltip: liner.resources.getText("accordionInput"),
    titleID: "Input",
    maxHeight: '730px'
  }, index);
  
  var routeSection = liner.ui.createAccordionSection({
    title: liner.resources.getText("accordionRoute"),
    tooltip: liner.resources.getText("accordionRoute"),
    titleID: "Route",
    maxHeight: '730px'
  }, index);
  
  var shipmentSection = liner.ui.createAccordionSection({
    title: liner.resources.getText("accordionShipment"),
    tooltip: liner.resources.getText("accordionShipment"),
    titleID: "Shipment",
    maxHeight: '730px'
  }, index);
  
  var accordion = liner.ui.createAccordion({width: "500px"});
  
  accordion.addSection(inputSection);
  accordion.addSection(routeSection);
  accordion.addSection(shipmentSection);
  
  liner.ui.tabs[index]["inputSection"] = inputSection;
  liner.ui.tabs[index]["routeSection"] = routeSection;
  liner.ui.tabs[index]["shipmentSection"] = shipmentSection;
  
  return accordion;
};

/**
 * Create a tab item for tabs.
 * @param options  Settions for the input section.
 * @param options.title  The title of the section.
 * @param options.tooltip  The tooltip of the section.
 * @param options.id  The id of the section.
 * @return {controls} The accordions controls object.
 */
liner.ui.createTabItem = function(options) {
  var tab = new sap.ui.commons.Tab(options.id || undefined);
  tab.setTooltip(options.tooltip);
  tab.setTitle(new sap.ui.commons.Title({text: options.title}));
  
  return tab;
};

/**
 * Create a tabtrip.
 * @param options  Settions for the input section.
 * @param options.title  The title of the section.
 * @param options.tooltip  The tooltip of the section.
 * @param options.id  The id of the section.
 * @return {controls} The accordions controls object.
 */
liner.ui.createTabTrip = function(options) {
  var tabTrip = new sap.ui.commons.TabStrip(options.id);
  tabTrip.setWidth(options.width);
  tabTrip.setHeight(options.height);
  
  return tabTrip;
};

/**
 * Create a tabtrip.
 * @param options  Settions for the input section.
 * @param options.title  The title of the section.
 * @param options.tooltip  The tooltip of the section.
 * @param options.id  The id of the section.
 * @return {controls} The accordions controls object.
 */
liner.ui.createAnalyticsTabs = function(index) {
  liner.ui.tabs[index] = liner.ui.tabs[index] || {};
  var costTab = liner.ui.createTabItem({
    tooltip: liner.resources.getText("tabCostModel"),
    title: liner.resources.getText("tabCostModel")
  });
  
  var mapTab = liner.ui.createTabItem({
    tooltip: liner.resources.getText("tabMap"),
    title: liner.resources.getText("tabMap")
  });
  
  var routeTab = liner.ui.createTabItem({
    tooltip: liner.resources.getText("tabRoute"),
    title: liner.resources.getText("tabRoute")
  });
  
  var vesselTab = liner.ui.createTabItem({
    tooltip: liner.resources.getText("tabVessel"),
    title: liner.resources.getText("tabVessel")
  });
  
  var portTab = liner.ui.createTabItem({
    tooltip: liner.resources.getText("tabPort"),
    title: liner.resources.getText("tabPort")
  });
  
  var detailTab = liner.ui.createTabItem({
    tooltip: liner.resources.getText("tabDetails"),
    title: liner.resources.getText("tabDetails")
  });
  
  var tabTrip = liner.ui.createTabTrip({
    width: "1060px",
    height: "790px"
  });
  
  tabTrip.addStyleClass("chartTabs");
  
  tabTrip.addTab(costTab);
  tabTrip.addTab(mapTab);
  tabTrip.addTab(routeTab);
  tabTrip.addTab(vesselTab);
  tabTrip.addTab(portTab);
  tabTrip.addTab(detailTab);
  
  liner.ui.tabs[index]["costTab"] = costTab;
  liner.ui.tabs[index]["mapTab"] = mapTab;
  liner.ui.tabs[index]["routeTab"] = routeTab;
  liner.ui.tabs[index]["vesselTab"] = vesselTab;
  liner.ui.tabs[index]["portTab"] = portTab;
  liner.ui.tabs[index]["detailTab"] = detailTab;
  
  return tabTrip;
};

/**
 * Create a input tab for tabs.
 * @param options  Settions for the input section.
 * @param options.title  The title of the section.
 * @param options.tooltip  The tooltip of the section.
 * @param options.id  The id of the section.
 * @return {controls} The accordions controls object.
 */
liner.ui.createInputTab = function(index, problemid, options) {
  liner.ui.tabs[index] = liner.ui.tabs[index] || {};
  
  var inputTab = liner.ui.createTabItem({
    tooltip: options.tooltip,
    title: options.title
  });
  
  var navAccordion = liner.ui.createNavAccordion(index);
  navAccordion.addStyleClass("navAccordion");
  var analyticsTabs = liner.ui.createAnalyticsTabs(index);
  inputTab.addContent(navAccordion);
  inputTab.addContent(analyticsTabs);
  
  liner.ui.tabs[index]["navAccordion"] = navAccordion;
  liner.ui.tabs[index]["analyticsTabs"] = analyticsTabs;
  liner.ui.tabs[index]["tab"] = inputTab;
  return inputTab;
};

/**
 * Create and display a header control.
 * @param options  Settions for the input section.
 * @param options.title  The title of the section.
 * @param options.tooltip  The tooltip of the section.
 * @param options.id  The id of the section.
 * @return {controls} The accordions controls object.
 */
liner.ui.createHeader = function() {
  //create the ApplicationHeader control
  var header = new sap.ui.commons.ApplicationHeader("id_header"); 
  //configure the branding area
  header.setLogoSrc("http://www.sap.com/global/images/SAPLogo.gif");
  header.setLogoText(liner.resources.getText("headTitle"));	
  //configure the welcome area
  header.setDisplayWelcome(false);
  //configure the log off area
  header.setDisplayLogoff(false);	
  header.placeAt("header");
};

//liner utils functions
/**
 * Gets the current index of the top tabtrip.
 * @return {index} The index of the top tabtrip, default is 0.
 */
liner.util.getCurrentTripIndex = function() {
  if (liner.ui.tabTrip) {
    return liner.ui.tabTrip.getSelectedIndex();
  }
  
  return 0;
};

liner.util.debug = function(target) {
  if (liner.debug) {
    if (window.console) {
      console.log(target);
    } else {
      alert(target);
    }
  }
};

/**
 * Format the string to currency format.
 * @param value  String to format.
 * @return  Formatted value
 */
liner.util.formatCurrency = function(eValue) {
  var intPart   = '';
  var decPart = '';
  if (eValue.indexOf(',') >= 0)
  {
  eValue=eValue.replace(/,/g,'');
  }
  //判断是否包含'.'
  if (eValue.indexOf('.')>=0)
  {
    intPart = eValue.split('.')[0];
    decPart = eValue.split('.')[1];
  }else
  {
    intPart = eValue;
  }
  var num   =   intPart + '';  
  var re = /(-?\d+)(\d{3})/;
  while(re.test(num))
  {
    num = num.replace(re, '$1,$2')  
  }
  if (eValue.indexOf(".") >= 0)
  {
    eValue = num + "." + decPart;
  }
  else
  {
    eValue = num + '.00';
  }
	return "$" + eValue;
};

liner.util.getDefaultIndex = function(inputid) {
	for (var i = 0; i < liner.data.baseproblem.length; i++) {
    if (liner.data.baseproblem[i].pk == inputid) {
      return i;
    }
  }
  
  return 0;
};

/**
 * Get the vessel type detail by the vessel type id, is the "name" attribute in the vessel.
 * @param vId  the id of the vessel type.
 * @return  the detail object of the vessel type
 */
liner.util.getAllVesselTypeList = function(raw_vessels) {
  var vesselDetails = [];
  var detailVessel;
  for (var i = 0; i < raw_vessels.length; i++) {
    vesselDetails[i] = {};
    detailVessel = liner.data.costmodel.vesseltypes[raw_vessels[i].name];
    vesselDetails[i].description = detailVessel.description;
    vesselDetails[i].speed = detailVessel.speed;
    vesselDetails[i].size = detailVessel.size;
    vesselDetails[i].n = raw_vessels[i].n;
  }
  
  return vesselDetails;
};

/**
 * Convert the space to underscore in the given string.
 * @param rawString The string need to handle.
 * @return  converted string
 */
liner.util.convertSpaceToUnderscore = function(rawString) {
  if (rawString) {
    return rawString.replace(/\s+/g, "_");
  } else {
    return rawString;
  }
};