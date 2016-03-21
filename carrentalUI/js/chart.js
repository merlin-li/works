google.load('visualization', '1.0', {'packages':['corechart']});

rental.chart = (function() { 
  var colors = ['#008fd3', '#99d101', '#f39b02', '#9fcfeb', '#4ba707', '#f6d133', '#cb4d2c', '#cac7ba', '#0d869c', '#cdd72e', '#247230', '#6cdedc', '#eb7300', '#b9bbd1', '#006dd3', '#3db97f', '#a55494', '#01582b', '#4db6ef', '#af2b18', '#d49912', '#bbccd2', '#30920d', '#1da9c1', '#2a47c9', '#d199c2', '#cc5826', '#72bf44', '#0a489d', '#979ca3', '#0e9172', '#61209a'];
  function drawItineraryCharts(result, profitdiv, revenuediv, costdiv, utildiv, index) {
	
    var profit = [];
    var revenue = [];
    var cost = [];
    var util = [];
    var rcp = [];
    var ratio = [];
    
    for (var i in result.circulations) {
      /*var s = "";
      for (var j in result.mainitineraries[i].ports) {
        s += result.mainitineraries[i].ports[j];
        if (j < result.mainitineraries[i].ports.length - 1) {
          s += " -> ";
        }
      }*/
      var num = 0;
      //for (var j in result.circulations[i]) {
        num += result.circulations[i].vesselUsed;
      //}
      //alert(result.mainitineraries[i].pcost + " " + result.mainitineraries[i].opcost);
      profit[i] = [rental.resources.getText("accordionRoute") + " " + ((i - 0) + 1), result.circulations[i].profit > 0 ? result.circulations[i].profit : 0];
      //revenue[i] = ["Route " + ((i - 0) + 1), result.mainitineraries[i].revenue];
      //cost[i] = ["Route " + ((i - 0) + 1), result.mainitineraries[i].pcost, result.mainitineraries[i].opcost];
      //util[i] = ["Route " + ((i - 0) + 1), result.mainitineraries[i].util];
      util[i] = [rental.resources.getText("accordionRoute") + " " + ((i - 0) + 1), num];
      rcp[i] = [rental.resources.getText("accordionRoute") + " " + ((i - 0) + 1), result.circulations[i].revenue, result.circulations[i].cost, result.circulations[i].profit];
      //ratio[i] = ["Route " + ((i - 0) + 1), result.mainitineraries[i].cost / (result.mainitineraries[i].profit > 0 ? result.mainitineraries[i].profit : 0)];
    }
    
    drawRevenueCostProfitRoute(profitdiv, rental.resources.getText("chartRCP_Route"), rcp, index);
    //drawPERatioChart(revenuediv, "P/E Ratio by Route", ratio);
    //drawMoneyChart(profitdiv, "Profit by Route", profit, ["Profit"], "none", 500);
    //drawMoneyChart(revenuediv, "Revenue by Route", revenue, ["Revenue"], "none", 500);
    //drawMoneyChart(costdiv, "Cost by Route", cost, ["Port Cost", "Operation Cost"], "right", 500);
    //drawUtilChart(utildiv, "Capacity Utilization by Itineraries", util);
    //drawNumChart(utildiv, "# of Vessels in Service by Route", util);
    drawPieChartProfit(costdiv, rental.resources.getText("chartProft_Route"), profit, index);
    drawPieChart(utildiv, rental.resources.getText("chartVessel_Route"), util, index);
  }

  function drawVesselTypeCharts(result, profitdiv, revenuediv, costdiv, utildiv) {
    
    var profit = [];
    var revenue = [];
    var cost = [];
    var util = [];
    var rcp = [];
    var ratio = [];
    var costmodel = rental.data.costmodel;
    for (var i in result.vesselTypes) {
      result.vesselTypes[i].desc = costmodel.vesseltypes[result.vesselTypes[i].name].desc;
      profit[i] = [rental.data.costmodel.vesseltypes[result.vesselTypes[i].name].description, result.vesselTypes[i].profit > 0 ? result.vesselTypes[i].profit : 0];
      //revenue[i] = [result.vesselTypes[i].desc, result.vesselTypes[i].revenue];
      //cost[i] = [result.vesselTypes[i].desc, result.vesselTypes[i].pcost, result.vesselTypes[i].opcost];
      //util[i] = [result.vesselTypes[i].name, result.vesselTypes[i].util];
      util[i] = [rental.data.costmodel.vesseltypes[result.vesselTypes[i].name].description, result.vesselTypes[i].used];
      rcp[i] = [rental.data.costmodel.vesseltypes[result.vesselTypes[i].name].description, result.vesselTypes[i].revenue, result.vesselTypes[i].cost, result.vesselTypes[i].profit];
      ratio[i] = [rental.data.costmodel.vesseltypes[result.vesselTypes[i].name].description, result.vesselTypes[i].cost / (result.vesselTypes[i].profit > 0 ? result.vesselTypes[i].profit : 0)];
    }

    drawRevenueCostProfit(profitdiv, rental.resources.getText("chartRCP_Vessel"), rcp);
    drawPERatioChart(revenuediv,rental.resources.getText("chartRatio_Vessel"), ratio);
    //drawMoneyChart(profitdiv, "Profit per Vessel by Type", profit, ["Profit"], "none", 500);
    //drawMoneyChart(revenuediv, "Revenue per Vessel by Type", revenue, ["Revenue"], "none", 500);
    //drawMoneyChart(costdiv, "Cost per Vessel by Type", cost, ["Port Cost", "Operation Cost"], "right", 500);
    //drawUtilChart(utildiv, "Capacity Utilization by Vessel Types", util);
    //drawNumChart(utildiv, "# of Vessels in Service by Vessel Type", util);
    drawPieChartProfit(costdiv, rental.resources.getText("chartProft_Vessel"), profit);
    drawPieChart(utildiv, rental.resources.getText("chartVessel_Vessel"), util);
  }

  function drawPortCharts(result, profitdiv, revenuediv, costdiv, utildiv) {
      var portNum = [];
      var numTemp = 0;
      var routeVesselNum = getVesselNum(result);
      var ports = rental.data.costmodel.ports;
      
      /*for(var i in routeVesselNum) {
          numTemp = 0;
          portNum[i] = [];
          portNum[i].push(routeVesselNum[i][0]);
          for(var j=1; j<routeVesselNum[i].length; j++) {
              numTemp += routeVesselNum[i][j];
          }
          portNum[i].push(numTemp);
      }*/
       for(var i in result.ports) {
         portNum[i] = [rental.ui.getLocaleName(result.ports[i].name, ports), result.ports[i].totalnumberofvessel];
       }
      drawRevenueCostProfitRouteForPort(profitdiv, rental.resources.getText("chartVessel_Port"), routeVesselNum);
      drawPieChartProfitForPort(costdiv, rental.resources.getText("chartTotalVessel_Port"), portNum);

  }

  function getVesselNum(result) {
      var portsVessels = new Array();
      var portNum;
      var vesselTypeNum;
      for(var i in result.ports) {
          portsVessels[i] = [];
          portNum = result.ports[i].name;
          portsVessels[i].push(portNum);
          vesselTypeNum = getVesselTypeNum(result.ports[i], result);
          for(var j in vesselTypeNum) {
              portsVessels[i].push(vesselTypeNum[j]);   
          }

      }
      
      return  portsVessels;
  }

  function getVesselTypeNum(portName, result) {
      var vesselTypeNum = new Array(); 
      var vesselTypes =  new Array("s", "b", "m", "vb", "vvb"); //TODO all vessel type will get from json
      for(var i in vesselTypes) {
          //vesselTypeNum[i] = calulateNum(vesselTypes[i], portName, result);
          vesselTypeNum[i] = portName.numberofvesselpertype[vesselTypes[i]] ? portName.numberofvesselpertype[vesselTypes[i]] : 0;
      }
      return vesselTypeNum;
  }

  function calulateNum(vesselType, portName, result) {
      var vesseslNum = 0;
      var itineraries;
      var i = 0;
      for(var i in result.mainitineraries) {
          for(var j in result.mainitineraries[i].itineraries) {
            itineraries = result.mainitineraries[i].itineraries[j];            
            if (vesselType == itineraries.vessel) {
                for (var k in itineraries.legs) {
                    if (portName == itineraries.legs[k].d) {
                        vesseslNum++;
                        //break;
                    }
                }
            }       
          }
      }
      
      return vesseslNum;
  }

  /*function drawMoneyChart(div, title, content) {

    var data = new google.visualization.DataTable();
    var values = [''];
    data.addColumn('string', '');
    for (var i in content) {
      data.addColumn('number', content[i][0]);
      values.push(content[i][1]);
    }
    data.addRows([
      values
    ]);
    
    var formatter = new google.visualization.NumberFormat({
      prefix: '$'
    });
    for (var i in content) {
      formatter.format(data, 1 + (i - 0));
    }

    var options = {
      title: title,
      width: 450,
      height: 270,
      chartArea: {left: "20%", width: "60%", height: "80%"},
      hAxis: {textStyle: {color: 'black'}},
      vAxis: {format: '$#,###', textStyle: {color: 'black'}, baselineColor: 'black'},
      backgroundColor: 'black',
      titleTextStyle: {color: 'black'},
      legend: {textStyle: {color: 'black'}}
    };

    var chart = new google.visualization.ColumnChart(document.getElementById(div));
    chart.draw(data, options);
  }*/

  var chartHeight = 275;

  function drawMoneyChartPort(div, title, content, legend, legendPos, width) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', '');
    for (var i in legend) {
      data.addColumn('number', legend[i]);
    }
    data.addRows(content);
    
    var formatter = new google.visualization.NumberFormat({
      prefix: '$'
    });
    
    for (var i in legend) {
      formatter.format(data, 1 + (i - 0));
    }

    var options = {
      title: title,
      width: width,
      height: chartHeight,
      chartArea: {left: "10%", width: "70%", height: "80%"},
      hAxis: {textStyle: {color: 'black'}},
      vAxis: {format: '$#,###', textStyle: {color: 'black'}, baselineColor: 'black'},
      backgroundColor: 'white',
      titleTextStyle: {color: 'black', fontSize: '15'},
      legend: {textStyle: {color: 'black'}, position: legendPos},
      isStacked: true
    };

    var chart = new google.visualization.ColumnChart(document.getElementById(div));
    chart.draw(data, options);
  }

  function drawMoneyChart(div, title, content, legend, legendPos, width) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', '');
    for (var i in legend) {
      data.addColumn('number', legend[i]);
    }
    data.addRows(content);
    
    var formatter = new google.visualization.NumberFormat({
      prefix: '$'
    });
    
    for (var i in legend) {
      formatter.format(data, 1 + (i - 0));
    }

    var options = {
      title: title,
      width: width,
      height: chartHeight,
      chartArea: {left: "20%", width: "60%", height: "80%"},
      hAxis: {textStyle: {color: 'black'}},
      vAxis: {format: '$#,###', textStyle: {color: 'black'}, baselineColor: 'black'},
      backgroundColor: 'white',
      titleTextStyle: {color: 'black', fontSize: '15'},
      legend: {textStyle: {color: 'black'}, position: legendPos},
      isStacked: true
    };

    var chart = new google.visualization.ColumnChart(document.getElementById(div));
    chart.draw(data, options);
  }

  function drawRevenueCostProfit(div, title, content) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', '');
    data.addColumn('number', rental.resources.getText("fieldChartRevenue"));
    data.addColumn('number', rental.resources.getText("fieldChartCost"));
    data.addColumn('number', rental.resources.getText("fieldChartProfit"));
    data.addRows(content);
    
    var formatter = new google.visualization.NumberFormat({
      prefix: '$'
    });
    
    formatter.format(data, 1);
    formatter.format(data, 2);
    formatter.format(data, 3);

    var options = {
      title: title,
      width: 500,
      height: chartHeight,
      chartArea: {left: "20%", width: "60%", height: "80%"},
      hAxis: {textStyle: {color: 'black'}},
      vAxis: {format: '$#,###', textStyle: {color: 'black'}, baselineColor: 'black'},
      backgroundColor: 'white',
      titleTextStyle: {color: 'black', fontSize: '15'},
      legend: {textStyle: {color: 'black'}},
      colors:colors
    };

    var chart = new google.visualization.ColumnChart(document.getElementById(div));
    chart.draw(data, options);
  }

  function drawRevenueCostProfitRoute(div, title, content, index) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', '');
    data.addColumn('number', rental.resources.getText("fieldChartRevenue"));
    data.addColumn('number', rental.resources.getText("fieldChartCost"));
    data.addColumn('number', rental.resources.getText("fieldChartProfit"));
    data.addRows(content);
    
    var formatter = new google.visualization.NumberFormat({
      prefix: '$'
    });
    
    formatter.format(data, 1);
    formatter.format(data, 2);
    formatter.format(data, 3);

    var options = {
      title: title,
      width: 1000,
      height: chartHeight,
      chartArea: {left: "10%", width: "70%", height: "80%"},
      hAxis: {textStyle: {color: 'black'}},
      vAxis: {format: '$#,###', textStyle: {color: 'black'}, baselineColor: 'black'},
      backgroundColor: 'white',
      titleTextStyle: {color: 'black', fontSize: '15'},
      legend: {textStyle: {color: 'black'}},
      colors: colors
    };

    var chart = new google.visualization.ColumnChart(document.getElementById(div));
    chart.draw(data, options);
    google.visualization.events.addListener(chart, 'click', routeClick);
    function routeClick(e) {
      var selectID = getSelectID(e.targetID);
      console.log(selectID);
      showRouteDetails(index, selectID);
    }
  }
  
  function getSelectID(targetID) {
    if(targetID) {
      selectID = targetID.split("#");
      return selectID.pop() ;
    } else {
       return -1;
    }
  }
  
  function showRouteDetails(index, selectID) {
    rental.ui.tabs[index]["routeSection"].setCollapsed(false);
    rental.ui.tabs[index]["analyticsTabs"].setSelectedIndex(5);
    var routeTable = rental.ui.tabs[index]["routeSection"].getContent();
    routeTable[0].setSelectedIndex(parseInt(selectID));
    routeTable[0].fireRowSelect({rowContext: "/modelData/" + selectID});
  }

  function drawPieChartProfit(div, title, content, index) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', '');
    data.addColumn('number', rental.resources.getText("fieldChartProfit"));
    data.addRows(content);
    
    var formatter = new google.visualization.NumberFormat({
      prefix: '$'
    });
    
    formatter.format(data, 1);

    var options = 
    {
      title: title,
      width: 500,
      height: chartHeight,
      chartArea: {width: "95%", height: "80%"},
      backgroundColor: 'white',
      titleTextStyle: {color: 'black', fontSize: '15'},
      legend: {textStyle: {color: 'black'}},
      is3D: false
    };

    var chart = new google.visualization.PieChart(document.getElementById(div));
    chart.draw(data, options);
    if (index > -1) {
      google.visualization.events.addListener(chart, 'click', routeClick);
      function routeClick(e) {
        var selectID = getSelectID(e.targetID);
        console.log(selectID);
        showRouteDetails(index, selectID);
      }
    }
  }

  function drawRevenueCostProfitRouteForPort(div, title, content) {
    var data = new google.visualization.DataTable();
    var vesselType = rental.data.costmodel.vesseltypes;
    data.addColumn('string', '');
    for (var i in vesselType) {
      data.addColumn('number', vesselType[i].description);
    }
    data.addRows(content);
      
    var options = {
      title: title,
      width: 1000,
      height: chartHeight,
      chartArea: {left: "10%", width: "70%", height: "80%"},
      hAxis: {textStyle: {color: 'black'}},
      vAxis: {textStyle: {color: 'black'}, baselineColor: 'black'},
      backgroundColor: 'white',
      titleTextStyle: {color: 'black', fontSize: '15'},
      legend: {textStyle: {color: 'black'}},
      //colors:['#FF9900','#FF3300', '#3366FF', '#11FF66', '#0000FF']
    };

    var chart = new google.visualization.ColumnChart(document.getElementById(div));
    chart.draw(data, options);
  }


  function drawPieChartProfitForPort(div, title, content) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', '');
    data.addColumn('number', 'PortUsedNums');
    data.addRows(content);

    var options = 
    {
      title: title,
      width: 500,
      height: chartHeight,
      chartArea: {width: "95%", height: "80%"},
      backgroundColor: 'white',
      titleTextStyle: {color: 'black', fontSize: '15'},
      legend: {textStyle: {color: 'black'}},
      is3D: false
    };

    var chart = new google.visualization.PieChart(document.getElementById(div));
    chart.draw(data, options);
  }
  
  
  function drawNumChart(div, title, content) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', '');
    data.addColumn('number', rental.resources.getText("fieldChartVessel"));
    data.addRows(content);

    var options = {
      title: title,
      width: 500,
      height: chartHeight,
      chartArea: {left: "20%", width: "60%", height: "80%"},
      hAxis: {textStyle: {color: 'black'}},
      vAxis: {textStyle: {color: 'black'}, baselineColor: 'black'},
      backgroundColor: 'white',
      titleTextStyle: {color: 'black', fontSize: '15'},
      legend: {textStyle: {color: 'black'}, position: 'none'}
    };

    var chart = new google.visualization.ColumnChart(document.Id(div));
    chart.draw(data, options);
  }

  function drawPieChart(div, title, content, index) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', '');
    data.addColumn('number', rental.resources.getText("fieldChartVessel"));
    data.addRows(content);

    var options = 
    {
      title: title,
      width: 500,
      height: chartHeight,
      chartArea: {width: "95%", height: "80%"},
      backgroundColor: 'white',
      titleTextStyle: {color: 'black', fontSize: '15'},
      legend: {textStyle: {color: 'black'}},
      is3D: false
    };

    var chart = new google.visualization.PieChart(document.getElementById(div));
    chart.draw(data, options);
    if (index > -1) {
      google.visualization.events.addListener(chart, 'click', routeClick);
      function routeClick(e) {
        var selectID = getSelectID(e.targetID);
        console.log(selectID);
        showRouteDetails(index, selectID);
      }
    }
  }

  function drawPERatioChart(div, title, content) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', '');
    data.addColumn('number', 'P/E Ratio');
    data.addRows(content);
    
    var formatter = new google.visualization.NumberFormat({
      pattern: '#%',
      fractionDigits: 2 
    });
    formatter.format(data, 1);

    var options = {
      title: title,
      width: 500,
      height: chartHeight,
      chartArea: {left: "20%", width: "60%", height: "80%"},
      hAxis: {textStyle: {color: 'black'}},
      vAxis: {format: '#%', textStyle: {color: 'black'}, baselineColor: 'black'},
      backgroundColor: 'white',
      titleTextStyle: {color: 'black', fontSize: '15'},
      legend: {textStyle: {color: 'black'}, position: 'none'}
    };

    var chart = new google.visualization.ColumnChart(document.getElementById(div));
    chart.draw(data, options);
  }
  
  function getNumOfVessels(result) {
    var usedVessels = 0;
    for (var i in result.vesselTypes) {
      usedVessels += result.vesselTypes[i].used;
    }
    
    return usedVessels;
  }
  
  function createChartTable(result) {
    var chatData = [{
      profit: rental.util.formatCurrency(result.profit.toString()),
      revenue: rental.util.formatCurrency(result.revenue.toString()),
      cost: rental.util.formatCurrency(result.cost.toString()),
      number: getNumOfVessels(result)
    }];
    
    var table_chart = new sap.ui.table.DataTable();
    table_chart.setSelectionMode("None");
    table_chart.setVisibleRowCount(chatData.length);

    var textview_chart = new sap.ui.commons.TextView().bindProperty("text", "profit");
    table_chart.addColumn(new sap.ui.table.Column({label: rental.resources.getText("fieldChartProfit"), template: textview_chart}));
    textview_chart = new sap.ui.commons.TextView().bindProperty("text", "revenue").setTextAlign(sap.ui.core.TextAlign.Right);
    table_chart.addColumn(new sap.ui.table.Column({label: rental.resources.getText("fieldChartRevenue"), template: textview_chart}));
    textview_chart = new sap.ui.commons.TextView().bindProperty("text", "cost").setTextAlign(sap.ui.core.TextAlign.Right);
    table_chart.addColumn(new sap.ui.table.Column({label: rental.resources.getText("fieldChartCost"), template: textview_chart}));
    textview_chart = new sap.ui.commons.TextView().bindProperty("text", "number").setTextAlign(sap.ui.core.TextAlign.Right);
    table_chart.addColumn(new sap.ui.table.Column({label: rental.resources.getText("fieldChartVessel"), template: textview_chart}));

    var json_chart = new sap.ui.model.json.JSONModel();
    json_chart.setData({modelData: chatData});
    table_chart.setModel(json_chart);
    table_chart.bindRows("/modelData");
    table_chart.addStyleClass("chart-table");
    
    return table_chart;
  }
  
  function showChartTab(result, tabControl, tabName, index, drawChartFunction) {
    
    var chartTable = createChartTable(result);
    //each map has an unique id
    var tabID = tabName + "_chart_" + index;
    var tabClass = tabName + "-tab chartTab";
    var profitID = tabName + "_profit_" + index;
    var revenueID = tabName + "_revenue_" + index;
    var costID = tabName + "_cost_" + index;
    var vesselID = tabName + "_vessel_" + index;
    var profitHTML = '<div id="' + profitID + '"></div>';
    var revenueHTML = '<div id="' + revenueID + '"></div>';
    var costHTML = '<div id="' + costID + '"></div>';
    var vesselHTML = '<div id="' + vesselID + '"></div>';
    var tabContent='<div id="' + tabID + '" class="' + tabClass + '">' + '</div>';
  
    tabContent = '<div id="' + tabID + '" class="' + tabClass + '">' + profitHTML + revenueHTML + costHTML + vesselHTML + '</div>';

    
    var tab_html = new sap.ui.core.HTML({
      content: tabContent,
      afterRendering: function(e) {
        drawChartFunction(result, profitID, revenueID, costID, vesselID, index);
      }
    });
 
    tabControl.removeAllContent();
    if (drawPortCharts != drawChartFunction) {
      tabControl.addContent(chartTable);  
    }
    
    tabControl.addContent(tab_html);
  }
  
  return {
    //show route analysis content in the tab
    //show map content in the tab
    showRouteTab: function(index) {
      showChartTab(rental.data.solutions[index]['solution'], rental.ui.tabs[index]["routeTab"], "route", index, drawItineraryCharts, index);
    },

    //show vessel type analysis content in the tab
    showVesselTab: function(index) {
      showChartTab(rental.data.solutions[index]['solution'], rental.ui.tabs[index]["vesselTab"], "vessel", index, drawVesselTypeCharts, index);
    },

    //show port analysis content in the tab
    showPortTab: function(index) {
      showChartTab(rental.data.solutions[index]['solution'], rental.ui.tabs[index]["portTab"], "port", index, drawPortCharts, index);
    }
  };
})();
