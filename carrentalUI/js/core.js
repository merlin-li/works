//core.js
var rental = {};
rental.debug = true;
rental.offline = true;

rental.languageList = [];
//rental.resources = jQuery.sap.resources({url: "language/language.properties", locale: rental.language});

//set language 
rental.language = "en";


//constants
rental.constants = {};

//data
rental.data = {};
rental.data.solutions = [];
rental.data.orders = [];
rental.data.inputids = []; 
rental.data.itineraries = {};
rental.data.demands = {};
rental.data.routes = {};
rental.data.portsLocaleName = {};
rental.data.orderLoadSchemes = {};
rental.data.orderDetails = [];
rental.data.itemsPerPage = 10;
rental.data.tabTripIndex = 0;

//utils
rental.util = {};

//rental.ui space
rental.ui = {};
rental.ui.maps = [];
rental.ui.tabs = [];
rental.ui.slider = [];

//constants
rental.constants.URL_STATIC = rental.offline ? "json/static.json" : "op/CRStaticData";
//rental.constants.URL_ORDERS_POSITION = rental.offline ? "json/assignment.json": "op/ordersDetailPostion"; //TODO new path
rental.constants.URL_ORDERS = rental.offline ? "json/order.json" : "op/CROrder";
rental.constants.URL_ORDERS_BEIJING = rental.offline ? "json/beijorder.json": "op/CROrder";
rental.constants.URL_MOVEMENTSTATUS = rental.offline ? "json/movementStatus.json": "op/GetMovementsStats";
rental.constants.URL_DEPOT_DETAIL = rental.offline ? "json/CRDepotDetail++depotId=1+timeStamp=12" : "op/CRDepotDetail";
rental.constants.URL_DEPOT_OVERVIEW = rental.offline ? "json/overview++timeStamp=12" :  "op/CROverview";
rental.constants.URL_RUN_OPTIMIZATION = rental.offline ? "json/optimization.json" :  "op/CRRunsolverNew";
rental.constants.URL_NEWEVENT = rental.offline ? "json/unexpected_events.json" :  "json/unexpected_events.json";
rental.constants.ENT = rental.offline ? "json/unexpected_events.json" :  "json/unexpected_events.json";
rental.constants.URL_CRDEPOTCURRENTSTATUS = rental.offline ? "json/CRDepotCurrentStatus++depotId=" : "op/CRDepotCurrentStatus";
rental.constants.URL_COSTVALUE = "json/CostValues.json";

// get real index id
rental.data.getIndexByRowContext =	function(rowContext) {
    var result;
    if (rowContext) {
      result = rowContext.match(/\d*$/);
      if (result.length > 0) {
        return result.pop();
      }
    }   
    return -1;
}
/**
* use port key to get port locale name
*
*/

