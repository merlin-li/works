rental.map = (function() {
  var maps = [];
  var customMapOption = {
    useImg: false,
    imgSrc: "image/redcircle.png",
    changeCircleSize: true
  };
  //infowindow
  var mapdefaultInfoWindow;
  var firstload = true;
  //weekdays
  var	week = 
    [
        rental.resources.getText("weekSunday"),
        rental.resources.getText("weekMonday"),
        rental.resources.getText("weekTuesday"),
        rental.resources.getText("weekWednesday"),
        rental.resources.getText("weekThursday"),
        rental.resources.getText("weekFriday"),
        rental.resources.getText("weekSaturday")
    ],
    
    //polyline colors
    colors =
    [
      "red",
      "yellow",
      "aqua",			
      "lime",
      "fuchsia"
    ],
    
    //polyline option
    polylineOption = 
    {
      strokeOpacity: 1,
      strokeWeight: 2
    },
    
    //map center
    center = new google.maps.LatLng(30, 110),

    //map option
    mapOptions = {
      zoom: 4,
      center: center,
      //mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP //ROADMAP SATELLITE HYBRID
    };
    
  saveSliderValue(0, (new Date()).getDate());
  //saveSliderValue(1, (new Date()).getDate());
  
  // draw ports on the map
  function drawPorts(ports, map, costmodel) {
    var protDetail;
    for (var i in ports) {
      protDetail = costmodel.ports[ports[i].name];
      if (protDetail) {
        var source = rental.data.costmodel;
        var port = new google.maps.Marker({
        position: new google.maps.LatLng(protDetail.lat, protDetail.lon),
        map: map,
        title: rental.ui.getLocaleName(ports[i].name, source.ports),
        zIndex: 1
        }), 
        content =
          "<span class='windowTitle'>" + rental.ui.getLocaleName(ports[i].name, source.ports) + "</span>" +
          "<img src='image/" + ports[i].name + ".jpg' class='portPhoto' />" +
          rental.resources.getText("tabCostModel") + ":<br>" +
          "<table>" +
          "<tr><th>" + rental.resources.getText("fieldVesselType") + "</th><th>&nbsp| " + rental.resources.getText("fieldBerthing") + "</th><th>&nbsp| " + rental.resources.getText("fieldOffLoading") + "</th><th>&nbsp| " + rental.resources.getText("fieldInitial") + "</th></tr>" +
          "<tr><td style=\"text-align: left;\">" + source.vesseltypes.s.description + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.s.berthingFee + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.s.unloadFee + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.s.dailyFee + "</td></tr>" +
          "<tr><td style=\"text-align: left;\">" + source.vesseltypes.m.description + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.m.berthingFee + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.m.unloadFee + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.m.dailyFee + "</td></tr>" +
          "<tr><td style=\"text-align: left;\">" + source.vesseltypes.b.description + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.b.berthingFee + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.b.unloadFee + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.b.dailyFee + "</td></tr>" +
          "<tr><td style=\"text-align: left;\">" + source.vesseltypes.vb.description + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.vb.berthingFee + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.vb.unloadFee + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.vb.dailyFee + "</td></tr>" +
          "<tr><td style=\"text-align: left;\">" + source.vesseltypes.vvb.description + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.vvb.berthingFee + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.vvb.unloadFee + "</td><td style=\"text-align: right;\">&nbsp&nbsp&nbsp" + protDetail.vvb.dailyFee + "</td></tr>" +
          "</table>";
        
        attachMessage(map, port, content);
      }
    }
  }
  
  function displayPolyline(polyline, route, type) {
    if (rental.data.routes[route]) {
      for (var j = 0; j < rental.data.routes[route].length; j++) {
        polyline.getPath().push(new google.maps.LatLng(rental.data.routes[route][j][0], rental.data.routes[route][j][1]));
      }
    } else {
      getPolylinePathData(polyline, route, type);
    }
  }
  
  function getPolylinePathData(polyline, route, type) {
    if (type ==2) {
      $.getJSON(rental.constants.URL_ROUTE_PATH + route + '.txt', function(data) {
        rental.data.routes[route] = data;
        for (var j = 0; j < rental.data.routes[route].length; j++) {
          polyline.getPath().push(new google.maps.LatLng(rental.data.routes[route][j][0], rental.data.routes[route][j][1]));
        }
      });
    } else {
      var shunPoints = route.split("-");
      var shuntpoints = rental.data.costmodel.shuntpoints;
      for (var j = 0; j < shunPoints.length; j++) {
        polyline.getPath().push(new google.maps.LatLng(shuntpoints[shunPoints[j]].lat, shuntpoints[shunPoints[j]].lon));
      }
    }

  }

  //attach message to the marker on the map
  function attachMessage(map, marker, message) {
    var infowindow = new google.maps.InfoWindow({
      content: message
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });
  }

  //attach message to the polyline on the map
  function attachPolylineMessage(map, polyline, message) {
    google.maps.event.addListener(polyline, 'click', function(event) {
      var infowindow = new google.maps.InfoWindow({
        content: message,
        position: event.latLng
      });
      infowindow.open(map);
    });
  }
  
  //attach message to the vessle on the map 
  function attachVesselMessage(map, vessel, message) {
    google.maps.event.addListener(vessel, 'click', function(event) {
      var infowindow = new google.maps.InfoWindow({
        content: message,
        position: event.latLng
      });
      infowindow.open(map);
    });
  }
  
  //attach message to the circle on the map
  function attachCircleMessage(map, circle, cobj, index) {
    google.maps.event.addListener(circle, 'click', function() {
      //console.log(circle);
      //infowindow.open(map);      
      getDepotDetails(cobj.id, circle, map, firstload, index);      
    });
    google.maps.event.addListener(circle, 'rightclick', function() {
      if (firstload){
        return;
      }
      //mapdefaultInfoWindow.setMap(null);
      showInAndOutBtn(cobj.id, cobj.title, circle, map, index);
    });
  }
  
  function showInAndOutBtn(id, title, circle, map, index) {   
    cleanAllRoutes();
    var result = '<div class="div_rightPopup"><strong>Select Route Type:</strong><br />';
    result += '<table><tr><td aign="right">'
      + '<img src="image/left.png" id="btn_routeOut_' + id + '" />'
      + '</td><td align="left">'
      + '<img src="image/right.png" id="btn_routeIn_' + id + '" />'
      + '</td></tr></table>';
    var infowindow = new google.maps.InfoWindow({
      content: result,
      position: circle.getCenter(),
      maxWidth: 100
    });
    infowindow.open(map);
    var directionsservice = new google.maps.DirectionsService();
    $("#btn_routeOut_" + id).click(function(){      
      var data = drawInOutRoutes(false, index, title);
      var i = 0;
      var directionsService = new google.maps.DirectionsService();
      var interval = window.setInterval(function () {
        drawRoutes(directionsservice, map, data[i], 'Red');
        i++;
        if (i === data.length) {
          window.clearInterval(interval);
          i = 0;
        }
      }, 300);
    });
    $("#btn_routeIn_" + id).click(function(){
      var data = drawInOutRoutes(true, index, title);
      var i = 0;
      var directionsService = new google.maps.DirectionsService();
      var interval = window.setInterval(function () {
        drawRoutes(directionsservice, map, data[i], 'Blue');
        i++;
        if (i === data.length) {
          window.clearInterval(interval);
          i = 0;
        }
      }, 300);
    });
  }
  
  function cleanAllRoutes() {
    if (rental.data.directionDisplay != null){
      for (var i = 0; i < rental.data.directionDisplay.length; i++) {
        rental.data.directionDisplay[i].setDirections({routes:[]});
      }
    }
  }
  
  function cleanAllCircles() {
    if(rental.data.circles[0] != null) {
      for (var i = 0; i < rental.data.circles[0].length; i++) {
        rental.data.circles[0][i].setMap(null);
      }
    }
  }
  
  function drawInOutRoutes(isin, index, title) {
    var resultroutes = [];
    for (var i = 0; i < rental.data.legs[index].length; i++) {
      if (isin) {
        if (rental.data.legs[index][i].to === title) {
          resultroutes.push(rental.data.legs[index][i]);
        }
      }
      else {
        if (rental.data.legs[index][i].from === title) {
          resultroutes.push(rental.data.legs[index][i]);
        }
      }
    }
    return rental.depot.combineDepotAndLinks(rental.data.depot[index], resultroutes);
  }  
  
  function getDepotDetails(id, circle, map, isfirst, index) {
    var url = "";
    if (isfirst) {
      url = rental.constants.URL_CRDEPOTCURRENTSTATUS;
      if (rental.offline) {
        url = "json/CRDepotCurrentStatus++depotId=" + id + ".json";
      }
      $.getJSON(url, {depotId: id}, function(data){
        var result = "";
        result += '<div class="depotDetailPopup">';
        result += '<h1>' + data.depotName + '</h1>';
        result += ("<table><caption>Stock Level</caption><thead><tr><th>Car Type</th><th>Car Num</th></thead><tbody>");
        //In car
        for (var key in data.stocks) {
          result += ("<tr><td>" 
            + rental.data.cartypes[index][key].description
            + "</td><td>" 
            + data.stocks[key]
            + "</td></tr>");
        }
        result += "</tbody></table><br /><br />";
        result += "<div>";
        result += ("<table><caption>Order Amount</caption><thead><tr><th>Car Type</th><th>Num</th></tr></thead><tbody>");
        
        //Out car
        for (var key in data.orderAmount) {
          result += ("<tr><td>" 
            + rental.data.cartypes[index][key].description
            + "</td><td>" 
            + data.orderAmount[key]
            + "</td></tr>");
        }
        result += "</tbody></table><br /></div>";
        
        var infowindow = new google.maps.InfoWindow({
          content: result,
          position: circle.getCenter()
        });
        infowindow.open(map);
      });
      return;
    }
    url = rental.constants.URL_DEPOT_DETAIL;
    if (rental.offline) {
      url = "json/CRDepotDetail++timeStamp=" + rental.data.sliderValue[index] + "+depotId=" + id + ".json";
    }
    $.getJSON(url, {
        depotId: id, 
        timeStamp: rental.data.sliderValue[index]
      }, function(data) {
        var result = "";
        result += '<div class="depotDetailPopup">';
        result += '<h1>' + data.depotName + '</h1>';
        result += ("<table><caption>In Car</caption><thead><tr><td>From</td><td>Car Type</td><td>Num Of Car</td></tr></thead><tbody>");
        //In car
        for (var i = 0; i < data.inflows.length; i++) {
          result += ("<tr><td>" 
            + data.inflows[i].fromDepot
            + "</td><td>" 
            + rental.data.cartypes[index][data.inflows[i].cartype].description
            + "</td><td>" 
            + data.inflows[i].num
            + "</td></tr>");
        }
        result += "</tbody></table><br /><br />";
        result += "<div>";
        result += ("<table><caption>Out Car</caption><thead><tr><td>To</td><td>Car Type</td><td>Num Of Car</td></tr></thead><tbody>");
        
        //Out car
        for (var i = 0; i < data.outflows.length; i++) {
          result += ("<tr><td>" 
            + data.outflows[i].toDepot
            + "</td><td>" 
            + rental.data.cartypes[index][data.outflows[i].cartype].description
            + "</td><td>" 
            + data.outflows[i].num
            + "</td></tr>");
        }
        result += "</tbody></table><br /><br />";
        result += "<div>";
        result += ("<table><caption>Substitution</caption><thead><tr><td>To</td><td>From</td><td>Num</td></tr></thead><tbody>");
        
        //Substitution
        for (var i = 0; i < data.UpgradeDetails.length; i++) {
          result += ("<tr><td>" 
            + rental.data.cartypes[index][data.UpgradeDetails[i].to].description
            + "</td><td>" 
            + rental.data.cartypes[index][data.UpgradeDetails[i].from].description
            + "</td><td>" 
            + data.UpgradeDetails[i].number
            + "</td></tr>");
        }
        result += "</tbody></table><br /></div>";
        
        //buyflows
        if (data.buyflows !=null && data.buyflows != undefined) {
          result += ("<table><caption>Cars To Buy</caption><thead><tr><td>Car Type</td><td>Num</td></tr></thead><tbody>");
          for (var key in data.buyflows) {
            result += ("<tr><td>" 
              + rental.data.cartypes[0][key].description
              + "</td><td>" 
              + data.buyflows[key]
              + "</td></tr>");
          }
          result += "</tbody></table><br /></div>";
        }
        var infowindow = new google.maps.InfoWindow({
          content: result,
          position: circle.getCenter()
        });
        infowindow.open(map);
      });
  }
  
  function resetPolylines(polylines) {
    for (var i in polylines) {
      if (polylines[i]) {
        for (var j in polylines[i]) {
          polylines[i][j] && polylines[i][j].setPath([]);
        }
      } else {
        continue;
      }
    }
  }
  
  function resetVessels(vessels) {
    for (var i in vessels) {
      if (vessels[i]) {
        for (var j in vessels[i]) {
          vessels[i][j] && vessels[i][j].setMap(null);
        }
      } else {
        continue;
      }
    }
  }
  
  //get the real index in the json data, the rowIndex is not right when we reorder the list
  function getIndexByRowContext(rowContext) {
    var result;
    if (rowContext) {
      result = rowContext.match(/\d*$/);
      if (result.length > 0) {
        return result.pop();
      }
    }
    
    return -1;
  }
  
  function sendDirectionRequest(directionService, map, depotroute) {
    var directionDisplay = new google.maps.DirectionsRenderer({
      preserveViewport: true,
      map: map,
      draggable: true
    });
    var request = {
      origin: new google.maps.LatLng(depotroute.fromDepot.lat, depotroute.fromDepot.lon),
      destination: new google.maps.LatLng(depotroute.toDepot.lat, depotroute.toDepot.lon),
      travelMode: google.maps.DirectionsTravelMode.DRIVING    
    };
    directionService.route(request, function(response, status){
      //console.log(status);
      if (status === google.maps.DirectionsStatus.OK) {
        directionDisplay.setDirections(response);
      }
      if (status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
        //setTimeout(sendDirectionRequest(directionService, map, depotroute), 5000);
      }
    });
  }
    
  function saveSliderValue(index, value) {
    if (rental.data.sliderValue === null || rental.data.sliderValue === undefined) {
      rental.data.sliderValue = [];
      rental.data.sliderValue[index] = value;
    }
    else {
      rental.data.sliderValue[index] = value;
    }
  }
  
  /*
   * create slider bar on the google map 
   *
   */
  function createSliderBar(index, map) {
    //create slider bar first
    var sliderContent = new sap.ui.commons.layout.MatrixLayout({
      width: "100%",
      columns: 6
    });
    sliderContent.setWidths('5%', '20%', '10%', '20%', '10%', '35%');
    sliderContent.placeAt("slider_bar_content_" + index);
    var intervalSlider;
    var isPlay = false;
    var nowYear, nowMonth, nowDay, nowHour;
    var defaultDate = new Date();
    setCurrentDay(defaultDate);
    var defaultDaysOfMonth = getDaysOfMonth(defaultDate);
    var oSlider = new sap.ui.commons.Slider();
    //rental.ui.slider[index]["slider"] = sliderContent;
    oSlider.setWidth("100%");
    oSlider.setSmallStepWidth(1);
    oSlider.setTotalUnits(29);
    oSlider.setStepLabels(true);
    oSlider.setMin(1);
    oSlider.setMax(30);
    oSlider.setValue(defaultDate.getDate());
    oSlider.setTooltip(rental.util.getResourcesText("tabMapSliderBar_Tip"));
    oSlider.addStyleClass("slider_bar_div");
    oSlider.addStyleClass("slider_bar_line");
    var sliderCell = new sap.ui.commons.layout.MatrixLayoutCell({colSpan: 6});
    sliderCell.addContent(oSlider);
    oSlider.attachChange(function(e) {
      if (rental.ui.maps[index]) {
        rental.ui.maps[index].setZoom(11);
      }
      cleanAllRoutes();
      cleanAllCircles();
      var slidevalue = oSlider.getValue();
      var nowDateTime = new Date();
      nowDateTime.setDate(oSlider.getValue());
      showTime.setText(
        rental.util.getResourcesText("tabMapSliderBar_LbTime") 
        + " " + nowDateTime.getFullYear()
        + "-" + (nowDateTime.getMonth() + 1)
        + "-" + nowDateTime.getDate());
      //save the value of this slider
      saveSliderValue(index, oSlider.getValue());
      //rental.depot.loadData(index, oSlider.getValue());
      //$.getJSON(rental.constants.URL_RUN_OPTIMIZATION, {
      //  optcase: oSlider.getValue()
      //  }, function(data){
        rental.depot.loadData(index, oSlider.getValue());
        firstload = false;
      //});
    });
    saveSliderValue(index, oSlider.getValue());
    
    //Create run button
    var runBtn = new sap.ui.commons.Button({text: rental.util.getResourcesText("optimizeTbRunbtnTitle")});
    runBtn.attachPress(function(e) {
      rental.ui.mstatsTab.setVisible(true);
      //rental.ui.showMovenStatustabConts();
      if (rental.data.pocket.length < 5) {          
        rental.data.pocket.push(rental.data.MovenStatabdata[rental.data.pocket.length]);   
        var ordersModel = new sap.ui.model.json.JSONModel();
        ordersModel.setData({modelData: rental.data.pocket});
        rental.showMovenStatusTab.setModel(ordersModel);
        rental.showMovenStatusTab.bindRows("/modelData");
      }      

      if (rental.ui.maps[index]) {
        rental.ui.maps[index].setZoom(11);
      }
      cleanAllRoutes();
      cleanAllCircles();
      
      //events
      //var edate = new String(endDate.getValue());
      //var edatestr = edate.substring(6, 10) + "-" + edate.substring(0, 2) + "-" + edate.substring(3, 5) + " 00:00:00";
      //$.getJSON(rental.constants.URL_RUN_OPTIMIZATION, {
      //  begintimestamp: '2012-03-01 00:00:00',
      //  endtimestamp: edatestr,
      //  optcase: -1
      //  }, function(data){
        rental.depot.loadData(index, oSlider.getValue());
        firstload = false;
      //});      
    });
    
    var fromLabel = new sap.ui.commons.Label({text: rental.util.getResourcesText("tabMapSliderBar_LbFrom") + " :", textAlign: "Right"});
    //fromLabel.placeAt("from_label_" + index);
    
    var toLabel = new sap.ui.commons.Label({width: '100%', text: rental.util.getResourcesText("tabMapSliderBar_LbTo") + " :", textAlign: "Right"});
    //fromLabel.placeAt("to_label_" + index);
    
    var startDate = new sap.ui.commons.DatePicker({width: "100%", locale:"zh_CN"});
    startDate.attachChange(function(e) {
      var selectDate = startDate.getValue();
      var formatDate = new Date(selectDate);
      setCurrentDay(formatDate);
      showTime.setText(rental.util.getResourcesText("tabMapSliderBar_LbTime") 
        + " " + nowYear 
        + "-" + nowMonth 
        + "-" + nowDay );
    });
    //startDate.placeAt("start_date_" + index);
    
    var currentDate = new Date();
    startDate.setYyyymmdd("20120301");
    startDate.setEnabled(false);
    var endDate = new sap.ui.commons.DatePicker({width: "100%", locale: "zh_CN"});
    var endDateTime = new Date();
    endDate.setYyyymmdd("20120401");
    
    var showTime =  new sap.ui.commons.Label({textAlign: "Center", width: "100%"});
    //showTime.placeAt("show_time_" + index);
    showTime.setText(rental.util.getResourcesText("tabMapSliderBar_LbTime") 
      + " " + defaultDate.getFullYear() 
      + "-" + (defaultDate.getMonth() + 1) 
      + "-" + defaultDate.getDate()
    );
    var showTimeCell = new sap.ui.commons.layout.MatrixLayoutCell({colSpan: 3});
    showTimeCell.addContent(showTime);
   
    sliderContent.createRow(fromLabel, startDate, toLabel, endDate, runBtn, showTimeCell);
    sliderContent.getRows()[0].getCells()[4].setHAlign("Right");
    sliderContent.createRow(sliderCell, "");
    
    function setCurrentDay(dateTime) {
      nowYear = dateTime.getFullYear();
      nowMonth = dateTime.getMonth() < 10 ? "0" + (dateTime.getMonth() + 1) : dateTime.getMonth() + 1;
      nowDay = dateTime.getDate() < 10 ? "0" + dateTime.getDate() : dateTime.getDate();
      nowHour = dateTime.getHours() < 10 ? "0" + dateTime.getHours() : dateTime.getHours();
    }
    
    function getDaysOfMonth(dateTime) {
      return  32 - new Date(dateTime.getFullYear(), dateTime.getMonth(), 32).getDate();
    }
  }
  
  /*
   * Handle the data of pies and save them in the array. rental.data.pie
   */
  function saveChartPie(pieData, map, index) {
    rental.data.pie = [];
    rental.data.pie[index] = [];
    var pie = new rental.chartOverLay.chartOverLay(
      new google.maps.LatLng(62.323907, -150.109291), 
      map, 
      null, 
      {
        "watch TV": 20,
        "play computer games": 30,
        "chat": 23,
        "rest": 10
      }
    );
    pie.setMap(null);
    rental.data.pie[index].push(pie);
  }
  
  /*
   * If the map's zoom is 6, show pie charts, else hide the pie charts
   * @mapZoom: google map's zoom
   * @ready: weather the map load first
   * @map: google map
   * @index: tab index
   */
  function setPieDisplay(mapZoom, ready, map, index) {    
    if (mapZoom >= 4) {
      for(var p in rental.data.pie[index]) {
        rental.data.pie[index][p].setMap(map);
      }
    }
    else {
      if (!ready) {
        for(var p in rental.data.pie[index]) {
          rental.data.pie[index][p].setMap(null);
        }
      }
    }
  }
  
  function drawPolylines(map, data) {
    for (var i = 0; i < data.length; i++) {
      var flightLine = [
        new google.maps.LatLng(data[i].fromlat, data[i].fromlon),
        new google.maps.LatLng(data[i].tolat, data[i].tolon)
      ];
      var flightPath = new google.maps.Polyline({
        path: flightLine,
        strokeColor: "blue",
        strokeOpacity: 1.0,
        strokeWeight: 4,
        icons: [{
                  icon : {path : google.maps.SymbolPath.FORWARD_CLOSED_ARROW},
                  offset : '50%'
                }]
      });
      flightPath.setMap(map);
    }
  }
  
  function drawRoutes(directionservice, map, data, color) {
    var directionsDisplay = new google.maps.DirectionsRenderer({
      preserveViewport: true,
      suppressMarkers: true,
      map: map,
      draggable: false,
      suppressPolylines: false,
      polylineOptions: {
        strokeColor: color,
        icons: [{
                  icon : {path : google.maps.SymbolPath.FORWARD_CLOSED_ARROW},
                  offset : '50%'
                }]
      }
    });
    directionsDisplay.setMap(map); 
    
    //save directionDisplay
    if (rental.data.directionDisplay === null || rental.data.directionDisplay === undefined) {
      rental.data.directionDisplay = [];      
    }
    rental.data.directionDisplay.push(directionsDisplay);     

    var request = {
      origin: new google.maps.LatLng(data.fromlat, data.fromlon),
      destination: new google.maps.LatLng(data.tolat, data.tolon),
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionservice.route(request, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        //showRouteAnimation(map, directionsDisplay.getDirections().routes[0].overview_path);
      }
    });
  }
  
  function showRouteAnimation(map, path) {
    var k = 0,
     interval = null;
    var vessel = new google.maps.Marker({
      icon : "image/b.png",
      zIndex : 0
    });
    vessel.setMap(map);    
    interval = setInterval(drawLine, 30);    
    function drawLine() {
      vessel.setPosition(path[k]);
      k++;
      if (k == path.length) {
        clearInterval(interval);
      }
    }
  }

  return {
    showMapTab: function(depot, index, depotandlinks) {
      //each map has an unique id
     // rental.ui.maps[index] = {};
      //rental.ui.maps[index] = rental.ui.maps[index] || []
      var map = null;
      if (rental.ui.maps[index]) {
        map  = rental.ui.maps[index];
        rental.map.drawDepotPoints(depot, index, depotandlinks, map);
      } else {
        rental.ui.tabs[index]["mapTab"].removeAllContent();
        var mapID = "gmap_default_" + index;
        var sliderID = "slider_bar_" + index;
        var sliderBarContent = "slider_bar_content_" + index;
        var sliderBarContianerContent = "slider_bar_container_content_" + index;
        var mapContent = '<div id="' + mapID + '" class="map-tab"></div>';
        var sliderBar = '<div class="slider" id="' 
          + sliderBarContent 
          + '" style=""></div>' 
          + '<div class="slider" id="' 
          + sliderBarContianerContent 
          + '" style=""></div>';
      
        mapContent = mapContent + sliderBar;       

        var mapOptions ={
          zoom: 11,
          center: new google.maps.LatLng(39.921034, 116.443188),
          mapTypeId: google.maps.MapTypeId.ROADMAP //ROADMAP SATELLITE HYBRID
        };
        var default_map_html = new sap.ui.core.HTML({
          content: mapContent,
          afterRendering: function(e) {
            if (map == null) {
              map = new google.maps.Map(document.getElementById(mapID), mapOptions);
              //rental.map.saveMapObejct(map, index);
              rental.ui.maps[index] = map;
              createSliderBar(index, map);
              //draw ports on the map
              //cleanAllCircles();
              rental.map.drawDepotPoints(depot, index, depotandlinks, map);
              
               var defaultZoom = map.getZoom();    
                google.maps.event.addListener(map, 'zoom_changed', function () {
                  if (customMapOption.changeCircleSize) {
                    var currentZoom = map.getZoom();
                    var ratio = Math.pow(2, (currentZoom - defaultZoom));
                    defaultZoom = currentZoom;
                    var radius;
                    var newRadius;
                    for (var c in rental.data.circles[index]) {
                      radius = rental.data.circles[index][c].getRadius();
                      newRadius = radius / ratio;
                      rental.data.circles[index][c].setRadius(newRadius);
                    }
                  }              
                  //setPieDisplay(map.getZoom(), false, map, index);
                });
              }
            }
          });
          rental.ui.tabs[index]["mapTab"].addContent(default_map_html);          
        }
    },
    
    saveMapObejct: function(map, index) {
      maps[index] = map;
    },
    
    findMapObject: function(index) {
      return maps[index];
    },
    
    showDepotTab: function(index, laglng, laglngIndex) {
      //each map has an unique id
      var mapID = "gmap_default_" + index;
      var mapContent = '<div id="' + mapID + '" class="map-tab"></div>';
      rental.ui.maps[index] = {};
      var myOptions = {
        zoom: 6,
        center: new google.maps.LatLng(laglng[0].lat, laglng[0].lon),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };      
      var default_map_html = new sap.ui.core.HTML({
        content: mapContent,
        afterRendering: function (e) {
          var map = new google.maps.Map(document.getElementById(mapID), myOptions);
          for (var i = 0; i < laglng.length; i++) {
            eval('var marker' + i + ' = new google.maps.Marker({'
              + '  map: map,'
              + '  position: new google.maps.LatLng(laglng[i].lat, laglng[i].lon)'
              + '});'
              + 'var infowindow' + i + ' = new google.maps.InfoWindow();'
              + 'infowindow' + i + '.setContent(laglng[i].name);'
              + 'google.maps.event.addListener(marker' + i + ', "click", function() {'
              + '  infowindow' + i + '.open(map, marker' + i + ');'
              + '});');
          }
          rental.map.saveMapObejct(map, index);          
        }
      });
      rental.ui.tabs[index]["mapTab"].removeAllContent();
      rental.ui.tabs[index]["mapTab"].addContent(default_map_html);
    },
  
    drawDepotRoute: function(depotroute, index) {
      //each map has an unique id
      var mapID = "gmap_default_" + index;
      var mapContent = '<div id="' + mapID + '" class="map-tab"></div>';
      var map = null;
      rental.ui.maps[index] = {};
      rental.ui.tabs[index]["mapTab"].removeAllContent();
      var myOptions;
      if (depotroute === null || depotroute.length === 0) {
        myOptions = {
          zoom: 5,
          center: center,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      } 
      else {
        myOptions = {
          zoom: 5,
          center: new google.maps.LatLng(depotroute[0].toDepot.lat, depotroute[0].toDepot.lon),
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      }
      var directionService = new google.maps.DirectionsService();
      var default_map_html = new sap.ui.core.HTML({
        content: mapContent,
        afterRendering: function (e) {
          if (map === null) {
            map = new google.maps.Map(document.getElementById(mapID), myOptions);
            rental.map.saveMapObejct(map, index);
            
            //sendDirectionRequest(directionService, map, depotroute[0]);
            if (depotroute === null || depotroute.length === 0) {
              //console.log("null");
            } 
            else {            
              var i = 0;
              var interval = window.setInterval(function() {
                sendDirectionRequest(directionService, map, depotroute[i]);
                i++;
                if (i === depotroute.length) {
                  window.clearInterval(interval);
                  i = 0;
                }
              }, 300);
            }
          }
        }
      });      
      rental.ui.tabs[index]["mapTab"].addContent(default_map_html);  
      //console.log("map done");      
    },
  
    drawDepotPoints111: function(depot, index, depotandlinks) {      
      //create a object to save the circle data
      if (rental.data.circles === null || rental.data.circles === undefined){
        rental.data.circles = [];        
        rental.data.circles[index] = [];
        
        rental.data.circlesName = [];
        rental.data.circlesName[index] = [];
      }
      else {
        rental.data.circles[index] = [];
        rental.data.circlesName[index] = [];
      }
      //each map has an unique id
      var mapID = "gmap_default_" + index;
      var sliderID = "slider_bar_" + index;
      var sliderBarContent = "slider_bar_content_" + index;
      var sliderBarContianerContent = "slider_bar_container_content_" + index;
      var mapContent = '<div id="' + mapID + '" class="map-tab"></div>';
      var sliderBar = '<div class="slider" id="' 
        + sliderBarContent 
        + '" style=""></div>' 
        + '<div class="slider" id="' 
        + sliderBarContianerContent 
        + '" style=""></div>';
    
      mapContent = mapContent + sliderBar;
      var map = null;
      rental.ui.maps[index] = rental.ui.maps[index] || {};
      var default_map_html = new sap.ui.core.HTML({
        content: mapContent,
        afterRendering: function (e) {
          //if (maps[index] === null || maps[index] === undefined) {
            if (rental.ui.maps[index] && rental.ui.maps[index]["map"]) {
              map = rental.ui.maps[index]["map"]; 
              console.log(1111);
            } else {
              map = new google.maps.Map(document.getElementById(mapID), mapOptions);   
              createSliderBar(index, map);
            }
      
            var cityCircle;
            var circleOption = {
              strokeColor: "#FFFFFF",
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillOpacity: 1,
              map: map,
              radius: 70000
            };
            var color = '#006738';
            for (var site in depot) {
              circleOption.center = new google.maps.LatLng(depot[site].lat, depot[site].lon);
              color = depot[site].color;
              if (color === 2) {
                circleOption.fillColor = '#006738';
              }
              else {
                if (color === 1 ){
                  circleOption.fillColor = '#FCC52C';
                }
                else {
                  circleOption.fillColor = '#BE1D2D';
                }
              }
              cityCircle = new google.maps.Circle(circleOption);
              rental.data.circles[index].push(cityCircle);
              rental.data.circlesName[index].push({id: depot[site].id, title: depot[site].name});
            }           
          
            //add listener to circles           
            for (var i = 0; i < rental.data.circles[index].length; i++) {
              attachCircleMessage(map, rental.data.circles[index][i], rental.data.circlesName[index][i], index);
            }
            
            var defaultZoom = map.getZoom();           
            
            //setPieDisplay(defaultZoom, true, map, index);
            //console.log(rental.data.circles[index]);
            google.maps.event.addListener(map, 'zoom_changed', function () {
              if (customMapOption.changeCircleSize) {
                var currentZoom = map.getZoom();
                var ratio = Math.pow(2, (currentZoom - defaultZoom));
                defaultZoom = currentZoom;
                var radius;
                var newRadius;
                for (var c in rental.data.circles[index]) {
                  radius = rental.data.circles[index][c].getRadius();
                  newRadius = radius / ratio;
                  rental.data.circles[index][c].setRadius(newRadius);
                }
              }              
              //setPieDisplay(map.getZoom(), false, map, index);
            });


            map.setOptions({
              zoom: 11,
              center: new google.maps.LatLng(39.921034, 116.443188),
              mapTypeId: google.maps.MapTypeId.HYBRID //ROADMAP SATELLITE HYBRID
            });
            rental.ui.maps[index]["map"] = map;
            //rental.map.saveMapObejct(map, index);
          //}
        }
      });     
      
      rental.ui.tabs[index]["mapTab"].removeAllContent();
      rental.ui.tabs[index]["mapTab"].addContent(default_map_html);
    },
    
    drawDepotPoints: function(depot, index, depotandlinks, map) {      
      //create a object to save the circle data
      if (rental.data.circles === null || rental.data.circles === undefined){
        rental.data.circles = [];        
        rental.data.circles[index] = [];
        
        rental.data.circlesName = [];
        rental.data.circlesName[index] = [];
      }
      else {
        rental.data.circles[index] = [];
        rental.data.circlesName[index] = [];
      }      
      var cityCircle;
      var circleOption = {
        strokeColor: "#FFFFFF",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillOpacity: 1,
        map: map,
        radius: 700
      };
      var color = '#006738';
      for (var site in depot) {
        circleOption.center = new google.maps.LatLng(depot[site].lat, depot[site].lon);
        color = depot[site].color;
        if (color === 2) {
          circleOption.fillColor = '#006738';
        }
        else {
          if (color === 1 ){
            circleOption.fillColor = '#FF872B';
          }
          else {
            circleOption.fillColor = '#BE1D2D';
          }
        }
        if (!firstload) {
          circleOption.fillColor = '#006738';
          if (rental.data.buyflows[index] != null) {
            for (var key in rental.data.buyflows[index]) {
              if (site === key) {
                circleOption.fillColor = '#9319FF';
              }
            }
          }
        }
        cityCircle = new google.maps.Circle(circleOption);
        rental.data.circles[index].push(cityCircle);
        rental.data.circlesName[index].push({id: depot[site].id, title: depot[site].name});
      }           
    
      //add listener to circles           
      for (var i = 0; i < rental.data.circles[index].length; i++) {
        attachCircleMessage(map, rental.data.circles[index][i], rental.data.circlesName[index][i], index);
      } 
    }
    
  };
})();


rental.chartOverLay = (function (path, map, type, data) {
  function USGSOverlay(path, map, type, data) {
    // Now initialize all properties.
    this.path_ = path;
    this.map_ = map;
    this.type_ = type;
    this.data_ = data;

    // We define a property to hold the image's
    // div. We'll actually create this div
    // upon receipt of the add() method so we'll
    // leave it null for now.
    this.div_ = null;
    this.chart_ = null;

    // Explicitly call setMap() on this overlay
    this.setMap(map);
  }

  USGSOverlay.prototype = new google.maps.OverlayView();

  USGSOverlay.prototype.onAdd = function() {

    // Note: an overlay's receipt of onAdd() indicates that
    // the map's panes are now available for attaching
    // the overlay to the map via the DOM.

    // Create the DIV and set some basic attributes.
    var div = document.createElement('div');
    div.style.border = "none";
    div.style.borderWidth = "0px";
    div.style.position = "absolute";
    
    //var zoom = this.map_.getZoom();
    zoom = 3;
    div.style.width = '80px';
    div.style.height = '80px';    
    
    var overlayProjection = this.getProjection();
    // Retrieve the southwest and northeast coordinates of this overlay
    // in latlngs and convert them to pixels coordinates.
    // We'll use these coordinates to resize the DIV.
    var position = overlayProjection.fromLatLngToDivPixel(this.path_);
    div.style.left = (position.x - 5) + 'px' ;
    div.style.top = (position.y + 10) + 'px';
    // Set the overlay's div_ property to this DIV
    this.div_ = div;

    // We add an overlay to a map via one of the map's panes.
    // We'll add this overlay to the overlayImage pane.
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
    
    var data = this.data_;
    var dataTable = new google.visualization.DataTable();
    
    dataTable.addColumn('string', 'Topping');
    dataTable.addColumn('number', 'Slices');
    for (var i in data) {
      dataTable.addRows([
        ['demand' + i, parseInt(data[i])]
      ]); 
    }
    var options = {
      backgroundColor: {fill: "none"}, 
      pieSliceText: "percentage", 
      legend: {position: "none"}, 
      chartArea:{left:0,top:0,width:"100%",height:"100%"}, 
      pieSliceTextStyle: {fontSize: zoom + 4}
    }

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(this.div_);

    chart.draw(dataTable, options);    
  }

  USGSOverlay.prototype.draw = function() {
    // Size and position the overlay. We use a southwest and northeast
    // position of the overlay to peg it to the correct position and size.
    // We need to retrieve the projection from this overlay to do this.
    var overlayProjection = this.getProjection();
    // Retrieve the southwest and northeast coordinates of this overlay
    // in latlngs and convert them to pixels coordinates.
    // We'll use these coordinates to resize the DIV.
    var position = overlayProjection.fromLatLngToDivPixel(this.path_);

    // Resize the image's DIV to fit the indicated dimensions.
    var div = this.div_;
  } 
  
  USGSOverlay.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
  
  return {
    chartOverLay: USGSOverlay
  }
})();
