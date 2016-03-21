rental.depot = (function() {

  /** 
   * create sap.ui.table.Table
   * @tbtitle: the table's title
   * @columns: array that fill with column's title
   * @showKey: 
   * @tableData: json
   */
  function createSapUiTable (tbtitle, columns, showKey, tableData) {
    //judge the count of visable row
    var vcount = 0;
    if (tableData.length > 20) {
      vcount = 20;
    }
    else {
      if (tableData.length === 0) {
        vcount = 1;
      }
      else {
        vcount = tableData.length;
      }
    }
    var tb = new sap.ui.table.Table({
      title: tbtitle,
      visibleRowCount: vcount,
      selectionMode: sap.ui.table.SelectionMode.Single
    });
    //define the columns and the control templates to be used
    for (var i = 0; i < columns.length; i++) {
      tb.addColumn(new sap.ui.table.Column({
        label: new sap.ui.commons.Label({text: columns[i]}),
        template: new sap.ui.commons.TextView().bindProperty("text", showKey[i]),
        //sortProperty: columns[i],
        filterProperty: showKey[i]
      }));
    }
    //bind the table rows to the model
    var oModel = new sap.ui.model.json.JSONModel();
    oModel.setData({modelData: tableData});
    tb.setModel(oModel);
    tb.bindRows("/modelData");
    return tb;
  }
  
  function createSapUiDataTable (tbtitle, columns, showKey, tableData) {
    //judge the count of visable row
    var vcount = 0;
    if (tableData.length > 20) {
      vcount = 20;
    }
    else {
      if (tableData.length === 0) {
        vcount = 1;
      }
      else {
        vcount = tableData.length;
      }
    }
    var tbObj = new sap.ui.table.DataTable({
      title: tbtitle,
      visibleRowCount: vcount,
      selectionMode: sap.ui.table.SelectionMode.Single
    });
    for (var i = 0; i < columns.length; i++) {
      tbObj.addColumn(new sap.ui.table.Column({
        label: new sap.ui.commons.Label({text: columns[i]}),
        template: new sap.ui.commons.TextView().bindProperty("text", showKey[i])        
      }));
    }
    var oModel = new sap.ui.model.json.JSONModel();
    oModel.setData({modelData: tableData});
    tbObj.setModel(oModel);
    tbObj.bindRows("/modelData");
    return tbObj;
  }
  
  function updateDetailTab(selectedIndex, index) {
    //send request to depot.json
    $.getJSON(rental.constants.URL_DEPOT_DETAIL, {
        k: Math.random(), 
        depotId: selectedIndex, 
        timeStamp: rental.data.sliderValue[index]
      }, function(jsonobj) {
      //remove all controls in the tab firstly
      rental.ui.tabs[index]["detailTab"].removeAllContent();
      //console.log(rental.util.getResourcesText("tabDetails_TbDepotOrdersTitle"));
      //console.log(rental.util.getResourcesText("tabDetails_TbDepotCartypes"));
      //create 'outgoingorder' and 'incomingorder' table
      var orderNumTab = createSapUiDataTable(
        rental.util.getResourcesText("tabDetails_TbDepotOrdersTitle"),
        [
          rental.util.getResourcesText("tabDetails_TbDepotOrders_Cl1"), 
          rental.util.getResourcesText("tabDetails_TbDepotOrders_Cl2"),
          rental.util.getResourcesText("tabDetails_TbDepotOrders_Cl3"), 
          rental.util.getResourcesText("tabDetails_TbDepotOrders_Cl4"),
          rental.util.getResourcesText("tabDetails_TbDepotOrders_Cl5")
        ],
        ["incoming", "stock", "cartype", "outgoing", "demand"], 
        jsonobj.FlowInformation
      );
      
      //create cartype table
      var cartypeTab = createSapUiDataTable(
        rental.util.getResourcesText("tabDetails_TbDepotCartypes"), 
        [
          rental.util.getResourcesText("tabDetails_TbDepotCartypes_Cl1"), 
          rental.util.getResourcesText("tabDetails_TbDepotCartypes_Cl2"),
          rental.util.getResourcesText("tabDetails_TbDepotCartypes_Cl3")
        ], 
        ["from", "to", "number"], 
        jsonobj.UpgradeDetails
      );
      
      //display the google map's routes 
      //var depotLinksResult = getLinksByName(depotlinksobj, depotobj, dname);
      //console.log(depotLinksResult);
      //rental.map.drawDepotRoute(depotLinksResult, index);
      
      //add the control to the details tab          
      rental.ui.tabs[index]["detailTab"].addContent(orderNumTab);
      rental.ui.tabs[index]["detailTab"].addContent(cartypeTab);
      
      //show the fifth tab
      //rental.ui.tabs[index]["analyticsTabs"].setSelectedIndex(5);
    }); 
  }
  
  /**
   * get depotlinks array by city name
   */
  function getLinksByName (depotlinksObj, depotObj, cityname) {
    var depotLinksResult = [];
    for (var i = 0; i < depotlinksObj.length; i++) {
      if (depotlinksObj[i].toName === cityname || depotlinksObj[i].fromName === cityname) {
        depotLinksResult.push({
            toName: depotlinksObj[i].toName,
            fromName: depotlinksObj[i].fromName,
            cost: depotlinksObj[i].cost,
            toDepot: depotObj[depotlinksObj[i].toName],
            fromDepot: depotObj[depotlinksObj[i].fromName]
        });
      }
    }
    return depotLinksResult;
  }
  
  function combineDepotAndLinks (depotobj, legsobj) {
    //console.log(depotobj);
    //console.log(legsobj);
    var result = [];
    var toname = "", fromname = "";
    for (var i = 0; i < legsobj.length; i++) {
      toname = legsobj[i].to;
      fromname = legsobj[i].from;
      if (depotobj[toname] != null && depotobj[fromname] != null) {
        result.push({
          toname: toname,
          fromname: fromname,
          tolon: depotobj[toname].lon,
          tolat: depotobj[toname].lat,
          fromlon: depotobj[fromname].lon,
          fromlat: depotobj[fromname].lat
        });
      }
    }
    return result;
  }
  
  return {
    combineDepotAndLinks: combineDepotAndLinks,
    
    drawDepotPoints: function (index, depotobj) {
      var result = combineDepotAndLinks(depotobj, rental.data.legs[index]);
      rental.map.drawDepotPoints(depotobj, index, result);
    },
    
    //Load json data 
    loadData: function (index, timeSt, depotobj) {
      var url = rental.constants.URL_DEPOT_OVERVIEW;
      if (rental.offline) {
        url = "json/CROverview++timeStamp=" + timeSt + ".json";
      }
      $.getJSON(url, {timeStamp: timeSt}, function(jsonObj) {        
        if (depotobj === null  || depotobj === undefined) {
          $.getJSON(rental.constants.URL_STATIC, {k: Math.random()}, function(costmodel) {
            depotobj = costmodel.depot;        
            //save depotobj
            if (rental.data.depot === null || rental.data.overview === undefined) {
              rental.data.depot = [];
              rental.data.depot[index] = depotobj;
            }
            else {
              rental.data.depot[index] = depotobj;
            }
            //save overview
            if (rental.data.overview === null || rental.data.overview === undefined) {
              rental.data.overview = [];
              rental.data.overview[index] = jsonObj.statistic;
            }
            else {
              rental.data.overview[index] = jsonObj.statistic;
            }
            //save legs
            if (rental.data.legs === null || rental.data.legs === undefined) {
              rental.data.legs = [];
              rental.data.legs[index] = jsonObj.flow.legs;
            }
            else {
              rental.data.legs[index] = jsonObj.flow.legs;
            }
            //save buyflows
            if (rental.data.buyflows === null || rental.data.buyflows === undefined) {
              rental.data.buyflows = [];
              rental.data.buyflows[index] = jsonObj.buyflows;
            }
            else {
              rental.data.buyflows[index] = jsonObj.buyflows;
            }
            //save car tyes
            if (rental.data.cartypes === null || rental.data.cartypes === undefined) {
              rental.data.cartypes = [];
              rental.data.cartypes[index] = costmodel.cartypes;
            }
            else {
              rental.data.cartypes[index] = costmodel.cartypes;
            }
            var result = combineDepotAndLinks(depotobj, rental.data.legs[index]);
            rental.map.showMapTab(depotobj, index, result);
          });
        }
        else {
          //save depotobj
          if (rental.data.depot === null || rental.data.overview === undefined) {
            rental.data.depot = [];
            rental.data.depot[index] = depotobj;
          }
          else {
            rental.data.depot[index] = depotobj;
          }
          //save overview
          if (rental.data.overview === null || rental.data.overview === undefined) {
            rental.data.overview = [];
            rental.data.overview[index] = jsonObj.statistic;
          }
          else {
            rental.data.overview[index] = jsonObj.statistic;
          }
          //save legs
          if (rental.data.legs === null || rental.data.legs === undefined) {
            rental.data.legs = [];
            rental.data.legs[index] = jsonObj.flow.legs;
          }
          else {
            rental.data.legs[index] = jsonObj.flow.legs;
          }
          //save car tyes
          //console.log(depotobj.cartypes);
          if (rental.data.cartypes === null || rental.data.cartypes === undefined) {
            rental.data.cartypes = [];
            rental.data.cartypes[index] = depotobj.cartypes;
          }
          else {
            rental.data.cartypes[index] = depotobj.cartypes;
          }
          var result = combineDepotAndLinks(depotobj.depot, rental.data.legs[index]);
          rental.map.showMapTab(depotobj.depot, index, result);
        }
      });
    },   
    
    showDepotSection: function (index, depotobj) {
      //console.log(data);
      var dresult = [];
      var keys = [];
      for (var key in depotobj) {
        //push depotobj to the 'dresult'
        dresult.push({
          name: depotobj[key].name,
          lon: depotobj[key].lon,
          lat: depotobj[key].lat
        });
        keys.push(key);
      }

      //create depot table
      var depotTable = createSapUiDataTable(
        rental.util.getResourcesText("accordionDepotTableTitle"),
        [
          rental.util.getResourcesText("accordionDepotTable_Col1"), 
          rental.util.getResourcesText("accordionDepotTable_Col2"), 
          rental.util.getResourcesText("accordionDepotTable_Col3")
        ], 
        ["name", "lon", "lat"], 
        dresult
      );      
      
      //attench selectionchange event
      depotTable.attachRowSelect(function (oControlEvent) {
        //var dataIndex = oControlEvent.getParameter("rowIndex");
        var selectedIndex = oControlEvent.getParameter("rowIndex");
        //var dname = depotTable.getRows()[selectedIndex].getCells()[0].getText();
        if (rental.data.depotSelectedIndex === null || rental.data.depotSelectedIndex === undefined) {
          rental.data.depotSelectedIndex = [];
        }
        else {
          rental.data.depotSelectedIndex[index] = selectedIndex;
        }
        updateDetailTab(selectedIndex, index);               
      });
      
      //add depot to the tab which named 'depotSection' finally
      rental.ui.tabs[index]["depotSection"].addContent(depotTable);      
    }
  };
})();