rental.ui.getLocaleName = function(key, source) {
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
rental.ui.updatePorts = function(ports, source) {
  for(var i in ports) {
    ports[i].name = rental.ui.getLocaleName(ports[i].name, source);
  }  
}

/**
* update copy demands info, use key to get locale name
*
*/
rental.ui.updateDemands = function(demands, source) {
  for(var i in demands) {
    demands[i].origin = rental.ui.getLocaleName(demands[i].origin, source);
    demands[i].destination = rental.ui.getLocaleName(demands[i].destination, source);
  }  
}

/**
* Set and get website language from url and cookie
*
*/
rental.ui.getLanguage = function() {
  rental.language = "en";
  var urlParam = location.search.split("?")[1];
  //console.log(urlParam);
  var urlParams = [];
  var pair;
  var flag = true;
  if (urlParam) {
    urlParams = urlParam.split("&");
    for(var i in urlParams) {
      pair = urlParams[i].split("=");
      if("lang" == pair[0]) {
        rental.ui.setLanguage(pair[1]);
        flag = false;
        break;
      }
    }
  }
  //get language from cookie
  if(flag) {
    rental.ui.setLanguageFromCookie();
  }
  rental.resources = jQuery.sap.resources({url: "language/language.properties", locale: rental.language});
};


/**
* Set language from cookie
*
*/
rental.ui.setLanguageFromCookie = function() {
  var cookieName = "locale";
  var start = document.cookie.indexOf(cookieName+"=");//console.log(start);
  if (start != -1) {
    start = start+cookieName.length+1;
    var end = document.cookie.indexOf(";",start);
    if (end == -1) {
      end = document.cookie.length;
    }
    rental.language = document.cookie.substring(start,end);
  }
}

/**
* Set language from url, and update cookie
* @param options  Settions for the input section.
*/
rental.ui.setLanguage = function(language) { 
  for (var i in languageList) {
    if(language == languageList[i]) {
      rental.language = languageList[i];
      //document.cookie = "locate="+encodeURI("languageList[i]")+";"+;
       document.cookie = "locale="+ languageList[i] + ";";
    }
  }
  
}

//set language 
rental.ui.getLanguage();

/**
 * Create a section for left accordion.
 * @param options  Settions for the input section.
 * @param options.title  The title of the section.
 * @param options.tooltip  The tooltip of the section.
 * @param options.maxHeight  The maxHeight of the section.
 * @param options.id  The id of the section.
 * @return {controls} The input section controls object.
 */
rental.ui.createAccordionSection = function(options, index) {
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
rental.ui.createAccordion = function(options) {
  var accordion = new sap.ui.commons.Accordion();
  accordion.setWidth(options.width);
  accordion.attachSectionOpen(
    function (oControlEvent) {
        var sectionId = oControlEvent.getParameters().openSectionId;
        
        //TODO, hard code here, 
        //Route section and Shipment section will trigger map tab
        if (sectionId.match(/Order/i)) {
          //rental.ui.tabs[rental.util.getCurrentTripIndex()]["analyticsTabs"].setSelectedIndex(1);
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
rental.ui.createNavAccordion = function(index) {
  rental.ui.tabs[index] = rental.ui.tabs[index] || {};
  /*
  var depotSection = rental.ui.createAccordionSection({
    title: rental.resources.getText("accordionDepotTableTitle"),
    tooltip: rental.resources.getText("accordionDepotTableTitle"),
    //titleID: "Shipment",
    maxHeight: '730px'
  }, index);
  */
  var orderSection = rental.ui.createAccordionSection({
    title: rental.resources.getText("accordionOrder"),
    tooltip: rental.resources.getText("accordionOrder"),
    //titleID: "Order",
    maxHeight: '730px'
  }, index); 
	
	var newEventSection = rental.ui.createAccordionSection({
    title: rental.resources.getText("accordionnewEvent"),
    tooltip: rental.resources.getText("accordionnewEvent"),
    //titleID: "Newevent",
    maxHeight: '730px'
  }, index);
  
  var accordion = rental.ui.createAccordion({width: "480px"});
  

  accordion.addSection(orderSection);
  accordion.addSection(newEventSection);
  

  rental.ui.tabs[index]["orderSection"] = orderSection;
  rental.ui.tabs[index]["newEventSection"] = newEventSection;
  
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
rental.ui.createTabItem = function(options) {
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
rental.ui.createTabTrip = function(options) {
  var tabTrip = new sap.ui.commons.TabStrip(options.id);
  tabTrip.setWidth(options.width);
  tabTrip.setHeight(options.height);
  
  return tabTrip;
};


rental.ui.createSliderBar = function(index) {
	var sliderLayout = new sap.ui.commons.layout.MatrixLayout({layoutFixed: false, width: '1060px', widths: ["60px", "120px", "80px", "180px", "70px" ,"180px" ,'30%']});
	return sliderLayout;
}
/**
 * Create a tabtrip.
 * @param options  Settions for the input section.
 * @param options.title  The title of the section.
 * @param options.tooltip  The tooltip of the section.
 * @param options.id  The id of the section.
 * @return {controls} The accordions controls object.
 */
rental.ui.createAnalyticsTabs = function(index) {
  rental.ui.tabs[index] = rental.ui.tabs[index] || {};
  var mapTab = rental.ui.createTabItem({
    tooltip: rental.resources.getText("tabMap"),
    title: rental.resources.getText("tabMap")
  });

  var mstatsTab = rental.ui.createTabItem({
    tooltip: rental.util.getResourcesText("tabAnalysis"),
    title: rental.util.getResourcesText("tabAnalysis")
  });
  rental.ui.mstatsTab = mstatsTab;
  rental.ui.mstatsTab.setVisible(false); 
  var tabTrip = rental.ui.createTabTrip({
    width: "1060px",
    height: "790px"
  });
  tabTrip.addStyleClass("chartTabs");
  tabTrip.addTab(mapTab);
  tabTrip.addTab(mstatsTab);
  rental.ui.tabs[index]["mapTab"] = mapTab;
  rental.ui.tabs[index]["mstatsTab"] = mstatsTab;
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
rental.ui.createInputTab = function(index, problemid, options) {
  rental.ui.tabs[index] = rental.ui.tabs[index] || {};
  
  var inputTab = rental.ui.createTabItem({
    tooltip: options.tooltip,
    title: options.title
  });
  var navAccordion = rental.ui.createNavAccordion(index);
  navAccordion.addStyleClass("navAccordion");
  var analyticsTabs = rental.ui.createAnalyticsTabs(index);
  inputTab.addContent(navAccordion);
  inputTab.addContent(analyticsTabs);

  
  rental.ui.tabs[index]["navAccordion"] = navAccordion;
  rental.ui.tabs[index]["analyticsTabs"] = analyticsTabs;
  rental.ui.tabs[index]["tab"] = inputTab;
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
rental.ui.createHeader = function() {
  //create the ApplicationHeader control
  var header = new sap.ui.commons.ApplicationHeader("id_header"); 
  //configure the branding area
  header.setLogoSrc("http://www.sap.com/global/images/SAPLogo.gif");
  header.setLogoText(rental.resources.getText("headTitle"));	
  //configure the welcome area
  header.setDisplayWelcome(false);
  //configure the log off area
  header.setDisplayLogoff(false);	
  header.placeAt("header");
	
    //add language selector.
	var presetLangs = {'en': 'English', 'zh_CN': '中文'};
  var langSelector = rental.ui.createDropDownList({
    id: 'lang_selector', 
    data: presetLangs,
    tip: "Language Selector",
    value: presetLangs[rental.language]
  });
  langSelector.attachChange(function(e){
    rental.ui.setLanguage(this.getSelectedKey());
    location.href = location.href;
  });  

  langSelector.placeAt('header');
};
rental.ui.createDropDownList = function (objData) {
  var oDropdownBox = new sap.ui.commons.DropdownBox(objData.id);
  var tip = objData.tip,
      value = objData.value,
      data = objData.data;
  
  oDropdownBox.setTooltip(tip);
  oDropdownBox.setEditable(true);
  oDropdownBox.setWidth("200px");
  for (i in data) {
    var oItem = new sap.ui.core.ListItem('dropdown' + i);
    oItem.setText(data[i]);
    oItem.setKey(i);
    oDropdownBox.addItem(oItem);
  }
  //set selected value
  oDropdownBox.setValue(value);
  
  return oDropdownBox;
};

//rental utils functions
/**
 * Gets the current index of the top tabtrip.
 * @return {index} The index of the top tabtrip, default is 0.
 */
rental.util.getCurrentTripIndex = function() {
  if (rental.ui.tabTrip) {
    return rental.ui.tabTrip.getSelectedIndex();
  }
  
  return 0;
};

rental.util.debug = function(target) {
  if (rental.debug) {
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
rental.util.formatCurrency = function(eValue) {
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

rental.util.getDefaultIndex = function(inputid) {
	for (var i = 0; i < rental.data.baseproblem.length; i++) {
    if (rental.data.baseproblem[i].pk == inputid) {
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
rental.util.getAllVesselTypeList = function(raw_vessels) {
  var vesselDetails = [];
  var detailVessel;
  for (var i = 0; i < raw_vessels.length; i++) {
    vesselDetails[i] = {};
    detailVessel = rental.data.costmodel.vesseltypes[raw_vessels[i].name];
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
rental.util.convertSpaceToUnderscore = function(rawString) {
  if (rawString) {
    return rawString.replace(/\s+/g, "_");
  } else {
    return rawString;
  }
};

/**
 * Get Resources value by key
 */
rental.util.getResourcesText = function(key) {
  return rental.resources.getText(key);
};

/**
 * Draw a column chart
 * @charttype: chart type
 * @_carchartid: id
 * @_carchartdata: data arr
 * @_title: chart title
 * @_width: chart widht
 * @_height: chart height
 * @_bgcolor: chart background
 */
rental.util.drawChart = function(charttype, _carchartid, _carchartdata, options) {
  var data = google.visualization.arrayToDataTable(_carchartdata);
  if ("columnchart" == charttype) {
    new google.visualization.ColumnChart(document.getElementById(_carchartid)).
      draw(data, options);
  } else if ("piechart" == charttype) {
    new google.visualization.PieChart(document.getElementById(_carchartid)).
      draw(data, options);   
  }
};
